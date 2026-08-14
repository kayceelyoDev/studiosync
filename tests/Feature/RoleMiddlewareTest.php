<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Seed roles before each test
    $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
});

// ─── Helper factories ────────────────────────────────────────────────────────

function makeUser(string $role): User
{
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

// ─── super_admin middleware ───────────────────────────────────────────────────

it('allows super_admin to access super-admin routes', function () {
    $user = makeUser('super_admin');

    $this->actingAs($user)
        ->get('/super-admin')
        ->assertStatus(200);
})->skip('No super-admin routes defined yet — add when first route is created');

it('blocks admin from super-admin-only routes', function () {
    $user = makeUser('admin');

    $this->actingAs($user)
        ->get('/super-admin')
        ->assertForbidden();
})->skip('No super-admin routes defined yet — add when first route is created');

it('blocks client from super-admin-only routes', function () {
    $user = makeUser('client');

    $this->actingAs($user)
        ->get('/super-admin')
        ->assertForbidden();
})->skip('No super-admin routes defined yet — add when first route is created');

// ─── admin middleware ─────────────────────────────────────────────────────────

it('blocks client from admin routes', function () {
    $user = makeUser('client');

    $this->actingAs($user)
        ->get('/admin')
        ->assertForbidden();
})->skip('No admin routes defined yet — add when first route is created');

// ─── CheckRoleMiddleware unit tests ───────────────────────────────────────────

it('allows a super_admin to access the dashboard', function () {
    $user = makeUser('super_admin');

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertOk();
});

it('allows an admin to access the dashboard', function () {
    $user = makeUser('admin');

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertOk();
});

it('allows a client to access the dashboard', function () {
    $user = makeUser('client');

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertOk();
});

it('blocks unauthenticated users from the dashboard', function () {
    $this->get('/dashboard')
        ->assertRedirect('/login');
});

// ─── Role assignment ──────────────────────────────────────────────────────────

it('assigns exactly one role per user', function () {
    $superAdmin = makeUser('super_admin');
    $admin = makeUser('admin');
    $client = makeUser('client');

    expect($superAdmin->hasRole('super_admin'))->toBeTrue()
        ->and($superAdmin->hasRole('admin'))->toBeFalse()
        ->and($admin->hasRole('admin'))->toBeTrue()
        ->and($admin->hasRole('super_admin'))->toBeFalse()
        ->and($client->hasRole('client'))->toBeTrue()
        ->and($client->hasRole('super_admin'))->toBeFalse();
});

it('hasAnyRole works correctly for multi-role middleware check', function () {
    $admin = makeUser('admin');

    expect($admin->hasAnyRole(['super_admin', 'admin']))->toBeTrue()
        ->and($admin->hasAnyRole(['super_admin']))->toBeFalse()
        ->and($admin->hasAnyRole(['client']))->toBeFalse();
});
