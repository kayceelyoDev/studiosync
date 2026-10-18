<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectBookingController extends Controller
{
    /**
     * Display the booking management dashboard for a project owner.
     */
    public function index(Project $project): Response
    {
        if ($project->user_id !== auth()->id() || ! $project->booking_enabled) {
            abort(403);
        }

        $services = $project->bookingServices()
            ->orderBy('is_active', 'desc')
            ->orderBy('name')
            ->get();

        $bookings = $project->bookings()
            ->with('bookingService')
            ->orderByDesc('booking_date')
            ->orderByDesc('booking_time')
            ->paginate(20);

        return Inertia::render('Booking/Management/Index', [
            'project' => $project,
            'services' => $services,
            'bookings' => $bookings,
        ]);
    }

    /**
     * Update status of a booking (e.g., mark completed or cancelled).
     */
    public function updateBookingStatus(Request $request, Project $project, Booking $booking): RedirectResponse
    {
        if ($project->user_id !== auth()->id() || ! $project->booking_enabled || $booking->project_id !== $project->id) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:confirmed,completed,cancelled'],
            'cancellation_reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $booking->update($validated);

        return back()->with('success', 'Booking appointment updated successfully.');
    }
}
