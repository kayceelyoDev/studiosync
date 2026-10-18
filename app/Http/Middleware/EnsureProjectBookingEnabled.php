<?php

namespace App\Http\Middleware;

use App\Models\Project;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureProjectBookingEnabled
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->route('token');

        if (empty($token) || ! is_string($token)) {
            abort(404, 'Booking portal not found or inactive.');
        }

        $project = Project::where('booking_public_token', $token)
            ->whereNotNull('booking_public_token')
            ->where('booking_enabled', true)
            ->first();

        if (! $project) {
            abort(404, 'Booking portal not found or inactive.');
        }

        $request->attributes->set('booking_project', $project);

        return $next($request);
    }
}
