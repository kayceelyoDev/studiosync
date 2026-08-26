<?php

use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;
use App\Services\GeneratePromptServices;
use App\Support\WebsitePreferenceRules;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('all frontend layout options have backend layout instructions', function () {
    foreach (WebsitePreferenceRules::LAYOUTS as $layout) {
        $instructions = WebsitePreferenceRules::getLayoutInstructions($layout);

        expect($instructions)->toBeString()
            ->not->toBeEmpty()
            ->toContain('ABSOLUTE RULE');
    }
});

test('all layout options have unique page architecture contracts', function () {
    $markers = [
        'minimalist',
        'grid-masonry',
        'split-screen',
        'cinematic',
        'bento',
        'cyberpunk',
        'hero-focused',
        'horizontal-scroll',
        'neumorphism',
    ];

    foreach (WebsitePreferenceRules::LAYOUTS as $index => $layout) {
        expect(WebsitePreferenceRules::getLayoutArchitecture($layout))
            ->toContain('data-layout="'.$markers[$index].'"');
    }
});

test('all frontend color palettes have backend color instructions', function () {
    foreach (WebsitePreferenceRules::COLOR_PALETTES as $palette) {
        $instructions = WebsitePreferenceRules::getColorPaletteInstructions($palette);

        expect($instructions)->toBeString()->not->toBeEmpty();
    }
});

test('all frontend typography styles have backend typography instructions', function () {
    foreach (WebsitePreferenceRules::TYPOGRAPHY_STYLES as $typography) {
        $instructions = WebsitePreferenceRules::getTypographyInstructions($typography);

        expect($instructions)->toBeString()
            ->not->toBeEmpty()
            ->toContain('Google Font');
    }
});

test('typography styles map to distinct icon instructions', function () {
    $elegantIcons = WebsitePreferenceRules::getIconInstructions('Elegant Serif (Classic, Luxury)');
    $modernIcons = WebsitePreferenceRules::getIconInstructions('Modern Sans-Serif (Clean, Tech)');
    $brutalistIcons = WebsitePreferenceRules::getIconInstructions('Bold & Brutalist (Large, High-impact)');
    $monoIcons = WebsitePreferenceRules::getIconInstructions('Monospaced (Developer, Retro)');

    expect($elegantIcons)->toContain('thin-line');
    expect($modernIcons)->toContain('clean modern outline')
        ->not->toContain('thin-line');
    expect($brutalistIcons)->toContain('solid-fill');
    expect($monoIcons)->toContain('geometric');
    expect($elegantIcons)->not->toBe($brutalistIcons);
});

test('responsive rules include overflow and mobile grid requirements', function () {
    $rules = WebsitePreferenceRules::getResponsiveRules();

    expect($rules)
        ->toContain('overflow-x-hidden')
        ->toContain('grid-cols-1')
        ->toContain('break-words')
        ->toContain('375px');
});

test('mobile nav template forbids hidden toggle pattern', function () {
    $template = WebsitePreferenceRules::getMobileNavTemplate();

    expect($template)
        ->toContain('max-h-0 opacity-0')
        ->toContain('max-h-screen opacity-100')
        ->toContain('NEVER toggle `hidden`')
        ->toContain('menu-toggle');
});

test('buildHtmlGenerationConstraints includes all preference dimensions', function () {
    $parsed = [
        'contentSections' => 'Hero Section About Me Portfolio Gallery',
        'layout' => 'Bento Box UI',
        'colorPalette' => 'Neon Cyberpunk (Dark with glowing accents)',
        'typography' => 'Monospaced (Developer, Retro)',
        'additionalDetails' => '',
        'description' => 'A developer portfolio',
        'contactEmail' => 'dev@example.com',
        'contactPhone' => '',
        'contactAddress' => '',
        'socialLinks' => 'github.com/dev',
        'aboutBio' => 'Full stack developer',
    ];

    $constraints = WebsitePreferenceRules::buildHtmlGenerationConstraints($parsed, 'Dev Portfolio');

    expect($constraints)
        ->toContain('Bento Box UI')
        ->toContain('Neon Cyberpunk')
        ->toContain('Monospaced')
        ->toContain('BENTO BOX UI')
        ->toContain('mandatory_constraints')
        ->toContain('menu-toggle')
        ->toContain('dev@example.com');
});

test('bento layout requires a responsive page-level grid contract', function () {
    $constraints = WebsitePreferenceRules::buildHtmlGenerationConstraints([
        'contentSections' => 'Hero About Portfolio Services Contact',
        'layout' => 'Bento Box UI',
        'colorPalette' => 'Monochrome Gray (Sleek)',
        'typography' => 'Modern Sans-Serif (Clean, Tech)',
        'additionalDetails' => '',
        'description' => '',
        'contactEmail' => '',
        'contactPhone' => '',
        'contactAddress' => '',
        'socialLinks' => '',
        'aboutBio' => '',
    ], 'Bento Test');

    expect($constraints)
        ->toContain('data-layout="bento"')
        ->toContain('data-bento-grid')
        ->toContain('data-bento-card')
        ->toContain('REQUIRED BENTO DOM SKELETON')
        ->toContain('md:col-span-2')
        ->toContain('md:row-span-2');
});

test('parsePreferences extracts wizard format preferences', function () {
    $service = new GeneratePromptServices;

    $parsed = $service->parsePreferences([
        'Description: A photography portfolio',
        'Content: Hero Section, About Me, Portfolio Gallery',
        'Layout: Split Screen (Text/Image)',
        'Color Palette: High-End Editorial (Beige & Charcoal)',
        'Typography: Elegant Serif (Classic, Luxury)',
        'About Bio: Award-winning photographer',
        'Contact Email: hello@photo.com',
        'Social Links: instagram.com/photo',
    ]);

    expect($parsed['layout'])->toBe('Split Screen (Text/Image)');
    expect($parsed['colorPalette'])->toBe('High-End Editorial (Beige & Charcoal)');
    expect($parsed['typography'])->toBe('Elegant Serif (Classic, Luxury)');
    expect($parsed['aboutBio'])->toBe('Award-winning photographer');
    expect($parsed['contactEmail'])->toBe('hello@photo.com');
    expect($parsed['description'])->toBe('A photography portfolio');
    expect($parsed['contentSections'])->toContain('Hero Section');
});

test('generatePrompt stores the AI-authored selected-layout contract', function () {
    $service = new GeneratePromptServices;
    $user = User::factory()->create();
    $workspace = Workspace::create([
        'user_id' => $user->id,
        'name' => 'Test',
        'slug' => 'test',
    ]);
    $project = Project::create([
        'workspace_id' => $workspace->id,
        'user_id' => $user->id,
        'project_name' => 'Grid Test',
        'preferences' => [
            'Content: Hero Section, Portfolio Gallery',
            'Layout: Grid/Masonry Focus',
            'Color Palette: Monochrome Gray (Sleek)',
            'Typography: Modern Sans-Serif (Clean, Tech)',
        ],
        'status' => 'pending',
    ]);

    $service->generatePrompt($project);

    expect($project->fresh()->generated_prompt)
        ->toContain('data-layout="grid-masonry"')
        ->toContain('data-primary-grid');
})->skip(fn () => empty(env('GEMINI_API_KEY')), 'Skipping AI prompt architect test because GEMINI_API_KEY is not set in .env');

test('processAndSave adds overflow-x-hidden when missing', function () {
    $service = new GeneratePromptServices;
    $user = User::factory()->create();
    $workspace = Workspace::create([
        'user_id' => $user->id,
        'name' => 'Test',
        'slug' => 'test',
    ]);
    $project = Project::create([
        'workspace_id' => $workspace->id,
        'user_id' => $user->id,
        'project_name' => 'Test',
        'preferences' => [],
        'status' => 'reviewing_html',
    ]);

    $html = '<!DOCTYPE html><html><head></head><body><h1>Test</h1></body></html>';
    $result = $service->processAndSave($project, $html);

    expect($result)->toContain('overflow-x-hidden');
    expect($project->fresh()->status)->toBe('completed');
});

test('processAndSave normalizes generated mobile navigation', function () {
    $service = new GeneratePromptServices;
    $user = User::factory()->create();
    $workspace = Workspace::create([
        'user_id' => $user->id,
        'name' => 'Test',
        'slug' => 'test',
    ]);
    $project = Project::create([
        'workspace_id' => $workspace->id,
        'user_id' => $user->id,
        'project_name' => 'Test',
        'preferences' => [],
        'status' => 'reviewing_html',
    ]);

    $html = <<<'HTML'
<!DOCTYPE html><html><head><meta name="viewport" content="initial-scale=1"></head><body class="bg-white">
<button id="menu-toggle" aria-expanded="false">Menu</button>
<div class="hidden" id="mobile-menu"><a href="#about">About</a></div>
<div class="bg-white text-white">Bad contrast</div><script>alert('Menu functionality activated.');</script>
<script>document.getElementById('menu-toggle').addEventListener('click', function () { document.getElementById('mobile-menu').classList.toggle('hidden'); });</script>
</body></html>
HTML;

    $result = $service->processAndSave($project, $html);

    expect($result)
        ->toContain('maxHeight')
        ->toContain("classList.toggle('max-h-screen'")
        ->toContain('data-generated-responsive-guard')
        ->toContain('transition-all')
        ->toContain('text-neutral-900')
        ->not->toContain('alert(')
        ->not->toContain("classList.toggle('hidden')");
});

test('processAndSave rejects a page that does not implement the selected layout', function () {
    $service = new GeneratePromptServices;
    $user = User::factory()->create();
    $workspace = Workspace::create([
        'user_id' => $user->id,
        'name' => 'Test',
        'slug' => 'test',
    ]);
    $project = Project::create([
        'workspace_id' => $workspace->id,
        'user_id' => $user->id,
        'project_name' => 'Test',
        'preferences' => ['Layout: Horizontal Scroll (Gallery)'],
        'status' => 'reviewing_html',
    ]);

    expect(fn () => $service->processAndSave(
        $project,
        '<!DOCTYPE html><html><head></head><body><section class="h-screen bg-cover">Wrong layout</section></body></html>'
    ))->toThrow(RuntimeException::class, 'selected page layout');
});

test('processAndSave rejects cinematic output for a Bento selection', function () {
    $service = new GeneratePromptServices;
    $user = User::factory()->create();
    $workspace = Workspace::create([
        'user_id' => $user->id,
        'name' => 'Test',
        'slug' => 'test',
    ]);
    $project = Project::create([
        'workspace_id' => $workspace->id,
        'user_id' => $user->id,
        'project_name' => 'Test',
        'preferences' => ['Layout: Bento Box UI'],
        'status' => 'reviewing_html',
    ]);

    $html = '<!DOCTYPE html><html><head></head><body data-layout="bento"><main data-bento-grid class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">'
        .str_repeat('<section data-bento-card></section>', 6)
        .'</main><section class="h-screen bg-cover"></section></body></html>';

    expect(fn () => $service->processAndSave($project, $html))
        ->toThrow(RuntimeException::class, 'selected page layout');
});

test('processAndSave rejects template source and emoji characters', function () {
    $service = new GeneratePromptServices;
    $user = User::factory()->create();
    $workspace = Workspace::create([
        'user_id' => $user->id,
        'name' => 'Test',
        'slug' => 'test',
    ]);
    $project = Project::create([
        'workspace_id' => $workspace->id,
        'user_id' => $user->id,
        'project_name' => 'Test',
        'preferences' => [],
        'status' => 'reviewing_html',
    ]);

    expect(fn () => $service->processAndSave(
        $project,
        '<!DOCTYPE html><html><head></head><body>{[1,2,3].map((item) => <Card />)} ⭐</body></html>'
    ))->toThrow(RuntimeException::class, 'React or template source');
});
