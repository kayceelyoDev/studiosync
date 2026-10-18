<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingService;
use App\Models\Project;
use Carbon\Carbon;
use Carbon\CarbonInterface;

class BookingAvailabilityService
{
    /**
     * Calculate open slots dynamically for a given service and date.
     *
     * @return array<int, string>
     */
    public function getAvailableSlots(Project $project, BookingService $service, CarbonInterface|string $date): array
    {
        $dateObj = is_string($date) ? Carbon::parse($date)->startOfDay() : $date->copy()->startOfDay();
        $today = Carbon::today();

        // No appointments in the past
        if ($dateObj->lt($today)) {
            return [];
        }

        $settings = $project->booking_settings ?? [];
        $operatingDays = array_map('intval', (array) ($settings['days'] ?? [1, 2, 3, 4, 5]));
        $startTimeStr = (string) ($settings['start_time'] ?? '09:00');
        $endTimeStr = (string) ($settings['end_time'] ?? '17:00');

        // Check operating days (ISO-8601 day of week: 1 for Monday, 7 for Sunday)
        if (! in_array($dateObj->dayOfWeekIso, $operatingDays, true)) {
            return [];
        }

        $duration = max(15, (int) ($service->duration_minutes ?: 30));
        $dateStr = $dateObj->format('Y-m-d');

        $slotCursor = $this->parseDateTime($dateStr, $startTimeStr);
        $operatingEnd = $this->parseDateTime($dateStr, $endTimeStr);

        if (! $slotCursor || ! $operatingEnd || $slotCursor->gte($operatingEnd)) {
            return [];
        }

        // Fetch existing bookings for this project on this date (excluding cancelled)
        $existingBookings = Booking::with('bookingService')
            ->where('project_id', $project->id)
            ->whereDate('booking_date', $dateStr)
            ->where('status', '!=', 'cancelled')
            ->get();

        $occupiedRanges = $existingBookings->map(function (Booking $booking) use ($dateStr) {
            $bookingTimeStr = (string) $booking->booking_time;
            $start = $this->parseDateTime($dateStr, $bookingTimeStr);
            $bookingDuration = $booking->bookingService?->duration_minutes ?: 30;
            $end = $start->copy()->addMinutes($bookingDuration);

            return [
                'start' => $start,
                'end' => $end,
            ];
        });

        $now = Carbon::now();
        $availableSlots = [];

        while ($slotCursor->copy()->addMinutes($duration)->lte($operatingEnd)) {
            $slotEnd = $slotCursor->copy()->addMinutes($duration);

            // If the date is today, omit past times (plus small 15m buffer)
            if ($dateObj->isToday() && $slotCursor->lte($now->copy()->addMinutes(15))) {
                $slotCursor->addMinutes($duration);

                continue;
            }

            // Check overlap with any active booking
            $hasConflict = false;
            foreach ($occupiedRanges as $range) {
                // Overlap exists if max(start1, start2) < min(end1, end2)
                $overlapStart = $slotCursor->max($range['start']);
                $overlapEnd = $slotEnd->min($range['end']);

                if ($overlapStart->lt($overlapEnd)) {
                    $hasConflict = true;
                    break;
                }
            }

            if (! $hasConflict) {
                $availableSlots[] = $slotCursor->format('H:i');
            }

            $slotCursor->addMinutes($duration);
        }

        return $availableSlots;
    }

    /**
     * Check if a specific time slot is available.
     */
    public function isSlotAvailable(Project $project, BookingService $service, CarbonInterface|string $date, string $time): bool
    {
        $slots = $this->getAvailableSlots($project, $service, $date);
        $normalizedTime = $this->normalizeTime($time);

        return in_array($normalizedTime, $slots, true);
    }

    /**
     * Robustly parse a date and time string into a Carbon instance.
     */
    protected function parseDateTime(string $dateStr, string $timeStr): Carbon
    {
        $normalizedTime = $this->normalizeTime($timeStr);

        return Carbon::parse("{$dateStr} {$normalizedTime}");
    }

    /**
     * Normalize time strings into strict H:i format (e.g. "9:00" -> "09:00", "09:00:00" -> "09:00").
     */
    protected function normalizeTime(string $timeStr): string
    {
        $trimmed = trim($timeStr);
        if (preg_match('/^(\d{1,2}):(\d{2})/', $trimmed, $matches)) {
            $hour = str_pad($matches[1], 2, '0', STR_PAD_LEFT);
            $minute = $matches[2];

            return "{$hour}:{$minute}";
        }

        return substr($trimmed, 0, 5);
    }
}
