<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\BookingAccessToken;
use App\Models\Project;
use App\Services\BookingCodeInjectionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectBookingController extends Controller
{
    /**
     * Check if current user has permission to manage project bookings.
     */
    protected function authorizeAccess(Project $project): void
    {
        $user = auth()->user();
        $isOwner = $project->user_id === $user->id;
        $isAdmin = method_exists($user, 'hasRole') && $user->hasRole(['super_admin', 'admin']);

        if ((! $isOwner && ! $isAdmin) || ! $project->booking_enabled) {
            abort(403);
        }
    }

    /**
     * Display the booking management dashboard for a project owner.
     */
    public function index(Project $project): Response
    {
        $this->authorizeAccess($project);

        $services = $project->bookingServices()
            ->orderBy('is_active', 'desc')
            ->orderBy('name')
            ->get();

        $bookings = $project->bookings()
            ->with('bookingService')
            ->orderByDesc('booking_date')
            ->orderByDesc('booking_time')
            ->paginate(20);

        $injectionService = app(BookingCodeInjectionService::class);
        $hasBookingCta = $injectionService->hasBookingCta($project);
        $embedSnippet = $injectionService->getEmbedSnippet($project);

        $recentTokens = $project->accessTokens()
            ->latest()
            ->limit(10)
            ->get();

        return Inertia::render('Booking/Management/Index', [
            'project' => $project,
            'services' => $services,
            'bookings' => $bookings,
            'hasBookingCta' => $hasBookingCta,
            'embedSnippet' => $embedSnippet,
            'recentTokens' => $recentTokens,
        ]);
    }

    /**
     * Update status of a booking (e.g., mark completed or cancelled).
     */
    public function updateBookingStatus(Request $request, Project $project, Booking $booking): RedirectResponse
    {
        $this->authorizeAccess($project);

        if ($booking->project_id !== $project->id) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:confirmed,completed,cancelled'],
            'cancellation_reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $booking->update($validated);

        return back()->with('success', 'Booking appointment updated successfully.');
    }

    /**
     * Inject booking CTA button into project's website HTML content.
     */
    public function injectBookingCta(Project $project): RedirectResponse
    {
        $this->authorizeAccess($project);

        $injected = app(BookingCodeInjectionService::class)->injectBookingCta($project);

        if ($injected) {
            return back()->with('success', 'Booking CTA button successfully injected into website code.');
        }

        return back()->with('error', 'Project does not contain HTML content to inject.');
    }

    /**
     * Remove booking CTA button from project's website HTML content.
     */
    public function removeBookingCta(Project $project): RedirectResponse
    {
        $this->authorizeAccess($project);

        app(BookingCodeInjectionService::class)->removeBookingCta($project);

        return back()->with('success', 'Booking CTA removed from website code.');
    }

    /**
     * Rotate project's dedicated booking key.
     */
    public function rotateBookingToken(Project $project): RedirectResponse
    {
        $this->authorizeAccess($project);

        $newToken = Project::generateBookingToken();
        $project->update(['booking_public_token' => $newToken]);

        $injectionService = app(BookingCodeInjectionService::class);
        if ($injectionService->hasBookingCta($project)) {
            $injectionService->injectBookingCta($project);
        }

        return back()->with('success', 'Booking portal key rotated successfully.');
    }

    /**
     * Generate a dedicated time-limited booking link for guests.
     */
    public function generateShareableLink(Request $request, Project $project): RedirectResponse
    {
        $this->authorizeAccess($project);

        $validated = $request->validate([
            'duration_hours' => ['required', 'integer', 'in:1,24,72,168'],
        ]);

        $token = BookingAccessToken::createForProject(
            $project,
            now()->addHours((int) $validated['duration_hours']),
            $request->ip(),
            $request->userAgent()
        );

        $shareableUrl = url("/book/{$token->token}");

        return back()->with('shareable_link', $shareableUrl)
            ->with('success', 'Secure expiring booking link generated successfully.');
    }
}
