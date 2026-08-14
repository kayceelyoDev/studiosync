<?php

use App\Http\Controllers\GenerateAiPromtPage;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

/*
|--------------------------------------------------------------------------
| Client Routes (all authenticated & verified users)
|--------------------------------------------------------------------------
| Accessible by: super_admin, admin, client
*/
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [GenerateAiPromtPage::class, 'showProject'])->name('dashboard');
    Route::get('/generate-prompt', [GenerateAiPromtPage::class, 'index'])->name('generate-prompt.index');
    Route::post('/generate-prompt', [GenerateAiPromtPage::class, 'generatePrompt'])->name('generate-prompt.store');
});

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
| Accessible by: super_admin, admin
*/
Route::middleware(['auth', 'verified', 'role:super_admin,admin'])->prefix('admin')->name('admin.')->group(function () {
    // Admin-only routes will go here, e.g.:
    // Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
    // Route::get('/workspaces', [AdminWorkspaceController::class, 'index'])->name('workspaces.index');
});

/*
|--------------------------------------------------------------------------
| Super Admin Routes
|--------------------------------------------------------------------------
| Accessible by: super_admin only
*/
Route::middleware(['auth', 'verified', 'role:super_admin'])->prefix('super-admin')->name('super-admin.')->group(function () {
    // Super admin routes will go here, e.g.:
    // Route::get('/settings', [SuperAdminController::class, 'index'])->name('settings');
    // Route::resource('/roles', RoleController::class);
});

require __DIR__.'/settings.php';
