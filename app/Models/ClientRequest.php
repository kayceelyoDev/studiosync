<?php

namespace App\Models;

use App\Enums\RequestCategory;
use App\Enums\RequestStatus;
use Database\Factories\ClientRequestFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property int $project_id
 * @property int|null $admin_id
 * @property RequestCategory $category
 * @property string $title
 * @property string $description
 * @property string|null $attachment_path
 * @property RequestStatus $status
 * @property string|null $admin_notes
 * @property Carbon|null $completed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class ClientRequest extends Model
{
    /** @use HasFactory<ClientRequestFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'project_id',
        'admin_id',
        'category',
        'title',
        'description',
        'attachment_path',
        'status',
        'admin_notes',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'category' => RequestCategory::class,
            'status' => RequestStatus::class,
            'completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(ClientRequestComment::class);
    }

    public function isCancellable(): bool
    {
        return $this->status === RequestStatus::Pending;
    }

    public function isAging(): bool
    {
        return ! $this->status->isTerminal()
            && $this->created_at?->lt(now()->subHours(24));
    }

    public function isUrgent(): bool
    {
        return ! $this->status->isTerminal()
            && $this->created_at?->lt(now()->subHours(72));
    }

    /**
     * Scope to filter pending requests.
     *
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopePending($query)
    {
        return $query->where('status', RequestStatus::Pending->value);
    }

    /**
     * Scope to filter in-progress requests.
     *
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeInProgress($query)
    {
        return $query->where('status', RequestStatus::InProgress->value);
    }
}
