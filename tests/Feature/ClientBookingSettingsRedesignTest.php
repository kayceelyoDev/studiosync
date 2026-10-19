<?php

use App\Models\Booking;
use App\Models\BookingService;
use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RoleSeeder']);

    $this->client = User::factory()->create();
    $this->client->assignRole('client');
    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');

    $this->workspace = Workspace::create([
        'user_id' => $this->client->id,
        'name' => 'Client Creative Studio',
        'slug' => 'client-creative-studio',
    ]);

    $this->project = Project::create([
        'user_id' => $this->client->id,
        'workspace_id' => $this->workspace->id,
        'project_name' => 'Dr. Smith Dental Clinic',
        'preferences' => [],
        'html_content' => '<!DOCTYPE html><html><body><nav><a href="#about">About</a></nav><section id="hero">Welcome</section></body></html>',
        'status' => 'completed',
        'booking_enabled' => true,
        'booking_public_token' => 'bk_live_smith_clinic_123',
        'booking_notification_email' => 'drsmith@clinic.com',
        'booking_settings' => [
            'start_time' => '09:00',
            'end_time' => '17:00',
            'days' => [1, 2, 3, 4, 5],
        ],
    ]);
});

test('client can view booking settings, services, and appointments on project show page', function () {
    $service = BookingService::create([
        'project_id' => $this->project->id,
        'name' => 'Teeth Whitening Consultation',
        'description' => '30 minute expert dental consultation',
        'duration_minutes' => 30,
        'price' => 75.00,
        'currency' => 'USD',
        'is_active' => true,
    ]);

    $booking = Booking::create([
        'project_id' => $this->project->id,
        'booking_service_id' => $service->id,
        'customer_name' => 'Alice Walker',
        'customer_email' => 'alice@example.com',
        'booking_date' => '2026-10-22',
        'booking_time' => '10:00:00',
        'status' => 'confirmed',
    ]);

    $response = $this->actingAs($this->client)->get("/projects/{$this->project->id}");

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Project/Show')
        ->has('project')
        ->where('project.booking_enabled', true)
        ->where('project.booking_public_token', 'bk_live_smith_clinic_123')
        ->where('project.booking_notification_email', 'drsmith@clinic.com')
        ->has('project.booking_services', 1)
        ->where('project.booking_services.0.name', 'Teeth Whitening Consultation')
        ->has('project.bookings', 1)
        ->where('project.bookings.0.customer_name', 'Alice Walker')
    );
});

test('client can add a new service from their project booking settings', function () {
    $response = $this->actingAs($this->client)
        ->post("/projects/{$this->project->id}/booking/services", [
            'name' => 'Root Canal Treatment',
            'description' => 'Comprehensive restorative treatment',
            'duration_minutes' => 60,
            'price' => 250.00,
            'currency' => 'USD',
            'is_active' => true,
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('booking_services', [
        'project_id' => $this->project->id,
        'name' => 'Root Canal Treatment',
        'duration_minutes' => 60,
        'price' => 250.00,
        'currency' => 'USD',
        'is_active' => true,
    ]);
});

test('client can update an existing service from their project booking settings', function () {
    $service = BookingService::create([
        'project_id' => $this->project->id,
        'name' => 'Quick Polish',
        'duration_minutes' => 20,
        'price' => 30.00,
        'currency' => 'USD',
        'is_active' => true,
    ]);

    $response = $this->actingAs($this->client)
        ->put("/projects/{$this->project->id}/booking/services/{$service->id}", [
            'name' => 'Premium Tooth Polish & Cleanse',
            'description' => 'Full fluoride treatment included',
            'duration_minutes' => 30,
            'price' => 55.00,
            'currency' => 'USD',
            'is_active' => true,
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $service->refresh();
    expect($service->name)->toBe('Premium Tooth Polish & Cleanse');
    expect($service->duration_minutes)->toBe(30);
    expect((float) $service->price)->toBe(55.00);
});

test('client can delete a service from their project booking settings', function () {
    $service = BookingService::create([
        'project_id' => $this->project->id,
        'name' => 'Old Legacy Service',
        'duration_minutes' => 15,
        'price' => 20.00,
        'currency' => 'USD',
        'is_active' => false,
    ]);

    $response = $this->actingAs($this->client)
        ->delete("/projects/{$this->project->id}/booking/services/{$service->id}");

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $this->assertDatabaseMissing('booking_services', [
        'id' => $service->id,
    ]);
});

test('client can update operating hours and notification email in booking settings', function () {
    $response = $this->actingAs($this->client)
        ->put("/projects/{$this->project->id}/booking/settings", [
            'booking_notification_email' => 'appointments@smithdental.com',
            'booking_settings' => [
                'start_time' => '08:30',
                'end_time' => '16:30',
                'days' => [1, 2, 3, 4],
            ],
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $this->project->refresh();
    expect($this->project->booking_notification_email)->toBe('appointments@smithdental.com');
    expect($this->project->booking_settings['start_time'])->toBe('08:30');
    expect($this->project->booking_settings['end_time'])->toBe('16:30');
    expect($this->project->booking_settings['days'])->toBe([1, 2, 3, 4]);
});

test('client can update operating settings with empty days (closed schedule)', function () {
    $response = $this->actingAs($this->client)
        ->put("/projects/{$this->project->id}/booking/settings", [
            'booking_notification_email' => 'closed@smithdental.com',
            'booking_settings' => [
                'start_time' => '09:00',
                'end_time' => '17:00',
                'days' => [],
            ],
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $this->project->refresh();
    expect($this->project->booking_settings['days'])->toBe([]);
});

test('unauthorized user cannot modify booking services or settings', function () {
    $intruder = User::factory()->create();

    // Trying to add service
    $responseService = $this->actingAs($intruder)
        ->post("/projects/{$this->project->id}/booking/services", [
            'name' => 'Hacked Service',
            'duration_minutes' => 30,
            'price' => 10.00,
        ]);
    $responseService->assertForbidden();

    // Trying to update settings
    $responseSettings = $this->actingAs($intruder)
        ->put("/projects/{$this->project->id}/booking/settings", [
            'booking_notification_email' => 'hacked@evil.com',
            'booking_settings' => [
                'start_time' => '00:00',
                'end_time' => '23:59',
                'days' => [1, 2, 3, 4, 5, 6, 7],
            ],
        ]);
    $responseSettings->assertForbidden();
});

test('admin can manage booking services and settings for client project', function () {
    $response = $this->actingAs($this->admin)
        ->post("/projects/{$this->project->id}/booking/services", [
            'name' => 'Admin Vetted Premium Checkup',
            'duration_minutes' => 45,
            'price' => 120.00,
            'currency' => 'USD',
            'is_active' => true,
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('booking_services', [
        'project_id' => $this->project->id,
        'name' => 'Admin Vetted Premium Checkup',
        'price' => 120.00,
    ]);
});

test('client can mark booking appointment as completed or cancelled', function () {
    $service = BookingService::create([
        'project_id' => $this->project->id,
        'name' => 'General Cleaning',
        'duration_minutes' => 30,
        'price' => 50.00,
    ]);

    $booking = Booking::create([
        'project_id' => $this->project->id,
        'booking_service_id' => $service->id,
        'customer_name' => 'Bob Marley',
        'customer_email' => 'bob@reggae.com',
        'booking_date' => '2026-10-24',
        'booking_time' => '14:00:00',
        'status' => 'confirmed',
    ]);

    // Mark as completed
    $resComplete = $this->actingAs($this->client)
        ->patch("/projects/{$this->project->id}/booking/{$booking->id}/status", [
            'status' => 'completed',
        ]);
    $resComplete->assertRedirect();
    $booking->refresh();
    expect($booking->status)->toBe('completed');

    // Mark as cancelled with reason
    $resCancel = $this->actingAs($this->client)
        ->patch("/projects/{$this->project->id}/booking/{$booking->id}/status", [
            'status' => 'cancelled',
            'cancellation_reason' => 'Guest rescheduled via phone',
        ]);
    $resCancel->assertRedirect();
    $booking->refresh();
    expect($booking->status)->toBe('cancelled');
    expect($booking->cancellation_reason)->toBe('Guest rescheduled via phone');
});

test('client can access booking management hub without embed code requirement', function () {
    $response = $this->actingAs($this->client)->get("/projects/{$this->project->id}/booking");

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Booking/Management/Index')
        ->has('project')
        ->has('services')
        ->has('bookings')
    );
});

test('client can toggle a service between active and inactive', function () {
    $service = BookingService::create([
        'project_id' => $this->project->id,
        'name' => 'Seasonal Floss Special',
        'duration_minutes' => 15,
        'price' => 25.00,
        'currency' => 'USD',
        'is_active' => true,
    ]);

    // Deactivate service
    $responseDeactivate = $this->actingAs($this->client)
        ->put("/projects/{$this->project->id}/booking/services/{$service->id}", [
            'name' => 'Seasonal Floss Special',
            'duration_minutes' => 15,
            'price' => 25.00,
            'currency' => 'USD',
            'is_active' => false,
        ]);

    $responseDeactivate->assertRedirect();
    $service->refresh();
    expect($service->is_active)->toBeFalse();

    // Reactivate service
    $responseReactivate = $this->actingAs($this->client)
        ->put("/projects/{$this->project->id}/booking/services/{$service->id}", [
            'name' => 'Seasonal Floss Special',
            'duration_minutes' => 15,
            'price' => 25.00,
            'currency' => 'USD',
            'is_active' => true,
        ]);

    $responseReactivate->assertRedirect();
    $service->refresh();
    expect($service->is_active)->toBeTrue();
});

test('public booking slots returns empty when client closes all schedule days', function () {
    $service = BookingService::create([
        'project_id' => $this->project->id,
        'name' => 'Emergency Checkup',
        'duration_minutes' => 30,
        'price' => 100.00,
        'is_active' => true,
    ]);

    // Close all days
    $this->project->update([
        'booking_settings' => [
            'start_time' => '09:00',
            'end_time' => '17:00',
            'days' => [],
        ],
    ]);

    $response = $this->getJson("/book/{$this->project->booking_public_token}/slots?service_id={$service->id}&date=2026-10-23");
    $response->assertOk();
    $response->assertJson(['slots' => []]);
});
