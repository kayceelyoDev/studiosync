<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientBookingDashboardController extends Controller
{
    /**
     * Display centralized bookings hub for the client across all their projects.
     */
    public function index(Request $request): Response
    {
        $user = auth()->user();
        $isAdmin = method_exists($user, 'hasRole') && ($user->hasRole('admin') || $user->hasRole('super_admin'));

        // Fetch user's projects (or all projects if admin)
        $projectsQuery = $isAdmin ? Project::query() : $user->projects();
        $allProjects = (clone $projectsQuery)->get([
            'id',
            'project_name',
            'booking_enabled',
            'booking_public_token',
            'booking_notification_email',
        ]);

        $bookingProjects = $allProjects->where('booking_enabled', true);
        $bookingProjectIds = $bookingProjects->pluck('id')->all();
        $allProjectIds = $allProjects->pluck('id')->all();

        // Filters
        $projectId = $request->input('project_id');
        $status = $request->input('status', 'all');
        $search = $request->input('search');
        $date = $request->input('date');

        // Target project IDs for queries
        if (! empty($projectId) && in_array((int) $projectId, $allProjectIds, true)) {
            $targetProjectIds = [(int) $projectId];
        } else {
            $targetProjectIds = $allProjectIds;
        }

        // Metrics across target projects
        $baseMetricsQuery = Booking::whereIn('bookings.project_id', $targetProjectIds);

        $totalBookings = (clone $baseMetricsQuery)->count();
        $confirmedBookings = (clone $baseMetricsQuery)->where('status', 'confirmed')->count();
        $upcomingBookings = (clone $baseMetricsQuery)
            ->where('status', 'confirmed')
            ->whereDate('booking_date', '>=', now()->toDateString())
            ->count();
        $completedBookings = (clone $baseMetricsQuery)->where('status', 'completed')->count();
        $cancelledBookings = (clone $baseMetricsQuery)->where('status', 'cancelled')->count();

        // Estimated revenue from confirmed and completed bookings
        $estimatedRevenue = (float) (clone $baseMetricsQuery)
            ->whereIn('bookings.status', ['confirmed', 'completed'])
            ->join('booking_services', 'bookings.booking_service_id', '=', 'booking_services.id')
            ->sum('booking_services.price');

        // Bookings listing query
        $bookingsQuery = Booking::whereIn('bookings.project_id', $targetProjectIds)
            ->with([
                'project:id,project_name,booking_public_token',
                'bookingService:id,name,duration_minutes,price,currency',
            ]);

        if (! empty($status) && $status !== 'all') {
            $bookingsQuery->where('status', $status);
        }

        if (! empty($search)) {
            $bookingsQuery->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                    ->orWhere('customer_email', 'like', "%{$search}%")
                    ->orWhere('customer_phone', 'like', "%{$search}%");
            });
        }

        if (! empty($date)) {
            $bookingsQuery->whereDate('booking_date', $date);
        }

        $bookings = $bookingsQuery
            ->orderByDesc('booking_date')
            ->orderByDesc('booking_time')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Booking/Index', [
            'projects' => $allProjects,
            'bookingProjects' => $bookingProjects->values(),
            'bookings' => $bookings,
            'filters' => [
                'project_id' => $projectId ?: '',
                'status' => $status,
                'search' => $search ?: '',
                'date' => $date ?: '',
            ],
            'metrics' => [
                'total' => $totalBookings,
                'upcoming' => $upcomingBookings,
                'confirmed' => $confirmedBookings,
                'completed' => $completedBookings,
                'cancelled' => $cancelledBookings,
                'estimated_revenue' => $estimatedRevenue,
                'active_projects' => count($bookingProjects),
            ],
        ]);
    }

    /**
     * Update booking status from the centralized dashboard.
     */
    public function updateStatus(Request $request, Booking $booking): RedirectResponse
    {
        $user = auth()->user();
        $project = $booking->project;

        $isOwner = $project && $project->user_id === $user->id;
        $isAdmin = method_exists($user, 'hasRole') && ($user->hasRole('admin') || $user->hasRole('super_admin'));

        if (! $isOwner && ! $isAdmin) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:confirmed,completed,cancelled'],
            'cancellation_reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $booking->update($validated);

        return back()->with('success', 'Booking status updated successfully.');
    }
}
