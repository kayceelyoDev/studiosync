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
    Sparkles
} from 'lucide-react';

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

    const { data, setData, post, processing, errors } = useForm({
        service_id: selectedService?.id || 0,
        date: selectedDate,
        time: '',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        customer_notes: '',
    });

    // Whenever selectedService or selectedDate changes, fetch open slots
    useEffect(() => {
        if (!selectedService || !selectedDate) return;

        setLoadingSlots(true);
        setSlotsError(null);

        fetch(`/book/${project.token}/slots?service_id=${selectedService.id}&date=${selectedDate}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Unable to retrieve available slots.');
                }
                return res.json();
            })
            .then((result) => {
                setSlots(result.slots || []);
                // If current selected time is not in returned slots, clear it
                if (data.time && (!result.slots || !result.slots.includes(data.time))) {
                    setData('time', '');
                }
            })
            .catch((err) => {
                setSlots([]);
                setSlotsError('Could not load slots. Please select another date.');
            })
            .finally(() => {
                setLoadingSlots(false);
            });
    }, [selectedService?.id, selectedDate]);

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
        <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
            <Head title={`Book an Appointment - ${project.project_name}`} />

            {/* Top Brand Banner */}
            <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                                {project.project_name}
                            </h1>
                            <p className="text-xs text-neutral-400">Online Appointment Reservation</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verified Portal</span>
                    </div>
                </div>
            </header>

            {/* Main Booking Container */}
            <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12">
                {/* Step Indicators */}
                <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center gap-2 sm:gap-4 text-xs font-semibold">
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
                                step === 1
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                            }`}
                        >
                            <span className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center text-[10px]">
                                1
                            </span>
                            <span>Service</span>
                        </button>
                        <div className="w-6 h-0.5 bg-neutral-800" />
                        <button
                            type="button"
                            onClick={() => selectedService && setStep(2)}
                            disabled={!selectedService}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
                                step === 2
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'bg-neutral-800 text-neutral-400 disabled:opacity-40'
                            }`}
                        >
                            <span className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center text-[10px]">
                                2
                            </span>
                            <span>Date & Time</span>
                        </button>
                        <div className="w-6 h-0.5 bg-neutral-800" />
                        <button
                            type="button"
                            onClick={() => selectedService && data.time && setStep(3)}
                            disabled={!selectedService || !data.time}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
                                step === 3
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'bg-neutral-800 text-neutral-400 disabled:opacity-40'
                            }`}
                        >
                            <span className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center text-[10px]">
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
                            <h2 className="text-2xl font-bold tracking-tight text-white">Select a Service</h2>
                            <p className="text-sm text-neutral-400 mt-1">
                                Choose from available appointments offered by {project.project_name}
                            </p>
                        </div>

                        {services.length === 0 ? (
                            <div className="p-8 text-center bg-neutral-900 border border-neutral-800 rounded-2xl">
                                <AlertCircle className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
                                <p className="text-sm text-neutral-400">
                                    No services are currently listed for booking. Please check back later.
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
                                            className={`cursor-pointer p-5 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                                                isChosen
                                                    ? 'bg-blue-950/30 border-blue-500 ring-2 ring-blue-500/20 shadow-xl'
                                                    : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                                            }`}
                                        >
                                            <div>
                                                <div className="flex items-start justify-between gap-3">
                                                    <h3 className="text-base font-semibold text-white">
                                                        {service.name}
                                                    </h3>
                                                    <div className="text-base font-bold text-emerald-400 whitespace-nowrap">
                                                        ${Number(service.price).toFixed(2)}
                                                    </div>
                                                </div>
                                                {service.description && (
                                                    <p className="text-xs text-neutral-400 mt-2 line-clamp-2">
                                                        {service.description}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between pt-4 mt-4 border-t border-neutral-800/60">
                                                <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                                                    <Clock className="w-3.5 h-3.5 text-neutral-500" />
                                                    <span>{service.duration_minutes} minutes</span>
                                                </div>
                                                <span
                                                    className={`text-xs font-medium px-2.5 py-1 rounded-lg ${
                                                        isChosen
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-neutral-800 text-neutral-300'
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
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all"
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
                            <h2 className="text-2xl font-bold tracking-tight text-white">Pick Date & Time</h2>
                            <p className="text-sm text-neutral-400 mt-1">
                                Schedulable for {selectedService.name} ({selectedService.duration_minutes} min)
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
                            {/* Date Picker Section */}
                            <div className="md:col-span-5 bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                                    Appointment Date
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        min={todayStr}
                                        value={selectedDate}
                                        onChange={(e) => handleDateChange(e.target.value)}
                                        className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="mt-4 text-xs text-neutral-500 space-y-1">
                                    <p>• Only open operating hours are selectable.</p>
                                    <p>• Appointments book in {selectedService.duration_minutes}-minute increments.</p>
                                </div>
                            </div>

                            {/* Time Slots Section */}
                            <div className="md:col-span-7 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                                            Available Slots
                                        </label>
                                        {selectedDate && (
                                            <span className="text-xs text-blue-400 font-medium">
                                                {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </span>
                                        )}
                                    </div>

                                    {loadingSlots ? (
                                        <div className="py-12 flex flex-col items-center justify-center text-neutral-500">
                                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
                                            <span className="text-xs">Checking real-time calendar availability...</span>
                                        </div>
                                    ) : slotsError ? (
                                        <div className="py-8 text-center text-red-400 text-xs">
                                            {slotsError}
                                        </div>
                                    ) : slots.length === 0 ? (
                                        <div className="py-12 text-center text-neutral-500 space-y-2">
                                            <Clock className="w-8 h-8 text-neutral-600 mx-auto" />
                                            <p className="text-sm font-medium text-neutral-400">
                                                No time slots available for this date.
                                            </p>
                                            <p className="text-xs text-neutral-600">
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
                                                        className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                                                            isPicked
                                                                ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20'
                                                                : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800'
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
                                    <div className="mt-4 p-3 rounded-xl bg-blue-950/30 border border-blue-500/20 flex items-center justify-between text-xs text-blue-300">
                                        <span>Selected Slot:</span>
                                        <span className="font-bold text-white">
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
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-neutral-400 hover:text-white"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Change Service</span>
                            </button>
                            <button
                                type="button"
                                disabled={!data.time}
                                onClick={() => setStep(3)}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all"
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
                            <h2 className="text-2xl font-bold tracking-tight text-white">Your Contact Details</h2>
                            <p className="text-sm text-neutral-400 mt-1">
                                Complete your reservation for {selectedService.name}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
                            {/* Form Inputs */}
                            <div className="md:col-span-7 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                                        Full Name *
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
                                        <input
                                            type="text"
                                            required
                                            value={data.customer_name}
                                            onChange={(e) => setData('customer_name', e.target.value)}
                                            placeholder="Jane Doe"
                                            className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    {errors.customer_name && (
                                        <p className="text-xs text-red-500 mt-1">{errors.customer_name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                                        Email Address *
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
                                        <input
                                            type="email"
                                            required
                                            value={data.customer_email}
                                            onChange={(e) => setData('customer_email', e.target.value)}
                                            placeholder="jane@example.com"
                                            className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    {errors.customer_email && (
                                        <p className="text-xs text-red-500 mt-1">{errors.customer_email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                                        Phone Number (Optional)
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
                                        <input
                                            type="tel"
                                            value={data.customer_phone}
                                            onChange={(e) => setData('customer_phone', e.target.value)}
                                            placeholder="+1 (555) 000-0000"
                                            className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    {errors.customer_phone && (
                                        <p className="text-xs text-red-500 mt-1">{errors.customer_phone}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                                        Notes or Requests (Optional)
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={data.customer_notes}
                                        onChange={(e) => setData('customer_notes', e.target.value)}
                                        placeholder="Any special accommodations..."
                                        className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {errors.customer_notes && (
                                        <p className="text-xs text-red-500 mt-1">{errors.customer_notes}</p>
                                    )}
                                </div>
                            </div>

                            {/* Reservation Summary Card */}
                            <div className="md:col-span-5 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                                        Booking Summary
                                    </h3>

                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
                                            <span className="text-neutral-400">Service:</span>
                                            <span className="font-semibold text-white">{selectedService.name}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
                                            <span className="text-neutral-400">Duration:</span>
                                            <span className="font-medium text-neutral-200">
                                                {selectedService.duration_minutes} mins
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
                                            <span className="text-neutral-400">Date:</span>
                                            <span className="font-medium text-neutral-200">{data.date}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
                                            <span className="text-neutral-400">Time:</span>
                                            <span className="font-medium text-blue-400">{data.time}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2">
                                            <span className="text-base font-semibold text-white">Total:</span>
                                            <span className="text-lg font-bold text-emerald-400">
                                                ${Number(selectedService.price).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {errors.time && (
                                    <div className="mt-4 p-3 bg-red-950/50 border border-red-500/30 rounded-xl text-xs text-red-300">
                                        {errors.time}
                                    </div>
                                )}

                                <div className="mt-6 pt-4 border-t border-neutral-800">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-xl shadow-blue-500/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
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
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Change Time Slot</span>
                            </button>
                        </div>
                    </form>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-neutral-900 py-6 text-center text-xs text-neutral-600">
                <p>Powered by the Booking System • Secure slot reservations</p>
            </footer>
        </div>
    );
}
