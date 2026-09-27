<?php

namespace App\Jobs;

use App\Enums\DeploymentStatus;
use App\Enums\ProjectStatus;
use App\Models\Deployment;
use App\Models\Project;
use App\Services\Vercel\VercelClient;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class CheckVercelDeploymentStatusJob implements ShouldQueue
{
    use Queueable;

    public int $timeout = 30;

    public int $tries = 4;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public int $deploymentId,
        public int $attempt = 1,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(VercelClient $vercelClient): void
    {
        $deployment = Deployment::find($this->deploymentId);
        if (! $deployment) {
            return;
        }

        // If webhook or previous run already finished it, skip!
        if (in_array($deployment->status, [DeploymentStatus::Ready, DeploymentStatus::Error, DeploymentStatus::Canceled], true)) {
            return;
        }

        if (empty($deployment->vercel_deployment_id)) {
            return;
        }

        try {
            $data = $vercelClient->getDeployment($deployment->vercel_deployment_id);
            $readyState = strtoupper((string) ($data['readyState'] ?? ''));

            if ($readyState === 'READY') {
                $deploymentUrl = 'https://'.ltrim((string) ($data['url'] ?? ''), '/');
                $deployment->update([
                    'status' => DeploymentStatus::Ready->value,
                    'url' => $deploymentUrl,
                ]);

                $project = Project::find($deployment->project_id);
                if ($project) {
                    $project->update([
                        'deployment_status' => DeploymentStatus::Deployed->value,
                        'status' => ProjectStatus::Deployed->value,
                        'project_url' => $deploymentUrl,
                        'deployed_at' => now(),
                    ]);
                }

                Log::info("Vercel deployment {$deployment->vercel_deployment_id} verified READY via status job.");

                return;
            }

            if (in_array($readyState, ['ERROR', 'CANCELED'], true)) {
                $errorMessage = $data['error']['message'] ?? 'Deployment failed on Vercel';
                $deployment->update([
                    'status' => DeploymentStatus::Error->value,
                    'error_message' => $errorMessage,
                ]);

                $project = Project::find($deployment->project_id);
                if ($project) {
                    $project->update([
                        'deployment_status' => DeploymentStatus::Failed->value,
                    ]);
                }

                Log::warning("Vercel deployment {$deployment->vercel_deployment_id} failed: {$errorMessage}");

                return;
            }

            // Still BUILDING / INITIALIZING / QUEUED - check again if under max attempts
            if ($this->attempt < 4) {
                CheckVercelDeploymentStatusJob::dispatch($this->deploymentId, $this->attempt + 1)
                    ->delay(now()->addSeconds(6));
            }
        } catch (\Throwable $e) {
            Log::error("Error checking Vercel deployment status for deployment {$this->deploymentId}: ".$e->getMessage());
        }
    }
}
