<?php

use App\Enums\DeploymentStatus;
use App\Enums\RequestCategory;
use App\Enums\RequestStatus;
use App\Models\AssetFolder;
use App\Models\ClientRequest;
use App\Models\Project;
use App\Models\ProjectAsset;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
});

function makeAdminFlowClient(): User
{
    $user = User::factory()->create();
    $user->assignRole('client');

    return $user;
}

function makeAdminFlowAdmin(): User
{
    $user = User::factory()->create();
    $user->assignRole('admin');

    return $user;
}

function makeAdminFlowProject(User $user, array $attributes = []): Project
{
    $workspace = Workspace::create([
        'user_id' => $user->id,
        'name' => 'Workspace '.$user->id,
        'slug' => 'workspace-'.$user->id.'-'.Str::random(5),
    ]);

    return Project::create(array_merge([
        'user_id' => $user->id,
        'workspace_id' => $workspace->id,
        'project_name' => 'Test Project',
        'preferences' => ['theme' => 'dark'],
        'html_content' => '<!DOCTYPE html><html><body><h1>Hello World</h1></body></html>',
        'status' => 'completed',
    ], $attributes));
}

// ─── 1. Admin Dashboard ────────────────────────────────────────────────────────

test('admin can view admin dashboard with kpis, categories, and recent activity', function () {
    $admin = makeAdminFlowAdmin();
    $client = makeAdminFlowClient();
    $project = makeAdminFlowProject($client, [
        'deployment_status' => DeploymentStatus::Deployed,
        'vercel_project_name' => 'client-site',
        'project_url' => 'https://client-site.vercel.app',
    ]);

    ClientRequest::factory()->create([
        'user_id' => $client->id,
        'project_id' => $project->id,
        'category' => RequestCategory::EmailIntegration,
        'status' => RequestStatus::Pending,
        'title' => 'Connect contact emailer',
    ]);

    $response = $this->actingAs($admin)->get(route('admin.dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Admin/Dashboard')
        ->has('metrics')
        ->has('categories')
        ->has('recentRequests')
        ->has('recentDeployments')
        ->where('metrics.total_requests', 1)
        ->where('metrics.open_requests', 1)
        ->where('metrics.deployed_projects', 1)
    );
});

test('client cannot access admin dashboard', function () {
    $client = makeAdminFlowClient();

    $this->actingAs($client)
        ->get(route('admin.dashboard'))
        ->assertForbidden();
});

test('admin visiting /admin redirects to admin.dashboard', function () {
    $admin = makeAdminFlowAdmin();

    $this->actingAs($admin)
        ->get('/admin')
        ->assertRedirect(route('admin.dashboard'));
});

test('admin visiting client /dashboard redirects to admin.dashboard', function () {
    $admin = makeAdminFlowAdmin();

    $this->actingAs($admin)
        ->get(route('dashboard'))
        ->assertRedirect(route('admin.dashboard'));
});

// ─── 2. User Explorer ─────────────────────────────────────────────────────────

test('admin can view users index with search and role filters', function () {
    $admin = makeAdminFlowAdmin();
    $alice = User::factory()->create(['name' => 'Alice Wonder', 'email' => 'alice@example.com']);
    $alice->assignRole('client');
    $bob = User::factory()->create(['name' => 'Bob Builder', 'email' => 'bob@example.com']);
    $bob->assignRole('client');

    $response = $this->actingAs($admin)->get(route('admin.users.index', ['q' => 'Alice']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Admin/Users/Index')
        ->has('users.data', 1)
        ->where('users.data.0.name', 'Alice Wonder')
    );

    // Filter by client role
    $roleResponse = $this->actingAs($admin)->get(route('admin.users.index', ['role' => 'client']));
    $roleResponse->assertOk();
});

test('admin can view user detail with projects and media assets', function () {
    $admin = makeAdminFlowAdmin();
    $client = makeAdminFlowClient();
    $project = makeAdminFlowProject($client, ['project_name' => 'Acme Portfolio']);

    $folder = AssetFolder::create([
        'project_id' => $project->id,
        'name' => 'Uploads',
    ]);

    ProjectAsset::create([
        'project_id' => $project->id,
        'asset_folder_id' => $folder->id,
        'name' => 'hero-banner.png',
        'type' => 'image',
        'path' => 'projects/1/hero.png',
        'disk' => 'r2',
    ]);

    $response = $this->actingAs($admin)->get(route('admin.users.show', $client->id));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Admin/Users/Show')
        ->has('user.projects', 1)
        ->where('user.projects.0.project_name', 'Acme Portfolio')
        ->has('user.projects.0.assets', 1)
        ->where('user.projects.0.assets.0.name', 'hero-banner.png')
    );
});

// ─── 3. Searchable and Paginated Requests ─────────────────────────────────────

test('admin requests index supports server-side search, status and category filtering with pagination', function () {
    $admin = makeAdminFlowAdmin();
    $client = makeAdminFlowClient();
    $project = makeAdminFlowProject($client);

    ClientRequest::factory()->create([
        'user_id' => $client->id,
        'project_id' => $project->id,
        'category' => RequestCategory::EmailIntegration,
        'status' => RequestStatus::Pending,
        'title' => 'Email Form Setup',
    ]);

    ClientRequest::factory()->create([
        'user_id' => $client->id,
        'project_id' => $project->id,
        'category' => RequestCategory::BookingSystem,
        'status' => RequestStatus::Completed,
        'title' => 'Booking Calendar Integration',
    ]);

    // Search query
    $searchResponse = $this->actingAs($admin)->get(route('admin.requests.index', ['q' => 'Email Form']));
    $searchResponse->assertOk();
    $searchResponse->assertInertia(fn ($page) => $page
        ->component('Admin/Requests/Index')
        ->has('requests', 1)
        ->where('requests.0.title', 'Email Form Setup')
        ->has('pagination')
    );

    // Status filter
    $statusResponse = $this->actingAs($admin)->get(route('admin.requests.index', ['status' => 'completed']));
    $statusResponse->assertOk();
    $statusResponse->assertInertia(fn ($page) => $page
        ->has('requests', 1)
        ->where('requests.0.title', 'Booking Calendar Integration')
    );
});

// ─── 4. Admin Website Editing & Real-time Live Preview Authorization ─────────

test('admin can access website editor for another users project', function () {
    $admin = makeAdminFlowAdmin();
    $client = makeAdminFlowClient();
    $project = makeAdminFlowProject($client, ['project_name' => 'Client Secret Site']);

    $response = $this->actingAs($admin)->get(route('projects.edit', $project->id));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Project/Edit')
        ->where('project.id', $project->id)
        ->where('project.project_name', 'Client Secret Site')
    );
});

test('regular client cannot access website editor for another users project', function () {
    $client1 = makeAdminFlowClient();
    $client2 = makeAdminFlowClient();
    $project = makeAdminFlowProject($client1);

    $this->actingAs($client2)
        ->get(route('projects.edit', $project->id))
        ->assertForbidden();
});

test('admin can update html on deployed project while client is locked out', function () {
    $admin = makeAdminFlowAdmin();
    $client = makeAdminFlowClient();
    $project = makeAdminFlowProject($client, [
        'deployment_status' => DeploymentStatus::Deployed,
        'project_url' => 'https://live-client.vercel.app',
    ]);

    // 1. Client attempts to update deployed site -> locked (423)
    $this->actingAs($client)
        ->putJson(route('projects.update', $project->id), [
            'html_content' => '<p>Client attempt</p>',
        ])
        ->assertStatus(423);

    // 2. Admin updates deployed site -> allowed (200)
    $adminResponse = $this->actingAs($admin)
        ->putJson(route('projects.update', $project->id), [
            'html_content' => '<!DOCTYPE html><html><body><h1>Admin Updated HTML</h1></body></html>',
            'project_name' => 'Admin Updated Project',
        ]);

    $adminResponse->assertOk()
        ->assertJson(['success' => true]);

    $this->assertDatabaseHas('projects', [
        'id' => $project->id,
        'html_content' => '<!DOCTYPE html><html><body><h1>Admin Updated HTML</h1></body></html>',
        'project_name' => 'Admin Updated Project',
    ]);
});

// ─── 5. Vercel Deployment Management & Dashboard URL Resolution ──────────────

test('project vercel dashboard url accessor resolves team slug, team id, and fallback correctly', function () {
    $client = makeAdminFlowClient();
    $project = makeAdminFlowProject($client, [
        'vercel_project_name' => 'acme-website-123',
    ]);

    // 1. Team slug configured
    Config::set('services.vercel.team_slug', 'my-agency-team');
    Config::set('services.vercel.team_id', null);
    expect($project->vercel_dashboard_url)->toBe('https://vercel.com/my-agency-team/acme-website-123');

    // 2. Team id configured (no team slug)
    Config::set('services.vercel.team_slug', null);
    Config::set('services.vercel.team_id', 'team_abc123');
    expect($project->vercel_dashboard_url)->toBe('https://vercel.com/team_abc123/acme-website-123');

    // 3. Neither configured -> fallback to personal account (~/)
    Config::set('services.vercel.team_slug', null);
    Config::set('services.vercel.team_id', null);
    expect($project->vercel_dashboard_url)->toBe('https://vercel.com/~/acme-website-123');

    // 4. No vercel_project_name -> returns null
    $project->vercel_project_name = null;
    expect($project->vercel_dashboard_url)->toBeNull();
});

test('admin vercel redirect endpoint routes admin directly to vercel project dashboard', function () {
    Config::set('services.vercel.team_slug', 'my-team');
    $admin = makeAdminFlowAdmin();
    $client = makeAdminFlowClient();
    $project = makeAdminFlowProject($client, [
        'vercel_project_name' => 'awesome-site',
    ]);

    $response = $this->actingAs($admin)->get(route('admin.projects.vercel-redirect', $project->id));

    $response->assertRedirect('https://vercel.com/my-team/awesome-site');
});

test('admin vercel redirect returns error if project has no vercel deployment', function () {
    $admin = makeAdminFlowAdmin();
    $client = makeAdminFlowClient();
    $project = makeAdminFlowProject($client, [
        'vercel_project_name' => null,
    ]);

    $response = $this->actingAs($admin)->get(route('admin.projects.vercel-redirect', $project->id));

    $response->assertRedirect();
    $response->assertSessionHas('error');
});
