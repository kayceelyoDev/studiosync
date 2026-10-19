<?php

use App\Models\Booking;
use App\Models\BookingService;
use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;
use App\Services\BookingAvailabilityService;
use Carbon\Carbon;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->workspace = Workspace::create([
        'user_id' => $this->user->id,
        'name' => 'Test Workspace',
        'slug' => 'test-workspace',
    ]);
    $this->project = Project::create([
        'user_id' => $this->user->id,
        'workspace_id' => $this->workspace->id,
        'project_name' => 'Test Clinic',
        'preferences' => [],
        'status' => 'completed',
        'booking_enabled' => true,
        'booking_public_token' => 'bk_live_test_availability',
        'booking_notification_email' => 'clinic@example.com',
        'booking_settings' => [
            'start_time' => '09:00',
            'end_time' => '17:00',
            'days' => [1, 2, 3, 4, 5], // Mon-Fri
        ],
    ]);

    $this->service = BookingService::create([
        'project_id' => $this->project->id,
        'name' => 'General Consultation',
        'duration_minutes' => 30,
        'price' => 50.00,
        'currency' => 'USD',
        'is_active' => true,
    ]);

    $this->availabilityService = new BookingAvailabilityService;
});

test('it calculates all 30-minute slots between 9am and 5pm on a future weekday', function () {
    $nextMonday = Carbon::now()->next(Carbon::MONDAY)->format('Y-m-d');

    $slots = $this->availabilityService->getAvailableSlots($this->project, $this->service, $nextMonday);

    expect($slots)->toHaveCount(16);
    expect($slots[0])->toBe('09:00');
    expect($slots[15])->toBe('16:30');
});

test('it returns empty slots for non-operating days', function () {
    $nextSunday = Carbon::now()->next(Carbon::SUNDAY)->format('Y-m-d');

    $slots = $this->availabilityService->getAvailableSlots($this->project, $this->service, $nextSunday);

    expect($slots)->toBeEmpty();
});

test('it returns empty slots for past dates', function () {
    $yesterday = Carbon::yesterday()->format('Y-m-d');

    $slots = $this->availabilityService->getAvailableSlots($this->project, $this->service, $yesterday);

    expect($slots)->toBeEmpty();
});

test('it excludes occupied slot from available slots', function () {
    $nextMonday = Carbon::now()->next(Carbon::MONDAY)->format('Y-m-d');

    Booking::create([
        'project_id' => $this->project->id,
        'booking_service_id' => $this->service->id,
        'customer_name' => 'Alice',
        'customer_email' => 'alice@example.com',
        'booking_date' => $nextMonday,
        'booking_time' => '10:00',
        'status' => 'confirmed',
    ]);

    $slots = $this->availabilityService->getAvailableSlots($this->project, $this->service, $nextMonday);

    expect($slots)->not->toContain('10:00');
    expect($slots)->toContain('09:30');
    expect($slots)->toContain('10:30');
    expect($slots)->toHaveCount(15);

    expect($this->availabilityService->isSlotAvailable($this->project, $this->service, $nextMonday, '10:00'))->toBeFalse();
    expect($this->availabilityService->isSlotAvailable($this->project, $this->service, $nextMonday, '09:30'))->toBeTrue();
});

test('it includes slot if existing booking was cancelled', function () {
    $nextMonday = Carbon::now()->next(Carbon::MONDAY)->format('Y-m-d');

    Booking::create([
        'project_id' => $this->project->id,
        'booking_service_id' => $this->service->id,
        'customer_name' => 'Bob',
        'customer_email' => 'bob@example.com',
        'booking_date' => $nextMonday,
        'booking_time' => '11:00',
        'status' => 'cancelled',
        'cancellation_reason' => 'User requested',
    ]);

    $slots = $this->availabilityService->getAvailableSlots($this->project, $this->service, $nextMonday);

    expect($slots)->toContain('11:00');
    expect($this->availabilityService->isSlotAvailable($this->project, $this->service, $nextMonday, '11:00'))->toBeTrue();
});

test('it handles single-digit hour format and seconds in operating hours without crashing', function () {
    $this->project->update([
        'booking_settings' => [
            'start_time' => '9:00', // single-digit hour without leading zero
            'end_time' => '17:00:00', // with seconds
            'days' => [1, 2, 3, 4, 5],
        ],
    ]);

    $nextMonday = Carbon::now()->next(Carbon::MONDAY)->format('Y-m-d');
    $slots = $this->availabilityService->getAvailableSlots($this->project, $this->service, $nextMonday);

    expect($slots)->not->toBeEmpty();
    expect($slots[0])->toBe('09:00');
    expect($this->availabilityService->isSlotAvailable($this->project, $this->service, $nextMonday, '9:00'))->toBeTrue();
    expect($this->availabilityService->isSlotAvailable($this->project, $this->service, $nextMonday, '09:00:00'))->toBeTrue();
});

test('it handles string-encoded operating days in settings', function () {
    $this->project->update([
        'booking_settings' => [
            'start_time' => '09:00',
            'end_time' => '17:00',
            'days' => ['1', '2', '3', '4', '5'], // string days from JSON
        ],
    ]);

    $nextMonday = Carbon::now()->next(Carbon::MONDAY)->format('Y-m-d');
    $slots = $this->availabilityService->getAvailableSlots($this->project, $this->service, $nextMonday);

    expect($slots)->not->toBeEmpty();
    expect($slots[0])->toBe('09:00');
});
