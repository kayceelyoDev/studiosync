<?php

namespace App\Http\Controllers\Admin;

use App\Enums\DeploymentStatus;
use App\Enums\ProjectStatus;
use App\Enums\RequestCategory;
use App\Enums\RequestStatus;
use App\Http\Controllers\Controller;
use App\Models\ClientRequest;
use App\Models\Project;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the main administrative dashboard.
     */
    public function index(): Response
    {
        $terminalStatuses = [
            RequestStatus::Completed->value,
            RequestStatus::Rejected->value,
            RequestStatus::Cancelled->value,
        ];

        // 1. Request metrics
        $totalRequests = ClientRequest::count();
        $openRequests = ClientRequest::whereNotIn('status', $terminalStatuses)->count();
        $reviewingRequests = ClientRequest::where('status', RequestStatus::Reviewing->value)->count();
        $inProgressRequests = ClientRequest::where('status', RequestStatus::InProgress->value)->count();
        $completedRequests = ClientRequest::where('status', RequestStatus::Completed->value)->count();

        $agingCutoff = now()->subHours(24);
        $urgentCutoff = now()->subHours(72);

        $agingRequests = ClientRequest::whereNotIn('status', $terminalStatuses)
            ->where('created_at', '<=', $agingCutoff)
            ->count();

        $urgentRequests = ClientRequest::whereNotIn('status', $terminalStatuses)
            ->where('created_at', '<=', $urgentCutoff)
            ->count();

        // 2. Category distribution
        $categoryBreakdown = [];
        $categoryCounts = ClientRequest::selectRaw('category, count(*) as count')
            ->groupBy('category')
            ->pluck('count', 'category')
            ->all();

        foreach (RequestCategory::cases() as $category) {
            $categoryBreakdown[] = [
                'value' => $category->value,
                'label' => $category->label(),
                'icon' => $category->icon(),
                'count' => $categoryCounts[$category->value] ?? 0,
            ];
        }

        // 3. System totals
        $totalUsers = User::count();
        $totalProjects = Project::count();
        $deployedProjects = Project::where('deployment_status', DeploymentStatus::Deployed->value)
            ->orWhere('status', ProjectStatus::Deployed->value)
            ->count();

        // 4. Recent Requests
        $recentRequests = ClientRequest::with(['user:id,name,email', 'project:id,project_name', 'admin:id,name'])
            ->orderByDesc('created_at')
            ->limit(10)
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
            ]);

        // 5. Recent Vercel Deployments
        $recentDeployments = Project::with('user:id,name,email')
            ->where(function ($query) {
                $query->where('deployment_status', DeploymentStatus::Deployed->value)
                    ->orWhere('status', ProjectStatus::Deployed->value);
            })
            ->whereNotNull('vercel_project_name')
            ->orderByDesc('deployed_at')
            ->orderByDesc('updated_at')
            ->limit(8)
            ->get()
            ->map(fn (Project $p) => [
                'id' => $p->id,
                'project_name' => $p->project_name,
                'project_url' => $p->project_url,
                'vercel_project_name' => $p->vercel_project_name,
                'vercel_dashboard_url' => $p->vercel_dashboard_url,
                'deployed_at' => $p->deployed_at?->toIso8601String() ?? $p->updated_at?->toIso8601String(),
                'client' => $p->user ? ['id' => $p->user->id, 'name' => $p->user->name] : null,
            ]);

        return Inertia::render('Admin/Dashboard', [
            'metrics' => [
                'total_requests' => $totalRequests,
                'open_requests' => $openRequests,
                'reviewing_requests' => $reviewingRequests,
                'in_progress_requests' => $inProgressRequests,
                'completed_requests' => $completedRequests,
                'urgent_requests' => $urgentRequests,
                'aging_requests' => $agingRequests,
                'total_users' => $totalUsers,
                'total_projects' => $totalProjects,
                'deployed_projects' => $deployedProjects,
            ],
            'categories' => $categoryBreakdown,
            'recentRequests' => $recentRequests,
            'recentDeployments' => $recentDeployments,
        ]);
    }
}
