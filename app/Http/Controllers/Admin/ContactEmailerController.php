<?php

namespace App\Http\Controllers\Admin;

use App\Enums\DeploymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreContactEmailerRequest;
use App\Http\Requests\Admin\UpdateContactEmailerRequest;
use App\Jobs\DeployToVercelJob;
use App\Mail\GuestContactedClient;
use App\Models\ClientRequest;
use App\Models\ContactMessage;
use App\Models\Project;
use App\Services\ContactEmailerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Mail;
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

        // Ensure script is up-to-date if emailer exists and is active
        if ($emailer && $emailer->is_active) {
            $this->service->injectContactScript($project, $emailer->public_token);
            $project->refresh();
        }

        $requestId = request()->integer('request_id');
        $clientRequest = $requestId ? ClientRequest::find($requestId) : null;

        $recentMessages = $emailer ? $emailer->messages()
            ->latest('id')
            ->take(10)
            ->get(['id', 'guest_name', 'guest_email', 'subject', 'message', 'created_at'])
            ->map(fn ($msg) => [
                'id' => $msg->id,
                'guest_name' => $msg->guest_name,
                'guest_email' => $msg->guest_email,
                'subject' => $msg->subject,
                'message' => $msg->message,
                'created_at' => $msg->created_at?->toIso8601String(),
            ]) : [];

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
            'client_request' => $clientRequest ? [
                'id' => $clientRequest->id,
                'title' => $clientRequest->title,
                'category' => $clientRequest->category->value,
                'category_label' => $clientRequest->category->label(),
                'status' => $clientRequest->status->value,
            ] : null,
            'has_contact_form' => $this->service->hasContactForm($project),
            'mail_driver' => config('mail.default'),
            'recent_messages' => $recentMessages,
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

        $this->service->create($project, $clientRequest, $request->only(['recipient_email', 'reply_name']));

        if ($request->boolean('auto_inject_section') && ! $this->service->hasContactForm($project)) {
            $this->service->injectContactSection($project);
        }

        if ($request->input('redirect_to') === 'request' && $clientRequest) {
            return redirect()
                ->route('admin.requests.show', $clientRequest->id)
                ->with('success', 'Emailer configured and Contact Us form connected! Deploy the project to make it live.');
        }

        return redirect()
            ->route('admin.projects.emailer.show', ['project' => $project, 'request_id' => $clientRequest?->id])
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

    /**
     * Send a test contact inquiry to verify configuration and mail delivery.
     */
    public function testMessage(Project $project): JsonResponse
    {
        $emailer = $project->contactEmailer;

        if (! $emailer) {
            return response()->json(['success' => false, 'message' => 'No emailer configured for this project.'], 404);
        }

        $contactMessage = ContactMessage::create([
            'contact_emailer_id' => $emailer->id,
            'guest_name' => 'Test Guest (Admin Verification)',
            'guest_email' => 'guest.tester@example.com',
            'subject' => 'Test Inquiry: Emailer Verification',
            'message' => "This is an automated test message sent by an administrator to verify the contact emailer flow.\n\nRecipient: {$emailer->recipient_email}\nReply Name: {$emailer->reply_name}",
            'ip_address' => request()->ip(),
        ]);

        $mailDriver = config('mail.default');

        try {
            Mail::sendNow(new GuestContactedClient($contactMessage, $emailer));
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'success' => false,
                'message' => "Mail dispatch failed ({$mailDriver}): {$e->getMessage()}",
                'contact_message' => [
                    'id' => $contactMessage->id,
                    'guest_name' => $contactMessage->guest_name,
                    'guest_email' => $contactMessage->guest_email,
                    'subject' => $contactMessage->subject,
                    'created_at' => $contactMessage->created_at?->toIso8601String(),
                ],
                'messages_count' => $emailer->messages()->count(),
                'mail_driver' => $mailDriver,
            ], 422);
        }

        $note = $mailDriver === 'log'
            ? "Mail driver is set to 'log' in .env — email logged to storage/logs/laravel.log. To send real emails to {$emailer->recipient_email}, set MAIL_MAILER=smtp."
            : "Email dispatched to {$emailer->recipient_email} via {$mailDriver}.";

        return response()->json([
            'success' => true,
            'message' => "Test message #{$contactMessage->id} processed! {$note}",
            'contact_message' => [
                'id' => $contactMessage->id,
                'guest_name' => $contactMessage->guest_name,
                'guest_email' => $contactMessage->guest_email,
                'subject' => $contactMessage->subject,
                'created_at' => $contactMessage->created_at?->toIso8601String(),
            ],
            'messages_count' => $emailer->messages()->count(),
            'mail_driver' => $mailDriver,
        ]);
    }

    /**
     * Inject Contact Us section markup into the project's html_content.
     */
    public function injectContactSection(Project $project): RedirectResponse
    {
        $this->service->injectContactSection($project);

        return back()->with('success', 'Contact Us section markup successfully injected into project HTML.');
    }

    /**
     * Remove the injected Contact Us section markup from the project's html_content.
     */
    public function removeContactSection(Project $project): RedirectResponse
    {
        $this->service->removeContactSection($project);

        return back()->with('success', 'Contact Us section markup removed from project HTML.');
    }
}
