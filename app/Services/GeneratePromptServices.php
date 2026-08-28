<?php

namespace App\Services;

use App\Ai\Agents\WebpageGenerator;
use App\Ai\Agents\WebsiteSpecArchitect;
use App\Models\Project;
use App\Support\WebsitePreferenceRules;
use Illuminate\Support\Facades\Log;

class GeneratePromptServices
{
    // =========================================================================
    // Entry Points (called by GenerateWebsiteJob)
    // =========================================================================

    /**
     * Generate a structured website spec from user preferences via the
     * WebsiteSpecArchitect agent (structured output / JSON schema).
     */
    public function generatePrompt(Project $project): void
    {
        $preferences = $project->preferences ?? [];
        $projectName = $project->project_name ?? 'Untitled';

        try {
            $parsed = $this->parsePreferences($preferences);
            $specRequest = $this->buildSpecRequest($parsed, $projectName);
            $specResponse = (new WebsiteSpecArchitect)->prompt($specRequest);
            $spec = $specResponse->toArray();

            $project->update([
                'generated_prompt' => json_encode($spec, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                'status' => 'generating_html',
            ]);
        } catch (\Exception $e) {
            Log::error('Exception during AI spec generation: '.$e->getMessage());
            $project->update(['status' => 'failed']);
            throw $e;
        }
    }

    /**
     * Generate HTML by building each section independently, validating
     * deterministically, repairing only failures, then assembling.
     */
    public function generateHtml(Project $project): void
    {
        try {
            $parsed = $this->parsePreferences($project->preferences ?? []);
            $spec = json_decode($project->generated_prompt, true);
            $projectName = $project->project_name ?? 'Untitled';

            if (! is_array($spec) || empty($spec['sections'])) {
                throw new \RuntimeException('Invalid or missing website spec in generated_prompt.');
            }

            $sections = collect($spec['sections'])->sortBy('priority')->values()->all();

            // ── Generate each section sequentially ──
            $htmlParts = [];
            foreach ($sections as $section) {
                $htmlParts[] = $this->generateSection($section, $spec, $parsed);
            }

            $project->update(['status' => 'reviewing_html']);

            // ── Validate deterministically and repair failures ──
            foreach ($sections as $i => $section) {
                $result = $this->validateSection($htmlParts[$i], $section, $spec['theme']);

                if ($result['passed']) {
                    continue;
                }

                for ($attempt = 0; $attempt < 2; $attempt++) {
                    $htmlParts[$i] = $this->repairSection(
                        $htmlParts[$i],
                        $result['errors'],
                        $section,
                        $spec
                    );

                    $result = $this->validateSection($htmlParts[$i], $section, $spec['theme']);

                    if ($result['passed']) {
                        break;
                    }
                }

                if (! $result['passed']) {
                    Log::warning('Section failed validation after 2 repair attempts, keeping best attempt.', [
                        'project_id' => $project->id,
                        'section_id' => $section['id'],
                        'errors' => $result['errors'],
                    ]);
                }
            }

            // ── Assemble into a full document ──
            $assembledHtml = $this->assembleSections($htmlParts, $spec, $parsed, $projectName);

            $this->saveWithLayoutRepair($project, $assembledHtml, $parsed);
        } catch (\Exception $e) {
            Log::error('Exception during AI HTML generation: '.$e->getMessage());
            $project->update(['status' => 'failed']);
            throw $e;
        }
    }

    // =========================================================================
    // Spec Building
    // =========================================================================

    /**
     * Build the prompt sent to WebsiteSpecArchitect.
     *
     * @param  array<string, string>  $parsed
     */
    private function buildSpecRequest(array $parsed, string $projectName): string
    {
        $layout = $parsed['layout'] ?? '';
        $colorPalette = $parsed['colorPalette'] ?? '';
        $typography = $parsed['typography'] ?? '';
        $contentSections = $parsed['contentSections'] ?? '';

        $colorGuidance = WebsitePreferenceRules::getColorPaletteInstructions($colorPalette);

        return <<<PROMPT
Analyze these user preferences and produce a structured website specification for "{$projectName}".

USER PREFERENCES:
Layout: {$layout}
Color palette: {$colorPalette}
Typography: {$typography}
Content sections requested: {$contentSections}
Description: {$parsed['description']}

INSTRUCTIONS:
1. Set siteType based on the description and requested content.
2. Decompose the content sections into individual sections with unique kebab-case ids, the correct type enum value, and a priority (1 = first on page). Always include nav (priority 1) and footer (last). For Bento Box UI layouts, ensure at least 6 content sections.
3. For theme.colorRoles — resolve the "{$colorPalette}" palette into specific hex values for each role, following this guidance:
   {$colorGuidance}
4. For theme.typeScale — map "{$typography}" to compact, standard, editorial, or display.
5. For theme.layoutStyle — use "{$layout}" exactly as written.
6. For copy — write short, relevant copy for each section based on the description and user preferences. Use real-sounding content, not lorem ipsum.
PROMPT;
    }

    // =========================================================================
    // Section Generation
    // =========================================================================

    /**
     * Generate a single HTML section via the WebpageGenerator agent.
     *
     * @param  array{id: string, type: string, priority: int}  $section
     * @param  array<string, mixed>  $spec
     * @param  array<string, string>  $parsed
     */
    public function generateSection(array $section, array $spec, array $parsed): string
    {
        $prompt = $this->buildSectionPrompt($section, $spec, $parsed);
        $response = (new WebpageGenerator)->prompt($prompt);

        $html = trim($response->text);
        $html = preg_replace('/^```html\s*|\s*```$/i', '', $html) ?? $html;

        $layout = $spec['theme']['layoutStyle'] ?? '';

        return $this->sanitizeHtml(trim($html), $layout);
    }

    /**
     * Sanitize and auto-close HTML to prevent layout bleeding.
     * Also forces Bento Box wrappers to display: contents so children flow into the master grid.
     */
    private function sanitizeHtml(string $html, string $layout = ''): string
    {
        if (empty($html)) {
            return '';
        }

        libxml_use_internal_errors(true);
        $dom = new \DOMDocument;
        $wrapped = '<?xml encoding="UTF-8"><div id="dom-wrapper-guard">'.$html.'</div>';
        $dom->loadHTML($wrapped, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        libxml_clear_errors();

        $wrapper = $dom->getElementById('dom-wrapper-guard');
        if (! $wrapper) {
            return $html;
        }

        if ($layout === 'Bento Box UI') {
            foreach ($wrapper->childNodes as $node) {
                if ($node instanceof \DOMElement && ! $node->hasAttribute('data-bento-card') && strtolower($node->nodeName) !== 'nav') {
                    // Force non-card wrappers to act as pass-through for the master grid
                    $node->setAttribute('class', 'contents');
                }
            }

            // Forcefully stretch all bento cards to prevent gaps in the grid
            $xpath = new \DOMXPath($dom);
            $cards = $xpath->query('.//*[@data-bento-card]', $wrapper);
            foreach ($cards as $card) {
                if ($card instanceof \DOMElement) {
                    $classes = $card->getAttribute('class');
                    if (! str_contains($classes, 'h-full')) {
                        $card->setAttribute('class', trim("$classes h-full flex flex-col justify-between"));
                    }
                }
            }
        }

        $cleanedHtml = '';
        foreach ($wrapper->childNodes as $child) {
            $cleanedHtml .= $dom->saveHTML($child);
        }

        return trim($cleanedHtml);
    }

    /**
     * Build the detailed prompt for one section generation call.
     *
     * @param  array{id: string, type: string, priority: int}  $section
     * @param  array<string, mixed>  $spec
     * @param  array<string, string>  $parsed
     */
    private function buildSectionPrompt(array $section, array $spec, array $parsed): string
    {
        $theme = $spec['theme'];
        $colorRoles = $theme['colorRoles'];
        $layout = $theme['layoutStyle'] ?? '';
        $typography = $parsed['typography'] ?? '';

        $copyMap = [];
        foreach ($spec['copy'] as $entry) {
            $copyMap[$entry['sectionId']] = $entry['text'];
        }
        $sectionCopy = $copyMap[$section['id']] ?? '';

        $layoutInstructions = WebsitePreferenceRules::getLayoutInstructions($layout);

        // Adapt FULL PAGE layout instructions for COMPONENT MODE
        if ($layout === 'Bento Box UI') {
            $layoutInstructions = 'BENTO BOX UI: You are generating ONE component for a Bento Box grid. The master grid wrapper is ALREADY PROVIDED by the system (`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4`). DO NOT generate the master grid container. Just generate your section as a single card (`data-bento-card`) or a `class="contents"` wrapper containing multiple `data-bento-card` sibling elements. Keep backgrounds subtle (`bg-white/5` or `bg-neutral-100` depending on theme). CRITICAL: If a card contains significant text, you MUST add `md:col-span-2` or `lg:col-span-2` to the card. CRITICAL: You MUST add `h-full flex flex-col` to EVERY `data-bento-card` so the card background stretches to fill the CSS grid cell height perfectly! Do not leave empty space below the card background.';
        } elseif ($layout === 'Grid/Masonry Focus' && $section['type'] !== 'portfolio' && $section['type'] !== 'gallery') {
            $layoutInstructions = "GRID/MASONRY FOCUS: The portfolio/gallery will be the main grid. For this {$section['type']} section, keep it minimal and standard so it doesn't compete with the gallery.";
        }

        $typographyInstructions = WebsitePreferenceRules::getTypographyInstructions($typography);
        $iconInstructions = WebsitePreferenceRules::getIconInstructions($typography);
        $layoutHints = $this->getSectionLayoutHints($section['type'], $layout);
        $userData = $this->getUserDataForSection($section['type'], $parsed);

        $navRules = '';
        if ($section['type'] === 'nav') {
            $allSectionIds = implode(', ', array_column($spec['sections'], 'id'));
            $navRules = <<<NAV

MOBILE NAVIGATION PATTERN (MANDATORY):
- Include id="menu-toggle" on the hamburger button and id="mobile-menu" on the mobile menu container.
- Desktop links: hidden md:flex. Hamburger: md:hidden.
- Mobile menu initial state: class="md:hidden overflow-hidden transition-all duration-300 ease-in-out max-h-0 opacity-0"
- Use exactly this SVG for the hamburger: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>`
- Do NOT add <script> tags — the toggle script is added at assembly time.
- Do NOT use "hidden", "display:none", or "invisible" on the mobile menu.
- CRITICAL: Your navigation menu MUST contain links to ALL of these sections: {$allSectionIds}. Do not skip any primary sections!
NAV;
        }

        $allSectionIds = implode(', ', array_column($spec['sections'], 'id'));

        return <<<PROMPT
Generate a single "{$section['type']}" section component for a "{$spec['siteType']}" website.
This is COMPONENT MODE — return exactly ONE root HTML element, no page shell.

SECTION: id="{$section['id']}", type="{$section['type']}"

DESIGN TOKENS (MANDATORY — use ONLY these, do not invent new colors):
  Primary:    {$colorRoles['primary']}
  Secondary:  {$colorRoles['secondary']}
  Background: {$colorRoles['background']}
  Surface:    {$colorRoles['surface']}
  Text:       {$colorRoles['text']}
  Text Muted: {$colorRoles['textMuted']}

You may reference these as CSS custom properties: var(--color-primary), var(--color-secondary), var(--color-background), var(--color-surface), var(--color-text), var(--color-text-muted).
Or use Tailwind arbitrary value classes that match these exact hex values, e.g. bg-[{$colorRoles['primary']}].

TYPE SCALE: {$theme['typeScale']}

TYPOGRAPHY:
{$typographyInstructions}

ICON STYLE:
{$iconInstructions}

LAYOUT CONTEXT — "{$layout}":
{$layoutInstructions}

{$layoutHints}

CONTENT FOR THIS SECTION:
{$sectionCopy}

{$userData}{$navRules}
ENHANCED DESIGN PATTERNS:
- Add generous spacing: use large padding (`py-16`, `py-24` or `py-32`) for sections to let content breathe.
- Use advanced Tailwind classes for a premium look: `backdrop-blur-sm`, `bg-opacity`, subtle gradients, or `ring` for focus states.
- Include rich interactive states: `transition-all duration-300 hover:-translate-y-1 hover:shadow-xl` on interactive cards/buttons. Use `group-hover:scale-105` on images inside cards.
- Scroll Animations: Add `data-aos="fade-up"` (or fade-right/fade-left/zoom-in) to main elements inside the section so they animate on scroll. Use `data-aos-delay="100"` for staggered elements.
- Working Buttons: All navigation buttons and links MUST use `<a href="#target-id">` tags referencing other sections (Available: {$allSectionIds}). DO NOT use `<button onclick="...">` for navigation. Smooth scrolling is handled globally.
- Create deep visual hierarchy: Use varied font weights, text opacities (`text-opacity-80` on body), uppercase kickers (`tracking-widest text-sm`), and subtle borders.
- Elevate components: Don't write "basic" HTML. Add micro-layouts like badges, decorative accent lines, grid-within-flex, or staggered layouts to match high-end Figma designs.
- Style images beautifully: `object-cover rounded-2xl shadow-md`.

OUTPUT RULES:
- Return EXACTLY ONE root HTML element: <section id="{$section['id']}" ...>, <nav id="{$section['id']}" ...>, <footer id="{$section['id']}" ...>, etc.
- Allowed root tags: section, nav, header, footer, aside, div, main.
- Return RAW, VALID HTML ONLY. DO NOT output React, JSX, Vue, or any template language code. DO NOT use .map(), forEach(), or loops. Write out every single repeated element explicitly as plain HTML.
- Do NOT include <!DOCTYPE>, <html>, <head>, <body>, or any page shell.
- Do NOT include <script> tags.
- Do NOT generate sections other than "{$section['type']}".
- Use Tailwind CSS utility classes.
- Use inline SVG icons, NEVER emojis.
- Ensure full responsiveness: use fluid widths (e.g., `w-full`) on mobile. NEVER use fixed pixel widths or min-widths (like `w-[350px]`) on mobile. Rely on `flex-col` for mobile and `md:flex-row` for desktop. Use `break-words` on headings.
- Use high-quality placeholders from `https://picsum.photos/seed/{random_word}/800/600` styled elegantly.
PROMPT;
    }

    /**
     * Return layout-specific hints for a section type (data attributes, span classes, etc.).
     */
    private function getSectionLayoutHints(string $sectionType, string $layout): string
    {
        if ($layout === 'Bento Box UI') {
            $baseHint = 'BENTO LAYOUT: Add data-bento-card attribute to the root element. Use rounded-2xl sm:rounded-3xl p-5 sm:p-6 styling.';

            if ($sectionType === 'hero') {
                return $baseHint.' Add classes: md:col-span-2 md:row-span-2.';
            }
            if ($sectionType === 'contact') {
                return $baseHint.' Add class: md:col-span-2.';
            }
            if ($sectionType === 'nav') {
                return 'This nav sits OUTSIDE the bento grid. Do NOT add data-bento-card. Make it a sticky modern topbar with backdrop-blur-md bg-white/70 dark:bg-black/70 border-b border-black/5 dark:border-white/10.';
            }
            if (in_array($sectionType, ['features', 'services', 'portfolio', 'gallery'])) {
                return 'BENTO LAYOUT: This section has multiple items. Instead of one giant card, your root element MUST be `<section class="contents">`. Inside it, generate multiple `<article data-bento-card class="...">` elements as siblings. DO NOT use grid on the root element. The parent system handles the master grid.';
            }

            return $baseHint;
        }

        if ($sectionType === 'nav') {
            return 'LAYOUT HINT: Make the navigation sticky at the top with `sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-black/70 border-b border-black/5 dark:border-white/10`. Ensure the logo and links are well-aligned.';
        }

        if (in_array($sectionType, ['features', 'services'])) {
            $generalHint = 'LAYOUT HINT: Use a sophisticated grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`). For each card, use `p-8 rounded-3xl border border-black/5 dark:border-white/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-surface`. Include an icon with a soft background blob.';
        } else {
            $generalHint = '';
        }

        if ($layout === 'Split Screen (Text/Image)' && $sectionType === 'hero') {
            return $generalHint."\n".'LAYOUT HINT: Add data-split-hero attribute. Structure as flex flex-col lg:flex-row min-h-screen with two equal panels: lg:w-1/2 each. Left = text, Right = <img> (not CSS background).';
        }

        if ($layout === 'Full-bleed Cinematic' && $sectionType === 'hero') {
            return $generalHint."\n".'LAYOUT HINT: Add data-cinematic-hero attribute. Use h-screen w-full bg-cover bg-center bg-no-repeat with a dark overlay and centered content card.';
        }

        if ($layout === 'Hero-focused Single Page' && $sectionType === 'hero') {
            return $generalHint."\n".'LAYOUT HINT: Add data-primary-hero attribute. Use min-h-screen with massive typography. The hero should dominate the viewport with text-center layout.';
        }

        if ($layout === 'Grid/Masonry Focus' && in_array($sectionType, ['gallery', 'portfolio'])) {
            return $generalHint."\n".'LAYOUT HINT: Add data-primary-grid attribute. Use grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 with edge-to-edge images.';
        }

        if ($layout === 'Horizontal Scroll (Gallery)' && in_array($sectionType, ['gallery', 'portfolio'])) {
            return $generalHint."\n".'LAYOUT HINT: Add data-horizontal-gallery attribute. Use flex overflow-x-auto snap-x snap-mandatory gap-4 sm:gap-6 with min-w-[85vw] snap-center cards. At least 5 scroll items.';
        }

        return $generalHint;
    }

    /**
     * Return user-provided data relevant to a specific section type.
     *
     * @param  array<string, string>  $parsed
     */
    private function getUserDataForSection(string $sectionType, array $parsed): string
    {
        return match ($sectionType) {
            'about' => $this->formatUserData([
                'Bio' => $parsed['aboutBio'],
                'Description' => $parsed['description'],
            ]),
            'contact' => $this->formatUserData([
                'Email' => $parsed['contactEmail'],
                'Phone' => $parsed['contactPhone'],
                'Address' => $parsed['contactAddress'],
                'Social Links' => $parsed['socialLinks'],
            ]),
            'footer' => $this->formatUserData([
                'Email' => $parsed['contactEmail'],
                'Social Links' => $parsed['socialLinks'],
            ]),
            'hero' => $this->formatUserData([
                'Description' => $parsed['description'],
            ]),
            default => '',
        };
    }

    /**
     * Format user data entries into a prompt section, skipping empty values.
     *
     * @param  array<string, string>  $data
     */
    private function formatUserData(array $data): string
    {
        $lines = [];
        foreach ($data as $label => $value) {
            if (trim($value) !== '') {
                $lines[] = "{$label}: {$value}";
            }
        }

        if (empty($lines)) {
            return '';
        }

        return "USER DATA (inject these real values):\n".implode("\n", $lines);
    }

    // =========================================================================
    // Assembly
    // =========================================================================

    /**
     * Merge generated section HTML fragments into a complete HTML document,
     * injecting CSS custom properties from the theme so design tokens are
     * enforced structurally — not left to the model's discretion.
     *
     * @param  list<string>  $sectionHtmlParts
     * @param  array<string, mixed>  $spec
     * @param  array<string, string>  $parsed
     */
    public function assembleSections(array $sectionHtmlParts, array $spec, array $parsed, string $projectName): string
    {
        $theme = $spec['theme'];
        $layout = $theme['layoutStyle'] ?? '';
        $layoutSlug = $this->layoutDataAttribute($layout);
        $cssVars = $this->buildCssVariables($theme['colorRoles']);
        $fontsLink = $this->resolveGoogleFontsLink($parsed['typography'] ?? '');

        $head = <<<HEAD
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{$projectName}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
    {$fontsLink}
    <style>
        html { scroll-behavior: smooth; }
        :root {
{$cssVars}
        }
    </style>
</head>
HEAD;

        // Toast Notification & Interactive JS Script
        $interactiveScript = <<<JS
<div id="toast-notification" class="fixed bottom-4 right-4 z-50 transform transition-all duration-500 translate-y-20 opacity-0 bg-[var(--color-surface)] text-[var(--color-text)] px-6 py-3 rounded-xl shadow-2xl border border-black/10 dark:border-white/10 flex items-center gap-3">
    <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
    <span class="font-medium text-sm">Welcome to {$projectName}!</span>
</div>
<script>
    // Show toast
    setTimeout(() => {
        const toast = document.getElementById('toast-notification');
        if(toast) {
            toast.classList.remove('translate-y-20', 'opacity-0');
            setTimeout(() => toast.classList.add('translate-y-20', 'opacity-0'), 4000);
        }
    }, 1500);

    // Resilient Smooth Scrolling & Mobile Menu Auto-close via Event Delegation
    document.addEventListener('click', function (e) {
        const anchor = e.target.closest('a');
        if (!anchor) return;

        let href = anchor.getAttribute('href');
        if (!href || href === '#' || href.startsWith('http') || href.startsWith('mailto:')) return;

        e.preventDefault();
        const targetId = href.replace(/^[/#]+/, '');
        if (!targetId) return;

        let target = document.getElementById(targetId);
        if (!target) {
            // Fuzzy match if LLM hallucinated ID
            const sections = Array.from(document.querySelectorAll('section[id], nav[id], footer[id], div[id]'));
            target = sections.find(s => s.id.toLowerCase().includes(targetId.toLowerCase()) || targetId.toLowerCase().includes(s.id.toLowerCase()));
        }

        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Close mobile menu if open
            const menu = document.getElementById('mobile-menu');
            const toggle = document.getElementById('menu-toggle');
            if (menu && toggle && !menu.classList.contains('max-h-0')) {
                toggle.click();
            }
        }
    });
</script>
<script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
<script>AOS.init({ once: true, offset: 50, duration: 800 });</script>
JS;

        // ── Build body: Bento Box needs a grid wrapper ──
        if ($layout === 'Bento Box UI') {
            $navHtml = '';
            $gridParts = [];
            $sections = collect($spec['sections'])->sortBy('priority')->values()->all();

            foreach ($sections as $i => $section) {
                if ($section['type'] === 'nav') {
                    $navHtml = $sectionHtmlParts[$i];
                } else {
                    $gridParts[] = $sectionHtmlParts[$i];
                }
            }

            $gridContent = implode("\n", $gridParts);
            $body = <<<BODY
<body data-layout="{$layoutSlug}" class="overflow-x-hidden antialiased" style="background-color: var(--color-background); color: var(--color-text);">
{$navHtml}
<main data-bento-grid class="max-w-[1600px] mx-auto w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 p-4 lg:p-8">
{$gridContent}
</main>
{$interactiveScript}
</body>
</html>
BODY;
        } else {
            $bodyContent = implode("\n", $sectionHtmlParts);
            $body = <<<BODY
<body data-layout="{$layoutSlug}" class="overflow-x-hidden antialiased" style="background-color: var(--color-background); color: var(--color-text);">
{$bodyContent}
{$interactiveScript}
</body>
</html>
BODY;
        }

        return $head."\n".$body;
    }

    /**
     * Generate CSS custom property declarations from color roles.
     *
     * @param  array<string, string>  $colorRoles
     */
    private function buildCssVariables(array $colorRoles): string
    {
        $lines = [];
        foreach ($colorRoles as $role => $hex) {
            $cssName = match ($role) {
                'textMuted' => 'text-muted',
                default => strtolower(preg_replace('/([a-z])([A-Z])/', '$1-$2', $role) ?? $role),
            };
            $lines[] = "            --color-{$cssName}: {$hex};";
        }

        return implode("\n", $lines);
    }

    /**
     * Resolve a Google Fonts <link> tag for the given typography style.
     */
    private function resolveGoogleFontsLink(string $typography): string
    {
        $fonts = match ($typography) {
            'Elegant Serif (Classic, Luxury)' => 'Playfair+Display:wght@400;700&family=Lora:wght@400;500;700',
            'Modern Sans-Serif (Clean, Tech)' => 'Inter:wght@300;400;500;600;700',
            'Monospaced (Developer, Retro)' => 'JetBrains+Mono:wght@400;500;700',
            'Bold & Brutalist (Large, High-impact)' => 'Archivo+Black&family=Work+Sans:wght@400;500;600',
            'Playful Rounded (Friendly)' => 'Nunito:wght@400;600;700;800',
            'Handwritten Script (Artistic)' => 'Caveat:wght@400;700&family=Inter:wght@400;500;600',
            'Display Serif (Fashion)' => 'Cormorant+Garamond:wght@300;400;500;600;700',
            'Geometric Sans (Architecture)' => 'Montserrat:wght@400;500;600;700',
            'Classic Vintage (Retro, Nostalgic)' => 'Libre+Baskerville:wght@400;700&family=Source+Serif+4:wght@400;600',
            default => 'Inter:wght@300;400;500;600;700',
        };

        return '<link rel="preconnect" href="https://fonts.googleapis.com">'
            ."\n    ".'<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
            ."\n    ".'<link href="https://fonts.googleapis.com/css2?family='.$fonts.'&display=swap" rel="stylesheet">';
    }

    /**
     * Convert a layout display name to its data-layout attribute slug.
     */
    private function layoutDataAttribute(string $layout): string
    {
        return match ($layout) {
            'Minimalist & Clean' => 'minimalist',
            'Grid/Masonry Focus' => 'grid-masonry',
            'Split Screen (Text/Image)' => 'split-screen',
            'Full-bleed Cinematic' => 'cinematic',
            'Bento Box UI' => 'bento',
            'Sidebar Portfolio (Fixed Left Nav)' => 'sidebar-portfolio',
            'Creative Agency (Bold Typography)' => 'creative-agency',
            'Hero-focused Single Page' => 'hero-focused',
            'Horizontal Scroll (Gallery)' => 'horizontal-scroll',
            'Neumorphism (Soft UI)' => 'neumorphism',
            default => strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $layout) ?? $layout),
        };
    }

    // =========================================================================
    // Validation & Repair
    // =========================================================================

    /**
     * Run deterministic checks on a single section's HTML.
     *
     * @param  array{id: string, type: string, priority: int}  $section
     * @param  array{colorRoles: array<string, string>, typeScale: string, layoutStyle: string}  $theme
     * @return array{passed: bool, errors: list<string>}
     */
    public function validateSection(string $html, array $section, array $theme): array
    {
        $errors = [];

        // 1. Valid HTML structure — must start with a semantic block element
        $trimmed = ltrim($html);
        if (! preg_match('/^<(section|nav|header|footer|aside|div|main)\b/i', $trimmed)) {
            $errors[] = 'Section must be wrapped in a single semantic HTML element (section, nav, header, footer, aside, div, or main). Found: '.substr($trimmed, 0, 30);
        }

        // 2. No hex colors outside the theme tokens (in inline styles only)
        $themeColors = array_map('strtolower', array_values($theme['colorRoles']));
        $foundColors = $this->extractHexColors($html);
        $offThemeColors = array_diff(array_map('strtolower', $foundColors), $themeColors);
        if (! empty($offThemeColors)) {
            $unique = array_unique($offThemeColors);
            $errors[] = 'Found colors not in the design system: '.implode(', ', $unique).'. Use only the provided theme tokens: '.implode(', ', $themeColors);
        }

        // 3. Basic contrast ratio check on theme text/background
        $textColor = $theme['colorRoles']['text'] ?? '';
        $bgColor = $theme['colorRoles']['background'] ?? '';
        if ($textColor !== '' && $bgColor !== '') {
            $contrast = $this->contrastRatio($textColor, $bgColor);
            if ($contrast < 4.5) {
                $errors[] = sprintf(
                    'Text/background contrast ratio is %.2f:1 (text: %s, bg: %s), below WCAG AA minimum of 4.5:1. Use higher-contrast alternatives.',
                    $contrast,
                    $textColor,
                    $bgColor
                );
            }
        }

        return [
            'passed' => empty($errors),
            'errors' => $errors,
        ];
    }

    /**
     * Send a failing section back to the LLM with specific errors for repair.
     *
     * @param  list<string>  $errors
     * @param  array{id: string, type: string, priority: int}  $section
     * @param  array<string, mixed>  $spec
     */
    public function repairSection(string $html, array $errors, array $section, array $spec): string
    {
        $theme = $spec['theme'];
        $colorRoles = $theme['colorRoles'];
        $errorList = implode("\n- ", $errors);
        $themeTokens = implode(', ', array_map(
            fn (string $role, string $hex): string => "{$role}: {$hex}",
            array_keys($colorRoles),
            array_values($colorRoles)
        ));

        $repairPrompt = <<<PROMPT
The following "{$section['type']}" section (id="{$section['id']}") failed automated validation.
This is COMPONENT MODE — return exactly ONE root HTML element, no page shell.

VALIDATION ERRORS:
- {$errorList}

DESIGN TOKENS (use ONLY these colors):
{$themeTokens}

Fix every listed error and return the corrected section HTML. Keep the same section structure and content. Return only the HTML element, no explanation.

FAILED HTML:
{$html}
PROMPT;

        $response = (new WebpageGenerator)->prompt($repairPrompt);

        $repaired = trim($response->text);
        $repaired = preg_replace('/^```html\s*|\s*```$/i', '', $repaired) ?? $repaired;

        $layout = $spec['theme']['layoutStyle'] ?? '';

        return $this->sanitizeHtml(trim($repaired), $layout);
    }

    /**
     * Extract hex color literals from inline style attributes and <style> blocks.
     *
     * @return list<string>
     */
    private function extractHexColors(string $html): array
    {
        // Match hex colors in style="..." attributes and <style>...</style> blocks
        $colors = [];

        // Extract from inline styles
        if (preg_match_all('/style="[^"]*"/i', $html, $styleMatches)) {
            foreach ($styleMatches[0] as $style) {
                if (preg_match_all('/#([0-9a-fA-F]{3,8})\b/', $style, $hexMatches)) {
                    foreach ($hexMatches[0] as $hex) {
                        $colors[] = $this->normalizeHex($hex);
                    }
                }
            }
        }

        // Extract from <style> blocks
        if (preg_match_all('/<style[^>]*>(.*?)<\/style>/is', $html, $styleBlocks)) {
            foreach ($styleBlocks[1] as $block) {
                if (preg_match_all('/#([0-9a-fA-F]{3,8})\b/', $block, $hexMatches)) {
                    foreach ($hexMatches[0] as $hex) {
                        $colors[] = $this->normalizeHex($hex);
                    }
                }
            }
        }

        return $colors;
    }

    /**
     * Normalize a hex color to 7-character lowercase format.
     */
    private function normalizeHex(string $hex): string
    {
        $hex = strtolower(ltrim($hex, '#'));

        // Expand 3-char shorthand to 6-char
        if (strlen($hex) === 3) {
            $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
        }

        // Take only the first 6 characters (ignore alpha channel)
        $hex = substr($hex, 0, 6);

        return '#'.$hex;
    }

    /**
     * Calculate relative luminance of a hex color per WCAG 2.1.
     */
    private function hexToRelativeLuminance(string $hex): float
    {
        $hex = ltrim($hex, '#');

        if (strlen($hex) === 3) {
            $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
        }

        $r = hexdec(substr($hex, 0, 2)) / 255;
        $g = hexdec(substr($hex, 2, 2)) / 255;
        $b = hexdec(substr($hex, 4, 2)) / 255;

        $r = $r <= 0.04045 ? $r / 12.92 : (($r + 0.055) / 1.055) ** 2.4;
        $g = $g <= 0.04045 ? $g / 12.92 : (($g + 0.055) / 1.055) ** 2.4;
        $b = $b <= 0.04045 ? $b / 12.92 : (($b + 0.055) / 1.055) ** 2.4;

        return 0.2126 * $r + 0.7152 * $g + 0.0722 * $b;
    }

    /**
     * Calculate WCAG 2.1 contrast ratio between two hex colors.
     */
    private function contrastRatio(string $hex1, string $hex2): float
    {
        $l1 = $this->hexToRelativeLuminance($hex1);
        $l2 = $this->hexToRelativeLuminance($hex2);

        $lighter = max($l1, $l2);
        $darker = min($l1, $l2);

        return ($lighter + 0.05) / ($darker + 0.05);
    }

    // =========================================================================
    // Preferences Parsing
    // =========================================================================

    /**
     * Parse all preferences into a structured map for easy access.
     *
     * @param  array<string>  $preferences
     * @return array<string, string>
     */
    public function parsePreferences(array $preferences): array
    {
        $parsed = [
            'contentSections' => '',
            'layout' => '',
            'colorPalette' => '',
            'typography' => '',
            'additionalDetails' => '',
            'description' => '',
            'contactEmail' => '',
            'contactPhone' => '',
            'contactAddress' => '',
            'socialLinks' => '',
            'aboutBio' => '',
        ];

        foreach ($preferences as $pref) {
            $colonPos = strpos($pref, ':');
            if ($colonPos === false) {
                $parsed['additionalDetails'] .= '- '.$pref."\n";

                continue;
            }

            $key = strtolower(trim(substr($pref, 0, $colonPos)));
            $value = trim(substr($pref, $colonPos + 1));

            if (str_contains($key, 'content') || str_contains($key, 'section')) {
                $parsed['contentSections'] .= $value.' ';
            } elseif (str_contains($key, 'layout')) {
                $parsed['layout'] = $value;
            } elseif (str_contains($key, 'color')) {
                $parsed['colorPalette'] = $value;
            } elseif (str_contains($key, 'typography') || str_contains($key, 'font')) {
                $parsed['typography'] = $value;
            } elseif (str_contains($key, 'contact email')) {
                $parsed['contactEmail'] = $value;
            } elseif (str_contains($key, 'contact phone')) {
                $parsed['contactPhone'] = $value;
            } elseif (str_contains($key, 'contact address')) {
                $parsed['contactAddress'] = $value;
            } elseif (str_contains($key, 'social links')) {
                $parsed['socialLinks'] = $value;
            } elseif (str_contains($key, 'about bio')) {
                $parsed['aboutBio'] = $value;
            } elseif (str_contains($key, 'description') && ! str_contains($key, 'about')) {
                $parsed['description'] = $value;
            } else {
                $parsed['additionalDetails'] .= '- '.$pref."\n";
            }
        }

        if (empty(trim($parsed['contentSections']))) {
            $parsed['contentSections'] = implode(', ', $preferences);
        }

        return $parsed;
    }

    // =========================================================================
    // Save / Post-Process (unchanged)
    // =========================================================================

    public function saveWithLayoutRepair(Project $project, string $html, array $parsed): void
    {
        try {
            $this->processAndSave($project, $html);
        } catch (\RuntimeException $exception) {
            Log::warning('Generated HTML failed the structural layout gate; requesting one repair pass.', [
                'project_id' => $project->id,
                'layout' => $parsed['layout'] ?? '',
                'error' => $exception->getMessage(),
            ]);

            $layoutArchitecture = WebsitePreferenceRules::getLayoutArchitecture($parsed['layout'] ?? '');
            $layoutInstructions = WebsitePreferenceRules::getLayoutInstructions($parsed['layout'] ?? '');
            $repairRequest = 'The previous QA output failed the automated layout release gate.'
                .' Rewrite the complete HTML below so it satisfies the selected page-level layout architecture and every responsive/mobile navigation constraint.'
                .' Return only raw HTML starting with <!DOCTYPE html>.'
                ."\n\nSELECTED LAYOUT: ".($parsed['layout'] ?? '')
                ."\nPAGE-LEVEL ARCHITECTURE:\n{$layoutArchitecture}"
                ."\nEXACT LAYOUT RULES:\n{$layoutInstructions}"
                ."\nThe required data-layout and primary-structure markers must be present in the returned DOM.\n\nFAILED HTML:\n{$html}";

            $repairResponse = (new WebpageGenerator)->prompt($repairRequest);
            $this->processAndSave($project, $repairResponse->text);
        }
    }

    public function processAndSave(Project $project, string $rawCode): string
    {
        $cleanHtml = preg_replace('/^```html\s*|\s*QM?```$/i', '', trim($rawCode)) ?? trim($rawCode);

        $this->assertRenderableHtml($cleanHtml);
        $cleanHtml = $this->postProcessHtml($cleanHtml);

        if (! $this->matchesSelectedLayout($cleanHtml, $this->parsePreferences($project->preferences ?? [])['layout'])) {
            throw new \RuntimeException('Generated HTML did not satisfy the selected page layout.');
        }

        $project->update([
            'html_content' => $cleanHtml,
            'status' => 'completed',
        ]);

        return $cleanHtml;
    }

    private function assertRenderableHtml(string $html): void
    {
        if (! str_starts_with(strtolower(ltrim($html)), '<!doctype html>')) {
            Log::warning('assertRenderableHtml failed: not a complete HTML document.');
            throw new \RuntimeException('Generated output is not a complete HTML document.');
        }

        if (preg_match('/\{\s*\[.*?\]\s*\.map\s*\(|\{\s*[a-z_$][\w$]*\s*=>/', $html)
            || preg_match('/<\/?[A-Z][A-Za-z0-9]*\b/', $html)) {
            Log::warning('assertRenderableHtml failed: React/template source detected.');
            throw new \RuntimeException('Generated output contains React or template source instead of rendered HTML.');
        }

        if (preg_match('/[\x{1F000}-\x{1FAFF}\x{2600}-\x{27BF}]/u', $html)) {
            Log::warning('assertRenderableHtml failed: Emoji detected.');
            throw new \RuntimeException('Generated output contains emoji characters instead of SVG icons.');
        }
    }

    private function matchesSelectedLayout(string $html, string $layout): bool
    {
        if ($layout === '') {
            return true;
        }

        $checks = [
            'Minimalist & Clean' => [
                'required' => ['data-layout="minimalist"', 'max-w-3xl', 'text-center'],
                'forbidden' => ['h-screen bg-cover', 'overflow-x-auto', 'md:col-span-2'],
            ],
            'Grid/Masonry Focus' => [
                'required' => ['data-layout="grid-masonry"', 'data-primary-grid', 'grid-cols-1', 'grid-cols-3'],
                'forbidden' => ['h-screen bg-cover'],
            ],
            'Split Screen (Text/Image)' => [
                'required' => ['data-layout="split-screen"', 'data-split-hero', 'lg:flex-row', 'lg:w-1/2'],
                'forbidden' => ['h-screen bg-cover'],
            ],
            'Full-bleed Cinematic' => [
                'required' => ['data-layout="cinematic"', 'data-cinematic-hero', 'h-screen', 'bg-cover'],
                'forbidden' => [],
            ],
            'Bento Box UI' => [
                'required' => ['data-layout="bento"'],
                'forbidden' => [],
            ],
            'Creative Agency (Bold Typography)' => [
                'required' => ['data-layout="creative-agency"'],
                'forbidden' => [],
            ],
            'Hero-focused Single Page' => [
                'required' => ['data-layout="hero-focused"', 'data-primary-hero', 'min-h-screen', 'text-center'],
                'forbidden' => ['overflow-x-auto'],
            ],
            'Horizontal Scroll (Gallery)' => [
                'required' => ['data-layout="horizontal-scroll"', 'data-horizontal-gallery', 'overflow-x-auto', 'min-w-[85vw]', 'snap-x'],
                'forbidden' => ['h-screen bg-cover'],
            ],
            'Neumorphism (Soft UI)' => [
                'required' => ['data-layout="neumorphism"', 'bg-[#e0e5ec]'],
                'forbidden' => ['bg-neutral-950', 'bg-slate-950'],
            ],
        ][$layout] ?? null;

        if ($checks === null) {
            return true;
        }

        foreach ($checks['required'] as $required) {
            if (! str_contains($html, $required)) {
                return false;
            }
        }

        foreach ($checks['forbidden'] as $forbidden) {
            if (str_contains($html, $forbidden)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Apply lightweight programmatic fixes for common AI output issues.
     */
    private function postProcessHtml(string $html): string
    {
        $html = $this->sanitizeGeneratedUi($html);

        if (preg_match('/<body([^>]*)>/i', $html, $matches)) {
            $bodyTag = $matches[0];

            if (preg_match('/class=["\']([^"\']*)["\']/', $bodyTag, $classMatches)) {
                $classes = preg_split('/\s+/', trim($classMatches[1])) ?: [];
                $classes[] = 'overflow-x-hidden';
                $classes[] = 'antialiased';
                $newBodyTag = str_replace($classMatches[0], 'class="'.implode(' ', array_values(array_unique($classes))).'"', $bodyTag);
            } else {
                $newBodyTag = str_replace('<body', '<body class="overflow-x-hidden antialiased"', $bodyTag);
            }

            $html = str_replace($bodyTag, $newBodyTag, $html);
        }

        if (preg_match('/<meta\s+name=["\']viewport["\'][^>]*>/i', $html)) {
            $html = preg_replace(
                '/<meta\s+name=["\']viewport["\'][^>]*>/i',
                '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
                $html,
                1
            ) ?? $html;
        } else {
            $html = preg_replace(
                '/<head([^>]*)>/i',
                '<head$1>'."\n".'    <meta name="viewport" content="width=device-width, initial-scale=1.0">',
                $html,
                1
            ) ?? $html;
        }

        $html = $this->ensureResponsiveStyles($html);

        return $this->normalizeMobileNavigationScript($html);
    }

    private function ensureResponsiveStyles(string $html): string
    {
        if (str_contains($html, 'data-generated-responsive-guard')) {
            return $html;
        }

        $styles = <<<'STYLE'
<style data-generated-responsive-guard>
*, *::before, *::after { box-sizing: border-box; }
body { max-width: 100%; overflow-x: hidden; }
img, svg, video, canvas, iframe { max-width: 100%; }
#mobile-menu { overflow: hidden; transition: max-height .3s ease-in-out, opacity .3s ease-in-out; }
[data-bento-grid] { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1rem; }
[data-bento-card] { min-width: 0; }
@media (max-width: 767px) {
  h1, h2, h3, h4, p, a, button { overflow-wrap: anywhere; }
  .container { width: 100%; max-width: 100%; }
    [data-bento-grid] { grid-template-columns: minmax(0, 1fr); }
}
</style>
STYLE;

        return preg_replace('/<\/head>/i', $styles."\n</head>", $html, 1) ?? $html;
    }

    private function normalizeMobileNavigationScript(string $html): string
    {
        if (! preg_match('/id=["\']menu-toggle[\'"]/i', $html) || ! preg_match('/id=["\']mobile-menu[\'"]/i', $html)) {
            return $html;
        }

        $html = preg_replace_callback(
            '/<([a-z][^>]*id=["\']mobile-menu["\'][^>]*)>/i',
            function (array $matches): string {
                $tag = $matches[1];
                preg_match('/class=["\']([^"\']*)["\']/', $tag, $classMatches);
                $classes = preg_split('/\s+/', trim($classMatches[1] ?? '')) ?: [];
                $classes = array_diff($classes, ['hidden', 'invisible', 'display-none']);
                $classes[] = 'md:hidden';
                $classes[] = 'overflow-hidden';
                $classes[] = 'transition-all';
                $classes[] = 'duration-300';
                $classes[] = 'ease-in-out';
                $classes[] = 'max-h-0';
                $classes[] = 'opacity-0';

                $classAttribute = 'class="'.implode(' ', array_values(array_unique($classes))).'"';

                if (isset($classMatches[0])) {
                    $tag = str_replace($classMatches[0], $classAttribute, $tag);
                } else {
                    $tag .= ' '.$classAttribute;
                }

                return '<'.$tag.'>';
            },
            $html
        ) ?? $html;

        $html = preg_replace_callback(
            '/<script\b[^>]*>(.*?)<\/script>/is',
            function ($matches) {
                if (str_contains($matches[1], 'menu-toggle') || str_contains($matches[1], 'mobile-menu')) {
                    return '';
                }

                return $matches[0];
            },
            $html
        ) ?? $html;

        $script = <<<'SCRIPT'
<script>
(function () {
    var toggle = document.getElementById('menu-toggle');
    var menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;
    var setState = function (open) {
        menu.classList.toggle('max-h-0', !open);
        menu.classList.toggle('opacity-0', !open);
        menu.classList.toggle('max-h-screen', open);
        menu.classList.toggle('opacity-100', open);
        menu.style.maxHeight = open ? menu.scrollHeight + 'px' : '0px';
        toggle.setAttribute('aria-expanded', String(open));
        menu.setAttribute('aria-hidden', String(!open));
    };
    menu.classList.add('overflow-hidden', 'transition-all', 'duration-300', 'ease-in-out');
    setState(false);
    toggle.addEventListener('click', function () {
        setState(toggle.getAttribute('aria-expanded') !== 'true');
    });
})();
</script>
SCRIPT;

        return preg_replace('/<\/body>/i', $script."\n</body>", $html, 1) ?? $html;
    }

    private function sanitizeGeneratedUi(string $html): string
    {
        $html = preg_replace(
            '/\balert\s*\(\s*(?:"[^"]*"|\'[^\']*\'|[^)]*)\s*\)\s*;?/i',
            '',
            $html
        ) ?? $html;

        return preg_replace_callback(
            '/<([a-z][a-z0-9]*)\b([^>]*)>/i',
            function (array $matches): string {
                if (! preg_match('/class=["\']([^"\']*)["\']/', $matches[2], $classMatches)) {
                    return $matches[0];
                }

                $classes = preg_split('/\s+/', trim($classMatches[1])) ?: [];
                $hasLightBackground = (bool) preg_grep('/^bg-(?:white|gray-50|neutral-50|slate-50|stone-100)$/', $classes);

                if (! $hasLightBackground || ! in_array('text-white', $classes, true)) {
                    return $matches[0];
                }

                $classes = array_map(
                    fn (string $class): string => $class === 'text-white' ? 'text-neutral-900' : $class,
                    $classes
                );

                return '<'.$matches[1].str_replace(
                    $classMatches[0],
                    'class="'.implode(' ', $classes).'"',
                    $matches[2]
                ).'>';
            },
            $html
        ) ?? $html;
    }
}
