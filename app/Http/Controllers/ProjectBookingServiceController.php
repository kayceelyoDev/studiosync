<?php

namespace App\Http\Controllers;

use App\Models\BookingService;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ProjectBookingServiceController extends Controller
{
    /**
     * Store a newly created service for a project.
     */
    public function store(Request $request, Project $project): RedirectResponse
    {
        if ($project->user_id !== auth()->id() || ! $project->booking_enabled) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'duration_minutes' => ['required', 'integer', 'min:5', 'max:480'],
            'price' => ['required', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $project->bookingServices()->create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'duration_minutes' => $validated['duration_minutes'],
            'price' => $validated['price'],
            'currency' => $validated['currency'] ?? 'USD',
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return back()->with('success', 'Service added successfully.');
    }

    /**
     * Update an existing service for a project.
     */
    public function update(Request $request, Project $project, BookingService $service): RedirectResponse
    {
        if ($project->user_id !== auth()->id() || ! $project->booking_enabled || $service->project_id !== $project->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'duration_minutes' => ['required', 'integer', 'min:5', 'max:480'],
            'price' => ['required', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $service->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'duration_minutes' => $validated['duration_minutes'],
            'price' => $validated['price'],
            'currency' => $validated['currency'] ?? $service->currency,
            'is_active' => $validated['is_active'] ?? $service->is_active,
        ]);

        return back()->with('success', 'Service updated successfully.');
    }

    /**
     * Delete a service from a project.
     */
    public function destroy(Project $project, BookingService $service): RedirectResponse
    {
        if ($project->user_id !== auth()->id() || ! $project->booking_enabled || $service->project_id !== $project->id) {
            abort(403);
        }

        $service->delete();

        return back()->with('success', 'Service deleted successfully.');
    }
}
