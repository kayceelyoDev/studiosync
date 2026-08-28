<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$project = \App\Models\Project::find(47);
echo str_contains($project->html_content, 'target.scrollIntoView') ? "Script PRESENT in 47\n" : "Script MISSING in 47\n";
echo str_contains($project->html_content, 'prevent ALL default') ? "Comments PRESENT in 47\n" : "Comments MISSING in 47\n";
