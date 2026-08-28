<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

preg_match_all('/<script\b[^>]*>(.*?)<\/script>/is', \App\Models\Project::find(47)->html_content, $matches);
print_r($matches[0]);
