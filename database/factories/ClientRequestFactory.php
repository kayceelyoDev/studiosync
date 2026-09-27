<?php

namespace Database\Factories;

use App\Enums\RequestCategory;
use App\Enums\RequestStatus;
use App\Models\ClientRequest;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ClientRequest>
 */
class ClientRequestFactory extends Factory
{
    protected $model = ClientRequest::class;

    public function definition(): array
    {
        $category = fake()->randomElement(RequestCategory::cases());

        return [
            'user_id' => User::factory(),
            'project_id' => Project::factory(),
            'admin_id' => null,
            'category' => $category->value,
            'title' => $category->label(),
            'description' => fake()->paragraph(3),
            'attachment_path' => null,
            'status' => RequestStatus::Pending->value,
            'admin_notes' => null,
            'completed_at' => null,
        ];
    }

    public function pending(): static
    {
        return $this->state(['status' => RequestStatus::Pending->value]);
    }

    public function reviewing(): static
    {
        return $this->state(['status' => RequestStatus::Reviewing->value]);
    }

    public function inProgress(): static
    {
        return $this->state(['status' => RequestStatus::InProgress->value]);
    }

    public function completed(): static
    {
        return $this->state([
            'status' => RequestStatus::Completed->value,
            'completed_at' => now(),
        ]);
    }

    public function rejected(): static
    {
        return $this->state(['status' => RequestStatus::Rejected->value]);
    }

    public function forCategory(RequestCategory $category): static
    {
        return $this->state([
            'category' => $category->value,
            'title' => $category->label(),
        ]);
    }
}
