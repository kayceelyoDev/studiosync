<?php

use App\Models\Booking;
use App\Models\BookingService;
use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;
use App\Services\BookingAvailabilityService;
use Carbon\Carbon;

beforeEach(function () {
    $this->owner = User::factory()->create();

    $this->workspace = Workspace::create([
        'user_id' => $this->owner->id,
        'name' => 'Edge Case Studio',
        'slug' => 'edge-case-studio',
    ]);

    $this->project = Project::create([
        'user_id' => $this->owner->id,
        'workspace_id' => $this->workspace->id,
        'project_name' => 'Edge Case Salon',
        'preferences' => [],
        'status' => 'completed',
        'booking_enabled' => true,
        'booking_public_token' => 'bk_live_edge_12345678901234567890123',
        'booking_notification_email' => 'salon@edge.test',
        'booking_settings' => [
            'start_time' => '09:00',
            'end_time' => '17:00',
            'days' => [1, 2, 3, 4, 5],
        ],
    ]);

    $this->service60 = BookingService::create([
        'project_id' => $this->project->id,
        'name' => 'Full Hair Coloring',
        'duration_minutes' => 60,
        'price' => 150.00,
        'currency' => 'USD',
        'is_active' => true,
    ]);

    $this->service30 = BookingService::create([
        'project_id' => $this->project->id,
        'name' => 'Quick Trim',
        'duration_minutes' => 30,
        'price' => 35.00,
        'currency' => 'USD',
        'is_active' => true,
    ]);

    $this->inactiveService = BookingService::create([
        'project_id' => $this->project->id,
        'name' => 'Discontinued Treatment',
        'duration_minutes' => 45,
        'price' => 99.00,
        'currency' => 'USD',
        'is_active' => false,
    ]);
});

test('inactive service cannot be queried for slots or booked', function () {
    $nextMonday = Carbon::now()->next(Carbon::MONDAY)->format('Y-m-d');

    // Query slots -> 404
    $this->getJson("/book/{$this->project->booking_public_token}/slots?service_id={$this->inactiveService->id}&date={$nextMonday}")
        ->assertStatus(404);

    // Reserve -> 404
    $this->postJson("/book/{$this->project->booking_public_token}/reserve", [
        'service_id' => $this->inactiveService->id,
        'date' => $nextMonday,
        'time' => '09:00',
        'customer_name' => 'Customer',
        'customer_email' => 'cust@example.com',
    ])->assertStatus(404);
});

test('60-minute booking blocks overlapping 30-minute slot', function () {
    $nextMonday = Carbon::now()->next(Carbon::MONDAY)->format('Y-m-d');

    // Book 60-min service from 09:00 to 10:00
    Booking::create([
        'project_id' => $this->project->id,
        'booking_service_id' => $this->service60->id,
        'customer_name' => 'Color Client',
        'customer_email' => 'color@client.com',
        'booking_date' => $nextMonday,
        'booking_time' => '09:00',
        'status' => 'confirmed',
    ]);

    // Check available slots for 30-min service
    $availabilityService = new BookingAvailabilityService;
    $slots30 = $availabilityService->getAvailableSlots($this->project, $this->service30, $nextMonday);

    // Neither 09:00 nor 09:30 should be available, but 10:00 should be free!
    expect($slots30)->not->toContain('09:00');
    expect($slots30)->not->toContain('09:30');
    expect($slots30)->toContain('10:00');

    // Attempting to reserve 09:30 should fail with 422
    $this->postJson("/book/{$this->project->booking_public_token}/reserve", [
        'service_id' => $this->service30->id,
        'date' => $nextMonday,
        'time' => '09:30',
        'customer_name' => 'Trim Client',
        'customer_email' => 'trim@client.com',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['time']);
});

test('reservation rejects invalid email or missing fields', function () {
    $nextMonday = Carbon::now()->next(Carbon::MONDAY)->format('Y-m-d');

    $this->postJson("/book/{$this->project->booking_public_token}/reserve", [
        'service_id' => $this->service30->id,
        'date' => $nextMonday,
        'time' => '11:00',
        'customer_name' => '', // missing
        'customer_email' => 'not-an-email', // invalid
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['customer_name', 'customer_email']);
});

test('client can create, update, and delete services', function () {
    // 1. Create service
    $this->actingAs($this->owner)
        ->post("/projects/{$this->project->id}/booking/services", [
            'name' => 'Beard Grooming',
            'description' => 'Hot towel and shave',
            'duration_minutes' => 25,
            'price' => 30.00,
            'currency' => 'USD',
            'is_active' => true,
        ])->assertRedirect();

    $newService = BookingService::where('name', 'Beard Grooming')->first();
    expect($newService)->not->toBeNull();
    expect($newService->duration_minutes)->toBe(25);

    // 2. Update service
    $this->actingAs($this->owner)
        ->put("/projects/{$this->project->id}/booking/services/{$newService->id}", [
            'name' => 'Luxury Beard Grooming',
            'description' => 'Deluxe hot towel treatment',
            'duration_minutes' => 35,
            'price' => 45.00,
            'currency' => 'USD',
            'is_active' => true,
        ])->assertRedirect();

    $newService->refresh();
    expect($newService->name)->toBe('Luxury Beard Grooming');
    expect($newService->price)->toBe('45.00');

    // 3. Delete service
    $this->actingAs($this->owner)
        ->delete("/projects/{$this->project->id}/booking/services/{$newService->id}")
        ->assertRedirect();

    $this->assertDatabaseMissing('booking_services', ['id' => $newService->id]);
});

test('client can update booking operating hours and notification settings', function () {
    $this->actingAs($this->owner)
        ->put("/projects/{$this->project->id}/booking/settings", [
            'booking_notification_email' => 'manager@salon.com',
            'booking_settings' => [
                'start_time' => '08:00',
                'end_time' => '16:00',
                'days' => [2, 3, 4, 5, 6],
            ],
        ])->assertRedirect();

    $this->project->refresh();

    expect($this->project->booking_notification_email)->toBe('manager@salon.com');
    expect($this->project->booking_settings['start_time'])->toBe('08:00');
    expect($this->project->booking_settings['days'])->toBe([2, 3, 4, 5, 6]);
});
