import { useState, useEffect } from 'react';
import { Head, Link, router, setLayoutProps } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    BookOpen,
    CheckCircle2,
    Clock,
    FileText,
    FolderGit2,
    Layers,
    Search,
    Shield,
    ShieldCheck,
    User as UserIcon,
    Users,
    X,
} from 'lucide-react';

interface PaginatedUsers {
    data: UserSummary[];
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface UserSummary {
    id: number;
    name: string;
    email: string;
    roles: string[];
    is_admin: boolean;
    projects_count: number;
    workspaces_count: number;
    requests_count: number;
    email_verified_at: string | null;
    created_at: string | null;
}

function formatDate(iso?: string | null) {
    if (!iso) return 'N/A';
    return new Date(iso).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function AdminUsersIndex({
    users,
    filters,
    stats,
}: {
    users: PaginatedUsers;
    filters: { q?: string; role?: string };
    stats: { total_users: number; total_clients: number; total_admins: number };
}) {
    const [search, setSearch] = useState(filters.q || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || 'all');

    setLayoutProps({
        breadcrumbs: [
            { title: 'Admin', href: '/admin/dashboard' },
            { title: 'Users & Clients', href: '/admin/users' },
        ],
    });

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.q || '')) {
                router.get(
                    '/admin/users',
                    { q: search, role: roleFilter },
                    { preserveState: true, replace: true }
                );
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const handleRoleChange = (newRole: string) => {
        setRoleFilter(newRole);
        router.get(
            '/admin/users',
            { q: search, role: newRole },
            { preserveState: true, replace: true }
        );
    };

    return (
        <>
            <Head title="Users & Clients | Admin | StudioSync" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-hidden p-4 sm:p-6 lg:p-8 bg-background text-foreground">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                Users & Clients Directory
                            </h1>
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                                {users.total} Total
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Browse registered users, inspect client websites, media assets, and service request history.
                        </p>
                    </div>

                    {/* Stats counters */}
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1.5 rounded-lg bg-card border border-border shadow-xs text-xs">
                            <span className="text-muted-foreground">Clients: </span>
                            <span className="font-bold text-foreground">{stats.total_clients}</span>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-card border border-border shadow-xs text-xs">
                            <span className="text-muted-foreground">Staff & Admins: </span>
                            <span className="font-bold text-foreground">{stats.total_admins}</span>
                        </div>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-card border border-border rounded-xl shadow-xs">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            id="admin-users-search"
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or email..."
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

                    <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg">
                        {[
                            { key: 'all', label: 'All Users' },
                            { key: 'client', label: 'Clients Only' },
                            { key: 'admin', label: 'Admins & Staff' },
                        ].map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => handleRoleChange(key)}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                                    roleFilter === key
                                        ? 'bg-card text-foreground shadow-xs font-semibold'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Users List */}
                {users.data.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {users.data.map((user) => (
                            <div
                                key={user.id}
                                className="flex flex-col justify-between p-5 bg-card rounded-xl border border-border shadow-xs hover:shadow-md hover:border-primary/40 transition-all group"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                                                    {user.name}
                                                </h3>
                                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                            </div>
                                        </div>

                                        <div className="shrink-0 flex flex-col items-end gap-1">
                                            {user.is_admin ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                                    <ShieldCheck className="w-3 h-3" />
                                                    {user.roles.includes('super_admin') ? 'Super Admin' : 'Admin'}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                                    Client
                                                </span>
                                            )}
                                            {user.email_verified_at && (
                                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
                                                    <CheckCircle2 className="w-3 h-3" /> Verified
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stats Chips */}
                                    <div className="grid grid-cols-2 gap-2 my-3 py-2.5 px-3 rounded-lg bg-muted/40 border border-border/50 text-xs">
                                        <div className="flex items-center gap-1.5">
                                            <BookOpen className="w-3.5 h-3.5 text-primary" />
                                            <span className="text-muted-foreground">Projects:</span>
                                            <span className="font-bold text-foreground ml-auto">{user.projects_count}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <FileText className="w-3.5 h-3.5 text-primary" />
                                            <span className="text-muted-foreground">Requests:</span>
                                            <span className="font-bold text-foreground ml-auto">{user.requests_count}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Joined {formatDate(user.created_at)}</span>

                                    <Link
                                        href={`/admin/users/${user.id}`}
                                        className="inline-flex items-center gap-1 font-semibold text-primary hover:underline group-hover:translate-x-0.5 transition-transform"
                                    >
                                        <span>Projects & Assets</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border border-dashed shadow-xs text-center">
                        <div className="h-14 w-14 bg-muted rounded-full flex items-center justify-center mb-3">
                            <Users className="w-7 h-7 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">No users found</h3>
                        <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                            {search || roleFilter !== 'all'
                                ? 'No users matched your search filters. Try adjusting your search term or role selection.'
                                : 'No registered users found.'}
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {users.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                        <div>
                            Showing page <span className="font-semibold text-foreground">{users.current_page}</span> of{' '}
                            <span className="font-semibold text-foreground">{users.last_page}</span> ({users.total} users)
                        </div>

                        <div className="flex items-center gap-1">
                            {users.links.map((link, i) => {
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
