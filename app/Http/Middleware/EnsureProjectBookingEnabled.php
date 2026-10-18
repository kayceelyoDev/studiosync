<?php

namespace App\Http\Middleware;

use App\Models\BookingAccessToken;
use App\Models\Project;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
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

        // 1. Check for dynamic session token first
        $accessToken = BookingAccessToken::with('project')
            ->where('token', $token)
            ->first();

        if ($accessToken) {
            $project = $accessToken->project;

            if (! $project || ! $project->booking_enabled) {
                abort(404, 'Booking portal not found or inactive.');
            }

            if (! $accessToken->isValid()) {
                if ($request->expectsJson() || $request->wantsJson()) {
                    return response()->json([
                        'message' => 'This booking session link has expired. Please launch a new booking session.',
                        'session_expired' => true,
                        'entry_url' => url("/book/entry/{$project->booking_public_token}"),
                    ], 410);
                }

                return Inertia::render('Booking/Public/Expired', [
                    'projectName' => $project->project_name,
                    'entryUrl' => url("/book/entry/{$project->booking_public_token}"),
                ])->toResponse($request)->setStatusCode(410);
            }

            // Valid dynamic session
            $accessToken->recordAccess();
            $request->attributes->set('booking_project', $project);
            $request->attributes->set('booking_access_token', $accessToken);

            return $next($request);
        }

        // 2. Fallback to static/master project token
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
