<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Project extends Model
{
    protected $hidden = ['generated_prompt'];

    protected $fillable = [
        'workspace_id',
        'user_id',
        'project_name',
        'preferences',
        'generated_prompt',
        'html_content',
        'status',
        'project_url',
    ];

    protected function casts(): array
    {
        return [
            'preferences' => 'array',
        ];
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function assetFolders(): HasMany
    {
        return $this->hasMany(AssetFolder::class);
    }

    public function assets(): HasManyThrough
    {
        return $this->hasManyThrough(ProjectAsset::class, AssetFolder::class);
    }
}
