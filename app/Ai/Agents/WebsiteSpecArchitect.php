<?php

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\JsonSchema\Types\Type;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Promptable;
use Stringable;

class WebsiteSpecArchitect implements Agent, HasStructuredOutput
{
    use Promptable;

    public function provider(): array
    {
        return [
            'gemini' => 'gemini-3.5-flash-lite',
            'gemini-fallback' => 'gemini-3.1-flash-lite',
        ];
    }

    public function instructions(): Stringable|string
    {
        return <<<'INSTRUCTIONS'
You are a website specification architect. Given user preferences for a website, produce a structured JSON specification that captures the site type, section breakdown, visual theme, and copy.

Rules:
- Decompose the requested content into discrete sections, each with a unique id (kebab-case), a type from the allowed enum, and a priority (1 = appears first).
- Always include a "nav" section (priority 1) and a "footer" section (highest priority number / last) even if the user did not request them.
- For layouts that require many visual blocks (e.g. Bento Box UI), produce at least 6 content sections so the grid has enough cells.
- Resolve the user's color palette preference into concrete hex color values for each role. Match the palette description faithfully.
- Map the user's typography preference to the closest type scale: compact (monospaced, developer), standard (sans-serif, geometric, playful), editorial (serif, script, vintage), or display (brutalist, high-impact).
- The layoutStyle field must be the user's selected layout name reproduced verbatim.
- Write concise, on-brand copy for every section based on the user's description and preferences.
INSTRUCTIONS;
    }

    /**
     * @return array<string, Type>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'siteType' => $schema->string()
                ->enum(['portfolio', 'business', 'landing', 'blog', 'ecommerce'])
                ->required(),

            'sections' => $schema->array()->items(
                $schema->object([
                    'id' => $schema->string()->description('Unique kebab-case identifier for the section')->required(),
                    'type' => $schema->string()->enum([
                        'hero', 'nav', 'features', 'about', 'gallery', 'testimonials',
                        'pricing', 'contact', 'footer', 'cta', 'services', 'portfolio',
                        'team', 'blog', 'faq', 'skills',
                    ])->required(),
                    'priority' => $schema->integer()->min(1)->description('Display order, 1 = first')->required(),
                ])
            )->min(3)->required(),

            'theme' => $schema->object([
                'colorRoles' => $schema->object([
                    'primary' => $schema->string()->description('Primary accent hex color')->required(),
                    'secondary' => $schema->string()->description('Secondary accent hex color')->required(),
                    'background' => $schema->string()->description('Page background hex color')->required(),
                    'surface' => $schema->string()->description('Card/surface hex color')->required(),
                    'text' => $schema->string()->description('Primary text hex color')->required(),
                    'textMuted' => $schema->string()->description('Muted/secondary text hex color')->required(),
                ])->required(),
                'typeScale' => $schema->string()->enum(['compact', 'standard', 'editorial', 'display'])->required(),
                'layoutStyle' => $schema->string()->description('The user-selected layout name, verbatim')->required(),
            ])->required(),

            'copy' => $schema->array()->items(
                $schema->object([
                    'sectionId' => $schema->string()->description('Must match a section id')->required(),
                    'text' => $schema->string()->description('Short copy for this section')->required(),
                ])
            )->min(1)->required(),
        ];
    }
}
