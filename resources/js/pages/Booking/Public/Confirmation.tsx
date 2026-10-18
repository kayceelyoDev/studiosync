import React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    CheckCircle2,
    Calendar,
    Clock,
    User,
    Mail,
    Phone,
    FileText,
    ArrowLeft,
    Sparkles,
    ShieldCheck
} from 'lucide-react';

interface ConfirmationProps {
    project: {
        id: number;
        project_name: string;
        token: string;
    };
    booking: {
        id: number;
        uuid: string;
        customer_name: string;
        customer_email: string;
        customer_phone?: string | null;
        customer_notes?: string | null;
        booking_date: string;
        booking_time: string;
        status: string;
        booking_service?: {
            name: string;
            duration_minutes: number;
            price: number | string;
        } | null;
    };
}

export default function BookingConfirmation({ project, booking }: ConfirmationProps) {
    const timeFormatted = booking.booking_time ? booking.booking_time.slice(0, 5) : '';

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
            <Head title={`Booking Confirmed - ${project.project_name}`} />

            {/* Top Brand Banner */}
            <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                                {project.project_name}
                            </h1>
                            <p className="text-xs text-neutral-400">Appointment Confirmation</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Confirmed</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-xl w-full mx-auto px-4 py-12 flex flex-col items-center justify-center">
                <div className="w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                    {/* Success Icon */}
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">
                            Booking Confirmed!
                        </h2>
                        <p className="text-sm text-neutral-400 mt-1">
                            Your appointment has been successfully scheduled.
                        </p>
                    </div>

                    {/* Reference UUID */}
                    <div className="mt-6 p-3 bg-neutral-950 border border-neutral-800/80 rounded-xl text-center">
                        <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold block">
                            Appointment Reference
                        </span>
                        <code className="text-xs font-mono text-blue-400 font-bold select-all">
                            {booking.uuid}
                        </code>
                    </div>

                    {/* Details Card */}
                    <div className="mt-6 space-y-3.5 text-sm border-t border-b border-neutral-800 py-5">
                        <div className="flex items-center justify-between">
                            <span className="text-neutral-400">Service:</span>
                            <span className="font-semibold text-white">
                                {booking.booking_service?.name || 'General Service'}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-neutral-400">Date:</span>
                            <div className="flex items-center gap-1.5 font-medium text-neutral-200">
                                <Calendar className="w-4 h-4 text-neutral-500" />
                                <span>{booking.booking_date}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-neutral-400">Time:</span>
                            <div className="flex items-center gap-1.5 font-semibold text-blue-400">
                                <Clock className="w-4 h-4 text-blue-400" />
                                <span>{timeFormatted}</span>
                            </div>
                        </div>

                        {booking.booking_service?.duration_minutes && (
                            <div className="flex items-center justify-between">
                                <span className="text-neutral-400">Duration:</span>
                                <span className="text-neutral-300">
                                    {booking.booking_service.duration_minutes} minutes
                                </span>
                            </div>
                        )}

                        {booking.booking_service?.price && (
                            <div className="flex items-center justify-between">
                                <span className="text-neutral-400">Price:</span>
                                <span className="font-bold text-emerald-400">
                                    ${Number(booking.booking_service.price).toFixed(2)}
                                </span>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60">
                            <span className="text-neutral-400">Client Name:</span>
                            <span className="text-neutral-200">{booking.customer_name}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-neutral-400">Email:</span>
                            <span className="text-neutral-200">{booking.customer_email}</span>
                        </div>

                        {booking.customer_phone && (
                            <div className="flex items-center justify-between">
                                <span className="text-neutral-400">Phone:</span>
                                <span className="text-neutral-200">{booking.customer_phone}</span>
                            </div>
                        )}
                    </div>

                    {/* Book Another Link */}
                    <div className="mt-6 text-center">
                        <Link
                            href={`/book/${project.token}`}
                            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Book Another Appointment</span>
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-neutral-900 py-6 text-center text-xs text-neutral-600">
                <p>Powered by the Booking System • Secure slot reservations</p>
            </footer>
        </div>
    );
}
