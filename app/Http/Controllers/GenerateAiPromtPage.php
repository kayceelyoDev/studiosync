<?php

namespace App\Http\Controllers;

use App\Http\Requests\PreferenceFormRequest;
use App\Jobs\GenerateWebsiteJob;
use App\Models\AssetFolder;
use App\Models\Project;
use App\Models\ProjectAsset;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
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

        $project = DB::transaction(function () use ($data, $request) {
            $project = Project::create([
                'workspace_id' => $data['workspace_id'],
                'user_id' => auth()->id(),
                'project_name' => $data['project_name'] ?? 'Untitled',
                'preferences' => $data['preferences'] ?? [],
                'status' => 'pending',
            ]);

            $uploadedFiles = $request->file('assets');
            if (! empty($uploadedFiles) && is_array($uploadedFiles)) {
                $folder = AssetFolder::firstOrCreate([
                    'project_id' => $project->id,
                    'name' => 'Uploads',
                ]);

                $assetInputs = $request->input('assets', []);

                foreach ($uploadedFiles as $index => $assetFileEntry) {
                    $file = is_array($assetFileEntry) ? ($assetFileEntry['file'] ?? null) : $assetFileEntry;
                    if (! $file || ! $file->isValid()) {
                        continue;
                    }

                    $assetMeta = $assetInputs[$index] ?? [];
                    $section = $assetMeta['section'] ?? 'General';
                    $purpose = ($assetMeta['purpose'] ?? '') === 'Other'
                        ? ($assetMeta['custom_purpose'] ?? 'Other')
                        : ($assetMeta['purpose'] ?? 'Image');
                    $notes = ! empty($assetMeta['description']) ? ' - '.$assetMeta['description'] : '';
                    $description = "[Section: {$section}] {$purpose}{$notes}";

                    $path = $file->store("projects/{$project->id}/assets", 'r2');

                    ProjectAsset::create([
                        'project_id' => $project->id,
                        'asset_folder_id' => $folder->id,
                        'name' => $file->getClientOriginalName(),
                        'description' => $description,
                        'type' => 'image',
                        'path' => $path,
                        'disk' => 'r2',
                    ]);
                }
            }

            return $project;
        });

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

    public function edit(Project $project)
    {
        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        $project->load([
            'workspace:id,name',
            'projectAssets' => fn ($query) => $query->latest(),
        ]);

        $initialAssets = $project->projectAssets->map(function ($asset) {
            return [
                'id' => $asset->id,
                'project_id' => $asset->project_id,
                'asset_folder_id' => $asset->asset_folder_id,
                'name' => $asset->name,
                'description' => $asset->description,
                'type' => $asset->type,
                'path' => $asset->path,
                'disk' => $asset->disk,
                'url' => $asset->url,
                'created_at' => $asset->created_at?->toIso8601String(),
                'updated_at' => $asset->updated_at?->toIso8601String(),
            ];
        });

        return Inertia::render('Project/Edit', [
            'project' => $project,
            'initialAssets' => $initialAssets,
        ]);
    }

    public function update(Request $request, Project $project): JsonResponse|RedirectResponse
    {
        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        $htmlContent = $request->input('html_content')
            ?? $request->json('html_content')
            ?? $request->input('html')
            ?? $request->json('html');

        // Fallback to raw request body if JSON mapping was delayed and htmlContent is null
        if ($htmlContent === null) {
            $raw = $request->getContent();
            if ($raw && str_starts_with(trim($raw), '{')) {
                $decoded = json_decode($raw, true);
                $htmlContent = $decoded['html_content'] ?? $decoded['html'] ?? null;
            } elseif ($raw && (str_contains($raw, '<html') || str_contains($raw, '<!DOCTYPE') || str_contains($raw, '<body') || str_contains($raw, '<section'))) {
                $htmlContent = $raw;
            }
        }

        $projectName = $request->input('project_name')
            ?? $request->json('project_name')
            ?? $project->project_name;

        $validator = Validator::make([
            'html_content' => $htmlContent,
            'project_name' => $projectName,
        ], [
            'html_content' => ['required', 'string'],
            'project_name' => ['nullable', 'string', 'max:255'],
        ]);

        if ($validator->fails()) {
            if ($request->expectsJson() || $request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => $validator->errors()->first(),
                    'errors' => $validator->errors(),
                ], 422);
            }

            return back()->withErrors($validator);
        }

        $project->updateHtmlContent(
            $htmlContent,
            $projectName
        );

        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Project saved successfully.',
                'project' => $project,
            ]);
        }

        return back()->with('success', 'Project saved successfully.');
    }
}
