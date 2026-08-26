<?php

namespace App\Jobs;

use App\Models\Project;
use App\Services\GeneratePromptServices;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class GenerateWebsiteJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Project $project
    ) {}

    /**
     * Execute the job.
     */
    public function handle(GeneratePromptServices $services): void
    {
        $services->generatePrompt($this->project);
        $services->generateHtml($this->project);
    }
}
