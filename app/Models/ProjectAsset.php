<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectAsset extends Model
{
    protected $fillable = [
        'project_id',
        'asset_folder_id',
        'name',
        'description',
        'type',
        'path',
        'disk',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function folder(): BelongsTo
    {
        return $this->belongsTo(AssetFolder::class, 'asset_folder_id');
    }
}
