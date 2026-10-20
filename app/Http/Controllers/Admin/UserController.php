<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a paginated listing of users with search and role filters.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('q', '');
        $roleFilter = $request->query('role', 'all');

        $query = User::with('roles:id,name')
            ->withCount(['projects', 'workspaces', 'clientRequests']);

        if (! empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($roleFilter === 'client') {
            $query->whereDoesntHave('roles', function ($q) {
                $q->whereIn('name', ['admin', 'super_admin']);
            });
        } elseif ($roleFilter === 'admin') {
            $query->whereHas('roles', function ($q) {
                $q->whereIn('name', ['admin', 'super_admin']);
            });
        }

        $users = $query->orderByDesc('created_at')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name'),
                'is_admin' => $user->hasRole('admin') || $user->hasRole('super_admin'),
                'projects_count' => $user->projects_count,
                'workspaces_count' => $user->workspaces_count,
                'requests_count' => $user->client_requests_count,
                'email_verified_at' => $user->email_verified_at?->toIso8601String(),
                'created_at' => $user->created_at?->toIso8601String(),
            ]);

        $totalUsers = User::count();
        $totalAdmins = User::whereHas('roles', fn ($q) => $q->whereIn('name', ['admin', 'super_admin']))->count();
        $totalClients = $totalUsers - $totalAdmins;

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => [
                'q' => $search,
                'role' => $roleFilter,
            ],
            'stats' => [
                'total_users' => $totalUsers,
                'total_clients' => $totalClients,
                'total_admins' => $totalAdmins,
            ],
        ]);
    }

    /**
     * Display a user with their projects and drill down to project assets.
     */
    public function show(User $user): Response
    {
        $user->load([
            'roles:id,name',
            'projects' => function ($query) {
                $query->with([
                    'projectAssets' => fn ($q) => $q->orderByDesc('created_at'),
                    'assetFolders:id,project_id,name',
                    'deployments' => fn ($q) => $q->latest()->limit(3),
                    'clientRequests' => fn ($q) => $q->latest()->limit(5),
                ])->orderByDesc('created_at');
            },
            'clientRequests' => fn ($q) => $q->with('project:id,project_name')->latest()->limit(10),
        ]);

        return Inertia::render('Admin/Users/Show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name'),
                'is_admin' => $user->hasRole('admin') || $user->hasRole('super_admin'),
                'email_verified_at' => $user->email_verified_at?->toIso8601String(),
                'created_at' => $user->created_at?->toIso8601String(),
                'projects' => $user->projects->map(fn ($p) => [
                    'id' => $p->id,
                    'project_name' => $p->project_name,
                    'status' => $p->status?->value ?? (string) $p->status,
                    'deployment_status' => $p->deployment_status?->value ?? (string) $p->deployment_status,
                    'project_url' => $p->project_url,
                    'vercel_project_name' => $p->vercel_project_name,
                    'vercel_dashboard_url' => $p->vercel_dashboard_url,
                    'deployed_at' => $p->deployed_at?->toIso8601String(),
                    'created_at' => $p->created_at?->toIso8601String(),
                    'assets_count' => $p->projectAssets->count(),
                    'assets' => $p->projectAssets->map(fn ($a) => [
                        'id' => $a->id,
                        'name' => $a->name,
                        'type' => $a->type,
                        'path' => $a->path,
                        'disk' => $a->disk,
                        'url' => $a->url,
                        'description' => $a->description,
                        'asset_folder_id' => $a->asset_folder_id,
                        'created_at' => $a->created_at?->toIso8601String(),
                    ]),
                    'folders' => $p->assetFolders,
                    'deployments' => $p->deployments,
                    'requests' => $p->clientRequests->map(fn ($r) => [
                        'id' => $r->id,
                        'title' => $r->title,
                        'category' => $r->category->value,
                        'category_label' => $r->category->label(),
                        'status' => $r->status->value,
                        'status_label' => $r->status->label(),
                        'created_at' => $r->created_at?->toIso8601String(),
                    ]),
                ]),
                'requests' => $user->clientRequests->map(fn ($r) => [
                    'id' => $r->id,
                    'title' => $r->title,
                    'category' => $r->category->value,
                    'category_label' => $r->category->label(),
                    'category_icon' => $r->category->icon(),
                    'status' => $r->status->value,
                    'status_label' => $r->status->label(),
                    'project' => $r->project ? ['id' => $r->project->id, 'name' => $r->project->project_name] : null,
                    'created_at' => $r->created_at?->toIso8601String(),
                ]),
            ],
        ]);
    }
}
