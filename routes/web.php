<?php

use App\Http\Controllers\Admin\ClientRequestCommentController as AdminClientRequestCommentController;
use App\Http\Controllers\Admin\ClientRequestController as AdminClientRequestController;
use App\Http\Controllers\Admin\ContactEmailerController as AdminContactEmailerController;
use App\Http\Controllers\AdminWorkspaceController;
use App\Http\Controllers\ClientRequestCommentController;
use App\Http\Controllers\ClientRequestController;
use App\Http\Controllers\ContactFormController;
use App\Http\Controllers\ContactMessageController;
use App\Http\Controllers\DeploymentController;
use App\Http\Controllers\GenerateAiPromtPage;
use App\Http\Controllers\ProjectAssetController;
use App\Http\Controllers\VercelWebhookController;
use App\Http\Controllers\WorkspaceController;
use App\Models\Project;
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
    Route::get('/projects/{project}/edit', [GenerateAiPromtPage::class, 'edit'])->name('projects.edit');
    Route::put('/projects/{project}', [GenerateAiPromtPage::class, 'update'])->name('projects.update');
    Route::get('/projects/{project}/assets', [ProjectAssetController::class, 'index'])->name('projects.assets.index');
    Route::post('/projects/{project}/assets', [ProjectAssetController::class, 'store'])->name('projects.assets.store');
    Route::post('/projects/{project}/assets/{asset}/replace', [ProjectAssetController::class, 'replace'])->name('projects.assets.replace');
    Route::patch('/projects/{project}/assets/{asset}', [ProjectAssetController::class, 'update'])->name('projects.assets.update');
    Route::delete('/projects/{project}/assets/{asset}', [ProjectAssetController::class, 'destroy'])->name('projects.assets.destroy');
    Route::post('/projects/{project}/deploy', [DeploymentController::class, 'deploy'])
        ->middleware('throttle:5,1')
        ->name('projects.deploy');
    Route::get('/projects/{project}/deployment-status', [DeploymentController::class, 'status'])->name('projects.deployment-status');
    Route::get('/projects/{project}/deployments', [DeploymentController::class, 'index'])->name('projects.deployments');

    // Client Service Requests
    Route::resource('/requests', ClientRequestController::class)
        ->only(['index', 'create', 'store', 'show', 'destroy'])
        ->parameters(['requests' => 'clientRequest']);
    Route::post('/requests/{clientRequest}/comments', [ClientRequestCommentController::class, 'store'])
        ->name('requests.comments.store');

    // Client Contact Messages
    Route::get('/projects/{project}/contact-messages', [ContactMessageController::class, 'index'])
        ->name('projects.contact-messages.index');
});

/*
|--------------------------------------------------------------------------
| Public & Webhook Routes (unauthenticated)
|--------------------------------------------------------------------------
*/
Route::post('/api/webhooks/vercel', [VercelWebhookController::class, 'handle'])->name('webhooks.vercel');

// Public Contact Form Submission (throttled)
Route::post('/api/contact/{token}', [ContactFormController::class, 'store'])
    ->middleware('throttle:3,10')
    ->name('contact.store');

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

    // Compatibility redirects
    Route::get('/workspaces', fn () => redirect()->route('admin.projects.index'));
    Route::get('/workspaces/{project}', fn (Project $project) => redirect()->route('admin.projects.show', $project));

    // Admin Project Contact Emailer
    Route::prefix('/projects/{project}/emailer')->name('projects.emailer.')->group(function () {
        Route::get('/', [AdminContactEmailerController::class, 'show'])->name('show');
        Route::post('/', [AdminContactEmailerController::class, 'store'])->name('store');
        Route::patch('/', [AdminContactEmailerController::class, 'update'])->name('update');
        Route::patch('/toggle', [AdminContactEmailerController::class, 'toggle'])->name('toggle');
        Route::post('/deploy', [AdminContactEmailerController::class, 'deploy'])->name('deploy');
    });

    // Admin Client Requests
    Route::resource('/requests', AdminClientRequestController::class)
        ->only(['index', 'show', 'update'])
        ->parameters(['requests' => 'clientRequest']);
    Route::post('/requests/{clientRequest}/comments', [AdminClientRequestCommentController::class, 'store'])
        ->name('requests.comments.store');
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
