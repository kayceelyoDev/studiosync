<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class BookingAccessToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'token',
        'expires_at',
        'is_revoked',
        'access_count',
        'last_accessed_at',
        'ip_address',
        'user_agent',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'last_accessed_at' => 'datetime',
            'is_revoked' => 'boolean',
            'access_count' => 'integer',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_revoked', false)
            ->where('expires_at', '>', now());
    }

    public function scopeExpired(Builder $query): Builder
    {
        return $query->where('expires_at', '<=', now());
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isValid(): bool
    {
        return ! $this->is_revoked && ! $this->isExpired();
    }

    public function recordAccess(): void
    {
        $this->increment('access_count', 1, [
            'last_accessed_at' => now(),
        ]);
    }

    /**
     * Create a new secure dynamic session token for a project.
     */
    public static function createForProject(
        Project $project,
        ?DateTimeInterface $expiresAt = null,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): self {
        return self::create([
            'project_id' => $project->id,
            'token' => 'bk_sess_'.Str::random(40),
            'expires_at' => $expiresAt ?? now()->addMinutes(60),
            'is_revoked' => false,
            'access_count' => 0,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent ? Str::limit($userAgent, 500) : null,
        ]);
    }
}
