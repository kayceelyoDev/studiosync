<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $contact_emailer_id
 * @property string $guest_name
 * @property string $guest_email
 * @property string $subject
 * @property string $message
 * @property string|null $ip_address
 * @property Carbon|null $created_at
 */
class ContactMessage extends Model
{
    /**
     * Messages are immutable records — no updated_at needed.
     */
    public $timestamps = false;

    protected $fillable = [
        'contact_emailer_id',
        'guest_name',
        'guest_email',
        'subject',
        'message',
        'ip_address',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    public function emailer(): BelongsTo
    {
        return $this->belongsTo(ContactEmailer::class, 'contact_emailer_id');
    }
}
