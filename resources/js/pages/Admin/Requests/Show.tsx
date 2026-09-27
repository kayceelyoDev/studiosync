import { useState } from 'react';
import { Head, Link, useForm, setLayoutProps } from '@inertiajs/react';
import {
    Download,
    Send,
    Upload,
    X,
    Loader2,
    Paperclip,
    AlertTriangle,
    Clock,
    Save,
    Maximize2,
    ExternalLink,
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { index as adminRequestsIndex, update as adminRequestUpdate } from '@/routes/admin/requests';
import { store as adminCommentStore } from '@/routes/admin/requests/comments';

interface Comment {
    id: number;
    body: string;
    attachment_url: string | null;
    user: { id: number; name: string };
    is_admin: boolean;
    created_at: string;
}

interface AdminRequestDetail {
    id: number;
    category: string;
    category_label: string;
    category_icon: string;
    title: string;
    description: string;
    attachment_url: string | null;
    status: string;
    status_label: string;
    status_color: string;
    admin_notes: string | null;
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

function formatDate(iso: string) {
    return new Date(iso).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

const isImageFile = (url?: string | null): boolean => {
    if (!url) return false;
    const cleanUrl = url.split('?')[0].toLowerCase();
    return /\.(png|jpe?g|gif|webp|svg|avif|bmp)$/.test(cleanUrl) || cleanUrl.startsWith('data:image/');
};

export default function AdminRequestsShow({
    request,
    comments,
    statusOptions,
    auth_user_id,
}: {
    request: AdminRequestDetail;
    comments: Comment[];
    statusOptions: { value: string; label: string }[];
    auth_user_id: number;
}) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);

    setLayoutProps({
        breadcrumbs: [
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Service Requests', href: adminRequestsIndex() },
            { title: `${request.title}${request.client ? ` (${request.client.name})` : ''}`, href: '#' },
        ],
    });

    const statusForm = useForm({
        status: request.status,
        admin_notes: request.admin_notes ?? '',
    });

    const commentForm = useForm<{ body: string; attachment: File | null }>({
        body: '',
        attachment: null,
    });

    const handleStatusSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        statusForm.put(adminRequestUpdate(request.id));
    };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        commentForm.post(adminCommentStore(request.id), {
            forceFormData: true,
            onSuccess: () => {
                commentForm.reset();
                setSelectedFile(null);
            },
        });
    };

    return (
        <>
            <Head title={`${request.title} | Admin Requests | StudioSync`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-hidden rounded-xl p-4 sm:p-6 lg:p-8 bg-background text-foreground">

                <div className="max-w-4xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left — Request detail + Chat */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {/* Request Info */}
                        <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
                            <div className="flex items-start gap-4 p-5 sm:p-6 border-b border-border">
                                <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <DynamicIcon name={request.category_icon} className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <h1 className="text-lg font-bold text-foreground">{request.title}</h1>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLES[request.status] ?? ''}`}>
                                            {request.status_label}
                                        </span>
                                        {request.is_urgent && (
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/30 rounded-full px-2 py-0.5">
                                                <AlertTriangle className="w-3 h-3" />
                                                Urgent
                                            </span>
                                        )}
                                        {!request.is_urgent && request.is_ageing && (
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/30 rounded-full px-2 py-0.5">
                                                <Clock className="w-3 h-3" />
                                                Aging
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                        <span>{request.category_label}</span>
                                        {request.client && <><span>•</span><span>{request.client.name} ({request.client.email})</span></>}
                                        {request.project && <><span>•</span><span>{request.project.name}</span></>}
                                        <span>•</span>
                                        <span>Submitted {formatDate(request.created_at)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 sm:p-6 space-y-4">
                                <div>
                                    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Description</h2>
                                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{request.description}</p>
                                </div>

                                {request.attachment_url && (
                                    <div>
                                        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Attachment</h2>
                                        {isImageFile(request.attachment_url) ? (
                                            <div
                                                onClick={() => setZoomedImageUrl(request.attachment_url)}
                                                className="group relative inline-block max-w-sm rounded-xl overflow-hidden border border-border bg-muted/40 cursor-pointer shadow-xs hover:border-primary/50 hover:shadow-md transition-all"
                                            >
                                                <img
                                                    src={request.attachment_url}
                                                    alt="Request Attachment"
                                                    className="w-full max-h-56 object-cover transition-transform duration-300 group-hover:scale-102"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 text-white text-xs font-semibold backdrop-blur-xs">
                                                        <Maximize2 className="w-3.5 h-3.5" />
                                                        Click to expand
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <a
                                                href={request.attachment_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
                                            >
                                                <Download className="w-4 h-4" />
                                                Download Attachment
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Chat Thread */}
                        <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
                            <div className="p-4 sm:p-5 border-b border-border">
                                <h2 className="text-sm font-semibold text-foreground">Discussion</h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {comments.length} {comments.length === 1 ? 'message' : 'messages'}
                                </p>
                            </div>

                            <div className="flex flex-col divide-y divide-border/50 max-h-[400px] overflow-y-auto">
                                {comments.length === 0 && (
                                    <div className="p-8 text-center text-sm text-muted-foreground">
                                        No messages yet. Start the conversation below.
                                    </div>
                                )}
                                {comments.map((comment) => (
                                    <div
                                        key={comment.id}
                                        className={`p-4 sm:p-5 flex gap-3 ${comment.is_admin ? 'bg-blue-500/3' : ''}`}
                                    >
                                        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                            comment.is_admin ? 'bg-blue-500/15 text-blue-500' : 'bg-primary/10 text-primary'
                                        }`}>
                                            {comment.user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-semibold text-foreground">{comment.user.name}</span>
                                                {comment.is_admin && (
                                                    <span className="text-[10px] font-semibold text-blue-500 bg-blue-500/10 border border-blue-500/20 rounded-full px-1.5 py-0.5">Admin</span>
                                                )}
                                                <span className="text-[11px] text-muted-foreground ml-auto">{formatDate(comment.created_at)}</span>
                                            </div>
                                            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{comment.body}</p>

                                            {/* Chat Attachment Preview */}
                                            {comment.attachment_url && (
                                                isImageFile(comment.attachment_url) ? (
                                                    <div className="mt-2.5">
                                                        <div
                                                            onClick={() => setZoomedImageUrl(comment.attachment_url)}
                                                            className="group relative inline-block max-w-xs sm:max-w-sm rounded-xl overflow-hidden border border-border bg-muted/40 cursor-pointer shadow-xs hover:border-primary/50 hover:shadow-md transition-all"
                                                        >
                                                            <img
                                                                src={comment.attachment_url}
                                                                alt="Comment Attachment"
                                                                className="w-full max-h-56 object-cover transition-transform duration-300 group-hover:scale-102"
                                                            />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 text-white text-xs font-semibold backdrop-blur-xs">
                                                                    <Maximize2 className="w-3.5 h-3.5" />
                                                                    Click to expand
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <a
                                                        href={comment.attachment_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg border border-border bg-muted/40 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                                                    >
                                                        <Paperclip className="w-3.5 h-3.5 text-primary" />
                                                        <span>Attachment File</span>
                                                        <ExternalLink className="w-3 h-3 text-muted-foreground ml-1" />
                                                    </a>
                                                )
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 sm:p-5 border-t border-border">
                                <form onSubmit={handleCommentSubmit} className="space-y-3">
                                    <textarea
                                        id="admin-comment-body"
                                        rows={3}
                                        placeholder="Write a reply to the client..."
                                        value={commentForm.data.body}
                                        onChange={(e) => commentForm.setData('body', e.target.value)}
                                        className={`w-full px-4 py-2.5 text-sm rounded-lg border bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground ${commentForm.errors.body ? 'border-red-500' : 'border-border'}`}
                                    />

                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            {!selectedFile ? (
                                                <label htmlFor="admin-comment-attachment" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer">
                                                    <Paperclip className="w-3.5 h-3.5" />
                                                    Attach file
                                                    <input
                                                        id="admin-comment-attachment"
                                                        type="file"
                                                        className="sr-only"
                                                        accept=".jpg,.jpeg,.png,.gif,.pdf,.zip,.doc,.docx,.txt"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0] ?? null;
                                                            setSelectedFile(file);
                                                            commentForm.setData('attachment', file);
                                                        }}
                                                    />
                                                </label>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-xs text-foreground">
                                                    <Upload className="w-3.5 h-3.5 text-primary" />
                                                    <span className="truncate max-w-[120px]">{selectedFile.name}</span>
                                                    <button type="button" onClick={() => { setSelectedFile(null); commentForm.setData('attachment', null); }}>
                                                        <X className="w-3.5 h-3.5 text-muted-foreground" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            id="admin-send-comment-btn"
                                            type="submit"
                                            disabled={commentForm.processing || !commentForm.data.body.trim()}
                                            className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold transition-all bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-9 px-4 disabled:opacity-50 disabled:pointer-events-none"
                                        >
                                            {commentForm.processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                            Reply
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Right — Admin Actions */}
                    <div className="flex flex-col gap-4">
                        <form onSubmit={handleStatusSubmit} className="bg-card border border-border rounded-xl shadow-xs p-5 space-y-4">
                            <h2 className="text-sm font-semibold text-foreground">Update Request</h2>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-medium text-muted-foreground" htmlFor="status-select">
                                    Status
                                </label>
                                <select
                                    id="status-select"
                                    value={statusForm.data.status}
                                    onChange={(e) => statusForm.setData('status', e.target.value)}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                                >
                                    {statusOptions.map((s) => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                    ))}
                                </select>
                                {statusForm.errors.status && <p className="text-xs text-red-500">{statusForm.errors.status}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-medium text-muted-foreground" htmlFor="admin-notes">
                                    Internal Notes <span className="text-[10px]">(not shown in chat)</span>
                                </label>
                                <textarea
                                    id="admin-notes"
                                    rows={4}
                                    placeholder="Add internal notes about this request..."
                                    value={statusForm.data.admin_notes}
                                    onChange={(e) => statusForm.setData('admin_notes', e.target.value)}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground"
                                />
                            </div>

                            <button
                                id="save-request-btn"
                                type="submit"
                                disabled={statusForm.processing}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-10 px-4 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {statusForm.processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Changes
                            </button>
                        </form>

                        {/* Meta info */}
                        <div className="bg-card border border-border rounded-xl shadow-xs p-5 space-y-3">
                            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Details</h2>
                            <dl className="space-y-2 text-xs">
                                {request.client && (
                                    <div>
                                        <dt className="text-muted-foreground">Client</dt>
                                        <dd className="text-foreground font-medium">{request.client.name}</dd>
                                        <dd className="text-muted-foreground">{request.client.email}</dd>
                                    </div>
                                )}
                                {request.project && (
                                    <div>
                                        <dt className="text-muted-foreground">Project</dt>
                                        <dd className="text-foreground font-medium">{request.project.name}</dd>
                                    </div>
                                )}
                                <div>
                                    <dt className="text-muted-foreground">Submitted</dt>
                                    <dd className="text-foreground">{formatDate(request.created_at)}</dd>
                                </div>
                                {request.completed_at && (
                                    <div>
                                        <dt className="text-muted-foreground">Completed</dt>
                                        <dd className="text-emerald-500">{formatDate(request.completed_at)}</dd>
                                    </div>
                                )}
                                {request.admin && (
                                    <div>
                                        <dt className="text-muted-foreground">Assigned to</dt>
                                        <dd className="text-foreground font-medium">{request.admin.name}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            {/* Full-Screen Image Lightbox Zoom Modal */}
            {zoomedImageUrl && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-8 animate-in fade-in duration-200"
                    onClick={() => setZoomedImageUrl(null)}
                >
                    <div
                        className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-full flex items-center justify-between pb-3">
                            <span className="text-xs font-semibold text-white/80">Attachment Preview</span>
                            <button
                                type="button"
                                onClick={() => setZoomedImageUrl(null)}
                                className="p-1.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-colors"
                                title="Close preview"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <img
                            src={zoomedImageUrl}
                            alt="Attachment Preview"
                            className="max-h-[80vh] max-w-full rounded-xl object-contain shadow-2xl border border-white/10"
                        />
                    </div>
                </div>
            )}
        </>
    );
}

AdminRequestsShow.layout = {
    breadcrumbs: [
        { title: 'Admin', href: '/admin/projects' },
        { title: 'Service Requests', href: '/admin/requests' },
        { title: 'Request Detail', href: '#' },
    ],
};
