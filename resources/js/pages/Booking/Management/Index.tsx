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
    AlertCircle,
    Key,
    ShieldCheck,
    RefreshCw,
    Share2
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

interface BookingManagementProps {
    project: Project;
    services: BookingService[];
    bookings: {
        data: Booking[];
        current_page: number;
        last_page: number;
        total: number;
    };
    hasBookingCta?: boolean;
    embedSnippet?: string;
    recentTokens?: Array<{
        id: number;
        token: string;
        expires_at: string;
        is_revoked: boolean;
        access_count: number;
        last_accessed_at?: string | null;
        created_at: string;
    }>;
}

export default function BookingManagementIndex({
    project,
    services,
    bookings,
    recentTokens = [],
}: BookingManagementProps) {
    const [activeTab, setActiveTab] = useState<'services' | 'settings' | 'appointments' | 'security'>('services');
    const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

    // Modal state for adding/editing a service
    const [serviceModalOpen, setServiceModalOpen] = useState<boolean>(false);
    const [editingService, setEditingService] = useState<BookingService | null>(null);

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const publicUrl = project.booking_public_token ? `${origin}/book/${project.booking_public_token}` : '';
    const entryUrl = project.booking_public_token ? `${origin}/book/entry/${project.booking_public_token}` : '';
    const [copiedEntryUrl, setCopiedEntryUrl] = useState<boolean>(false);

    const [actionLoading, setActionLoading] = useState<boolean>(false);
    const [shareDuration, setShareDuration] = useState<number>(24);
    const [copiedShareLink, setCopiedShareLink] = useState<boolean>(false);

    const copyPublicUrl = () => {
        navigator.clipboard.writeText(publicUrl);
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
    };

    const copyEntryUrl = () => {
        navigator.clipboard.writeText(entryUrl);
        setCopiedEntryUrl(true);
        setTimeout(() => setCopiedEntryUrl(false), 2000);
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
        serviceForm.clearErrors();
        setServiceModalOpen(true);
    };

    const openEditServiceModal = (service: BookingService) => {
        setEditingService(service);
        serviceForm.setData({
            name: service.name,
            description: service.description || '',
            duration_minutes: Number(service.duration_minutes),
            price: Number(service.price),
            currency: service.currency || 'USD',
            is_active: Boolean(service.is_active),
        });
        serviceForm.clearErrors();
        setServiceModalOpen(true);
    };

    const handleServiceSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (editingService) {
            serviceForm.put(`/projects/${project.id}/booking/services/${editingService.id}`, {
                preserveScroll: true,
                onSuccess: () => setServiceModalOpen(false),
            });
        } else {
            serviceForm.post(`/projects/${project.id}/booking/services`, {
                preserveScroll: true,
                onSuccess: () => setServiceModalOpen(false),
            });
        }
    };

    const handleDeleteService = (serviceId: number) => {
        if (confirm('Are you sure you want to deactivate and remove this service?')) {
            router.delete(`/projects/${project.id}/booking/services/${serviceId}`, {
                preserveScroll: true,
            });
        }
    };

    const updateBookingStatus = (bookingId: number, status: 'completed' | 'cancelled') => {
        let reason: string | null = null;
        if (status === 'cancelled') {
            const promptVal = prompt('Cancel appointment? Enter optional cancellation reason (or click Cancel to abort):');
            if (promptVal === null) {
                return;
            }
            reason = promptVal.trim() || null;
        } else if (status === 'completed') {
            if (!confirm('Mark appointment as completed?')) {
                return;
            }
        }

        router.patch(`/projects/${project.id}/booking/${bookingId}/status`, {
            status,
            cancellation_reason: reason,
        }, {
            preserveScroll: true,
        });
    };

    const handleRotateKey = () => {
        if (confirm('Rotate your dedicated project booking key? Note: Old static links will be invalidated, but your live website CTA will be updated automatically.')) {
            setActionLoading(true);
            router.post(`/projects/${project.id}/booking/rotate-token`, {}, {
                preserveScroll: true,
                onFinish: () => setActionLoading(false),
            });
        }
    };

    const handleGenerateShareLink = (e: FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        router.post(`/projects/${project.id}/booking/generate-link`, {
            duration_hours: shareDuration,
        }, {
            preserveScroll: true,
            onFinish: () => setActionLoading(false),
        });
    };

    // Schedule Settings Form
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
        settingsForm.put(`/projects/${project.id}/booking/settings`, {
            preserveScroll: true,
        });
    };

    const toggleSettingsDay = (dayId: number) => {
        const currentDays = settingsForm.data.booking_settings?.days || [];
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
        <div className="flex h-full flex-1 flex-col gap-6 overflow-x-hidden p-4 sm:p-6 lg:p-8 bg-background text-foreground">
            <Head title={`Booking Management - ${project.project_name}`} />

            <div className="max-w-7xl mx-auto w-full space-y-6">
                {/* Back Link & Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
                    <div>
                        <Link
                            href={`/projects/${project.id}`}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-2"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Back to Project</span>
                        </Link>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                Booking Management
                            </h1>
                            <span
                                className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                                    project.booking_enabled
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                                        : 'bg-destructive/10 border-destructive/30 text-destructive'
                                }`}
                            >
                                {project.booking_enabled ? 'Active' : 'Disabled'}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {project.project_name} • Manage appointment reservations and service offerings
                        </p>
                    </div>

                    {/* Quick Portal Action */}
                    {project.booking_public_token && (
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={copyPublicUrl}
                                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-card border border-border text-foreground hover:bg-accent transition-all shadow-xs"
                            >
                                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                                <span>{copiedUrl ? 'Copied URL!' : 'Copy Portal URL'}</span>
                            </button>
                            <a
                                href={`/book/${project.booking_public_token}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Open Booking Portal</span>
                            </a>
                        </div>
                    )}
                </div>

                {/* Portal Status & Testing Bar */}
                {project.booking_public_token && (
                    <div className="p-4 sm:p-5 rounded-xl bg-card border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-xs sm:text-sm font-semibold text-foreground">
                                    Direct Booking System Active
                                </h4>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Website integration and button placement are managed by your administrator. You can test your booking portal live at any time.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <a
                                href={publicUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs transition-colors"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Test Booking Portal</span>
                            </a>
                        </div>
                    </div>
                )}

                {/* Tabs Navigation */}
                <div className="flex items-center gap-2 border-b border-border pb-3">
                    <button
                        type="button"
                        onClick={() => setActiveTab('services')}
                        className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                            activeTab === 'services'
                                ? 'bg-primary text-primary-foreground shadow-xs'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                    >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Services & Pricing ({services.length})</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('settings')}
                        className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                            activeTab === 'settings'
                                ? 'bg-primary text-primary-foreground shadow-xs'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                    >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Schedule Settings</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('appointments')}
                        className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                            activeTab === 'appointments'
                                ? 'bg-primary text-primary-foreground shadow-xs'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                    >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Appointments ({bookings.total})</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('security')}
                        className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                            activeTab === 'security'
                                ? 'bg-primary text-primary-foreground shadow-xs'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                    >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Portal Security & Links</span>
                    </button>
                </div>

                {/* TAB 1: APPOINTMENTS */}
                {activeTab === 'appointments' && (
                    <div className="space-y-4">
                        {bookings.data.length === 0 ? (
                            <div className="p-12 text-center bg-card border border-border rounded-xl shadow-xs">
                                <Calendar className="w-10 h-10 text-muted-foreground/60 mx-auto mb-3" />
                                <h3 className="text-sm font-semibold text-foreground">No appointments yet</h3>
                                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                                    When guests book appointments through your public booking portal, they will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase tracking-wider font-semibold">
                                        <tr>
                                            <th className="py-3 px-4">Guest</th>
                                            <th className="py-3 px-4">Service</th>
                                            <th className="py-3 px-4">Date & Time</th>
                                            <th className="py-3 px-4">Status</th>
                                            <th className="py-3 px-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {bookings.data.map((item) => (
                                            <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="py-3.5 px-4">
                                                    <div className="font-semibold text-foreground">
                                                        {item.customer_name}
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                                                        <span>{item.customer_email}</span>
                                                        {item.customer_phone && <span>• {item.customer_phone}</span>}
                                                    </div>
                                                    {item.customer_notes && (
                                                        <div className="text-[11px] text-muted-foreground/80 italic mt-1">
                                                            &quot;{item.customer_notes}&quot;
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 font-medium text-foreground">
                                                    <div>{item.booking_service?.name || 'General'}</div>
                                                    {item.booking_service?.price && (
                                                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                                            ${Number(item.booking_service.price).toFixed(2)}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="text-foreground font-medium">
                                                        {item.booking_date}
                                                    </div>
                                                    <div className="text-[11px] text-primary font-medium">
                                                        {item.booking_time ? item.booking_time.slice(0, 5) : ''}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                                            item.status === 'confirmed'
                                                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                                                : item.status === 'completed'
                                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                                                : 'bg-destructive/10 text-destructive border border-destructive/20'
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
                                                                className="px-2.5 py-1 text-[11px] font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-md transition-colors"
                                                            >
                                                                Complete
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => updateBookingStatus(item.id, 'cancelled')}
                                                                className="px-2.5 py-1 text-[11px] font-medium bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 rounded-md transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    )}
                                                    {item.status !== 'confirmed' && (
                                                        <span className="text-muted-foreground text-[11px]">No actions</span>
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
                                <h3 className="text-base font-semibold text-foreground">Offered Services</h3>
                                <p className="text-xs text-muted-foreground">
                                    Customize prices, appointment durations, and descriptions.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={openAddServiceModal}
                                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Service</span>
                            </button>
                        </div>

                        {services.length === 0 ? (
                            <div className="p-12 text-center bg-card border border-border rounded-xl shadow-xs">
                                <Layers className="w-10 h-10 text-muted-foreground/60 mx-auto mb-3" />
                                <h3 className="text-sm font-semibold text-foreground">No services configured</h3>
                                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                                    Click &quot;Add Service&quot; above to add your first bookable appointment service.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {services.map((svc) => (
                                    <div
                                        key={svc.id}
                                        className="p-5 rounded-xl bg-card border border-border flex flex-col justify-between hover:border-primary/40 transition-all shadow-xs"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h4 className="text-sm font-semibold text-foreground">{svc.name}</h4>
                                                    <span
                                                        className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                                            svc.is_active
                                                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                                                                : 'bg-muted border-border text-muted-foreground'
                                                        }`}
                                                    >
                                                        {svc.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                                    ${Number(svc.price).toFixed(2)}
                                                </div>
                                            </div>
                                            {svc.description && (
                                                <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                                                    {svc.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>{svc.duration_minutes} min</span>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditServiceModal(svc)}
                                                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-md transition-colors"
                                                    title="Edit Service"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteService(svc.id)}
                                                    className="p-1.5 text-muted-foreground hover:text-destructive rounded-md transition-colors"
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
                        className="max-w-2xl bg-card border border-border rounded-xl p-6 shadow-xs space-y-6"
                    >
                        <div>
                            <h3 className="text-base font-semibold text-foreground">Booking Schedule & Alerts</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                                Set your operating hours and where new appointment notices are sent.
                            </p>
                        </div>

                        {/* Notification Email */}
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                Notification Email *
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="email"
                                    required
                                    value={settingsForm.data.booking_notification_email}
                                    onChange={(e) =>
                                        settingsForm.setData('booking_notification_email', e.target.value)
                                    }
                                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                            {settingsForm.errors.booking_notification_email && (
                                <p className="text-xs text-destructive mt-1">{settingsForm.errors.booking_notification_email}</p>
                            )}
                        </div>

                        {/* Operating Hours */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                    Start Time
                                </label>
                                <input
                                    type="time"
                                    required
                                    value={settingsForm.data.booking_settings.start_time}
                                    onChange={(e) =>
                                        settingsForm.setData('booking_settings', {
                                            ...settingsForm.data.booking_settings,
                                            start_time: e.target.value,
                                        })
                                    }
                                    className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                                {settingsForm.errors['booking_settings.start_time'] && (
                                    <p className="text-xs text-destructive mt-1">{settingsForm.errors['booking_settings.start_time']}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                    End Time
                                </label>
                                <input
                                    type="time"
                                    required
                                    value={settingsForm.data.booking_settings.end_time}
                                    onChange={(e) =>
                                        settingsForm.setData('booking_settings', {
                                            ...settingsForm.data.booking_settings,
                                            end_time: e.target.value,
                                        })
                                    }
                                    className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                                {settingsForm.errors['booking_settings.end_time'] && (
                                    <p className="text-xs text-destructive mt-1">{settingsForm.errors['booking_settings.end_time']}</p>
                                )}
                            </div>
                        </div>

                        {/* Operating Days */}
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
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
                                    const currentDays = settingsForm.data.booking_settings?.days || [];
                                    const isChosen = currentDays.includes(day.id);
                                    return (
                                        <button
                                            type="button"
                                            key={day.id}
                                            onClick={() => toggleSettingsDay(day.id)}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                                                isChosen
                                                    ? 'bg-primary border-primary text-primary-foreground shadow-xs'
                                                    : 'bg-background border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                                            }`}
                                        >
                                            {day.label}
                                        </button>
                                    );
                                })}
                            </div>
                            {(settingsForm.data.booking_settings?.days || []).length === 0 && (
                                <p className="text-xs text-amber-500 mt-2">
                                    Currently closed on all days (no slots will be available for booking).
                                </p>
                            )}
                            {settingsForm.errors['booking_settings.days'] && (
                                <p className="text-xs text-destructive mt-1">{settingsForm.errors['booking_settings.days']}</p>
                            )}
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={settingsForm.processing}
                                className="px-6 py-2.5 text-xs font-semibold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm disabled:opacity-50 transition-all"
                            >
                                {settingsForm.processing ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </form>
                )}

                {/* TAB 4: PORTAL SECURITY & DIRECT LINKS */}
                {activeTab === 'security' && (
                    <div className="space-y-6">
                        {/* Dynamic / Expiring Access Tokens & Key Rotation */}
                        <div className="p-6 bg-card border border-border rounded-xl shadow-xs space-y-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                        <h3 className="font-bold text-foreground text-sm">
                                            Dynamic Session Security & Link Rotation
                                        </h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Each time a guest clicks your website link, a dedicated temporary session key is generated automatically.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={handleRotateKey}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-muted hover:bg-accent text-foreground border border-border transition-colors flex items-center gap-1.5 shrink-0"
                                    title="Rotate project dedicated master token"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    <span>Rotate Master Key</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Dynamic Entry Link */}
                                <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-foreground">
                                            Dynamic Guest Entry URL
                                        </span>
                                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                                            Auto-Expiring
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        This is the permanent entry link on your website. When clicked, it generates a fresh, dedicated 60-minute guest session.
                                    </p>
                                    <div className="flex items-center gap-1.5 pt-1">
                                        <input
                                            type="text"
                                            readOnly
                                            value={entryUrl}
                                            className="flex-1 px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground font-mono select-all truncate"
                                        />
                                        <button
                                            type="button"
                                            onClick={copyEntryUrl}
                                            className="p-2 text-xs rounded-lg bg-card border border-border hover:bg-muted text-foreground transition-colors shrink-0"
                                            title="Copy Entry URL"
                                        >
                                            {copiedEntryUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                        </button>
                                        <a
                                            href={entryUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-2 text-xs rounded-lg bg-card border border-border hover:bg-muted text-foreground transition-colors shrink-0"
                                            title="Open Entry Link"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    </div>
                                </div>

                                {/* Generate Custom Expiring Link */}
                                <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-foreground">
                                            Generate Shareable Expiring Link
                                        </span>
                                        <Share2 className="w-3.5 h-3.5 text-primary" />
                                    </div>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        Generate a single-use time-limited link to share directly with a VIP client via email or message.
                                    </p>
                                    <form onSubmit={handleGenerateShareLink} className="flex items-center gap-2 pt-1">
                                        <select
                                            value={shareDuration}
                                            onChange={(e) => setShareDuration(Number(e.target.value))}
                                            className="px-2.5 py-1.5 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        >
                                            <option value={1}>Valid for 1 Hour</option>
                                            <option value={24}>Valid for 24 Hours</option>
                                            <option value={72}>Valid for 3 Days</option>
                                            <option value={168}>Valid for 7 Days</option>
                                        </select>
                                        <button
                                            type="submit"
                                            disabled={actionLoading}
                                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs transition-colors shrink-0"
                                        >
                                            Generate Link
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* Recent Access Tokens Log */}
                            {recentTokens && recentTokens.length > 0 && (
                                <div className="space-y-2 pt-2">
                                    <div className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                        Recent Guest Access Sessions ({recentTokens.length})
                                    </div>
                                    <div className="rounded-lg border border-border overflow-hidden">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-muted/40 text-[11px] text-muted-foreground uppercase border-b border-border">
                                                <tr>
                                                    <th className="px-4 py-2 font-medium">Session Token</th>
                                                    <th className="px-4 py-2 font-medium">Created</th>
                                                    <th className="px-4 py-2 font-medium">Expires</th>
                                                    <th className="px-4 py-2 font-medium">Visits</th>
                                                    <th className="px-4 py-2 font-medium text-right">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {recentTokens.map((t) => {
                                                    const isExpired = new Date(t.expires_at) <= new Date() || t.is_revoked;
                                                    return (
                                                        <tr key={t.id} className="hover:bg-muted/20">
                                                            <td className="px-4 py-2.5 font-mono text-[11px] text-foreground">
                                                                {t.token.slice(0, 16)}...
                                                            </td>
                                                            <td className="px-4 py-2.5 text-muted-foreground text-[11px]">
                                                                {new Date(t.created_at).toLocaleString()}
                                                            </td>
                                                            <td className="px-4 py-2.5 text-muted-foreground text-[11px]">
                                                                {new Date(t.expires_at).toLocaleString()}
                                                            </td>
                                                            <td className="px-4 py-2.5 text-foreground font-semibold">
                                                                {t.access_count}
                                                            </td>
                                                            <td className="px-4 py-2.5 text-right">
                                                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                                                                    !isExpired
                                                                        ? 'bg-emerald-500/10 text-emerald-500'
                                                                        : 'bg-muted text-muted-foreground'
                                                                }`}>
                                                                    {!isExpired ? 'Active' : 'Expired'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Service Modal (Add / Edit) */}
            {serviceModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
                    <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-xl">
                        <h3 className="text-lg font-bold text-foreground mb-4">
                            {editingService ? 'Edit Service' : 'Add New Service'}
                        </h3>

                        <form onSubmit={handleServiceSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                    Service Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={serviceForm.data.name}
                                    onChange={(e) => serviceForm.setData('name', e.target.value)}
                                    placeholder="e.g. Standard Consultation"
                                    className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                                {serviceForm.errors.name && (
                                    <p className="text-xs text-destructive mt-1">{serviceForm.errors.name}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
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
                                        className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                    {serviceForm.errors.duration_minutes && (
                                        <p className="text-xs text-destructive mt-1">{serviceForm.errors.duration_minutes}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
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
                                        className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                    {serviceForm.errors.price && (
                                        <p className="text-xs text-destructive mt-1">{serviceForm.errors.price}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                    Description (Optional)
                                </label>
                                <textarea
                                    rows={2}
                                    value={serviceForm.data.description}
                                    onChange={(e) => serviceForm.setData('description', e.target.value)}
                                    placeholder="Brief summary of what this appointment covers..."
                                    className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                                {serviceForm.errors.description && (
                                    <p className="text-xs text-destructive mt-1">{serviceForm.errors.description}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="mgmt_service_is_active"
                                    checked={serviceForm.data.is_active}
                                    onChange={(e) => serviceForm.setData('is_active', e.target.checked)}
                                    className="rounded border-border text-primary focus:ring-primary"
                                />
                                <label htmlFor="mgmt_service_is_active" className="text-xs text-foreground font-medium select-none">
                                    Active and available for guest booking
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => setServiceModalOpen(false)}
                                    className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={serviceForm.processing}
                                    className="px-5 py-2 text-xs font-semibold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm disabled:opacity-50 transition-all"
                                >
                                    {serviceForm.processing ? 'Saving...' : editingService ? 'Save Changes' : 'Save Service'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
