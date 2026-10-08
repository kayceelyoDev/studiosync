<?php

namespace App\Http\Controllers\Admin;

use App\Enums\DeploymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreContactEmailerRequest;
use App\Http\Requests\Admin\UpdateContactEmailerRequest;
use App\Jobs\DeployToVercelJob;
use App\Models\ClientRequest;
use App\Models\Project;
use App\Services\ContactEmailerService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ContactEmailerController extends Controller
{
    public function __construct(private readonly ContactEmailerService $service) {}

    /**
     * Display the emailer configuration page for a project.
     */
    public function show(Project $project): Response
    {
        $project->load(['contactEmailer', 'user:id,name,email', 'workspace:id,name']);

        $emailer = $project->contactEmailer;

        return Inertia::render('Admin/Emailer/Show', [
            'project' => [
                'id' => $project->id,
                'project_name' => $project->project_name,
                'html_content' => $project->html_content,
                'status' => $project->status?->value,
                'deployment_status' => $project->deployment_status?->value,
                'project_url' => $project->project_url,
                'vercel_project_name' => $project->vercel_project_name,
                'is_deployed' => $project->isDeployed(),
                'user' => $project->user ? [
                    'id' => $project->user->id,
                    'name' => $project->user->name,
                    'email' => $project->user->email,
                ] : null,
                'workspace' => $project->workspace ? [
                    'id' => $project->workspace->id,
                    'name' => $project->workspace->name,
                ] : null,
            ],
            'emailer' => $emailer ? [
                'id' => $emailer->id,
                'recipient_email' => $emailer->recipient_email,
                'reply_name' => $emailer->reply_name,
                'public_token' => $emailer->public_token,
                'is_active' => $emailer->is_active,
                'messages_count' => $emailer->messages()->count(),
                'created_at' => $emailer->created_at?->toIso8601String(),
            ] : null,
        ]);
    }

    /**
     * Create a new contact emailer for the project.
     */
    public function store(StoreContactEmailerRequest $request, Project $project): RedirectResponse
    {
        if ($project->contactEmailer()->exists()) {
            return back()->withErrors(['emailer' => 'This project already has a contact emailer configured.']);
        }

        $clientRequest = $request->integer('client_request_id')
            ? ClientRequest::find($request->integer('client_request_id'))
            : null;

        $this->service->create($project, $clientRequest, $request->validated());

        return redirect()
            ->route('admin.projects.emailer.show', $project)
            ->with('success', 'Emailer configured successfully. Deploy the project to make the contact form live.');
    }

    /**
     * Update the emailer's recipient email and/or reply name.
     */
    public function update(UpdateContactEmailerRequest $request, Project $project): RedirectResponse
    {
        $emailer = $project->contactEmailer;

        if (! $emailer) {
            return back()->withErrors(['emailer' => 'No emailer found for this project.']);
        }

        $this->service->update($emailer, $request->validated());

        return redirect()
            ->route('admin.projects.emailer.show', $project)
            ->with('success', 'Emailer updated. Redeploy the project to apply changes.');
    }

    /**
     * Toggle the emailer's active state on or off.
     */
    public function toggle(Project $project): RedirectResponse
    {
        $emailer = $project->contactEmailer;

        if (! $emailer) {
            return back()->withErrors(['emailer' => 'No emailer found for this project.']);
        }

        $this->service->toggle($emailer);

        $status = $emailer->fresh()?->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "Emailer {$status}. Redeploy to apply the change.");
    }

    /**
     * Trigger a redeploy of the project with the current html_content
     * (which includes the injected contact form script).
     * Admin can redeploy even if the project is already deployed.
     */
    public function deploy(Project $project): RedirectResponse
    {
        $project->update([
            'deployment_status' => DeploymentStatus::Deploying->value,
        ]);

        DeployToVercelJob::dispatch($project->id);

        return back()->with('success', 'Redeploy triggered. The site will update in about 30 seconds.');
    }
}
