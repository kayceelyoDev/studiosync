<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminWorkspaceController extends Controller
{
    public function index()
    {
        $projects = Project::with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Admin/Workspaces/Index', [
            'workspaces' => $projects,
        ]);
    }

    public function show(Project $project)
    {
        $project->load('user');

        return Inertia::render('Admin/Workspaces/Show', [
            'workspace' => $project,
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending,in_progress,completed',
            'generated_prompt' => 'nullable|string',
            'project_url' => 'nullable|url',
        ]);

        $project->update($validated);

        return redirect()->route('admin.projects.show', $project->id)
            ->with('success', 'Project updated successfully.');
    }
}
