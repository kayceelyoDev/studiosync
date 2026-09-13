<?php

use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

test('authenticated user can view the edit page for their project', function () {
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
        'preferences' => ['Layout: Minimalist & Clean'],
        'html_content' => '<!DOCTYPE html><html><body><header id="nav">Navbar</header><section id="hero"><h1>Welcome</h1></section><footer id="footer">Footer</footer></body></html>',
        'status' => 'completed',
    ]);

    $response = $this->get(route('projects.edit', $project->id));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Project/Edit')
        ->has('project')
        ->where('project.id', $project->id)
        ->where('project.project_name', 'Acme Portfolio')
        ->where('project.html_content', $project->html_content)
    );
});

test('user cannot view the edit page of another users project', function () {
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
        'html_content' => '<section id="hero">Content</section>',
        'status' => 'completed',
    ]);

    $this->actingAs($otherUser);

    $response = $this->get(route('projects.edit', $project->id));

    $response->assertForbidden();
});

test('authenticated user can update their projects html content and name', function () {
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
        'project_name' => 'Original Name',
        'preferences' => [],
        'html_content' => '<section id="hero"><h1>Old Title</h1></section>',
        'status' => 'completed',
    ]);

    $newHtml = '<section id="hero"><h1>New Updated Title</h1><p>Edited Paragraph</p></section>';

    $response = $this->putJson(route('projects.update', $project->id), [
        'html_content' => $newHtml,
        'project_name' => 'Updated Project Name',
    ]);

    $response->assertOk();
    $response->assertJson([
        'success' => true,
        'message' => 'Project saved successfully.',
    ]);

    $project->refresh();
    expect($project->html_content)->toBe($newHtml);
    expect($project->project_name)->toBe('Updated Project Name');
});

test('user cannot update another users project', function () {
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
        'project_name' => 'Original Title',
        'preferences' => [],
        'html_content' => '<section id="hero">Original Content</section>',
        'status' => 'completed',
    ]);

    $this->actingAs($otherUser);

    $response = $this->putJson(route('projects.update', $project->id), [
        'html_content' => '<section id="hero">Hacked Content</section>',
    ]);

    $response->assertForbidden();

    $project->refresh();
    expect($project->html_content)->toBe('<section id="hero">Original Content</section>');
});

test('updating project validates html_content presence', function () {
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
        'project_name' => 'Project',
        'preferences' => [],
        'html_content' => '<section id="hero">Content</section>',
        'status' => 'completed',
    ]);

    $response = $this->putJson(route('projects.update', $project->id), [
        'html_content' => '',
    ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['html_content']);
});

test('guest cannot update a project and is redirected to login', function () {
    $user = User::factory()->create();

    $workspace = Workspace::create([
        'user_id' => $user->id,
        'name' => 'Studio Workspace',
        'slug' => Str::slug('Studio Workspace'),
    ]);

    $project = Project::create([
        'workspace_id' => $workspace->id,
        'user_id' => $user->id,
        'project_name' => 'Original Name',
        'preferences' => [],
        'html_content' => '<section id="hero"><h1>Old Title</h1></section>',
        'status' => 'completed',
    ]);

    $response = $this->put(route('projects.update', $project->id), [
        'html_content' => '<section id="hero"><h1>Guest Attempt</h1></section>',
    ]);

    $response->assertRedirect(route('login'));

    $project->refresh();
    expect($project->html_content)->toBe('<section id="hero"><h1>Old Title</h1></section>');
});

test('project model updateHtmlContent method updates html and optionally name', function () {
    $user = User::factory()->create();

    $workspace = Workspace::create([
        'user_id' => $user->id,
        'name' => 'Studio Workspace',
        'slug' => Str::slug('Studio Workspace'),
    ]);

    $project = Project::create([
        'workspace_id' => $workspace->id,
        'user_id' => $user->id,
        'project_name' => 'Initial Title',
        'preferences' => [],
        'html_content' => '<div>Old</div>',
        'status' => 'completed',
    ]);

    $result = $project->updateHtmlContent('<div>New Content</div>', 'Updated Title');

    expect($result)->toBeTrue();
    $project->refresh();
    expect($project->html_content)->toBe('<div>New Content</div>');
    expect($project->project_name)->toBe('Updated Title');

    // Test updating html without changing name
    $result2 = $project->updateHtmlContent('<div>Even Newer Content</div>');
    expect($result2)->toBeTrue();
    $project->refresh();
    expect($project->html_content)->toBe('<div>Even Newer Content</div>');
    expect($project->project_name)->toBe('Updated Title');
});
