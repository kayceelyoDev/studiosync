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
    ShieldCheck,
    Sun,
    Moon
} from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';

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
    const { appearance, updateAppearance } = useAppearance();

    const toggleTheme = () => {
        if (appearance === 'dark') {
            updateAppearance('light');
        } else {
            updateAppearance('dark');
        }
    };

    const timeFormatted = booking.booking_time ? booking.booking_time.slice(0, 5) : '';

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/20 selection:text-foreground">
            <Head title={`Booking Confirmed - ${project.project_name}`} />

            {/* Top Brand Banner */}
            <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30">
                <div className="max-w-3xl mx-auto px-4 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                                {project.project_name}
                            </h1>
                            <p className="text-xs text-muted-foreground">Appointment Confirmation</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Confirmed</span>
                        </div>

                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors"
                            aria-label="Toggle theme"
                        >
                            {appearance === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-xl w-full mx-auto px-4 py-12 flex flex-col items-center justify-center">
                <div className="w-full bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm animate-in zoom-in-95 duration-200">
                    {/* Success Icon */}
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground tracking-tight">
                            Booking Confirmed!
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Your appointment has been successfully scheduled.
                        </p>
                    </div>

                    {/* Reference UUID */}
                    <div className="mt-6 p-3 bg-muted/50 border border-border rounded-xl text-center">
                        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block">
                            Appointment Reference
                        </span>
                        <code className="text-xs font-mono text-foreground font-bold select-all">
                            {booking.uuid}
                        </code>
                    </div>

                    {/* Details Card */}
                    <div className="mt-6 space-y-3.5 text-sm border-t border-b border-border py-5">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Service:</span>
                            <span className="font-semibold text-foreground">
                                {booking.booking_service?.name || 'General Service'}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Date:</span>
                            <div className="flex items-center gap-1.5 font-medium text-foreground">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span>{booking.booking_date}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Time:</span>
                            <div className="flex items-center gap-1.5 font-semibold text-primary">
                                <Clock className="w-4 h-4" />
                                <span>{timeFormatted}</span>
                            </div>
                        </div>

                        {booking.booking_service?.duration_minutes && (
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Duration:</span>
                                <span className="text-foreground">
                                    {booking.booking_service.duration_minutes} minutes
                                </span>
                            </div>
                        )}

                        {booking.booking_service?.price && (
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Price:</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                    ${Number(booking.booking_service.price).toFixed(2)}
                                </span>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-border">
                            <span className="text-muted-foreground">Client Name:</span>
                            <span className="text-foreground">{booking.customer_name}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Email:</span>
                            <span className="text-foreground">{booking.customer_email}</span>
                        </div>

                        {booking.customer_phone && (
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Phone:</span>
                                <span className="text-foreground">{booking.customer_phone}</span>
                            </div>
                        )}
                    </div>

                    {/* Book Another Link */}
                    <div className="mt-6 text-center">
                        <Link
                            href={`/book/${project.token}`}
                            className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Book Another Appointment</span>
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
                <p>Powered by StudioSync • Secure slot reservations</p>
            </footer>
        </div>
    );
}
