<?php

namespace App\Http\Controllers;

use App\Enums\DeploymentStatus;
use App\Jobs\DeployToVercelJob;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeploymentController extends Controller
{
    /**
     * Trigger a new manual deployment to Vercel.
     */
    public function deploy(Request $request, Project $project): JsonResponse
    {
        if ($project->user_id !== auth()->id() && ! auth()->user()->hasRole('admin') && ! auth()->user()->hasRole('super_admin')) {
            abort(403);
        }

        if ($project->isDeployed()) {
            return response()->json([
                'success' => false,
                'message' => 'This project has already been deployed to Vercel and is permanently locked from further editing.',
                'project_url' => $project->project_url,
                'deployment_status' => DeploymentStatus::Deployed->value,
            ], 423);
        }

        $validated = $request->validate([
            'subdomain' => ['nullable', 'string', 'min:3', 'max:50', 'regex:/^[a-z0-9]+(-[a-z0-9]+)*$/'],
        ], [
            'subdomain.regex' => 'The subdomain must consist only of lowercase letters, numbers, and hyphens (no leading, trailing, or double hyphens).',
        ]);

        $project->update([
            'deployment_status' => DeploymentStatus::Deploying->value,
        ]);

        DeployToVercelJob::dispatch(
            projectId: $project->id,
            chosenSubdomain: $validated['subdomain'] ?? null,
        );

        return response()->json([
            'success' => true,
            'message' => 'Deployment initiated. Your website is being published to Vercel.',
            'deployment_status' => DeploymentStatus::Deploying->value,
        ]);
    }

    /**
     * Check deployment status and details for a project.
     */
    public function status(Project $project): JsonResponse
    {
        if ($project->user_id !== auth()->id() && ! auth()->user()->hasRole('admin') && ! auth()->user()->hasRole('super_admin')) {
            abort(403);
        }

        $latestDeployment = $project->deployments()->latest()->first();

        return response()->json([
            'deployment_status' => $project->deployment_status,
            'status' => $project->status,
            'project_url' => $project->project_url,
            'vercel_project_name' => $project->vercel_project_name,
            'deployed_at' => $project->deployed_at?->toIso8601String(),
            'is_editable' => $project->isEditable(),
            'latest_deployment' => $latestDeployment ? [
                'id' => $latestDeployment->id,
                'status' => $latestDeployment->status,
                'url' => $latestDeployment->url,
                'error_message' => $latestDeployment->error_message,
                'created_at' => $latestDeployment->created_at?->toIso8601String(),
            ] : null,
        ]);
    }

    /**
     * Get deployment history for a project.
     */
    public function index(Project $project): JsonResponse
    {
        if ($project->user_id !== auth()->id() && ! auth()->user()->hasRole('admin') && ! auth()->user()->hasRole('super_admin')) {
            abort(403);
        }

        $deployments = $project->deployments()
            ->latest()
            ->take(10)
            ->get();

        return response()->json([
            'deployments' => $deployments,
        ]);
    }
}
