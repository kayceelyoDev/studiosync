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
    Send
} from 'lucide-react';

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
}

export default function AdminWorkspacesShow({ workspace }: { workspace: AdminProjectData }) {
    const [activeTab, setActiveTab] = useState<'preview' | 'specs' | 'assets'>('preview');
    const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
    const [iframeKey, setIframeKey] = useState<number>(0);
    const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
    const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

    const { data, setData, put, processing, errors } = useForm({
        status: workspace.status || 'pending',
        generated_prompt: workspace.generated_prompt || '',
        project_url: workspace.project_url || '',
    });

    setLayoutProps({
        breadcrumbs: [
            { title: 'Dashboard', href: '/admin/workspaces' },
            { title: 'Client Requests', href: '/admin/workspaces' },
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
