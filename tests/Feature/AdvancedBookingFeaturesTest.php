<?php

use App\Enums\RequestStatus;
use App\Models\Booking;
use App\Models\BookingAccessToken;
use App\Models\BookingService;
use App\Models\ClientRequest;
use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;
use App\Services\BookingCodeInjectionService;
use Carbon\Carbon;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RoleSeeder']);

    $this->client = User::factory()->create();
    $this->client->assignRole('client');

    $this->otherClient = User::factory()->create();
    $this->otherClient->assignRole('client');

    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');

    $this->workspace = Workspace::create([
        'user_id' => $this->client->id,
        'name' => 'Client Clinic',
        'slug' => 'client-clinic',
    ]);

    $this->project = Project::create([
        'user_id' => $this->client->id,
        'workspace_id' => $this->workspace->id,
        'project_name' => 'Dental Care Hub',
        'preferences' => [],
        'status' => 'completed',
        'html_content' => '<!DOCTYPE html><html><head><title>Clinic</title></head><body><header><nav><a href="#home">Home</a><a href="#about">About</a></nav></header><main><h1>Welcome</h1></main></body></html>',
    ]);
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. Admin Service Configuration on Request Review
// ─────────────────────────────────────────────────────────────────────────────

test('admin can review, modify, and set finalized services when approving booking request', function () {
    $intakePayload = [
        'notification_email' => 'raw@clinic.com',
        'services' => [
            [
                'name' => 'Basic Checkup',
                'description' => 'Rough checkup',
                'duration_minutes' => 15,
                'price' => 20.00,
                'currency' => 'USD',
            ],
        ],
    ];

    $clientReq = ClientRequest::create([
        'user_id' => $this->client->id,
        'project_id' => $this->project->id,
        'category' => 'booking_system',
        'title' => 'Booking System Request',
        'description' => json_encode($intakePayload),
        'status' => 'pending',
    ]);

    // Admin modifies services during review to professional tiers with updated prices
    $finalizedServices = [
        [
            'name' => 'Comprehensive Dental Examination',
            'description' => 'Full dental audit and x-rays',
            'duration_minutes' => 45,
            'price' => 95.00,
            'currency' => 'USD',
        ],
        [
            'name' => 'Teeth Scaling & Deep Cleaning',
            'description' => 'Professional ultrasonic prophylaxis',
            'duration_minutes' => 60,
            'price' => 140.00,
            'currency' => 'USD',
        ],
    ];

    $response = $this->actingAs($this->admin)
        ->post("/admin/projects/{$this->project->id}/booking/initialize", [
            'services' => $finalizedServices,
            'notification_email' => 'admin_vetted@clinic.com',
            'auto_inject_cta' => true,
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $this->project->refresh();
    $clientReq->refresh();

    expect($this->project->booking_enabled)->toBeTrue();
    expect($this->project->booking_notification_email)->toBe('admin_vetted@clinic.com');
    expect($this->project->booking_public_token)->toStartWith('bk_live_');
    expect($clientReq->status)->toBe(RequestStatus::Completed);

    // Verify admin finalized services were created
    expect($this->project->bookingServices()->count())->toBe(2);
    $this->assertDatabaseHas('booking_services', [
        'project_id' => $this->project->id,
        'name' => 'Comprehensive Dental Examination',
        'duration_minutes' => 45,
        'price' => 95.00,
    ]);
    $this->assertDatabaseHas('booking_services', [
        'project_id' => $this->project->id,
        'name' => 'Teeth Scaling & Deep Cleaning',
        'duration_minutes' => 60,
        'price' => 140.00,
    ]);
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Centralized Client Bookings Dashboard
// ─────────────────────────────────────────────────────────────────────────────

test('client can access centralized bookings hub showing appointments across their projects', function () {
    // Enable booking on primary project
    $this->project->update([
        'booking_enabled' => true,
        'booking_public_token' => 'bk_live_proj1',
    ]);

    $service1 = BookingService::create([
        'project_id' => $this->project->id,
        'name' => 'Dental Consultation',
        'duration_minutes' => 30,
        'price' => 50.00,
        'currency' => 'USD',
        'is_active' => true,
    ]);

    // Create a second project for same client
    $project2 = Project::create([
        'user_id' => $this->client->id,
        'workspace_id' => $this->workspace->id,
        'project_name' => 'Physio Studio',
        'preferences' => [],
        'status' => 'completed',
        'booking_enabled' => true,
        'booking_public_token' => 'bk_live_proj2',
    ]);

    $service2 = BookingService::create([
        'project_id' => $project2->id,
        'name' => 'Back Physio Session',
        'duration_minutes' => 45,
        'price' => 80.00,
        'currency' => 'USD',
        'is_active' => true,
    ]);

    // Create a third project belonging to someone else
    $otherProject = Project::create([
        'user_id' => $this->otherClient->id,
        'workspace_id' => $this->workspace->id,
        'project_name' => 'Other Clinic',
        'preferences' => [],
        'status' => 'completed',
        'booking_enabled' => true,
        'booking_public_token' => 'bk_live_other',
    ]);

    // Bookings for client's projects
    $b1 = Booking::create([
        'project_id' => $this->project->id,
        'booking_service_id' => $service1->id,
        'customer_name' => 'Alice Walker',
        'customer_email' => 'alice@test.com',
        'booking_date' => Carbon::tomorrow()->format('Y-m-d'),
        'booking_time' => '10:00:00',
        'status' => 'confirmed',
    ]);

    $b2 = Booking::create([
        'project_id' => $project2->id,
        'booking_service_id' => $service2->id,
        'customer_name' => 'Bob Smith',
        'customer_email' => 'bob@test.com',
        'booking_date' => Carbon::today()->format('Y-m-d'),
        'booking_time' => '14:00:00',
        'status' => 'completed',
    ]);

    // Booking for other client
    Booking::create([
        'project_id' => $otherProject->id,
        'customer_name' => 'Secret Stranger',
        'customer_email' => 'secret@stranger.com',
        'booking_date' => Carbon::today()->format('Y-m-d'),
        'booking_time' => '11:00:00',
        'status' => 'confirmed',
    ]);

    // Client visits /bookings
    $response = $this->actingAs($this->client)->get('/bookings');

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Booking/Index')
        ->has('bookings.data', 2)
        ->where('metrics.total', 2)
        ->where('metrics.confirmed', 1)
        ->where('metrics.completed', 1)
        ->where('metrics.estimated_revenue', 130)
        ->where('metrics.active_projects', 2)
    );
});

test('client can filter centralized bookings by project, status, and search query', function () {
    $this->project->update([
        'booking_enabled' => true,
        'booking_public_token' => 'bk_live_proj1',
    ]);

    $service = BookingService::create([
        'project_id' => $this->project->id,
        'name' => 'Consultation',
        'duration_minutes' => 30,
        'price' => 50.00,
        'currency' => 'USD',
        'is_active' => true,
    ]);

    Booking::create([
        'project_id' => $this->project->id,
        'booking_service_id' => $service->id,
        'customer_name' => 'Charlie Chaplin',
        'customer_email' => 'charlie@film.com',
        'booking_date' => '2026-10-25',
        'booking_time' => '09:00:00',
        'status' => 'confirmed',
    ]);

    Booking::create([
        'project_id' => $this->project->id,
        'booking_service_id' => $service->id,
        'customer_name' => 'Diana Prince',
        'customer_email' => 'diana@amazon.com',
        'booking_date' => '2026-10-25',
        'booking_time' => '10:00:00',
        'status' => 'cancelled',
    ]);

    // Filter by status=confirmed
    $response = $this->actingAs($this->client)->get('/bookings?status=confirmed');
    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Booking/Index')
        ->has('bookings.data', 1)
        ->where('bookings.data.0.customer_name', 'Charlie Chaplin')
    );

    // Filter by search=Diana
    $responseSearch = $this->actingAs($this->client)->get('/bookings?search=Diana');
    $responseSearch->assertOk();
    $responseSearch->assertInertia(fn (Assert $page) => $page
        ->component('Booking/Index')
        ->has('bookings.data', 1)
        ->where('bookings.data.0.customer_name', 'Diana Prince')
    );
});

test('client can update booking status from centralized dashboard', function () {
    $this->project->update([
        'booking_enabled' => true,
        'booking_public_token' => 'bk_live_proj1',
    ]);

    $booking = Booking::create([
        'project_id' => $this->project->id,
        'customer_name' => 'Edward Norton',
        'customer_email' => 'edward@cinema.com',
        'booking_date' => '2026-10-26',
        'booking_time' => '11:00:00',
        'status' => 'confirmed',
    ]);

    $response = $this->actingAs($this->client)
        ->patch("/bookings/{$booking->id}/status", [
            'status' => 'completed',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $booking->refresh();
    expect($booking->status)->toBe('completed');
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Automatic/Manual Website Code Injection
// ─────────────────────────────────────────────────────────────────────────────

test('approving booking automatically injects booking CTA into project website HTML', function () {
    $clientReq = ClientRequest::create([
        'user_id' => $this->client->id,
        'project_id' => $this->project->id,
        'category' => 'booking_system',
        'title' => 'Booking Request',
        'description' => json_encode(['services' => [['name' => 'Consult', 'duration_minutes' => 30, 'price' => 50]]]),
        'status' => 'pending',
    ]);

    expect($this->project->html_content)->not->toContain(BookingCodeInjectionService::START_TAG);

    $this->actingAs($this->admin)
        ->post("/admin/projects/{$this->project->id}/booking/initialize", [
            'auto_inject_cta' => true,
        ]);

    $this->project->refresh();

    expect($this->project->html_content)->toContain(BookingCodeInjectionService::START_TAG);
    expect($this->project->html_content)->toContain(BookingCodeInjectionService::END_TAG);
    expect($this->project->html_content)->toContain('/book/entry/');
    // Since <nav> exists, it should be injected before </nav>
    expect($this->project->html_content)->toMatch('/'.preg_quote(BookingCodeInjectionService::START_TAG, '/').'.*<\/nav>/s');
});

test('admin and client can manually inject, update, and remove website booking CTA', function () {
    $this->project->update([
        'booking_enabled' => true,
        'booking_public_token' => 'bk_live_test_cta',
    ]);

    // Admin manually injects
    $response = $this->actingAs($this->admin)
        ->post("/admin/projects/{$this->project->id}/booking/inject-cta");
    $response->assertRedirect();

    $this->project->refresh();
    expect($this->project->html_content)->toContain(BookingCodeInjectionService::START_TAG);

    // Client manually removes
    $responseRemove = $this->actingAs($this->client)
        ->post("/projects/{$this->project->id}/booking/remove-cta");
    $responseRemove->assertRedirect();

    $this->project->refresh();
    expect($this->project->html_content)->not->toContain(BookingCodeInjectionService::START_TAG);

    // Client manually re-injects
    $responseReinject = $this->actingAs($this->client)
        ->post("/projects/{$this->project->id}/booking/inject-cta");
    $responseReinject->assertRedirect();

    $this->project->refresh();
    expect($this->project->html_content)->toContain(BookingCodeInjectionService::START_TAG);
});

test('toggling booking on and off updates website code injection accordingly', function () {
    $this->project->update([
        'booking_enabled' => true,
        'booking_public_token' => 'bk_live_toggle_test',
    ]);
    app(BookingCodeInjectionService::class)->injectBookingCta($this->project);
    $this->project->refresh();
    expect($this->project->html_content)->toContain(BookingCodeInjectionService::START_TAG);

    // Admin toggles off
    $this->actingAs($this->admin)
        ->patch("/admin/projects/{$this->project->id}/booking/toggle");

    $this->project->refresh();
    expect($this->project->booking_enabled)->toBeFalse();
    expect($this->project->html_content)->not->toContain(BookingCodeInjectionService::START_TAG);

    // Admin toggles back on
    $this->actingAs($this->admin)
        ->patch("/admin/projects/{$this->project->id}/booking/toggle");

    $this->project->refresh();
    expect($this->project->booking_enabled)->toBeTrue();
    expect($this->project->html_content)->toContain(BookingCodeInjectionService::START_TAG);
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Dynamic / Expiring Booking Access Tokens
// ─────────────────────────────────────────────────────────────────────────────

test('visitor clicking dedicated entry link receives a unique expiring session token', function () {
    $this->project->update([
        'booking_enabled' => true,
        'booking_public_token' => 'bk_live_secure_12345',
    ]);

    // Visitor 1 visits entry link
    $res1 = $this->get("/book/entry/{$this->project->booking_public_token}");
    $res1->assertRedirect();
    $targetUrl1 = $res1->headers->get('Location');
    expect($targetUrl1)->toContain('/book/bk_sess_');

    // Visitor 2 visits entry link -> receives a different unique token
    $res2 = $this->get("/book/entry/{$this->project->booking_public_token}");
    $res2->assertRedirect();
    $targetUrl2 = $res2->headers->get('Location');
    expect($targetUrl2)->toContain('/book/bk_sess_');

    expect($targetUrl1)->not->toBe($targetUrl2);

    // Verify session tokens were recorded in database
    expect(BookingAccessToken::where('project_id', $this->project->id)->count())->toBe(2);
});

test('valid session token allows portal access and records usage', function () {
    $this->project->update([
        'booking_enabled' => true,
        'booking_public_token' => 'bk_live_session_test',
    ]);

    $service = BookingService::create([
        'project_id' => $this->project->id,
        'name' => 'Session Service',
        'duration_minutes' => 30,
        'price' => 50.00,
        'currency' => 'USD',
        'is_active' => true,
    ]);

    $session = BookingAccessToken::createForProject(
        $this->project,
        now()->addMinutes(30)
    );

    expect($session->access_count)->toBe(0);

    $response = $this->get("/book/{$session->token}");
    $response->assertOk();

    $session->refresh();
    expect($session->access_count)->toBe(1);
    expect($session->last_accessed_at)->not->toBeNull();
});

test('expired dynamic token returns 410 and renders session expired page for web requests', function () {
    $this->project->update([
        'booking_enabled' => true,
        'booking_public_token' => 'bk_live_expired_test',
    ]);

    // Create an expired token
    $session = BookingAccessToken::create([
        'project_id' => $this->project->id,
        'token' => 'bk_sess_expired_1234567890',
        'expires_at' => now()->subMinutes(10),
        'is_revoked' => false,
        'access_count' => 1,
    ]);

    $response = $this->get("/book/{$session->token}");
    $response->assertStatus(410);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Booking/Public/Expired')
        ->where('projectName', $this->project->project_name)
        ->has('entryUrl')
    );
});

test('expired dynamic token returns 410 JSON with session_expired flag for API/slots requests', function () {
    $this->project->update([
        'booking_enabled' => true,
        'booking_public_token' => 'bk_live_expired_api_test',
    ]);

    $session = BookingAccessToken::create([
        'project_id' => $this->project->id,
        'token' => 'bk_sess_api_expired_1234567890',
        'expires_at' => now()->subMinutes(10),
        'is_revoked' => false,
    ]);

    $response = $this->getJson("/book/{$session->token}/slots?service_id=1&date=2026-10-25");
    $response->assertStatus(410)
        ->assertJsonFragment([
            'session_expired' => true,
        ]);
});

test('rotating project booking key invalidates old key and updates website HTML CTA', function () {
    $this->project->update([
        'booking_enabled' => true,
        'booking_public_token' => 'bk_live_old_token_123456789',
    ]);

    app(BookingCodeInjectionService::class)->injectBookingCta($this->project);
    $this->project->refresh();
    expect($this->project->html_content)->toContain('bk_live_old_token_123456789');

    // Admin rotates key
    $response = $this->actingAs($this->admin)
        ->post("/admin/projects/{$this->project->id}/booking/rotate-token");
    $response->assertRedirect();

    $this->project->refresh();
    expect($this->project->booking_public_token)->not->toBe('bk_live_old_token_123456789');
    expect($this->project->booking_public_token)->toStartWith('bk_live_');

    // Website HTML was automatically updated with new token in CTA URL
    expect($this->project->html_content)->toContain($this->project->booking_public_token);
    expect($this->project->html_content)->not->toContain('bk_live_old_token_123456789');
});

test('client can generate dedicated shareable time-limited booking link', function () {
    $this->project->update([
        'booking_enabled' => true,
        'booking_public_token' => 'bk_live_shareable_test',
    ]);

    $response = $this->actingAs($this->client)
        ->post("/projects/{$this->project->id}/booking/generate-link", [
            'duration_hours' => 72,
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertSessionHas('shareable_link');

    $link = session('shareable_link');
    expect($link)->toContain('/book/bk_sess_');

    $tokenRecord = BookingAccessToken::where('project_id', $this->project->id)->latest()->first();
    expect($tokenRecord)->not->toBeNull();
    expect($tokenRecord->expires_at->gt(now()->addHours(71)))->toBeTrue();
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Additional Robustness, Security & Flow Tests
// ─────────────────────────────────────────────────────────────────────────────

test('admin can directly initialize booking with services without prior client request', function () {
    $this->project->refresh();
    expect($this->project->booking_enabled)->toBeFalse();
    expect($this->project->clientRequests()->count())->toBe(0);

    $response = $this->actingAs($this->admin)
        ->post("/admin/projects/{$this->project->id}/booking/initialize", [
            'services' => [
                [
                    'name' => 'VIP Strategy Session',
                    'description' => 'Direct admin initialized strategy',
                    'duration_minutes' => 60,
                    'price' => 200.00,
                    'currency' => 'USD',
                ],
            ],
            'notification_email' => 'vip@direct.com',
            'auto_inject_cta' => true,
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $this->project->refresh();
    expect($this->project->booking_enabled)->toBeTrue();
    expect($this->project->booking_notification_email)->toBe('vip@direct.com');
    expect($this->project->bookingServices()->count())->toBe(1);
    expect($this->project->bookingServices()->first()->name)->toBe('VIP Strategy Session');
    expect($this->project->html_content)->toContain(BookingCodeInjectionService::START_TAG);
});

test('admin can update services and notification email on active booking project without breaking existing bookings', function () {
    $this->project->update([
        'booking_enabled' => true,
        'booking_public_token' => 'bk_live_active_sync',
    ]);

    $initialService = BookingService::create([
        'project_id' => $this->project->id,
        'name' => 'Initial Consultation',
        'duration_minutes' => 30,
        'price' => 50.00,
        'currency' => 'USD',
        'is_active' => true,
    ]);

    // An appointment was already booked with this service
    $booking = Booking::create([
        'project_id' => $this->project->id,
        'booking_service_id' => $initialService->id,
        'customer_name' => 'Existing Patient',
        'customer_email' => 'patient@test.com',
        'booking_date' => '2026-10-30',
        'booking_time' => '10:00:00',
        'status' => 'confirmed',
    ]);

    // Admin updates services: modifies initial service price, adds a new tier
    $response = $this->actingAs($this->admin)
        ->put("/admin/projects/{$this->project->id}/booking/services", [
            'services' => [
                [
                    'id' => $initialService->id,
                    'name' => 'Initial Consultation (Updated)',
                    'duration_minutes' => 35,
                    'price' => 65.00,
                    'currency' => 'USD',
                ],
                [
                    'name' => 'Follow-up Treatment',
                    'duration_minutes' => 45,
                    'price' => 90.00,
                    'currency' => 'USD',
                ],
            ],
            'notification_email' => 'updated_alerts@clinic.com',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $this->project->refresh();
    $booking->refresh();

    // Verify booking service relationship is NOT broken (not NULL)
    expect($booking->booking_service_id)->toBe($initialService->id);
    expect($booking->bookingService->name)->toBe('Initial Consultation (Updated)');
    expect((float) $booking->bookingService->price)->toBe(65.0);
    expect($this->project->booking_notification_email)->toBe('updated_alerts@clinic.com');
    expect($this->project->bookingServices()->count())->toBe(2);
});

test('admin can manually edit and update project html_content in admin workspace', function () {
    $newHtml = '<!DOCTYPE html><html><body><h1>Updated by Admin</h1><nav><a href="/book">Custom</a></nav></body></html>';

    $response = $this->actingAs($this->admin)
        ->put("/admin/projects/{$this->project->id}", [
            'status' => 'completed',
            'html_content' => $newHtml,
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $this->project->refresh();
    expect($this->project->html_content)->toBe($newHtml);
});

test('booking access token recordAccess increments count atomically in one query', function () {
    $this->project->update([
        'booking_enabled' => true,
        'booking_public_token' => 'bk_live_atomic_test',
    ]);

    $token = BookingAccessToken::createForProject($this->project, now()->addHour());
    expect($token->access_count)->toBe(0);
    expect($token->last_accessed_at)->toBeNull();

    $token->recordAccess();

    $token->refresh();
    expect($token->access_count)->toBe(1);
    expect($token->last_accessed_at)->not->toBeNull();
});

test('centralized client booking hub displays bookings even if a project has booking disabled', function () {
    // Project with booking disabled
    $inactiveProject = Project::create([
        'user_id' => $this->client->id,
        'workspace_id' => $this->workspace->id,
        'project_name' => 'Legacy Clinic',
        'preferences' => [],
        'status' => 'completed',
        'booking_enabled' => false,
    ]);

    $service = BookingService::create([
        'project_id' => $inactiveProject->id,
        'name' => 'Past Service',
        'duration_minutes' => 30,
        'price' => 40.00,
        'currency' => 'USD',
        'is_active' => true,
    ]);

    Booking::create([
        'project_id' => $inactiveProject->id,
        'booking_service_id' => $service->id,
        'customer_name' => 'Historical Guest',
        'customer_email' => 'guest@history.com',
        'booking_date' => Carbon::today()->format('Y-m-d'),
        'booking_time' => '15:00:00',
        'status' => 'completed',
    ]);

    $response = $this->actingAs($this->client)->get('/bookings');
    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Booking/Index')
        ->has('bookings.data', 1)
        ->where('bookings.data.0.customer_name', 'Historical Guest')
    );
});
