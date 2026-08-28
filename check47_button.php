<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$html = \App\Models\Project::find(47)->html_content;
$pos = strpos($html, 'EXPLORE CAPABILITIES');
if ($pos !== false) {
    echo substr($html, max(0, $pos - 300), 500);
} else {
    echo "EXPLORE CAPABILITIES not found in 47.\n";
}
