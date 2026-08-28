<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Project;

$script = <<<'JS'
<script>
    setTimeout(() => {
        const toast = document.getElementById('toast-notification');
        if(toast) {
            toast.classList.remove('translate-y-20', 'opacity-0');
            setTimeout(() => toast.classList.add('translate-y-20', 'opacity-0'), 4000);
        }
    }, 1500);

    document.addEventListener('click', function (e) {
        const anchor = e.target.closest('a');
        if (!anchor) return;

        e.preventDefault();

        let href = anchor.getAttribute('href');
        if (!href || href === '#') return;

        if (href.startsWith('http') || href.startsWith('mailto:')) {
            window.open(href, '_blank');
            return;
        }

        const targetId = href.replace(/^[/#]+/, '').split('?')[0];
        if (!targetId) return;

        let target = document.getElementById(targetId);
        if (!target) {
            const sections = Array.from(document.querySelectorAll('section[id], nav[id], footer[id], div[id]'));
            target = sections.find(s => s.id.toLowerCase().includes(targetId.toLowerCase()) || targetId.toLowerCase().includes(s.id.toLowerCase()));
        }

        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });

            const menu = document.getElementById('mobile' + '-menu');
            const toggle = document.getElementById('menu' + '-toggle');
            if (menu && toggle && !menu.classList.contains('max-h-0')) {
                toggle.click();
            }
        }
    });

    document.addEventListener('submit', function(e) {
        e.preventDefault();
    });
</script>
JS;

$projects = Project::where('status', 'completed')->get();
$patched = 0;

foreach ($projects as $project) {
    if (!str_contains($project->html_content, "target.scrollIntoView")) {
        $html = str_replace('</body>', $script . "\n</body>", $project->html_content);
        $project->update(['html_content' => $html]);
        $patched++;
    }
}

echo "Patched {$patched} projects.\n";
