import React, { useState } from 'react';
import { Head, Link, useForm, setLayoutProps, router } from '@inertiajs/react';
import {
    Download,
    Send,
    Upload,
    X,
    Loader2,
    Paperclip,
    AlertTriangle,
    Clock,
    Save,
    Maximize2,
    ExternalLink,
    Mail,
    FileCode,
    Rocket,
    Globe,
    Check,
    Copy,
    Calendar,
    Code,
    Sparkles,
    CheckCircle2,
    ChevronRight,
    HelpCircle,
    Play,
    ShieldCheck,
    Layers,
    ArrowUpRight,
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { index as adminRequestsIndex, update as adminRequestUpdate } from '@/routes/admin/requests';
import { store as adminCommentStore } from '@/routes/admin/requests/comments';

interface Comment {
    id: number;
    body: string;
    attachment_url: string | null;
    user: { id: number; name: string };
    is_admin: boolean;
    created_at: string;
}

interface AdminRequestDetail {
    id: number;
    category: string;
    category_label: string;
    category_icon: string;
    title: string;
    description: string;
    intake_data?: Record<string, any>;
    attachment_url: string | null;
    status: string;
    status_label: string;
    status_color: string;
    admin_notes: string | null;
    project: {
        id: number;
        name: string;
        has_emailer?: boolean;
        emailer_active?: boolean;
        emailer_recipient_email?: string | null;
        emailer_reply_name?: string | null;
        emailer_public_token?: string | null;
        emailer_endpoint_url?: string | null;
        has_emailer_script?: boolean;
        has_contact_form?: boolean;
        booking_enabled?: boolean;
        booking_public_token?: string | null;
        booking_notification_email?: string | null;
        booking_entry_url?: string | null;
        has_booking_cta?: boolean;
        booking_cta_snippet?: string | null;
        booking_services_count?: number;
        is_deployed?: boolean;
        project_url?: string | null;
        vercel_dashboard_url?: string | null;
    } | null;
    client: { id: number; name: string; email: string } | null;
    admin: { id: number; name: string } | null;
    is_ageing: boolean;
    is_urgent: boolean;
    created_at: string;
    completed_at: string | null;
}

const STATUS_STYLES: Record<string, string> = {
    pending:     'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
    reviewing:   'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    in_progress: 'bg-purple-500/10 text-purple-500 dark:text-purple-400 border-purple-500/30',
    completed:   'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    rejected:    'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
    cancelled:   'bg-muted text-muted-foreground border-border',
};

function DynamicIcon({ name, className }: { name: string; className?: string }) {
    const IconComp = (Icons as Record<string, any>)[name];
    if (!IconComp) return null;
    return <IconComp className={className} />;
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

const isImageFile = (url?: string | null): boolean => {
    if (!url) return false;
    const cleanUrl = url.split('?')[0].toLowerCase();
    return /\.(png|jpe?g|gif|webp|svg|avif|bmp)$/.test(cleanUrl) || cleanUrl.startsWith('data:image/');
};

export default function AdminRequestsShow({
    request,
    comments,
    statusOptions,
    auth_user_id,
}: {
    request: AdminRequestDetail;
    comments: Comment[];
    statusOptions: { value: string; label: string }[];
    auth_user_id: number;
}) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [activeToolkitTab, setActiveToolkitTab] = useState<'guide' | 'code' | 'configure'>('guide');

    setLayoutProps({
        breadcrumbs: [
            { title: 'Dashboard', href: '/admin/dashboard' },
            { title: 'Service Requests', href: adminRequestsIndex.url() },
            { title: `${request.title}${request.client ? ` (${request.client.name})` : ''}`, href: '#' },
        ],
    });

    const statusForm = useForm({
        status: request.status,
        admin_notes: request.admin_notes ?? '',
    });

    const commentForm = useForm<{ body: string; attachment: File | null }>({
        body: '',
        attachment: null,
    });

    // Form for quick inline Booking initialization
    const bookingInitForm = useForm({
        notification_email: request.project?.booking_notification_email || request.client?.email || '',
        auto_inject_cta: true,
        client_request_id: request.id,
    });

    // Form for quick inline Emailer creation
    const emailerInitForm = useForm({
        recipient_email: request.project?.emailer_recipient_email || request.client?.email || '',
        reply_name: request.project?.emailer_reply_name || request.project?.name || request.client?.name || 'Customer Support',
        client_request_id: request.id,
        auto_inject_section: true,
        redirect_to: 'request',
    });

    const handleCopy = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2500);
    };

    const handleStatusSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        statusForm.put(adminRequestUpdate.url(request.id));
    };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        commentForm.post(adminCommentStore.url(request.id), {
            forceFormData: true,
            onSuccess: () => {
                commentForm.reset();
                setSelectedFile(null);
            },
        });
    };

    // Actions for Booking System
    const handleInitializeBooking = (e: React.FormEvent) => {
        e.preventDefault();
        if (!request.project) return;
        bookingInitForm.post(`/admin/projects/${request.project.id}/booking/initialize`);
    };

    const handleInjectBookingCta = () => {
        if (!request.project) return;
        router.post(`/admin/projects/${request.project.id}/booking/inject-cta`, {}, {
            preserveScroll: true,
        });
    };

    const handleRemoveBookingCta = () => {
        if (!request.project) return;
        router.post(`/admin/projects/${request.project.id}/booking/remove-cta`, {}, {
            preserveScroll: true,
        });
    };

    const handleToggleBooking = () => {
        if (!request.project) return;
        router.patch(`/admin/projects/${request.project.id}/booking/toggle`, {}, {
            preserveScroll: true,
        });
    };

    // Actions for Emailer
    const handleInitializeEmailer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!request.project) return;
        emailerInitForm.post(`/admin/projects/${request.project.id}/emailer`);
    };

    const handleToggleEmailer = () => {
        if (!request.project) return;
        router.patch(`/admin/projects/${request.project.id}/emailer/toggle`, {}, {
            preserveScroll: true,
        });
    };

    const handleInjectContactSection = () => {
        if (!request.project) return;
        router.post(`/admin/projects/${request.project.id}/emailer/inject-section`, {}, {
            preserveScroll: true,
        });
    };

    const handleRemoveContactSection = () => {
        if (!request.project) return;
        router.post(`/admin/projects/${request.project.id}/emailer/remove-section`, {}, {
            preserveScroll: true,
        });
    };

    const isBookingCategory = request.category === 'booking_system';
    const isEmailerCategory = request.category === 'email_integration';
    const isDomainCategory = request.category === 'custom_domain' || request.category === 'ssl_certificate';

    // Ready-made HTML snippets
    const bookingPublicUrl = request.project?.booking_entry_url || (request.project?.booking_public_token ? `/book/entry/${request.project.booking_public_token}` : '');
    const bookingButtonSnippet = request.project?.booking_cta_snippet || `<!-- StudioSync Booking CTA Button -->\n<a href="${bookingPublicUrl || '/book/entry/TOKEN'}" target="_blank" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-md">\n  <span>📅 Book an Appointment</span>\n</a>`;

    const emailerEndpointUrl = request.project?.emailer_endpoint_url || `/api/contact/${request.project?.emailer_public_token || 'TOKEN'}`;
    const emailerFormSnippet = `<!-- StudioSync Contact Form Section -->\n<section id="contact" style="padding: 60px 20px; max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">\n  <div style="text-align: center; margin-bottom: 28px;">\n    <h2 style="font-size: 28px; font-weight: bold; margin-bottom: 8px;">Contact Us</h2>\n    <p style="font-size: 14px; opacity: 0.8;">Send us a message and we will respond as soon as possible.</p>\n  </div>\n  <form id="contact-form" data-contact style="display: flex; flex-direction: column; gap: 14px;">\n    <div>\n      <label style="display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">Your Name</label>\n      <input type="text" name="name" required placeholder="John Doe" style="width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #d4d4d8; font-size: 14px;" />\n    </div>\n    <div>\n      <label style="display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">Email Address</label>\n      <input type="email" name="email" required placeholder="john@example.com" style="width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #d4d4d8; font-size: 14px;" />\n    </div>\n    <div>\n      <label style="display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">Subject</label>\n      <input type="text" name="subject" placeholder="General Inquiry" style="width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #d4d4d8; font-size: 14px;" />\n    </div>\n    <div>\n      <label style="display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">Message</label>\n      <textarea name="message" required rows="4" placeholder="Write your message here..." style="width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #d4d4d8; font-size: 14px;"></textarea>\n    </div>\n    <button type="submit" style="padding: 12px 20px; background-color: #4f46e5; color: #ffffff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">\n      Send Message\n    </button>\n  </form>\n</section>`;

    return (
        <>
            <Head title={`${request.title} | Admin Requests | StudioSync`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-hidden p-4 sm:p-6 lg:p-8 bg-background text-foreground">

                {/* Top Grid: Left 8 cols, Right 4 cols for a spacious layout */}
                <div className="max-w-7xl w-full mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6">

                    {/* Left Column (Main Information, Toolkit, & Chat) */}
                    <div className="xl:col-span-8 flex flex-col gap-6">

                        {/* Request Header Card */}
                        <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
                            <div className="flex items-start gap-4 p-5 sm:p-6 border-b border-border">
                                <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <DynamicIcon name={request.category_icon} className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                        <h1 className="text-xl font-bold text-foreground tracking-tight">{request.title}</h1>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLES[request.status] ?? ''}`}>
                                            {request.status_label}
                                        </span>
                                        {request.is_urgent && (
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/30 rounded-full px-2 py-0.5">
                                                <AlertTriangle className="w-3 h-3" />
                                                Urgent (&gt;72h)
                                            </span>
                                        )}
                                        {!request.is_urgent && request.is_ageing && (
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/30 rounded-full px-2 py-0.5">
                                                <Clock className="w-3 h-3" />
                                                Aging (&gt;24h)
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                        <span className="font-semibold text-foreground/80">{request.category_label}</span>
                                        {request.client && (
                                            <>
                                                <span>•</span>
                                                <span>Client: <strong className="text-foreground">{request.client.name}</strong> ({request.client.email})</span>
                                            </>
                                        )}
                                        {request.project && (
                                            <>
                                                <span>•</span>
                                                <span>Project: <strong className="text-foreground">{request.project.name}</strong></span>
                                            </>
                                        )}
                                        <span>•</span>
                                        <span>Submitted {formatDate(request.created_at)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 sm:p-6 space-y-5">
                                {/* Description Section */}
                                <div>
                                    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Client Description</h2>
                                    <div className="p-4 rounded-lg bg-muted/40 border border-border/80">
                                        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{request.description}</p>
                                    </div>
                                </div>

                                {/* Attachment if available */}
                                {request.attachment_url && (
                                    <div>
                                        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Attachment</h2>
                                        {isImageFile(request.attachment_url) ? (
                                            <div
                                                onClick={() => setZoomedImageUrl(request.attachment_url)}
                                                className="group relative inline-block max-w-sm rounded-xl overflow-hidden border border-border bg-muted/40 cursor-pointer shadow-xs hover:border-primary/50 hover:shadow-md transition-all"
                                            >
                                                <img
                                                    src={request.attachment_url}
                                                    alt="Request Attachment"
                                                    className="w-full max-h-56 object-cover transition-transform duration-300 group-hover:scale-102"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 text-white text-xs font-semibold backdrop-blur-xs">
                                                        <Maximize2 className="w-3.5 h-3.5" />
                                                        Click to expand
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <a
                                                href={request.attachment_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-sm text-primary font-medium transition-colors"
                                            >
                                                <Download className="w-4 h-4" />
                                                <span>Download Attachment File</span>
                                            </a>
                                        )}
                                    </div>
                                )}

                                {/* Restructured Fulfillment Action Banner */}
                                {request.project && (
                                    <div className="p-4 sm:p-5 rounded-xl border border-primary/20 bg-primary/5 space-y-4 shadow-xs">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-primary/10 pb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                                                    <DynamicIcon name={request.category_icon} className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Fulfillment Hub</span>
                                                    <h3 className="text-sm font-bold text-foreground">
                                                        Target Project: <span className="underline decoration-primary/40">{request.project.name}</span>
                                                    </h3>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {request.project.is_deployed ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                        <Rocket className="w-3 h-3" /> Live on Vercel
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-500/10 text-muted-foreground border border-border">
                                                        Draft Project
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Choose an action below to fulfill this request. You can open the live website editor with real-time live preview, execute automatic injections, or configure specific integrations.
                                        </p>

                                        {/* Action Buttons Row */}
                                        <div className="flex flex-wrap items-center gap-2.5 pt-1">
                                            <Link
                                                href={`/projects/${request.project.id}/edit?request_id=${request.id}`}
                                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                                                title="Open website editor with split real-time HTML editing"
                                            >
                                                <FileCode className="w-4 h-4" />
                                                <span>Open Website Editor to Fulfill &rarr;</span>
                                            </Link>

                                            {isEmailerCategory && (
                                                <Link
                                                    href={`/admin/projects/${request.project.id}/emailer?request_id=${request.id}`}
                                                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all bg-card border border-border text-foreground hover:bg-muted shadow-xs"
                                                >
                                                    <Mail className="w-3.5 h-3.5 text-primary" />
                                                    <span>Open Full Emailer Manager</span>
                                                </Link>
                                            )}

                                            <Link
                                                href={`/admin/projects/${request.project.id}`}
                                                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all bg-card border border-border text-foreground hover:bg-muted shadow-xs"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                                                <span>Project Workspace</span>
                                            </Link>

                                            {request.project.is_deployed && (
                                                <a
                                                    href={`/admin/projects/${request.project.id}/vercel-redirect`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all bg-zinc-900 hover:bg-zinc-800 text-white shadow-xs"
                                                >
                                                    <Rocket className="w-3.5 h-3.5 text-emerald-400" />
                                                    <span>Manage on Vercel</span>
                                                    <ArrowUpRight className="w-3 h-3 opacity-70" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Interactive Implementation & Linking Toolkit (For Booking & Emailer) */}
                        {request.project && (isBookingCategory || isEmailerCategory || isDomainCategory) && (
                            <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
                                <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                            <Sparkles className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-bold text-foreground">
                                                {isBookingCategory ? 'Booking System Integration & Linking Toolkit' : isEmailerCategory ? 'Contact Emailer Integration & Linking Toolkit' : 'Domain & CDN Linking Toolkit'}
                                            </h2>
                                            <p className="text-xs text-muted-foreground">
                                                Guided steps, ready-to-use HTML code snippets, and 1-click configuration
                                            </p>
                                        </div>
                                    </div>

                                    {/* Sub-tabs */}
                                    <div className="flex items-center gap-1 bg-muted/80 p-1 rounded-lg">
                                        <button
                                            type="button"
                                            onClick={() => setActiveToolkitTab('guide')}
                                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                                                activeToolkitTab === 'guide' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            Guide &amp; Linking
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveToolkitTab('code')}
                                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                                                activeToolkitTab === 'code' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            Embed Snippets
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveToolkitTab('configure')}
                                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                                                activeToolkitTab === 'configure' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            Quick Configure
                                        </button>
                                    </div>
                                </div>

                                <div className="p-5 sm:p-6">
                                    {/* ─── BOOKING SYSTEM TOOLKIT ─── */}
                                    {isBookingCategory && (
                                        <div className="space-y-6">
                                            {/* Status Grid */}
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                <div className="p-3.5 rounded-lg border border-border bg-card space-y-1">
                                                    <span className="text-[11px] font-medium text-muted-foreground">Booking Feature</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                            request.project.booking_enabled
                                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                                                : 'bg-zinc-500/10 text-muted-foreground border border-border'
                                                        }`}>
                                                            {request.project.booking_enabled ? 'Active & Enabled' : 'Not Initialized'}
                                                        </span>
                                                        {request.project.booking_enabled && (
                                                            <button
                                                                type="button"
                                                                onClick={handleToggleBooking}
                                                                className="text-[11px] text-muted-foreground hover:text-foreground underline"
                                                            >
                                                                Toggle
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="p-3.5 rounded-lg border border-border bg-card space-y-1">
                                                    <span className="text-[11px] font-medium text-muted-foreground">Website Markup CTA</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                            request.project.has_booking_cta
                                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                                        }`}>
                                                            {request.project.has_booking_cta ? 'CTA Button Injected' : 'No CTA in Markup'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="p-3.5 rounded-lg border border-border bg-card space-y-1">
                                                    <span className="text-[11px] font-medium text-muted-foreground">Notification Recipient</span>
                                                    <div className="text-xs font-semibold text-foreground truncate" title={request.project.booking_notification_email || request.client?.email}>
                                                        {request.project.booking_notification_email || request.client?.email || 'Not configured'}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* TAB 1: Step-by-Step Linking Guide */}
                                            {activeToolkitTab === 'guide' && (
                                                <div className="space-y-4">
                                                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                                        <HelpCircle className="w-3.5 h-3.5 text-primary" />
                                                        How to link the Booking System to this Client's Website
                                                    </h3>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {/* Option A: 1-Click Auto-Injection */}
                                                        <div className="p-4 rounded-xl border border-border bg-card space-y-3 relative overflow-hidden">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                                                    Method 1 &bull; Recommended
                                                                </span>
                                                                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                                    <Sparkles className="w-3 h-3" /> 1-Click
                                                                </span>
                                                            </div>
                                                            <h4 className="text-sm font-bold text-foreground">Auto-Inject Booking CTA Button</h4>
                                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                                StudioSync automatically inspects the site's markup, finds the navigation header or hero section, and safely inserts a styled <em>"Book an Appointment"</em> button linked to the client's booking portal.
                                                            </p>

                                                            <div className="pt-2 flex flex-wrap items-center gap-2">
                                                                {!request.project.has_booking_cta ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={handleInjectBookingCta}
                                                                        disabled={!request.project.booking_enabled}
                                                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-xs disabled:opacity-50"
                                                                    >
                                                                        <Code className="w-3.5 h-3.5" />
                                                                        <span>Auto-Inject Booking CTA</span>
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={handleRemoveBookingCta}
                                                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-all"
                                                                    >
                                                                        <span>Remove CTA from Markup</span>
                                                                    </button>
                                                                )}

                                                                {!request.project.booking_enabled && (
                                                                    <span className="text-[11px] text-amber-500 font-medium">
                                                                        * Initialize booking first below
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Option B: Manual HTML Placement */}
                                                        <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                                                    Method 2 &bull; Custom Placement
                                                                </span>
                                                            </div>
                                                            <h4 className="text-sm font-bold text-foreground">Manual Code Placement</h4>
                                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                                Copy the booking button HTML snippet and paste it exactly where desired (header, hero, pricing cards, or footer) using the live website editor with real-time preview.
                                                            </p>

                                                            <div className="pt-2 flex flex-wrap items-center gap-2">
                                                                <Link
                                                                    href={`/projects/${request.project.id}/edit?request_id=${request.id}`}
                                                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xs"
                                                                >
                                                                    <FileCode className="w-3.5 h-3.5" />
                                                                    <span>Open Live Code Editor &rarr;</span>
                                                                </Link>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleCopy(bookingButtonSnippet, 'cta-btn')}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-card border border-border hover:bg-muted text-foreground transition-all"
                                                                >
                                                                    {copiedKey === 'cta-btn' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                                    <span>{copiedKey === 'cta-btn' ? 'Snippet Copied!' : 'Copy Snippet'}</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Public Portal Link Bar */}
                                                    {request.project.booking_public_token && (
                                                        <div className="p-3.5 rounded-lg border border-border bg-muted/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                                                                    Client's Public Booking Portal Link:
                                                                </span>
                                                                <code className="text-xs font-mono text-foreground truncate block mt-0.5">
                                                                    {bookingPublicUrl}
                                                                </code>
                                                            </div>
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleCopy(bookingPublicUrl, 'public-url')}
                                                                    className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-card border border-border hover:bg-muted text-foreground transition-colors flex items-center gap-1"
                                                                >
                                                                    {copiedKey === 'public-url' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                                    <span>{copiedKey === 'public-url' ? 'Copied' : 'Copy Link'}</span>
                                                                </button>
                                                                <a
                                                                    href={bookingPublicUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="px-2.5 py-1.5 rounded-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1"
                                                                >
                                                                    <span>Test Portal</span>
                                                                    <ExternalLink className="w-3 h-3" />
                                                                </a>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* TAB 2: Embed Code Snippets */}
                                            {activeToolkitTab === 'code' && (
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                            HTML Button Embed Snippet
                                                        </h4>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCopy(bookingButtonSnippet, 'code-tab-snippet')}
                                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
                                                        >
                                                            {copiedKey === 'code-tab-snippet' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                            <span>{copiedKey === 'code-tab-snippet' ? 'Copied to Clipboard!' : 'Copy Code'}</span>
                                                        </button>
                                                    </div>

                                                    <div className="relative">
                                                        <pre className="p-4 rounded-xl bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto border border-zinc-800 leading-relaxed">
                                                            {bookingButtonSnippet}
                                                        </pre>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Tip: Paste this inside any <code>&lt;nav&gt;</code>, hero CTA container, or before <code>&lt;/body&gt;</code>.
                                                    </p>
                                                </div>
                                            )}

                                            {/* TAB 3: Quick Configure */}
                                            {activeToolkitTab === 'configure' && (
                                                <div className="space-y-4">
                                                    <form onSubmit={handleInitializeBooking} className="p-4 rounded-xl border border-border bg-card space-y-4">
                                                        <div className="flex items-center justify-between border-b border-border pb-3">
                                                            <div>
                                                                <h4 className="text-sm font-bold text-foreground">
                                                                    {request.project.booking_enabled ? 'Update Booking Notification Settings' : 'Initialize & Enable Booking'}
                                                                </h4>
                                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                                    Set the destination email for client appointment notifications and auto-enable the system.
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label htmlFor="booking-notif-email" className="block text-xs font-semibold text-foreground">
                                                                Notification Email Address
                                                            </label>
                                                            <input
                                                                id="booking-notif-email"
                                                                type="email"
                                                                value={bookingInitForm.data.notification_email}
                                                                onChange={(e) => bookingInitForm.setData('notification_email', e.target.value)}
                                                                className="w-full max-w-md px-3.5 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                                                placeholder="e.g. client@example.com"
                                                                required
                                                            />
                                                            <p className="text-[11px] text-muted-foreground">
                                                                When a customer books a slot, booking confirmation and details will be delivered here.
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                id="auto-inject-checkbox"
                                                                type="checkbox"
                                                                checked={bookingInitForm.data.auto_inject_cta}
                                                                onChange={(e) => bookingInitForm.setData('auto_inject_cta', e.target.checked)}
                                                                className="rounded border-border text-primary focus:ring-primary/40"
                                                            />
                                                            <label htmlFor="auto-inject-checkbox" className="text-xs text-foreground font-medium">
                                                                Automatically inject "Book Now" CTA into website markup on save
                                                            </label>
                                                        </div>

                                                        <button
                                                            type="submit"
                                                            disabled={bookingInitForm.processing}
                                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xs disabled:opacity-50"
                                                        >
                                                            {bookingInitForm.processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                                            <span>{request.project.booking_enabled ? 'Update Booking Settings' : 'Initialize & Enable Booking'}</span>
                                                        </button>
                                                    </form>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* ─── CONTACT EMAILER TOOLKIT ─── */}
                                    {isEmailerCategory && (
                                        <div className="space-y-6">
                                            {/* Status Grid: 4 columns */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                                {/* Card 1: Contact Section in HTML */}
                                                <div className="p-3.5 rounded-lg border border-border bg-card space-y-1">
                                                    <span className="text-[11px] font-medium text-muted-foreground">Website Contact Section</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                            request.project.has_contact_form
                                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                                        }`}>
                                                            {request.project.has_contact_form ? 'Detected in Website' : 'Not in Markup'}
                                                        </span>
                                                        {!request.project.has_contact_form ? (
                                                            <button
                                                                type="button"
                                                                onClick={handleInjectContactSection}
                                                                className="text-[11px] text-primary hover:underline font-semibold cursor-pointer"
                                                            >
                                                                + Inject
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={handleRemoveContactSection}
                                                                className="text-[11px] text-muted-foreground hover:text-foreground underline cursor-pointer"
                                                                title="Remove injected contact section"
                                                            >
                                                                Remove
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Card 2: Emailer Status */}
                                                <div className="p-3.5 rounded-lg border border-border bg-card space-y-1">
                                                    <span className="text-[11px] font-medium text-muted-foreground">Contact Emailer</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                            request.project.has_emailer
                                                                ? (request.project.emailer_active ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-zinc-500/10 text-muted-foreground border border-border')
                                                                : 'bg-zinc-500/10 text-muted-foreground border border-border'
                                                        }`}>
                                                            {request.project.has_emailer ? (request.project.emailer_active ? 'Active & Receiving' : 'Inactive') : 'Not Configured'}
                                                        </span>
                                                        {request.project.has_emailer && (
                                                            <button
                                                                type="button"
                                                                onClick={handleToggleEmailer}
                                                                className="text-[11px] text-muted-foreground hover:text-foreground underline cursor-pointer"
                                                            >
                                                                Toggle
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Card 3: Form Interceptor Script */}
                                                <div className="p-3.5 rounded-lg border border-border bg-card space-y-1">
                                                    <span className="text-[11px] font-medium text-muted-foreground">Form Script Status</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                            request.project.has_emailer_script
                                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                                        }`}>
                                                            {request.project.has_emailer_script ? 'Script Injected' : 'Script Not Injected'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Card 4: Recipient Inbox */}
                                                <div className="p-3.5 rounded-lg border border-border bg-card space-y-1">
                                                    <span className="text-[11px] font-medium text-muted-foreground">Recipient Inbox</span>
                                                    <div className="text-xs font-semibold text-foreground truncate" title={request.project.emailer_recipient_email || request.client?.email}>
                                                        {request.project.emailer_recipient_email || request.client?.email || 'Not configured'}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* TAB 1: Guide */}
                                            {activeToolkitTab === 'guide' && (
                                                <div className="space-y-4">
                                                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                                        <HelpCircle className="w-3.5 h-3.5 text-primary" />
                                                        How to link the Contact Us Section &amp; Emailer to this Website
                                                    </h3>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {/* Option A: 1-Click Auto-Inject Contact Section */}
                                                        <div className="p-4 rounded-xl border border-border bg-card space-y-3 relative overflow-hidden">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                                                    Method 1 &bull; Recommended
                                                                </span>
                                                                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                                    <Sparkles className="w-3 h-3" /> 1-Click
                                                                </span>
                                                            </div>
                                                            <h4 className="text-sm font-bold text-foreground">Auto-Inject Contact Us Section</h4>
                                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                                StudioSync inserts a responsive, styled Contact Us form section that automatically hooks into the project's emailer API. Submissions trigger email notifications to the client with guest Reply-To headers.
                                                            </p>

                                                            <div className="pt-2 flex flex-wrap items-center gap-2">
                                                                {!request.project.has_contact_form ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={handleInjectContactSection}
                                                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xs cursor-pointer"
                                                                    >
                                                                        <Plus className="w-3.5 h-3.5" />
                                                                        <span>Auto-Inject Contact Section</span>
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={handleRemoveContactSection}
                                                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-all cursor-pointer"
                                                                    >
                                                                        <span>Remove Injected Contact Section</span>
                                                                    </button>
                                                                )}

                                                                <Link
                                                                    href={`/admin/projects/${request.project.id}/emailer?request_id=${request.id}`}
                                                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-card border border-border hover:bg-muted text-foreground transition-all shadow-xs"
                                                                >
                                                                    <Mail className="w-3.5 h-3.5 text-primary" />
                                                                    <span>Full Emailer Manager &amp; Live Test</span>
                                                                </Link>
                                                            </div>
                                                        </div>

                                                        {/* Option B: Manual HTML Placement */}
                                                        <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                                                    Method 2 &bull; Visual &amp; Code Editor
                                                                </span>
                                                            </div>
                                                            <h4 className="text-sm font-bold text-foreground">Live Website Editor</h4>
                                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                                Open the website editor with split real-time preview to place, customize, or style the Contact Us section markup anywhere on the client's page.
                                                            </p>

                                                            <div className="pt-2 flex flex-wrap items-center gap-2">
                                                                <Link
                                                                    href={`/projects/${request.project.id}/edit?request_id=${request.id}`}
                                                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xs"
                                                                >
                                                                    <FileCode className="w-3.5 h-3.5" />
                                                                    <span>Open Live Code Editor &rarr;</span>
                                                                </Link>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleCopy(emailerFormSnippet, 'form-snippet')}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-card border border-border hover:bg-muted text-foreground transition-all cursor-pointer"
                                                                >
                                                                    {copiedKey === 'form-snippet' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                                    <span>{copiedKey === 'form-snippet' ? 'Form Copied!' : 'Copy Form HTML'}</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* API Endpoint bar */}
                                                    {request.project.emailer_public_token && (
                                                        <div className="p-3.5 rounded-lg border border-border bg-muted/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                                                                    Form Submission API Endpoint (POST):
                                                                </span>
                                                                <code className="text-xs font-mono text-foreground truncate block mt-0.5">
                                                                    {emailerEndpointUrl}
                                                                </code>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCopy(emailerEndpointUrl, 'api-endpoint')}
                                                                className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-card border border-border hover:bg-muted text-foreground transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                                                            >
                                                                {copiedKey === 'api-endpoint' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                                <span>{copiedKey === 'api-endpoint' ? 'Copied' : 'Copy Endpoint'}</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* TAB 2: Embed Code Snippet */}
                                            {activeToolkitTab === 'code' && (
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                            Complete HTML Contact Us Section Snippet
                                                        </h4>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCopy(emailerFormSnippet, 'code-tab-emailer')}
                                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
                                                        >
                                                            {copiedKey === 'code-tab-emailer' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                            <span>{copiedKey === 'code-tab-emailer' ? 'Copied!' : 'Copy Form Code'}</span>
                                                        </button>
                                                    </div>

                                                    <div className="relative">
                                                        <pre className="p-4 rounded-xl bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto border border-zinc-800 leading-relaxed max-h-72">
                                                            {emailerFormSnippet}
                                                        </pre>
                                                    </div>
                                                </div>
                                            )}

                                            {/* TAB 3: Quick Configure */}
                                            {activeToolkitTab === 'configure' && (
                                                <div className="space-y-4">
                                                    <form onSubmit={handleInitializeEmailer} className="p-4 rounded-xl border border-border bg-card space-y-4">
                                                        <div className="flex items-center justify-between border-b border-border pb-3">
                                                            <div>
                                                                <h4 className="text-sm font-bold text-foreground">
                                                                    {request.project.has_emailer ? 'Emailer is Configured' : 'Configure New Contact Emailer'}
                                                                </h4>
                                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                                    Messages sent from the Contact Us section will be emailed to this recipient address.
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {!request.project.has_emailer ? (
                                                            <>
                                                                <div className="space-y-1.5">
                                                                    <label htmlFor="emailer-recipient-email" className="block text-xs font-semibold text-foreground">
                                                                        Recipient Email Address
                                                                    </label>
                                                                    <input
                                                                        id="emailer-recipient-email"
                                                                        type="email"
                                                                        value={emailerInitForm.data.recipient_email}
                                                                        onChange={(e) => emailerInitForm.setData('recipient_email', e.target.value)}
                                                                        className="w-full max-w-md px-3.5 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                                                        placeholder="e.g. client@example.com"
                                                                        required
                                                                    />
                                                                </div>

                                                                <div className="space-y-1.5">
                                                                    <label htmlFor="emailer-reply-name" className="block text-xs font-semibold text-foreground">
                                                                        Sender / Company Reply Name
                                                                    </label>
                                                                    <input
                                                                        id="emailer-reply-name"
                                                                        type="text"
                                                                        value={emailerInitForm.data.reply_name}
                                                                        onChange={(e) => emailerInitForm.setData('reply_name', e.target.value)}
                                                                        className="w-full max-w-md px-3.5 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                                                        placeholder="e.g. Acme Support"
                                                                        required
                                                                    />
                                                                </div>

                                                                <div className="flex items-center gap-2 pt-1">
                                                                    <input
                                                                        id="auto-inject-contact-section"
                                                                        type="checkbox"
                                                                        checked={emailerInitForm.data.auto_inject_section}
                                                                        onChange={(e) => emailerInitForm.setData('auto_inject_section', e.target.checked)}
                                                                        className="rounded border-border text-primary focus:ring-primary/40 cursor-pointer"
                                                                    />
                                                                    <label htmlFor="auto-inject-contact-section" className="text-xs text-foreground font-medium cursor-pointer">
                                                                        Automatically inject Contact Us section markup into website if missing
                                                                    </label>
                                                                </div>

                                                                <button
                                                                    type="submit"
                                                                    disabled={emailerInitForm.processing}
                                                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                                                                >
                                                                    {emailerInitForm.processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                                                    <span>Configure &amp; Connect Emailer</span>
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                                <div className="text-xs text-muted-foreground">
                                                                    Emailer active for <strong>{request.project.emailer_recipient_email}</strong>. Use the dedicated manager to update settings, send test emails, or view recent submissions.
                                                                </div>
                                                                <Link
                                                                    href={`/admin/projects/${request.project.id}/emailer?request_id=${request.id}`}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xs shrink-0"
                                                                >
                                                                    <Mail className="w-3.5 h-3.5" />
                                                                    <span>Open Full Emailer Manager</span>
                                                                </Link>
                                                            </div>
                                                        )}
                                                    </form>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* ─── CUSTOM DOMAIN / SSL TOOLKIT ─── */}
                                    {isDomainCategory && (
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                Custom Domain &amp; SSL Deployment Instructions
                                            </h4>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                To link the client's custom domain to their Vercel deployment:
                                            </p>

                                            <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                                                <div className="text-xs font-mono bg-zinc-950 text-zinc-100 p-3 rounded-lg border border-zinc-800 space-y-1">
                                                    <div># 1. Add CNAME record for subdomains (e.g. www)</div>
                                                    <div className="text-emerald-400">CNAME &bull; www &bull; cname.vercel-dns.com</div>
                                                    <div className="pt-2"># 2. Add A record for apex domain (@)</div>
                                                    <div className="text-emerald-400">A &bull; @ &bull; 76.76.21.21</div>
                                                </div>

                                                <a
                                                    href={`/admin/projects/${request.project.id}/vercel-redirect`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-zinc-900 text-white hover:bg-zinc-800 transition-all shadow-xs"
                                                >
                                                    <Globe className="w-3.5 h-3.5 text-blue-400" />
                                                    <span>Open Vercel Domain Settings &rarr;</span>
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Discussion / Chat Thread */}
                        <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
                            <div className="p-4 sm:p-5 border-b border-border">
                                <h2 className="text-sm font-semibold text-foreground">Discussion &amp; History</h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {comments.length} {comments.length === 1 ? 'message' : 'messages'}
                                </p>
                            </div>

                            <div className="flex flex-col divide-y divide-border/50 max-h-[420px] overflow-y-auto">
                                {comments.length === 0 && (
                                    <div className="p-8 text-center text-sm text-muted-foreground">
                                        No messages yet. Send a message to the client below.
                                    </div>
                                )}
                                {comments.map((comment) => (
                                    <div
                                        key={comment.id}
                                        className={`p-4 sm:p-5 flex gap-3 ${comment.is_admin ? 'bg-blue-500/3' : ''}`}
                                    >
                                        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                            comment.is_admin ? 'bg-blue-500/15 text-blue-500' : 'bg-primary/10 text-primary'
                                        }`}>
                                            {comment.user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-semibold text-foreground">{comment.user.name}</span>
                                                {comment.is_admin && (
                                                    <span className="text-[10px] font-semibold text-blue-500 bg-blue-500/10 border border-blue-500/20 rounded-full px-1.5 py-0.5">Admin</span>
                                                )}
                                                <span className="text-[11px] text-muted-foreground ml-auto">{formatDate(comment.created_at)}</span>
                                            </div>
                                            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{comment.body}</p>

                                            {comment.attachment_url && (
                                                isImageFile(comment.attachment_url) ? (
                                                    <div className="mt-2.5">
                                                        <div
                                                            onClick={() => setZoomedImageUrl(comment.attachment_url)}
                                                            className="group relative inline-block max-w-xs sm:max-w-sm rounded-xl overflow-hidden border border-border bg-muted/40 cursor-pointer shadow-xs hover:border-primary/50 hover:shadow-md transition-all"
                                                        >
                                                            <img
                                                                src={comment.attachment_url}
                                                                alt="Comment Attachment"
                                                                className="w-full max-h-56 object-cover transition-transform duration-300 group-hover:scale-102"
                                                            />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 text-white text-xs font-semibold backdrop-blur-xs">
                                                                    <Maximize2 className="w-3.5 h-3.5" />
                                                                    Click to expand
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <a
                                                        href={comment.attachment_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg border border-border bg-muted/40 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                                                    >
                                                        <Paperclip className="w-3.5 h-3.5 text-primary" />
                                                        <span>Attachment File</span>
                                                        <ExternalLink className="w-3 h-3 text-muted-foreground ml-1" />
                                                    </a>
                                                )
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 sm:p-5 border-t border-border">
                                <form onSubmit={handleCommentSubmit} className="space-y-3">
                                    <textarea
                                        id="admin-comment-body"
                                        rows={3}
                                        placeholder="Write a message or update to the client..."
                                        value={commentForm.data.body}
                                        onChange={(e) => commentForm.setData('body', e.target.value)}
                                        className={`w-full px-4 py-2.5 text-sm rounded-lg border bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground ${commentForm.errors.body ? 'border-red-500' : 'border-border'}`}
                                    />

                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            {!selectedFile ? (
                                                <label htmlFor="admin-comment-attachment" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer">
                                                    <Paperclip className="w-3.5 h-3.5" />
                                                    Attach file
                                                    <input
                                                        id="admin-comment-attachment"
                                                        type="file"
                                                        className="sr-only"
                                                        accept=".jpg,.jpeg,.png,.gif,.pdf,.zip,.doc,.docx,.txt"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0] ?? null;
                                                            setSelectedFile(file);
                                                            commentForm.setData('attachment', file);
                                                        }}
                                                    />
                                                </label>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-xs text-foreground">
                                                    <Upload className="w-3.5 h-3.5 text-primary" />
                                                    <span className="truncate max-w-[120px]">{selectedFile.name}</span>
                                                    <button type="button" onClick={() => { setSelectedFile(null); commentForm.setData('attachment', null); }}>
                                                        <X className="w-3.5 h-3.5 text-muted-foreground" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            id="admin-send-comment-btn"
                                            type="submit"
                                            disabled={commentForm.processing || !commentForm.data.body.trim()}
                                            className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold transition-all bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-9 px-4 disabled:opacity-50 disabled:pointer-events-none"
                                        >
                                            {commentForm.processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                            Reply
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Controls & Sidebar) */}
                    <div className="xl:col-span-4 flex flex-col gap-5">

                        {/* Status & Internal Notes Card */}
                        <form onSubmit={handleStatusSubmit} className="bg-card border border-border rounded-xl shadow-xs p-5 space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-border">
                                <h2 className="text-sm font-bold text-foreground">Update Request Status</h2>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${STATUS_STYLES[statusForm.data.status] ?? ''}`}>
                                    {statusOptions.find(o => o.value === statusForm.data.status)?.label || statusForm.data.status}
                                </span>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-muted-foreground" htmlFor="status-select">
                                    Status
                                </label>
                                <select
                                    id="status-select"
                                    value={statusForm.data.status}
                                    onChange={(e) => statusForm.setData('status', e.target.value)}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                                >
                                    {statusOptions.map((s) => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                    ))}
                                </select>
                                {statusForm.errors.status && <p className="text-xs text-red-500">{statusForm.errors.status}</p>}
                            </div>

                            {/* Quick Status Buttons */}
                            <div className="flex flex-wrap gap-1.5">
                                {['in_progress', 'completed', 'reviewing'].map((stKey) => (
                                    <button
                                        key={stKey}
                                        type="button"
                                        onClick={() => statusForm.setData('status', stKey)}
                                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all ${
                                            statusForm.data.status === stKey
                                                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                                : 'bg-muted/40 text-muted-foreground border-border hover:text-foreground'
                                        }`}
                                    >
                                        Mark as {stKey.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-muted-foreground" htmlFor="admin-notes">
                                    Internal Admin Notes <span className="text-[10px] font-normal text-muted-foreground/80">(private)</span>
                                </label>
                                <textarea
                                    id="admin-notes"
                                    rows={4}
                                    placeholder="Add private administrative notes or checklist..."
                                    value={statusForm.data.admin_notes}
                                    onChange={(e) => statusForm.setData('admin_notes', e.target.value)}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground"
                                />
                            </div>

                            <button
                                id="save-request-btn"
                                type="submit"
                                disabled={statusForm.processing}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-10 px-4 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {statusForm.processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Request Updates
                            </button>
                        </form>

                        {/* Associated Project Card */}
                        {request.project && (
                            <div className="bg-card border border-border rounded-xl shadow-xs p-5 space-y-3.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Associated Website</span>
                                    {request.project.is_deployed ? (
                                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                            LIVE
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                            DRAFT
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <div className="text-sm font-bold text-foreground">{request.project.name}</div>
                                    {request.project.project_url && (
                                        <a
                                            href={request.project.project_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-mono truncate max-w-full"
                                        >
                                            <span className="truncate">{request.project.project_url}</span>
                                            <ExternalLink className="w-3 h-3 shrink-0" />
                                        </a>
                                    )}
                                </div>

                                <div className="pt-2 flex flex-col gap-2">
                                    <Link
                                        href={`/projects/${request.project.id}/edit?request_id=${request.id}`}
                                        className="w-full inline-flex items-center justify-center gap-2 rounded-lg text-xs font-bold transition-all bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 shadow-xs"
                                    >
                                        <FileCode className="w-3.5 h-3.5" />
                                        <span>Open Live Website Editor</span>
                                    </Link>

                                    <Link
                                        href={`/admin/projects/${request.project.id}`}
                                        className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-all bg-card border border-border text-foreground hover:bg-muted h-9 px-4 shadow-xs"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                                        <span>Open Project Workspace</span>
                                    </Link>

                                    {request.project.is_deployed && (
                                        <a
                                            href={`/admin/projects/${request.project.id}/vercel-redirect`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-all bg-zinc-900 hover:bg-zinc-800 text-white h-9 px-4 shadow-xs"
                                        >
                                            <Rocket className="w-3.5 h-3.5 text-emerald-400" />
                                            <span>Manage on Vercel Dashboard</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Request Metadata Details */}
                        <div className="bg-card border border-border rounded-xl shadow-xs p-5 space-y-3">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Request Details</h2>
                            <dl className="space-y-3 text-xs divide-y divide-border/60">
                                {request.client && (
                                    <div className="pt-2">
                                        <dt className="text-muted-foreground font-medium">Submitted by Client</dt>
                                        <dd className="text-foreground font-bold text-sm mt-0.5">{request.client.name}</dd>
                                        <dd className="text-muted-foreground font-mono text-[11px]">{request.client.email}</dd>
                                    </div>
                                )}
                                <div className="pt-2">
                                    <dt className="text-muted-foreground font-medium">Date Submitted</dt>
                                    <dd className="text-foreground font-semibold mt-0.5">{formatDate(request.created_at)}</dd>
                                </div>
                                {request.completed_at && (
                                    <div className="pt-2">
                                        <dt className="text-muted-foreground font-medium">Completed At</dt>
                                        <dd className="text-emerald-500 font-semibold mt-0.5">{formatDate(request.completed_at)}</dd>
                                    </div>
                                )}
                                {request.admin && (
                                    <div className="pt-2">
                                        <dt className="text-muted-foreground font-medium">Assigned Admin</dt>
                                        <dd className="text-foreground font-semibold mt-0.5">{request.admin.name}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox Modal */}
            {zoomedImageUrl && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-8 animate-in fade-in duration-200"
                    onClick={() => setZoomedImageUrl(null)}
                >
                    <div
                        className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-full flex items-center justify-between pb-3">
                            <span className="text-xs font-semibold text-white/80">Attachment Preview</span>
                            <button
                                type="button"
                                onClick={() => setZoomedImageUrl(null)}
                                className="p-1.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-colors"
                                title="Close preview"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <img
                            src={zoomedImageUrl}
                            alt="Attachment Preview"
                            className="max-h-[80vh] max-w-full rounded-xl object-contain shadow-2xl border border-white/10"
                        />
                    </div>
                </div>
            )}
        </>
    );
}

AdminRequestsShow.layout = {
    breadcrumbs: [
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'Service Requests', href: '/admin/requests' },
        { title: 'Request Detail', href: '#' },
    ],
};
