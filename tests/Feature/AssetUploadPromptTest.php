<?php

use App\Jobs\GenerateWebsiteJob;
use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;
use App\Services\GeneratePromptServices;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

test('user can upload section-tagged assets which are stored in r2 and linked to project', function () {
    Storage::fake('r2');
    Queue::fake();
    Config::set('filesystems.disks.r2.url', 'https://pub-test.r2.dev');

    $user = User::factory()->create();
    $this->actingAs($user);

    $workspace = Workspace::create([
        'user_id' => $user->id,
        'name' => 'Design Studio',
        'slug' => Str::slug('Design Studio'),
    ]);

    $heroFile = UploadedFile::fake()->image('hero-banner.jpg', 1200, 800)->size(2048); // 2MB
    $logoFile = UploadedFile::fake()->image('logo.png', 400, 400)->size(512); // 512KB

    $response = $this->post(route('generate-prompt.store'), [
        'workspace_id' => $workspace->id,
        'project_name' => 'Apex Agency',
        'preferences' => [
            'Vibe: Modern Minimalist',
            'Hero: Next-Gen Digital Experiences',
            'Content: Hero Section, About Us, Contact / Form',
        ],
        'assets' => [
            [
                'file' => $heroFile,
                'section' => 'Hero Section',
                'purpose' => 'Hero Background',
                'description' => 'Dark sleek gradient hero graphic',
            ],
            [
                'file' => $logoFile,
                'section' => 'Brand & Navigation',
                'purpose' => 'Brand Logo',
                'description' => 'Clean vector white logo for header',
            ],
        ],
    ], ['Accept' => 'application/json']);

    $response->assertStatus(200);
    $response->assertJson(['success' => true]);

    $project = Project::where('user_id', $user->id)->where('project_name', 'Apex Agency')->first();
    expect($project)->not->toBeNull();

    // Check project assets created in DB
    $assets = $project->projectAssets;
    expect($assets)->toHaveCount(2);

    $heroAsset = $assets->firstWhere('name', 'hero-banner.jpg');
    expect($heroAsset)->not->toBeNull()
        ->and($heroAsset->description)->toContain('Hero Section')
        ->and($heroAsset->description)->toContain('Hero Background')
        ->and($heroAsset->description)->toContain('Dark sleek gradient hero graphic')
        ->and($heroAsset->disk)->toBe('r2');

    // Verify storage on fake R2
    expect(Storage::disk('r2')->exists($heroAsset->path))->toBeTrue();

    $logoAsset = $assets->firstWhere('name', 'logo.png');
    expect($logoAsset)->not->toBeNull()
        ->and($logoAsset->description)->toContain('Brand & Navigation')
        ->and($logoAsset->description)->toContain('Brand Logo')
        ->and($logoAsset->url)->toBe(Storage::disk('r2')->url($logoAsset->path));

    expect(Storage::disk('r2')->exists($logoAsset->path))->toBeTrue();

    // Verify GenerateWebsiteJob was dispatched
    Queue::assertPushed(GenerateWebsiteJob::class, function ($job) use ($project) {
        return $job->project->id === $project->id;
    });
});

test('asset upload rejects files exceeding 10mb limit', function () {
    Storage::fake('r2');
    Queue::fake();

    $user = User::factory()->create();
    $this->actingAs($user);

    $workspace = Workspace::create([
        'user_id' => $user->id,
        'name' => 'Studio Workspace',
        'slug' => Str::slug('Studio Workspace'),
    ]);

    // Create file over 10MB (10241 KB)
    $hugeFile = UploadedFile::fake()->create('huge-image.jpg', 10241, 'image/jpeg');

    $response = $this->postJson(route('generate-prompt.store'), [
        'workspace_id' => $workspace->id,
        'project_name' => 'Heavy Project',
        'preferences' => ['Vibe: Heavy media gallery'],
        'assets' => [
            [
                'file' => $hugeFile,
                'section' => 'Gallery Section',
                'purpose' => 'Gallery Item',
            ],
        ],
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['assets.0.file']);
    expect($response->json('errors')['assets.0.file'][0])->toContain('10MB');
});

test('user can specify custom purpose with other option', function () {
    Storage::fake('r2');
    Queue::fake();

    $user = User::factory()->create();
    $this->actingAs($user);

    $workspace = Workspace::create([
        'user_id' => $user->id,
        'name' => 'Studio Workspace 2',
        'slug' => Str::slug('Studio Workspace 2'),
    ]);

    $customFile = UploadedFile::fake()->image('custom-diagram.png', 500, 500);

    $response = $this->post(route('generate-prompt.store'), [
        'workspace_id' => $workspace->id,
        'project_name' => 'Custom Purpose Project',
        'preferences' => ['Vibe: Technical architecture diagram'],
        'assets' => [
            [
                'file' => $customFile,
                'section' => 'Features / Services',
                'purpose' => 'Other',
                'custom_purpose' => 'Interactive Architecture Diagram',
                'description' => 'Blueprint diagram illustrating system architecture',
            ],
        ],
    ], ['Accept' => 'application/json']);

    $response->assertStatus(200);

    $project = Project::where('project_name', 'Custom Purpose Project')->first();
    $asset = $project->projectAssets->first();

    expect($asset)->not->toBeNull()
        ->and($asset->name)->toBe('custom-diagram.png')
        ->and($asset->description)->toContain('Interactive Architecture Diagram')
        ->and($asset->description)->toContain('Blueprint diagram illustrating system architecture');
});

test('GeneratePromptServices injects asset public URLs into section prompt', function () {
    $service = new GeneratePromptServices;

    $reflection = new ReflectionMethod(GeneratePromptServices::class, 'buildSectionPrompt');

    $section = [
        'id' => 'hero',
        'type' => 'hero',
        'name' => 'Hero Section',
        'priority' => 1,
    ];

    $parsed = [
        'typography' => 'Modern Sans-Serif (Clean, Tech)',
        'assets' => [
            [
                'name' => 'hero-banner.jpg',
                'section' => 'Hero Section',
                'purpose' => 'Hero Background',
                'custom_purpose' => null,
                'description' => 'Panoramic night city lights with neon tint',
                'url' => 'https://pub-test.r2.dev/projects/1/hero-banner.jpg',
            ],
            [
                'name' => 'pricing-icon.png',
                'section' => 'Pricing Section',
                'purpose' => 'Plan Icon',
                'custom_purpose' => null,
                'description' => 'Gold badge icon for premium plan',
                'url' => 'https://pub-test.r2.dev/projects/1/pricing-icon.png',
            ],
        ],
    ];

    $spec = [
        'siteType' => 'portfolio',
        'sections' => [
            ['id' => 'hero', 'type' => 'hero', 'priority' => 1],
            ['id' => 'pricing', 'type' => 'pricing', 'priority' => 2],
        ],
        'theme' => [
            'colorRoles' => [
                'primary' => '#3b82f6',
                'secondary' => '#1e293b',
                'background' => '#0f172a',
                'surface' => '#1e293b',
                'text' => '#f8fafc',
                'textMuted' => '#94a3b8',
            ],
            'typeScale' => 'standard',
            'layoutStyle' => 'Clean',
        ],
        'copy' => [
            ['sectionId' => 'hero', 'text' => 'Innovate Faster'],
        ],
    ];

    $prompt = $reflection->invoke($service, $section, $spec, $parsed);

    // Verify the hero asset is injected with description and public URL
    expect($prompt)
        ->toContain('USER-PROVIDED ASSETS FOR THIS SECTION (MANDATORY TO USE):')
        ->toContain('Panoramic night city lights with neon tint')
        ->toContain('https://pub-test.r2.dev/projects/1/hero-banner.jpg')
        ->toContain('Embed using `<img src="https://pub-test.r2.dev/projects/1/hero-banner.jpg"')
        // Verify pricing icon is NOT injected into hero section
        ->not->toContain('https://pub-test.r2.dev/projects/1/pricing-icon.png');
});
