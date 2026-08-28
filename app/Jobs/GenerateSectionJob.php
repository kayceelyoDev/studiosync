<?php

namespace App\Jobs;

use App\Services\GeneratePromptServices;
use Illuminate\Bus\Batchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class GenerateSectionJob implements ShouldQueue
{
    use Batchable, Queueable;

    /**
     * Each section gets its own timeout — generous enough for one AI call
     * plus up to 2 repair passes, but well under the 60-second worker limit.
     */
    public int $timeout = 55;

    public int $tries = 2;

    /**
     * @param  array{id: string, type: string, priority: int}  $section
     * @param  array<string, mixed>  $spec
     * @param  array<string, string>  $parsed
     */
    public function __construct(
        public int $projectId,
        public array $section,
        public int $index,
        public array $spec,
        public array $parsed,
    ) {}

    public function handle(GeneratePromptServices $services): void
    {
        if ($this->batch()?->cancelled()) {
            return;
        }

        $html = $services->generateSection($this->section, $this->spec, $this->parsed);

        // ── Validate deterministically and repair failures ──
        $result = $services->validateSection($html, $this->section, $this->spec['theme']);

        if (! $result['passed']) {
            for ($attempt = 0; $attempt < 2; $attempt++) {
                $html = $services->repairSection(
                    $html,
                    $result['errors'],
                    $this->section,
                    $this->spec
                );

                $result = $services->validateSection($html, $this->section, $this->spec['theme']);

                if ($result['passed']) {
                    break;
                }
            }

            if (! $result['passed']) {
                Log::warning('Section failed validation after 2 repair attempts, keeping best attempt.', [
                    'project_id' => $this->projectId,
                    'section_id' => $this->section['id'],
                    'errors' => $result['errors'],
                ]);
            }
        }

        // Store the generated HTML fragment in cache for assembly later.
        // TTL of 2 hours is generous — assembly runs immediately after the batch finishes.
        Cache::put(
            "project_{$this->projectId}_section_{$this->index}",
            $html,
            now()->addHours(2)
        );
    }
}
