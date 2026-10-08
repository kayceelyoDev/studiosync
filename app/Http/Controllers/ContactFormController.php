<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContactMessageRequest;
use App\Mail\GuestContactedClient;
use App\Models\ContactEmailer;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;

class ContactFormController extends Controller
{
    /**
     * Accept a guest contact form submission via the public token endpoint.
     * Rate limited to 3 requests per 10 minutes per IP (configured in routes).
     */
    public function store(StoreContactMessageRequest $request, string $token): JsonResponse
    {
        $emailer = ContactEmailer::where('public_token', $token)
            ->where('is_active', true)
            ->firstOrFail();

        $contactMessage = ContactMessage::create([
            'contact_emailer_id' => $emailer->id,
            'guest_name' => $request->validated('name'),
            'guest_email' => $request->validated('email'),
            'subject' => $request->validated('subject'),
            'message' => $request->validated('message'),
            'ip_address' => $request->ip(),
        ]);

        Mail::queue(new GuestContactedClient($contactMessage, $emailer));

        return response()->json(['message' => 'Your message has been sent!']);
    }
}
