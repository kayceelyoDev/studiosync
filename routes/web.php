<?php

use App\Http\Controllers\Admin\ClientRequestCommentController as AdminClientRequestCommentController;
use App\Http\Controllers\Admin\ClientRequestController as AdminClientRequestController;
use App\Http\Controllers\Admin\ContactEmailerController as AdminContactEmailerController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\AdminWorkspaceController;
use App\Http\Controllers\BookingRequestController;
use App\Http\Controllers\ClientBookingDashboardController;
use App\Http\Controllers\ClientRequestCommentController;
use App\Http\Controllers\ClientRequestController;
use App\Http\Controllers\ContactFormController;
use App\Http\Controllers\ContactMessageController;
use App\Http\Controllers\DeploymentController;
use App\Http\Controllers\GenerateAiPromtPage;
use App\Http\Controllers\ProjectAssetController;
use App\Http\Controllers\ProjectBookingController;
use App\Http\Controllers\ProjectBookingServiceController;
use App\Http\Controllers\ProjectBookingSettingsController;
use App\Http\Controllers\PublicBookingController;
use App\Http\Controllers\VercelWebhookController;
use App\Models\Project;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

/*
|--------------------------------------------------------------------------
| Public Guest Booking Routes (Secured & isolated by token & middleware)
|--------------------------------------------------------------------------
*/
Route::get('/book/entry/{token}', [PublicBookingController::class, 'entry'])
    ->middleware('throttle:60,1')
    ->name('booking.public.entry');

Route::prefix('book/{token}')->middleware(['EnsureProjectBookingEnabled'])->group(function () {
    Route::get('/', [PublicBookingController::class, 'show'])->name('booking.public.show');
    Route::get('/slots', [PublicBookingController::class, 'slots'])
        ->middleware('throttle:30,1')
        ->name('booking.public.slots');
    Route::post('/reserve', [PublicBookingController::class, 'store'])
        ->middleware('throttle:5,10')
        ->name('booking.public.reserve');
    Route::get('/confirmation/{uuid}', [PublicBookingController::class, 'confirmation'])
        ->name('booking.public.confirmation');
});

/*
|--------------------------------------------------------------------------
| Client Routes (all authenticated & verified users)
|--------------------------------------------------------------------------
| Accessible by: super_admin, admin, client
*/
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [GenerateAiPromtPage::class, 'showProject'])->name('dashboard');
    Route::get('/projects', [GenerateAiPromtPage::class, 'showProject'])->name('projects.index');
    Route::get('/workspaces', fn () => redirect()->route('dashboard'));
    Route::get('/workspaces/create', fn () => redirect()->route('generate-prompt.index'));
    Route::get('/workspaces/{workspace}', fn () => redirect()->route('dashboard'))->name('workspaces.show');
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

    // Centralized Client Bookings Hub
    Route::get('/bookings', [ClientBookingDashboardController::class, 'index'])->name('bookings.index');
    Route::patch('/bookings/{booking}/status', [ClientBookingDashboardController::class, 'updateStatus'])->name('bookings.status');

    // Booking routes for Project owner
    Route::post('/projects/{project}/booking-request', [BookingRequestController::class, 'store'])->name('projects.booking-request.store');
    Route::get('/projects/{project}/booking', [ProjectBookingController::class, 'index'])->name('projects.booking.index');
    Route::patch('/projects/{project}/booking/{booking}/status', [ProjectBookingController::class, 'updateBookingStatus'])->name('projects.booking.status');
    Route::post('/projects/{project}/booking/services', [ProjectBookingServiceController::class, 'store'])->name('projects.booking.services.store');
    Route::put('/projects/{project}/booking/services/{service}', [ProjectBookingServiceController::class, 'update'])->name('projects.booking.services.update');
    Route::delete('/projects/{project}/booking/services/{service}', [ProjectBookingServiceController::class, 'destroy'])->name('projects.booking.services.destroy');
    Route::put('/projects/{project}/booking/settings', [ProjectBookingSettingsController::class, 'update'])->name('projects.booking.settings.update');
    Route::post('/projects/{project}/booking/inject-cta', [ProjectBookingController::class, 'injectBookingCta'])->name('projects.booking.inject-cta');
    Route::post('/projects/{project}/booking/remove-cta', [ProjectBookingController::class, 'removeBookingCta'])->name('projects.booking.remove-cta');
    Route::post('/projects/{project}/booking/rotate-token', [ProjectBookingController::class, 'rotateBookingToken'])->name('projects.booking.rotate-token');
    Route::post('/projects/{project}/booking/generate-link', [ProjectBookingController::class, 'generateShareableLink'])->name('projects.booking.generate-link');
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
    Route::get('/', fn () => redirect()->route('admin.dashboard'));
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

    // Admin Users Directory & Explorer
    Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
    Route::get('/users/{user}', [AdminUserController::class, 'show'])->name('users.show');

    // Admin Projects & Workspaces
    Route::get('/workspaces', fn () => redirect()->route('admin.projects.index'));
    Route::get('/projects', [AdminWorkspaceController::class, 'index'])->name('projects.index');
    Route::get('/projects/{project}', [AdminWorkspaceController::class, 'show'])->name('projects.show');
    Route::put('/projects/{project}', [AdminWorkspaceController::class, 'update'])->name('projects.update');
    Route::get('/projects/{project}/vercel-redirect', [AdminWorkspaceController::class, 'vercelRedirect'])->name('projects.vercel-redirect');
    Route::get('/workspaces/{project}', fn (Project $project) => redirect()->route('admin.projects.show', $project));

    // Admin Project Contact Emailer
    Route::prefix('/projects/{project}/emailer')->name('projects.emailer.')->group(function () {
        Route::get('/', [AdminContactEmailerController::class, 'show'])->name('show');
        Route::post('/', [AdminContactEmailerController::class, 'store'])->name('store');
        Route::patch('/', [AdminContactEmailerController::class, 'update'])->name('update');
        Route::patch('/toggle', [AdminContactEmailerController::class, 'toggle'])->name('toggle');
        Route::post('/deploy', [AdminContactEmailerController::class, 'deploy'])->name('deploy');
        Route::post('/test', [AdminContactEmailerController::class, 'testMessage'])->name('test');
        Route::post('/inject-section', [AdminContactEmailerController::class, 'injectContactSection'])->name('inject-section');
        Route::post('/remove-section', [AdminContactEmailerController::class, 'removeContactSection'])->name('remove-section');
    });

    // Admin Client Requests
    Route::resource('/requests', AdminClientRequestController::class)
        ->only(['index', 'show', 'update'])
        ->parameters(['requests' => 'clientRequest']);
    Route::post('/requests/{clientRequest}/comments', [AdminClientRequestCommentController::class, 'store'])
        ->name('requests.comments.store');

    // Admin Booking Feature Management
    Route::post('/projects/{project}/booking/initialize', [AdminWorkspaceController::class, 'initializeBooking'])->name('projects.booking.initialize');
    Route::patch('/projects/{project}/booking/toggle', [AdminWorkspaceController::class, 'toggleBooking'])->name('projects.booking.toggle');
    Route::post('/projects/{project}/booking/inject-cta', [AdminWorkspaceController::class, 'injectBookingCta'])->name('projects.booking.inject-cta');
    Route::post('/projects/{project}/booking/remove-cta', [AdminWorkspaceController::class, 'removeBookingCta'])->name('projects.booking.remove-cta');
    Route::post('/projects/{project}/booking/rotate-token', [AdminWorkspaceController::class, 'rotateBookingToken'])->name('projects.booking.rotate-token');
    Route::put('/projects/{project}/booking/services', [AdminWorkspaceController::class, 'updateServices'])->name('projects.booking.services.update');
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
