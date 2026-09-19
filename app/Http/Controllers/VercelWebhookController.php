<?php

namespace App\Http\Controllers;

use App\Models\Deployment;
use App\Models\Project;
use App\Services\Vercel\VercelClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class VercelWebhookController extends Controller
{
    /**
     * Handle incoming webhook requests from Vercel.
     */
    public function handle(Request $request, VercelClient $vercelClient): JsonResponse
    {
        $rawBody = $request->getContent();
        $signature = $request->header('x-vercel-signature');

        // Verify webhook signature
        if (! $vercelClient->verifyWebhookSignature($rawBody, $signature)) {
            Log::warning('Vercel webhook rejected: invalid or missing signature.');

            return response()->json(['error' => 'Invalid signature'], 401);
        }

        $payload = json_decode($rawBody, true);
        if (! is_array($payload)) {
            return response()->json(['error' => 'Invalid JSON payload'], 400);
        }

        $type = $payload['type'] ?? '';
        $deploymentData = $payload['payload']['deployment'] ?? $payload['deployment'] ?? [];
        $dplId = $deploymentData['id'] ?? null;

        Log::info("Received Vercel webhook event: {$type}", [
            'deployment_id' => $dplId,
        ]);

        if (empty($dplId)) {
            return response()->json(['received' => true, 'action' => 'ignored_missing_id']);
        }

        $deployment = Deployment::where('vercel_deployment_id', $dplId)->first();

        if ($type === 'deployment.succeeded') {
            $url = 'https://'.ltrim((string) ($deploymentData['url'] ?? ''), '/');

            if ($deployment) {
                $deployment->update([
                    'status' => 'ready',
                    'url' => $url,
                ]);

                $project = Project::find($deployment->project_id);
                if ($project) {
                    $project->update([
                        'deployment_status' => 'deployed',
                        'status' => 'deployed',
                        'project_url' => $url,
                        'deployed_at' => now(),
                    ]);
                }
            } else {
                $projectId = $deploymentData['projectId'] ?? null;
                if ($projectId) {
                    $project = Project::where('vercel_project_id', $projectId)->first();
                    if ($project) {
                        $project->update([
                            'deployment_status' => 'deployed',
                            'status' => 'deployed',
                            'project_url' => $url,
                            'deployed_at' => now(),
                        ]);
                    }
                }
            }

            return response()->json(['received' => true, 'action' => 'marked_ready']);
        }

        if ($type === 'deployment.error' || $type === 'deployment.canceled') {
            $errorMessage = $deploymentData['errorMessage'] ?? 'Deployment failed on Vercel';

            if ($deployment) {
                $deployment->update([
                    'status' => 'error',
                    'error_message' => $errorMessage,
                ]);

                $project = Project::find($deployment->project_id);
                if ($project) {
                    $project->update([
                        'deployment_status' => 'failed',
                    ]);
                }
            }

            return response()->json(['received' => true, 'action' => 'marked_failed']);
        }

        return response()->json(['received' => true, 'action' => 'unhandled_event']);
    }
}
