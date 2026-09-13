<?php

use App\Models\ProjectAsset;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Storage;

test('r2 disk is registered in filesystems config with expected defaults', function () {
    $r2Config = config('filesystems.disks.r2');

    expect($r2Config)->toBeArray()
        ->and($r2Config['driver'])->toBe('s3')
        ->and($r2Config['region'])->toBe('auto')
        ->and($r2Config['throw'])->toBeTrue()
        ->and($r2Config['use_path_style_endpoint'])->toBeFalse();
});

test('r2 disk supports storage operations when faked', function () {
    Storage::fake('r2');

    Storage::disk('r2')->put('assets/test.txt', 'Hello Cloudflare R2');

    expect(Storage::disk('r2')->exists('assets/test.txt'))->toBeTrue()
        ->and(Storage::disk('r2')->get('assets/test.txt'))->toBe('Hello Cloudflare R2');

    Storage::disk('r2')->delete('assets/test.txt');

    expect(Storage::disk('r2')->exists('assets/test.txt'))->toBeFalse();
});

test('project asset defaults to r2 disk and resolves url', function () {
    Config::set('filesystems.disks.r2.url', 'https://pub-example.r2.dev');

    $asset = new ProjectAsset([
        'name' => 'logo.png',
        'path' => 'projects/1/logo.png',
    ]);

    expect($asset->disk)->toBe('r2')
        ->and($asset->url)->toBe('https://pub-example.r2.dev/projects/1/logo.png');
});
