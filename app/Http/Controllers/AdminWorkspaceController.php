<?php

namespace App\Http\Controllers;

use App\Enums\ProjectStatus;
use App\Models\Project;
use App\Services\BookingCodeInjectionService;
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
            'accessTokens' => fn ($q) => $q->latest()->limit(10),
            'clientRequests' => fn ($q) => $q->latest(),
        ]);

        $hasBookingCta = app(BookingCodeInjectionService::class)->hasBookingCta($project);

        return Inertia::render('Admin/Workspaces/Show', [
            'workspace' => $project,
            'hasBookingCta' => $hasBookingCta,
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:'.implode(',', array_column(ProjectStatus::cases(), 'value'))],
            'generated_prompt' => 'nullable|string',
            'project_url' => 'nullable|url',
            'html_content' => 'nullable|string',
        ]);

        $project->update($validated);

        return redirect()->route('admin.projects.show', $project->id)
            ->with('success', 'Project updated successfully.');
    }

    public function initializeBooking(Request $request, Project $project)
    {
        $request->validate([
            'services' => ['nullable', 'array'],
            'services.*.id' => ['nullable', 'integer'],
            'services.*.name' => ['required_with:services', 'string', 'max:255'],
            'services.*.description' => ['nullable', 'string', 'max:1000'],
            'services.*.duration_minutes' => ['required_with:services', 'integer', 'min:5', 'max:480'],
            'services.*.price' => ['required_with:services', 'numeric', 'min:0'],
            'services.*.currency' => ['nullable', 'string', 'max:10'],
            'notification_email' => ['nullable', 'email', 'max:255'],
            'booking_settings' => ['nullable', 'array'],
            'auto_inject_cta' => ['nullable', 'boolean'],
        ]);

        $pendingRequest = $project->clientRequests()
            ->where('category', 'booking_system')
            ->where('status', 'pending')
            ->latest()
            ->first();

        $intakeData = $pendingRequest ? $pendingRequest->intake_data : [];

        $servicesData = $request->has('services')
            ? $request->input('services')
            : ($intakeData['services'] ?? []);

        $notificationEmail = $request->input('notification_email')
            ?? ($intakeData['notification_email'] ?? $project->booking_notification_email ?? $project->user?->email);

        $bookingSettings = $request->input('booking_settings')
            ?? ($project->booking_settings ?? ($intakeData['operating_hours'] ?? [
                'start_time' => '09:00',
                'end_time' => '17:00',
                'days' => [1, 2, 3, 4, 5],
            ]));

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

        DB::transaction(function () use ($project, $servicesData, $notificationEmail, $bookingSettings, $pendingRequest, $request) {
            $this->syncServices($project, $servicesData);

            $token = $project->booking_public_token ?: Project::generateBookingToken();

            $project->update([
                'booking_enabled' => true,
                'booking_public_token' => $token,
                'booking_notification_email' => $notificationEmail,
                'booking_settings' => $bookingSettings,
            ]);

            // Auto-inject CTA into website HTML if requested and HTML exists
            if ($request->input('auto_inject_cta', true) && ! empty($project->html_content)) {
                app(BookingCodeInjectionService::class)->injectBookingCta($project);
            }

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

    /**
     * Update services and configuration for a project with an active booking system.
     */
    public function updateServices(Request $request, Project $project)
    {
        $request->validate([
            'services' => ['required', 'array', 'min:1'],
            'services.*.id' => ['nullable', 'integer'],
            'services.*.name' => ['required', 'string', 'max:255'],
            'services.*.description' => ['nullable', 'string', 'max:1000'],
            'services.*.duration_minutes' => ['required', 'integer', 'min:5', 'max:480'],
            'services.*.price' => ['required', 'numeric', 'min:0'],
            'services.*.currency' => ['nullable', 'string', 'max:10'],
            'notification_email' => ['nullable', 'email', 'max:255'],
        ]);

        DB::transaction(function () use ($project, $request) {
            $this->syncServices($project, $request->input('services', []));

            if ($request->has('notification_email')) {
                $project->update([
                    'booking_notification_email' => $request->input('notification_email'),
                ]);
            }
        });

        return redirect()->back()->with('success', 'Booking services and configuration updated successfully.');
    }

    /**
     * Sync services safely without breaking historical booking relationships.
     */
    protected function syncServices(Project $project, array $servicesData): void
    {
        $existingServices = $project->bookingServices()->get()->keyBy('id');
        $keptIds = [];

        foreach ($servicesData as $item) {
            if (empty(trim($item['name'] ?? ''))) {
                continue;
            }

            $serviceId = ! empty($item['id']) ? (int) $item['id'] : null;
            $attributes = [
                'name' => trim($item['name']),
                'description' => $item['description'] ?? null,
                'duration_minutes' => (int) ($item['duration_minutes'] ?? 30),
                'price' => (float) ($item['price'] ?? 0.00),
                'currency' => $item['currency'] ?? 'USD',
                'is_active' => true,
            ];

            if ($serviceId && $existingServices->has($serviceId)) {
                $existing = $existingServices->get($serviceId);
                $existing->update($attributes);
                $keptIds[] = $existing->id;
            } else {
                $created = $project->bookingServices()->create($attributes);
                $keptIds[] = $created->id;
            }
        }

        // For removed services: if they have bookings, deactivate them; otherwise safe delete
        $orphaned = $existingServices->except($keptIds);
        foreach ($orphaned as $orphan) {
            if ($orphan->bookings()->exists()) {
                $orphan->update(['is_active' => false]);
            } else {
                $orphan->delete();
            }
        }
    }

    public function toggleBooking(Request $request, Project $project)
    {
        $newStatus = ! $project->booking_enabled;

        $updateData = ['booking_enabled' => $newStatus];
        if ($newStatus && ! $project->booking_public_token) {
            $updateData['booking_public_token'] = Project::generateBookingToken();
        }

        $project->update($updateData);

        $injectionService = app(BookingCodeInjectionService::class);
        if ($newStatus) {
            if (! empty($project->html_content)) {
                $injectionService->injectBookingCta($project);
            }
        } else {
            $injectionService->removeBookingCta($project);
        }

        $statusMsg = $newStatus ? 'enabled' : 'disabled';

        return redirect()->back()->with('success', "Booking feature {$statusMsg} successfully.");
    }

    public function injectBookingCta(Project $project)
    {
        if (! $project->booking_enabled) {
            return redirect()->back()->with('error', 'Booking must be enabled before injecting website code.');
        }

        $injected = app(BookingCodeInjectionService::class)->injectBookingCta($project);

        if ($injected) {
            return redirect()->back()->with('success', 'Booking CTA button successfully injected into website code.');
        }

        return redirect()->back()->with('error', 'Project does not contain HTML content to inject.');
    }

    public function removeBookingCta(Project $project)
    {
        app(BookingCodeInjectionService::class)->removeBookingCta($project);

        return redirect()->back()->with('success', 'Booking CTA removed from website code.');
    }

    public function rotateBookingToken(Project $project)
    {
        $newToken = Project::generateBookingToken();
        $project->update(['booking_public_token' => $newToken]);

        $injectionService = app(BookingCodeInjectionService::class);
        if ($injectionService->hasBookingCta($project)) {
            $injectionService->injectBookingCta($project);
        }

        return redirect()->back()->with('success', 'Booking portal key rotated successfully.');
    }
}
