<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ProjectBookingSettingsController extends Controller
{
    /**
     * Update booking operating settings for a project.
     */
    public function update(Request $request, Project $project): RedirectResponse
    {
        if ($project->user_id !== auth()->id() || ! $project->booking_enabled) {
            abort(403);
        }

        $validated = $request->validate([
            'booking_notification_email' => ['required', 'email', 'max:255'],
            'booking_settings' => ['required', 'array'],
            'booking_settings.start_time' => ['required', 'string'],
            'booking_settings.end_time' => ['required', 'string'],
            'booking_settings.days' => ['required', 'array'],
        ]);

        $project->update($validated);

        return back()->with('success', 'Booking settings updated successfully.');
    }
}
