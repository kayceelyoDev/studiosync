<?php

namespace App\Http\Controllers;

use App\Mail\NewBookingNotification;
use App\Models\Booking;
use App\Models\BookingService;
use App\Models\Project;
use App\Services\BookingAvailabilityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class PublicBookingController extends Controller
{
    /**
     * Show the public booking portal for an authorized project.
     */
    public function show(Request $request, string $token): Response
    {
        /** @var Project|null $project */
        $project = $request->attributes->get('booking_project');

        if (! $project) {
            abort(404, 'Booking portal not found or inactive.');
        }

        $services = $project->bookingServices()
            ->active()
            ->orderBy('name')
            ->get();

        return Inertia::render('Booking/Public/Index', [
            'project' => [
                'id' => $project->id,
                'project_name' => $project->project_name,
                'token' => $token,
                'booking_settings' => $project->booking_settings,
            ],
            'services' => $services,
        ]);
    }

    /**
     * Query real-time open slots for a specific service and date.
     */
    public function slots(Request $request, string $token, BookingAvailabilityService $availabilityService): JsonResponse
    {
        /** @var Project|null $project */
        $project = $request->attributes->get('booking_project');

        if (! $project) {
            abort(404, 'Booking portal not found or inactive.');
        }

        $validated = $request->validate([
            'service_id' => ['required', 'integer'],
            'date' => ['required', 'date_format:Y-m-d'],
        ]);

        $service = BookingService::where('id', $validated['service_id'])
            ->where('project_id', $project->id)
            ->where('is_active', true)
            ->firstOrFail();

        $slots = $availabilityService->getAvailableSlots($project, $service, $validated['date']);

        return response()->json([
            'slots' => $slots,
        ]);
    }

    /**
     * Reserve an appointment slot.
     */
    public function store(Request $request, string $token, BookingAvailabilityService $availabilityService): RedirectResponse|JsonResponse
    {
        /** @var Project|null $project */
        $project = $request->attributes->get('booking_project');

        if (! $project) {
            abort(404, 'Booking portal not found or inactive.');
        }

        $validated = $request->validate([
            'service_id' => ['required', 'integer'],
            'date' => ['required', 'date_format:Y-m-d'],
            'time' => ['required', 'string'],
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_email' => ['required', 'email', 'max:255'],
            'customer_phone' => ['nullable', 'string', 'max:50'],
            'customer_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $service = BookingService::where('id', $validated['service_id'])
            ->where('project_id', $project->id)
            ->where('is_active', true)
            ->firstOrFail();

        // Atomic lock key per project slot to prevent race condition double-bookings
        $normalizedTime = substr(trim($validated['time']), 0, 5);
        $lockKey = "booking_slot:{$project->id}:{$validated['date']}:{$normalizedTime}";
        $lock = Cache::lock($lockKey, 10);

        if (! $lock->get()) {
            return $this->slotUnavailableResponse($request);
        }

        try {
            $booking = DB::transaction(function () use ($project, $service, $validated, $availabilityService) {
                if (! $availabilityService->isSlotAvailable($project, $service, $validated['date'], $validated['time'])) {
                    return null;
                }

                return Booking::create([
                    'project_id' => $project->id,
                    'booking_service_id' => $service->id,
                    'customer_name' => $validated['customer_name'],
                    'customer_email' => $validated['customer_email'],
                    'customer_phone' => $validated['customer_phone'] ?? null,
                    'customer_notes' => $validated['customer_notes'] ?? null,
                    'booking_date' => $validated['date'],
                    'booking_time' => $validated['time'],
                    'status' => 'confirmed',
                ]);
            });

            if (! $booking) {
                return $this->slotUnavailableResponse($request);
            }
        } finally {
            $lock->release();
        }

        // Dispatch notification email to project's alert recipient
        $recipientEmail = $project->booking_notification_email ?: $project->user?->email;
        if (! empty($recipientEmail)) {
            try {
                Mail::to($recipientEmail)->queue(new NewBookingNotification($booking));
            } catch (\Throwable $e) {
                report($e);
            }
        }

        return redirect()->route('booking.public.confirmation', [
            'token' => $token,
            'uuid' => $booking->uuid,
        ]);
    }

    /**
     * Display the confirmation page for a confirmed reservation.
     */
    public function confirmation(Request $request, string $token, string $uuid): Response
    {
        /** @var Project|null $project */
        $project = $request->attributes->get('booking_project');

        if (! $project) {
            abort(404, 'Booking portal not found or inactive.');
        }

        $booking = Booking::where('uuid', $uuid)
            ->where('project_id', $project->id)
            ->with('bookingService')
            ->firstOrFail();

        return Inertia::render('Booking/Public/Confirmation', [
            'project' => [
                'id' => $project->id,
                'project_name' => $project->project_name,
                'token' => $token,
            ],
            'booking' => $booking,
        ]);
    }

    /**
     * Respond with a standardized 422 slot unavailable response.
     */
    protected function slotUnavailableResponse(Request $request): RedirectResponse|JsonResponse
    {
        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json([
                'message' => 'The selected time slot is no longer available.',
                'errors' => ['time' => ['The selected time slot is no longer available.']],
            ], 422);
        }

        return back()->withErrors(['time' => 'The selected time slot is no longer available.']);
    }
}
