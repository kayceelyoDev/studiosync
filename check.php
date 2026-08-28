<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

foreach (\App\Models\Project::latest()->take(5)->get() as $p) {
    echo "{$p->id} - {$p->status} - {$p->created_at}\n";
}
