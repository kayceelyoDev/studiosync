<?php

namespace App\Http\Controllers;

use App\Http\Requests\PreferenceFormRequest;
use App\Jobs\GenerateWebsiteJob;
use App\Models\Project;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class GenerateAiPromtPage extends Controller
{
    public function index(Request $request)
    {
        $workspaceId = $request->query('workspace_id');
        $workspace = null;

        if ($workspaceId) {
            $workspace = Workspace::where('id', $workspaceId)
                ->where('user_id', auth()->id())
                ->first();
        } else {
            $workspace = Workspace::where('user_id', auth()->id())
                ->orderBy('created_at', 'desc')
                ->first();
        }

        if (! $workspace) {
            return redirect()->route('dashboard')->with('error', 'Please create a workspace first before generating a project.');
        }

        return Inertia::render('GenerateAiPrompt/Index', [
            'workspace_id' => $workspace?->id,
            'workspace_name' => $workspace?->name,
        ]);
    }

    public function showProject()
    {
        if (! auth()->user()) {
            abort(401);
        }

        if (auth()->user()->hasRole('admin') || auth()->user()->hasRole('super_admin')) {
            return redirect()->route('admin.projects.index');
        }

        $data = Project::select('id', 'workspace_id', 'project_name', 'status', 'project_url', 'created_at')
            ->where('user_id', Auth::user()->id)
            ->get();

        return Inertia::render('dashboard', [
            'projects' => $data,
        ]);
    }

    public function show(Project $project)
    {
        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('Project/Show', [
            'project' => $project,
        ]);
    }

    public function generatePrompt(PreferenceFormRequest $request)
    {
        $data = $request->validated();

        $project = Project::create([
            'workspace_id' => $data['workspace_id'],
            'user_id' => auth()->id(),
            'project_name' => $data['project_name'] ?? 'Untitled',
            'preferences' => $data['preferences'] ?? [],
            'status' => 'pending',
        ]);

        GenerateWebsiteJob::dispatch($project);

        return response()->json([
            'success' => true,
            'project_id' => $project->id,
            'message' => 'Your website is being generated!',
        ]);
    }

    public function checkStatus(Project $project)
    {
        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        return response()->json([
            'status' => $project->status,
            'html_content' => $project->status === 'completed' ? $project->html_content : null,
        ]);
    }
}
