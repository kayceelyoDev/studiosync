import { useState, useMemo } from 'react';
import { Head, Link, setLayoutProps } from '@inertiajs/react';
import {
    ClipboardList,
    Plus,
    Clock,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Search,
    Filter,
} from 'lucide-react';
import { index as requestsIndex, create as requestsCreate, show as requestsShow } from '@/routes/requests';
import * as Icons from 'lucide-react';

interface ClientRequestSummary {
    id: number;
    category: string;
    category_label: string;
    category_icon: string;
    title: string;
    status: string;
    status_label: string;
    status_color: string;
    project: { id: number; name: string } | null;
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

function UrgencyBadge({ request }: { request: ClientRequestSummary }) {
    if (request.status === 'completed' || request.status === 'rejected' || request.status === 'cancelled') return null;
    if (request.is_urgent) {
        return (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-500 bg-red-500/10 border border-red-500/30 rounded-full px-1.5 py-0.5">
                <AlertTriangle className="w-2.5 h-2.5" />
                Urgent
            </span>
        );
    }
    if (request.is_ageing) {
        return (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/30 rounded-full px-1.5 py-0.5">
                <Clock className="w-2.5 h-2.5" />
                Aging
            </span>
        );
    }
    return null;
}

export default function RequestsIndex({ requests }: { requests: ClientRequestSummary[] }) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    setLayoutProps({
        breadcrumbs: [
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'My Requests', href: requestsIndex() },
        ],
    });

    const filtered = useMemo(() => {
        return requests.filter((r) => {
            const matchesSearch =
                r.title.toLowerCase().includes(search.toLowerCase()) ||
                r.category_label.toLowerCase().includes(search.toLowerCase()) ||
                r.project?.name.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [requests, search, statusFilter]);

    const counts = useMemo(() => ({
        all:         requests.length,
        pending:     requests.filter((r) => r.status === 'pending').length,
        in_progress: requests.filter((r) => r.status === 'in_progress' || r.status === 'reviewing').length,
        completed:   requests.filter((r) => r.status === 'completed').length,
    }), [requests]);

    return (
        <>
            <Head title="My Requests | StudioSync" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-hidden rounded-xl p-4 sm:p-6 lg:p-8 bg-background text-foreground">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">My Requests</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Submit and track service requests for your projects.
                        </p>
                    </div>
                    <Link
                        href={requestsCreate()}
                        className="inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-10 px-5 py-2 shrink-0"
                        id="new-request-btn"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Request
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-card border border-border rounded-xl shadow-xs">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            id="requests-search"
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search requests..."
                            className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground placeholder:text-muted-foreground"
                        />
                    </div>

                    <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg">
                        {[
                            { key: 'all', label: `All (${counts.all})` },
                            { key: 'pending', label: `Pending (${counts.pending})` },
                            { key: 'in_progress', label: `Active (${counts.in_progress})` },
                            { key: 'completed', label: `Done (${counts.completed})` },
                        ].map(({ key, label }) => (
                            <button
                                key={key}
                                id={`filter-${key}`}
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
                </div>

                {/* Request List */}
                {filtered.length > 0 ? (
                    <div className="flex flex-col gap-3">
                        {filtered.map((request) => (
                            <Link
                                key={request.id}
                                href={requestsShow(request.id)}
                                id={`request-${request.id}`}
                                className="flex items-start gap-4 p-4 sm:p-5 bg-card rounded-xl border border-border shadow-xs hover:shadow-md transition-all hover:border-primary/30 group"
                            >
                                {/* Icon */}
                                <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <DynamicIcon name={request.category_icon} className="w-5 h-5" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                            {request.title}
                                        </span>
                                        <UrgencyBadge request={request} />
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                        <span className="text-xs font-medium text-muted-foreground/80">
                                            {request.category_label}
                                        </span>
                                        {request.project && (
                                            <>
                                                <span>•</span>
                                                <span>{request.project.name}</span>
                                            </>
                                        )}
                                        <span>•</span>
                                        <span>{new Date(request.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[request.status] ?? ''}`}>
                                    {request.status_label}
                                </span>
                            </Link>
                        ))}
                    </div>
                ) : requests.length > 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border shadow-xs text-center">
                        <Filter className="w-10 h-10 text-muted-foreground mb-3 opacity-40" />
                        <h3 className="text-base font-semibold text-foreground">No matching requests</h3>
                        <button
                            onClick={() => { setSearch(''); setStatusFilter('all'); }}
                            className="mt-3 text-sm font-medium text-primary hover:underline"
                        >
                            Clear filters
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center flex-1 p-12 bg-card rounded-xl border border-border border-dashed shadow-xs text-center">
                        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <ClipboardList className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground">No requests yet</h3>
                        <p className="mt-2 text-sm text-muted-foreground mb-6 max-w-sm">
                            Submit a service request and our team will get back to you.
                        </p>
                        <Link
                            href={requestsCreate()}
                            className="inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-10 px-6 py-2"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Submit First Request
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}
