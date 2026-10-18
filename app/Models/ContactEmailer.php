<?php

namespace App\Models;

use Database\Factories\ContactEmailerFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $project_id
 * @property int|null $client_request_id
 * @property string $recipient_email
 * @property string $reply_name
 * @property string $public_token
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class ContactEmailer extends Model
{
    /** @use HasFactory<ContactEmailerFactory> */
    use HasFactory;

    protected $fillable = [
        'project_id',
        'client_request_id',
        'recipient_email',
        'reply_name',
        'public_token',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function clientRequest(): BelongsTo
    {
        return $this->belongsTo(ClientRequest::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(ContactMessage::class);
    }
}
