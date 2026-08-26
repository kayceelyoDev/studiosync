<?php

use App\Ai\Agents\WebpageGenerator;
use App\Ai\Agents\WebsiteSpecArchitect;
use App\Http\Controllers\GenerateAiPromtPage;
use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;
use App\Services\GeneratePromptServices;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

test('WebpageGenerator returns correct instructions', function () {
    $agent = new WebpageGenerator;
    $instructions = (string) $agent->instructions();

    expect($instructions)->toContain('Senior Frontend Developer')
        ->toContain('COMPONENT MODE')
        ->toContain('FULL PAGE MODE');
});

test('WebsiteSpecArchitect returns structured output instructions', function () {
    $agent = new WebsiteSpecArchitect;
    $instructions = (string) $agent->instructions();

    expect($instructions)
        ->toContain('website specification architect')
        ->toContain('structured JSON specification');
});

test('GeneratePromptServices generates and stores prompt', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $workspace = Workspace::create([
        'user_id' => $user->id,
        'name' => 'Test Workspace',
        'slug' => Str::slug('Test Workspace'),
    ]);

    $project = Project::create([
        'workspace_id' => $workspace->id,
        'user_id' => $user->id,
        'project_name' => 'Elena Rodriguez - Fine Art Photography',
        'preferences' => [
            'overall style: high-end, minimalist, editorial feel with a soft beige and charcoal color palette',
            'hero section: full-bleed slider of black-and-white portraits, centered elegant serif text saying "Capturing the Unseen", transparent navigation bar',
            'content sections: 3-column masonry gallery for the portfolio, a short bio section on the left with a portrait on the right, and a minimalist footer with Instagram links',
            'interactions: smooth fade-in animations on scroll, images should gently scale up on hover',
        ],
        'status' => 'pending',
    ]);

    $service = new GeneratePromptServices;
    $service->generatePrompt($project);
    $project->refresh();
    $prompt = $project->generated_prompt;

    // Show the generated prompt in the test output as requested
    dump('========================================');
    dump('Generated Prompt (from Service Test, Realistic Data):');
    dump($prompt);
    dump('========================================');

    expect($project)->toBeInstanceOf(Project::class);
    expect($prompt)->toBeString()->not->toBeEmpty();
    expect(strlen($prompt))->toBeGreaterThan(50);

    $this->assertDatabaseHas('projects', [
        'user_id' => $user->id,
        'project_name' => 'Elena Rodriguez - Fine Art Photography',
        'status' => 'generating_html',
    ]);
})->skip(fn () => empty(env('GEMINI_API_KEY')), 'Skipping real LLM test because GEMINI_API_KEY is not set in .env');

test('GenerateAiPromtPage controller returns prompt', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $workspace = Workspace::create([
        'user_id' => $user->id,
        'name' => 'My Workspace',
        'slug' => Str::slug('My Workspace'),
    ]);

    // Register a temporary route for the controller action
    Route::post('/generate-prompt', [GenerateAiPromtPage::class, 'generatePrompt']);

    $response = $this->postJson('/generate-prompt', [
        'workspace_id' => $workspace->id,
        'project_name' => 'Marcus Chen - Indie Game Composer',
        'preferences' => [
            'vibe: cyberpunk aesthetic, deep purple and neon pink colors, retro grid backgrounds',
            'hero section: glowing glitch text reading "Audioscapes for the Future", embedded audio player previewing the latest synthwave track',
            'content: discography list with play buttons, a gear list section styled like a terminal window, and a booking form',
            'typography: monospaced fonts for body text, bold futuristic sans-serif for headings',
        ],
    ]);

    $response->assertStatus(200);
    $response->assertJsonStructure(['success', 'message']);

    expect($response->json('success'))->toBeTrue();
})->skip(fn () => empty(env('GEMINI_API_KEY')), 'Skipping real LLM test because GEMINI_API_KEY is not set in .env');

test('GeneratePromptServices validateSection detects structure and color errors', function () {
    $service = new GeneratePromptServices;
    $reflection = new ReflectionMethod(GeneratePromptServices::class, 'validateSection');

    $section = ['id' => 'hero', 'type' => 'hero', 'priority' => 1];
    $theme = [
        'colorRoles' => [
            'primary' => '#ff0000',
            'secondary' => '#00ff00',
            'background' => '#ffffff',
            'surface' => '#eeeeee',
            'text' => '#000000',
            'textMuted' => '#777777',
        ],
        'typeScale' => 'standard',
        'layoutStyle' => 'Minimalist & Clean',
    ];

    // Good HTML
    $goodHtml = '<section id="hero" style="background-color: #ffffff; color: #000000;">Hello</section>';
    $result = $reflection->invoke($service, $goodHtml, $section, $theme);
    expect($result['passed'])->toBeTrue();
    expect($result['errors'])->toBeEmpty();

    // Bad HTML (bad structure)
    $badStructure = '<div>Hello</div><script></script>';
    $result = $reflection->invoke($service, $badStructure, $section, $theme);
    expect($result['passed'])->toBeTrue(); // div is allowed

    $badStructure2 = 'Hello World <section></section>';
    $result = $reflection->invoke($service, $badStructure2, $section, $theme);
    expect($result['passed'])->toBeFalse();
    expect($result['errors'][0])->toContain('wrapped in a single semantic HTML element');

    // Bad HTML (rogue colors)
    $badColors = '<section style="color: #ff00ff; border-color: #123456;">Hello</section>';
    $result = $reflection->invoke($service, $badColors, $section, $theme);
    expect($result['passed'])->toBeFalse();
    expect($result['errors'][0])->toContain('Found colors not in the design system: #ff00ff, #123456');

    // Bad HTML (low contrast)
    $badContrastTheme = $theme;
    $badContrastTheme['colorRoles']['text'] = '#cccccc'; // Light gray on white

    // HTML without inline colors to avoid the "rogue colors" error
    $plainHtml = '<section id="hero">Hello</section>';
    $result = $reflection->invoke($service, $plainHtml, $section, $badContrastTheme);
    expect($result['passed'])->toBeFalse();
    expect($result['errors'][0])->toContain('contrast ratio');
});

test('GeneratePromptServices assembleSections injects CSS variables', function () {
    $service = new GeneratePromptServices;
    $reflection = new ReflectionMethod(GeneratePromptServices::class, 'assembleSections');

    $htmlParts = [
        '<nav id="nav">Nav</nav>',
        '<section id="hero">Hero</section>',
    ];
    $spec = [
        'theme' => [
            'colorRoles' => [
                'primary' => '#ff0000',
                'secondary' => '#00ff00',
                'background' => '#ffffff',
                'surface' => '#eeeeee',
                'text' => '#000000',
                'textMuted' => '#777777',
            ],
            'layoutStyle' => 'Bento Box UI',
        ],
        'sections' => [
            ['id' => 'nav', 'type' => 'nav', 'priority' => 1],
            ['id' => 'hero', 'type' => 'hero', 'priority' => 2],
        ],
    ];
    $parsed = ['typography' => 'Modern Sans-Serif (Clean, Tech)'];

    $result = $reflection->invoke($service, $htmlParts, $spec, $parsed, 'Test Project');

    expect($result)
        ->toContain('<!DOCTYPE html>')
        ->toContain('--color-primary: #ff0000;')
        ->toContain('--color-text-muted: #777777;')
        ->toContain('data-layout="bento"')
        ->toContain('data-bento-grid');
});
