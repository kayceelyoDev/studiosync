import { Head, useForm, Link, setLayoutProps } from '@inertiajs/react';
import React, { FormEvent, useState, useMemo } from 'react';
import {
    ChevronLeft,
    MonitorSmartphone,
    Laptop,
    Smartphone,
    RotateCw,
    ExternalLink,
    Copy,
    Check,
    Palette,
    Layers,
    Type,
    Image as ImageIcon,
    FileCode,
    Globe,
    Calendar,
    User,
    Mail,
    CheckCircle2,
    Clock,
    AlertCircle,
    Rocket,
    Send,
    ShieldCheck,
    Plus,
    Trash2,
    Code,
    Key,
    RefreshCw
} from 'lucide-react';
import { router } from '@inertiajs/react';

interface ProjectAsset {
    id: number;
    name: string;
    type?: string;
    path?: string;
    url?: string;
    created_at?: string;
}

interface Deployment {
    id: number;
    url: string;
    status: string;
    created_at: string;
}

interface AdminProjectData {
    id: number;
    workspace_id: number;
    user_id: number;
    project_name: string;
    preferences?: string[];
    html_content?: string;
    generated_prompt?: string;
    status: string;
    project_url?: string | null;
    vercel_project_name?: string | null;
    deployment_status?: string | null;
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    workspace?: {
        id: number;
        name: string;
        slug?: string;
    };
    project_assets?: ProjectAsset[];
    projectAssets?: ProjectAsset[];
    deployments?: Deployment[];
    contact_emailer?: {
        id: number;
        recipient_email: string;
        reply_name: string;
        public_token: string;
        is_active: boolean;
        messages_count?: number;
    } | null;
    booking_enabled?: boolean;
    booking_public_token?: string | null;
    booking_notification_email?: string | null;
    booking_settings?: any;
    booking_services?: any[];
    bookingServices?: any[];
    client_requests?: any[];
    clientRequests?: any[];
}

export default function AdminWorkspacesShow({
    workspace,
    hasBookingCta = false,
}: {
    workspace: AdminProjectData;
    hasBookingCta?: boolean;
}) {
    const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'specs' | 'assets'>('preview');
    const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
    const [iframeKey, setIframeKey] = useState<number>(0);
    const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
    const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
    const [togglingBooking, setTogglingBooking] = useState<boolean>(false);
    const [initializingBooking, setInitializingBooking] = useState<boolean>(false);
    const [updatingServices, setUpdatingServices] = useState<boolean>(false);
    const [savingHtml, setSavingHtml] = useState<boolean>(false);
    const [actionLoading, setActionLoading] = useState<boolean>(false);
    const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);
    const [copiedEntry, setCopiedEntry] = useState<boolean>(false);

    const pendingBookingReq = useMemo(() => {
        const reqs = workspace.client_requests || workspace.clientRequests || [];
        return reqs.find((r: any) => r.category === 'booking_system' && r.status === 'pending');
    }, [workspace.client_requests, workspace.clientRequests]);

    const intakePayload = useMemo(() => {
        if (!pendingBookingReq?.description) return null;
        try {
            return JSON.parse(pendingBookingReq.description);
        } catch (e) {
            return null;
        }
    }, [pendingBookingReq]);

    // Service list for admin review/modification before approving or active editing
    const defaultServices = useMemo(() => {
        if (intakePayload?.services && Array.isArray(intakePayload.services) && intakePayload.services.length > 0) {
            return intakePayload.services.map((s: any) => ({
                id: s.id,
                name: s.name || '',
                description: s.description || '',
                duration_minutes: Number(s.duration_minutes || 30),
                price: Number(s.price || 0),
                currency: s.currency || 'USD',
            }));
        }
        const existing = workspace.booking_services || workspace.bookingServices || [];
        if (existing.length > 0) {
            return existing.map((s: any) => ({
                id: s.id,
                name: s.name || '',
                description: s.description || '',
                duration_minutes: Number(s.duration_minutes || 30),
                price: Number(s.price || 0),
                currency: s.currency || 'USD',
            }));
        }
        return [
            {
                name: 'General Consultation',
                description: 'Initial consultation appointment',
                duration_minutes: 30,
                price: 50.00,
                currency: 'USD',
            },
        ];
    }, [intakePayload, workspace.booking_services, workspace.bookingServices]);

    const [servicesList, setServicesList] = useState<any[]>(defaultServices);
    const [notificationEmail, setNotificationEmail] = useState<string>(
        intakePayload?.notification_email || workspace.booking_notification_email || workspace.user?.email || ''
    );
    const [autoInjectCta, setAutoInjectCta] = useState<boolean>(true);

    const handleAddService = () => {
        setServicesList((prev) => [
            ...prev,
            {
                name: '',
                description: '',
                duration_minutes: 30,
                price: 50.00,
                currency: 'USD',
            },
        ]);
    };

    const handleUpdateService = (idx: number, field: string, value: any) => {
        setServicesList((prev) => {
            const next = [...prev];
            next[idx] = { ...next[idx], [field]: value };
            return next;
        });
    };

    const handleRemoveService = (idx: number) => {
        setServicesList((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleToggleBooking = () => {
        setTogglingBooking(true);
        router.patch(`/admin/projects/${workspace.id}/booking/toggle`, {}, {
            onFinish: () => setTogglingBooking(false),
        });
    };

    const handleInitializeBooking = () => {
        if (confirm('Initialize and enable the booking system with these services?')) {
            setInitializingBooking(true);
            router.post(`/admin/projects/${workspace.id}/booking/initialize`, {
                services: servicesList,
                notification_email: notificationEmail,
                auto_inject_cta: autoInjectCta,
            }, {
                onFinish: () => setInitializingBooking(false),
            });
        }
    };

    const handleSaveServices = () => {
        setUpdatingServices(true);
        router.put(`/admin/projects/${workspace.id}/booking/services`, {
            services: servicesList,
            notification_email: notificationEmail,
        }, {
            onFinish: () => setUpdatingServices(false),
        });
    };

    const handleInjectCta = () => {
        setActionLoading(true);
        router.post(`/admin/projects/${workspace.id}/booking/inject-cta`, {}, {
            onFinish: () => setActionLoading(false),
        });
    };

    const handleRemoveCta = () => {
        if (confirm('Remove the booking CTA from this project website code?')) {
            setActionLoading(true);
            router.post(`/admin/projects/${workspace.id}/booking/remove-cta`, {}, {
                onFinish: () => setActionLoading(false),
            });
        }
    };

    const handleRotateKey = () => {
        if (confirm('Rotate the dedicated booking key for this project? Any old links will be invalidated.')) {
            setActionLoading(true);
            router.post(`/admin/projects/${workspace.id}/booking/rotate-token`, {}, {
                onFinish: () => setActionLoading(false),
            });
        }
    };

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const entryUrl = workspace.booking_public_token ? `${origin}/book/entry/${workspace.booking_public_token}` : '';
    const embedSnippet = `<a href="${entryUrl}" class="ss-booking-cta-btn" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;padding:10px 18px;background-color:#10b981;color:#ffffff;font-size:14px;font-weight:600;border-radius:8px;text-decoration:none;">Book Now</a>`;

    const { data, setData, put, processing, errors } = useForm({
        status: workspace.status || 'pending',
        generated_prompt: workspace.generated_prompt || '',
        project_url: workspace.project_url || '',
        html_content: workspace.html_content || '',
    });

    const handleSaveHtml = () => {
        setSavingHtml(true);
        router.put(`/admin/projects/${workspace.id}`, {
            status: data.status,
            generated_prompt: data.generated_prompt,
            project_url: data.project_url,
            html_content: data.html_content,
        }, {
            onFinish: () => {
                setSavingHtml(false);
                setIframeKey((k) => k + 1);
            },
        });
    };

    const handleInsertCtaIntoEditor = () => {
        if (!data.html_content) return;
        const snippet = `\n<!-- SS-BOOKING-CTA-START -->\n${embedSnippet}\n<!-- SS-BOOKING-CTA-END -->\n`;
        let updated = data.html_content;
        if (updated.includes('<!-- SS-BOOKING-CTA-START -->')) {
            updated = updated.replace(/<!-- SS-BOOKING-CTA-START -->[\s\S]*?<!-- SS-BOOKING-CTA-END -->/, snippet.trim());
        } else if (updated.toLowerCase().includes('</nav>')) {
            updated = updated.replace(/<\/nav>/i, `${snippet}</nav>`);
        } else if (updated.toLowerCase().includes('</header>')) {
            updated = updated.replace(/<\/header>/i, `${snippet}</header>`);
        } else if (updated.toLowerCase().includes('</body>')) {
            updated = updated.replace(/<\/body>/i, `${snippet}</body>`);
        } else {
            updated += snippet;
        }
        setData('html_content', updated);
    };

    setLayoutProps({
        breadcrumbs: [
            { title: 'Dashboard', href: '/admin/projects' },
            { title: 'Client Requests', href: '/admin/projects' },
            { title: `Review: ${workspace.project_name || 'Project'}`, href: '#' },
        ],
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(`/admin/projects/${workspace.id}`);
    };

    const assetsList = workspace.project_assets || workspace.projectAssets || [];
    const isDeployed = workspace.deployment_status === 'deployed' || workspace.status === 'completed';

    // Parse preferences
    const parsedSpecs = useMemo(() => {
        const specs: Record<string, string> = {
            description: '',
            content: '',
            layout: '',
            colorPalette: '',
            typography: '',
        };

        if (Array.isArray(workspace.preferences)) {
            workspace.preferences.forEach((pref) => {
                const colonIdx = pref.indexOf(':');
                if (colonIdx !== -1) {
                    const key = pref.substring(0, colonIdx).trim().toLowerCase();
                    const val = pref.substring(colonIdx + 1).trim();
                    if (key.includes('description') || key.includes('industry')) {
                        specs.description = val;
                    } else if (key.includes('content') || key.includes('section')) {
                        specs.content = val;
                    } else if (key.includes('layout')) {
                        specs.layout = val;
                    } else if (key.includes('color') || key.includes('palette')) {
                        specs.colorPalette = val;
                    } else if (key.includes('typography') || key.includes('font')) {
                        specs.typography = val;
                    }
                }
            });
        }
        return specs;
    }, [workspace.preferences]);

    const contentSections = useMemo(() => {
        if (!parsedSpecs.content) return [];
        return parsedSpecs.content.split(',').map((s) => s.trim()).filter(Boolean);
    }, [parsedSpecs.content]);

    const handleCopyPrompt = () => {
        if (!data.generated_prompt) return;
        navigator.clipboard.writeText(data.generated_prompt);
        setCopiedPrompt(true);
        setTimeout(() => setCopiedPrompt(false), 2000);
    };

    return (
        <>
            <Head title={`Review Request - ${workspace.project_name} | Admin`} />

            <div className="flex flex-col flex-1 h-full min-h-screen bg-background text-foreground">
                <div className="w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 mx-auto flex flex-col gap-6">

                    {/* Top Admin Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
                        <div className="flex items-start sm:items-center gap-4">
                            <Link
                                href="/admin/workspaces"
                                className="shrink-0 flex items-center justify-center w-10 h-10 transition-colors bg-card border rounded-full shadow-xs text-muted-foreground hover:text-foreground hover:bg-muted border-border"
                                title="Back to requests"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </Link>

                            <div>
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                        Review: {workspace.project_name || 'Untitled Project'}
                                    </h1>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                        data.status === 'completed'
                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                                            : data.status === 'in_progress'
                                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300'
                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                                    }`}>
                                        {data.status.toUpperCase()}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                                    {workspace.user && (
                                        <span className="inline-flex items-center">
                                            <User className="w-3.5 h-3.5 mr-1 opacity-70" />
                                            Client: <strong className="ml-1 text-foreground">{workspace.user.name}</strong> ({workspace.user.email})
                                        </span>
                                    )}
                                    <span>•</span>
                                    <span className="inline-flex items-center">
                                        <Calendar className="w-3.5 h-3.5 mr-1 opacity-70" />
                                        Requested on {new Date(workspace.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Split View: 2 Columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* LEFT COLUMN: Client Specs & Interactive Live Preview (2 cols) */}
                        <div className="lg:col-span-2 flex flex-col gap-4">
                            {/* Tabs Switcher */}
                            <div className="flex items-center justify-between border-b border-border pb-2">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setActiveTab('preview')}
                                        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                                            activeTab === 'preview'
                                                ? 'bg-primary text-primary-foreground shadow-xs'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                        }`}
                                    >
                                        <MonitorSmartphone className="w-3.5 h-3.5" />
                                        Interactive Preview
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('code')}
                                        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                                            activeTab === 'code'
                                                ? 'bg-primary text-primary-foreground shadow-xs'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                        }`}
                                    >
                                        <Code className="w-3.5 h-3.5" />
                                        Website Code
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('specs')}
                                        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                                            activeTab === 'specs'
                                                ? 'bg-primary text-primary-foreground shadow-xs'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                        }`}
                                    >
                                        <Palette className="w-3.5 h-3.5" />
                                        Client Specifications
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('assets')}
                                        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                                            activeTab === 'assets'
                                                ? 'bg-primary text-primary-foreground shadow-xs'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                        }`}
                                    >
                                        <ImageIcon className="w-3.5 h-3.5" />
                                        Assets ({assetsList.length})
                                    </button>
                                </div>

                                {activeTab === 'preview' && (
                                    <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg">
                                        <button
                                            onClick={() => setDeviceMode('desktop')}
                                            className={`p-1.5 rounded text-xs transition-all ${
                                                deviceMode === 'desktop' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
                                            }`}
                                            title="Desktop View"
                                        >
                                            <Laptop className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => setDeviceMode('mobile')}
                                            className={`p-1.5 rounded text-xs transition-all ${
                                                deviceMode === 'mobile' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
                                            }`}
                                            title="Mobile View"
                                        >
                                            <Smartphone className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => setIframeKey((k) => k + 1)}
                                            className="p-1.5 rounded text-xs text-muted-foreground hover:text-foreground"
                                            title="Reload"
                                        >
                                            <RotateCw className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Tab 1: Preview */}
                            {activeTab === 'preview' && (
                                <div className="bg-zinc-100 dark:bg-zinc-900/60 p-4 rounded-xl border border-border flex items-center justify-center min-h-[600px] overflow-hidden">
                                    {workspace.html_content ? (
                                        <div
                                            className={`transition-all duration-300 ${
                                                deviceMode === 'desktop'
                                                    ? 'w-full h-[640px] rounded-lg border border-border shadow-md overflow-hidden bg-white'
                                                    : 'w-[375px] h-[640px] rounded-[36px] border-[8px] border-zinc-900 shadow-xl overflow-hidden bg-white relative'
                                            }`}
                                        >
                                            <iframe
                                                key={iframeKey}
                                                srcDoc={workspace.html_content}
                                                title="Admin Preview"
                                                className="w-full h-full border-0 bg-white"
                                                sandbox="allow-scripts allow-same-origin allow-forms"
                                            />
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 text-muted-foreground">
                                            <FileCode className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                            <p className="text-sm font-medium">No HTML generated yet</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Review the prompt below or trigger AI generation.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tab: Website Code Editor */}
                            {activeTab === 'code' && (
                                <div className="p-4 bg-card rounded-xl border border-border shadow-xs space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-bold text-foreground">
                                                    Live Website HTML Code
                                                </h3>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                                    hasBookingCta
                                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                                                        : 'bg-muted border-border text-muted-foreground'
                                                }`}>
                                                    {hasBookingCta ? 'Booking CTA Injected' : 'No Booking CTA in Code'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Edit website HTML directly or insert the booking link CTA into the page markup.
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={handleInsertCtaIntoEditor}
                                                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors flex items-center gap-1.5"
                                                title="Insert or update booking CTA inside HTML"
                                            >
                                                <Code className="w-3.5 h-3.5" />
                                                <span>Insert Booking CTA</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(embedSnippet);
                                                    setCopiedSnippet(true);
                                                    setTimeout(() => setCopiedSnippet(false), 2000);
                                                }}
                                                className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors flex items-center gap-1"
                                                title="Copy embed snippet"
                                            >
                                                {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                <span>{copiedSnippet ? 'Copied' : 'Copy CTA'}</span>
                                            </button>
                                            <button
                                                type="button"
                                                disabled={savingHtml}
                                                onClick={handleSaveHtml}
                                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs transition-colors flex items-center gap-1.5"
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                <span>{savingHtml ? 'Saving...' : 'Save Website HTML'}</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <textarea
                                            value={data.html_content}
                                            onChange={(e) => setData('html_content', e.target.value)}
                                            rows={24}
                                            className="w-full font-mono text-xs p-4 bg-zinc-950 text-zinc-100 dark:bg-zinc-950 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 leading-relaxed resize-y select-text"
                                            placeholder="<!DOCTYPE html><html>...</html>"
                                            spellCheck={false}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Tab 2: Specs */}
                            {activeTab === 'specs' && (
                                <div className="p-6 bg-card rounded-xl border border-border shadow-xs space-y-4">
                                    <div>
                                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                            Target Description
                                        </div>
                                        <div className="text-base font-medium text-foreground">
                                            {parsedSpecs.description || 'Not specified'}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                            Color Palette Preference
                                        </div>
                                        <div className="text-sm font-medium text-foreground">
                                            {parsedSpecs.colorPalette || 'Standard'}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                            Typography Style
                                        </div>
                                        <div className="text-sm font-medium text-foreground">
                                            {parsedSpecs.typography || 'Standard'}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                            Requested Sections
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {contentSections.map((s, i) => (
                                                <span key={i} className="px-2.5 py-1 text-xs font-medium rounded-md bg-muted text-foreground">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab 3: Assets */}
                            {activeTab === 'assets' && (
                                <div className="p-6 bg-card rounded-xl border border-border shadow-xs">
                                    {assetsList.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {assetsList.map((a) => (
                                                <div key={a.id} className="p-2 bg-background rounded-lg border border-border text-xs">
                                                    {a.url && (
                                                        <img src={a.url} alt={a.name} className="w-full aspect-video object-cover rounded mb-2" />
                                                    )}
                                                    <div className="font-medium truncate">{a.name}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground italic text-center py-8">
                                            No assets uploaded by the client.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN: Admin Controls & Management Form (1 col) */}
                        <div className="flex flex-col gap-6">
                            <form onSubmit={submit} className="bg-card rounded-xl border border-border shadow-xs p-6 space-y-5">
                                <h2 className="text-base font-semibold text-foreground pb-2 border-b border-border">
                                    Manage Project Request
                                </h2>

                                {/* Status */}
                                <div>
                                    <label htmlFor="status" className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                                        Workflow Status
                                    </label>
                                    <select
                                        id="status"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                    {errors.status && <div className="text-red-500 text-xs mt-1">{errors.status}</div>}
                                </div>

                                {/* Project URL */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label htmlFor="project_url" className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Deployed Project URL
                                        </label>
                                        {data.project_url && (
                                            <a
                                                href={data.project_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-primary hover:underline flex items-center gap-0.5"
                                            >
                                                Test URL <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>
                                    <input
                                        id="project_url"
                                        type="url"
                                        value={data.project_url}
                                        onChange={(e) => setData('project_url', e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                                        placeholder="https://client-project.vercel.app"
                                    />
                                    {errors.project_url && <div className="text-red-500 text-xs mt-1">{errors.project_url}</div>}
                                </div>

                                {/* Generated Prompt */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label htmlFor="generated_prompt" className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            AI Generated Prompt Spec
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleCopyPrompt}
                                            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                                        >
                                            {copiedPrompt ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                            {copiedPrompt ? 'Copied' : 'Copy'}
                                        </button>
                                    </div>
                                    <textarea
                                        id="generated_prompt"
                                        value={data.generated_prompt}
                                        onChange={(e) => setData('generated_prompt', e.target.value)}
                                        rows={8}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono leading-relaxed"
                                        placeholder="Structured AI prompt will appear here..."
                                    />
                                    {errors.generated_prompt && <div className="text-red-500 text-xs mt-1">{errors.generated_prompt}</div>}
                                </div>

                                {/* Submit Button */}
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-50"
                                    >
                                        {processing ? 'Saving Changes...' : 'Save & Update Request'}
                                    </button>
                                </div>
                            </form>

                            {/* Contact Emailer Card */}
                            <div className="bg-card rounded-xl border border-border shadow-xs p-5 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                                        <Mail className="w-4 h-4 text-primary" />
                                        <span>Contact Emailer</span>
                                    </div>
                                    {workspace.contact_emailer ? (
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                            workspace.contact_emailer.is_active
                                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                                                : 'bg-muted text-muted-foreground border border-border'
                                        }`}>
                                            {workspace.contact_emailer.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                                            Not Configured
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {workspace.contact_emailer
                                        ? `Forwarding to ${workspace.contact_emailer.recipient_email} (${workspace.contact_emailer.messages_count ?? 0} messages received).`
                                        : 'Configure email forwarding for this project, inject the contact script, and deploy.'}
                                </p>
                                <Link
                                    href={`/admin/projects/${workspace.id}/emailer`}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 shadow-xs"
                                >
                                    <Mail className="w-4 h-4" />
                                    {workspace.contact_emailer ? 'Manage & Deploy Emailer' : 'Configure Emailer'}
                                </Link>
                            </div>

                            {/* Booking Feature Admin Panel */}
                            <div className="bg-card rounded-xl border border-border shadow-xs p-5 space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-border">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        <h3 className="font-semibold text-foreground text-xs uppercase tracking-wider">
                                            Booking System Feature
                                        </h3>
                                    </div>
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                            workspace.booking_enabled
                                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                : 'bg-muted border-border text-muted-foreground'
                                        }`}
                                    >
                                        {workspace.booking_enabled ? 'Active' : 'Disabled'}
                                    </span>
                                </div>

                                {/* Pending Request Banner with Service Customization */}
                                {pendingBookingReq && (
                                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-amber-500">
                                                <AlertCircle className="w-4 h-4" />
                                                <span>Review & Finalize Booking Request</span>
                                            </div>
                                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-500">
                                                Pending Review
                                            </span>
                                        </div>

                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Review and customize the client's requested booking services, notification email, and code injection options before approving.
                                        </p>

                                        {/* Notification Email Field */}
                                        <div>
                                            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                                Alert / Notification Email
                                            </label>
                                            <input
                                                type="email"
                                                value={notificationEmail}
                                                onChange={(e) => setNotificationEmail(e.target.value)}
                                                placeholder="alerts@clientdomain.com"
                                                className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                                            />
                                        </div>

                                        {/* Services Configuration Table/Editor */}
                                        <div className="space-y-2 pt-1 border-t border-amber-500/20">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
                                                    Services to Initialize ({servicesList.length})
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={handleAddService}
                                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                    <span>Add Service</span>
                                                </button>
                                            </div>

                                            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                                {servicesList.map((svc: any, idx: number) => (
                                                    <div
                                                        key={idx}
                                                        className="p-2.5 rounded-lg bg-background border border-border space-y-2 text-xs"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="text"
                                                                value={svc.name}
                                                                onChange={(e) => handleUpdateService(idx, 'name', e.target.value)}
                                                                placeholder="Service Name (e.g. 60m Massage)"
                                                                className="flex-1 px-2 py-1 bg-muted/40 border border-border rounded text-xs text-foreground font-medium"
                                                            />
                                                            {servicesList.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveService(idx)}
                                                                    className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                                                                    title="Remove Service"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <span className="text-[10px] text-muted-foreground block mb-0.5">Duration (mins)</span>
                                                                <input
                                                                    type="number"
                                                                    min={5}
                                                                    max={480}
                                                                    step={5}
                                                                    value={svc.duration_minutes}
                                                                    onChange={(e) => handleUpdateService(idx, 'duration_minutes', Number(e.target.value))}
                                                                    className="w-full px-2 py-1 bg-muted/40 border border-border rounded text-xs text-foreground"
                                                                />
                                                            </div>
                                                            <div>
                                                                <span className="text-[10px] text-muted-foreground block mb-0.5">Price ($)</span>
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    step={0.01}
                                                                    value={svc.price}
                                                                    onChange={(e) => handleUpdateService(idx, 'price', Number(e.target.value))}
                                                                    className="w-full px-2 py-1 bg-muted/40 border border-border rounded text-xs text-foreground"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <input
                                                                type="text"
                                                                value={svc.description || ''}
                                                                onChange={(e) => handleUpdateService(idx, 'description', e.target.value)}
                                                                placeholder="Optional service details / description..."
                                                                className="w-full px-2 py-1 bg-muted/40 border border-border rounded text-[11px] text-muted-foreground"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Auto Code Injection Checkbox */}
                                        <div className="pt-2 border-t border-amber-500/20">
                                            <label className="flex items-start gap-2 cursor-pointer text-xs">
                                                <input
                                                    type="checkbox"
                                                    checked={autoInjectCta}
                                                    onChange={(e) => setAutoInjectCta(e.target.checked)}
                                                    className="mt-0.5 rounded border-border text-primary focus:ring-primary/50"
                                                />
                                                <span className="text-foreground">
                                                    Automatically inject <strong>"Book Now" CTA link</strong> into project website HTML code
                                                </span>
                                            </label>
                                        </div>

                                        {/* Approve Button */}
                                        <button
                                            type="button"
                                            disabled={initializingBooking}
                                            onClick={handleInitializeBooking}
                                            className="w-full py-2.5 px-3 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors flex items-center justify-center gap-2"
                                        >
                                            <ShieldCheck className="w-4 h-4" />
                                            <span>{initializingBooking ? 'Approving & Initializing...' : 'Approve & Initialize Booking'}</span>
                                        </button>
                                    </div>
                                )}

                                {/* Admin Direct Booking Setup (when no pending request exists) */}
                                {!workspace.booking_enabled && !pendingBookingReq && (
                                    <div className="p-4 rounded-xl bg-card border border-border space-y-4 text-xs">
                                        <div>
                                            <div className="flex items-center gap-2 font-semibold text-foreground text-xs">
                                                <Calendar className="w-4 h-4 text-primary" />
                                                <span>Initialize Booking Feature</span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground mt-1">
                                                Configure initial service tiers and enable appointment booking directly for this project.
                                            </p>
                                        </div>

                                        {/* Notification Email Field */}
                                        <div>
                                            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                                Alert / Notification Email
                                            </label>
                                            <input
                                                type="email"
                                                value={notificationEmail}
                                                onChange={(e) => setNotificationEmail(e.target.value)}
                                                placeholder="alerts@clientdomain.com"
                                                className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                                            />
                                        </div>

                                        {/* Services Configuration Table/Editor */}
                                        <div className="space-y-2 pt-1 border-t border-border">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
                                                    Initial Services ({servicesList.length})
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={handleAddService}
                                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                    <span>Add Service</span>
                                                </button>
                                            </div>

                                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                                {servicesList.map((svc: any, idx: number) => (
                                                    <div
                                                        key={idx}
                                                        className="p-2.5 rounded-lg bg-muted/30 border border-border space-y-2 text-xs"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="text"
                                                                value={svc.name}
                                                                onChange={(e) => handleUpdateService(idx, 'name', e.target.value)}
                                                                placeholder="Service Name"
                                                                className="flex-1 px-2 py-1 bg-background border border-border rounded text-xs text-foreground font-medium"
                                                            />
                                                            {servicesList.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveService(idx)}
                                                                    className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                                                                    title="Remove Service"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <span className="text-[10px] text-muted-foreground block mb-0.5">Duration (mins)</span>
                                                                <input
                                                                    type="number"
                                                                    min={5}
                                                                    max={480}
                                                                    step={5}
                                                                    value={svc.duration_minutes}
                                                                    onChange={(e) => handleUpdateService(idx, 'duration_minutes', Number(e.target.value))}
                                                                    className="w-full px-2 py-1 bg-background border border-border rounded text-xs text-foreground"
                                                                />
                                                            </div>
                                                            <div>
                                                                <span className="text-[10px] text-muted-foreground block mb-0.5">Price ($)</span>
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    step={0.01}
                                                                    value={svc.price}
                                                                    onChange={(e) => handleUpdateService(idx, 'price', Number(e.target.value))}
                                                                    className="w-full px-2 py-1 bg-background border border-border rounded text-xs text-foreground"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <input
                                                                type="text"
                                                                value={svc.description || ''}
                                                                onChange={(e) => handleUpdateService(idx, 'description', e.target.value)}
                                                                placeholder="Optional service details / description..."
                                                                className="w-full px-2 py-1 bg-background border border-border rounded text-[11px] text-muted-foreground"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Auto Code Injection Checkbox */}
                                        <div className="pt-2 border-t border-border">
                                            <label className="flex items-start gap-2 cursor-pointer text-xs">
                                                <input
                                                    type="checkbox"
                                                    checked={autoInjectCta}
                                                    onChange={(e) => setAutoInjectCta(e.target.checked)}
                                                    className="mt-0.5 rounded border-border text-primary focus:ring-primary/50"
                                                />
                                                <span className="text-foreground">
                                                    Automatically inject <strong>"Book Now" CTA link</strong> into website code
                                                </span>
                                            </label>
                                        </div>

                                        {/* Initialize Button */}
                                        <button
                                            type="button"
                                            disabled={initializingBooking}
                                            onClick={handleInitializeBooking}
                                            className="w-full py-2.5 px-3 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Calendar className="w-4 h-4" />
                                            <span>{initializingBooking ? 'Initializing Booking...' : 'Initialize Booking System'}</span>
                                        </button>
                                    </div>
                                )}

                                {/* Active Booking Feature Controls */}
                                {workspace.booking_enabled && workspace.booking_public_token && (
                                    <div className="space-y-4 pt-2">
                                        {/* Website Code Injection Section */}
                                        <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-3 text-xs">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-foreground flex items-center gap-1.5">
                                                    <Code className="w-3.5 h-3.5 text-primary" />
                                                    Website Code Injection
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                                    hasBookingCta
                                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                                                        : 'bg-muted border-border text-muted-foreground'
                                                }`}>
                                                    {hasBookingCta ? 'Injected in HTML' : 'Not Injected'}
                                                </span>
                                            </div>

                                            <p className="text-[11px] text-muted-foreground">
                                                {hasBookingCta
                                                    ? 'Booking CTA button is active inside project HTML code. Guests can click it to schedule appointments.'
                                                    : 'CTA is not currently in the website code. Inject it automatically or copy embed code below.'}
                                            </p>

                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    disabled={actionLoading}
                                                    onClick={handleInjectCta}
                                                    className="flex-1 py-1.5 px-2.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs transition-colors text-center"
                                                >
                                                    {hasBookingCta ? 'Update Code CTA' : 'Inject Booking CTA'}
                                                </button>
                                                {hasBookingCta && (
                                                    <button
                                                        type="button"
                                                        disabled={actionLoading}
                                                        onClick={handleRemoveCta}
                                                        className="py-1.5 px-2.5 text-xs font-medium rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 transition-colors"
                                                    >
                                                        Remove CTA
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(embedSnippet);
                                                        setCopiedSnippet(true);
                                                        setTimeout(() => setCopiedSnippet(false), 2000);
                                                    }}
                                                    className="py-1.5 px-2.5 text-xs font-medium rounded-lg bg-background border border-border hover:bg-muted text-foreground transition-colors flex items-center gap-1"
                                                    title="Copy HTML snippet for manual embedding"
                                                >
                                                    {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                    <span>{copiedSnippet ? 'Copied' : 'Copy HTML'}</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Dedicated Key & Dynamic Portal Link */}
                                        <div className="space-y-2 text-xs">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-foreground flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                                                    <Key className="w-3.5 h-3.5 text-primary" />
                                                    Dynamic Portal Link & Security
                                                </span>
                                                <button
                                                    type="button"
                                                    disabled={actionLoading}
                                                    onClick={handleRotateKey}
                                                    className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                                                >
                                                    <RefreshCw className="w-3.5 h-3.5" />
                                                    <span>Rotate Key</span>
                                                </button>
                                            </div>

                                            {/* Entry URL that creates fresh expiring tokens */}
                                            <div className="space-y-1">
                                                <div className="text-[10px] text-muted-foreground">Dynamic Visitor Entry URL:</div>
                                                <div className="flex items-center gap-1.5">
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={entryUrl}
                                                        className="flex-1 px-2.5 py-1.5 text-xs bg-muted/60 border border-border rounded-lg text-foreground font-mono select-all truncate"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(entryUrl);
                                                            setCopiedEntry(true);
                                                            setTimeout(() => setCopiedEntry(false), 2000);
                                                        }}
                                                        className="p-1.5 text-xs rounded-lg bg-muted border border-border hover:text-foreground text-muted-foreground transition-colors"
                                                        title="Copy Dynamic Entry URL"
                                                    >
                                                        {copiedEntry ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                    </button>
                                                    <a
                                                        href={entryUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="p-1.5 text-xs rounded-lg bg-muted border border-border hover:text-foreground text-muted-foreground transition-colors"
                                                        title="Test Dynamic Booking Entry"
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </a>
                                                </div>
                                            </div>

                                            {/* Dedicated Master Key */}
                                            <div className="space-y-1 pt-1">
                                                <div className="text-[10px] text-muted-foreground">Dedicated Project Key:</div>
                                                <div className="flex items-center gap-1.5">
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={workspace.booking_public_token}
                                                        className="flex-1 px-2.5 py-1.5 text-xs bg-muted/40 border border-border rounded-lg text-muted-foreground font-mono select-all truncate text-[11px]"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(workspace.booking_public_token || '');
                                                            setCopiedUrl(true);
                                                            setTimeout(() => setCopiedUrl(false), 2000);
                                                        }}
                                                        className="p-1.5 text-xs rounded-lg bg-muted border border-border hover:text-foreground text-muted-foreground transition-colors"
                                                        title="Copy Master Key"
                                                    >
                                                        {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Configured Services & Management */}
                                        <div className="p-3.5 rounded-xl bg-card border border-border space-y-3 text-xs">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-foreground text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-primary" />
                                                    Manage Services ({servicesList.length})
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={handleAddService}
                                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                    <span>Add Service</span>
                                                </button>
                                            </div>

                                            {/* Notification Email */}
                                            <div>
                                                <span className="text-[10px] text-muted-foreground block mb-0.5 font-medium">Notification Email:</span>
                                                <input
                                                    type="email"
                                                    value={notificationEmail}
                                                    onChange={(e) => setNotificationEmail(e.target.value)}
                                                    className="w-full px-2 py-1 text-xs bg-background border border-border rounded text-foreground font-mono"
                                                    placeholder="support@client.com"
                                                />
                                            </div>

                                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                                {servicesList.map((svc: any, idx: number) => (
                                                    <div key={idx} className="p-2.5 rounded-lg bg-muted/30 border border-border space-y-1.5">
                                                        <div className="flex items-center gap-1.5">
                                                            <input
                                                                type="text"
                                                                value={svc.name}
                                                                onChange={(e) => handleUpdateService(idx, 'name', e.target.value)}
                                                                placeholder="Service name"
                                                                className="flex-1 px-2 py-1 bg-background border border-border rounded text-xs text-foreground font-semibold"
                                                            />
                                                            {servicesList.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveService(idx)}
                                                                    className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-muted"
                                                                    title="Remove"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <span className="text-[10px] text-muted-foreground block">Duration (min)</span>
                                                                <input
                                                                    type="number"
                                                                    min={5}
                                                                    max={480}
                                                                    step={5}
                                                                    value={svc.duration_minutes}
                                                                    onChange={(e) => handleUpdateService(idx, 'duration_minutes', Number(e.target.value))}
                                                                    className="w-full px-2 py-0.5 bg-background border border-border rounded text-xs text-foreground"
                                                                />
                                                            </div>
                                                            <div>
                                                                <span className="text-[10px] text-muted-foreground block">Price ($)</span>
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    step={0.01}
                                                                    value={svc.price}
                                                                    onChange={(e) => handleUpdateService(idx, 'price', Number(e.target.value))}
                                                                    className="w-full px-2 py-0.5 bg-background border border-border rounded text-xs text-foreground"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <button
                                                type="button"
                                                disabled={updatingServices}
                                                onClick={handleSaveServices}
                                                className="w-full py-1.5 px-3 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs transition-colors flex items-center justify-center gap-1.5"
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                <span>{updatingServices ? 'Saving Services...' : 'Save Services & Settings'}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Toggle Feature Button */}
                                <div>
                                    <button
                                        type="button"
                                        disabled={togglingBooking}
                                        onClick={handleToggleBooking}
                                        className={`w-full py-2 px-3 text-xs font-semibold rounded-lg border transition-colors ${
                                            workspace.booking_enabled
                                                ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
                                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                                        }`}
                                    >
                                        {togglingBooking
                                            ? 'Updating Status...'
                                            : workspace.booking_enabled
                                            ? 'Revoke / Disable Booking System'
                                            : 'Enable Booking System'}
                                    </button>
                                </div>
                            </div>

                            {/* Audit Metadata Card */}
                            <div className="bg-card rounded-xl border border-border shadow-xs p-5 space-y-2 text-xs text-muted-foreground">
                                <h3 className="font-semibold text-foreground uppercase tracking-wider text-[11px] mb-2">
                                    Audit & Reference
                                </h3>
                                <div className="flex justify-between">
                                    <span>Project ID:</span>
                                    <span className="font-mono text-foreground">{workspace.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Workspace:</span>
                                    <span className="text-foreground">{workspace.workspace?.name || 'Default'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Vercel Project:</span>
                                    <span className="font-mono text-foreground">{workspace.vercel_project_name || 'None'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Last Updated:</span>
                                    <span className="text-foreground">{new Date(workspace.updated_at).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}
