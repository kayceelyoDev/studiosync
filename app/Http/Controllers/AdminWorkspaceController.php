<?php

namespace App\Http\Controllers;

use App\Enums\ProjectStatus;
use App\Models\BookingService;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminWorkspaceController extends Controller
{
    public function index()
    {
        $projects = Project::with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Admin/Workspaces/Index', [
            'workspaces' => $projects,
        ]);
    }

    public function show(Project $project)
    {
        $project->makeVisible('generated_prompt');
        $project->load([
            'user:id,name,email',
            'workspace:id,name,slug',
            'projectAssets',
            'deployments' => fn ($q) => $q->latest()->limit(5),
            'contactEmailer' => fn ($q) => $q->withCount('messages'),
            'bookingServices',
            'clientRequests' => fn ($q) => $q->latest(),
        ]);

        return Inertia::render('Admin/Workspaces/Show', [
            'workspace' => $project,
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:'.implode(',', array_column(ProjectStatus::cases(), 'value'))],
            'generated_prompt' => 'nullable|string',
            'project_url' => 'nullable|url',
        ]);

        $project->update($validated);

        return redirect()->route('admin.projects.show', $project->id)
            ->with('success', 'Project updated successfully.');
    }

    public function initializeBooking(Request $request, Project $project)
    {
        $pendingRequest = $project->clientRequests()
            ->where('category', 'booking_system')
            ->where('status', 'pending')
            ->latest()
            ->first();

        $intakeData = $pendingRequest ? $pendingRequest->intake_data : [];

        $servicesData = $request->input('services') ?? ($intakeData['services'] ?? []);
        $notificationEmail = $request->input('notification_email')
            ?? ($intakeData['notification_email'] ?? $project->user?->email);
        $bookingSettings = $request->input('booking_settings')
            ?? ($intakeData['operating_hours'] ?? [
                'start_time' => '09:00',
                'end_time' => '17:00',
                'days' => [1, 2, 3, 4, 5],
            ]);

        if (empty($servicesData)) {
            $servicesData = [
                [
                    'name' => 'General Consultation',
                    'description' => 'Initial consultation appointment',
                    'duration_minutes' => 30,
                    'price' => 0.00,
                    'currency' => 'USD',
                ],
            ];
        }

        DB::transaction(function () use ($project, $servicesData, $notificationEmail, $bookingSettings, $pendingRequest) {
            // Only seed services if the project currently has none to maintain idempotency
            if ($project->bookingServices()->count() === 0 && ! empty($servicesData) && is_array($servicesData)) {
                foreach ($servicesData as $serviceItem) {
                    if (empty($serviceItem['name'])) {
                        continue;
                    }
                    BookingService::create([
                        'project_id' => $project->id,
                        'name' => $serviceItem['name'],
                        'description' => $serviceItem['description'] ?? null,
                        'duration_minutes' => (int) ($serviceItem['duration_minutes'] ?? 30),
                        'price' => (float) ($serviceItem['price'] ?? 0.00),
                        'currency' => $serviceItem['currency'] ?? 'USD',
                        'is_active' => true,
                    ]);
                }
            }

            $project->update([
                'booking_enabled' => true,
                'booking_public_token' => $project->booking_public_token ?: Project::generateBookingToken(),
                'booking_notification_email' => $notificationEmail,
                'booking_settings' => $bookingSettings,
            ]);

            if ($pendingRequest) {
                $pendingRequest->update([
                    'status' => 'completed',
                    'admin_id' => auth()->id(),
                    'completed_at' => now(),
                ]);
            }
        });

        return redirect()->back()->with('success', 'Booking system initialized and enabled for this project.');
    }

    public function toggleBooking(Request $request, Project $project)
    {
        $newStatus = ! $project->booking_enabled;

        $updateData = ['booking_enabled' => $newStatus];
        if ($newStatus && ! $project->booking_public_token) {
            $updateData['booking_public_token'] = Project::generateBookingToken();
        }

        $project->update($updateData);

        $statusMsg = $newStatus ? 'enabled' : 'disabled';

        return redirect()->back()->with('success', "Booking feature {$statusMsg} successfully.");
    }
}
