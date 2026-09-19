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
        'vercel_project_id',
        'vercel_project_name',
        'deployment_status',
        'deployed_at',
        'content_hash',
    ];

    protected function casts(): array
    {
        return [
            'preferences' => 'array',
            'deployed_at' => 'datetime',
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

    public function projectAssets(): HasMany
    {
        return $this->hasMany(ProjectAsset::class);
    }

    public function deployments(): HasMany
    {
        return $this->hasMany(Deployment::class);
    }

    public function isDeployed(): bool
    {
        return $this->deployment_status === 'deployed' || $this->status === 'deployed';
    }

    public function isDeploying(): bool
    {
        return $this->deployment_status === 'deploying';
    }

    public function isEditable(): bool
    {
        return ! $this->isDeployed() && ! $this->isDeploying();
    }

    /**
     * Update and persist the project's HTML content and optionally its name.
     */
    public function updateHtmlContent(string $htmlContent, ?string $projectName = null): bool
    {
        return $this->update([
            'html_content' => $htmlContent,
            'project_name' => $projectName ?? $this->project_name,
        ]);
    }
}
