import React, { useState, FormEvent } from 'react';
import { Head, Link, useForm, router, setLayoutProps } from '@inertiajs/react';
import {
    ChevronLeft,
    Calendar,
    Clock,
    DollarSign,
    CheckCircle2,
    XCircle,
    User,
    Mail,
    Phone,
    Plus,
    Edit3,
    Trash2,
    Copy,
    Check,
    ExternalLink,
    Settings,
    Layers,
    Code,
    AlertCircle
} from 'lucide-react';

interface BookingService {
    id: number;
    project_id: number;
    name: string;
    description?: string | null;
    duration_minutes: number;
    price: number | string;
    currency: string;
    is_active: boolean;
}

interface Booking {
    id: number;
    uuid: string;
    project_id: number;
    customer_name: string;
    customer_email: string;
    customer_phone?: string | null;
    customer_notes?: string | null;
    booking_date: string;
    booking_time: string;
    status: 'confirmed' | 'completed' | 'cancelled';
    cancellation_reason?: string | null;
    booking_service?: BookingService | null;
}

interface Project {
    id: number;
    project_name: string;
    booking_enabled: boolean;
    booking_public_token?: string | null;
    booking_notification_email?: string | null;
    booking_settings?: {
        start_time?: string;
        end_time?: string;
        days?: number[];
    } | null;
}

interface PaginatedBookings {
    data: Booking[];
    current_page: number;
    last_page: number;
    total: number;
}

interface BookingManagementProps {
    project: Project;
    services: BookingService[];
    bookings: PaginatedBookings;
}

export default function BookingManagementIndex({
    project,
    services,
    bookings,
}: BookingManagementProps) {
    const [activeTab, setActiveTab] = useState<'appointments' | 'services' | 'settings'>('appointments');
    const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
    const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);

    // Modal state for adding/editing a service
    const [serviceModalOpen, setServiceModalOpen] = useState<boolean>(false);
    const [editingService, setEditingService] = useState<BookingService | null>(null);

    const publicUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/book/${project.booking_public_token}`
        : `/book/${project.booking_public_token}`;

    const embedSnippet = `<a href="${publicUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 24px;background-color:#2563eb;color:#ffffff;border-radius:8px;font-weight:600;text-decoration:none;">Book Appointment</a>`;

    const copyPublicUrl = () => {
        navigator.clipboard.writeText(publicUrl);
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
    };

    const copyEmbedSnippet = () => {
        navigator.clipboard.writeText(embedSnippet);
        setCopiedSnippet(true);
        setTimeout(() => setCopiedSnippet(false), 2000);
    };

    // Service Form
    const serviceForm = useForm({
        name: '',
        description: '',
        duration_minutes: 30,
        price: 50.00,
        currency: 'USD',
        is_active: true,
    });

    const openAddServiceModal = () => {
        setEditingService(null);
        serviceForm.setData({
            name: '',
            description: '',
            duration_minutes: 30,
            price: 50.00,
            currency: 'USD',
            is_active: true,
        });
        setServiceModalOpen(true);
    };

    const openEditServiceModal = (service: BookingService) => {
        setEditingService(service);
        serviceForm.setData({
            name: service.name,
            description: service.description || '',
            duration_minutes: service.duration_minutes,
            price: Number(service.price),
            currency: service.currency || 'USD',
            is_active: service.is_active,
        });
        setServiceModalOpen(true);
    };

    const handleServiceSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (editingService) {
            serviceForm.put(`/projects/${project.id}/booking/services/${editingService.id}`, {
                onSuccess: () => setServiceModalOpen(false),
            });
        } else {
            serviceForm.post(`/projects/${project.id}/booking/services`, {
                onSuccess: () => setServiceModalOpen(false),
            });
        }
    };

    const handleDeleteService = (serviceId: number) => {
        if (confirm('Are you sure you want to remove this service?')) {
            router.delete(`/projects/${project.id}/booking/services/${serviceId}`);
        }
    };

    // Booking Status Update
    const updateBookingStatus = (bookingId: number, status: 'completed' | 'cancelled') => {
        let reason: string | null = null;
        if (status === 'cancelled') {
            const promptResult = prompt('Reason for cancellation (optional):', '');
            if (promptResult === null) {
                // User aborted the prompt
                return;
            }
            reason = promptResult;
        }
        router.patch(`/projects/${project.id}/booking/${bookingId}/status`, {
            status,
            cancellation_reason: reason,
        });
    };

    // Settings Form
    const settingsForm = useForm({
        booking_notification_email: project.booking_notification_email || '',
        booking_settings: {
            start_time: project.booking_settings?.start_time || '09:00',
            end_time: project.booking_settings?.end_time || '17:00',
            days: project.booking_settings?.days || [1, 2, 3, 4, 5],
        },
    });

    const handleSettingsSubmit = (e: FormEvent) => {
        e.preventDefault();
        settingsForm.put(`/projects/${project.id}/booking/settings`);
    };

    const toggleSettingsDay = (dayId: number) => {
        const currentDays = settingsForm.data.booking_settings.days;
        const updated = currentDays.includes(dayId)
            ? currentDays.filter((d: number) => d !== dayId)
            : [...currentDays, dayId].sort();
        settingsForm.setData('booking_settings', {
            ...settingsForm.data.booking_settings,
            days: updated,
        });
    };

    setLayoutProps({
        breadcrumbs: [
            { title: 'Dashboard', href: '/dashboard' },
            { title: project.project_name, href: `/projects/${project.id}` },
            { title: 'Booking Management', href: '#' },
        ],
    });

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 sm:p-8">
            <Head title={`Booking Management - ${project.project_name}`} />

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Back Link & Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
                    <div>
                        <Link
                            href={`/projects/${project.id}`}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition-colors mb-2"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Back to Project</span>
                        </Link>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                                Booking Management
                            </h1>
                            <span
                                className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                                    project.booking_enabled
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                                }`}
                            >
                                {project.booking_enabled ? 'Active' : 'Disabled'}
                            </span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-1">
                            {project.project_name} • Manage appointment reservations and service offerings
                        </p>
                    </div>

                    {/* Quick Portal Action */}
                    {project.booking_public_token && (
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={copyPublicUrl}
                                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 transition-all"
                            >
                                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedUrl ? 'Copied URL!' : 'Copy Portal URL'}</span>
                            </button>
                            <a
                                href={`/book/${project.booking_public_token}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-all"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Open Booking Portal</span>
                            </a>
                        </div>
                    )}
                </div>

                {/* Website Integration Banner */}
                {project.booking_public_token && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                                <Code className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-xs sm:text-sm font-semibold text-white">
                                    Embed on Your Website
                                </h4>
                                <p className="text-xs text-neutral-400 mt-0.5">
                                    Add a "Book Appointment" button into your site's HTML header or hero section.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={copyEmbedSnippet}
                            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors shrink-0"
                        >
                            {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedSnippet ? 'Copied HTML!' : 'Copy Button Code'}</span>
                        </button>
                    </div>
                )}

                {/* Tabs Navigation */}
                <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                    <button
                        type="button"
                        onClick={() => setActiveTab('appointments')}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                            activeTab === 'appointments'
                                ? 'bg-neutral-800 text-white border border-neutral-700'
                                : 'text-neutral-400 hover:text-white'
                        }`}
                    >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Appointments ({bookings.total})</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('services')}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                            activeTab === 'services'
                                ? 'bg-neutral-800 text-white border border-neutral-700'
                                : 'text-neutral-400 hover:text-white'
                        }`}
                    >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Services & Pricing ({services.length})</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('settings')}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                            activeTab === 'settings'
                                ? 'bg-neutral-800 text-white border border-neutral-700'
                                : 'text-neutral-400 hover:text-white'
                        }`}
                    >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Schedule Settings</span>
                    </button>
                </div>

                {/* TAB 1: APPOINTMENTS */}
                {activeTab === 'appointments' && (
                    <div className="space-y-4">
                        {bookings.data.length === 0 ? (
                            <div className="p-12 text-center bg-neutral-900 border border-neutral-800 rounded-2xl">
                                <Calendar className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
                                <h3 className="text-sm font-semibold text-white">No appointments yet</h3>
                                <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                                    When guests book appointments through your public booking portal, they will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-900/60">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-neutral-900 border-b border-neutral-800 text-neutral-400 uppercase tracking-wider font-semibold">
                                        <tr>
                                            <th className="py-3.5 px-4">Guest</th>
                                            <th className="py-3.5 px-4">Service</th>
                                            <th className="py-3.5 px-4">Date & Time</th>
                                            <th className="py-3.5 px-4">Status</th>
                                            <th className="py-3.5 px-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-800">
                                        {bookings.data.map((item) => (
                                            <tr key={item.id} className="hover:bg-neutral-900/90 transition-colors">
                                                <td className="py-3.5 px-4">
                                                    <div className="font-semibold text-white">
                                                        {item.customer_name}
                                                    </div>
                                                    <div className="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5">
                                                        <span>{item.customer_email}</span>
                                                        {item.customer_phone && <span>• {item.customer_phone}</span>}
                                                    </div>
                                                    {item.customer_notes && (
                                                        <div className="text-[11px] text-neutral-500 italic mt-1">
                                                            "{item.customer_notes}"
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 font-medium text-neutral-200">
                                                    <div>{item.booking_service?.name || 'General'}</div>
                                                    {item.booking_service?.price && (
                                                        <div className="text-[11px] text-emerald-400">
                                                            ${Number(item.booking_service.price).toFixed(2)}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="text-neutral-200 font-medium">
                                                        {item.booking_date}
                                                    </div>
                                                    <div className="text-[11px] text-blue-400">
                                                        {item.booking_time ? item.booking_time.slice(0, 5) : ''}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                                            item.status === 'confirmed'
                                                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                                : item.status === 'completed'
                                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                        }`}
                                                    >
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    {item.status === 'confirmed' && (
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => updateBookingStatus(item.id, 'completed')}
                                                                className="px-2.5 py-1 text-[11px] font-medium bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 rounded-lg transition-colors"
                                                            >
                                                                Complete
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => updateBookingStatus(item.id, 'cancelled')}
                                                                className="px-2.5 py-1 text-[11px] font-medium bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 rounded-lg transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    )}
                                                    {item.status !== 'confirmed' && (
                                                        <span className="text-neutral-600 text-[11px]">No actions</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: SERVICES & PRICING */}
                {activeTab === 'services' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-semibold text-white">Offered Services</h3>
                                <p className="text-xs text-neutral-400">
                                    Customize prices, appointment durations, and descriptions.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={openAddServiceModal}
                                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-all"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Service</span>
                            </button>
                        </div>

                        {services.length === 0 ? (
                            <div className="p-12 text-center bg-neutral-900 border border-neutral-800 rounded-2xl">
                                <Layers className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
                                <h3 className="text-sm font-semibold text-white">No services configured</h3>
                                <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                                    Click "Add Service" above to add your first bookable appointment service.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {services.map((svc) => (
                                    <div
                                        key={svc.id}
                                        className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between hover:border-neutral-700 transition-all"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className="text-sm font-semibold text-white">{svc.name}</h4>
                                                <div className="text-sm font-bold text-emerald-400">
                                                    ${Number(svc.price).toFixed(2)}
                                                </div>
                                            </div>
                                            {svc.description && (
                                                <p className="text-xs text-neutral-400 mt-2 line-clamp-2">
                                                    {svc.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between pt-4 mt-4 border-t border-neutral-800">
                                            <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                                                <Clock className="w-3.5 h-3.5 text-neutral-500" />
                                                <span>{svc.duration_minutes} min</span>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditServiceModal(svc)}
                                                    className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors"
                                                    title="Edit Service"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteService(svc.id)}
                                                    className="p-1.5 text-neutral-400 hover:text-red-400 rounded-lg transition-colors"
                                                    title="Delete Service"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: SCHEDULE & NOTIFICATION SETTINGS */}
                {activeTab === 'settings' && (
                    <form
                        onSubmit={handleSettingsSubmit}
                        className="max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6"
                    >
                        <div>
                            <h3 className="text-base font-semibold text-white">Booking Schedule & Alerts</h3>
                            <p className="text-xs text-neutral-400 mt-1">
                                Set your operating hours and where new appointment notices are sent.
                            </p>
                        </div>

                        {/* Notification Email */}
                        <div>
                            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                                Notification Email *
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-neutral-500" />
                                <input
                                    type="email"
                                    required
                                    value={settingsForm.data.booking_notification_email}
                                    onChange={(e) =>
                                        settingsForm.setData('booking_notification_email', e.target.value)
                                    }
                                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Operating Hours */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                                    Start Time
                                </label>
                                <input
                                    type="time"
                                    value={settingsForm.data.booking_settings.start_time}
                                    onChange={(e) =>
                                        settingsForm.setData('booking_settings', {
                                            ...settingsForm.data.booking_settings,
                                            start_time: e.target.value,
                                        })
                                    }
                                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                                    End Time
                                </label>
                                <input
                                    type="time"
                                    value={settingsForm.data.booking_settings.end_time}
                                    onChange={(e) =>
                                        settingsForm.setData('booking_settings', {
                                            ...settingsForm.data.booking_settings,
                                            end_time: e.target.value,
                                        })
                                    }
                                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm"
                                />
                            </div>
                        </div>

                        {/* Operating Days */}
                        <div>
                            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                                Open Days
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { id: 1, label: 'Mon' },
                                    { id: 2, label: 'Tue' },
                                    { id: 3, label: 'Wed' },
                                    { id: 4, label: 'Thu' },
                                    { id: 5, label: 'Fri' },
                                    { id: 6, label: 'Sat' },
                                    { id: 7, label: 'Sun' },
                                ].map((day) => {
                                    const isChosen = settingsForm.data.booking_settings.days.includes(day.id);
                                    return (
                                        <button
                                            type="button"
                                            key={day.id}
                                            onClick={() => toggleSettingsDay(day.id)}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                                                isChosen
                                                    ? 'bg-blue-600 border-blue-500 text-white'
                                                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                                            }`}
                                        >
                                            {day.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={settingsForm.processing}
                                className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all"
                            >
                                {settingsForm.processing ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Service Modal (Add / Edit) */}
            {serviceModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-4">
                            {editingService ? 'Edit Service' : 'Add New Service'}
                        </h3>

                        <form onSubmit={handleServiceSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                                    Service Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={serviceForm.data.name}
                                    onChange={(e) => serviceForm.setData('name', e.target.value)}
                                    placeholder="e.g. Standard Consultation"
                                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                                        Duration (mins) *
                                    </label>
                                    <input
                                        type="number"
                                        min={5}
                                        max={480}
                                        step={5}
                                        required
                                        value={serviceForm.data.duration_minutes}
                                        onChange={(e) =>
                                            serviceForm.setData('duration_minutes', parseInt(e.target.value) || 30)
                                        }
                                        className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                                        Price ($ USD) *
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        required
                                        value={serviceForm.data.price}
                                        onChange={(e) =>
                                            serviceForm.setData('price', parseFloat(e.target.value) || 0)
                                        }
                                        className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                                    Description (Optional)
                                </label>
                                <textarea
                                    rows={2}
                                    value={serviceForm.data.description}
                                    onChange={(e) => serviceForm.setData('description', e.target.value)}
                                    placeholder="Brief summary of what this appointment covers..."
                                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                                <button
                                    type="button"
                                    onClick={() => setServiceModalOpen(false)}
                                    className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={serviceForm.processing}
                                    className="px-5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all"
                                >
                                    {serviceForm.processing ? 'Saving...' : 'Save Service'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
