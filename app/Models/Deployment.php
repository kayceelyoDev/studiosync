<?php

namespace App\Models;

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
        return $this->status === 'ready';
    }

    public function isFailed(): bool
    {
        return in_array($this->status, ['error', 'canceled', 'failed'], true);
    }
}
