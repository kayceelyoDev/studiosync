<?php

namespace App\Jobs;

use App\Models\Project;
use App\Services\GeneratePromptServices;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class AssembleWebsiteJob implements ShouldQueue
{
    use Queueable;

    public int $timeout = 55;

    public int $tries = 2;

    /**
     * @param  array<string, mixed>  $spec
     * @param  array<string, string>  $parsed
     * @param  list<int>  $sectionIndices  The ordered indices used as cache keys.
     */
    public function __construct(
        public int $projectId,
        public array $spec,
        public array $parsed,
        public string $projectName,
        public array $sectionIndices,
    ) {}

    public function handle(GeneratePromptServices $services): void
    {
        $project = Project::findOrFail($this->projectId);

        try {
            $project->update(['status' => 'reviewing_html']);

            // ── Collect all section HTML from cache ──
            $htmlParts = [];
            foreach ($this->sectionIndices as $index) {
                $cacheKey = "project_{$this->projectId}_section_{$index}";
                $html = Cache::get($cacheKey);

                if ($html === null) {
                    throw new \RuntimeException("Missing cached HTML for section index {$index}.");
                }

                $htmlParts[] = $html;
            }

            // ── Assemble into a full document ──
            $assembledHtml = $services->assembleSections($htmlParts, $this->spec, $this->parsed, $this->projectName);

            $services->saveWithLayoutRepair($project, $assembledHtml, $this->parsed);
        } catch (\Exception $e) {
            Log::error('Exception during website assembly: '.$e->getMessage());
            $project->update(['status' => 'failed']);

            throw $e;
        }
    }
}
