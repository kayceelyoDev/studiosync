<?php

namespace App\Jobs;

use App\Exceptions\VercelProjectNameTakenException;
use App\Models\Deployment;
use App\Models\Project;
use App\Services\Vercel\VercelClient;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class DeployToVercelJob implements ShouldQueue
{
    use Queueable;

    public int $timeout = 60;

    public int $tries = 2;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public int $projectId,
        public ?string $chosenSubdomain = null,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(VercelClient $vercelClient): void
    {
        $project = Project::find($this->projectId);
        if (! $project) {
            Log::warning("DeployToVercelJob aborted: Project ID {$this->projectId} not found.");

            return;
        }

        if (empty($project->html_content)) {
            Log::warning("DeployToVercelJob aborted: Project ID {$this->projectId} has no html_content.");
            $project->update(['deployment_status' => 'failed']);

            return;
        }

        $lock = Cache::lock("deploy_project_{$project->id}", 60);
        if (! $lock->get()) {
            Log::warning("DeployToVercelJob: Deployment already in progress for project {$project->id}.");

            return;
        }

        try {
            $contentHash = hash('sha256', $project->html_content);

            // Determine Vercel project name / subdomain
            $vercelProjectName = $project->vercel_project_name;

            if (empty($vercelProjectName)) {
                if (! empty($this->chosenSubdomain)) {
                    $slug = Str::slug($this->chosenSubdomain);
                } else {
                    $cleanTitle = Str::slug(substr($project->project_name, 0, 30)) ?: 'site';
                    $slug = "ss-w{$project->workspace_id}-p{$project->id}-{$cleanTitle}";
                }
                $vercelProjectName = substr($slug, 0, 95);
            }

            // Step 1: Ensure Vercel Project exists
            $vercelProject = $vercelClient->createOrGetProject($vercelProjectName);
            $vercelProjectId = $vercelProject['id'] ?? $vercelProjectName;

            $project->update([
                'vercel_project_id' => $vercelProjectId,
                'vercel_project_name' => $vercelProjectName,
                'content_hash' => $contentHash,
            ]);

            // Step 2: Create Deployment
            $deploymentResponse = $vercelClient->createDeployment(
                projectName: $vercelProjectName,
                projectId: $vercelProjectId,
                htmlContent: $project->html_content,
            );

            $dplId = $deploymentResponse['id'] ?? null;
            $dplUrl = ! empty($deploymentResponse['url']) ? 'https://'.ltrim($deploymentResponse['url'], '/') : null;
            $readyState = strtoupper((string) ($deploymentResponse['readyState'] ?? 'INITIALIZING'));

            $deployment = Deployment::create([
                'project_id' => $project->id,
                'user_id' => $project->user_id,
                'vercel_deployment_id' => $dplId,
                'vercel_project_id' => $vercelProjectId,
                'url' => $dplUrl,
                'status' => $readyState === 'READY' ? 'ready' : 'building',
                'content_hash' => $contentHash,
            ]);

            if ($readyState === 'READY' && $dplUrl) {
                $project->update([
                    'deployment_status' => 'deployed',
                    'status' => 'deployed',
                    'project_url' => $dplUrl,
                    'deployed_at' => now(),
                ]);
                Log::info("Deployment for project {$project->id} finished immediately on Vercel: {$dplUrl}");
            } else {
                // Dispatch background status checker job after 5 seconds
                CheckVercelDeploymentStatusJob::dispatch($deployment->id)->delay(now()->addSeconds(5));
            }
        } catch (VercelProjectNameTakenException $e) {
            Log::warning("Vercel project name conflict for project {$project->id}: ".$e->getMessage());
            $project->update([
                'deployment_status' => 'failed',
            ]);

            Deployment::create([
                'project_id' => $project->id,
                'user_id' => $project->user_id,
                'status' => 'error',
                'error_message' => "The subdomain '{$e->projectName}.vercel.app' is already claimed on Vercel. Please choose a different subdomain.",
            ]);
        } catch (\Throwable $e) {
            Log::error("Vercel deployment failed for project {$project->id}: ".$e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            $project->update([
                'deployment_status' => 'failed',
            ]);

            Deployment::create([
                'project_id' => $project->id,
                'user_id' => $project->user_id,
                'status' => 'error',
                'error_message' => $e->getMessage(),
            ]);
        } finally {
            $lock->release();
        }
    }
}
