import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, setLayoutProps, router } from '@inertiajs/react';
import {
    ChevronLeft,
    Mail,
    Send,
    RotateCw,
    Laptop,
    Smartphone,
    Check,
    Copy,
    Power,
    Rocket,
    AlertTriangle,
    CheckCircle2,
    Globe,
    User,
    Code2,
    ExternalLink,
    Loader2,
    FlaskConical,
    Sparkles,
    ShieldAlert,
    Inbox,
} from 'lucide-react';

interface ProjectInfo {
    id: number;
    project_name: string;
    html_content?: string | null;
    status?: string | null;
    deployment_status?: string | null;
    project_url?: string | null;
    vercel_project_name?: string | null;
    is_deployed: boolean;
    user?: {
        id: number;
        name: string;
        email: string;
    } | null;
    workspace?: {
        id: number;
        name: string;
    } | null;
}

interface EmailerInfo {
    id: number;
    recipient_email: string;
    reply_name: string;
    public_token: string;
    is_active: boolean;
    messages_count: number;
    created_at?: string | null;
}

interface Props {
    project: ProjectInfo;
    emailer: EmailerInfo | null;
}

export default function AdminEmailerShow({ project, emailer }: Props) {
    const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
    const [iframeKey, setIframeKey] = useState<number>(0);
    const [copiedToken, setCopiedToken] = useState<boolean>(false);
    const [copiedEndpoint, setCopiedEndpoint] = useState<boolean>(false);
    const [isDeploying, setIsDeploying] = useState<boolean>(false);
    const [isTesting, setIsTesting] = useState<boolean>(false);
    const [testFeedback, setTestFeedback] = useState<{ success: boolean; message: string } | null>(null);
    const [liveIframeNotification, setLiveIframeNotification] = useState<string | null>(null);

    setLayoutProps({
        breadcrumbs: [
            { title: 'Dashboard', href: '/admin/projects' },
            { title: project.project_name, href: `/admin/projects/${project.id}` },
            { title: 'Contact Emailer Config', href: '#' },
        ],
    });

    // Form for creating or updating emailer
    const form = useForm({
        recipient_email: emailer?.recipient_email ?? project.user?.email ?? '',
        reply_name: emailer?.reply_name ?? project.user?.name ?? project.project_name ?? '',
    });

    const isConfigured = Boolean(emailer);
    const endpointUrl = emailer ? `${window.location.origin}/api/contact/${emailer.public_token}` : '';

    // Listen for live form submissions inside the preview iframe
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'SS_CONTACT_SUBMITTED') {
                setLiveIframeNotification('🎉 Test inquiry submitted from preview! The message was processed and recorded.');
                router.reload({ only: ['emailer'] });
                setTimeout(() => setLiveIframeNotification(null), 8000);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (isConfigured) {
            form.patch(`/admin/projects/${project.id}/emailer`, {
                preserveScroll: true,
                onSuccess: () => setIframeKey((prev) => prev + 1),
            });
        } else {
            form.post(`/admin/projects/${project.id}/emailer`, {
                preserveScroll: true,
                onSuccess: () => setIframeKey((prev) => prev + 1),
            });
        }
    };

    const handleToggle = () => {
        router.patch(`/admin/projects/${project.id}/emailer/toggle`, {}, {
            preserveScroll: true,
            onSuccess: () => setIframeKey((prev) => prev + 1),
        });
    };

    const handleDeploy = () => {
        setIsDeploying(true);
        router.post(`/admin/projects/${project.id}/emailer/deploy`, {}, {
            preserveScroll: true,
            onFinish: () => setIsDeploying(false),
        });
    };

    const handleSendTestMessage = async () => {
        if (!isConfigured) return;
        setIsTesting(true);
        setTestFeedback(null);

        try {
            const response = await fetch(`/admin/projects/${project.id}/emailer/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setTestFeedback({
                    success: true,
                    message: data.message || 'Test message queued and saved to database successfully!',
                });
                router.reload({ only: ['emailer'] });
            } else {
                setTestFeedback({
                    success: false,
                    message: data.message || 'Failed to send test message. Check your logs.',
                });
            }
        } catch (err: any) {
            setTestFeedback({
                success: false,
                message: err.message || 'Network error occurred while testing.',
            });
        } finally {
            setIsTesting(false);
        }
    };

    const handleCopy = (text: string, type: 'token' | 'endpoint') => {
        navigator.clipboard.writeText(text);
        if (type === 'token') {
            setCopiedToken(true);
            setTimeout(() => setCopiedToken(false), 2000);
        } else {
            setCopiedEndpoint(true);
            setTimeout(() => setCopiedEndpoint(false), 2000);
        }
    };

    // Inspect project HTML for contact form
    const hasForm = project.html_content ? /<form[\s>]/i.test(project.html_content) : false;
    const hasEmailField = project.html_content ? /(type="email"|name="email"|id="[^"]*email[^"]*")/i.test(project.html_content) : false;

    return (
        <>
            <Head title={`Emailer Setup - ${project.project_name} | Admin`} />

            <div className="flex flex-col flex-1 h-full min-h-screen bg-background text-foreground">
                <div className="w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 mx-auto flex flex-col gap-6">

                    {/* Top Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
                        <div className="flex items-start sm:items-center gap-4">
                            <Link
                                href={`/admin/projects/${project.id}`}
                                className="shrink-0 flex items-center justify-center w-10 h-10 transition-colors bg-card border rounded-full shadow-xs text-muted-foreground hover:text-foreground hover:bg-muted border-border"
                                title="Back to Project"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </Link>

                            <div>
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                        Emailer Config: {project.project_name}
                                    </h1>
                                    {isConfigured ? (
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                            emailer?.is_active
                                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                                : 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border border-zinc-500/30'
                                        }`}>
                                            {emailer?.is_active ? 'ACTIVE' : 'PAUSED / INACTIVE'}
                                        </span>
                                    ) : (
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                            NOT CONFIGURED
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                                    {project.user && (
                                        <span className="inline-flex items-center">
                                            <User className="w-3.5 h-3.5 mr-1 opacity-70" />
                                            Client: <strong className="ml-1 text-foreground">{project.user.name}</strong> ({project.user.email})
                                        </span>
                                    )}
                                    {project.workspace && (
                                        <>
                                            <span>•</span>
                                            <span className="inline-flex items-center">
                                                <Globe className="w-3.5 h-3.5 mr-1 opacity-70" />
                                                Workspace: {project.workspace.name}
                                            </span>
                                        </>
                                    )}
                                    {project.project_url && (
                                        <>
                                            <span>•</span>
                                            <a
                                                href={project.project_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-primary hover:underline font-medium"
                                            >
                                                Live Site <ExternalLink className="w-3 h-3 ml-1" />
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step-by-Step Flow Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className={`p-3.5 rounded-xl border ${isConfigured ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' : 'bg-card border-border text-foreground'} flex items-center gap-3`}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${isConfigured ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground'}`}>
                                1
                            </div>
                            <div className="text-xs">
                                <div className="font-semibold">Configure Recipient</div>
                                <div className="text-muted-foreground text-[11px]">{isConfigured ? 'Email specified' : 'Set client inbox'}</div>
                            </div>
                        </div>

                        <div className={`p-3.5 rounded-xl border ${emailer?.is_active ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' : 'bg-card border-border text-foreground'} flex items-center gap-3`}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${emailer?.is_active ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground'}`}>
                                2
                            </div>
                            <div className="text-xs">
                                <div className="font-semibold">Activate & Inject</div>
                                <div className="text-muted-foreground text-[11px]">{emailer?.is_active ? 'Script active' : 'Click to enable'}</div>
                            </div>
                        </div>

                        <div className={`p-3.5 rounded-xl border ${(emailer?.messages_count ?? 0) > 0 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' : 'bg-card border-border text-foreground'} flex items-center gap-3`}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${(emailer?.messages_count ?? 0) > 0 ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground'}`}>
                                3
                            </div>
                            <div className="text-xs">
                                <div className="font-semibold">Test Connection</div>
                                <div className="text-muted-foreground text-[11px]">{emailer?.messages_count ?? 0} messages logged</div>
                            </div>
                        </div>

                        <div className={`p-3.5 rounded-xl border ${project.is_deployed ? 'bg-card border-border text-foreground' : 'bg-card border-border text-foreground'} flex items-center gap-3`}>
                            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                4
                            </div>
                            <div className="text-xs">
                                <div className="font-semibold">Deploy to Vercel</div>
                                <div className="text-muted-foreground text-[11px]">{project.is_deployed ? 'Live on domain' : 'Ready to deploy'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Inactive Warning Alert */}
                    {isConfigured && !emailer?.is_active && (
                        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-300 font-medium">
                                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                                <span>
                                    <strong>Emailer is currently Paused:</strong> Submissions in the preview or on the live site are temporarily blocked until enabled.
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleToggle}
                                className="px-4 py-2 rounded-lg font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-xs shrink-0 transition-colors"
                            >
                                Enable Emailer Now
                            </button>
                        </div>
                    )}

                    {/* Live Iframe Submission Notification */}
                    {liveIframeNotification && (
                        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 text-sm font-semibold flex items-center gap-2 animate-bounce">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                            <span>{liveIframeNotification}</span>
                        </div>
                    )}

                    {/* Split View: Left (Interactive Preview) & Right (Config Controls) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* LEFT COLUMN: Preview & Verification (2 cols) */}
                        <div className="lg:col-span-2 flex flex-col gap-4">
                            {/* Toolbar */}
                            <div className="flex items-center justify-between border-b border-border pb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                        <Code2 className="w-4 h-4 text-primary" />
                                        Interactive Site Preview & Form Tester
                                    </span>
                                    {isConfigured && emailer?.is_active && (
                                        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                            Script Injected
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => setDeviceMode('desktop')}
                                        className={`p-1.5 rounded text-xs transition-all ${
                                            deviceMode === 'desktop' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
                                        }`}
                                        title="Desktop View"
                                    >
                                        <Laptop className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDeviceMode('mobile')}
                                        className={`p-1.5 rounded text-xs transition-all ${
                                            deviceMode === 'mobile' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
                                        }`}
                                        title="Mobile View"
                                    >
                                        <Smartphone className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIframeKey((k) => k + 1)}
                                        className="p-1.5 rounded text-xs text-muted-foreground hover:text-foreground"
                                        title="Reload Preview"
                                    >
                                        <RotateCw className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Iframe Container */}
                            <div className="bg-zinc-100 dark:bg-zinc-900/60 p-4 rounded-xl border border-border flex items-center justify-center min-h-[640px] overflow-hidden">
                                {project.html_content ? (
                                    <div
                                        className={`transition-all duration-300 ${
                                            deviceMode === 'desktop'
                                                ? 'w-full h-[640px] rounded-lg border border-border shadow-md overflow-hidden bg-white'
                                                : 'w-[375px] h-[640px] rounded-[36px] border-[8px] border-zinc-900 shadow-xl overflow-hidden bg-white relative'
                                        }`}
                                    >
                                        <iframe
                                            key={iframeKey}
                                            srcDoc={project.html_content}
                                            title="Emailer Preview"
                                            className="w-full h-full border-0 bg-white"
                                            sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center py-20 text-muted-foreground">
                                        <p className="text-sm font-medium">No HTML generated yet for this project</p>
                                    </div>
                                )}
                            </div>

                            {/* HTML Inspection & Verification Card */}
                            <div className="p-4 rounded-xl border border-border bg-card shadow-xs text-xs space-y-2.5">
                                <div className="flex items-center justify-between pb-2 border-b border-border">
                                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                                        <Sparkles className="w-4 h-4 text-primary" />
                                        Form Detection & HTML Audit
                                    </span>
                                    <Link
                                        href={`/admin/projects/${project.id}`}
                                        className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium"
                                    >
                                        <span>Edit Project HTML</span>
                                        <ExternalLink className="w-3 h-3" />
                                    </Link>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        {hasForm ? (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                        ) : (
                                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                                        )}
                                        <span>
                                            {hasForm ? 'Contact <form> element detected in page' : 'No <form> tag found in HTML'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {hasEmailField ? (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                        ) : (
                                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                                        )}
                                        <span>
                                            {hasEmailField ? 'Email input identified and mapped' : 'Email field could not be located'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Configuration Form & Actions (1 col) */}
                        <div className="flex flex-col gap-6">

                            {/* Configuration Form Card */}
                            <form onSubmit={handleSave} className="bg-card rounded-xl border border-border shadow-xs p-6 space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-border">
                                    <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                                        <Mail className="w-4 h-4 text-primary" />
                                        <span>Recipient Settings</span>
                                    </div>
                                    {isConfigured && (
                                        <span className="text-xs text-muted-foreground">
                                            {emailer?.messages_count ?? 0} messages
                                        </span>
                                    )}
                                </div>

                                {/* Recipient Email */}
                                <div>
                                    <label htmlFor="recipient_email" className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                                        Forward Messages To (Email)
                                    </label>
                                    <input
                                        id="recipient_email"
                                        type="email"
                                        required
                                        value={form.data.recipient_email}
                                        onChange={(e) => form.setData('recipient_email', e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="client@business.com"
                                    />
                                    {form.errors.recipient_email && (
                                        <div className="text-red-500 text-xs mt-1">{form.errors.recipient_email}</div>
                                    )}
                                    <p className="text-[11px] text-muted-foreground mt-1">
                                        Guest submissions will be forwarded to this inbox.
                                    </p>
                                </div>

                                {/* Reply Name */}
                                <div>
                                    <label htmlFor="reply_name" className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                                        Client Reply Name
                                    </label>
                                    <input
                                        id="reply_name"
                                        type="text"
                                        required
                                        value={form.data.reply_name}
                                        onChange={(e) => form.setData('reply_name', e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="Business or Owner Name"
                                    />
                                    {form.errors.reply_name && (
                                        <div className="text-red-500 text-xs mt-1">{form.errors.reply_name}</div>
                                    )}
                                    <p className="text-[11px] text-muted-foreground mt-1">
                                        Displayed in the notification header and reply context.
                                    </p>
                                </div>

                                {/* Save Button */}
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-10 px-4 disabled:opacity-50"
                                >
                                    {form.processing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            {isConfigured ? 'Update Configuration' : 'Save & Activate Emailer'}
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Testing & Verification Card */}
                            {isConfigured && emailer && (
                                <div className="bg-card rounded-xl border border-indigo-500/30 bg-indigo-500/5 shadow-xs p-6 space-y-4">
                                    <div className="flex items-center justify-between pb-3 border-b border-border">
                                        <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                                            <FlaskConical className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                            <span>Test Emailer Connection</span>
                                        </div>
                                        <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full bg-indigo-500/10">
                                            Instant Check
                                        </span>
                                    </div>

                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Click below to send a sample contact message to verify the database logging and email queuing to <strong className="text-foreground">{emailer.recipient_email}</strong>.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={handleSendTestMessage}
                                        disabled={isTesting || !emailer.is_active}
                                        className="w-full inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm h-10 px-4 disabled:opacity-50"
                                    >
                                        {isTesting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Sending Test Inquiry...
                                            </>
                                        ) : (
                                            <>
                                                <FlaskConical className="w-4 h-4" />
                                                Send Test Inquiry Now
                                            </>
                                        )}
                                    </button>

                                    {testFeedback && (
                                        <div className={`p-3 rounded-lg text-xs leading-relaxed border ${
                                            testFeedback.success
                                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-medium'
                                                : 'bg-red-500/10 border-red-500/30 text-red-800 dark:text-red-300'
                                        }`}>
                                            {testFeedback.message}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Status & Public Endpoint Card */}
                            {isConfigured && emailer && (
                                <div className="bg-card rounded-xl border border-border shadow-xs p-6 space-y-4">
                                    <div className="flex items-center justify-between pb-3 border-b border-border">
                                        <span className="font-semibold text-sm text-foreground">Status & Public API</span>
                                        <button
                                            type="button"
                                            onClick={handleToggle}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                                                emailer.is_active
                                                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30'
                                                    : 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-500/25 border border-zinc-500/30'
                                            }`}
                                        >
                                            <Power className="w-3 h-3" />
                                            {emailer.is_active ? 'Active (Click to Pause)' : 'Paused (Click to Enable)'}
                                        </button>
                                    </div>

                                    {/* Endpoint URL */}
                                    <div>
                                        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                            <span>Public Endpoint</span>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(endpointUrl, 'endpoint')}
                                                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                                            >
                                                {copiedEndpoint ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                                {copiedEndpoint ? 'Copied' : 'Copy URL'}
                                            </button>
                                        </div>
                                        <div className="p-2.5 rounded-lg bg-muted text-[11px] font-mono break-all text-foreground select-all border border-border">
                                            {endpointUrl}
                                        </div>
                                    </div>

                                    {/* Token */}
                                    <div>
                                        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                            <span>Secret Public Token</span>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(emailer.public_token, 'token')}
                                                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                                            >
                                                {copiedToken ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                                {copiedToken ? 'Copied' : 'Copy Token'}
                                            </button>
                                        </div>
                                        <div className="p-2 rounded-lg bg-muted text-[11px] font-mono text-muted-foreground truncate border border-border">
                                            {emailer.public_token}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Deployment Action Card */}
                            <div className="bg-card rounded-xl border border-border shadow-xs p-6 space-y-4">
                                <div className="flex items-center gap-2 font-semibold text-sm text-foreground pb-3 border-b border-border">
                                    <Rocket className="w-4 h-4 text-primary" />
                                    <span>Vercel Deployment</span>
                                </div>

                                {project.is_deployed ? (
                                    <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 space-y-1">
                                        <p className="font-semibold flex items-center gap-1.5">
                                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                                            Redeploy Required for Live Site
                                        </p>
                                        <p className="leading-relaxed">
                                            This project is already published on Vercel. After testing, trigger a redeploy to push the working contact form to the live domain.
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        When testing is verified, deploy this project to Vercel so the contact form goes live on the public domain.
                                    </p>
                                )}

                                <button
                                    type="button"
                                    onClick={handleDeploy}
                                    disabled={isDeploying}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm h-10 px-4 disabled:opacity-50"
                                >
                                    {isDeploying ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Deploying to Vercel...
                                        </>
                                    ) : (
                                        <>
                                            <Rocket className="w-4 h-4" />
                                            {project.is_deployed ? 'Redeploy with Emailer' : 'Deploy Project to Vercel'}
                                        </>
                                    )}
                                </button>
                            </div>

                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}
