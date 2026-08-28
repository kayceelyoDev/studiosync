<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$project = \App\Models\Project::latest()->first();

$html = $project->html_content;

// Remove the old scrollRightBtn block
$html = preg_replace('/const scrollRightBtn = e\.target\.closest\(\'\[data-action="scroll-right"\]\'\);.*?return;\s*\}/is', '', $html);

// Inject the new scrollBtn block right after document.addEventListener('click', function (e) {
$newScript = <<<JS
        const scrollBtn = e.target.closest('[data-action="scroll-right"], [data-action="scroll-left"]');
        if (scrollBtn) {
            e.preventDefault();
            const action = scrollBtn.getAttribute('data-action');
            const section = scrollBtn.closest('section') || scrollBtn.closest('header') || document;
            const gallery = section.querySelector('.overflow-x-auto, [data-horizontal-gallery]');
            
            if (gallery) {
                const card = gallery.querySelector('article, div.snap-center, img');
                const scrollAmount = card ? card.offsetWidth + 24 : (window.innerWidth > 768 ? window.innerWidth * 0.4 : window.innerWidth * 0.8);
                
                if (action === 'scroll-right') {
                    gallery.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                } else {
                    gallery.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
                }
            }
            return;
        }
JS;

$html = str_replace("document.addEventListener('click', function (e) {\n", "document.addEventListener('click', function (e) {\n" . $newScript . "\n", $html);

// Inject the new CSS
$html = str_replace("[data-horizontal-gallery] { scrollbar-width: none; -ms-overflow-style: none; }\n[data-horizontal-gallery]::-webkit-scrollbar { display: none; }", ".overflow-x-auto { scrollbar-width: none; -ms-overflow-style: none; }\n.overflow-x-auto::-webkit-scrollbar { display: none; }", $html);

$project->html_content = $html;
$project->save();

echo "Patched Project ID: " . $project->id;
