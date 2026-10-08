<?php

use App\Jobs\DeployToVercelJob;
use App\Mail\GuestContactedClient;
use App\Models\ContactEmailer;
use App\Models\ContactMessage;
use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeTestClient(): User
{
    $user = User::factory()->create();
    $user->assignRole('client');

    return $user;
}

function makeTestAdmin(): User
{
    $user = User::factory()->create();
    $user->assignRole('admin');

    return $user;
}

function createTestProject(User $user, ?string $html = null): Project
{
    $workspace = Workspace::create([
        'user_id' => $user->id,
        'name' => 'Workspace '.$user->id,
        'slug' => 'workspace-'.$user->id.'-'.Str::random(5),
    ]);

    return Project::create([
        'user_id' => $user->id,
        'workspace_id' => $workspace->id,
        'project_name' => 'Test Project',
        'preferences' => ['theme' => 'dark'],
        'html_content' => $html ?? '<html><body><form id="contact-form"><input type="email" name="email"><textarea name="message"></textarea><button type="submit">Send</button></form></body></html>',
        'status' => 'completed',
        'deployment_status' => 'deployed',
        'project_url' => 'https://example.vercel.app',
    ]);
}

// ─── Admin Emailer Config Page ───────────────────────────────────────────────

test('admin can view the emailer config page', function () {
    $admin = makeTestAdmin();
    $client = makeTestClient();
    $project = createTestProject($client);

    $this->actingAs($admin)
        ->get(route('admin.projects.emailer.show', $project))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Emailer/Show')
            ->has('project')
            ->where('emailer', null)
        );
});

test('non-admin cannot access emailer config page', function () {
    $client = makeTestClient();
    $project = createTestProject($client);

    $this->actingAs($client)
        ->get(route('admin.projects.emailer.show', $project))
        ->assertForbidden();
});

test('admin can configure a contact emailer for a project', function () {
    $admin = makeTestAdmin();
    $client = makeTestClient();
    $project = createTestProject($client);

    $response = $this->actingAs($admin)
        ->post(route('admin.projects.emailer.store', $project), [
            'recipient_email' => 'client@business.com',
            'reply_name' => 'Business Owner',
        ]);

    $response->assertRedirect(route('admin.projects.emailer.show', $project));

    $emailer = ContactEmailer::where('project_id', $project->id)->first();
    expect($emailer)->not->toBeNull();
    expect($emailer->recipient_email)->toBe('client@business.com');
    expect($emailer->reply_name)->toBe('Business Owner');
    expect($emailer->is_active)->toBeTrue();
    expect($emailer->public_token)->not->toBeEmpty();

    // Verify script injection in html_content
    $project->refresh();
    expect($project->html_content)->toContain('<!-- SS-EMAILER-START -->');
    expect($project->html_content)->toContain($emailer->public_token);
});

test('admin cannot configure duplicate emailer for the same project', function () {
    $admin = makeTestAdmin();
    $client = makeTestClient();
    $project = createTestProject($client);

    ContactEmailer::create([
        'project_id' => $project->id,
        'recipient_email' => 'first@business.com',
        'reply_name' => 'Owner',
        'public_token' => (string) Str::uuid(),
        'is_active' => true,
    ]);

    $this->actingAs($admin)
        ->post(route('admin.projects.emailer.store', $project), [
            'recipient_email' => 'second@business.com',
            'reply_name' => 'Owner',
        ])
        ->assertSessionHasErrors(['emailer']);
});

test('admin can update emailer configuration', function () {
    $admin = makeTestAdmin();
    $client = makeTestClient();
    $project = createTestProject($client);

    $emailer = ContactEmailer::create([
        'project_id' => $project->id,
        'recipient_email' => 'old@business.com',
        'reply_name' => 'Old Name',
        'public_token' => (string) Str::uuid(),
        'is_active' => true,
    ]);

    $response = $this->actingAs($admin)
        ->patch(route('admin.projects.emailer.update', $project), [
            'recipient_email' => 'new@business.com',
            'reply_name' => 'New Name',
        ]);

    $response->assertRedirect(route('admin.projects.emailer.show', $project));

    $emailer->refresh();
    expect($emailer->recipient_email)->toBe('new@business.com');
    expect($emailer->reply_name)->toBe('New Name');
});

test('admin can toggle emailer active state', function () {
    $admin = makeTestAdmin();
    $client = makeTestClient();
    $project = createTestProject($client);

    $emailer = ContactEmailer::create([
        'project_id' => $project->id,
        'recipient_email' => 'client@business.com',
        'reply_name' => 'Owner',
        'public_token' => (string) Str::uuid(),
        'is_active' => true,
    ]);

    // Deactivate
    $this->actingAs($admin)
        ->patch(route('admin.projects.emailer.toggle', $project))
        ->assertSessionHasNoErrors();

    $emailer->refresh();
    expect($emailer->is_active)->toBeFalse();

    // Project HTML should no longer have the script
    $project->refresh();
    expect($project->html_content)->not->toContain('<!-- SS-EMAILER-START -->');

    // Reactivate
    $this->actingAs($admin)
        ->patch(route('admin.projects.emailer.toggle', $project))
        ->assertSessionHasNoErrors();

    $emailer->refresh();
    expect($emailer->is_active)->toBeTrue();
    $project->refresh();
    expect($project->html_content)->toContain('<!-- SS-EMAILER-START -->');
});

test('admin can trigger redeployment from emailer page', function () {
    Queue::fake();

    $admin = makeTestAdmin();
    $client = makeTestClient();
    $project = createTestProject($client);

    $this->actingAs($admin)
        ->post(route('admin.projects.emailer.deploy', $project))
        ->assertRedirect();

    Queue::assertPushed(DeployToVercelJob::class, function ($job) use ($project) {
        return $job->projectId === $project->id;
    });

    $project->refresh();
    expect($project->deployment_status->value)->toBe('deploying');
});

// ─── Public Contact Form Submission ──────────────────────────────────────────

test('guest can submit contact form with valid active token', function () {
    Mail::fake();

    $client = makeTestClient();
    $project = createTestProject($client);

    $emailer = ContactEmailer::create([
        'project_id' => $project->id,
        'recipient_email' => 'client@business.com',
        'reply_name' => 'Jose Bakery',
        'public_token' => (string) Str::uuid(),
        'is_active' => true,
    ]);

    $response = $this->postJson(route('contact.store', ['token' => $emailer->public_token]), [
        'name' => 'Maria Guest',
        'email' => 'maria@gmail.com',
        'subject' => 'Catering Inquiry',
        'message' => 'Hello, I would like to inquire about catering services for 50 people.',
    ]);

    $response->assertOk()
        ->assertJson(['message' => 'Your message has been sent!']);

    $message = ContactMessage::where('contact_emailer_id', $emailer->id)->first();
    expect($message)->not->toBeNull();
    expect($message->guest_name)->toBe('Maria Guest');
    expect($message->guest_email)->toBe('maria@gmail.com');
    expect($message->subject)->toBe('Catering Inquiry');

    Mail::assertQueued(GuestContactedClient::class, function ($mail) {
        return $mail->hasTo('client@business.com')
            && $mail->hasReplyTo('maria@gmail.com', 'Maria Guest');
    });
});

test('guest submission returns 404 for invalid token', function () {
    $response = $this->postJson(route('contact.store', ['token' => 'non-existent-token']), [
        'name' => 'Guest',
        'email' => 'guest@example.com',
        'subject' => 'Hello',
        'message' => 'This is a test message that has enough length.',
    ]);

    $response->assertNotFound();
});

test('guest submission returns 404 for inactive emailer', function () {
    $client = makeTestClient();
    $project = createTestProject($client);

    $emailer = ContactEmailer::create([
        'project_id' => $project->id,
        'recipient_email' => 'client@business.com',
        'reply_name' => 'Jose',
        'public_token' => (string) Str::uuid(),
        'is_active' => false,
    ]);

    $response = $this->postJson(route('contact.store', ['token' => $emailer->public_token]), [
        'name' => 'Guest',
        'email' => 'guest@example.com',
        'subject' => 'Hello',
        'message' => 'This is a test message that has enough length.',
    ]);

    $response->assertNotFound();
});

test('guest submission validates required fields', function () {
    $client = makeTestClient();
    $project = createTestProject($client);

    $emailer = ContactEmailer::create([
        'project_id' => $project->id,
        'recipient_email' => 'client@business.com',
        'reply_name' => 'Jose',
        'public_token' => (string) Str::uuid(),
        'is_active' => true,
    ]);

    $this->postJson(route('contact.store', ['token' => $emailer->public_token]), [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'email', 'subject', 'message']);
});

// ─── Client Contact Messages Index ───────────────────────────────────────────

test('client can view contact messages for their project', function () {
    $client = makeTestClient();
    $project = createTestProject($client);

    $emailer = ContactEmailer::create([
        'project_id' => $project->id,
        'recipient_email' => 'client@business.com',
        'reply_name' => 'Owner',
        'public_token' => (string) Str::uuid(),
        'is_active' => true,
    ]);

    ContactMessage::create([
        'contact_emailer_id' => $emailer->id,
        'guest_name' => 'Guest One',
        'guest_email' => 'guest@example.com',
        'subject' => 'Question',
        'message' => 'Test message here.',
    ]);

    $this->actingAs($client)
        ->get(route('projects.contact-messages.index', $project))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Project/ContactMessages')
            ->has('messages.data', 1)
        );
});

test('client cannot view contact messages of another clients project', function () {
    $owner = makeTestClient();
    $other = makeTestClient();
    $project = createTestProject($owner);

    ContactEmailer::create([
        'project_id' => $project->id,
        'recipient_email' => 'client@business.com',
        'reply_name' => 'Owner',
        'public_token' => (string) Str::uuid(),
        'is_active' => true,
    ]);

    $this->actingAs($other)
        ->get(route('projects.contact-messages.index', $project))
        ->assertForbidden();
});

// ─── Mailable Test ───────────────────────────────────────────────────────────

test('GuestContactedClient mailable renders correctly with reply-to header', function () {
    $client = makeTestClient();
    $project = createTestProject($client);

    $emailer = ContactEmailer::create([
        'project_id' => $project->id,
        'recipient_email' => 'owner@bakery.com',
        'reply_name' => 'Owner',
        'public_token' => (string) Str::uuid(),
        'is_active' => true,
    ]);

    $message = ContactMessage::create([
        'contact_emailer_id' => $emailer->id,
        'guest_name' => 'Maria Santos',
        'guest_email' => 'maria@gmail.com',
        'subject' => 'Cake Order',
        'message' => 'I would like to order a birthday cake.',
    ]);

    $mailable = new GuestContactedClient($message, $emailer);

    $mailable->assertHasTo('owner@bakery.com');
    $mailable->assertHasReplyTo('maria@gmail.com', 'Maria Santos');
    $mailable->assertSeeInHtml('Maria Santos');
    $mailable->assertSeeInHtml('Cake Order');
    $mailable->assertSeeInHtml('I would like to order a birthday cake.');
    $mailable->assertSeeInHtml('Reply to Maria Santos');
});

test('admin can send test inquiry from emailer page', function () {
    Mail::fake();

    $admin = makeTestAdmin();
    $client = makeTestClient();
    $project = createTestProject($client);

    $emailer = ContactEmailer::create([
        'project_id' => $project->id,
        'recipient_email' => 'client@business.com',
        'reply_name' => 'Owner',
        'public_token' => (string) Str::uuid(),
        'is_active' => true,
    ]);

    $this->actingAs($admin)
        ->postJson(route('admin.projects.emailer.test', $project))
        ->assertOk()
        ->assertJson([
            'success' => true,
            'messages_count' => 1,
        ]);

    expect($emailer->messages()->count())->toBe(1);
    Mail::assertQueued(GuestContactedClient::class);
});
