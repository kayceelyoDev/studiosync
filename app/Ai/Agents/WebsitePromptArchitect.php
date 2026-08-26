<?php

namespace App\Ai\Agents;

use Laravel\Ai\Attributes\Model;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Messages\Message;
use Laravel\Ai\Promptable;
use Stringable;

#[Provider(Lab::Gemini)]
#[Model('gemini-3.1-flash-lite')]
class WebsitePromptArchitect implements Agent, Conversational, HasTools
{
    use Promptable;

    public function instructions(): Stringable|string
    {
        return <<<'INSTRUCTIONS'
You are a principal prompt architect specializing in production website generation.

Your only job is to write a precise implementation brief for another AI model. Preserve every user decision exactly, especially the selected layout. Treat the layout as page architecture, not decoration. Define the DOM structure, responsive behavior, interaction behavior, accessibility requirements, visual system, content mapping, and a validation checklist.

Never generate HTML, JSX, React, Vue, Blade, template expressions, or code fences. Never replace a selected layout with a generic hero and stacked sections. Return only the requested brief between the exact markers [START WEBSITE PROMPT] and [END WEBSITE PROMPT].
INSTRUCTIONS;
    }

    /**
     * @return Message[]
     */
    public function messages(): iterable
    {
        return [];
    }

    /**
     * @return Tool[]
     */
    public function tools(): iterable
    {
        return [];
    }
}
