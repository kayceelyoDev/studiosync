<x-mail::message>
# New Appointment Scheduled!

A new booking has been confirmed for **{{ $booking->project?->project_name }}**.

<x-mail::panel>
**Service:** {{ $booking->bookingService?->name ?? 'General Appointment' }}  
**Price:** ${{ number_format((float) ($booking->bookingService?->price ?? 0), 2) }}  
**Date:** {{ $booking->booking_date->format('Y-m-d') }}  
**Time:** {{ substr((string) $booking->booking_time, 0, 5) }} ({{ $booking->bookingService?->duration_minutes ?? 30 }} mins)  
**Reference:** `{{ $booking->uuid }}`  
</x-mail::panel>

### Guest Information
- **Name:** {{ $booking->customer_name }}
- **Email:** {{ $booking->customer_email }}
@if($booking->customer_phone)
- **Phone:** {{ $booking->customer_phone }}
@endif
@if($booking->customer_notes)
- **Notes:** {{ $booking->customer_notes }}
@endif

<x-mail::button :url="route('projects.booking.index', $booking->project_id)">
View Appointments in Dashboard
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
