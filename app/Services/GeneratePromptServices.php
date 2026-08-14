<?php

namespace App\Services;

use App\Ai\Agents\WebpageGenerator;
use App\Models\Workspaces;

class GeneratePromptServices
{
    public function generatePrompt(array $data): string
    {
        $preferences = $data['preferences'] ?? [];
        $projectName = $data['project_name'] ?? 'Untitled';

        try {
            $preferencesText = implode("\n- ", $preferences);

            $promptRequest = <<<EOT
You are an elite Prompt Engineer. Your task is to write the ultimate System Prompt for a coding AI (Google AI Studio) to generate a website.

CLIENT PREFERENCES:
- Project Name: {$projectName}
- {$preferencesText}

You MUST output your response in the EXACT format below. Do not add any text outside of the [START PROMPT] and [END PROMPT] markers. Do not summarize. You must expand on the design system and content sections.

[START PROMPT]
**Role & Mission:**
You are an elite Frontend Developer and UI/UX Designer. Your mission is to build a high-fidelity, responsive, single-page website for "{$projectName}".

**Design System & Aesthetics:**
[Write a full paragraph explicitly instructing the AI on exactly what colors to use, what typography to use, and how to apply the layout style requested in the client preferences above. Be highly descriptive about the visual vibe.]

**Content & Sections:**
[Write a full paragraph explicitly listing the required sections from the client preferences (like Hero, About, Gallery, etc.) and instructing the AI how to structure them.]

**Technical Constraints:**
- Use ONLY raw HTML5 and Tailwind CSS via CDN.
- If the website requires multiple pages/sections (like About, Portfolio, Contact), you MUST make the navigation fully functional within this single file. Do NOT leave dead links (`href='#'`). Use smooth-scrolling anchor links (`href='#section-id'`) or include vanilla JavaScript to toggle the visibility of different section `<div>`s to simulate a full multi-page experience.
- Enforce modern aesthetics like glassmorphism, fluid typography, smooth hover states, and micro-animations.
- OUTPUT ONLY VALID HTML CODE. Do NOT output markdown backticks (no ```html). Do NOT output conversational text. Just the raw HTML document.
[END PROMPT]
EOT;

            $response = (new WebpageGenerator())->prompt($promptRequest);

            // Clean up the output by stripping the markers if the AI included them
            $craftedPrompt = str_replace(['[START PROMPT]', '[END PROMPT]'], '', $response->text);
            $craftedPrompt = trim($craftedPrompt);

            Workspaces::create([
                'user_id' => auth()->id(),
                'project_name'=> $data['project_name'] ?? 'Untitled',
                'preferences'=> json_encode($preferences),
                'generated_prompt'=> $craftedPrompt,
                'status'=>'pending',
            ]);
        } catch (\Exception $e) {
            // Log the error properly instead of dumping HTML to the API response
            \Illuminate\Support\Facades\Log::error("Exception during AI prompt generation: " . $e->getMessage());

            // Re-throw so the controller stops execution and returns a 500 JSON error
            throw $e;
        }

        return $craftedPrompt;
    }
}
