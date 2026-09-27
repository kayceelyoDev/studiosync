import { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, Clock, Search, ClipboardList } from 'lucide-react';
import * as Icons from 'lucide-react';
import { show as adminRequestShow } from '@/routes/admin/requests';

interface AdminRequestSummary {
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
    statusOptions,
}: {
    requests: AdminRequestSummary[];
    statusOptions: { value: string; label: string }[];
}) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('open');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const categories = useMemo(() => {
        const unique = Array.from(new Set(requests.map((r) => r.category)));
        return unique.map((c) => ({ value: c, label: requests.find((r) => r.category === c)?.category_label ?? c }));
    }, [requests]);

    const filtered = useMemo(() => {
        return requests.filter((r) => {
            const matchSearch =
                r.title.toLowerCase().includes(search.toLowerCase()) ||
                r.client?.name.toLowerCase().includes(search.toLowerCase()) ||
                r.project?.name.toLowerCase().includes(search.toLowerCase());

            const matchStatus =
                statusFilter === 'all'
                    ? true
                    : statusFilter === 'open'
                    ? !['completed', 'rejected', 'cancelled'].includes(r.status)
                    : r.status === statusFilter;

            const matchCategory = categoryFilter === 'all' || r.category === categoryFilter;

            return matchSearch && matchStatus && matchCategory;
        });
    }, [requests, search, statusFilter, categoryFilter]);

    const openCount = requests.filter((r) => !['completed', 'rejected', 'cancelled'].includes(r.status)).length;
    const urgentCount = requests.filter((r) => r.is_urgent).length;

    return (
        <>
            <Head title="Service Requests | Admin | StudioSync" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-hidden rounded-xl p-4 sm:p-6 lg:p-8 bg-background text-foreground">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Service Requests</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            <span className="font-semibold text-foreground">{openCount}</span> open request{openCount !== 1 ? 's' : ''}
                            {urgentCount > 0 && (
                                <span className="ml-2 inline-flex items-center gap-1 text-red-500">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    {urgentCount} urgent
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-card border border-border rounded-xl shadow-xs">
                    <div className="relative flex-1 max-w-xs">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            id="admin-requests-search"
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by client, project, title..."
                            className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground placeholder:text-muted-foreground"
                        />
                    </div>

                    <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg">
                        {[
                            { key: 'open', label: 'Open' },
                            { key: 'all', label: 'All' },
                            ...statusOptions.map((s) => ({ key: s.value, label: s.label })),
                        ].map(({ key, label }) => (
                            <button
                                key={key}
                                id={`admin-filter-${key}`}
                                onClick={() => setStatusFilter(key)}
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

                    <select
                        id="category-filter"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                        <option value="all">All Categories</option>
                        {categories.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                    </select>
                </div>

                {/* Table / List */}
                {filtered.length > 0 ? (
                    <div className="flex flex-col gap-2">
                        {filtered.map((request) => (
                            <Link
                                key={request.id}
                                href={adminRequestShow(request.id)}
                                id={`admin-request-${request.id}`}
                                className="flex items-start gap-4 p-4 sm:p-5 bg-card rounded-xl border border-border shadow-xs hover:shadow-md hover:border-primary/30 transition-all group"
                            >
                                {/* Urgency indicator */}
                                <div className="shrink-0 flex flex-col items-center gap-1.5 pt-0.5">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <DynamicIcon name={request.category_icon} className="w-5 h-5" />
                                    </div>
                                    {request.is_urgent && (
                                        <span className="text-[9px] font-bold text-red-500 bg-red-500/10 rounded-full px-1 py-0.5 leading-none">URGENT</span>
                                    )}
                                    {!request.is_urgent && request.is_ageing && (
                                        <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 rounded-full px-1 py-0.5 leading-none">AGING</span>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                            {request.title}
                                        </span>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLES[request.status] ?? ''}`}>
                                            {request.status_label}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                        <span className="font-medium text-foreground/70">{request.category_label}</span>
                                        {request.client && <span>Client: <span className="text-foreground">{request.client.name}</span></span>}
                                        {request.project && <span>Project: <span className="text-foreground">{request.project.name}</span></span>}
                                        <span className="inline-flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {ageLabel(request.created_at)}
                                        </span>
                                    </div>
                                </div>

                                {request.admin && (
                                    <span className="shrink-0 text-xs text-muted-foreground">
                                        Assigned to <span className="text-foreground font-medium">{request.admin.name}</span>
                                    </span>
                                )}
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center flex-1 p-12 bg-card rounded-xl border border-border border-dashed shadow-xs text-center">
                        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <ClipboardList className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground">No requests found</h3>
                        <p className="mt-2 text-sm text-muted-foreground mb-4">
                            {search || statusFilter !== 'open' ? 'Try adjusting your filters.' : 'No client requests have been submitted yet.'}
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}

AdminRequestsIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: '/admin/projects' },
        { title: 'Service Requests', href: '/admin/requests' },
    ],
};
