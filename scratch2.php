<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$project = \App\Models\Project::latest()->first();
echo substr($project->html_content, strpos($project->html_content, '<nav '), 2000);
