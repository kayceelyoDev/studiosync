<?php

namespace App\Http\Controllers;

use App\Enums\RequestCategory;
use App\Http\Requests\StoreClientRequestRequest;
use App\Models\ClientRequest;
use App\Models\Project;
use App\Services\ClientRequestService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ClientRequestController extends Controller
{
    public function __construct(private readonly ClientRequestService $service) {}

    /**
     * Display the authenticated client's requests.
     */
    public function index(): Response
    {
        $requests = ClientRequest::with(['project:id,project_name', 'admin:id,name'])
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
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
                'admin' => $r->admin ? ['id' => $r->admin->id, 'name' => $r->admin->name] : null,
                'is_ageing' => $r->isAging(),
                'is_urgent' => $r->isUrgent(),
                'created_at' => $r->created_at?->toIso8601String(),
                'completed_at' => $r->completed_at?->toIso8601String(),
            ]);

        return Inertia::render('Requests/Index', [
            'requests' => $requests,
        ]);
    }

    /**
     * Show the request submission form.
     */
    public function create(): Response
    {
        $projects = Project::where('user_id', Auth::id())
            ->orderBy('project_name')
            ->get(['id', 'project_name', 'status', 'deployment_status', 'project_url', 'created_at']);

        $categories = array_map(fn (RequestCategory $cat) => [
            'value' => $cat->value,
            'label' => $cat->label(),
            'description' => $cat->description(),
            'icon' => $cat->icon(),
        ], RequestCategory::cases());

        return Inertia::render('Requests/Create', [
            'projects' => $projects,
            'categories' => $categories,
            'initialProjectId' => request('project_id'),
        ]);
    }

    /**
     * Store a new client request.
     */
    public function store(StoreClientRequestRequest $request): RedirectResponse
    {
        $project = Project::findOrFail($request->validated('project_id'));

        if ($project->user_id !== Auth::id()) {
            abort(403);
        }

        $clientRequest = $this->service->store(
            user: Auth::user(),
            project: $project,
            data: $request->validated(),
            attachment: $request->hasFile('attachment') ? $request->file('attachment') : null,
            assets: $request->file('assets') ?? $request->input('assets', []),
        );

        return redirect()
            ->route('requests.show', $clientRequest->id)
            ->with('success', 'Your request has been submitted successfully.');
    }

    /**
     * Display a single client request and its comments.
     */
    public function show(ClientRequest $clientRequest): Response
    {
        $this->authorize('view', $clientRequest);

        $clientRequest->load([
            'project:id,project_name',
            'admin:id,name',
            'comments.user:id,name',
        ]);

        return Inertia::render('Requests/Show', [
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
                'admin' => $clientRequest->admin
                    ? ['id' => $clientRequest->admin->id, 'name' => $clientRequest->admin->name]
                    : null,
                'is_cancellable' => $clientRequest->isCancellable(),
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
            'auth_user_id' => Auth::id(),
        ]);
    }

    /**
     * Cancel a pending client request.
     */
    public function destroy(ClientRequest $clientRequest): RedirectResponse
    {
        $this->authorize('delete', $clientRequest);

        $this->service->cancel($clientRequest);

        return redirect()
            ->route('requests.index')
            ->with('success', 'Your request has been cancelled.');
    }
}
