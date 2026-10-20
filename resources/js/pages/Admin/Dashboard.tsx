import { Head, Link, setLayoutProps } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowUpRight,
    BookOpen,
    Calendar,
    CheckCircle2,
    Clock,
    ExternalLink,
    FileCode,
    Globe,
    Layers,
    LayoutGrid,
    ListFilter,
    Mail,
    Palette,
    Rocket,
    Search,
    Shield,
    Users,
} from 'lucide-react';
import * as Icons from 'lucide-react';

interface Metrics {
    total_requests: number;
    open_requests: number;
    reviewing_requests: number;
    in_progress_requests: number;
    completed_requests: number;
    urgent_requests: number;
    aging_requests: number;
    total_users: number;
    total_projects: number;
    deployed_projects: number;
}

interface CategoryBreakdown {
    value: string;
    label: string;
    icon: string;
    count: number;
}

interface RecentRequest {
    id: number;
    category: string;
    category_label: string;
    category_icon: string;
    title: string;
    status: string;
    status_label: string;
    status_color: string;
    project: { id: number; name: string } | null;
    client: { id: number; name: string; email: string } | null;
    admin: { id: number; name: string } | null;
    is_ageing: boolean;
    is_urgent: boolean;
    created_at: string;
}

interface RecentDeployment {
    id: number;
    project_name: string;
    project_url: string | null;
    vercel_project_name: string;
    vercel_dashboard_url: string | null;
    deployed_at: string | null;
    client: { id: number; name: string } | null;
}

function DynamicIcon({ name, className }: { name: string; className?: string }) {
    const IconComp = (Icons as Record<string, any>)[name] || Layers;
    return <IconComp className={className} />;
}

function timeAgo(dateString?: string | null): string {
    if (!dateString) return 'Just now';
    const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

const STATUS_BADGES: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
    reviewing: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    in_progress: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
    completed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    rejected: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
    cancelled: 'bg-muted text-muted-foreground border-border',
};

export default function AdminDashboard({
    metrics,
    categories,
    recentRequests,
    recentDeployments,
}: {
    metrics: Metrics;
    categories: CategoryBreakdown[];
    recentRequests: RecentRequest[];
    recentDeployments: RecentDeployment[];
}) {
    setLayoutProps({
        breadcrumbs: [
            { title: 'Admin', href: '/admin/dashboard' },
            { title: 'Dashboard', href: '/admin/dashboard' },
        ],
    });

    return (
        <>
            <Head title="Admin Dashboard | StudioSync" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-hidden p-4 sm:p-6 lg:p-8 bg-background text-foreground">
                {/* Header with Quick Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                Admin Command Center
                            </h1>
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                                Live
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Monitor incoming requests, client projects, active Vercel deployments, and user directory.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <Link
                            href="/admin/requests"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs transition-all"
                        >
                            <ListFilter className="w-3.5 h-3.5" />
                            <span>All Requests</span>
                        </Link>
                        <Link
                            href="/admin/users"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-card border border-border text-foreground hover:bg-muted shadow-xs transition-all"
                        >
                            <Users className="w-3.5 h-3.5" />
                            <span>Users Explorer</span>
                        </Link>
                        <Link
                            href="/admin/projects"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-card border border-border text-foreground hover:bg-muted shadow-xs transition-all"
                        >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Projects Workspace</span>
                        </Link>
                    </div>
                </div>

                {/* Primary KPI Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Open Requests */}
                    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-xs transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Open Requests
                            </span>
                            <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                <ListFilter className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold text-foreground">{metrics.open_requests}</span>
                            <span className="text-xs text-muted-foreground font-medium">
                                of {metrics.total_requests} total
                            </span>
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-xs">
                            {metrics.urgent_requests > 0 ? (
                                <span className="inline-flex items-center gap-1 text-red-500 font-semibold bg-red-500/10 px-2 py-0.5 rounded-full">
                                    <AlertTriangle className="w-3 h-3" />
                                    {metrics.urgent_requests} urgent (&gt;72h)
                                </span>
                            ) : metrics.aging_requests > 0 ? (
                                <span className="inline-flex items-center gap-1 text-amber-500 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full">
                                    <Clock className="w-3 h-3" />
                                    {metrics.aging_requests} aging (&gt;24h)
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    No aging requests
                                </span>
                            )}
                        </div>
                    </div>

                    {/* In Progress */}
                    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-xs transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                In Progress & Review
                            </span>
                            <div className="rounded-lg bg-purple-500/10 p-2 text-purple-600 dark:text-purple-400">
                                <Clock className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold text-foreground">
                                {metrics.in_progress_requests + metrics.reviewing_requests}
                            </span>
                            <span className="text-xs text-muted-foreground font-medium">active queue</span>
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{metrics.reviewing_requests} reviewing</span>
                            <span>&bull;</span>
                            <span>{metrics.in_progress_requests} working</span>
                        </div>
                    </div>

                    {/* Total Projects */}
                    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-xs transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Client Projects
                            </span>
                            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
                                <BookOpen className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold text-foreground">{metrics.total_projects}</span>
                            <span className="text-xs text-muted-foreground font-medium">created</span>
                        </div>
                        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Users className="w-3.5 h-3.5" />
                            <span>Across {metrics.total_users} registered users</span>
                        </div>
                    </div>

                    {/* Vercel Deployed Sites */}
                    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-xs transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Deployed on Vercel
                            </span>
                            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                                <Rocket className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold text-foreground">{metrics.deployed_projects}</span>
                            <span className="text-xs text-muted-foreground font-medium">live websites</span>
                        </div>
                        <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            <Globe className="w-3.5 h-3.5" />
                            <span>Global CDN & Custom Domains</span>
                        </div>
                    </div>
                </div>

                {/* Request Category Distribution Bar */}
                <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-bold text-foreground">Requests by Service Category</h2>
                            <span className="text-xs text-muted-foreground">({metrics.total_requests} submissions)</span>
                        </div>
                        <Link
                            href="/admin/requests"
                            className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                        >
                            Filter by category &rarr;
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {categories.map((cat) => (
                            <Link
                                key={cat.value}
                                href={`/admin/requests?category=${cat.value}`}
                                className="flex flex-col items-start p-3 rounded-lg border border-border/70 bg-muted/30 hover:bg-muted/70 hover:border-primary/40 transition-all group"
                            >
                                <div className="flex items-center justify-between w-full mb-1">
                                    <div className="p-1.5 rounded-md bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                        <DynamicIcon name={cat.icon} className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-lg font-bold text-foreground">{cat.count}</span>
                                </div>
                                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground line-clamp-1 transition-colors">
                                    {cat.label}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Split Grid: Recent Requests & Recently Deployed to Vercel */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Recent Requests Queue (7 cols) */}
                    <div className="lg:col-span-7 rounded-xl border border-border bg-card shadow-xs flex flex-col">
                        <div className="p-5 border-b border-border flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-bold text-foreground">Recent Client Requests</h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Urgent requests requiring review or website editing.
                                </p>
                            </div>
                            <Link
                                href="/admin/requests"
                                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                            >
                                View all ({metrics.total_requests}) &rarr;
                            </Link>
                        </div>

                        <div className="divide-y divide-border/60 flex-1 overflow-y-auto max-h-[520px]">
                            {recentRequests.length === 0 ? (
                                <div className="p-12 text-center text-muted-foreground text-sm">
                                    No requests have been submitted yet.
                                </div>
                            ) : (
                                recentRequests.map((req) => (
                                    <div
                                        key={req.id}
                                        className="p-4 hover:bg-muted/40 transition-colors flex items-start gap-3 group"
                                    >
                                        <div className="shrink-0 pt-0.5">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                <DynamicIcon name={req.category_icon} className="w-4 h-4" />
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <Link
                                                    href={`/admin/requests/${req.id}`}
                                                    className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate max-w-sm"
                                                >
                                                    {req.title}
                                                </Link>
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_BADGES[req.status] || ''}`}
                                                >
                                                    {req.status_label}
                                                </span>
                                                {req.is_urgent && (
                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                                                        URGENT
                                                    </span>
                                                )}
                                                {!req.is_urgent && req.is_ageing && (
                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                        AGING
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                                                {req.client && (
                                                    <span>
                                                        Client: <span className="text-foreground">{req.client.name}</span>
                                                    </span>
                                                )}
                                                {req.project && (
                                                    <span>
                                                        Project: <span className="text-foreground">{req.project.name}</span>
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {timeAgo(req.created_at)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="shrink-0 flex items-center gap-1.5">
                                            {req.project && (
                                                <Link
                                                    href={`/projects/${req.project.id}/edit?request_id=${req.id}`}
                                                    className="px-2 py-1 rounded-md text-[11px] font-medium bg-muted hover:bg-primary hover:text-primary-foreground text-foreground transition-all"
                                                    title="Open in Website Editor"
                                                >
                                                    Edit Site
                                                </Link>
                                            )}
                                            <Link
                                                href={`/admin/requests/${req.id}`}
                                                className="px-2 py-1 rounded-md text-[11px] font-semibold text-primary hover:bg-primary/10 transition-colors"
                                            >
                                                Review &rarr;
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right: Recently Deployed to Vercel (5 cols) */}
                    <div className="lg:col-span-5 rounded-xl border border-border bg-card shadow-xs flex flex-col">
                        <div className="p-5 border-b border-border flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-bold text-foreground">Recently Deployed to Vercel</h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Direct access to live sites and Vercel management dashboards.
                                </p>
                            </div>
                            <Link
                                href="/admin/projects"
                                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                            >
                                All projects &rarr;
                            </Link>
                        </div>

                        <div className="divide-y divide-border/60 flex-1 overflow-y-auto max-h-[520px]">
                            {recentDeployments.length === 0 ? (
                                <div className="p-12 text-center text-muted-foreground text-sm">
                                    No websites deployed to Vercel yet.
                                </div>
                            ) : (
                                recentDeployments.map((project) => (
                                    <div
                                        key={project.id}
                                        className="p-4 hover:bg-muted/40 transition-colors flex flex-col gap-2"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <Link
                                                    href={`/admin/projects/${project.id}`}
                                                    className="text-xs font-bold text-foreground hover:text-primary transition-colors truncate block"
                                                >
                                                    {project.project_name}
                                                </Link>
                                                <span className="text-[11px] text-muted-foreground">
                                                    Client: {project.client?.name || 'Unknown'} &bull; {timeAgo(project.deployed_at)}
                                                </span>
                                            </div>

                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                                                Live on Vercel
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 pt-1">
                                            {project.project_url && (
                                                <a
                                                    href={project.project_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                                                >
                                                    <Globe className="w-3 h-3" />
                                                    <span>Live Site</span>
                                                    <ArrowUpRight className="w-3 h-3" />
                                                </a>
                                            )}

                                            <a
                                                href={`/admin/projects/${project.id}/vercel-redirect`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-zinc-900 text-zinc-100 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
                                            >
                                                <span>Manage on Vercel</span>
                                                <ExternalLink className="w-3 h-3" />
                                            </a>

                                            <Link
                                                href={`/projects/${project.id}/edit`}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-muted hover:bg-muted/80 text-foreground transition-colors ml-auto"
                                            >
                                                <FileCode className="w-3 h-3" />
                                                <span>Editor</span>
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
