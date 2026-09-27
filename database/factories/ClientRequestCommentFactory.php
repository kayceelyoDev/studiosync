<?php

namespace Database\Factories;

use App\Models\ClientRequest;
use App\Models\ClientRequestComment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ClientRequestComment>
 */
class ClientRequestCommentFactory extends Factory
{
    protected $model = ClientRequestComment::class;

    public function definition(): array
    {
        return [
            'client_request_id' => ClientRequest::factory(),
            'user_id' => User::factory(),
            'body' => fake()->paragraph(),
            'attachment_path' => null,
        ];
    }
}
