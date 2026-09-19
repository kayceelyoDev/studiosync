<?php

use App\Jobs\DeployToVercelJob;
use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->workspace = Workspace::create([
        'user_id' => $this->user->id,
        'name' => 'Design Studio',
        'slug' => Str::slug('Design Studio'),
    ]);

    $this->project = Project::create([
        'workspace_id' => $this->workspace->id,
        'user_id' => $this->user->id,
        'project_name' => 'Oasis Coffee',
        'preferences' => ['layout' => 'Modern'],
        'html_content' => '<!DOCTYPE html><html><body><h1>Oasis Coffee</h1></body></html>',
        'status' => 'completed',
        'deployment_status' => 'not_deployed',
    ]);
});

test('authorized client can trigger deployment with custom subdomain', function () {
    Queue::fake();

    $this->actingAs($this->user);

    $response = $this->postJson(route('projects.deploy', $this->project), [
        'subdomain' => 'oasis-cafe',
    ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'deployment_status' => 'deploying',
        ]);

    expect($this->project->fresh()->deployment_status)->toBe('deploying');

    Queue::assertPushed(DeployToVercelJob::class, function ($job) {
        return $job->projectId === $this->project->id
            && $job->chosenSubdomain === 'oasis-cafe';
    });
});

test('subdomain validation rejects invalid characters', function () {
    Queue::fake();

    $this->actingAs($this->user);

    $response = $this->postJson(route('projects.deploy', $this->project), [
        'subdomain' => 'Oasis Cafe!!',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['subdomain']);

    Queue::assertNotPushed(DeployToVercelJob::class);
});

test('unauthorized user cannot trigger deployment for another user project', function () {
    Queue::fake();

    $stranger = User::factory()->create();
    $this->actingAs($stranger);

    $response = $this->postJson(route('projects.deploy', $this->project), [
        'subdomain' => 'oasis-cafe',
    ]);

    $response->assertForbidden();
    Queue::assertNotPushed(DeployToVercelJob::class);
});

test('deployed project cannot be redeployed and returns 423', function () {
    Queue::fake();

    $this->project->update([
        'deployment_status' => 'deployed',
        'project_url' => 'https://oasis-cafe.vercel.app',
    ]);

    $this->actingAs($this->user);

    $response = $this->postJson(route('projects.deploy', $this->project), [
        'subdomain' => 'oasis-cafe',
    ]);

    $response->assertStatus(423)
        ->assertJson([
            'success' => false,
            'deployment_status' => 'deployed',
        ]);

    Queue::assertNotPushed(DeployToVercelJob::class);
});

test('deployed project cannot be edited and returns 423', function () {
    $this->project->update([
        'deployment_status' => 'deployed',
        'project_url' => 'https://oasis-cafe.vercel.app',
    ]);

    $this->actingAs($this->user);

    $response = $this->putJson(route('projects.update', $this->project), [
        'html_content' => '<!DOCTYPE html><html><body><h1>Hacked</h1></body></html>',
    ]);

    $response->assertStatus(423)
        ->assertJson([
            'success' => false,
        ]);
});

test('status endpoint returns current deployment state and url', function () {
    $this->project->update([
        'deployment_status' => 'deployed',
        'project_url' => 'https://oasis-cafe.vercel.app',
        'vercel_project_name' => 'oasis-cafe',
    ]);

    $this->actingAs($this->user);

    $response = $this->getJson(route('projects.deployment-status', $this->project));

    $response->assertOk()
        ->assertJson([
            'deployment_status' => 'deployed',
            'project_url' => 'https://oasis-cafe.vercel.app',
            'vercel_project_name' => 'oasis-cafe',
            'is_editable' => false,
        ]);
});
