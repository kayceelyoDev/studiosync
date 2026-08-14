<?php

use App\Services\GeneratePromptServices;
use App\Ai\Agents\WebpageGenerator;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GenerateAiPromtPage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('WebpageGenerator returns correct instructions', function () {
    $agent = new WebpageGenerator();
    $instructions = (string) $agent->instructions();
    
    expect($instructions)->toContain("You are an elite Prompt Engineer for Web Development.");
});

test('GeneratePromptServices generates and stores prompt', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $service = new GeneratePromptServices();
    
    $data = [
        'project_name' => 'Elena Rodriguez - Fine Art Photography',
        'preferences' => [
            'overall style: high-end, minimalist, editorial feel with a soft beige and charcoal color palette',
            'hero section: full-bleed slider of black-and-white portraits, centered elegant serif text saying "Capturing the Unseen", transparent navigation bar',
            'content sections: 3-column masonry gallery for the portfolio, a short bio section on the left with a portrait on the right, and a minimalist footer with Instagram links',
            'interactions: smooth fade-in animations on scroll, images should gently scale up on hover'
        ]
    ];
    
    $prompt = $service->generatePrompt($data);
    
    // Show the generated prompt in the test output as requested
    dump("========================================");
    dump("Generated Prompt (from Service Test, Realistic Data):");
    dump($prompt);
    dump("========================================");
    
    expect($prompt)->toBeString()->not->toBeEmpty();
    expect(strlen($prompt))->toBeGreaterThan(50);
    
    $this->assertDatabaseHas('workspaces', [
        'user_id' => $user->id,
        'project_name' => 'Elena Rodriguez - Fine Art Photography',
        'status' => 'pending'
    ]);
})->skip(fn () => empty(env('GEMINI_API_KEY')), 'Skipping real LLM test because GEMINI_API_KEY is not set in .env');

test('GenerateAiPromtPage controller returns prompt', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    // Register a temporary route for the controller action
    Route::post('/generate-prompt', [GenerateAiPromtPage::class, 'generatePrompt']);

    $response = $this->postJson('/generate-prompt', [
        'user_id' => $user->id,
        'project_name' => 'Marcus Chen - Indie Game Composer',
        'preferences' => [
            'vibe: cyberpunk aesthetic, deep purple and neon pink colors, retro grid backgrounds',
            'hero section: glowing glitch text reading "Audioscapes for the Future", embedded audio player previewing the latest synthwave track',
            'content: discography list with play buttons, a gear list section styled like a terminal window, and a booking form',
            'typography: monospaced fonts for body text, bold futuristic sans-serif for headings'
        ],
        'status' => 'pending'
    ]);

    $response->assertStatus(200);
    $response->assertJsonStructure(['success', 'message']);
    
    expect($response->json('success'))->toBeTrue();
})->skip(fn () => empty(env('GEMINI_API_KEY')), 'Skipping real LLM test because GEMINI_API_KEY is not set in .env');
