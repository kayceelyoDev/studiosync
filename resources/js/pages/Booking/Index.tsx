import React, { useState } from 'react';
import { Head, Link, router, setLayoutProps } from '@inertiajs/react';
import {
    Calendar,
    Clock,
    DollarSign,
    CheckCircle2,
    XCircle,
    Search,
    Filter,
    ExternalLink,
    ChevronRight,
    Sparkles,
    ShieldCheck,
    Layers,
    User,
    Mail,
    Phone,
    FileText,
    ArrowUpRight,
    RotateCw,
    AlertCircle,
} from 'lucide-react';

interface BookingService {
    id: number;
    name: string;
    duration_minutes: number;
    price: number | string;
    currency: string;
}

interface ProjectSummary {
    id: number;
    project_name: string;
    booking_enabled: boolean;
    booking_public_token?: string | null;
    booking_notification_email?: string | null;
}

interface BookingItem {
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
    created_at: string;
    project?: {
        id: number;
        project_name: string;
        booking_public_token: string;
    };
    booking_service?: BookingService | null;
}

interface BookingsIndexProps {
    projects: ProjectSummary[];
    bookingProjects: ProjectSummary[];
    bookings: {
        data: BookingItem[];
        current_page: number;
        last_page: number;
        total: number;
        prev_page_url?: string | null;
        next_page_url?: string | null;
    };
    filters: {
        project_id: string;
        status: string;
        search: string;
        date: string;
    };
    metrics: {
        total: number;
        upcoming: number;
        confirmed: number;
        completed: number;
        cancelled: number;
        estimated_revenue: number;
        active_projects: number;
    };
}

export default function BookingsIndex({
    projects,
    bookingProjects,
    bookings,
    filters,
    metrics,
}: BookingsIndexProps) {
    const [search, setSearch] = useState<string>(filters.search || '');
    const [selectedProject, setSelectedProject] = useState<string>(filters.project_id || '');
    const [statusFilter, setStatusFilter] = useState<string>(filters.status || 'all');
    const [dateFilter, setDateFilter] = useState<string>(filters.date || '');

    setLayoutProps({
        breadcrumbs: [
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Bookings Hub', href: '/bookings' },
        ],
    });

    const applyFilters = (newFilters: Partial<typeof filters>) => {
        router.get(
            '/bookings',
            {
                search: newFilters.search !== undefined ? newFilters.search : search,
                project_id: newFilters.project_id !== undefined ? newFilters.project_id : selectedProject,
                status: newFilters.status !== undefined ? newFilters.status : statusFilter,
                date: newFilters.date !== undefined ? newFilters.date : dateFilter,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search });
    };

    const handleProjectChange = (projectId: string) => {
        setSelectedProject(projectId);
        applyFilters({ project_id: projectId });
    };

    const handleStatusChange = (status: string) => {
        setStatusFilter(status);
        applyFilters({ status });
    };

    const handleDateChange = (date: string) => {
        setDateFilter(date);
        applyFilters({ date });
    };

    const handleResetFilters = () => {
        setSearch('');
        setSelectedProject('');
        setStatusFilter('all');
        setDateFilter('');
        router.get('/bookings', {}, { replace: true });
    };

    const handleStatusUpdate = (booking: BookingItem, newStatus: 'completed' | 'cancelled') => {
        let reason: string | null = null;
        if (newStatus === 'cancelled') {
            const promptVal = prompt(`Cancel appointment for "${booking.customer_name}"? Enter optional cancellation reason (or click Cancel to abort):`);
            if (promptVal === null) {
                return; // User aborted the cancellation
            }
            reason = promptVal.trim() || null;
        } else if (newStatus === 'completed') {
            if (!confirm(`Mark appointment for "${booking.customer_name}" as completed?`)) {
                return;
            }
        }

        router.patch(
            `/bookings/${booking.id}/status`,
            {
                status: newStatus,
                cancellation_reason: reason,
            },
            {
                preserveScroll: true,
            }
        );
    };

    return (
        <div className="flex h-full flex-1 flex-col gap-6 overflow-x-hidden p-4 sm:p-6 lg:p-8 bg-background text-foreground">
            <Head title="Client Bookings Hub" />

            <div className="max-w-7xl mx-auto w-full space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                    Client Bookings Hub
                                </h1>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Centralized view of all guest appointments across your websites & projects
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick project count badge */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                            Active Booking Websites: <strong className="text-foreground">{metrics.active_projects}</strong>
                        </span>
                    </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 rounded-xl bg-card border border-border shadow-xs space-y-2">
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span className="text-xs font-semibold uppercase tracking-wider">Total Bookings</span>
                            <Calendar className="w-4 h-4 text-primary" />
                        </div>
                        <div className="text-2xl font-bold text-foreground">{metrics.total}</div>
                        <div className="text-[11px] text-muted-foreground">All time appointments</div>
                    </div>

                    <div className="p-5 rounded-xl bg-card border border-border shadow-xs space-y-2">
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span className="text-xs font-semibold uppercase tracking-wider">Upcoming Confirmed</span>
                            <Clock className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {metrics.upcoming}
                        </div>
                        <div className="text-[11px] text-muted-foreground">Scheduled from today onwards</div>
                    </div>

                    <div className="p-5 rounded-xl bg-card border border-border shadow-xs space-y-2">
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
                            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div className="text-2xl font-bold text-foreground">{metrics.completed}</div>
                        <div className="text-[11px] text-muted-foreground">Successfully fulfilled</div>
                    </div>

                    <div className="p-5 rounded-xl bg-card border border-border shadow-xs space-y-2">
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span className="text-xs font-semibold uppercase tracking-wider">Est. Value</span>
                            <DollarSign className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="text-2xl font-bold text-foreground">
                            ${metrics.estimated_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[11px] text-muted-foreground">Confirmed + Completed services</div>
                    </div>
                </div>

                {/* Projects Quick Links Ribbon (if client has multiple booking projects) */}
                {bookingProjects.length > 0 && (
                    <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
                        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5" />
                                <span>Your Booking Websites ({bookingProjects.length})</span>
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {bookingProjects.map((p) => (
                                <div
                                    key={p.id}
                                    className="p-3 rounded-lg bg-muted/40 border border-border/80 flex items-center justify-between gap-3 text-xs"
                                >
                                    <div className="min-w-0">
                                        <div className="font-semibold text-foreground truncate">{p.project_name}</div>
                                        <div className="text-[11px] text-muted-foreground truncate">
                                            {p.booking_notification_email || 'Alerts configured'}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Link
                                            href={`/projects/${p.id}/booking`}
                                            className="px-2.5 py-1 rounded bg-background border border-border hover:bg-muted text-foreground text-[11px] font-medium transition-colors"
                                        >
                                            Settings
                                        </Link>
                                        {p.booking_public_token && (
                                            <a
                                                href={`/book/entry/${p.booking_public_token}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-1 rounded bg-background border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                                title="Open Public Booking Portal"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Filters Bar */}
                <div className="p-4 rounded-xl bg-card border border-border shadow-xs space-y-4">
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                        {/* Search Input */}
                        <form onSubmit={handleSearchSubmit} className="flex-1 relative min-w-[240px]">
                            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search guest name, email, or phone..."
                                className="w-full pl-9 pr-20 py-2 rounded-lg bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            <button
                                type="submit"
                                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-semibold bg-primary text-primary-foreground rounded-md shadow-xs hover:bg-primary/90 transition-all"
                            >
                                Search
                            </button>
                        </form>

                        {/* Project Dropdown */}
                        <div className="w-full md:w-56">
                            <select
                                value={selectedProject}
                                onChange={(e) => handleProjectChange(e.target.value)}
                                className="w-full py-2 px-3 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                <option value="">All Projects</option>
                                {bookingProjects.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.project_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date Picker */}
                        <div className="w-full md:w-44">
                            <input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => handleDateChange(e.target.value)}
                                className="w-full py-2 px-3 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>

                        {/* Reset button if filtered */}
                        {(search || selectedProject || statusFilter !== 'all' || dateFilter) && (
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/60 hover:bg-muted rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0"
                            >
                                <RotateCw className="w-3.5 h-3.5" />
                                <span>Reset</span>
                            </button>
                        )}
                    </div>

                    {/* Status Tabs */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
                        <span className="text-xs text-muted-foreground font-semibold mr-1">Status:</span>
                        {[
                            { key: 'all', label: 'All Bookings', count: metrics.total },
                            { key: 'confirmed', label: 'Confirmed', count: metrics.confirmed },
                            { key: 'completed', label: 'Completed', count: metrics.completed },
                            { key: 'cancelled', label: 'Cancelled', count: metrics.cancelled },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => handleStatusChange(tab.key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                    statusFilter === tab.key
                                        ? 'bg-primary text-primary-foreground shadow-xs'
                                        : 'bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                    statusFilter === tab.key
                                        ? 'bg-primary-foreground/20 text-primary-foreground'
                                        : 'bg-background text-muted-foreground'
                                }`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bookings Table / Listing */}
                <div className="rounded-xl bg-card border border-border shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="text-[11px] text-muted-foreground uppercase bg-muted/30 border-b border-border">
                                <tr>
                                    <th className="px-5 py-3.5 font-semibold">Guest / Customer</th>
                                    <th className="px-5 py-3.5 font-semibold">Project & Service</th>
                                    <th className="px-5 py-3.5 font-semibold">Date & Time</th>
                                    <th className="px-5 py-3.5 font-semibold">Status</th>
                                    <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {bookings.data && bookings.data.length > 0 ? (
                                    bookings.data.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-muted/30 transition-colors">
                                            {/* Customer */}
                                            <td className="px-5 py-4">
                                                <div className="font-semibold text-foreground text-sm">
                                                    {booking.customer_name}
                                                </div>
                                                <div className="text-muted-foreground flex flex-col gap-0.5 mt-0.5">
                                                    <span className="flex items-center gap-1 text-[11px]">
                                                        <Mail className="w-3 h-3 opacity-60" />
                                                        {booking.customer_email}
                                                    </span>
                                                    {booking.customer_phone && (
                                                        <span className="flex items-center gap-1 text-[11px]">
                                                            <Phone className="w-3 h-3 opacity-60" />
                                                            {booking.customer_phone}
                                                        </span>
                                                    )}
                                                </div>
                                                {booking.customer_notes && (
                                                    <div className="mt-2 text-[11px] text-muted-foreground italic bg-muted/40 p-2 rounded-md max-w-sm">
                                                        "{booking.customer_notes}"
                                                    </div>
                                                )}
                                            </td>

                                            {/* Project & Service */}
                                            <td className="px-5 py-4">
                                                {booking.project && (
                                                    <Link
                                                        href={`/projects/${booking.project.id}/booking`}
                                                        className="font-medium text-primary hover:underline flex items-center gap-1"
                                                    >
                                                        <span>{booking.project.project_name}</span>
                                                        <ArrowUpRight className="w-3 h-3" />
                                                    </Link>
                                                )}
                                                <div className="mt-1 font-semibold text-foreground">
                                                    {booking.booking_service?.name || 'General Service'}
                                                </div>
                                                <div className="text-muted-foreground text-[11px]">
                                                    {booking.booking_service ? (
                                                        <span>
                                                            ${Number(booking.booking_service.price).toFixed(2)} • {booking.booking_service.duration_minutes} mins
                                                        </span>
                                                    ) : (
                                                        'Standard Appointment'
                                                    )}
                                                </div>
                                            </td>

                                            {/* Date & Time */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <div className="font-semibold text-foreground">
                                                    {booking.booking_date}
                                                </div>
                                                <div className="text-muted-foreground flex items-center gap-1 text-[11px] mt-0.5">
                                                    <Clock className="w-3 h-3 opacity-60" />
                                                    <span>{booking.booking_time ? booking.booking_time.slice(0, 5) : ''}</span>
                                                </div>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                                                        booking.status === 'confirmed'
                                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                                                            : booking.status === 'completed'
                                                            ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
                                                            : 'bg-destructive/10 border-destructive/30 text-destructive'
                                                    }`}
                                                >
                                                    {booking.status === 'confirmed' && <Clock className="w-3 h-3" />}
                                                    {booking.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                                                    {booking.status === 'cancelled' && <XCircle className="w-3 h-3" />}
                                                    <span className="capitalize">{booking.status}</span>
                                                </span>
                                                {booking.cancellation_reason && (
                                                    <div className="text-[10px] text-destructive/80 mt-1 max-w-[140px] truncate" title={booking.cancellation_reason}>
                                                        {booking.cancellation_reason}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {booking.status === 'confirmed' && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleStatusUpdate(booking, 'completed')}
                                                                className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] shadow-xs transition-colors"
                                                                title="Mark Completed"
                                                            >
                                                                Complete
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleStatusUpdate(booking, 'cancelled')}
                                                                className="px-2.5 py-1 rounded-md bg-muted hover:bg-destructive/10 hover:text-destructive text-muted-foreground font-semibold text-[11px] transition-colors"
                                                                title="Cancel Appointment"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </>
                                                    )}

                                                    {booking.project?.booking_public_token && (
                                                        <a
                                                            href={`/book/${booking.project.booking_public_token}/confirmation/${booking.uuid}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground bg-muted/60 hover:bg-muted transition-colors"
                                                            title="View Confirmation Slip"
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                            <p className="text-sm font-medium text-foreground">No appointments found</p>
                                            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                                                {search || selectedProject || statusFilter !== 'all' || dateFilter
                                                    ? 'No appointments matched your search and filter criteria.'
                                                    : 'When visitors schedule appointments on your booking portals, they will appear here.'}
                                            </p>
                                            {(search || selectedProject || statusFilter !== 'all' || dateFilter) && (
                                                <button
                                                    type="button"
                                                    onClick={handleResetFilters}
                                                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg shadow-xs hover:bg-primary/90 transition-all"
                                                >
                                                    <RotateCw className="w-3 h-3" />
                                                    <span>Clear Filters</span>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {bookings.last_page > 1 && (
                        <div className="px-5 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground bg-muted/20">
                            <div>
                                Showing Page <strong className="text-foreground">{bookings.current_page}</strong> of{' '}
                                <strong className="text-foreground">{bookings.last_page}</strong> ({bookings.total} total)
                            </div>
                            <div className="flex items-center gap-1.5">
                                {bookings.prev_page_url && (
                                    <Link
                                        href={bookings.prev_page_url}
                                        preserveScroll
                                        className="px-3 py-1 rounded bg-card border border-border text-foreground hover:bg-muted font-medium transition-colors"
                                    >
                                        Previous
                                    </Link>
                                )}
                                {bookings.next_page_url && (
                                    <Link
                                        href={bookings.next_page_url}
                                        preserveScroll
                                        className="px-3 py-1 rounded bg-card border border-border text-foreground hover:bg-muted font-medium transition-colors"
                                    >
                                        Next
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
