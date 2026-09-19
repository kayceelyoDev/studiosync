<?php

use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

test('authenticated user can view the details page for their project with eager loaded relations', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $workspace = Workspace::create([
        'user_id' => $user->id,
        'name' => 'Studio Workspace',
        'slug' => Str::slug('Studio Workspace'),
    ]);

    $project = Project::create([
        'workspace_id' => $workspace->id,
        'user_id' => $user->id,
        'project_name' => 'Acme Portfolio',
        'preferences' => [
            'Description: Architecture Studio',
            'Layout: Hero-focused Single Page',
            'Color Palette: Ocean Depth (Navy & Aqua)',
            'Typography: Geometric Sans',
            'Content: Hero Section, About Me, Portfolio Gallery, Services, Contact Form',
        ],
        'html_content' => '<!DOCTYPE html><html><body><header id="nav">Navbar</header><section id="hero"><h1>Acme Architecture</h1></section></body></html>',
        'status' => 'completed',
        'deployment_status' => 'deployed',
        'vercel_project_name' => 'acme-architecture',
        'project_url' => 'https://acme-architecture.vercel.app',
    ]);

    $response = $this->get(route('projects.show', $project->id));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Project/Show')
        ->has('project')
        ->where('project.id', $project->id)
        ->where('project.project_name', 'Acme Portfolio')
        ->where('project.deployment_status', 'deployed')
        ->where('project.workspace.id', $workspace->id)
        ->where('project.workspace.name', 'Studio Workspace')
    );
});

test('user cannot view the details page of another users project', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();

    $workspace = Workspace::create([
        'user_id' => $owner->id,
        'name' => 'Owner Workspace',
        'slug' => Str::slug('Owner Workspace'),
    ]);

    $project = Project::create([
        'workspace_id' => $workspace->id,
        'user_id' => $owner->id,
        'project_name' => 'Owner Private Project',
        'preferences' => [],
        'html_content' => '<section>Private</section>',
        'status' => 'completed',
    ]);

    $this->actingAs($otherUser);

    $response = $this->get(route('projects.show', $project->id));

    $response->assertForbidden();
});

test('guest cannot view project details and is redirected to login', function () {
    $user = User::factory()->create();

    $workspace = Workspace::create([
        'user_id' => $user->id,
        'name' => 'Studio Workspace',
        'slug' => Str::slug('Studio Workspace'),
    ]);

    $project = Project::create([
        'workspace_id' => $workspace->id,
        'user_id' => $user->id,
        'project_name' => 'Guest Target Project',
        'preferences' => [],
        'html_content' => '<section>Content</section>',
        'status' => 'completed',
    ]);

    $response = $this->get(route('projects.show', $project->id));

    $response->assertRedirect(route('login'));
});
