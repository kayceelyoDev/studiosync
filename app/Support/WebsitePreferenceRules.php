<?php

namespace App\Support;

class WebsitePreferenceRules
{
    /**
     * @var list<string>
     */
    public const LAYOUTS = [
        'Minimalist & Clean',
        'Grid/Masonry Focus',
        'Split Screen (Text/Image)',
        'Full-bleed Cinematic',
        'Bento Box UI',
        'Creative Agency (Bold Typography)',
        'Hero-focused Single Page',
        'Horizontal Scroll (Gallery)',
        'Neumorphism (Soft UI)',
    ];

    /**
     * @var list<string>
     */
    public const COLOR_PALETTES = [
        'High-End Editorial (Beige & Charcoal)',
        'Dark Mode Minimal (Black & White)',
        'Vibrant & Playful (Pastels)',
        'Neon Cyberpunk (Dark with glowing accents)',
        'Earthy & Organic (Greens, Browns, Creams)',
        'Classic Corporate (Blues, Grays)',
        'Ocean Depth (Navy & Aqua)',
        'Sunset Glow (Orange & Purple)',
        'Monochrome Gray (Sleek)',
    ];

    /**
     * @var list<string>
     */
    public const TYPOGRAPHY_STYLES = [
        'Elegant Serif (Classic, Luxury)',
        'Modern Sans-Serif (Clean, Tech)',
        'Monospaced (Developer, Retro)',
        'Bold & Brutalist (Large, High-impact)',
        'Playful Rounded (Friendly)',
        'Handwritten Script (Artistic)',
        'Display Serif (Fashion)',
        'Geometric Sans (Architecture)',
        'Classic Vintage (Retro, Nostalgic)',
    ];

    public static function getLayoutInstructions(string $layout): string
    {
        $instructions = [
            'Minimalist & Clean' => <<<'RULE'
ABSOLUTE RULE — MINIMALIST & CLEAN:
- Page background: solid white or off-white (`bg-white` or `bg-neutral-50`). NO gradients, NO background images on the page shell.
- Content container: single centered column `max-w-3xl mx-auto px-6 sm:px-8`.
- Hero: NO background image. Centered headline + subheadline + one CTA only. Use `py-24 sm:py-32 text-center`.
- Sections: separated by massive vertical whitespace (`py-20 sm:py-28`). NO card borders, NO heavy shadows, NO decorative boxes.
- Typography hierarchy: one massive H1, restrained body text (`text-base sm:text-lg text-neutral-600`).
- Navigation: minimal sticky top bar, logo left, 3–5 text links right, no hamburger until `md:` breakpoint.
- The page must feel editorial and airy — if it looks like a generic card grid, REWRITE the structure.
RULE,
            'Grid/Masonry Focus' => <<<'RULE'
ABSOLUTE RULE — GRID/MASONRY FOCUS:
- The DOM must be dominated by a visual grid. Portfolio/gallery is the PRIMARY content block, not an afterthought.
- Use `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4` OR a masonry-style staggered grid with varied `row-span-*`.
- Hero must be SHORT (`py-12 sm:py-16` max) — headline + one line, then IMMEDIATELY the grid begins.
- Grid items: edge-to-edge images with `aspect-square object-cover w-full`. Minimal text overlays only on hover.
- Remove excessive container padding so the grid feels immersive (`px-2 sm:px-4` on the grid wrapper).
- At least 6 grid cells must be visible. If the layout is a vertical stack of full-width sections, REWRITE it as a grid-first layout.
RULE,
            'Split Screen (Text/Image)' => <<<'RULE'
ABSOLUTE RULE — SPLIT SCREEN (TEXT/IMAGE):
- Hero MUST be a literal 50/50 split on desktop: `flex flex-col lg:flex-row min-h-[75vh]`.
- Left panel (text): `w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-16 lg:min-h-[75vh]`.
- Right panel (image): `w-full lg:w-1/2 lg:min-h-[75vh]` with `<img class="w-full h-64 sm:h-80 lg:h-full object-cover">` — NOT a CSS background-image.
- On mobile: stack vertically — image FIRST or text FIRST, both full width (`w-full`), image height `h-64 sm:h-80`.
- Subsequent sections may break the split pattern, but the HERO must unmistakably be a split screen.
- NEVER use a full-bleed background image hero for this layout style.
RULE,
            'Full-bleed Cinematic' => <<<'RULE'
ABSOLUTE RULE — FULL-BLEED CINEMATIC:
- Hero MUST cover the entire viewport: `relative h-screen w-full bg-cover bg-center bg-no-repeat` with a real `<img>` or div using inline background-image from picsum.photos.
- Overlay: dark gradient or glass card centered in viewport: `absolute inset-0 flex items-center justify-center`.
- Floating content card: `backdrop-blur-md bg-black/30 p-8 sm:p-12 rounded-xl max-w-2xl mx-4 text-white`.
- Headline inside overlay: `text-4xl sm:text-6xl md:text-7xl font-bold break-words`.
- Sections below hero use cinematic full-width bands (`w-full py-20`) with high-contrast imagery.
- If the hero is a contained box with padding instead of edge-to-edge viewport coverage, REWRITE it.
RULE,
            'Bento Box UI' => <<<'RULE'
ABSOLUTE RULE — BENTO BOX UI:
- The page root or main wrapper MUST include `data-layout="bento"` and the master container MUST include `data-bento-grid` with `grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 p-4 lg:p-8`.
- EVERY content block lives inside a direct grid child marked `data-bento-card` with `rounded-2xl sm:rounded-3xl p-5 sm:p-6`.
- Asymmetry is REQUIRED: at least one card uses `md:col-span-2`, at least one uses `md:row-span-2`.
- Cards have subtle backgrounds (`bg-white/5`, `bg-neutral-100`, or `bg-neutral-800/50` depending on palette).
- NO traditional full-width stacked sections — content is fragmented into the bento grid.
- Include at least 6 distinct bento cells (hero card, about card, portfolio cards, contact card, etc.) and keep all primary sections inside this one grid.
RULE,
            'Creative Agency (Bold Typography)' => <<<'RULE'
ABSOLUTE RULE — CREATIVE AGENCY (BOLD TYPOGRAPHY):
- Master layout must be standard vertical flow: `flex flex-col min-h-screen`.
- Navigation MUST be a top navbar: `w-full bg-[var(--color-background)] border-b border-[var(--color-border)] p-6`.
- Typography is the star: Use massive, bold typography (`text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter leading-none`) for section headers and hero.
- Do NOT use a left sidebar. Use a standard top navigation menu.
- Hero should be text-heavy and aggressive, taking up the full viewport height.
RULE,
            'Hero-focused Single Page' => <<<'RULE'
ABSOLUTE RULE — HERO-FOCUSED SINGLE PAGE:
- Hero dominates the viewport: `min-h-screen flex flex-col items-center justify-center text-center px-4`.
- Headline size: `text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] font-black tracking-tighter leading-none break-words max-w-full`.
- Hero is at least 80vh tall. Everything else is compact below the fold.
- Post-hero sections: condensed (`py-12 sm:py-16`), smaller typography, minimal decoration.
- The visual weight ratio must be ~70% hero, ~30% everything else.
- If the hero is a small banner, REWRITE to fill the screen with massive type.
RULE,
            'Horizontal Scroll (Gallery)' => <<<'RULE'
ABSOLUTE RULE — HORIZONTAL SCROLL (GALLERY):
- MUST include at least one horizontally scrolling section: `flex overflow-x-auto snap-x snap-mandatory gap-4 sm:gap-6 pb-4`.
- Scroll cards: `w-[85vw] sm:w-[60vw] md:w-[45vw] lg:w-[35vw] snap-center flex-shrink-0`. NEVER use fixed pixel widths like `w-[350px]` or `min-w-[350px]`.
- Each card: image + title + optional caption inside a rounded container.
- MUST add a "Scroll ->" button (e.g. `<button data-action="scroll-right">Scroll &rarr;</button>`) above or outside the gallery container. 
- Wrapper: `overflow-x-auto` on the scroll track, but `overflow-x-hidden` on `<body>` to prevent page-level horizontal scroll.
- At least 5 scroll items. Write them out explicitly in HTML. DO NOT use `.map()` or React syntax. If portfolio is a static grid with no horizontal scroll, REWRITE it.
- DO NOT add custom scrollbar CSS (like scrollbar-thin or hidden scrollbar classes); the system hides the scrollbar automatically.
RULE,
            'Neumorphism (Soft UI)' => <<<'RULE'
ABSOLUTE RULE — NEUMORPHISM (SOFT UI):
- Page background: solid soft gray ONLY — `bg-[#e0e5ec]` or `bg-[#ecf0f3]`. NO white page background, NO dark mode.
- ALL interactive elements and cards use dual soft shadows (raised): `shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)]`.
- Inset/pressed state for inputs: `shadow-[inset_6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff]`.
- NO harsh borders (`border-none` on cards). NO flat Material Design shadows.
- Buttons: rounded-full or rounded-2xl with neumorphic shadow, same background color as page.
- Text color: muted gray tones (`text-gray-600`, `text-gray-700`) — not pure black.
RULE,
        ];

        return $instructions[$layout] ?? self::getGenericLayoutFallback($layout);
    }

    public static function getLayoutArchitecture(string $layout): string
    {
        $architectures = [
            'Minimalist & Clean' => 'Add data-layout="minimalist" to the page root. Use one restrained centered page composition from navigation through footer. Keep the hero compact and text-led; do not introduce a cinematic image hero, card grid, bento grid, or horizontal gallery.',
            'Grid/Masonry Focus' => 'Add data-layout="grid-masonry" to the page root and data-primary-grid to the dominant gallery. Make the visual grid the primary page composition immediately after a short hero. Do not use a full-screen hero or let stacked text sections dominate the page.',
            'Split Screen (Text/Image)' => 'Add data-layout="split-screen" to the page root and data-split-hero to the hero. Make the hero the page anchor with two equal desktop panels and a stacked mobile version. Do not use a full-bleed background-image hero or a centered single-column hero.',
            'Full-bleed Cinematic' => 'Add data-layout="cinematic" to the page root and data-cinematic-hero to the hero. Make the hero edge-to-edge and viewport-height, with the image and overlay defining the first viewport. Do not use a contained hero, bento grid, or split-panel hero as the primary opening.',
            'Bento Box UI' => 'Add data-layout="bento" to the page root. Compose the entire page as one asymmetric bento system. Add data-bento-grid to the master grid. The hero, about, work, services, and contact content must be direct data-bento-card children inside this grid, not ordinary full-width stacked sections. Use one-column mobile flow and asymmetric spans only from md: upward.',
            'Creative Agency (Bold Typography)' => 'Add data-layout="creative-agency" to the page root. The primary architecture is a standard top-down flow with a top navigation bar and massive, bold typography dictating the sections. Do NOT use a left sidebar.',
            'Hero-focused Single Page' => 'Add data-layout="hero-focused" to the page root and data-primary-hero to the hero. Make the hero occupy at least 80vh and carry most of the visual weight. Keep all later sections compact; do not let a gallery or card grid become the primary composition.',
            'Horizontal Scroll (Gallery)' => 'Add data-layout="horizontal-scroll" to the page root and data-horizontal-gallery to the primary track. Make the horizontal gallery the primary page architecture. Use a short text-led hero, then a clearly visible horizontal track with at least five cards; do not use a full-bleed cinematic hero or a conventional vertical portfolio grid.',
            'Neumorphism (Soft UI)' => 'Add data-layout="neumorphism" to the page root. Apply the soft raised/inset surface system across the complete page shell, navigation, hero, controls, cards, sections, and footer. Do not mix in flat dark, cinematic, or harsh bordered surfaces.',
        ];

        return $architectures[$layout] ?? self::getGenericLayoutFallback($layout);
    }

    public static function getLayoutSkeleton(string $layout): string
    {
        return match ($layout) {
            'Bento Box UI' => <<<'SKELETON'
REQUIRED BENTO DOM SKELETON:
<body data-layout="bento">
    <main data-bento-grid class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 p-4 lg:p-8">
        <section data-bento-card class="md:col-span-2 md:row-span-2">Hero content</section>
        <section data-bento-card>About content</section>
        <section data-bento-card>Services or work content</section>
        <section data-bento-card>Portfolio content</section>
        <section data-bento-card>Testimonials or pricing content</section>
        <section data-bento-card class="md:col-span-2">Contact content</section>
    </main>
</body>
The navigation may sit immediately before main, but the hero and every primary section must be cards inside this same grid. Do not create a separate full-screen hero.
SKELETON,
            default => 'Use the required page-level data-layout and primary structure marker from the selected layout architecture. Build the navigation, hero, primary content, supporting sections, and footer around that structure.',
        };
    }

    public static function getColorPaletteInstructions(string $palette): string
    {
        $instructions = [
            'High-End Editorial (Beige & Charcoal)' => 'Background: `bg-[#f5f0eb]` or `bg-stone-100`. Text: `text-stone-800`. Accents: `bg-stone-700 text-stone-50`. Buttons: understated charcoal `bg-stone-800 hover:bg-stone-900 text-white`. NO neon, NO saturated primaries.',
            'Dark Mode Minimal (Black & White)' => 'Background: `bg-neutral-950`. Text: `text-neutral-100`. Cards: `bg-neutral-900 border border-neutral-800`. Accents: pure white `text-white` on black buttons. High contrast only — no gray mush.',
            'Vibrant & Playful (Pastels)' => 'Background: `bg-rose-50` or `bg-sky-50`. Accents: pastel blocks — `bg-pink-200`, `bg-lavender-200`, `bg-mint-200`. Text: `text-slate-700`. Buttons: rounded, soft pastel fills with darker text.',
            'Neon Cyberpunk (Dark with glowing accents)' => 'Background: `bg-slate-950`. Neon accents: `text-cyan-400`, `text-fuchsia-400`, `border-cyan-500/50`. Glow shadows: `shadow-[0_0_15px_rgba(34,211,238,0.5)]`. NEVER use beige, cream, or corporate blue.',
            'Earthy & Organic (Greens, Browns, Creams)' => 'Background: `bg-[#faf6f0]` or `bg-green-50`. Text: `text-stone-700`. Accents: `bg-emerald-700`, `bg-amber-700`, `text-emerald-800`. Natural, warm tones throughout.',
            'Classic Corporate (Blues, Grays)' => 'Background: `bg-slate-50`. Primary: `bg-blue-700 text-white`. Secondary text: `text-slate-600`. Cards: `bg-white shadow-sm border border-slate-200`. Professional, trustworthy palette.',
            'Ocean Depth (Navy & Aqua)' => 'Background: `bg-slate-900` or deep navy `bg-[#0c2340]`. Accents: aqua/teal `text-teal-400`, `bg-teal-500`. Gradients: navy-to-teal allowed on hero only.',
            'Sunset Glow (Orange & Purple)' => 'Background: dark or warm cream. Gradient hero: `bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600`. Accents: warm orange CTAs, purple section backgrounds.',
            'Monochrome Gray (Sleek)' => 'Strict grayscale only — `bg-gray-100`, `text-gray-900`, `bg-gray-800` buttons. NO color accents except white/black/gray shades.',
        ];

        return $instructions[$palette] ?? "Apply the '{$palette}' color palette consistently to backgrounds, text, buttons, and accents. Ensure WCAG AA contrast on all text.";
    }

    public static function getTypographyInstructions(string $typography): string
    {
        $instructions = [
            'Elegant Serif (Classic, Luxury)' => 'Load Google Font: Playfair Display (headings) + Lora (body). Apply: `font-serif` on headings with `font-[\'Playfair_Display\']`, body with `font-[\'Lora\']`. Headings: `tracking-wide`, generous letter-spacing.',
            'Modern Sans-Serif (Clean, Tech)' => 'Load Google Font: Inter (all). Apply: `font-sans font-[\'Inter\']` everywhere. Headings: `font-semibold tracking-tight`. Clean, neutral, tech-forward.',
            'Monospaced (Developer, Retro)' => 'Load Google Font: JetBrains Mono or Fira Code. Apply: `font-mono font-[\'JetBrains_Mono\']` on ALL text including headings. Terminal aesthetic.',
            'Bold & Brutalist (Large, High-impact)' => 'Load Google Font: Archivo Black (headings) + Work Sans (body). Headings: `font-black uppercase tracking-tighter text-5xl+`. Raw, confrontational scale.',
            'Playful Rounded (Friendly)' => 'Load Google Font: Nunito or Quicksand. Apply: `font-[\'Nunito\']` with `font-bold` headings, rounded feel. Friendly, approachable sizing.',
            'Handwritten Script (Artistic)' => 'Load Google Font: Caveat or Dancing Script for accent headings, Inter for body. Script font ONLY on hero headline and decorative labels — body stays readable sans.',
            'Display Serif (Fashion)' => 'Load Google Font: Cormorant Garamond or Bodoni Moda. Headings: `font-[\'Cormorant_Garamond\'] font-light text-6xl+`. High-fashion editorial spacing.',
            'Geometric Sans (Architecture)' => 'Load Google Font: Montserrat or Outfit. Apply: `font-[\'Montserrat\'] font-medium tracking-[0.15em] uppercase` on labels, bold on headings. Precise, architectural.',
            'Classic Vintage (Retro, Nostalgic)' => 'Load Google Font: Libre Baskerville (headings) + Source Serif 4 (body). Warm serif throughout. Headings: `font-[\'Libre_Baskerville\']`. Slightly condensed line-height.',
        ];

        return $instructions[$typography] ?? "Apply the '{$typography}' typography consistently. Load appropriate Google Fonts via CDN in <head> and apply font-family classes throughout.";
    }

    public static function getIconInstructions(string $typography): string
    {
        $typography = strtolower($typography);

        if (str_contains($typography, 'sans-serif')) {
            return <<<'ICON'
Use clean modern outline SVG icons: stroke-width="1.5", stroke-linecap="round", stroke-linejoin="round", fill="none", w-5 h-5 or w-6 h-6.
Keep icon geometry simple, consistent, and utility-focused so it matches a modern sans-serif interface. Avoid ornate, chunky, or filled icon sets.
ICON;
        }

        if (str_contains($typography, 'serif') || str_contains($typography, 'elegant') || str_contains($typography, 'display') || str_contains($typography, 'fashion')) {
            return <<<'ICON'
Use elegant thin-line SVG icons ONLY: stroke (not fill), stroke-width="1", stroke-linecap="round", stroke-linejoin="round", no fill or fill="none".
Example path style: delicate envelope, phone, map-pin icons at w-5 h-5. Match the refined serif aesthetic — never use chunky solid icons.
ICON;
        }

        if (str_contains($typography, 'playful') || str_contains($typography, 'rounded') || str_contains($typography, 'friendly')) {
            return <<<'ICON'
Use playful rounded SVG icons: stroke-width="2", stroke-linecap="round", stroke-linejoin="round", optionally with soft duotone fills (light fill + darker stroke).
Icons should feel friendly and bubbly at w-6 h-6. Rounded rectangles and circles in icon shapes preferred over sharp angles.
ICON;
        }

        if (str_contains($typography, 'brutalist') || str_contains($typography, 'high-impact') || str_contains($typography, 'bold')) {
            return <<<'ICON'
Use bold solid-fill SVG icons ONLY: fill="currentColor", no stroke, thick geometric shapes. Icons at w-7 h-7 minimum.
Blocky, heavy icons matching brutalist typography — square envelopes, solid circles, filled arrows. Never thin outline icons.
ICON;
        }

        if (str_contains($typography, 'monospaced') || str_contains($typography, 'developer') || str_contains($typography, 'retro')) {
            return <<<'ICON'
Use technical geometric SVG icons: stroke-width="1.5", sharp corners (stroke-linecap="square"), pixel-perfect alignment, w-5 h-5.
Terminal/code aesthetic — bracket-style icons, sharp arrows, grid-aligned paths. No rounded playful icons.
ICON;
        }

        if (str_contains($typography, 'handwritten') || str_contains($typography, 'script') || str_contains($typography, 'artistic')) {
            return <<<'ICON'
Use organic, slightly irregular stroke SVG icons: stroke-width="1.5", stroke-linecap="round", hand-drawn feel with subtle curve in paths.
Icons should feel artistic and human — w-5 h-5, outline style with gentle curves, not mechanical geometry.
ICON;
        }

        if (str_contains($typography, 'geometric') || str_contains($typography, 'architecture')) {
            return <<<'ICON'
Use precise geometric SVG icons: stroke-width="1.5", stroke-linecap="butt", sharp 90° angles, grid-aligned at w-5 h-5.
Architectural precision — triangles, squares, clean lines. No rounded or playful icon styles.
ICON;
        }

        if (str_contains($typography, 'vintage') || str_contains($typography, 'classic')) {
            return <<<'ICON'
Use vintage line-art SVG icons: stroke-width="1.25", stroke-linecap="round", slightly ornamental paths at w-5 h-5.
Classic iconography — simple line envelopes, classic phone handset, compass. Evoke retro print design, not modern app icons.
ICON;
        }

        return <<<'ICON'
Use clean modern outline SVG icons: stroke-width="1.5", stroke-linecap="round", stroke-linejoin="round", fill="none", w-5 h-5 or w-6 h-6.
Standard tech/SaaS icon style matching Modern Sans-Serif typography. Consistent sizing throughout the page.
ICON;
    }

    public static function getResponsiveRules(): string
    {
        return <<<'RULES'
MANDATORY RESPONSIVE RULES (apply to EVERY element):
1. `<body class="overflow-x-hidden antialiased">` — prevents horizontal page scroll.
2. `<meta name="viewport" content="width=device-width, initial-scale=1.0">` in <head>.
3. Add `min-w-0` to flex/grid children that contain text or media.
4. All headings use fluid scaling: `text-3xl sm:text-5xl md:text-6xl lg:text-7xl` — NEVER a fixed massive size on mobile.
5. All headings and long text: `break-words max-w-full` to prevent overflow.
6. All grids: `grid-cols-1` on mobile, multi-column ONLY at `sm:` or `md:` breakpoints.
7. Section padding: `px-4 sm:px-6 lg:px-8 py-16 sm:py-24`.
8. Flex rows that are side-by-side on desktop: `flex-col lg:flex-row` with `gap-6 lg:gap-8`.
9. Images and media: always `block w-full max-w-full h-auto object-cover`; never fixed pixel widths exceeding the viewport.
10. Long URLs, code, and buttons must wrap or scroll inside their own container, never expand the page.
11. Navigation: hamburger visible `md:hidden`, desktop links `hidden md:flex`.
12. Touch targets on mobile: buttons/links minimum `min-h-11 py-3 px-4`.
13. Test the complete page at 375px, 768px, and 1440px. There must be no document-level horizontal overflow at any width.
RULES;
    }

    public static function getQualityGateInstructions(): string
    {
        return <<<'GATE'
QUALITY GATE — complete this audit before returning HTML:
- Confirm the selected layout is visible in the DOM structure, not only in colors or copy. The first viewport and primary content block must match the named wireframe.
- Confirm every required section exists exactly once with a meaningful id or semantic landmark.
- Confirm the selected palette and typography are applied to the page shell, headings, body copy, controls, and cards consistently.
- Confirm every icon is an inline SVG and follows the selected icon geometry, stroke/fill, and weight. Never substitute emoji or a generic icon font.
- Confirm the output is rendered HTML, never React/JSX/template source. Do not return `{...map(...)}`, JSX components, template directives, or interpolation syntax.
- Confirm the mobile navigation has the exact `menu-toggle` and `mobile-menu` ids, starts closed, updates `aria-expanded`, and animates max-height and opacity without `hidden`, `display:none`, or `invisible`.
- Confirm no fixed width, oversized unprefixed text, absolute positioning, table, or media element can exceed 375px. Use `min-w-0`, wrapping, and mobile-first breakpoints.
- If any check fails, repair the markup and script before returning the document.
GATE;
    }

    public static function getMobileNavTemplate(): string
    {
        return <<<'TEMPLATE'
MANDATORY MOBILE NAVIGATION PATTERN — copy this structure exactly:

HTML:
<nav class="sticky top-0 z-50 ...">
  <div class="flex items-center justify-between px-4 py-4">
    <!-- logo -->
    <div class="hidden md:flex gap-6"><!-- desktop links --></div>
    <button id="menu-toggle" type="button" class="md:hidden p-2" aria-label="Toggle menu" aria-expanded="false">
      <!-- inline SVG hamburger icon matching typography icon style -->
    </button>
  </div>
  <div id="mobile-menu" class="md:hidden overflow-hidden transition-all duration-300 ease-in-out max-h-0 opacity-0">
    <div class="flex flex-col gap-2 px-4 pb-4"><!-- mobile nav links --></div>
  </div>
</nav>

JavaScript (place before </body>):
<script>
(function () {
  var toggle = document.getElementById('menu-toggle');
  var menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', function () {
    var isOpen = menu.classList.contains('max-h-screen');
    menu.classList.toggle('max-h-0', isOpen);
    menu.classList.toggle('opacity-0', isOpen);
    menu.classList.toggle('max-h-screen', !isOpen);
    menu.classList.toggle('opacity-100', !isOpen);
    menu.style.maxHeight = isOpen ? '0px' : menu.scrollHeight + 'px';
    toggle.setAttribute('aria-expanded', String(!isOpen));
    menu.setAttribute('aria-hidden', String(isOpen));
  });
})();
</script>

CRITICAL: NEVER toggle `hidden`, `display:none`, or `invisible` on the mobile menu — that breaks CSS transitions.
The closed state is `max-h-0 opacity-0`. The open state is `max-h-screen opacity-100`.
TEMPLATE;
    }

    /**
     * @param  array<string, string>  $parsed
     */
    public static function buildHtmlGenerationConstraints(array $parsed, string $projectName): string
    {
        $layout = $parsed['layout'] ?? '';
        $colorPalette = $parsed['colorPalette'] ?? '';
        $typography = $parsed['typography'] ?? '';
        $contentSections = $parsed['contentSections'] ?? '';

        $layoutInstructions = self::getLayoutInstructions($layout);
        $layoutArchitecture = self::getLayoutArchitecture($layout);
        $layoutSkeleton = self::getLayoutSkeleton($layout);
        $colorInstructions = self::getColorPaletteInstructions($colorPalette);
        $typographyInstructions = self::getTypographyInstructions($typography);
        $iconInstructions = self::getIconInstructions($typography);
        $responsiveRules = self::getResponsiveRules();
        $mobileNavTemplate = self::getMobileNavTemplate();
        $qualityGate = self::getQualityGateInstructions();

        return <<<EOT
<mandatory_constraints priority="HIGHEST">
These constraints OVERRIDE any conflicting instruction below. Failure to follow them means the output is rejected.

PROJECT: "{$projectName}"
REQUIRED SECTIONS: {$contentSections}
SELECTED LAYOUT: "{$layout}"
SELECTED COLOR PALETTE: "{$colorPalette}"
SELECTED TYPOGRAPHY: "{$typography}"

=== PAGE-LEVEL LAYOUT ARCHITECTURE (HIGHEST PRIORITY) ===
The selected layout controls the complete page composition, including navigation, hero, primary content, supporting sections, and footer.
{$layoutArchitecture}
Do not satisfy the layout by styling only one section. Do not combine it with a competing layout. If the draft conflicts, rewrite the structure before returning HTML.

=== REQUIRED PAGE STRUCTURE ===
{$layoutSkeleton}

=== LAYOUT WIREFRAME (NON-NEGOTIABLE) ===
{$layoutInstructions}

=== COLOR PALETTE (NON-NEGOTIABLE) ===
{$colorInstructions}

=== TYPOGRAPHY (NON-NEGOTIABLE) ===
{$typographyInstructions}
Include Google Fonts <link> tags in <head> for the specified fonts.

=== ICON STYLE (NON-NEGOTIABLE) ===
{$iconInstructions}
STRICTLY FORBIDDEN: emojis (📷, ✉, 📍, ★, etc). Use inline SVG icons ONLY, styled per above.

=== RESPONSIVE DESIGN (NON-NEGOTIABLE) ===
{$responsiveRules}

=== FINAL QUALITY GATE (NON-NEGOTIABLE) ===
{$qualityGate}

=== MOBILE NAVIGATION (NON-NEGOTIABLE) ===
{$mobileNavTemplate}

=== USER DATA TO INJECT ===
Bio: {$parsed['aboutBio']}
Email: {$parsed['contactEmail']} | Phone: {$parsed['contactPhone']} | Address: {$parsed['contactAddress']}
Social Links: {$parsed['socialLinks']}
Description: {$parsed['description']}
Additional Details: {$parsed['additionalDetails']}

=== OUTPUT FORMAT ===
Return ONLY raw valid HTML5 starting with <!DOCTYPE html>.
Include Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
Include Google Fonts links in <head>.
No markdown. No code fences. No explanations.
</mandatory_constraints>
EOT;
    }

    private static function getGenericLayoutFallback(string $layout): string
    {
        return "Build a clean, highly responsive single-page layout matching the '{$layout}' style with generous padding, vertical flow, and mobile-first grid breakpoints.";
    }
}
