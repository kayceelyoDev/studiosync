<?php

namespace App\Http\Controllers;

use App\Models\ClientRequest;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class BookingRequestController extends Controller
{
    /**
     * Submit a new booking system intake request for a project.
     */
    public function store(Request $request, Project $project): RedirectResponse
    {
        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        if ($project->booking_enabled) {
            return back()->withErrors(['message' => 'Booking system is already enabled for this project.']);
        }

        if ($project->clientRequests()->where('category', 'booking_system')->where('status', 'pending')->exists()) {
            return back()->withErrors(['message' => 'A booking system request is already pending review for this project.']);
        }

        $validated = $request->validate([
            'notification_email' => ['required', 'email', 'max:255'],
            'operating_hours' => ['nullable', 'array'],
            'operating_hours.start_time' => ['nullable', 'string'],
            'operating_hours.end_time' => ['nullable', 'string'],
            'operating_hours.days' => ['nullable', 'array'],
            'services' => ['required', 'array', 'min:1'],
            'services.*.name' => ['required', 'string', 'max:255'],
            'services.*.description' => ['nullable', 'string', 'max:1000'],
            'services.*.duration_minutes' => ['required', 'integer', 'min:5', 'max:480'],
            'services.*.price' => ['required', 'numeric', 'min:0'],
            'services.*.currency' => ['nullable', 'string', 'size:3'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        ClientRequest::create([
            'user_id' => auth()->id(),
            'project_id' => $project->id,
            'category' => 'booking_system',
            'title' => 'Booking System Request for '.$project->project_name,
            'description' => json_encode($validated),
            'status' => 'pending',
        ]);

        return back()->with('success', 'Booking system request submitted successfully.');
    }
}
