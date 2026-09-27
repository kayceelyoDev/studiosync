<?php

namespace App\Http\Controllers;

use App\Enums\ProjectStatus;
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
        $project->makeVisible('generated_prompt');
        $project->load([
            'user:id,name,email',
            'workspace:id,name,slug',
            'projectAssets',
            'deployments' => fn ($q) => $q->latest()->limit(5),
        ]);

        return Inertia::render('Admin/Workspaces/Show', [
            'workspace' => $project,
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:'.implode(',', array_column(ProjectStatus::cases(), 'value'))],
            'generated_prompt' => 'nullable|string',
            'project_url' => 'nullable|url',
        ]);

        $project->update($validated);

        return redirect()->route('admin.projects.show', $project->id)
            ->with('success', 'Project updated successfully.');
    }
}
