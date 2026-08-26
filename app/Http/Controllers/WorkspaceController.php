<?php

namespace App\Http\Controllers;

use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class WorkspaceController extends Controller
{
    public function index()
    {
        if (auth()->user()->hasRole('admin') || auth()->user()->hasRole('super_admin')) {
            return redirect()->route('admin.projects.index');
        }

        $workspaces = Workspace::withCount('projects')
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('dashboard', [
            'workspaces' => $workspaces,
        ]);
    }

    public function create()
    {
        return Inertia::render('Workspace/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:workspaces,slug',
        ]);

        $workspace = Workspace::create([
            'user_id' => Auth::id(),
            'name' => $validated['name'],
            'slug' => $validated['slug'],
        ]);

        return redirect()->route('workspaces.show', $workspace->id)
            ->with('success', 'Workspace created successfully.');
    }

    public function show(Workspace $workspace)
    {
        if ($workspace->user_id !== Auth::id()) {
            abort(403);
        }

        $workspace->load('projects');

        return Inertia::render('Workspace/Show', [
            'workspace' => $workspace,
            'projects' => $workspace->projects->sortByDesc('created_at')->values(),
        ]);
    }
}
