<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ProjectBookingSettingsController extends Controller
{
    protected function authorizeAccess(Project $project): void
    {
        $user = auth()->user();
        $isOwner = $project->user_id === $user->id;
        $isAdmin = method_exists($user, 'hasRole') && ($user->hasRole('admin') || $user->hasRole('super_admin'));

        if ((! $isOwner && ! $isAdmin) || ! $project->booking_enabled) {
            abort(403);
        }
    }

    /**
     * Update booking operating settings for a project.
     */
    public function update(Request $request, Project $project): RedirectResponse
    {
        $this->authorizeAccess($project);

        $validated = $request->validate([
            'booking_notification_email' => ['required', 'email', 'max:255'],
            'booking_settings' => ['required', 'array'],
            'booking_settings.start_time' => ['required', 'string'],
            'booking_settings.end_time' => ['required', 'string'],
            'booking_settings.days' => ['present', 'array'],
            'booking_settings.days.*' => ['integer', 'min:1', 'max:7'],
        ]);

        $project->update($validated);

        return back()->with('success', 'Booking settings updated successfully.');
    }
}
