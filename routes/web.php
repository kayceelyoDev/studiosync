<?php

use App\Http\Controllers\AdminWorkspaceController;
use App\Http\Controllers\GenerateAiPromtPage;
use App\Http\Controllers\WorkspaceController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

/*
|--------------------------------------------------------------------------
| Client Routes (all authenticated & verified users)
|--------------------------------------------------------------------------
| Accessible by: super_admin, admin, client
*/
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [WorkspaceController::class, 'index'])->name('dashboard');
    Route::get('/workspaces/create', [WorkspaceController::class, 'create'])->name('workspaces.create');
    Route::post('/workspaces', [WorkspaceController::class, 'store'])->name('workspaces.store');
    Route::get('/workspaces/{workspace}', [WorkspaceController::class, 'show'])->name('workspaces.show');
    Route::get('/generate-prompt', [GenerateAiPromtPage::class, 'index'])->name('generate-prompt.index');
    Route::post('/generate-prompt', [GenerateAiPromtPage::class, 'generatePrompt'])->name('generate-prompt.store');
    Route::get('/projects/{project}/status', [GenerateAiPromtPage::class, 'checkStatus'])->name('projects.status');
    Route::get('/projects/{project}', [GenerateAiPromtPage::class, 'show'])->name('projects.show');
});

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
| Accessible by: super_admin, admin
*/
Route::middleware(['auth', 'verified', 'role:super_admin,admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/projects', [AdminWorkspaceController::class, 'index'])->name('projects.index');
    Route::get('/projects/{project}', [AdminWorkspaceController::class, 'show'])->name('projects.show');
    Route::put('/projects/{project}', [AdminWorkspaceController::class, 'update'])->name('projects.update');
});

/*
|--------------------------------------------------------------------------
| Super Admin Routes
|--------------------------------------------------------------------------
| Accessible by: super_admin only
*/
Route::middleware(['auth', 'verified', 'role:super_admin'])->prefix('super-admin')->name('super-admin.')->group(function () {
    // Super admin routes will go here, e.g.:\
    // Route::get('/settings', [SuperAdminController::class, 'index'])->name('settings');
    // Route::resource('/roles', RoleController::class);
});

require __DIR__.'/settings.php';
