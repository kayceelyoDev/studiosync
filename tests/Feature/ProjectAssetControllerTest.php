<?php

use App\Models\AssetFolder;
use App\Models\Project;
use App\Models\ProjectAsset;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('r2');
    Config::set('filesystems.disks.r2.url', 'https://pub-test.r2.dev');
});

function createTestAsset(Project $project, array $attributes = []): ProjectAsset
{
    $folder = AssetFolder::firstOrCreate([
        'project_id' => $project->id,
        'name' => 'Uploads',
    ]);

    return ProjectAsset::create(array_merge([
        'project_id' => $project->id,
        'asset_folder_id' => $folder->id,
        'name' => 'sample.png',
        'path' => 'projects/'.$project->id.'/assets/sample.png',
        'disk' => 'r2',
    ], $attributes));
}

test('user can list their project assets', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $workspace = Workspace::create([
        'user_id' => $user->id,
        'name' => 'Studio',
        'slug' => Str::slug('Studio'),
    ]);

    $project = Project::create([
        'workspace_id' => $workspace->id,
        'user_id' => $user->id,
        'project_name' => 'Portfolio Site',
        'preferences' => ['Vibe: Modern'],
        'status' => 'completed',
    ]);

    $asset = createTestAsset($project, [
        'name' => 'hero.jpg',
        'description' => '[Section: Hero Section] Hero Banner',
        'path' => 'projects/'.$project->id.'/assets/hero.jpg',
    ]);

    $response = $this->getJson(route('projects.assets.index', $project));

    $response->assertStatus(200);
    $response->assertJson(['success' => true]);
    expect($response->json('assets'))->toHaveCount(1)
        ->and($response->json('assets.0.name'))->toBe('hero.jpg')
        ->and($response->json('assets.0.url'))->toBe(Storage::disk('r2')->url($asset->path));
});

test('user can upload a new asset to cloudflare r2', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $workspace = Workspace::create([
        'user_id' => $user->id,
        'name' => 'Studio',
        'slug' => Str::slug('Studio'),
    ]);

    $project = Project::create([
        'workspace_id' => $workspace->id,
        'user_id' => $user->id,
        'project_name' => 'Design Project',
        'preferences' => ['Vibe: Modern'],
        'status' => 'completed',
    ]);

    $file = UploadedFile::fake()->image('profile-headshot.png', 800, 800)->size(1500); // 1.5MB

    $response = $this->post(route('projects.assets.store', $project), [
        'file' => $file,
        'section' => 'About Us',
        'purpose' => 'Founder Headshot',
        'description' => 'Founder portrait on studio gray background',
    ], ['Accept' => 'application/json']);

    $response->assertStatus(201);
    $response->assertJson(['success' => true]);

    $asset = ProjectAsset::where('project_id', $project->id)->first();
    expect($asset)->not->toBeNull()
        ->and($asset->name)->toBe('profile-headshot.png')
        ->and($asset->description)->toContain('About Us')
        ->and($asset->description)->toContain('Founder Headshot')
        ->and(Storage::disk('r2')->exists($asset->path))->toBeTrue();
});

test('upload rejects files exceeding 10mb limit', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $workspace = Workspace::create([
        'user_id' => $user->id,
        'name' => 'Studio',
        'slug' => Str::slug('Studio'),
    ]);

    $project = Project::create([
        'workspace_id' => $workspace->id,
        'user_id' => $user->id,
        'project_name' => 'Heavy Project',
        'preferences' => ['Vibe: Modern'],
        'status' => 'completed',
    ]);

    $hugeFile = UploadedFile::fake()->create('heavy-file.png', 10241, 'image/png');

    $response = $this->post(route('projects.assets.store', $project), [
        'file' => $hugeFile,
    ], ['Accept' => 'application/json']);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['file']);
    expect($response->json('errors.file.0'))->toContain('10MB');
});

test('user can replace an existing asset file and previous file is deleted from r2 for storage efficiency', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $workspace = Workspace::create([
        'user_id' => $user->id,
        'name' => 'Studio',
        'slug' => Str::slug('Studio'),
    ]);

    $project = Project::create([
        'workspace_id' => $workspace->id,
        'user_id' => $user->id,
        'project_name' => 'Studio Brand',
        'preferences' => ['Vibe: Modern'],
        'status' => 'completed',
    ]);

    // Initial file upload
    $initialFile = UploadedFile::fake()->image('old-logo.png', 300, 300);
    $oldPath = $initialFile->store("projects/{$project->id}/assets", 'r2');

    $asset = createTestAsset($project, [
        'name' => 'old-logo.png',
        'description' => '[Section: Brand & Navigation] Old Brand Logo',
        'path' => $oldPath,
    ]);

    expect(Storage::disk('r2')->exists($oldPath))->toBeTrue();

    // Replacement file upload
    $newFile = UploadedFile::fake()->image('new-vector-logo.png', 500, 500);

    $response = $this->post(route('projects.assets.replace', [$project, $asset]), [
        'file' => $newFile,
    ], ['Accept' => 'application/json']);

    $response->assertStatus(200);
    $response->assertJson(['success' => true]);

    $asset->refresh();
    expect($asset->name)->toBe('new-vector-logo.png');

    // Verify the NEW file exists on Cloudflare R2
    expect(Storage::disk('r2')->exists($asset->path))->toBeTrue();

    // Verify the OLD file was deleted from Cloudflare R2 to optimize storage
    expect(Storage::disk('r2')->exists($oldPath))->toBeFalse();
});

test('user can update asset metadata', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $workspace = Workspace::create([
        'user_id' => $user->id,
        'name' => 'Studio',
        'slug' => Str::slug('Studio'),
    ]);

    $project = Project::create([
        'workspace_id' => $workspace->id,
        'user_id' => $user->id,
        'project_name' => 'Meta Project',
        'preferences' => ['Vibe: Modern'],
        'status' => 'completed',
    ]);

    $asset = createTestAsset($project, [
        'name' => 'photo.jpg',
        'description' => 'Original description',
        'path' => 'projects/'.$project->id.'/assets/photo.jpg',
    ]);

    $response = $this->patchJson(route('projects.assets.update', [$project, $asset]), [
        'name' => 'updated-photo.jpg',
        'description' => 'Updated high-res hero photo',
    ]);

    $response->assertStatus(200);
    $asset->refresh();

    expect($asset->name)->toBe('updated-photo.jpg')
        ->and($asset->description)->toBe('Updated high-res hero photo');
});

test('user can delete an asset from r2 and database', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $workspace = Workspace::create([
        'user_id' => $user->id,
        'name' => 'Studio',
        'slug' => Str::slug('Studio'),
    ]);

    $project = Project::create([
        'workspace_id' => $workspace->id,
        'user_id' => $user->id,
        'project_name' => 'Delete Project',
        'preferences' => ['Vibe: Modern'],
        'status' => 'completed',
    ]);

    $file = UploadedFile::fake()->image('to-delete.png', 200, 200);
    $path = $file->store("projects/{$project->id}/assets", 'r2');

    $asset = createTestAsset($project, [
        'name' => 'to-delete.png',
        'path' => $path,
    ]);

    expect(Storage::disk('r2')->exists($path))->toBeTrue();

    $response = $this->deleteJson(route('projects.assets.destroy', [$project, $asset]));

    $response->assertStatus(200);

    // Verify removed from R2
    expect(Storage::disk('r2')->exists($path))->toBeFalse();

    // Verify removed from DB
    expect(ProjectAsset::find($asset->id))->toBeNull();
});

test('user cannot access or modify another users project assets', function () {
    $owner = User::factory()->create();
    $attacker = User::factory()->create();

    $workspace = Workspace::create([
        'user_id' => $owner->id,
        'name' => 'Owner Studio',
        'slug' => Str::slug('Owner Studio'),
    ]);

    $project = Project::create([
        'workspace_id' => $workspace->id,
        'user_id' => $owner->id,
        'project_name' => 'Private Project',
        'preferences' => ['Vibe: Modern'],
        'status' => 'completed',
    ]);

    $asset = createTestAsset($project, [
        'name' => 'secret.png',
        'path' => 'projects/'.$project->id.'/assets/secret.png',
    ]);

    $this->actingAs($attacker);

    $this->getJson(route('projects.assets.index', $project))->assertStatus(403);
    $this->postJson(route('projects.assets.store', $project))->assertStatus(403);
    $this->patchJson(route('projects.assets.update', [$project, $asset]), ['name' => 'hacked'])->assertStatus(403);
    $this->deleteJson(route('projects.assets.destroy', [$project, $asset]))->assertStatus(403);
});

test('user can upload a new asset using image field key', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $workspace = Workspace::create([
        'user_id' => $user->id,
        'name' => 'Studio',
        'slug' => Str::slug('Studio'),
    ]);

    $project = Project::create([
        'workspace_id' => $workspace->id,
        'user_id' => $user->id,
        'project_name' => 'Design Project With Image Key',
        'preferences' => ['Vibe: Modern'],
        'status' => 'completed',
    ]);

    $file = UploadedFile::fake()->image('banner.png', 800, 400)->size(1200);

    $response = $this->post(route('projects.assets.store', $project), [
        'image' => $file,
        'name' => 'Custom Banner Name',
        'description' => 'A custom banner description',
    ], ['Accept' => 'application/json']);

    $response->assertStatus(201);
    $response->assertJson(['success' => true]);

    $asset = ProjectAsset::where('project_id', $project->id)->first();
    expect($asset)->not->toBeNull()
        ->and($asset->name)->toBe('Custom Banner Name')
        ->and($asset->description)->toBe('A custom banner description')
        ->and(Storage::disk('r2')->exists($asset->path))->toBeTrue();
});

test('user can replace an existing asset file using image field key', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $workspace = Workspace::create([
        'user_id' => $user->id,
        'name' => 'Studio',
        'slug' => Str::slug('Studio'),
    ]);

    $project = Project::create([
        'workspace_id' => $workspace->id,
        'user_id' => $user->id,
        'project_name' => 'Studio Brand Image Key',
        'preferences' => ['Vibe: Modern'],
        'status' => 'completed',
    ]);

    $initialFile = UploadedFile::fake()->image('old-pic.png', 300, 300);
    $oldPath = $initialFile->store("projects/{$project->id}/assets", 'r2');

    $asset = createTestAsset($project, [
        'name' => 'old-pic.png',
        'path' => $oldPath,
    ]);

    $newFile = UploadedFile::fake()->image('new-pic.png', 500, 500);

    $response = $this->post(route('projects.assets.replace', [$project, $asset]), [
        'image' => $newFile,
    ], ['Accept' => 'application/json']);

    $response->assertStatus(200);
    $response->assertJson(['success' => true]);

    $asset->refresh();
    expect($asset->name)->toBe('new-pic.png');
    expect(Storage::disk('r2')->exists($asset->path))->toBeTrue();
    expect(Storage::disk('r2')->exists($oldPath))->toBeFalse();
});
