import React, { useState, useEffect, useRef } from 'react';
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
    Clock,
    SendHorizontal,
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

interface RecentMessage {
    id: number;
    guest_name: string;
    guest_email: string;
    subject: string;
    message: string;
    created_at?: string | null;
}

interface Props {
    project: ProjectInfo;
    emailer: EmailerInfo | null;
    mail_driver?: string;
    recent_messages?: RecentMessage[];
    client_request?: {
        id: number;
        title: string;
        category?: string;
        category_label?: string;
        status?: string;
    } | null;
    has_contact_form?: boolean;
}

export default function AdminEmailerShow({ project, emailer, mail_driver = 'log', recent_messages = [], client_request, has_contact_form = false }: Props) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
    const [iframeKey, setIframeKey] = useState<number>(0);
    const [copiedToken, setCopiedToken] = useState<boolean>(false);
    const [copiedEndpoint, setCopiedEndpoint] = useState<boolean>(false);
    const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
    const [fillSampleSuccess, setFillSampleSuccess] = useState<boolean>(false);
    const [showSmtpGuide, setShowSmtpGuide] = useState<boolean>(false);
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

    // Pre-fill preview form fields with sample inquiry data
    const handleFillSampleData = () => {
        try {
            const iframe = iframeRef.current;
            if (!iframe || !iframe.contentDocument) return;
            const doc = iframe.contentDocument;

            const nameEl = doc.querySelector('input[id*="name" i], input[name*="name" i]') as HTMLInputElement | null;
            const emailEl = doc.querySelector('input[type="email"], input[id*="email" i], input[name*="email" i]') as HTMLInputElement | null;
            const phoneEl = doc.querySelector('input[type="tel"], input[id*="phone" i], input[name*="phone" i]') as HTMLInputElement | null;
            const msgEl = doc.querySelector('textarea, input[id*="message" i], input[name*="message" i]') as HTMLTextAreaElement | null;
            const selectEl = doc.querySelector('select') as HTMLSelectElement | null;

            if (nameEl) nameEl.value = 'Jonathan Sterling (Sample Guest)';
            if (emailEl) emailEl.value = 'guest.tester@example.com';
            if (phoneEl) phoneEl.value = '+1 (555) 019-2834';
            if (selectEl && selectEl.options.length > 0) selectEl.selectedIndex = 0;
            if (msgEl) msgEl.value = 'Hello! I am inquiring through the website contact form to test email delivery and notification routing.';

            [nameEl, emailEl, phoneEl, msgEl].forEach((el) => {
                if (el) {
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });

            setFillSampleSuccess(true);
            setTimeout(() => setFillSampleSuccess(false), 3000);
        } catch (e) {
            console.warn('Could not auto-fill preview form:', e);
        }
    };

    // Listen for live form submissions inside the preview iframe
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'SS_CONTACT_SUBMITTED') {
                setLiveIframeNotification('🎉 Test inquiry submitted from preview! Message recorded and email generated.');
                router.reload({ only: ['emailer', 'recent_messages'] });
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
                router.reload({ only: ['emailer', 'recent_messages'] });
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

    const handleInjectContactSection = () => {
        router.post(`/admin/projects/${project.id}/emailer/inject-section`, {}, {
            preserveScroll: true,
            onSuccess: () => setIframeKey(k => k + 1),
        });
    };

    const handleRemoveContactSection = () => {
        router.post(`/admin/projects/${project.id}/emailer/remove-section`, {}, {
            preserveScroll: true,
            onSuccess: () => setIframeKey(k => k + 1),
        });
    };

    // Inspect project HTML for contact form
    const hasForm = project.html_content ? /<form[\s>]/i.test(project.html_content) : false;
    const hasEmailField = project.html_content ? /(type="email"|name="email"|id="[^"]*email[^"]*")/i.test(project.html_content) : false;

    return (
        <>
            <Head title={`Emailer Setup - ${project.project_name} | Admin`} />

            <div className="flex flex-col flex-1 h-full min-h-screen bg-background text-foreground">
                <div className="w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 mx-auto flex flex-col gap-6">

                    {/* Service Request Fulfillment Banner */}
                    {client_request && (
                        <div className="p-4 rounded-xl bg-primary/10 border border-primary/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-xs">
                                    #{client_request.id}
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                                        Fulfilling Client Request &bull; {client_request.category_label || 'Contact Emailer'}
                                    </span>
                                    <h4 className="text-sm font-bold text-foreground">
                                        {client_request.title}
                                    </h4>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link
                                    href={`/admin/requests/${client_request.id}`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors shadow-xs"
                                >
                                    &larr; Back to Request #{client_request.id}
                                </Link>
                                {client_request.status !== 'completed' && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            router.put(`/admin/requests/${client_request.id}`, {
                                                status: 'completed',
                                                admin_notes: 'Contact emailer configured, script injected, and verified successfully.',
                                            }, {
                                                onSuccess: () => router.visit(`/admin/requests/${client_request.id}`)
                                            });
                                        }}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>Mark Request Completed</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

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
                        {/* Step 1 */}
                        <div className={`p-3.5 rounded-xl border bg-card shadow-xs flex items-center gap-3 transition-colors ${
                            isConfigured ? 'border-border' : 'border-border/60 bg-muted/20'
                        }`}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                isConfigured ? 'bg-primary text-primary-foreground shadow-xs' : 'bg-muted text-muted-foreground'
                            }`}>
                                {isConfigured ? <Check className="w-3.5 h-3.5" /> : '1'}
                            </div>
                            <div className="text-xs">
                                <div className="font-semibold text-foreground">Configure Recipient</div>
                                <div className="text-muted-foreground text-[11px]">{isConfigured ? 'Inbox designated' : 'Set client inbox'}</div>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className={`p-3.5 rounded-xl border bg-card shadow-xs flex items-center gap-3 transition-colors ${
                            emailer?.is_active ? 'border-border' : 'border-border/60 bg-muted/20'
                        }`}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                emailer?.is_active ? 'bg-primary text-primary-foreground shadow-xs' : 'bg-muted text-muted-foreground'
                            }`}>
                                {emailer?.is_active ? <Check className="w-3.5 h-3.5" /> : '2'}
                            </div>
                            <div className="text-xs">
                                <div className="font-semibold text-foreground">Activate & Inject</div>
                                <div className="text-muted-foreground text-[11px]">{emailer?.is_active ? 'Script active' : 'Click to enable'}</div>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className={`p-3.5 rounded-xl border bg-card shadow-xs flex items-center gap-3 transition-colors ${
                            (emailer?.messages_count ?? 0) > 0 ? 'border-border' : 'border-border/60 bg-muted/20'
                        }`}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                (emailer?.messages_count ?? 0) > 0 ? 'bg-primary text-primary-foreground shadow-xs' : 'bg-muted text-muted-foreground'
                            }`}>
                                {(emailer?.messages_count ?? 0) > 0 ? <Check className="w-3.5 h-3.5" /> : '3'}
                            </div>
                            <div className="text-xs">
                                <div className="font-semibold text-foreground">Test Connection</div>
                                <div className="text-muted-foreground text-[11px]">{emailer?.messages_count ?? 0} messages logged</div>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className={`p-3.5 rounded-xl border bg-card shadow-xs flex items-center gap-3 transition-colors ${
                            project.is_deployed ? 'border-border' : 'border-border/60 bg-muted/20'
                        }`}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                project.is_deployed ? 'bg-primary text-primary-foreground shadow-xs' : 'bg-muted text-muted-foreground'
                            }`}>
                                {project.is_deployed ? <Check className="w-3.5 h-3.5" /> : '4'}
                            </div>
                            <div className="text-xs">
                                <div className="font-semibold text-foreground">Deploy to Vercel</div>
                                <div className="text-muted-foreground text-[11px]">{project.is_deployed ? 'Live on domain' : 'Ready to deploy'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Inactive Warning Alert */}
                    {isConfigured && !emailer?.is_active && (
                        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2.5 text-amber-700 dark:text-amber-400 font-medium">
                                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                                <span>
                                    <strong>Emailer is currently Paused:</strong> Submissions in the preview or on the live site are temporarily blocked until enabled.
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleToggle}
                                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs shrink-0 transition-colors cursor-pointer"
                            >
                                Enable Emailer Now
                            </button>
                        </div>
                    )}

                    {/* Live Iframe Submission Notification */}
                    {liveIframeNotification && (
                        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-sm font-semibold flex items-center gap-2 animate-bounce">
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
                                        onClick={handleFillSampleData}
                                        className={`px-2.5 py-1 rounded text-xs transition-all font-medium inline-flex items-center gap-1.5 ${
                                            fillSampleSuccess
                                                ? 'bg-primary text-primary-foreground shadow-xs'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-card'
                                        }`}
                                        title="Auto-fill contact form fields inside the preview with sample test data"
                                    >
                                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                                        <span>{fillSampleSuccess ? 'Sample Data Filled!' : 'Fill Test Data'}</span>
                                    </button>

                                    <div className="w-[1px] h-4 bg-border/70 my-auto mx-0.5" />

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
                                            ref={iframeRef}
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
                                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border">
                                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                                        <Sparkles className="w-4 h-4 text-primary" />
                                        Form Detection &amp; HTML Audit
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {!hasForm ? (
                                            <button
                                                type="button"
                                                onClick={handleInjectContactSection}
                                                className="px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
                                            >
                                                <span>+ Auto-Inject Contact Section</span>
                                            </button>
                                        ) : (
                                            project.html_content?.includes('<!-- SS-CONTACT-FORM-START -->') && (
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveContactSection}
                                                    className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer"
                                                >
                                                    Remove Injected Section
                                                </button>
                                            )
                                        )}
                                        <Link
                                            href={`/projects/${project.id}/edit${client_request ? `?request_id=${client_request.id}` : ''}`}
                                            className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-semibold"
                                        >
                                            <span>Open Website Editor</span>
                                            <ExternalLink className="w-3 h-3" />
                                        </Link>
                                    </div>
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
                            {/* Recent Dispatched Inquiries Card */}
                            <div className="p-4 rounded-xl border border-border bg-card shadow-xs text-xs space-y-3.5">
                                <div className="flex items-center justify-between pb-2.5 border-b border-border">
                                    <div className="flex items-center gap-2">
                                        <Inbox className="w-4 h-4 text-primary" />
                                        <span className="font-semibold text-sm text-foreground">Recent Contact Form Inquiries</span>
                                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground">
                                            {recent_messages.length}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => router.reload({ only: ['recent_messages', 'emailer'] })}
                                        className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium cursor-pointer"
                                    >
                                        <RotateCw className="w-3 h-3" />
                                        <span>Refresh</span>
                                    </button>
                                </div>

                                {recent_messages.length > 0 ? (
                                    <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                                        {recent_messages.map((msg) => (
                                            <div key={msg.id} className="p-3.5 rounded-lg border border-border bg-background hover:border-primary/40 transition-colors space-y-2">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-foreground text-xs">{msg.guest_name}</span>
                                                        <span className="px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary font-mono font-medium">
                                                            {msg.guest_email}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : ''}</span>
                                                    </div>
                                                </div>

                                                <div className="text-xs font-medium text-foreground">
                                                    <span className="text-muted-foreground font-normal">Subject: </span>
                                                    {msg.subject}
                                                </div>

                                                <p className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded border border-border/50 whitespace-pre-wrap leading-relaxed font-sans">
                                                    {msg.message}
                                                </p>

                                                <div className="flex items-center justify-between pt-1 text-[11px]">
                                                    <span className="text-muted-foreground">
                                                        {mail_driver === 'log' ? '📝 Logged in storage/logs/laravel.log' : '📡 Dispatched via SMTP'}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(msg.message);
                                                                setCopiedMessageId(msg.id);
                                                                setTimeout(() => setCopiedMessageId(null), 2000);
                                                            }}
                                                            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-muted transition-colors cursor-pointer"
                                                        >
                                                            {copiedMessageId === msg.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                                            {copiedMessageId === msg.id ? 'Copied' : 'Copy'}
                                                        </button>
                                                        <a
                                                            href={`mailto:${msg.guest_email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                                                            className="font-semibold text-primary hover:underline inline-flex items-center gap-1 px-2.5 py-1 rounded bg-primary/10 hover:bg-primary/20 transition-colors"
                                                        >
                                                            <Mail className="w-3 h-3" />
                                                            <span>Reply</span>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground space-y-2">
                                        <Inbox className="w-8 h-8 mx-auto opacity-30" />
                                        <p className="text-xs font-medium text-foreground">No inquiries logged yet</p>
                                        <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                                            Click <strong>Fill Test Data</strong> on the preview toolbar above and submit the form, or click <strong>Send Test Inquiry Now</strong> to verify the flow.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Configuration Form & Actions (1 col) */}
                        <div className="flex flex-col gap-6">

                            {/* Mail Driver Notice & Guide */}
                            <div className={`rounded-xl border p-4 text-xs space-y-2.5 ${
                                mail_driver === 'log'
                                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                            }`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 font-semibold text-xs">
                                        {mail_driver === 'log' ? (
                                            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                        ) : (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                        )}
                                        <span>
                                            Driver: <strong>{mail_driver}</strong> {mail_driver === 'log' ? '(Local Log Mode)' : '(Live Internet Delivery)'}
                                        </span>
                                    </div>
                                    {mail_driver === 'log' && (
                                        <button
                                            type="button"
                                            onClick={() => setShowSmtpGuide((v) => !v)}
                                            className="text-[11px] font-semibold underline hover:opacity-80 inline-flex items-center gap-1 cursor-pointer"
                                        >
                                            {showSmtpGuide ? 'Hide Setup' : 'Gmail Setup ▾'}
                                        </button>
                                    )}
                                </div>

                                {mail_driver === 'log' ? (
                                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                                        Emails are written to <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">storage/logs/laravel.log</code> and the inquiry list on the left. To receive real emails at <strong className="text-foreground">{emailer?.recipient_email || 'your Gmail'}</strong>, configure SMTP in <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">.env</code>.
                                    </p>
                                ) : (
                                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                                        Emails will be delivered directly across the internet to the recipient inbox via your configured mail server.
                                    </p>
                                )}

                                {mail_driver === 'log' && showSmtpGuide && (
                                    <div className="mt-3 p-3 rounded-lg bg-card border border-border text-[11px] space-y-2 text-foreground">
                                        <p className="font-semibold text-amber-600 dark:text-amber-400">
                                            To receive live emails in Gmail, update .env:
                                        </p>
                                        <pre className="p-2.5 rounded bg-muted text-[10px] overflow-x-auto text-foreground font-mono leading-normal select-all">
{`MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-16-char-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="your-email@gmail.com"
MAIL_FROM_NAME="StudioSync"`}
                                        </pre>
                                        <p className="text-[10px] text-muted-foreground">
                                            📌 In your Google Account: Go to <strong>Security → 2-Step Verification → App Passwords</strong>, create one for StudioSync, and paste the 16 characters into <code className="font-mono text-foreground">MAIL_PASSWORD</code>.
                                        </p>
                                    </div>
                                )}
                            </div>

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
                                <div className="bg-card rounded-xl border border-border shadow-xs p-6 space-y-4">
                                    <div className="flex items-center justify-between pb-3 border-b border-border">
                                        <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                                            <FlaskConical className="w-4 h-4 text-primary" />
                                            <span>Test Emailer Connection</span>
                                        </div>
                                        <span className="text-[11px] font-semibold text-primary px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                                            Instant Check
                                        </span>
                                    </div>

                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Click below to send a sample contact message to verify database logging and email dispatch to <strong className="text-foreground">{emailer.recipient_email}</strong>.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={handleSendTestMessage}
                                        disabled={isTesting || !emailer.is_active}
                                        className="w-full inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-10 px-4 disabled:opacity-50 cursor-pointer"
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
                                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-medium'
                                                : 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300'
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
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                                                emailer.is_active
                                                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                                                    : 'bg-muted text-muted-foreground hover:bg-muted/80 border border-border'
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
                                                className="text-xs text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
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
                                                className="text-xs text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
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
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-10 px-4 disabled:opacity-50 cursor-pointer"
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
