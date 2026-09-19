<?php

use App\Models\Deployment;
use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function () {
    config()->set('services.vercel.webhook_secret', 'secret_webhook_123');

    $this->user = User::factory()->create();
    $this->workspace = Workspace::create([
        'user_id' => $this->user->id,
        'name' => 'Studio Sync',
        'slug' => Str::slug('Studio Sync'),
    ]);

    $this->project = Project::create([
        'workspace_id' => $this->workspace->id,
        'user_id' => $this->user->id,
        'project_name' => 'Cafe Luna',
        'preferences' => ['layout' => 'Modern'],
        'html_content' => '<!DOCTYPE html><html><body><h1>Cafe Luna</h1></body></html>',
        'status' => 'completed',
        'deployment_status' => 'deploying',
        'vercel_project_name' => 'cafe-luna',
    ]);

    $this->deployment = Deployment::create([
        'project_id' => $this->project->id,
        'user_id' => $this->user->id,
        'vercel_deployment_id' => 'dpl_webhook_test_1',
        'vercel_project_id' => 'prj_cafe_luna',
        'status' => 'building',
    ]);
});

test('webhook rejects invalid signature with 401', function () {
    $payload = json_encode(['type' => 'deployment.succeeded', 'payload' => ['deployment' => ['id' => 'dpl_webhook_test_1']]]);

    $response = $this->call(
        'POST',
        '/api/webhooks/vercel',
        [],
        [],
        [],
        ['HTTP_X_VERCEL_SIGNATURE' => 'wrong_signature', 'CONTENT_TYPE' => 'application/json'],
        $payload
    );

    $response->assertStatus(401);
});

test('webhook handles deployment.succeeded event and marks project as deployed', function () {
    $secret = 'secret_webhook_123';
    $rawPayload = json_encode([
        'type' => 'deployment.succeeded',
        'payload' => [
            'deployment' => [
                'id' => 'dpl_webhook_test_1',
                'url' => 'cafe-luna.vercel.app',
            ],
        ],
    ]);

    $signature = hash_hmac('sha1', $rawPayload, $secret);

    $response = $this->call(
        'POST',
        '/api/webhooks/vercel',
        [],
        [],
        [],
        ['HTTP_X_VERCEL_SIGNATURE' => $signature, 'CONTENT_TYPE' => 'application/json'],
        $rawPayload
    );

    $response->assertOk()
        ->assertJson(['received' => true, 'action' => 'marked_ready']);

    expect($this->deployment->fresh()->status)->toBe('ready')
        ->and($this->deployment->fresh()->url)->toBe('https://cafe-luna.vercel.app');

    expect($this->project->fresh()->deployment_status)->toBe('deployed')
        ->and($this->project->fresh()->status)->toBe('deployed')
        ->and($this->project->fresh()->project_url)->toBe('https://cafe-luna.vercel.app');
});

test('webhook handles deployment.error event and marks project as failed', function () {
    $secret = 'secret_webhook_123';
    $rawPayload = json_encode([
        'type' => 'deployment.error',
        'payload' => [
            'deployment' => [
                'id' => 'dpl_webhook_test_1',
                'errorMessage' => 'Build limit reached',
            ],
        ],
    ]);

    $signature = hash_hmac('sha1', $rawPayload, $secret);

    $response = $this->call(
        'POST',
        '/api/webhooks/vercel',
        [],
        [],
        [],
        ['HTTP_X_VERCEL_SIGNATURE' => $signature, 'CONTENT_TYPE' => 'application/json'],
        $rawPayload
    );

    $response->assertOk()
        ->assertJson(['received' => true, 'action' => 'marked_failed']);

    expect($this->deployment->fresh()->status)->toBe('error')
        ->and($this->deployment->fresh()->error_message)->toBe('Build limit reached');

    expect($this->project->fresh()->deployment_status)->toBe('failed');
});
