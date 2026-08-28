<?php

namespace App\Jobs;

use App\Models\Project;
use App\Services\GeneratePromptServices;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Log;

class GenerateWebsiteJob implements ShouldQueue
{
    use Queueable;

    public int $timeout = 55;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Project $project
    ) {}

    /**
     * Step 1: Generate the website spec (structured prompt).
     * Step 2: Dispatch a batch of GenerateSectionJobs — one per section.
     * Step 3: When the batch finishes, AssembleWebsiteJob stitches them together.
     */
    public function handle(GeneratePromptServices $services): void
    {
        // ── Step 1: Generate the spec ──
        $services->generatePrompt($this->project);
        $this->project->refresh();

        $spec = json_decode($this->project->generated_prompt, true);

        if (! is_array($spec) || empty($spec['sections'])) {
            Log::error('Invalid or missing website spec after prompt generation.', [
                'project_id' => $this->project->id,
            ]);
            $this->project->update(['status' => 'failed']);

            return;
        }

        $parsed = $services->parsePreferences($this->project->preferences ?? []);
        $sections = collect($spec['sections'])->sortBy('priority')->values()->all();
        $sectionIndices = array_keys($sections);

        // ── Step 2: Build a batch of section jobs ──
        $sectionJobs = [];
        foreach ($sections as $index => $section) {
            $sectionJobs[] = new GenerateSectionJob(
                projectId: $this->project->id,
                section: $section,
                index: $index,
                spec: $spec,
                parsed: $parsed,
            );
        }

        $projectId = $this->project->id;
        $projectName = $this->project->project_name ?? 'Untitled';

        Bus::batch($sectionJobs)
            ->name("generate-website-{$projectId}")
            ->then(function () use ($projectId, $spec, $parsed, $projectName, $sectionIndices) {
                // All sections generated successfully — dispatch assembly
                AssembleWebsiteJob::dispatch(
                    projectId: $projectId,
                    spec: $spec,
                    parsed: $parsed,
                    projectName: $projectName,
                    sectionIndices: $sectionIndices,
                );
            })
            ->catch(function () use ($projectId) {
                Log::error('Website generation batch failed.', ['project_id' => $projectId]);
                Project::where('id', $projectId)->update(['status' => 'failed']);
            })
            ->dispatch();
    }
}
