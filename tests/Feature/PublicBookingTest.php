<?php

use App\Mail\NewBookingNotification;
use App\Models\Booking;
use App\Models\BookingService;
use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->workspace = Workspace::create([
        'user_id' => $this->user->id,
        'name' => 'Auto Repair Workshop',
        'slug' => 'auto-repair-workshop',
    ]);

    $this->project = Project::create([
        'user_id' => $this->user->id,
        'workspace_id' => $this->workspace->id,
        'project_name' => 'Speedy Auto Care',
        'preferences' => [],
        'status' => 'completed',
        'booking_enabled' => true,
        'booking_public_token' => 'bk_live_speedy_123456789012345678901',
        'booking_notification_email' => 'support@speedyauto.com',
        'booking_settings' => [
            'start_time' => '09:00',
            'end_time' => '17:00',
            'days' => [1, 2, 3, 4, 5],
        ],
    ]);

    $this->service = BookingService::create([
        'project_id' => $this->project->id,
        'name' => 'Oil Change & Filter',
        'duration_minutes' => 30,
        'price' => 45.00,
        'currency' => 'USD',
        'is_active' => true,
    ]);
});

test('guest can query available slots for an active service', function () {
    $nextMonday = Carbon::now()->next(Carbon::MONDAY)->format('Y-m-d');

    $response = $this->getJson("/book/{$this->project->booking_public_token}/slots?service_id={$this->service->id}&date={$nextMonday}");

    $response->assertOk()
        ->assertJsonStructure(['slots']);

    $slots = $response->json('slots');
    expect($slots)->toContain('09:00');
    expect($slots)->toContain('16:30');
});

test('guest can reserve a slot and receive appointment confirmation', function () {
    $nextMonday = Carbon::now()->next(Carbon::MONDAY)->format('Y-m-d');

    $response = $this->post("/book/{$this->project->booking_public_token}/reserve", [
        'service_id' => $this->service->id,
        'date' => $nextMonday,
        'time' => '10:30',
        'customer_name' => 'Jane Doe',
        'customer_email' => 'jane@example.com',
        'customer_phone' => '+15551234567',
        'customer_notes' => 'Synthetic oil preferred.',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $booking = Booking::where('project_id', $this->project->id)
        ->where('customer_email', 'jane@example.com')
        ->first();

    expect($booking)->not->toBeNull();
    expect($booking->booking_time)->toBe('10:30');
    expect($booking->status)->toBe('confirmed');
    expect($booking->uuid)->not->toBeEmpty();

    // Check confirmation route
    $confirmResponse = $this->get("/book/{$this->project->booking_public_token}/confirmation/{$booking->uuid}");
    $confirmResponse->assertOk();
});

test('guest cannot reserve an already booked slot', function () {
    $nextMonday = Carbon::now()->next(Carbon::MONDAY)->format('Y-m-d');

    // First booking
    Booking::create([
        'project_id' => $this->project->id,
        'booking_service_id' => $this->service->id,
        'customer_name' => 'First Guest',
        'customer_email' => 'first@example.com',
        'booking_date' => $nextMonday,
        'booking_time' => '14:00',
        'status' => 'confirmed',
    ]);

    // Second guest attempts to book exact same slot
    $response = $this->postJson("/book/{$this->project->booking_public_token}/reserve", [
        'service_id' => $this->service->id,
        'date' => $nextMonday,
        'time' => '14:00',
        'customer_name' => 'Second Guest',
        'customer_email' => 'second@example.com',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['time']);
});

test('project owner can update appointment status in management hub', function () {
    $booking = Booking::create([
        'project_id' => $this->project->id,
        'booking_service_id' => $this->service->id,
        'customer_name' => 'Mark Customer',
        'customer_email' => 'mark@example.com',
        'booking_date' => Carbon::tomorrow()->format('Y-m-d'),
        'booking_time' => '11:00',
        'status' => 'confirmed',
    ]);

    $response = $this->actingAs($this->user)
        ->patch("/projects/{$this->project->id}/booking/{$booking->id}/status", [
            'status' => 'completed',
        ]);

    $response->assertSessionHasNoErrors();
    $booking->refresh();

    expect($booking->status)->toBe('completed');
});

test('reserving an appointment dispatches a notification email to the project alert address', function () {
    Mail::fake();

    $nextMonday = Carbon::now()->next(Carbon::MONDAY)->format('Y-m-d');

    $this->post("/book/{$this->project->booking_public_token}/reserve", [
        'service_id' => $this->service->id,
        'date' => $nextMonday,
        'time' => '11:30',
        'customer_name' => 'Mail Test Guest',
        'customer_email' => 'guest@mailtest.com',
    ])->assertRedirect();

    Mail::assertQueued(NewBookingNotification::class, function ($mail) {
        return $mail->hasTo('support@speedyauto.com')
            && $mail->booking->customer_name === 'Mail Test Guest';
    });
});

test('concurrent reservation attempting locked slot is rejected with 422', function () {
    $nextMonday = Carbon::now()->next(Carbon::MONDAY)->format('Y-m-d');

    // Simulate an ongoing concurrent lock held on 15:00
    $lockKey = "booking_slot:{$this->project->id}:{$nextMonday}:15:00";
    $lock = Cache::lock($lockKey, 10);
    $lock->get(); // Acquire lock

    try {
        $response = $this->postJson("/book/{$this->project->booking_public_token}/reserve", [
            'service_id' => $this->service->id,
            'date' => $nextMonday,
            'time' => '15:00',
            'customer_name' => 'Concurrent Guest',
            'customer_email' => 'concurrent@example.com',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['time']);
    } finally {
        $lock->release();
    }
});
