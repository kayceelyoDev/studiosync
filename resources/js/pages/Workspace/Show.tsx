import React, { useState, useMemo } from 'react';
import { Head, Link, setLayoutProps } from '@inertiajs/react';
import {
    Plus,
    LayoutTemplate,
    Calendar,
    Globe,
    ArrowUpRight,
    Rocket,
    Lock,
    Search,
    SlidersHorizontal,
    Layers,
    CheckCircle2,
    ExternalLink,
    Copy,
    Check,
    Edit3,
    ArrowRight
} from 'lucide-react';

interface Workspace {
    id: number;
    name: string;
    slug: string;
    created_at: string;
}

interface Project {
    id: number;
    workspace_id: number;
    project_name: string;
    status: string;
    project_url: string | null;
    deployment_status?: string | null;
    vercel_project_name?: string | null;
    created_at: string;
}

export default function ShowWorkspace({ workspace, projects = [] }: { workspace: Workspace; projects: Project[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'deployed' | 'draft'>('all');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');
    const [copiedId, setCopiedId] = useState<number | null>(null);

    setLayoutProps({
        breadcrumbs: [
            { title: 'Dashboard', href: '/dashboard' },
            { title: workspace.name, href: '#' },
        ],
    });

    // Compute summary metrics
    const stats = useMemo(() => {
        const total = projects.length;
        const deployed = projects.filter((p) => p.deployment_status === 'deployed' || p.status === 'deployed').length;
        const drafts = total - deployed;
        return { total, deployed, drafts };
    }, [projects]);

    // Filter and sort projects
    const filteredProjects = useMemo(() => {
        return projects
            .filter((project) => {
                // Search filter
                const matchesSearch = project.project_name.toLowerCase().includes(searchQuery.toLowerCase());
                if (!matchesSearch) return false;

                // Status filter
                if (statusFilter === 'deployed') {
                    return project.deployment_status === 'deployed' || project.status === 'deployed';
                }
                if (statusFilter === 'draft') {
                    return project.deployment_status !== 'deployed' && project.status !== 'deployed';
                }
                return true;
            })
            .sort((a, b) => {
                if (sortBy === 'newest') {
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                }
                if (sortBy === 'oldest') {
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                }
                if (sortBy === 'name') {
                    return a.project_name.localeCompare(b.project_name);
                }
                return 0;
            });
    }, [projects, searchQuery, statusFilter, sortBy]);

    const handleCopyUrl = (e: React.MouseEvent, id: number, url: string) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <>
            <Head title={`${workspace.name} | StudioSync`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-hidden rounded-xl p-4 sm:p-6 lg:p-8 bg-background text-foreground">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                            {workspace.name}
                        </h1>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs sm:text-sm text-muted-foreground">
                            <span className="inline-flex items-center">
                                <Globe className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                                /{workspace.slug}
                            </span>
                            <span>•</span>
                            <span className="inline-flex items-center">
                                <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                                Created {new Date(workspace.created_at).toLocaleDateString()}
                            </span>
                            <span>•</span>
                            <span className="inline-flex items-center">
                                <Layers className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                                {stats.total} Projects Total
                            </span>
                        </div>
                    </div>

                    <Link
                        href={`/generate-prompt?workspace_id=${workspace.id}`}
                        className="inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-10 px-5 py-2 shrink-0"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Project
                    </Link>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 sm:p-5 bg-card rounded-xl border border-border shadow-xs flex items-center justify-between">
                        <div>
                            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Total Projects
                            </div>
                            <div className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
                                {stats.total}
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Layers className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="p-4 sm:p-5 bg-card rounded-xl border border-border shadow-xs flex items-center justify-between">
                        <div>
                            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Live on Vercel
                            </div>
                            <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-2">
                                {stats.deployed}
                                {stats.deployed > 0 && (
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                )}
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <Rocket className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="p-4 sm:p-5 bg-card rounded-xl border border-border shadow-xs flex items-center justify-between">
                        <div>
                            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                In Draft / Editable
                            </div>
                            <div className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
                                {stats.drafts}
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                            <LayoutTemplate className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                {projects.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-card border border-border rounded-xl shadow-xs">
                        {/* Search Input */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search projects by name..."
                                className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground placeholder:text-muted-foreground"
                            />
                        </div>

                        {/* Status Pills & Sort */}
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Filter Pills */}
                            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg">
                                <button
                                    onClick={() => setStatusFilter('all')}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                                        statusFilter === 'all'
                                            ? 'bg-card text-foreground shadow-xs font-semibold'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    All ({stats.total})
                                </button>
                                <button
                                    onClick={() => setStatusFilter('deployed')}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                                        statusFilter === 'deployed'
                                            ? 'bg-card text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Live ({stats.deployed})
                                </button>
                                <button
                                    onClick={() => setStatusFilter('draft')}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                                        statusFilter === 'draft'
                                            ? 'bg-card text-foreground shadow-xs font-semibold'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Drafts ({stats.drafts})
                                </button>
                            </div>

                            {/* Sort Selector */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="name">Alphabetical (A-Z)</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Projects Grid */}
                {filteredProjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map((project) => {
                            const isDeployed = project.deployment_status === 'deployed' || project.status === 'deployed';
                            const isDeploying = project.deployment_status === 'deploying';
                            const liveUrl = project.project_url || (project.vercel_project_name ? `https://${project.vercel_project_name}.vercel.app` : null);

                            return (
                                <div
                                    key={project.id}
                                    className="flex flex-col bg-card rounded-xl border border-border shadow-xs hover:shadow-md transition-all group overflow-hidden"
                                >
                                    {/* Card Visual Header */}
                                    <div className="h-20 bg-gradient-to-r from-primary/10 via-accent/20 to-primary/5 p-4 flex items-center justify-between border-b border-border/50 relative">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-card border border-border shadow-xs flex items-center justify-center font-bold text-primary">
                                                {project.project_name ? project.project_name.charAt(0).toUpperCase() : 'P'}
                                            </div>
                                            <div>
                                                <h2 className="text-base font-semibold text-foreground truncate max-w-[180px] group-hover:text-primary transition-colors">
                                                    {project.project_name}
                                                </h2>
                                                <span className="text-[11px] text-muted-foreground">
                                                    {new Date(project.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        {isDeployed ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                Live
                                            </span>
                                        ) : isDeploying ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/15 text-indigo-500 border border-indigo-500/30">
                                                <Rocket className="w-3 h-3 animate-spin" />
                                                Deploying
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                Draft
                                            </span>
                                        )}
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-5 flex-1 flex flex-col justify-between">
                                        <div>
                                            {/* Live Domain Preview */}
                                            {liveUrl ? (
                                                <div className="mb-4 flex items-center justify-between p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                                                    <a
                                                        href={liveUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs font-mono text-emerald-600 dark:text-emerald-400 hover:underline truncate flex items-center gap-1"
                                                    >
                                                        <Globe className="w-3.5 h-3.5 shrink-0" />
                                                        {liveUrl.replace(/^https?:\/\//, '')}
                                                    </a>
                                                    <button
                                                        onClick={(e) => handleCopyUrl(e, project.id, liveUrl)}
                                                        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                                                        title="Copy Live URL"
                                                    >
                                                        {copiedId === project.id ? (
                                                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                        ) : (
                                                            <Copy className="w-3.5 h-3.5" />
                                                        )}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="text-xs text-muted-foreground mb-4 italic p-2 rounded-lg bg-muted/40 border border-border/40">
                                                    Ready for deployment
                                                </div>
                                            )}
                                        </div>

                                        {/* Card Footer & Actions */}
                                        <div className="pt-3 border-t border-border flex items-center justify-between">
                                            {isDeployed ? (
                                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Lock className="w-3 h-3" /> Locked
                                                </span>
                                            ) : (
                                                <Link
                                                    href={`/projects/${project.id}/edit`}
                                                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                                                >
                                                    <Edit3 className="w-3 h-3" /> Edit Page
                                                </Link>
                                            )}

                                            <Link
                                                href={`/projects/${project.id}`}
                                                className="inline-flex items-center gap-1 text-xs font-semibold text-foreground hover:text-primary transition-colors group-hover:translate-x-0.5 transform duration-150"
                                            >
                                                View Details
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : projects.length > 0 ? (
                    /* Search empty state */
                    <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border shadow-xs text-center">
                        <Search className="w-10 h-10 text-muted-foreground mb-3 opacity-40" />
                        <h3 className="text-lg font-semibold text-foreground">No matching projects</h3>
                        <p className="text-xs text-muted-foreground mt-1 mb-4">
                            No projects matched your search term "{searchQuery}".
                        </p>
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setStatusFilter('all');
                            }}
                            className="text-xs font-medium text-primary hover:underline"
                        >
                            Reset filters
                        </button>
                    </div>
                ) : (
                    /* Workspace Empty State */
                    <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border border-dashed shadow-xs text-center flex-1">
                        <div className="h-14 w-14 text-muted-foreground mb-4 bg-muted rounded-full flex items-center justify-center">
                            <LayoutTemplate className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground">No projects yet</h3>
                        <p className="mt-1 text-xs sm:text-sm text-muted-foreground mb-6 max-w-sm">
                            Your workspace is ready. Generate custom websites with AI or launch your first digital experience right here.
                        </p>
                        <Link
                            href={`/generate-prompt?workspace_id=${workspace.id}`}
                            className="inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-colors bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-10 px-5 py-2"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Your First Project
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}
