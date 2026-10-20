import { useState, useEffect } from 'react';
import { Head, Link, router, setLayoutProps } from '@inertiajs/react';
import {
    AlertTriangle,
    Clock,
    Search,
    ClipboardList,
    ExternalLink,
    FileCode,
    X,
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { show as adminRequestShow } from '@/routes/admin/requests';

interface AdminRequestSummary {
    id: number;
    category: string;
    category_label: string;
    category_icon: string;
    title: string;
    description?: string;
    status: string;
    status_label: string;
    status_color: string;
    project: {
        id: number;
        name: string;
        is_deployed?: boolean;
        vercel_dashboard_url?: string | null;
    } | null;
    client: { id: number; name: string; email: string } | null;
    admin: { id: number; name: string } | null;
    is_ageing: boolean;
    is_urgent: boolean;
    created_at: string;
    completed_at: string | null;
}

interface PaginatedRequests {
    data: AdminRequestSummary[];
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
    reviewing: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    in_progress: 'bg-purple-500/10 text-purple-500 dark:text-purple-400 border-purple-500/30',
    completed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    rejected: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
    cancelled: 'bg-muted text-muted-foreground border-border',
};

function DynamicIcon({ name, className }: { name: string; className?: string }) {
    const IconComp = (Icons as Record<string, any>)[name];
    if (!IconComp) return null;
    return <IconComp className={className} />;
}

function ageLabel(createdAt: string) {
    const ms = Date.now() - new Date(createdAt).getTime();
    const hours = Math.floor(ms / 1000 / 60 / 60);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export default function AdminRequestsIndex({
    requests,
    pagination: paginationProp,
    statusOptions = [],
    categoryOptions = [],
    filters = {},
    counts = { open: 0, urgent: 0 },
}: {
    requests: PaginatedRequests | AdminRequestSummary[];
    pagination?: PaginatedRequests;
    statusOptions: { value: string; label: string }[];
    categoryOptions?: { value: string; label: string }[];
    filters?: { q?: string; status?: string; category?: string };
    counts?: { open: number; urgent: number };
}) {
    // Normalise request items whether passed as paginated object or array
    const isPaginated = !Array.isArray(requests) && 'data' in requests;
    const requestItems: AdminRequestSummary[] = isPaginated ? (requests as PaginatedRequests).data : (requests as AdminRequestSummary[]);
    const pagination = paginationProp || (isPaginated ? (requests as PaginatedRequests) : null);

    const [search, setSearch] = useState(filters.q || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'open');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');

    setLayoutProps({
        breadcrumbs: [
            { title: 'Admin', href: '/admin/dashboard' },
            { title: 'Service Requests', href: '/admin/requests' },
        ],
    });

    // Debounced search that visits server
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.q || '')) {
                router.get(
                    '/admin/requests',
                    { q: search, status: statusFilter, category: categoryFilter },
                    { preserveState: true, replace: true }
                );
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const handleFilterChange = (newStatus: string, newCategory: string) => {
        setStatusFilter(newStatus);
        setCategoryFilter(newCategory);
        router.get(
            '/admin/requests',
            { q: search, status: newStatus, category: newCategory },
            { preserveState: true, replace: true }
        );
    };

    const openCount = counts.open || requestItems.filter((r) => !['completed', 'rejected', 'cancelled'].includes(r.status)).length;
    const urgentCount = counts.urgent || requestItems.filter((r) => r.is_urgent).length;
    const totalCount = pagination ? pagination.total : requestItems.length;

    return (
        <>
            <Head title="Service Requests | Admin | StudioSync" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-hidden p-4 sm:p-6 lg:p-8 bg-background text-foreground">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Service Requests</h1>
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                                {totalCount} Requests
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            <span className="font-semibold text-foreground">{openCount}</span> open request{openCount !== 1 ? 's' : ''}
                            {urgentCount > 0 && (
                                <span className="ml-2 inline-flex items-center gap-1 text-red-500 font-semibold bg-red-500/10 px-2 py-0.5 rounded-full text-xs">
                                    <AlertTriangle className="w-3 h-3" />
                                    {urgentCount} urgent
                                </span>
                            )}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/admin/dashboard"
                            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-card border border-border text-foreground hover:bg-muted shadow-xs transition-colors"
                        >
                            &larr; Admin Overview
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-card border border-border rounded-xl shadow-xs">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            id="admin-requests-search"
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by client, project, description..."
                            className="w-full pl-9 pr-8 py-1.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground placeholder:text-muted-foreground"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1 bg-muted/60 p-1 rounded-lg">
                        {[
                            { key: 'open', label: 'Open' },
                            { key: 'all', label: 'All' },
                            ...statusOptions.map((s) => ({ key: s.value, label: s.label })),
                        ].map(({ key, label }) => (
                            <button
                                key={key}
                                id={`admin-filter-${key}`}
                                onClick={() => handleFilterChange(key, categoryFilter)}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                                    statusFilter === key
                                        ? 'bg-card text-foreground shadow-xs font-semibold'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {categoryOptions.length > 0 && (
                        <select
                            id="category-filter"
                            value={categoryFilter}
                            onChange={(e) => handleFilterChange(statusFilter, e.target.value)}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                            <option value="all">All Categories</option>
                            {categoryOptions.map((c) => (
                                <option key={c.value} value={c.value}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Table / List */}
                {requestItems.length > 0 ? (
                    <div className="flex flex-col gap-2.5">
                        {requestItems.map((request) => (
                            <div
                                key={request.id}
                                id={`admin-request-${request.id}`}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-card rounded-xl border border-border shadow-xs hover:shadow-md hover:border-primary/30 transition-all group"
                            >
                                <div className="flex items-start gap-4 min-w-0">
                                    {/* Urgency indicator */}
                                    <div className="shrink-0 flex flex-col items-center gap-1 pt-0.5">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                            <DynamicIcon name={request.category_icon} className="w-5 h-5" />
                                        </div>
                                        {request.is_urgent && (
                                            <span className="text-[9px] font-bold text-red-500 bg-red-500/10 rounded-full px-1.5 py-0.5 leading-none">
                                                URGENT
                                            </span>
                                        )}
                                        {!request.is_urgent && request.is_ageing && (
                                            <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 rounded-full px-1.5 py-0.5 leading-none">
                                                AGING
                                            </span>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <Link
                                                href={adminRequestShow(request.id)}
                                                className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors hover:underline"
                                            >
                                                {request.title}
                                            </Link>
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
                                                    STATUS_STYLES[request.status] ?? ''
                                                }`}
                                            >
                                                {request.status_label}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                            <span className="font-medium text-foreground/70">{request.category_label}</span>
                                            {request.client && (
                                                <span>
                                                    Client: <span className="text-foreground">{request.client.name}</span>
                                                </span>
                                            )}
                                            {request.project && (
                                                <span>
                                                    Project: <span className="text-foreground font-medium">{request.project.name}</span>
                                                </span>
                                            )}
                                            <span className="inline-flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {ageLabel(request.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side Actions: Work on Request, Website Editor, Manage on Vercel */}
                                <div className="shrink-0 flex flex-wrap items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                                    {request.project && (
                                        <Link
                                            href={`/projects/${request.project.id}/edit?request_id=${request.id}`}
                                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-muted hover:bg-primary hover:text-primary-foreground text-foreground transition-all flex items-center gap-1.5 shadow-xs"
                                            title="Open website editor with live real-time HTML editing"
                                        >
                                            <FileCode className="w-3.5 h-3.5" />
                                            <span>Live Editor</span>
                                        </Link>
                                    )}

                                    {request.project?.is_deployed && (
                                        <a
                                            href={`/admin/projects/${request.project.id}/vercel-redirect`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 text-zinc-100 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1"
                                            title="Manage Vercel deployment, CDN, and domains"
                                        >
                                            <span>Vercel</span>
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}

                                    <Link
                                        href={adminRequestShow(request.id)}
                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs transition-all"
                                    >
                                        Review Request &rarr;
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center flex-1 p-12 bg-card rounded-xl border border-border border-dashed shadow-xs text-center">
                        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <ClipboardList className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground">No requests found</h3>
                        <p className="mt-2 text-sm text-muted-foreground mb-4">
                            {search || statusFilter !== 'open' || categoryFilter !== 'all'
                                ? 'Try adjusting your filters or search keywords.'
                                : 'No client requests have been submitted yet.'}
                        </p>
                    </div>
                )}

                {/* Server-side Pagination Bar */}
                {pagination && pagination.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                        <div>
                            Showing page <span className="font-semibold text-foreground">{pagination.current_page}</span> of{' '}
                            <span className="font-semibold text-foreground">{pagination.last_page}</span> ({pagination.total} requests)
                        </div>

                        <div className="flex items-center gap-1">
                            {pagination.links.map((link, i) => {
                                if (!link.url) {
                                    return (
                                        <span
                                            key={i}
                                            className="px-2.5 py-1 rounded text-muted-foreground opacity-50"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                }
                                return (
                                    <Link
                                        key={i}
                                        href={link.url}
                                        preserveState
                                        className={`px-2.5 py-1 rounded transition-colors ${
                                            link.active
                                                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                                                : 'hover:bg-muted text-foreground'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
