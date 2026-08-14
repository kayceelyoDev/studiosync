<?php

use App\Http\Controllers\GenerateAiPromtPage;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [GenerateAiPromtPage::class, 'showProject'])->name('dashboard');
    // AI Prompt Generation Routes
    Route::get('/generate-prompt', [GenerateAiPromtPage::class, 'index'])->name('generate-prompt.index');
    Route::post('/generate-prompt', [GenerateAiPromtPage::class, 'generatePrompt'])->name('generate-prompt.store');
});

require __DIR__.'/settings.php';
