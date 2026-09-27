<?php

namespace Database\Factories;

use App\Enums\DeploymentStatus;
use App\Enums\ProjectStatus;
use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    protected $model = Project::class;

    public function definition(): array
    {
        return [
            'workspace_id' => Workspace::factory(),
            'user_id' => User::factory(),
            'project_name' => fake()->domainWord().' Website',
            'preferences' => ['theme' => 'dark', 'primaryColor' => '#6366f1'],
            'generated_prompt' => fake()->sentence(),
            'html_content' => '<html><body><h1>Test Page</h1></body></html>',
            'status' => ProjectStatus::Pending,
            'deployment_status' => DeploymentStatus::NotDeployed,
            'project_url' => null,
        ];
    }
}
