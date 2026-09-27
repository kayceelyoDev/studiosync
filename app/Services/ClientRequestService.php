<?php

namespace App\Services;

use App\Enums\RequestCategory;
use App\Enums\RequestStatus;
use App\Models\AssetFolder;
use App\Models\ClientRequest;
use App\Models\ClientRequestComment;
use App\Models\Project;
use App\Models\ProjectAsset;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ClientRequestService
{
    /**
     * Store a new client service request with optional file attachments & project assets.
     *
     * @param  array<string, mixed>  $data
     * @param  array<int, mixed>  $assets
     */
    public function store(
        User $user,
        Project $project,
        array $data,
        ?UploadedFile $attachment = null,
        array $assets = [],
    ): ClientRequest {
        return DB::transaction(function () use ($user, $project, $data, $attachment, $assets) {
            $category = RequestCategory::from($data['category']);
            $title = $category === RequestCategory::Other ? $data['title'] : $category->label();

            $attachmentPath = null;
            if ($attachment) {
                $disk = config('filesystems.disks.r2.key') ? 'r2' : 'public';
                $attachmentPath = $attachment->store("requests/{$user->id}", $disk);
            }

            // Create client request record
            $clientRequest = ClientRequest::create([
                'user_id' => $user->id,
                'project_id' => $project->id,
                'category' => $category->value,
                'title' => $title,
                'description' => $data['description'],
                'attachment_path' => $attachmentPath,
                'status' => RequestStatus::Pending->value,
            ]);

            // Process uploaded asset files and store them in Project Assets
            if (! empty($assets) && is_array($assets)) {
                $folder = AssetFolder::firstOrCreate([
                    'project_id' => $project->id,
                    'name' => 'Service Requests',
                ]);

                foreach ($assets as $index => $assetEntry) {
                    $file = is_array($assetEntry) ? ($assetEntry['file'] ?? null) : $assetEntry;
                    if (! $file instanceof UploadedFile || ! $file->isValid()) {
                        continue;
                    }

                    $disk = config('filesystems.disks.r2.key') ? 'r2' : 'public';

                    // If primary attachment path wasn't set yet, use the first valid file
                    if (! $attachmentPath) {
                        $attachmentPath = $file->store("requests/{$user->id}", $disk);
                        $clientRequest->update(['attachment_path' => $attachmentPath]);
                    }

                    $purpose = is_array($assetEntry)
                        ? (($assetEntry['purpose'] ?? '') === 'Other'
                            ? ($assetEntry['custom_purpose'] ?? 'Other')
                            : ($assetEntry['purpose'] ?? 'Attachment'))
                        : 'Attachment';

                    $notes = is_array($assetEntry) && ! empty($assetEntry['description'])
                        ? ' - '.$assetEntry['description']
                        : '';

                    $assetDescription = "[Request: {$title}] {$purpose}{$notes}";
                    $mime = $file->getMimeType() ?? '';
                    $type = str_starts_with($mime, 'image/') ? 'image' : 'other';

                    $path = $file->store("projects/{$project->id}/assets", 'r2');

                    ProjectAsset::create([
                        'project_id' => $project->id,
                        'asset_folder_id' => $folder->id,
                        'name' => $file->getClientOriginalName(),
                        'description' => $assetDescription,
                        'type' => $type,
                        'path' => $path,
                        'disk' => 'r2',
                    ]);
                }
            }

            return $clientRequest;
        });
    }

    /**
     * Cancel a pending client request.
     */
    public function cancel(ClientRequest $clientRequest): void
    {
        DB::transaction(function () use ($clientRequest) {
            $clientRequest->update([
                'status' => RequestStatus::Cancelled->value,
            ]);
        });
    }

    /**
     * Admin updates the status and/or admin notes on a request.
     */
    public function adminUpdate(ClientRequest $clientRequest, User $admin, array $data): void
    {
        DB::transaction(function () use ($clientRequest, $admin, $data) {
            $newStatus = RequestStatus::from($data['status']);

            $updates = [
                'status' => $newStatus->value,
                'admin_id' => $admin->id,
                'admin_notes' => $data['admin_notes'] ?? $clientRequest->admin_notes,
            ];

            if ($newStatus === RequestStatus::Completed && $clientRequest->status !== RequestStatus::Completed) {
                $updates['completed_at'] = now();
            }

            $clientRequest->update($updates);
        });
    }

    /**
     * Add a comment to a request with an optional file attachment.
     */
    public function addComment(
        ClientRequest $clientRequest,
        User $user,
        string $body,
        ?UploadedFile $attachment = null,
    ): ClientRequestComment {
        return DB::transaction(function () use ($clientRequest, $user, $body, $attachment) {
            $attachmentPath = null;
            if ($attachment) {
                $disk = config('filesystems.disks.r2.key') ? 'r2' : 'public';
                $attachmentPath = $attachment->store("request-comments/{$clientRequest->id}", $disk);
            }

            return ClientRequestComment::create([
                'client_request_id' => $clientRequest->id,
                'user_id' => $user->id,
                'body' => $body,
                'attachment_path' => $attachmentPath,
            ]);
        });
    }

    /**
     * Get the resolved URL for a stored attachment.
     */
    public function attachmentUrl(string $path): string
    {
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        try {
            if (Storage::disk('r2')->exists($path)) {
                return Storage::disk('r2')->url($path);
            }
        } catch (\Throwable $e) {
            // R2 disk optional fallback
        }

        if (Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->url($path);
        }

        if (Storage::disk('private')->exists($path)) {
            return Storage::disk('private')->url($path);
        }

        try {
            return Storage::disk('r2')->url($path);
        } catch (\Throwable $e) {
            return Storage::disk('public')->url($path);
        }
    }
}
