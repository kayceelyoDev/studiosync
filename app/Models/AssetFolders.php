<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AssetFolder extends Model
{
    protected $fillable = [
        'project_id',
        'parent_id',
        'name',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(AssetFolder::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(AssetFolder::class, 'parent_id');
    }

    public function assets(): HasMany
    {
        return $this->hasMany(ProjectAsset::class);
    }
}
