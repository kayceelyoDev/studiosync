import React, { useState, useEffect, FormEvent } from 'react';
import { Head, useForm } from '@inertiajs/react';
import {
    Calendar,
    Clock,
    DollarSign,
    CheckCircle2,
    User,
    Mail,
    Phone,
    FileText,
    ArrowRight,
    ArrowLeft,
    ShieldCheck,
    AlertCircle,
    Sparkles,
    Sun,
    Moon
} from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';

interface BookingService {
    id: number;
    name: string;
    description?: string | null;
    duration_minutes: number;
    price: number | string;
    currency: string;
    is_active: boolean;
}

interface PublicBookingProps {
    project: {
        id: number;
        project_name: string;
        token: string;
        booking_settings?: {
            start_time?: string;
            end_time?: string;
            days?: number[];
        } | null;
    };
    services: BookingService[];
}

export default function PublicBookingIndex({ project, services }: PublicBookingProps) {
    const { appearance, updateAppearance } = useAppearance();

    const toggleTheme = () => {
        if (appearance === 'dark') {
            updateAppearance('light');
        } else {
            updateAppearance('dark');
        }
    };

    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [selectedService, setSelectedService] = useState<BookingService | null>(
        services.length > 0 ? services[0] : null
    );

    // Local date string (YYYY-MM-DD) avoiding UTC timezone shifts
    const getTodayLocalDate = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const todayStr = getTodayLocalDate();
    const [selectedDate, setSelectedDate] = useState<string>(todayStr);

    const [slots, setSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
    const [slotsError, setSlotsError] = useState<string | null>(null);

    // Reservation Form
    const { data, setData, post, processing, errors } = useForm({
        service_id: selectedService ? selectedService.id : 0,
        date: todayStr,
        time: '',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        customer_notes: '',
    });

    // Fetch availability slots whenever service or date changes
    useEffect(() => {
        if (!selectedService || !selectedDate) {
            setSlots([]);
            return;
        }

        let isMounted = true;
        setLoadingSlots(true);
        setSlotsError(null);

        fetch(`/book/${project.token}/slots?service_id=${selectedService.id}&date=${selectedDate}`)
            .then(async (res) => {
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.message || 'Failed to fetch available time slots');
                }
                return res.json();
            })
            .then((resData) => {
                if (isMounted) {
                    setSlots(resData.slots || []);
                    setLoadingSlots(false);
                }
            })
            .catch((err) => {
                if (isMounted) {
                    setSlots([]);
                    setSlotsError(err.message || 'Error fetching availability');
                    setLoadingSlots(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [selectedService, selectedDate, project.token]);

    const handleServiceSelect = (service: BookingService) => {
        setSelectedService(service);
        setData('service_id', service.id);
        setData('time', '');
    };

    const handleDateChange = (date: string) => {
        setSelectedDate(date);
        setData('date', date);
        setData('time', '');
    };

    const handleTimeSelect = (timeStr: string) => {
        setData('time', timeStr);
    };

    const handleReserve = (e: FormEvent) => {
        e.preventDefault();
        post(`/book/${project.token}/reserve`);
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/20 selection:text-foreground">
            <Head title={`Book an Appointment - ${project.project_name}`} />

            {/* Top Brand Banner */}
            <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                                {project.project_name}
                            </h1>
                            <p className="text-xs text-muted-foreground">Online Appointment Reservation</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verified Portal</span>
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

            {/* Main Booking Container */}
            <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12">
                {/* Step Indicators */}
                <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center gap-2 sm:gap-3 text-xs font-semibold">
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full transition-all ${
                                step === 1
                                    ? 'bg-primary text-primary-foreground shadow-xs'
                                    : 'bg-muted text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <span className="w-4 h-4 rounded-full bg-background/20 flex items-center justify-center text-[10px]">
                                1
                            </span>
                            <span>Service</span>
                        </button>
                        <div className="w-6 sm:w-10 h-0.5 bg-border" />
                        <button
                            type="button"
                            onClick={() => selectedService && setStep(2)}
                            disabled={!selectedService}
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full transition-all ${
                                step === 2
                                    ? 'bg-primary text-primary-foreground shadow-xs'
                                    : 'bg-muted text-muted-foreground disabled:opacity-40 hover:text-foreground'
                            }`}
                        >
                            <span className="w-4 h-4 rounded-full bg-background/20 flex items-center justify-center text-[10px]">
                                2
                            </span>
                            <span>Date & Time</span>
                        </button>
                        <div className="w-6 sm:w-10 h-0.5 bg-border" />
                        <button
                            type="button"
                            onClick={() => selectedService && data.time && setStep(3)}
                            disabled={!selectedService || !data.time}
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full transition-all ${
                                step === 3
                                    ? 'bg-primary text-primary-foreground shadow-xs'
                                    : 'bg-muted text-muted-foreground disabled:opacity-40 hover:text-foreground'
                            }`}
                        >
                            <span className="w-4 h-4 rounded-full bg-background/20 flex items-center justify-center text-[10px]">
                                3
                            </span>
                            <span>Your Details</span>
                        </button>
                    </div>
                </div>

                {/* STEP 1: SELECT SERVICE */}
                {step === 1 && (
                    <div className="animate-in fade-in space-y-6">
                        <div className="text-center max-w-lg mx-auto">
                            <h2 className="text-2xl font-bold tracking-tight text-foreground">Select a Service</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Choose from available appointments offered by {project.project_name}
                            </p>
                        </div>

                        {services.length === 0 ? (
                            <div className="p-8 sm:p-10 text-center bg-card border border-border rounded-2xl shadow-xs space-y-3">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mx-auto">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <h3 className="text-base font-semibold text-foreground">No Services Available</h3>
                                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                    No services are currently listed for booking on this project. Please check back later or contact the owner.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                {services.map((service) => {
                                    const isChosen = selectedService?.id === service.id;
                                    return (
                                        <div
                                            key={service.id}
                                            onClick={() => handleServiceSelect(service)}
                                            className={`cursor-pointer p-5 rounded-xl border transition-all text-left flex flex-col justify-between ${
                                                isChosen
                                                    ? 'border-primary ring-2 ring-primary/20 bg-primary/[0.03] dark:bg-primary/[0.08] shadow-sm'
                                                    : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30 shadow-xs'
                                            }`}
                                        >
                                            <div>
                                                <div className="flex items-start justify-between gap-3">
                                                    <h3 className="text-base font-semibold text-foreground">
                                                        {service.name}
                                                    </h3>
                                                    <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                                        ${Number(service.price).toFixed(2)}
                                                    </div>
                                                </div>
                                                {service.description && (
                                                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                                                        {service.description}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>{service.duration_minutes} minutes</span>
                                                </div>
                                                <span
                                                    className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${
                                                        isChosen
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'bg-muted text-muted-foreground'
                                                    }`}
                                                >
                                                    {isChosen ? 'Selected' : 'Select'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="flex justify-end pt-4">
                            <button
                                type="button"
                                disabled={!selectedService}
                                onClick={() => setStep(2)}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold shadow-sm disabled:opacity-50 transition-all"
                            >
                                <span>Continue to Date & Time</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: SELECT DATE & TIME */}
                {step === 2 && selectedService && (
                    <div className="animate-in fade-in space-y-6">
                        <div className="text-center max-w-lg mx-auto">
                            <h2 className="text-2xl font-bold tracking-tight text-foreground">Pick Date & Time</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Schedulable for {selectedService.name} ({selectedService.duration_minutes} min)
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
                            {/* Date Picker Section */}
                            <div className="md:col-span-5 bg-card border border-border rounded-xl p-6 shadow-xs">
                                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                    Appointment Date
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        min={todayStr}
                                        value={selectedDate}
                                        onChange={(e) => handleDateChange(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>
                                <div className="mt-4 text-xs text-muted-foreground space-y-1.5 leading-relaxed">
                                    <p>• Only open operating hours are selectable.</p>
                                    <p>• Appointments book in {selectedService.duration_minutes}-minute increments.</p>
                                </div>
                            </div>

                            {/* Time Slots Section */}
                            <div className="md:col-span-7 bg-card border border-border rounded-xl p-6 shadow-xs flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Available Slots
                                        </label>
                                        {selectedDate && (
                                            <span className="text-xs font-medium text-foreground bg-muted px-2.5 py-1 rounded-md">
                                                {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </span>
                                        )}
                                    </div>

                                    {loadingSlots ? (
                                        <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                                            <span className="text-xs">Checking real-time calendar availability...</span>
                                        </div>
                                    ) : slotsError ? (
                                        <div className="py-8 text-center text-destructive text-xs">
                                            {slotsError}
                                        </div>
                                    ) : slots.length === 0 ? (
                                        <div className="py-12 text-center text-muted-foreground space-y-2">
                                            <Clock className="w-8 h-8 text-muted-foreground/60 mx-auto" />
                                            <p className="text-sm font-medium text-foreground">
                                                No time slots available for this date.
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Please select another day on the calendar.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto pr-1">
                                            {slots.map((slot) => {
                                                const isPicked = data.time === slot;
                                                return (
                                                    <button
                                                        type="button"
                                                        key={slot}
                                                        onClick={() => handleTimeSelect(slot)}
                                                        className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                                                            isPicked
                                                                ? 'bg-primary border-primary text-primary-foreground shadow-xs'
                                                                : 'bg-background border-border text-foreground hover:border-primary/40 hover:bg-accent'
                                                        }`}
                                                    >
                                                        {slot}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {data.time && (
                                    <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-center justify-between text-xs text-foreground">
                                        <span className="text-muted-foreground">Selected Slot:</span>
                                        <span className="font-bold">
                                            {data.date} at {data.time}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between pt-4">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Change Service</span>
                            </button>
                            <button
                                type="button"
                                disabled={!data.time}
                                onClick={() => setStep(3)}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold shadow-sm disabled:opacity-50 transition-all"
                            >
                                <span>Provide Guest Details</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: GUEST DETAILS & CONFIRM */}
                {step === 3 && selectedService && (
                    <form onSubmit={handleReserve} className="animate-in fade-in space-y-6">
                        <div className="text-center max-w-lg mx-auto">
                            <h2 className="text-2xl font-bold tracking-tight text-foreground">Your Contact Details</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Complete your reservation for {selectedService.name}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
                            {/* Form Inputs */}
                            <div className="md:col-span-7 bg-card border border-border rounded-xl p-6 shadow-xs space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                                        Full Name *
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            required
                                            value={data.customer_name}
                                            onChange={(e) => setData('customer_name', e.target.value)}
                                            placeholder="Jane Doe"
                                            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                        />
                                    </div>
                                    {errors.customer_name && (
                                        <p className="text-xs text-destructive mt-1">{errors.customer_name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                                        Email Address *
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                                        <input
                                            type="email"
                                            required
                                            value={data.customer_email}
                                            onChange={(e) => setData('customer_email', e.target.value)}
                                            placeholder="jane@example.com"
                                            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                        />
                                    </div>
                                    {errors.customer_email && (
                                        <p className="text-xs text-destructive mt-1">{errors.customer_email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                                        Phone Number (Optional)
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                                        <input
                                            type="tel"
                                            value={data.customer_phone}
                                            onChange={(e) => setData('customer_phone', e.target.value)}
                                            placeholder="+1 (555) 000-0000"
                                            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                        />
                                    </div>
                                    {errors.customer_phone && (
                                        <p className="text-xs text-destructive mt-1">{errors.customer_phone}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                                        Notes or Requests (Optional)
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={data.customer_notes}
                                        onChange={(e) => setData('customer_notes', e.target.value)}
                                        placeholder="Any special accommodations..."
                                        className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                    {errors.customer_notes && (
                                        <p className="text-xs text-destructive mt-1">{errors.customer_notes}</p>
                                    )}
                                </div>
                            </div>

                            {/* Reservation Summary Card */}
                            <div className="md:col-span-5 bg-card border border-border rounded-xl p-6 shadow-xs flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                                        Booking Summary
                                    </h3>

                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between items-center pb-2 border-b border-border">
                                            <span className="text-muted-foreground">Service:</span>
                                            <span className="font-semibold text-foreground">{selectedService.name}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-2 border-b border-border">
                                            <span className="text-muted-foreground">Duration:</span>
                                            <span className="font-medium text-foreground">
                                                {selectedService.duration_minutes} mins
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center pb-2 border-b border-border">
                                            <span className="text-muted-foreground">Date:</span>
                                            <span className="font-medium text-foreground">{data.date}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-2 border-b border-border">
                                            <span className="text-muted-foreground">Time:</span>
                                            <span className="font-semibold text-primary">{data.time}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2">
                                            <span className="text-base font-semibold text-foreground">Total:</span>
                                            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                                ${Number(selectedService.price).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {errors.time && (
                                    <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive">
                                        {errors.time}
                                    </div>
                                )}

                                <div className="mt-6 pt-4 border-t border-border">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-sm disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>{processing ? 'Confirming...' : 'Confirm Appointment'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-start pt-2">
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Change Time Slot</span>
                            </button>
                        </div>
                    </form>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
                <p>Powered by StudioSync • Secure slot reservations</p>
            </footer>
        </div>
    );
}
