<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$services = app(\App\Services\GeneratePromptServices::class);
$html = <<<HTML
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <title>Test</title>
</head>
<body>
    <nav id="nav-bar">
        <button id="menu-toggle"></button>
        <div id="mobile-menu"></div>
    </nav>
    <div id="toast-notification"></div>
    <script>
        const menu = document.getElementById('mobile' + '-menu');
        const toggle = document.getElementById('menu' + '-toggle');
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    </script>
</body>
</html>
HTML;

$reflection = new \ReflectionClass($services);
$method = $reflection->getMethod('postProcessHtml');
$method->setAccessible(true);
$clean = $method->invoke($services, $html);

echo "Result:\n" . $clean;
