<?php

use App\Exceptions\VercelProjectNameTakenException;
use App\Services\Vercel\VercelClient;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

uses(TestCase::class);

test('buildUrl omits teamId when VERCEL_TEAM_ID is not configured (personal account)', function () {
    $client = new VercelClient(token: 'test_tok', teamId: null, baseUrl: 'https://api.vercel.com');

    $url = $client->buildUrl('/v10/projects');

    expect($url)->toBe('https://api.vercel.com/v10/projects');
    expect($url)->not->toContain('teamId');
});

test('buildUrl includes teamId when VERCEL_TEAM_ID is configured (team account)', function () {
    $client = new VercelClient(token: 'test_tok', teamId: 'team_12345', baseUrl: 'https://api.vercel.com');

    $url = $client->buildUrl('/v10/projects');

    expect($url)->toBe('https://api.vercel.com/v10/projects?teamId=team_12345');
});

test('getProject returns project array when found and null when 404', function () {
    Http::fake([
        'https://api.vercel.com/v9/projects/existing-project' => Http::response(['id' => 'prj_123', 'name' => 'existing-project'], 200),
        'https://api.vercel.com/v9/projects/missing-project' => Http::response(['error' => ['message' => 'not found']], 404),
    ]);

    $client = new VercelClient(token: 'test_tok');

    $existing = $client->getProject('existing-project');
    expect($existing)->toBeArray()
        ->and($existing['id'])->toBe('prj_123');

    $missing = $client->getProject('missing-project');
    expect($missing)->toBeNull();
});

test('createOrGetProject creates project when not existing', function () {
    Http::fake([
        'https://api.vercel.com/v9/projects/new-project' => Http::response(['error' => ['message' => 'not found']], 404),
        'https://api.vercel.com/v10/projects' => Http::response(['id' => 'prj_new_456', 'name' => 'new-project'], 200),
    ]);

    $client = new VercelClient(token: 'test_tok');

    $project = $client->createOrGetProject('new-project');

    expect($project['id'])->toBe('prj_new_456');

    Http::assertSent(function ($request) {
        return $request->url() === 'https://api.vercel.com/v10/projects'
            && $request['name'] === 'new-project'
            && $request['framework'] === null;
    });
});

test('createOrGetProject throws VercelProjectNameTakenException on conflict', function () {
    Http::fake([
        'https://api.vercel.com/v9/projects/taken-project' => Http::response(['error' => ['message' => 'not found']], 404),
        'https://api.vercel.com/v10/projects' => Http::response(['error' => ['message' => 'Project name already exists']], 409),
    ]);

    $client = new VercelClient(token: 'test_tok');

    expect(fn () => $client->createOrGetProject('taken-project'))
        ->toThrow(VercelProjectNameTakenException::class);
});

test('createDeployment sends inlined index.html and vercel.json with security headers', function () {
    Http::fake([
        'https://api.vercel.com/v13/deployments' => Http::response([
            'id' => 'dpl_789',
            'url' => 'my-subdomain.vercel.app',
            'readyState' => 'INITIALIZING',
        ], 200),
    ]);

    $client = new VercelClient(token: 'test_tok');

    $html = '<!DOCTYPE html><html><body><h1>Hello World</h1></body></html>';
    $result = $client->createDeployment('my-subdomain', 'prj_123', $html);

    expect($result['id'])->toBe('dpl_789')
        ->and($result['url'])->toBe('my-subdomain.vercel.app');

    Http::assertSent(function ($request) use ($html) {
        $files = $request['files'] ?? [];
        $hasIndex = collect($files)->contains(fn ($f) => $f['file'] === 'index.html' && $f['data'] === $html);
        $hasVercelJson = collect($files)->contains(fn ($f) => $f['file'] === 'vercel.json' && str_contains($f['data'], 'X-Content-Type-Options'));

        return $request['target'] === 'production'
            && $request['projectSettings']['framework'] === null
            && $hasIndex
            && $hasVercelJson;
    });
});

test('verifyWebhookSignature verifies HMAC-SHA1 signature accurately', function () {
    $secret = 'super_secret_webhook_key';
    $client = new VercelClient(webhookSecret: $secret);

    $rawPayload = json_encode(['type' => 'deployment.succeeded', 'payload' => ['id' => 'dpl_1']]);
    $validSignature = hash_hmac('sha1', $rawPayload, $secret);

    expect($client->verifyWebhookSignature($rawPayload, $validSignature))->toBeTrue();
    expect($client->verifyWebhookSignature($rawPayload, 'invalid_signature'))->toBeFalse();
    expect($client->verifyWebhookSignature($rawPayload, null))->toBeFalse();
});
