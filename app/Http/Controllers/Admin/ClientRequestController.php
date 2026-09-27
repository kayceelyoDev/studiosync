<?php

namespace App\Http\Controllers\Admin;

use App\Enums\RequestStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateClientRequestRequest;
use App\Models\ClientRequest;
use App\Services\ClientRequestService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ClientRequestController extends Controller
{
    public function __construct(private readonly ClientRequestService $service) {}

    /**
     * Display all client requests in FIFO order with urgency indicators.
     */
    public function index(): Response
    {
        $requests = ClientRequest::with(['user:id,name,email', 'project:id,project_name', 'admin:id,name'])
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(fn (ClientRequest $r) => [
                'id' => $r->id,
                'category' => $r->category->value,
                'category_label' => $r->category->label(),
                'category_icon' => $r->category->icon(),
                'title' => $r->title,
                'status' => $r->status->value,
                'status_label' => $r->status->label(),
                'status_color' => $r->status->color(),
                'project' => $r->project ? ['id' => $r->project->id, 'name' => $r->project->project_name] : null,
                'client' => $r->user ? ['id' => $r->user->id, 'name' => $r->user->name, 'email' => $r->user->email] : null,
                'admin' => $r->admin ? ['id' => $r->admin->id, 'name' => $r->admin->name] : null,
                'is_ageing' => $r->isAging(),
                'is_urgent' => $r->isUrgent(),
                'created_at' => $r->created_at?->toIso8601String(),
                'completed_at' => $r->completed_at?->toIso8601String(),
            ]);

        $statusOptions = array_map(fn (RequestStatus $s) => [
            'value' => $s->value,
            'label' => $s->label(),
        ], RequestStatus::cases());

        return Inertia::render('Admin/Requests/Index', [
            'requests' => $requests,
            'statusOptions' => $statusOptions,
        ]);
    }

    /**
     * Display a single client request for admin review.
     */
    public function show(ClientRequest $clientRequest): Response
    {
        $clientRequest->load([
            'user:id,name,email',
            'project:id,project_name',
            'admin:id,name',
            'comments.user:id,name',
        ]);

        $statusOptions = array_map(fn (RequestStatus $s) => [
            'value' => $s->value,
            'label' => $s->label(),
        ], RequestStatus::cases());

        return Inertia::render('Admin/Requests/Show', [
            'request' => [
                'id' => $clientRequest->id,
                'category' => $clientRequest->category->value,
                'category_label' => $clientRequest->category->label(),
                'category_icon' => $clientRequest->category->icon(),
                'title' => $clientRequest->title,
                'description' => $clientRequest->description,
                'attachment_url' => $clientRequest->attachment_path
                    ? $this->service->attachmentUrl($clientRequest->attachment_path)
                    : null,
                'status' => $clientRequest->status->value,
                'status_label' => $clientRequest->status->label(),
                'status_color' => $clientRequest->status->color(),
                'admin_notes' => $clientRequest->admin_notes,
                'project' => $clientRequest->project
                    ? ['id' => $clientRequest->project->id, 'name' => $clientRequest->project->project_name]
                    : null,
                'client' => $clientRequest->user
                    ? ['id' => $clientRequest->user->id, 'name' => $clientRequest->user->name, 'email' => $clientRequest->user->email]
                    : null,
                'admin' => $clientRequest->admin
                    ? ['id' => $clientRequest->admin->id, 'name' => $clientRequest->admin->name]
                    : null,
                'is_ageing' => $clientRequest->isAging(),
                'is_urgent' => $clientRequest->isUrgent(),
                'created_at' => $clientRequest->created_at?->toIso8601String(),
                'completed_at' => $clientRequest->completed_at?->toIso8601String(),
            ],
            'comments' => $clientRequest->comments->map(fn ($comment) => [
                'id' => $comment->id,
                'body' => $comment->body,
                'attachment_url' => $comment->attachment_path
                    ? $this->service->attachmentUrl($comment->attachment_path)
                    : null,
                'user' => ['id' => $comment->user->id, 'name' => $comment->user->name],
                'is_admin' => $comment->user->hasRole('admin') || $comment->user->hasRole('super_admin'),
                'created_at' => $comment->created_at?->toIso8601String(),
            ]),
            'statusOptions' => $statusOptions,
            'auth_user_id' => Auth::id(),
        ]);
    }

    /**
     * Update a client request's status and admin notes.
     */
    public function update(UpdateClientRequestRequest $request, ClientRequest $clientRequest): RedirectResponse
    {
        $this->service->adminUpdate(
            clientRequest: $clientRequest,
            admin: Auth::user(),
            data: $request->validated(),
        );

        return redirect()
            ->route('admin.requests.show', $clientRequest->id)
            ->with('success', 'Request updated successfully.');
    }
}
