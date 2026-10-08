<?php

namespace App\Mail;

use App\Models\ContactEmailer;
use App\Models\ContactMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class GuestContactedClient extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly ContactMessage $contactMessage,
        public readonly ContactEmailer $emailer,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            to: $this->emailer->recipient_email,
            replyTo: [
                new Address(
                    address: $this->contactMessage->guest_email,
                    name: $this->contactMessage->guest_name,
                ),
            ],
            subject: "New Contact: {$this->contactMessage->subject}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.guest-contacted-client',
        );
    }
}
