<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$services = app(\App\Services\GeneratePromptServices::class);
$spec = ['theme' => ['colorRoles' => [], 'layoutStyle' => '']];
$parsed = [];
$html = $services->assembleSections([], $spec, $parsed, 'Test');

echo "AFTER ASSEMBLE:\n";
echo substr($html, -1000);

echo "\n\nAFTER POSTPROCESS:\n";
$reflection = new \ReflectionClass($services);
$method = $reflection->getMethod('postProcessHtml');
$method->setAccessible(true);
$clean = $method->invoke($services, $html);
echo substr($clean, -1000);
