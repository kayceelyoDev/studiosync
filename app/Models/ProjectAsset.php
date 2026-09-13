<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class ProjectAsset extends Model
{
    /**
     * The model's default values for attributes.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'disk' => 'r2',
    ];

    protected $fillable = [
        'project_id',
        'asset_folder_id',
        'name',
        'description',
        'type',
        'path',
        'disk',
    ];

    /**
     * Get the resolved URL for the asset from its configured disk.
     */
    public function getUrlAttribute(): string
    {
        return Storage::disk($this->disk ?? 'r2')->url($this->path);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function folder(): BelongsTo
    {
        return $this->belongsTo(AssetFolder::class, 'asset_folder_id');
    }
}
