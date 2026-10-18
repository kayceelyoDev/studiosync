import React, { useState } from 'react';
import { Head, Link, setLayoutProps } from '@inertiajs/react';
import {
    ChevronLeft,
    Mail,
    Search,
    ChevronDown,
    ChevronUp,
    Calendar,
    Send,
    ExternalLink,
    CheckCircle2,
    Inbox,
} from 'lucide-react';

interface ContactMessageItem {
    id: number;
    guest_name: string;
    guest_email: string;
    subject: string;
    message: string;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedMessages {
    data: ContactMessageItem[];
    current_page: number;
    last_page: number;
    total: number;
    links: PaginationLink[];
}

interface Props {
    project: {
        id: number;
        project_name: string;
        workspace_id: number;
    };
    emailer: {
        is_active: boolean;
        recipient_email: string;
    };
    messages: PaginatedMessages;
}

function formatDate(iso: string) {
    if (!iso) return '';
    return new Date(iso).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function ContactMessages({ project, emailer, messages }: Props) {
    const [search, setSearch] = useState('');
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

    setLayoutProps({
        breadcrumbs: [
            { title: 'Dashboard', href: '/dashboard' },
            { title: project.project_name, href: `/projects/${project.id}` },
            { title: 'Contact Messages', href: '#' },
        ],
    });

    const toggleExpand = (id: number) => {
        setExpandedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const filteredMessages = messages.data.filter((msg) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            msg.guest_name.toLowerCase().includes(q) ||
            msg.guest_email.toLowerCase().includes(q) ||
            msg.subject.toLowerCase().includes(q) ||
            msg.message.toLowerCase().includes(q)
        );
    });

    return (
        <>
            <Head title={`Contact Messages - ${project.project_name} | StudioSync`} />

            <div className="flex flex-col flex-1 h-full min-h-screen bg-background text-foreground">
                <div className="w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 mx-auto flex flex-col gap-6">

                    {/* Top Action Bar & Breadcrumb */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
                        <div className="flex items-start sm:items-center gap-4">
                            <Link
                                href={`/projects/${project.id}`}
                                className="shrink-0 flex items-center justify-center w-10 h-10 transition-colors bg-card border rounded-full shadow-xs text-muted-foreground hover:text-foreground hover:bg-muted border-border"
                                title="Back to Project"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </Link>

                            <div>
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                        Contact Messages
                                    </h1>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                        emailer.is_active
                                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                                            : 'bg-muted text-muted-foreground border border-border'
                                    }`}>
                                        {emailer.is_active ? 'Emailer Active' : 'Emailer Inactive'}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                                    <span>
                                        Project: <strong className="text-foreground font-medium">{project.project_name}</strong>
                                    </span>
                                    <span>•</span>
                                    <span>
                                        Forwarding to: <strong className="text-foreground font-medium">{emailer.recipient_email}</strong>
                                    </span>
                                    <span>•</span>
                                    <span>
                                        Total received: <strong className="text-foreground font-medium">{messages.total}</strong>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full md:w-72">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Filter messages..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground"
                            />
                        </div>
                    </div>

                    {/* How replies work helper banner */}
                    <div className="p-4 rounded-xl border border-border bg-card shadow-xs flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div className="text-xs text-muted-foreground leading-relaxed">
                            <strong className="text-foreground font-semibold">Replying to your guests:</strong> When guests submit inquiries on your site, an email notification is automatically delivered to your inbox (<span className="text-foreground font-medium">{emailer.recipient_email}</span>). Hitting <strong className="text-foreground">Reply</strong> directly in your email client will respond straight to the guest.
                        </div>
                    </div>

                    {/* Messages List / Table */}
                    {filteredMessages.length > 0 ? (
                        <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden divide-y divide-border">
                            {filteredMessages.map((msg) => {
                                const isExpanded = expandedIds.includes(msg.id);
                                return (
                                    <div key={msg.id} className="transition-colors hover:bg-muted/30">
                                        <div
                                            onClick={() => toggleExpand(msg.id)}
                                            className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                                        >
                                            <div className="flex items-start gap-3 min-w-0">
                                                <div className="shrink-0 w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                                                    {msg.guest_name ? msg.guest_name.charAt(0) : 'G'}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="text-sm font-semibold text-foreground">
                                                            {msg.guest_name}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground font-mono">
                                                            ({msg.guest_email})
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-foreground/90 font-medium mt-0.5 truncate">
                                                        {msg.subject || '(No Subject)'}
                                                    </div>
                                                    {!isExpanded && (
                                                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                                            {msg.message}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 sm:self-center self-end shrink-0">
                                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {formatDate(msg.created_at)}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleExpand(msg.id);
                                                    }}
                                                    className="p-1 rounded text-muted-foreground hover:text-foreground"
                                                >
                                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Expanded Message Details */}
                                        {isExpanded && (
                                            <div className="px-5 pb-5 pt-1 space-y-4 bg-muted/20 border-t border-border/50">
                                                <div className="p-4 rounded-lg bg-background border border-border">
                                                    <div className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">
                                                        Message Body
                                                    </div>
                                                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                                                        {msg.message}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <a
                                                        href={`mailto:${msg.guest_email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs"
                                                    >
                                                        <Send className="w-3.5 h-3.5" />
                                                        Reply to {msg.guest_name} via Email
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-12 text-center bg-card rounded-xl border border-border shadow-xs space-y-3">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                                <Inbox className="w-6 h-6" />
                            </div>
                            <h3 className="text-base font-semibold text-foreground">
                                {search ? 'No matching messages found' : 'No messages received yet'}
                            </h3>
                            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                                {search
                                    ? 'Try adjusting your search criteria.'
                                    : 'Once visitors submit contact inquiries on your live website, their messages will appear here and in your inbox.'}
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {messages.links && messages.links.length > 3 && (
                        <div className="flex items-center justify-center gap-1 pt-4">
                            {messages.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url ?? '#'}
                                    preserveScroll
                                    className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                                        link.active
                                            ? 'bg-primary text-primary-foreground font-semibold'
                                            : link.url
                                            ? 'hover:bg-muted text-foreground'
                                            : 'text-muted-foreground cursor-not-allowed opacity-50'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </>
    );
}
