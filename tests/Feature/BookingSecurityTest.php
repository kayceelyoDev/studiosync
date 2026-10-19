<?php

use App\Models\Booking;
use App\Models\BookingService;
use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;
use Carbon\Carbon;

beforeEach(function () {
    $this->owner = User::factory()->create();
    $this->otherUser = User::factory()->create();

    $this->workspace = Workspace::create([
        'user_id' => $this->owner->id,
        'name' => 'Owner Workspace',
        'slug' => 'owner-workspace',
    ]);

    $this->project = Project::create([
        'user_id' => $this->owner->id,
        'workspace_id' => $this->workspace->id,
        'project_name' => 'Dr. Smith Dental Clinic',
        'preferences' => [],
        'status' => 'completed',
        'booking_enabled' => true,
        'booking_public_token' => 'bk_live_smith_1234567890123456789012',
        'booking_notification_email' => 'smith@dental.com',
        'booking_settings' => [
            'start_time' => '09:00',
            'end_time' => '17:00',
            'days' => [1, 2, 3, 4, 5],
        ],
    ]);

    $this->service = BookingService::create([
        'project_id' => $this->project->id,
        'name' => 'Teeth Cleaning',
        'duration_minutes' => 30,
        'price' => 75.00,
        'currency' => 'USD',
        'is_active' => true,
    ]);

    // Another project with its own service
    $this->otherProject = Project::create([
        'user_id' => $this->otherUser->id,
        'workspace_id' => $this->workspace->id,
        'project_name' => 'Other Clinic',
        'preferences' => [],
        'status' => 'completed',
        'booking_enabled' => true,
        'booking_public_token' => 'bk_live_other_1234567890123456789012',
        'booking_notification_email' => 'other@clinic.com',
    ]);

    $this->otherService = BookingService::create([
        'project_id' => $this->otherProject->id,
        'name' => 'Eye Exam',
        'duration_minutes' => 30,
        'price' => 90.00,
        'currency' => 'USD',
        'is_active' => true,
    ]);
});

test('public booking portal returns 404 for nonexistent or invalid token', function () {
    $this->get('/book/nonexistent-token')
        ->assertStatus(404);
});

test('public booking portal returns 404 when project has booking_enabled set to false', function () {
    $this->project->update(['booking_enabled' => false]);

    $this->get('/book/'.$this->project->booking_public_token)
        ->assertStatus(404);
});

test('public booking portal returns 200 when project has booking_enabled set to true', function () {
    $this->get('/book/'.$this->project->booking_public_token)
        ->assertStatus(200);
});

test('guest cannot query slots for a service belonging to a different project', function () {
    $nextMonday = Carbon::now()->next(Carbon::MONDAY)->format('Y-m-d');

    // Smith's booking portal querying Other Clinic's service
    $this->getJson("/book/{$this->project->booking_public_token}/slots?service_id={$this->otherService->id}&date={$nextMonday}")
        ->assertStatus(404);
});

test('guest cannot reserve a service belonging to a different project', function () {
    $nextMonday = Carbon::now()->next(Carbon::MONDAY)->format('Y-m-d');

    $this->postJson("/book/{$this->project->booking_public_token}/reserve", [
        'service_id' => $this->otherService->id,
        'date' => $nextMonday,
        'time' => '10:00',
        'customer_name' => 'Sneaky Guest',
        'customer_email' => 'guest@example.com',
    ])->assertStatus(404);
});

test('non-owner client cannot access project booking management hub', function () {
    $this->actingAs($this->otherUser)
        ->get("/projects/{$this->project->id}/booking")
        ->assertStatus(403);
});

test('non-owner client cannot modify services of another project', function () {
    $this->actingAs($this->otherUser)
        ->putJson("/projects/{$this->project->id}/booking/services/{$this->service->id}", [
            'name' => 'Hacked Service',
            'duration_minutes' => 30,
            'price' => 1.00,
        ])->assertStatus(403);
});

test('non-owner client cannot update booking status of another project', function () {
    $booking = Booking::create([
        'project_id' => $this->project->id,
        'booking_service_id' => $this->service->id,
        'customer_name' => 'Patient X',
        'customer_email' => 'x@example.com',
        'booking_date' => '2026-11-01',
        'booking_time' => '09:00',
        'status' => 'confirmed',
    ]);

    $this->actingAs($this->otherUser)
        ->patch("/projects/{$this->project->id}/booking/{$booking->id}/status", [
            'status' => 'cancelled',
            'cancellation_reason' => 'Unauthorized cancellation',
        ])->assertStatus(403);
});

test('owner cannot access booking management hub if booking is disabled for the project', function () {
    $this->project->update(['booking_enabled' => false]);

    $this->actingAs($this->owner)
        ->get("/projects/{$this->project->id}/booking")
        ->assertStatus(403);
});

test('owner cannot create services if booking is disabled for the project', function () {
    $this->project->update(['booking_enabled' => false]);

    $this->actingAs($this->owner)
        ->post("/projects/{$this->project->id}/booking/services", [
            'name' => 'Should Fail',
            'duration_minutes' => 30,
            'price' => 20.00,
        ])->assertStatus(403);
});

test('reservations are rate limited after threshold', function () {
    $nextMonday = Carbon::now()->next(Carbon::MONDAY)->format('Y-m-d');

    // Threshold is 5 requests per 10 minutes (throttle:5,10)
    for ($i = 0; $i < 5; $i++) {
        $this->postJson("/book/{$this->project->booking_public_token}/reserve", [
            'service_id' => $this->service->id,
            'date' => $nextMonday,
            'time' => '09:00',
            'customer_name' => 'Spam Test',
            'customer_email' => 'spam@test.com',
        ]);
    }

    // 6th request should hit 429 Too Many Requests
    $response = $this->postJson("/book/{$this->project->booking_public_token}/reserve", [
        'service_id' => $this->service->id,
        'date' => $nextMonday,
        'time' => '09:00',
        'customer_name' => 'Spam Test 6',
        'customer_email' => 'spam@test.com',
    ]);

    $response->assertStatus(429);
});
