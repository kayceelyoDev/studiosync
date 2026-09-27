import React, { useState, useMemo } from 'react';
import { Head, Link, setLayoutProps } from '@inertiajs/react';
import {
    ChevronLeft,
    MonitorSmartphone,
    Laptop,
    Tablet,
    Smartphone,
    RotateCw,
    ExternalLink,
    Copy,
    Check,
    Edit3,
    Lock,
    Rocket,
    Palette,
    Layers,
    Type,
    Image as ImageIcon,
    Code2,
    Download,
    CheckCircle2,
    Globe,
    Calendar,
    FileCode,
    Maximize2,
    Compass,
    User,
    Briefcase,
    Mail,
    CreditCard,
    MessageSquareQuote,
    Newspaper,
    Grid,
    Wrench,
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
    content_hash?: string;
    vercel_deployment_id?: string;
    created_at: string;
}

interface Workspace {
    id: number;
    name: string;
    slug?: string;
}

interface ProjectData {
    id: number;
    workspace_id: number;
    user_id: number;
    project_name: string;
    preferences?: string[];
    html_content?: string;
    status: string;
    project_url?: string | null;
    vercel_project_name?: string | null;
    deployment_status?: string | null;
    deployed_at?: string | null;
    created_at: string;
    updated_at: string;
    workspace?: Workspace;
    project_assets?: ProjectAsset[];
    projectAssets?: ProjectAsset[];
    deployments?: Deployment[];
}

export default function ProjectShow({ project }: { project: ProjectData }) {
    const [activeTab, setActiveTab] = useState<'preview' | 'specs' | 'assets' | 'deployments' | 'code'>('preview');
    const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [iframeKey, setIframeKey] = useState<number>(0);
    const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
    const [copiedCode, setCopiedCode] = useState<boolean>(false);
    const [copiedHex, setCopiedHex] = useState<string | null>(null);

    const isDeployed = project.deployment_status === 'deployed' || project.status === 'deployed';
    const isDeploying = project.deployment_status === 'deploying';
    const isLocked = isDeployed || isDeploying;

    const liveUrl = project.project_url || (project.vercel_project_name ? `https://${project.vercel_project_name}.vercel.app` : null);
    const assetsList = project.project_assets || project.projectAssets || [];
    const deploymentsList = project.deployments || [];

    // Set layout breadcrumbs
    setLayoutProps({
        breadcrumbs: [
            { title: 'Dashboard', href: '/dashboard' },
            { 
                title: project.workspace?.name || 'Workspace', 
                href: project.workspace ? `/workspaces/${project.workspace.id}` : '/dashboard' 
            },
            { title: project.project_name || 'Project Details', href: '#' },
        ],
    });

    // Parse project preferences into structured map
    const parsedSpecs = useMemo(() => {
        const specs: Record<string, string> = {
            description: '',
            content: '',
            layout: '',
            colorPalette: '',
            typography: '',
        };

        if (Array.isArray(project.preferences)) {
            project.preferences.forEach((pref) => {
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
    }, [project.preferences]);

    // Content sections list
    const contentSections = useMemo(() => {
        if (!parsedSpecs.content) return [];
        return parsedSpecs.content.split(',').map((s) => s.trim()).filter(Boolean);
    }, [parsedSpecs.content]);

    // Color Swatches generation based on theme
    const colorSwatches = useMemo(() => {
        const paletteStr = parsedSpecs.colorPalette.toLowerCase();
        if (paletteStr.includes('ocean') || paletteStr.includes('navy') || paletteStr.includes('aqua')) {
            return [
                { name: 'Navy Primary', hex: '#0A192F', role: 'Header & Accents' },
                { name: 'Deep Slate', hex: '#1E293B', role: 'Surface Background' },
                { name: 'Vibrant Aqua', hex: '#00B4D8', role: 'Primary CTA' },
                { name: 'Sky Cyan', hex: '#90E0EF', role: 'Highlight' },
                { name: 'Clean White', hex: '#FFFFFF', role: 'Card Base' },
            ];
        }
        if (paletteStr.includes('luxury') || paletteStr.includes('gold') || paletteStr.includes('black')) {
            return [
                { name: 'Obsidian Jet', hex: '#09090B', role: 'Dark Base' },
                { name: 'Rich Charcoal', hex: '#1C1917', role: 'Card Background' },
                { name: 'Warm Gold', hex: '#D4AF37', role: 'Primary Accent' },
                { name: 'Champagne', hex: '#F3E5AB', role: 'Soft Highlight' },
                { name: 'Pure White', hex: '#FFFFFF', role: 'Contrast' },
            ];
        }
        if (paletteStr.includes('emerald') || paletteStr.includes('green') || paletteStr.includes('forest')) {
            return [
                { name: 'Forest Dark', hex: '#064E3B', role: 'Brand Dark' },
                { name: 'Vivid Emerald', hex: '#10B981', role: 'Primary CTA' },
                { name: 'Sage Mint', hex: '#A7F3D0', role: 'Subtle Tint' },
                { name: 'Slate Gray', hex: '#334155', role: 'Body Typography' },
                { name: 'Crisp White', hex: '#FFFFFF', role: 'Background' },
            ];
        }
        if (paletteStr.includes('sunset') || paletteStr.includes('rose') || paletteStr.includes('warm')) {
            return [
                { name: 'Wine Velvet', hex: '#4A0E17', role: 'Deep Contrast' },
                { name: 'Vibrant Rose', hex: '#E11D48', role: 'Hero Accent' },
                { name: 'Amber Glow', hex: '#F97316', role: 'Button / Action' },
                { name: 'Soft Cream', hex: '#FFFBEB', role: 'Card Surface' },
                { name: 'Charcoal', hex: '#18181B', role: 'Headings' },
            ];
        }
        return [
            { name: 'Midnight', hex: '#0F172A', role: 'Primary Brand' },
            { name: 'Electric Indigo', hex: '#6366F1', role: 'Interactive Accent' },
            { name: 'Cool Slate', hex: '#64748B', role: 'Secondary Text' },
            { name: 'Neutral Gray', hex: '#F1F5F9', role: 'Surface Fill' },
            { name: 'Pure White', hex: '#FFFFFF', role: 'Base Canvas' },
        ];
    }, [parsedSpecs.colorPalette]);

    // Download HTML handler
    const handleDownloadHtml = () => {
        if (!project.html_content) return;
        const blob = new Blob([project.html_content], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const safeName = (project.project_name || 'website').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        link.download = `${safeName}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Copy live URL handler
    const handleCopyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
    };

    // Copy HTML Code handler
    const handleCopyCode = () => {
        if (!project.html_content) return;
        navigator.clipboard.writeText(project.html_content);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    // Copy Hex code handler
    const handleCopyHex = (hex: string) => {
        navigator.clipboard.writeText(hex);
        setCopiedHex(hex);
        setTimeout(() => setCopiedHex(null), 1500);
    };

    // Open standalone preview window
    const handleOpenInNewTab = () => {
        if (project.html_content) {
            const blob = new Blob([project.html_content], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        }
    };

    // Calculate approximate size & line count
    const codeStats = useMemo(() => {
        if (!project.html_content) return { lines: 0, kb: '0' };
        const lines = project.html_content.split('\n').length;
        const bytes = new Blob([project.html_content]).size;
        const kb = (bytes / 1024).toFixed(1);
        return { lines, kb };
    }, [project.html_content]);

    // Helper icon for sections
    const getSectionIcon = (sectionName: string) => {
        const lower = sectionName.toLowerCase();
        if (lower.includes('hero')) return <Compass className="w-4 h-4 text-blue-500" />;
        if (lower.includes('about')) return <User className="w-4 h-4 text-emerald-500" />;
        if (lower.includes('service')) return <Briefcase className="w-4 h-4 text-amber-500" />;
        if (lower.includes('contact')) return <Mail className="w-4 h-4 text-violet-500" />;
        if (lower.includes('pricing')) return <CreditCard className="w-4 h-4 text-green-500" />;
        if (lower.includes('testimonial')) return <MessageSquareQuote className="w-4 h-4 text-pink-500" />;
        if (lower.includes('blog') || lower.includes('news')) return <Newspaper className="w-4 h-4 text-indigo-500" />;
        if (lower.includes('gallery') || lower.includes('portfolio')) return <Grid className="w-4 h-4 text-cyan-500" />;
        return <Layers className="w-4 h-4 text-zinc-400" />;
    };

    return (
        <>
            <Head title={`${project.project_name || 'Project Details'} | StudioSync`} />

            <div className="flex flex-col flex-1 h-full min-h-screen bg-background text-foreground">
                <div className="w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 mx-auto flex flex-col gap-6">

                    {/* TOP ACTION BAR & BREADCRUMB */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/60">
                        {/* Left: Back button + Title + Badges */}
                        <div className="flex items-start sm:items-center gap-4">
                            <Link
                                href={project.workspace ? `/workspaces/${project.workspace.id}` : '/dashboard'}
                                className="shrink-0 flex items-center justify-center w-10 h-10 transition-colors bg-card border rounded-full shadow-sm text-muted-foreground hover:text-foreground hover:bg-muted border-border"
                                title="Return to Workspace"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </Link>

                            <div>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                        {project.project_name || 'Untitled Project'}
                                    </h1>

                                    {/* Deployment Status Pill */}
                                    {isDeployed ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            Live on Vercel
                                        </span>
                                    ) : isDeploying ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                                            <RotateCw className="w-3.5 h-3.5 animate-spin" />
                                            Deploying...
                                        </span>
                                    ) : (
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            project.status === 'completed'
                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                                        }`}>
                                            {project.status === 'completed' ? 'Draft Ready' : 'Draft'}
                                        </span>
                                    )}

                                    {/* Locked Badge */}
                                    {isLocked && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-border">
                                            <Lock className="w-3 h-3 text-muted-foreground" />
                                            Editing Locked
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                                    {project.workspace && (
                                        <span className="inline-flex items-center">
                                            <Globe className="w-3.5 h-3.5 mr-1 opacity-70" />
                                            Workspace: <strong className="ml-1 font-medium text-foreground">{project.workspace.name}</strong>
                                        </span>
                                    )}
                                    <span>•</span>
                                    <span className="inline-flex items-center">
                                        <Calendar className="w-3.5 h-3.5 mr-1 opacity-70" />
                                        Created {new Date(project.created_at).toLocaleDateString()}
                                    </span>
                                    {project.deployed_at && (
                                        <>
                                            <span>•</span>
                                            <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400">
                                                <Rocket className="w-3.5 h-3.5 mr-1" />
                                                Deployed {new Date(project.deployed_at).toLocaleDateString()}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: Quick Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Create Service Request Button */}
                            <Link
                                href={`/requests/create?project_id=${project.id}`}
                                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-all bg-indigo-600 hover:bg-indigo-700 text-white"
                                title="Request email setup, custom domain, backend feature, or service"
                            >
                                <Wrench className="w-4 h-4 mr-1.5" />
                                Request Service
                            </Link>

                            {/* Live Site Visit Button */}
                            {liveUrl && (
                                <a
                                    href={liveUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-all bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    <ExternalLink className="w-4 h-4 mr-1.5" />
                                    Visit Live Site
                                </a>
                            )}

                            {/* Copy Live URL Button */}
                            {liveUrl && (
                                <button
                                    onClick={() => handleCopyUrl(liveUrl)}
                                    className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors shadow-sm"
                                    title="Copy Live Domain URL"
                                >
                                    {copiedUrl ? (
                                        <Check className="w-4 h-4 text-emerald-500 mr-1.5" />
                                    ) : (
                                        <Copy className="w-4 h-4 text-muted-foreground mr-1.5" />
                                    )}
                                    {copiedUrl ? 'Copied!' : 'Copy Link'}
                                </button>
                            )}

                            {/* Edit Page Button (Only if NOT locked) */}
                            {project.html_content && !isLocked && (
                                <Link
                                    href={`/projects/${project.id}/edit`}
                                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-all bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    <Edit3 className="w-4 h-4 mr-1.5" />
                                    Edit Page
                                </Link>
                            )}

                            {/* Download HTML Button */}
                            {project.html_content && (
                                <button
                                    onClick={handleDownloadHtml}
                                    className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors shadow-sm"
                                    title="Export static HTML bundle"
                                >
                                    <Download className="w-4 h-4 text-muted-foreground mr-1.5" />
                                    Export HTML
                                </button>
                            )}
                        </div>
                    </div>

                    {/* VERCEL PRODUCTION DEPLOYMENT BANNER (IF DEPLOYED) */}
                    {isDeployed && liveUrl && (
                        <div className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-start sm:items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                        <Rocket className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-semibold text-foreground">
                                                Production Deployment is Live
                                            </h3>
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        </div>
                                        <a
                                            href={liveUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs sm:text-sm font-mono text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 mt-0.5 break-all"
                                        >
                                            {liveUrl}
                                            <ExternalLink className="w-3.5 h-3.5 inline shrink-0" />
                                        </a>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            This project is published on Vercel's global CDN. Code editing is locked to preserve production integrity.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                    <button
                                        onClick={() => handleCopyUrl(liveUrl)}
                                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-card border border-border hover:bg-muted text-foreground transition-colors shadow-sm"
                                    >
                                        {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-500 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1 text-muted-foreground" />}
                                        {copiedUrl ? 'Copied' : 'Copy URL'}
                                    </button>
                                    <a
                                        href={liveUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold rounded-md bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
                                    >
                                        Visit Site
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* DEPLOYING IN-PROGRESS BANNER */}
                    {isDeploying && (
                        <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                                    <RotateCw className="w-5 h-5 text-indigo-600 animate-spin" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-foreground">Deployment in Progress</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Your website is being uploaded and distributed across Vercel CDN nodes.
                                    </p>
                                </div>
                            </div>
                            <span className="text-xs font-mono text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded">
                                Status: Building
                            </span>
                        </div>
                    )}

                    {/* KEY METRICS OVERVIEW CARDS */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        {/* Metric 1: Niche / Type */}
                        <div className="p-4 bg-card rounded-xl border border-border shadow-sm">
                            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                Category
                            </div>
                            <div className="text-base font-semibold text-foreground truncate">
                                {parsedSpecs.description || 'Custom Web Application'}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 truncate">
                                {parsedSpecs.layout || 'Single Page Layout'}
                            </div>
                        </div>

                        {/* Metric 2: Palette Swatch Mini */}
                        <div className="p-4 bg-card rounded-xl border border-border shadow-sm">
                            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                Color Palette
                            </div>
                            <div className="text-base font-semibold text-foreground truncate">
                                {parsedSpecs.colorPalette || 'Modern Indigo'}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1.5">
                                {colorSwatches.slice(0, 4).map((swatch, idx) => (
                                    <div
                                        key={idx}
                                        className="w-3.5 h-3.5 rounded-full border border-border/80 shadow-xs"
                                        style={{ backgroundColor: swatch.hex }}
                                        title={`${swatch.name}: ${swatch.hex}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Metric 3: Page Size & Lines */}
                        <div className="p-4 bg-card rounded-xl border border-border shadow-sm">
                            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                Generated Code
                            </div>
                            <div className="text-base font-semibold text-foreground">
                                {codeStats.kb} KB
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                {codeStats.lines} lines of clean HTML5
                            </div>
                        </div>

                        {/* Metric 4: Sections & Assets */}
                        <div className="p-4 bg-card rounded-xl border border-border shadow-sm">
                            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                Components
                            </div>
                            <div className="text-base font-semibold text-foreground">
                                {contentSections.length || 6} Sections
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                {assetsList.length} Uploaded Assets
                            </div>
                        </div>
                    </div>

                    {/* TABS NAVIGATION */}
                    <div className="flex items-center justify-between border-b border-border">
                        <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
                            <button
                                onClick={() => setActiveTab('preview')}
                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                                    activeTab === 'preview'
                                        ? 'border-primary text-primary font-semibold'
                                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                                }`}
                            >
                                <MonitorSmartphone className="w-4 h-4" />
                                Live Preview
                            </button>

                            <button
                                onClick={() => setActiveTab('specs')}
                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                                    activeTab === 'specs'
                                        ? 'border-primary text-primary font-semibold'
                                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                                }`}
                            >
                                <Palette className="w-4 h-4" />
                                Design Specs & Architecture
                            </button>

                            <button
                                onClick={() => setActiveTab('assets')}
                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                                    activeTab === 'assets'
                                        ? 'border-primary text-primary font-semibold'
                                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                                }`}
                            >
                                <ImageIcon className="w-4 h-4" />
                                Assets
                                <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
                                    {assetsList.length}
                                </span>
                            </button>

                            <button
                                onClick={() => setActiveTab('deployments')}
                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                                    activeTab === 'deployments'
                                        ? 'border-primary text-primary font-semibold'
                                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                                }`}
                            >
                                <Rocket className="w-4 h-4" />
                                Deployments
                                {deploymentsList.length > 0 && (
                                    <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
                                        {deploymentsList.length}
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={() => setActiveTab('code')}
                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                                    activeTab === 'code'
                                        ? 'border-primary text-primary font-semibold'
                                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                                }`}
                            >
                                <Code2 className="w-4 h-4" />
                                Source Code
                            </button>
                        </div>
                    </div>

                    {/* TAB CONTENT AREA */}

                    {/* TAB 1: INTERACTIVE LIVE PREVIEW */}
                    {activeTab === 'preview' && (
                        <div className="flex flex-col gap-4">
                            {/* Device Switcher Toolbar */}
                            <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 bg-card border border-border rounded-xl shadow-xs">
                                <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg">
                                    <button
                                        onClick={() => setDeviceMode('desktop')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                                            deviceMode === 'desktop'
                                                ? 'bg-card text-foreground shadow-xs font-semibold'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        <Laptop className="w-3.5 h-3.5" />
                                        Desktop (100%)
                                    </button>

                                    <button
                                        onClick={() => setDeviceMode('tablet')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                                            deviceMode === 'tablet'
                                                ? 'bg-card text-foreground shadow-xs font-semibold'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        <Tablet className="w-3.5 h-3.5" />
                                        Tablet (768px)
                                    </button>

                                    <button
                                        onClick={() => setDeviceMode('mobile')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                                            deviceMode === 'mobile'
                                                ? 'bg-card text-foreground shadow-xs font-semibold'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        <Smartphone className="w-3.5 h-3.5" />
                                        Mobile (375px)
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setIframeKey((prev) => prev + 1)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                        title="Reload Preview"
                                    >
                                        <RotateCw className="w-3.5 h-3.5" />
                                        Reload
                                    </button>

                                    <button
                                        onClick={handleOpenInNewTab}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                        title="Open in new window"
                                    >
                                        <Maximize2 className="w-3.5 h-3.5" />
                                        Fullscreen
                                    </button>
                                </div>
                            </div>

                            {/* Viewport Frame Container */}
                            <div className="bg-zinc-100 dark:bg-zinc-900/60 p-4 sm:p-8 rounded-2xl border border-border/80 flex items-center justify-center min-h-[680px] overflow-x-auto">
                                {project.html_content ? (
                                    <div
                                        className={`transition-all duration-300 ${
                                            deviceMode === 'desktop'
                                                ? 'w-full h-[760px] rounded-xl border border-border shadow-md overflow-hidden bg-white'
                                                : deviceMode === 'tablet'
                                                ? 'w-[768px] h-[820px] rounded-2xl border-8 border-zinc-800 shadow-2xl overflow-hidden bg-white'
                                                : 'w-[375px] h-[720px] rounded-[40px] border-[10px] border-zinc-900 shadow-2xl overflow-hidden bg-white relative'
                                        }`}
                                    >
                                        {/* Mobile Phone Dynamic Island / Notch */}
                                        {deviceMode === 'mobile' && (
                                            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-zinc-900 rounded-full z-20 pointer-events-none" />
                                        )}

                                        <iframe
                                            key={iframeKey}
                                            srcDoc={project.html_content}
                                            title={project.project_name || 'Website Preview'}
                                            className="w-full h-full border-0 bg-white"
                                            sandbox="allow-scripts allow-same-origin allow-forms"
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center py-24 text-muted-foreground">
                                        <FileCode className="w-12 h-12 mx-auto mb-3 opacity-40" />
                                        <p className="text-base font-medium">No HTML content generated yet</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            The website is still being processed by the AI generator.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB 2: DESIGN SPECS & ARCHITECTURE */}
                    {activeTab === 'specs' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Color Palette Swatches */}
                            <div className="p-6 bg-card rounded-xl border border-border shadow-sm">
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                                    <Palette className="w-5 h-5 text-primary" />
                                    <div>
                                        <h3 className="text-base font-semibold text-foreground">Color Palette System</h3>
                                        <p className="text-xs text-muted-foreground">
                                            {parsedSpecs.colorPalette || 'Standard Palette'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {colorSwatches.map((swatch, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/40 transition-all bg-background group cursor-pointer"
                                            onClick={() => handleCopyHex(swatch.hex)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-lg shadow-sm border border-border/80 shrink-0"
                                                    style={{ backgroundColor: swatch.hex }}
                                                />
                                                <div>
                                                    <div className="text-sm font-semibold text-foreground">{swatch.name}</div>
                                                    <div className="text-xs text-muted-foreground">{swatch.role}</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs font-medium px-2 py-1 rounded bg-muted text-foreground">
                                                    {swatch.hex}
                                                </span>
                                                <button
                                                    className="p-1 rounded text-muted-foreground hover:text-foreground opacity-70 group-hover:opacity-100 transition-opacity"
                                                    title="Copy Hex Code"
                                                >
                                                    {copiedHex === swatch.hex ? (
                                                        <Check className="w-4 h-4 text-emerald-500" />
                                                    ) : (
                                                        <Copy className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Typography & Layout */}
                            <div className="space-y-6">
                                {/* Typography Card */}
                                <div className="p-6 bg-card rounded-xl border border-border shadow-sm">
                                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                                        <Type className="w-5 h-5 text-primary" />
                                        <div>
                                            <h3 className="text-base font-semibold text-foreground">Typography Hierarchy</h3>
                                            <p className="text-xs text-muted-foreground">
                                                {parsedSpecs.typography || 'Inter & Modern Sans'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-lg bg-background border border-border space-y-3">
                                        <div>
                                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                                Heading Specimen (H1 / H2)
                                            </div>
                                            <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                                                {project.project_name || 'Modern Digital Experience'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                                Body Copy
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                Engineered for maximum legibility and responsiveness across devices. High contrast ratio adhering to WCAG AA accessibility standards.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Layout Structure Card */}
                                <div className="p-6 bg-card rounded-xl border border-border shadow-sm">
                                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                                        <Layers className="w-5 h-5 text-primary" />
                                        <div>
                                            <h3 className="text-base font-semibold text-foreground">Layout Architecture</h3>
                                            <p className="text-xs text-muted-foreground">
                                                {parsedSpecs.layout || 'Single Page Responsive'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-lg bg-background border border-border">
                                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                            Selected Sections ({contentSections.length})
                                        </div>
                                        {contentSections.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {contentSections.map((section, i) => (
                                                    <span
                                                        key={i}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-card border border-border shadow-xs text-foreground"
                                                    >
                                                        {getSectionIcon(section)}
                                                        {section}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-muted-foreground italic">Standard modular sections enabled.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: PROJECT ASSETS */}
                    {activeTab === 'assets' && (
                        <div className="p-6 bg-card rounded-xl border border-border shadow-sm">
                            <div className="flex items-center justify-between mb-6 pb-3 border-b border-border">
                                <div>
                                    <h3 className="text-base font-semibold text-foreground">Uploaded Project Assets</h3>
                                    <p className="text-xs text-muted-foreground">
                                        Media files and graphics associated with this generated design.
                                    </p>
                                </div>
                                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                                    {assetsList.length} Total
                                </span>
                            </div>

                            {assetsList.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {assetsList.map((asset) => (
                                        <div
                                            key={asset.id}
                                            className="p-3 bg-background rounded-lg border border-border shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                                        >
                                            <div className="aspect-video bg-muted rounded-md overflow-hidden mb-3 relative flex items-center justify-center">
                                                {asset.url ? (
                                                    <img
                                                        src={asset.url}
                                                        alt={asset.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                                                )}
                                                <span className="absolute bottom-1.5 right-1.5 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/70 text-white">
                                                    {asset.type || 'IMAGE'}
                                                </span>
                                            </div>

                                            <div className="mb-2">
                                                <div className="text-sm font-medium text-foreground truncate" title={asset.name}>
                                                    {asset.name}
                                                </div>
                                                <div className="text-[11px] text-muted-foreground">
                                                    {asset.created_at ? new Date(asset.created_at).toLocaleDateString() : 'Active Asset'}
                                                </div>
                                            </div>

                                            {asset.url && (
                                                <div className="flex items-center gap-1 pt-2 border-t border-border">
                                                    <button
                                                        onClick={() => handleCopyUrl(asset.url!)}
                                                        className="flex-1 py-1 px-2 text-xs font-medium rounded bg-muted hover:bg-muted/80 text-foreground transition-colors flex items-center justify-center gap-1"
                                                    >
                                                        <Copy className="w-3 h-3" /> Copy URL
                                                    </button>
                                                    <a
                                                        href={asset.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1 rounded text-muted-foreground hover:text-foreground"
                                                        title="Open in new window"
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 text-muted-foreground">
                                    <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <h4 className="text-sm font-semibold text-foreground">No Custom Assets Uploaded</h4>
                                    <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                                        This design uses curated high-resolution photography placeholders and SVG graphics embedded directly into the layout.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 4: DEPLOYMENTS HISTORY */}
                    {activeTab === 'deployments' && (
                        <div className="p-6 bg-card rounded-xl border border-border shadow-sm">
                            <div className="flex items-center justify-between mb-6 pb-3 border-b border-border">
                                <div>
                                    <h3 className="text-base font-semibold text-foreground">Vercel Deployment History</h3>
                                    <p className="text-xs text-muted-foreground">
                                        Audit log of production releases and CDN deployments.
                                    </p>
                                </div>
                                {isDeployed && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Production Ready
                                    </span>
                                )}
                            </div>

                            {deploymentsList.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-border text-xs uppercase font-semibold text-muted-foreground">
                                                <th className="pb-3">Status</th>
                                                <th className="pb-3">Deployment URL</th>
                                                <th className="pb-3">Hash / Version</th>
                                                <th className="pb-3">Deployed At</th>
                                                <th className="pb-3 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {deploymentsList.map((dep) => (
                                                <tr key={dep.id} className="hover:bg-muted/30 transition-colors">
                                                    <td className="py-3">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                                            dep.status === 'ready' || dep.status === 'deployed'
                                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                                                                : dep.status === 'building' || dep.status === 'deploying'
                                                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300'
                                                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
                                                        }`}>
                                                            {dep.status === 'ready' ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : null}
                                                            {dep.status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 font-mono text-xs text-primary">
                                                        <a href={dep.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                                                            {dep.url}
                                                            <ExternalLink className="w-3 h-3 opacity-70" />
                                                        </a>
                                                    </td>
                                                    <td className="py-3 font-mono text-xs text-muted-foreground">
                                                        {dep.content_hash ? dep.content_hash.slice(0, 10) : 'v1.0-static'}
                                                    </td>
                                                    <td className="py-3 text-xs text-muted-foreground">
                                                        {new Date(dep.created_at).toLocaleString()}
                                                    </td>
                                                    <td className="py-3 text-right">
                                                        <button
                                                            onClick={() => handleCopyUrl(dep.url)}
                                                            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                                            title="Copy URL"
                                                        >
                                                            <Copy className="w-3.5 h-3.5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-16 text-muted-foreground">
                                    <Rocket className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <h4 className="text-sm font-semibold text-foreground">No External Deployments Recorded</h4>
                                    <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                                        This project has not been deployed to Vercel yet. When ready, click "Edit Page" to preview and launch to your custom Vercel subdomain.
                                    </p>
                                    {!isLocked && (
                                        <Link
                                            href={`/projects/${project.id}/edit`}
                                            className="mt-4 inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                                        >
                                            <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                                            Go to Editor & Deploy
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 5: SOURCE CODE INSPECTOR */}
                    {activeTab === 'code' && (
                        <div className="rounded-xl border border-border shadow-sm overflow-hidden bg-zinc-950 flex flex-col">
                            {/* Code Toolbar */}
                            <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-400">
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-zinc-200">index.html</span>
                                    <span>•</span>
                                    <span>{codeStats.lines} lines</span>
                                    <span>•</span>
                                    <span>{codeStats.kb} KB</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleCopyCode}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors font-medium text-xs"
                                    >
                                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                        {copiedCode ? 'Copied to Clipboard!' : 'Copy Code'}
                                    </button>

                                    <button
                                        onClick={handleDownloadHtml}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors font-medium text-xs"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Download .html
                                    </button>
                                </div>
                            </div>

                            {/* Code Viewer */}
                            <div className="p-4 sm:p-6 overflow-auto max-h-[700px] font-mono text-xs sm:text-sm text-zinc-300 leading-relaxed scrollbar-thin">
                                {project.html_content ? (
                                    <pre className="select-all">
                                        <code>{project.html_content}</code>
                                    </pre>
                                ) : (
                                    <div className="text-center py-12 text-zinc-500">
                                        No source code available.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </>
    );
}
