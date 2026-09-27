<?php

namespace App\Models;

use App\Enums\DeploymentStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Deployment extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'user_id',
        'vercel_deployment_id',
        'vercel_project_id',
        'url',
        'status',
        'error_message',
        'content_hash',
    ];

    protected function casts(): array
    {
        return [
            'status' => DeploymentStatus::class,
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isReady(): bool
    {
        return $this->status === DeploymentStatus::Ready;
    }

    public function isFailed(): bool
    {
        return in_array($this->status, [DeploymentStatus::Error, DeploymentStatus::Canceled, DeploymentStatus::Failed], true);
    }
}
