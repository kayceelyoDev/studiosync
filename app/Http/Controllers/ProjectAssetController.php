<?php

namespace App\Http\Controllers;

use App\Models\AssetFolder;
use App\Models\Project;
use App\Models\ProjectAsset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProjectAssetController extends Controller
{
    /**
     * Display a listing of assets for the given project.
     */
    public function index(Project $project): JsonResponse
    {
        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        $assets = $project->projectAssets()
            ->latest()
            ->get()
            ->map(fn (ProjectAsset $asset) => $this->formatAsset($asset));

        return response()->json([
            'success' => true,
            'assets' => $assets,
        ]);
    }

    /**
     * Store a newly created asset in storage (Cloudflare R2).
     */
    public function store(Request $request, Project $project): JsonResponse
    {
        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        $file = $request->file('file') ?? $request->file('image');

        $validator = Validator::make([
            'file' => $file,
            'name' => $request->input('name'),
            'section' => $request->input('section'),
            'purpose' => $request->input('purpose'),
            'custom_purpose' => $request->input('custom_purpose'),
            'description' => $request->input('description'),
        ], [
            'file' => ['required', 'file', 'image', 'max:10240'],
            'name' => ['nullable', 'string', 'max:255'],
            'section' => ['nullable', 'string', 'max:100'],
            'purpose' => ['nullable', 'string', 'max:100'],
            'custom_purpose' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
        ], [
            'file.max' => 'The image must not exceed 10MB.',
            'file.image' => 'The uploaded file must be an image (PNG, JPG, WEBP, or SVG).',
            'file.required' => 'Please select an image file to upload.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $folder = AssetFolder::firstOrCreate([
            'project_id' => $project->id,
            'name' => 'Uploads',
        ]);

        if ($request->filled('section') || $request->filled('purpose')) {
            $section = $request->input('section') ?? 'General';
            $purpose = ($request->input('purpose') === 'Other')
                ? ($request->input('custom_purpose') ?: 'Other')
                : ($request->input('purpose') ?: 'Image');
            $notes = $request->filled('description') ? ' - '.$request->input('description') : '';
            $description = "[Section: {$section}] {$purpose}{$notes}";
        } else {
            $description = $request->input('description') ?: 'Uploaded asset';
        }

        $path = $file->store("projects/{$project->id}/assets", 'r2');
        $fileName = $request->filled('name') ? $request->input('name') : $file->getClientOriginalName();

        $asset = ProjectAsset::create([
            'project_id' => $project->id,
            'asset_folder_id' => $folder->id,
            'name' => $fileName,
            'description' => $description,
            'type' => 'image',
            'path' => $path,
            'disk' => 'r2',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Image uploaded to Cloudflare R2 successfully.',
            'asset' => $this->formatAsset($asset),
        ], 201);
    }

    /**
     * Replace an existing asset's file with a new image in Cloudflare R2,
     * deleting the old file to optimize storage efficiency.
     */
    public function replace(Request $request, Project $project, ProjectAsset $asset): JsonResponse
    {
        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        if ($asset->project_id !== $project->id) {
            abort(404);
        }

        $file = $request->file('file') ?? $request->file('image');

        $validator = Validator::make([
            'file' => $file,
        ], [
            'file' => ['required', 'file', 'image', 'max:10240'],
        ], [
            'file.max' => 'The replacement image must not exceed 10MB.',
            'file.image' => 'The uploaded file must be an image (PNG, JPG, WEBP, or SVG).',
            'file.required' => 'Please select a replacement image file.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $oldPath = $asset->path;
        $oldDisk = $asset->disk ?? 'r2';

        // Upload the new image to Cloudflare R2
        $newPath = $file->store("projects/{$project->id}/assets", 'r2');

        // Delete the old file from Cloudflare R2 for storage efficiency
        if ($oldPath && Storage::disk($oldDisk)->exists($oldPath)) {
            Storage::disk($oldDisk)->delete($oldPath);
        }

        $asset->update([
            'path' => $newPath,
            'name' => $file->getClientOriginalName(),
            'disk' => 'r2',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Image replaced successfully. The previous image was removed from R2 storage.',
            'asset' => $this->formatAsset($asset->fresh()),
        ]);
    }

    /**
     * Update metadata (e.g. name or description) for an existing asset.
     */
    public function update(Request $request, Project $project, ProjectAsset $asset): JsonResponse
    {
        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        if ($asset->project_id !== $project->id) {
            abort(404);
        }

        $validator = Validator::make($request->all(), [
            'name' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $asset->update($request->only(['name', 'description']));

        return response()->json([
            'success' => true,
            'message' => 'Asset updated successfully.',
            'asset' => $this->formatAsset($asset->fresh()),
        ]);
    }

    /**
     * Remove the specified asset from Cloudflare R2 storage and database.
     */
    public function destroy(Project $project, ProjectAsset $asset): JsonResponse
    {
        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        if ($asset->project_id !== $project->id) {
            abort(404);
        }

        // Delete the file from Cloudflare R2
        if ($asset->path && Storage::disk($asset->disk ?? 'r2')->exists($asset->path)) {
            Storage::disk($asset->disk ?? 'r2')->delete($asset->path);
        }

        $asset->delete();

        return response()->json([
            'success' => true,
            'message' => 'Asset deleted from Cloudflare R2 storage successfully.',
        ]);
    }

    /**
     * Format a ProjectAsset model instance with public URL and attributes.
     *
     * @return array<string, mixed>
     */
    private function formatAsset(ProjectAsset $asset): array
    {
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
    }
}
