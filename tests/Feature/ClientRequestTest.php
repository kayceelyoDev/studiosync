<?php

use App\Enums\RequestCategory;
use App\Enums\RequestStatus;
use App\Models\ClientRequest;
use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeClient(): User
{
    $user = User::factory()->create();
    $user->assignRole('client');

    return $user;
}

function makeAdmin(): User
{
    $user = User::factory()->create();
    $user->assignRole('admin');

    return $user;
}

function makeProjectForUser(User $user): Project
{
    $workspace = Workspace::create([
        'user_id' => $user->id,
        'name' => 'Test Workspace',
        'slug' => 'test-workspace-'.$user->id,
    ]);

    return Project::create([
        'user_id' => $user->id,
        'workspace_id' => $workspace->id,
        'project_name' => 'Test Project',
        'preferences' => ['theme' => 'dark'],
        'status' => 'pending',
    ]);
}

// ─── Client: Index ────────────────────────────────────────────────────────────

test('client can view the requests index page', function () {
    $client = makeClient();

    $this->actingAs($client)
        ->get(route('requests.index'))
        ->assertOk();
});

test('guest is redirected to login from requests index', function () {
    $this->get(route('requests.index'))
        ->assertRedirect(route('login'));
});

// ─── Client: Create ───────────────────────────────────────────────────────────

test('client can view the create request form', function () {
    $client = makeClient();

    $this->actingAs($client)
        ->get(route('requests.create'))
        ->assertOk();
});

// ─── Client: Store ────────────────────────────────────────────────────────────

test('client can submit a service request', function () {
    $client = makeClient();
    $project = makeProjectForUser($client);

    $this->actingAs($client)
        ->post(route('requests.store'), [
            'project_id' => $project->id,
            'category' => RequestCategory::EmailIntegration->value,
            'description' => 'Please set up a contact form that emails us directly.',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('client_requests', [
        'user_id' => $client->id,
        'project_id' => $project->id,
        'category' => RequestCategory::EmailIntegration->value,
        'status' => RequestStatus::Pending->value,
    ]);
});

test('client cannot submit a request for another clients project', function () {
    $client = makeClient();
    $other = makeClient();
    $project = makeProjectForUser($other);

    $this->actingAs($client)
        ->post(route('requests.store'), [
            'project_id' => $project->id,
            'category' => RequestCategory::CustomDomain->value,
            'description' => 'I want to connect a custom domain to my site.',
        ])
        ->assertForbidden();
});

test('client cannot submit a request without a project', function () {
    $client = makeClient();

    $this->actingAs($client)
        ->post(route('requests.store'), [
            'category' => RequestCategory::CustomDomain->value,
            'description' => 'I want a custom domain.',
        ])
        ->assertSessionHasErrors('project_id');
});

test('client cannot submit a request with description shorter than 20 chars', function () {
    $client = makeClient();
    $project = makeProjectForUser($client);

    $this->actingAs($client)
        ->post(route('requests.store'), [
            'project_id' => $project->id,
            'category' => RequestCategory::ChatWidget->value,
            'description' => 'Too short',
        ])
        ->assertSessionHasErrors('description');
});

test('client can attach a file to a request', function () {
    Storage::fake('private');
    $client = makeClient();
    $project = makeProjectForUser($client);
    $file = UploadedFile::fake()->create('brief.pdf', 500, 'application/pdf');

    $this->actingAs($client)
        ->post(route('requests.store'), [
            'project_id' => $project->id,
            'category' => RequestCategory::EcommerceSetup->value,
            'description' => 'Please set up an e-commerce section with PayMongo.',
            'attachment' => $file,
        ])
        ->assertRedirect();

    $requestRecord = ClientRequest::where('user_id', $client->id)->first();
    expect($requestRecord->attachment_path)->not->toBeNull();
});

// ─── Client: Show ─────────────────────────────────────────────────────────────

test('client can view their own request', function () {
    $client = makeClient();
    $project = makeProjectForUser($client);
    $request = ClientRequest::factory()->create([
        'user_id' => $client->id,
        'project_id' => $project->id,
    ]);

    $this->actingAs($client)
        ->get(route('requests.show', $request->id))
        ->assertOk();
});

test('client cannot view another clients request', function () {
    $client = makeClient();
    $other = makeClient();
    $project = makeProjectForUser($other);
    $request = ClientRequest::factory()->create([
        'user_id' => $other->id,
        'project_id' => $project->id,
    ]);

    $this->actingAs($client)
        ->get(route('requests.show', $request->id))
        ->assertForbidden();
});

// ─── Client: Comment ─────────────────────────────────────────────────────────

test('client can comment on their own request', function () {
    $client = makeClient();
    $project = makeProjectForUser($client);
    $request = ClientRequest::factory()->create([
        'user_id' => $client->id,
        'project_id' => $project->id,
    ]);

    $this->actingAs($client)
        ->post(route('requests.comments.store', $request->id), [
            'body' => 'Here is some extra context for the admin.',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('client_request_comments', [
        'client_request_id' => $request->id,
        'user_id' => $client->id,
        'body' => 'Here is some extra context for the admin.',
    ]);
});

// ─── Client: Cancel ──────────────────────────────────────────────────────────

test('client can cancel a pending request', function () {
    $client = makeClient();
    $project = makeProjectForUser($client);
    $request = ClientRequest::factory()->pending()->create([
        'user_id' => $client->id,
        'project_id' => $project->id,
    ]);

    $this->actingAs($client)
        ->delete(route('requests.destroy', $request->id))
        ->assertRedirect(route('requests.index'));

    $this->assertDatabaseHas('client_requests', [
        'id' => $request->id,
        'status' => RequestStatus::Cancelled->value,
    ]);
});

test('client cannot cancel a non-pending request', function () {
    $client = makeClient();
    $project = makeProjectForUser($client);
    $request = ClientRequest::factory()->inProgress()->create([
        'user_id' => $client->id,
        'project_id' => $project->id,
    ]);

    $this->actingAs($client)
        ->delete(route('requests.destroy', $request->id))
        ->assertForbidden();
});

// ─── Admin ────────────────────────────────────────────────────────────────────

test('admin can view the requests index', function () {
    $admin = makeAdmin();

    $this->actingAs($admin)
        ->get(route('admin.requests.index'))
        ->assertOk();
});

test('admin can view a client request detail', function () {
    $client = makeClient();
    $project = makeProjectForUser($client);
    $request = ClientRequest::factory()->create([
        'user_id' => $client->id,
        'project_id' => $project->id,
    ]);

    $admin = makeAdmin();

    $this->actingAs($admin)
        ->get(route('admin.requests.show', $request->id))
        ->assertOk();
});

test('admin can update request status', function () {
    $client = makeClient();
    $project = makeProjectForUser($client);
    $request = ClientRequest::factory()->pending()->create([
        'user_id' => $client->id,
        'project_id' => $project->id,
    ]);

    $admin = makeAdmin();

    $this->actingAs($admin)
        ->put(route('admin.requests.update', $request->id), [
            'status' => RequestStatus::InProgress->value,
            'admin_notes' => 'Starting to work on this now.',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('client_requests', [
        'id' => $request->id,
        'status' => RequestStatus::InProgress->value,
        'admin_id' => $admin->id,
        'admin_notes' => 'Starting to work on this now.',
    ]);
});

test('admin can reply in the comment thread', function () {
    $client = makeClient();
    $project = makeProjectForUser($client);
    $request = ClientRequest::factory()->create([
        'user_id' => $client->id,
        'project_id' => $project->id,
    ]);

    $admin = makeAdmin();

    $this->actingAs($admin)
        ->post(route('admin.requests.comments.store', $request->id), [
            'body' => 'We have started working on your email integration.',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('client_request_comments', [
        'client_request_id' => $request->id,
        'user_id' => $admin->id,
        'body' => 'We have started working on your email integration.',
    ]);
});

test('client can attach a file when adding a comment', function () {
    Storage::fake('public');

    $client = makeClient();
    $project = makeProjectForUser($client);
    $request = ClientRequest::factory()->create([
        'user_id' => $client->id,
        'project_id' => $project->id,
    ]);

    $file = UploadedFile::fake()->image('screenshot.png');

    $this->actingAs($client)
        ->post(route('requests.comments.store', $request->id), [
            'body' => 'Here is a screenshot of the issue',
            'attachment' => $file,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('client_request_comments', [
        'client_request_id' => $request->id,
        'user_id' => $client->id,
        'body' => 'Here is a screenshot of the issue',
    ]);
});

test('admin cannot create a client request via client route', function () {
    $admin = makeAdmin();
    $client = makeClient();
    $project = makeProjectForUser($client);

    $this->actingAs($admin)
        ->post(route('requests.store'), [
            'project_id' => $project->id,
            'category' => RequestCategory::ChatWidget->value,
            'description' => 'Admins should not be allowed to create client requests.',
        ])
        ->assertForbidden();
});

test('client cannot access admin requests index', function () {
    $client = makeClient();

    $this->actingAs($client)
        ->get(route('admin.requests.index'))
        ->assertForbidden();
});

test('requests are returned in FIFO order on admin index', function () {
    $client = makeClient();
    $project = makeProjectForUser($client);

    $first = ClientRequest::factory()->create(['user_id' => $client->id, 'project_id' => $project->id, 'created_at' => now()->subHours(3)]);
    $second = ClientRequest::factory()->create(['user_id' => $client->id, 'project_id' => $project->id, 'created_at' => now()->subHours(1)]);

    $admin = makeAdmin();

    $response = $this->actingAs($admin)
        ->get(route('admin.requests.index'))
        ->assertOk();

    $requests = $response->original?->getData()['page']['props']['requests'] ?? [];
    $ids = array_column($requests, 'id');

    expect($ids[0])->toBe($first->id)
        ->and($ids[1])->toBe($second->id);
});

test('client can submit a request with multiple uploaded assets', function () {
    Storage::fake('private');
    Storage::fake('r2');

    $client = makeClient();
    $project = makeProjectForUser($client);

    $logo = UploadedFile::fake()->image('brand-logo.png');
    $specDoc = UploadedFile::fake()->create('spec.pdf', 100, 'application/pdf');

    $response = $this->actingAs($client)
        ->post(route('requests.store'), [
            'project_id' => $project->id,
            'category' => RequestCategory::EmailIntegration->value,
            'description' => 'Please connect our contact form with auto-response emails.',
            'assets' => [
                [
                    'file' => $logo,
                    'purpose' => 'Logo / Graphic',
                    'description' => 'Main header logo',
                ],
                [
                    'file' => $specDoc,
                    'purpose' => 'Specification Document',
                    'description' => 'Email workflow diagram',
                ],
            ],
        ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('client_requests', [
        'user_id' => $client->id,
        'project_id' => $project->id,
        'category' => RequestCategory::EmailIntegration->value,
    ]);

    $this->assertDatabaseHas('project_assets', [
        'project_id' => $project->id,
        'name' => 'brand-logo.png',
        'type' => 'image',
    ]);

    $this->assertDatabaseHas('project_assets', [
        'project_id' => $project->id,
        'name' => 'spec.pdf',
        'type' => 'other',
    ]);
});
