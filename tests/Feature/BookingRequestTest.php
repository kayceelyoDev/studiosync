<?php

use App\Models\ClientRequest;
use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RoleSeeder']);

    $this->client = User::factory()->create();
    $this->client->assignRole('client');

    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');

    $this->workspace = Workspace::create([
        'user_id' => $this->client->id,
        'name' => 'Client Workspace',
        'slug' => 'client-workspace',
    ]);

    $this->project = Project::create([
        'user_id' => $this->client->id,
        'workspace_id' => $this->workspace->id,
        'project_name' => 'Wellness Spa',
        'preferences' => [],
        'status' => 'completed',
    ]);
});

test('client can submit a booking feature request', function () {
    $response = $this->actingAs($this->client)
        ->post("/projects/{$this->project->id}/booking-request", [
            'notification_email' => 'spa@example.com',
            'operating_hours' => [
                'start_time' => '10:00',
                'end_time' => '18:00',
                'days' => [1, 2, 3, 4, 5, 6],
            ],
            'services' => [
                [
                    'name' => 'Aromatherapy Massage',
                    'description' => 'Relaxing 60-min essential oils massage',
                    'duration_minutes' => 60,
                    'price' => 120.00,
                    'currency' => 'USD',
                ],
                [
                    'name' => 'Express Facial',
                    'description' => 'Quick skin rejuvenation',
                    'duration_minutes' => 30,
                    'price' => 65.00,
                    'currency' => 'USD',
                ],
            ],
            'notes' => 'Please activate before next week.',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $this->assertDatabaseHas('client_requests', [
        'project_id' => $this->project->id,
        'user_id' => $this->client->id,
        'category' => 'booking_system',
        'status' => 'pending',
    ]);

    $request = ClientRequest::where('project_id', $this->project->id)->first();
    $data = $request->intake_data;

    expect($data['notification_email'])->toBe('spa@example.com');
    expect($data['services'])->toHaveCount(2);
    expect($data['services'][0]['name'])->toBe('Aromatherapy Massage');
});

test('admin can initialize and approve booking feature from pending request', function () {
    // Client submits request first
    $intakePayload = [
        'notification_email' => 'contact@spa.com',
        'operating_hours' => [
            'start_time' => '09:00',
            'end_time' => '17:00',
            'days' => [1, 2, 3, 4, 5],
        ],
        'services' => [
            [
                'name' => 'Deep Tissue Massage',
                'description' => 'Targeted muscle relief',
                'duration_minutes' => 60,
                'price' => 110.00,
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

    // Admin initializes
    $response = $this->actingAs($this->admin)
        ->post("/admin/projects/{$this->project->id}/booking/initialize");

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $this->project->refresh();
    $clientReq->refresh();

    expect($this->project->booking_enabled)->toBeTrue();
    expect($this->project->booking_public_token)->toStartWith('bk_live_');
    expect($this->project->booking_notification_email)->toBe('contact@spa.com');
    expect($clientReq->status)->toBe('completed');
    expect($clientReq->admin_id)->toBe($this->admin->id);

    // Verify services were seeded
    $this->assertDatabaseHas('booking_services', [
        'project_id' => $this->project->id,
        'name' => 'Deep Tissue Massage',
        'duration_minutes' => 60,
        'price' => 110.00,
    ]);
});

test('admin can toggle booking enabled status', function () {
    $this->project->update([
        'booking_enabled' => true,
        'booking_public_token' => 'bk_live_test_toggle',
    ]);

    // Admin toggles OFF
    $this->actingAs($this->admin)
        ->patch("/admin/projects/{$this->project->id}/booking/toggle")
        ->assertRedirect();

    $this->project->refresh();
    expect($this->project->booking_enabled)->toBeFalse();

    // Admin toggles ON
    $this->actingAs($this->admin)
        ->patch("/admin/projects/{$this->project->id}/booking/toggle")
        ->assertRedirect();

    $this->project->refresh();
    expect($this->project->booking_enabled)->toBeTrue();
});

test('client cannot access admin initialize or toggle routes', function () {
    $this->actingAs($this->client)
        ->post("/admin/projects/{$this->project->id}/booking/initialize")
        ->assertStatus(403);

    $this->actingAs($this->client)
        ->patch("/admin/projects/{$this->project->id}/booking/toggle")
        ->assertStatus(403);
});

test('client cannot submit duplicate pending booking requests for the same project', function () {
    // 1st request succeeds
    $this->actingAs($this->client)
        ->post("/projects/{$this->project->id}/booking-request", [
            'notification_email' => 'spa@example.com',
            'services' => [
                ['name' => 'Service 1', 'duration_minutes' => 30, 'price' => 50],
            ],
        ])->assertRedirect();

    // 2nd request while 1st is pending should be rejected with session errors
    $response = $this->actingAs($this->client)
        ->post("/projects/{$this->project->id}/booking-request", [
            'notification_email' => 'spa2@example.com',
            'services' => [
                ['name' => 'Service 2', 'duration_minutes' => 30, 'price' => 60],
            ],
        ]);

    $response->assertSessionHasErrors(['message']);
    expect(ClientRequest::where('project_id', $this->project->id)->count())->toBe(1);
});

test('client cannot submit booking request if booking is already enabled', function () {
    $this->project->update(['booking_enabled' => true]);

    $response = $this->actingAs($this->client)
        ->post("/projects/{$this->project->id}/booking-request", [
            'notification_email' => 'spa@example.com',
            'services' => [
                ['name' => 'Service 1', 'duration_minutes' => 30, 'price' => 50],
            ],
        ]);

    $response->assertSessionHasErrors(['message']);
});

test('admin initializeBooking is idempotent and does not duplicate services', function () {
    $clientReq = ClientRequest::create([
        'user_id' => $this->client->id,
        'project_id' => $this->project->id,
        'category' => 'booking_system',
        'title' => 'Booking System Request',
        'description' => json_encode([
            'notification_email' => 'contact@spa.com',
            'services' => [
                ['name' => 'Massage', 'duration_minutes' => 60, 'price' => 100],
            ],
        ]),
        'status' => 'pending',
    ]);

    // First initialization
    $this->actingAs($this->admin)
        ->post("/admin/projects/{$this->project->id}/booking/initialize")
        ->assertRedirect();

    expect($this->project->bookingServices()->count())->toBe(1);

    // Second initialization (re-run)
    $this->actingAs($this->admin)
        ->post("/admin/projects/{$this->project->id}/booking/initialize")
        ->assertRedirect();

    // Still exactly 1 service, not duplicated
    expect($this->project->bookingServices()->count())->toBe(1);
});
