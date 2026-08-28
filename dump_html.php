<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$p = \App\Models\Project::latest()->first();
file_put_contents('latest_project.html', $p->html_content);
echo "Dumped project " . $p->id . "\n";
