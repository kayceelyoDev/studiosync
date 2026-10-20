<?php

namespace App\Http\Controllers\Admin;

use App\Enums\RequestCategory;
use App\Enums\RequestStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateClientRequestRequest;
use App\Models\ClientRequest;
use App\Services\BookingCodeInjectionService;
use App\Services\ClientRequestService;
use App\Services\ContactEmailerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ClientRequestController extends Controller
{
    public function __construct(private readonly ClientRequestService $service) {}

    /**
     * Display client requests with search, category/status filters, and pagination.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('q', '');
        $statusFilter = $request->query('status', 'open');
        $categoryFilter = $request->query('category', 'all');

        $query = ClientRequest::with(['user:id,name,email', 'project:id,project_name,vercel_project_name,deployment_status,status', 'admin:id,name']);

        if (! empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhereHas('project', function ($pq) use ($search) {
                        $pq->where('project_name', 'like', "%{$search}%");
                    });
            });
        }

        $terminalStatuses = [
            RequestStatus::Completed->value,
            RequestStatus::Rejected->value,
            RequestStatus::Cancelled->value,
        ];

        if ($statusFilter === 'open') {
            $query->whereNotIn('status', $terminalStatuses);
        } elseif ($statusFilter !== 'all' && RequestStatus::tryFrom($statusFilter)) {
            $query->where('status', $statusFilter);
        }

        if ($categoryFilter !== 'all' && RequestCategory::tryFrom($categoryFilter)) {
            $query->where('category', $categoryFilter);
        }

        $paginated = $query->orderBy('created_at', 'asc')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (ClientRequest $r) => [
                'id' => $r->id,
                'category' => $r->category->value,
                'category_label' => $r->category->label(),
                'category_icon' => $r->category->icon(),
                'title' => $r->title,
                'description' => $r->description,
                'status' => $r->status->value,
                'status_label' => $r->status->label(),
                'status_color' => $r->status->color(),
                'project' => $r->project ? [
                    'id' => $r->project->id,
                    'name' => $r->project->project_name,
                    'is_deployed' => $r->project->isDeployed(),
                    'vercel_dashboard_url' => $r->project->vercel_dashboard_url,
                ] : null,
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

        $categoryOptions = array_map(fn (RequestCategory $c) => [
            'value' => $c->value,
            'label' => $c->label(),
        ], RequestCategory::cases());

        $openCount = ClientRequest::whereNotIn('status', $terminalStatuses)->count();
        $urgentCount = ClientRequest::whereNotIn('status', $terminalStatuses)
            ->where('created_at', '<=', now()->subHours(72))
            ->count();

        return Inertia::render('Admin/Requests/Index', [
            'requests' => $paginated->items(),
            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'total' => $paginated->total(),
                'prev_page_url' => $paginated->previousPageUrl(),
                'next_page_url' => $paginated->nextPageUrl(),
                'links' => $paginated->linkCollection()->toArray(),
            ],
            'statusOptions' => $statusOptions,
            'categoryOptions' => $categoryOptions,
            'filters' => [
                'q' => $search,
                'status' => $statusFilter,
                'category' => $categoryFilter,
            ],
            'counts' => [
                'open' => $openCount,
                'urgent' => $urgentCount,
            ],
        ]);
    }

    /**
     * Display a single client request for admin review.
     */
    public function show(ClientRequest $clientRequest): Response
    {
        $clientRequest->load([
            'user:id,name,email',
            'project' => fn ($query) => $query->with(['contactEmailer', 'bookingServices']),
            'admin:id,name',
            'comments.user:id,name',
        ]);

        $statusOptions = array_map(fn (RequestStatus $s) => [
            'value' => $s->value,
            'label' => $s->label(),
        ], RequestStatus::cases());

        $project = $clientRequest->project;
        $bookingService = app(BookingCodeInjectionService::class);
        $hasBookingCta = $project ? $bookingService->hasBookingCta($project) : false;
        $bookingCtaSnippet = ($project && $project->booking_public_token) ? $bookingService->getEmbedSnippet($project) : null;

        return Inertia::render('Admin/Requests/Show', [
            'request' => [
                'id' => $clientRequest->id,
                'category' => $clientRequest->category->value,
                'category_label' => $clientRequest->category->label(),
                'category_icon' => $clientRequest->category->icon(),
                'title' => $clientRequest->title,
                'description' => $clientRequest->description,
                'intake_data' => $clientRequest->intake_data,
                'attachment_url' => $clientRequest->attachment_path
                    ? $this->service->attachmentUrl($clientRequest->attachment_path)
                    : null,
                'status' => $clientRequest->status->value,
                'status_label' => $clientRequest->status->label(),
                'status_color' => $clientRequest->status->color(),
                'admin_notes' => $clientRequest->admin_notes,
                'project' => $project
                    ? [
                        'id' => $project->id,
                        'name' => $project->project_name,
                        'has_emailer' => $project->contactEmailer !== null,
                        'emailer_active' => (bool) ($project->contactEmailer?->is_active ?? false),
                        'emailer_recipient_email' => $project->contactEmailer?->recipient_email,
                        'emailer_reply_name' => $project->contactEmailer?->reply_name,
                        'emailer_public_token' => $project->contactEmailer?->public_token,
                        'emailer_endpoint_url' => $project->contactEmailer?->public_token ? url("/api/contact/{$project->contactEmailer->public_token}") : null,
                        'has_emailer_script' => str_contains($project->html_content ?? '', 'SS-EMAILER-START'),
                        'has_contact_form' => $project ? app(ContactEmailerService::class)->hasContactForm($project) : false,
                        'booking_enabled' => (bool) $project->booking_enabled,
                        'booking_public_token' => $project->booking_public_token,
                        'booking_notification_email' => $project->booking_notification_email ?? $clientRequest->user?->email,
                        'booking_entry_url' => $project->booking_public_token ? url("/book/entry/{$project->booking_public_token}") : null,
                        'has_booking_cta' => $hasBookingCta,
                        'booking_cta_snippet' => $bookingCtaSnippet,
                        'booking_services_count' => $project->bookingServices->count(),
                        'is_deployed' => $project->isDeployed(),
                        'project_url' => $project->project_url,
                        'vercel_dashboard_url' => $project->vercel_dashboard_url,
                    ]
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
