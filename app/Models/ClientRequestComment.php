<?php

namespace App\Models;

use Database\Factories\ClientRequestCommentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $client_request_id
 * @property int $user_id
 * @property string $body
 * @property string|null $attachment_path
 */
class ClientRequestComment extends Model
{
    /** @use HasFactory<ClientRequestCommentFactory> */
    use HasFactory;

    protected $fillable = [
        'client_request_id',
        'user_id',
        'body',
        'attachment_path',
    ];

    public function clientRequest(): BelongsTo
    {
        return $this->belongsTo(ClientRequest::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
