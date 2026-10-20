import { useState } from 'react';
import { Head, Link, setLayoutProps } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowUpRight,
    BookOpen,
    Check,
    CheckCircle2,
    Clock,
    Copy,
    Download,
    ExternalLink,
    FileCode,
    FileImage,
    FileText,
    Globe,
    ImageIcon,
    Layers,
    ListFilter,
    Maximize2,
    Rocket,
    ShieldCheck,
    User as UserIcon,
    X,
} from 'lucide-react';
import { toast } from 'sonner';

interface Asset {
    id: number;
    name: string;
    type?: string;
    path: string;
    disk?: string;
    url?: string;
    description?: string | null;
    asset_folder_id?: number | null;
    created_at?: string;
}

interface ProjectSummary {
    id: number;
    project_name: string;
    status: string;
    deployment_status: string;
    project_url: string | null;
    vercel_project_name: string | null;
    vercel_dashboard_url: string | null;
    deployed_at: string | null;
    created_at: string;
    assets_count: number;
    assets: Asset[];
    folders: { id: number; name: string }[];
    deployments: { id: number; url: string; status: string; created_at: string }[];
    requests: {
        id: number;
        title: string;
        category: string;
        category_label: string;
        status: string;
        status_label: string;
        created_at: string;
    }[];
}

interface UserDetail {
    id: number;
    name: string;
    email: string;
    roles: string[];
    is_admin: boolean;
    email_verified_at: string | null;
    created_at: string;
    projects: ProjectSummary[];
    requests: {
        id: number;
        title: string;
        category: string;
        category_label: string;
        category_icon: string;
        status: string;
        status_label: string;
        project: { id: number; name: string } | null;
        created_at: string;
    }[];
}

function formatDate(iso?: string | null) {
    if (!iso) return 'N/A';
    return new Date(iso).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

const isImage = (url?: string | null, name?: string | null): boolean => {
    const target = (url || name || '').toLowerCase().split('?')[0];
    return /\.(png|jpe?g|gif|webp|svg|avif|bmp)$/.test(target) || target.startsWith('data:image/');
};

export default function AdminUsersShow({ user }: { user: UserDetail }) {
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
        user.projects.length > 0 ? user.projects[0].id : null
    );
    const [activeTab, setActiveTab] = useState<'assets' | 'requests'>('assets');
    const [zoomedAsset, setZoomedAsset] = useState<Asset | null>(null);
    const [copiedAssetId, setCopiedAssetId] = useState<number | null>(null);

    setLayoutProps({
        breadcrumbs: [
            { title: 'Admin', href: '/admin/dashboard' },
            { title: 'Users & Clients', href: '/admin/users' },
            { title: user.name, href: `/admin/users/${user.id}` },
        ],
    });

    const activeProject = user.projects.find((p) => p.id === selectedProjectId) || user.projects[0] || null;
    const totalAssets = user.projects.reduce((acc, p) => acc + (p.assets?.length || 0), 0);

    const handleCopyUrl = (asset: Asset) => {
        if (!asset.url) return;
        navigator.clipboard.writeText(asset.url);
        setCopiedAssetId(asset.id);
        toast.success(`Copied URL for "${asset.name}" to clipboard`);
        setTimeout(() => setCopiedAssetId(null), 2000);
    };

    return (
        <>
            <Head title={`${user.name} | User Explorer | Admin`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-hidden p-4 sm:p-6 lg:p-8 bg-background text-foreground">
                {/* Back Nav & Header */}
                <div className="flex flex-col gap-4 pb-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        <Link
                            href="/admin/users"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Back to Users Directory</span>
                        </Link>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary text-xl font-extrabold flex items-center justify-center shrink-0 border border-primary/20">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold tracking-tight text-foreground">{user.name}</h1>
                                    {user.is_admin ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                            {user.roles.includes('super_admin') ? 'Super Admin' : 'Admin'}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                            Client
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {user.email} &bull; Member since {formatDate(user.created_at)}
                                    {user.email_verified_at && (
                                        <span className="ml-2 inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                                            <CheckCircle2 className="w-3 h-3" /> Verified
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Summary Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="px-3 py-1.5 rounded-lg bg-card border border-border shadow-xs text-xs">
                                <span className="text-muted-foreground">Projects: </span>
                                <span className="font-bold text-foreground">{user.projects.length}</span>
                            </div>
                            <div className="px-3 py-1.5 rounded-lg bg-card border border-border shadow-xs text-xs">
                                <span className="text-muted-foreground">Total Assets: </span>
                                <span className="font-bold text-foreground">{totalAssets}</span>
                            </div>
                            <div className="px-3 py-1.5 rounded-lg bg-card border border-border shadow-xs text-xs">
                                <span className="text-muted-foreground">Requests: </span>
                                <span className="font-bold text-foreground">{user.requests.length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 1: User's Projects Flow */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                                <BookOpen className="w-4 h-4 text-primary" />
                                <span>Projects Created by {user.name}</span>
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Click a project card to view its associated media assets and specs.
                            </p>
                        </div>
                    </div>

                    {user.projects.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {user.projects.map((project) => {
                                const isSelected = activeProject?.id === project.id;
                                const isDeployed =
                                    project.deployment_status === 'deployed' || project.status === 'deployed';

                                return (
                                    <div
                                        key={project.id}
                                        onClick={() => setSelectedProjectId(project.id)}
                                        className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 text-left ${
                                            isSelected
                                                ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary/40'
                                                : 'bg-card border-border hover:border-primary/40 hover:bg-muted/30 shadow-xs'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <h3 className="text-sm font-bold text-foreground truncate">
                                                    {project.project_name}
                                                </h3>
                                                <span className="text-[11px] text-muted-foreground">
                                                    Created {formatDate(project.created_at)}
                                                </span>
                                            </div>

                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${
                                                    isDeployed
                                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                                        : 'bg-muted text-muted-foreground border-border'
                                                }`}
                                            >
                                                {isDeployed ? 'Deployed' : project.status}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                                            <span className="flex items-center gap-1">
                                                <ImageIcon className="w-3.5 h-3.5 text-primary" />
                                                <span>{project.assets_count} media assets</span>
                                            </span>

                                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                                <Link
                                                    href={`/projects/${project.id}/edit`}
                                                    className="px-2 py-1 rounded text-[11px] font-medium bg-muted hover:bg-primary hover:text-primary-foreground text-foreground transition-colors"
                                                    title="Open Website Editor"
                                                >
                                                    Edit Site
                                                </Link>
                                                {isDeployed && (
                                                    <a
                                                        href={`/admin/projects/${project.id}/vercel-redirect`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-2 py-1 rounded text-[11px] font-medium bg-zinc-900 text-zinc-100 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors flex items-center gap-0.5"
                                                        title="Manage Deployment on Vercel"
                                                    >
                                                        <span>Vercel</span>
                                                        <ExternalLink className="w-2.5 h-2.5" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-8 text-center bg-card rounded-xl border border-border border-dashed text-xs text-muted-foreground">
                            This user has not created any website projects yet.
                        </div>
                    )}
                </div>

                {/* Section 2: Drill-Down Details for Active Project */}
                {activeProject && (
                    <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
                        {/* Tab Header */}
                        <div className="p-4 sm:p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-base font-bold text-foreground">
                                        Project: {activeProject.project_name}
                                    </h3>
                                    {activeProject.project_url && (
                                        <a
                                            href={activeProject.project_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                                        >
                                            <Globe className="w-3.5 h-3.5" />
                                            <span>Visit Live Site</span>
                                            <ArrowUpRight className="w-3 h-3" />
                                        </a>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Inspecting media gallery, storage paths, and service tickets for this project.
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex items-center bg-muted/60 p-1 rounded-lg">
                                    <button
                                        onClick={() => setActiveTab('assets')}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                                            activeTab === 'assets'
                                                ? 'bg-card text-foreground shadow-xs font-semibold'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        Assets Gallery ({activeProject.assets.length})
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('requests')}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                                            activeTab === 'requests'
                                                ? 'bg-card text-foreground shadow-xs font-semibold'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        Requests ({activeProject.requests.length})
                                    </button>
                                </div>

                                <Link
                                    href={`/admin/projects/${activeProject.id}`}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-card border border-border text-foreground hover:bg-muted transition-colors flex items-center gap-1"
                                >
                                    <span>Full Specs</span>
                                    <ExternalLink className="w-3 h-3" />
                                </Link>

                                <Link
                                    href={`/projects/${activeProject.id}/edit`}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs transition-colors flex items-center gap-1"
                                >
                                    <FileCode className="w-3 h-3" />
                                    <span>Open Editor</span>
                                </Link>

                                {(activeProject.deployment_status === 'deployed' || activeProject.status === 'deployed') && (
                                    <a
                                        href={`/admin/projects/${activeProject.id}/vercel-redirect`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-900 text-zinc-100 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1"
                                    >
                                        <span>Manage on Vercel</span>
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Tab Content: Assets Explorer */}
                        {activeTab === 'assets' && (
                            <div className="p-4 sm:p-6">
                                {activeProject.assets.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                        {activeProject.assets.map((asset) => {
                                            const isImg = isImage(asset.url, asset.name);
                                            const isCopied = copiedAssetId === asset.id;

                                            return (
                                                <div
                                                    key={asset.id}
                                                    className="group relative rounded-xl border border-border bg-card overflow-hidden shadow-xs hover:shadow-md hover:border-primary/50 transition-all flex flex-col justify-between"
                                                >
                                                    {/* Asset Preview Thumbnail */}
                                                    <div
                                                        onClick={() => isImg && setZoomedAsset(asset)}
                                                        className={`relative aspect-square w-full bg-muted/40 flex items-center justify-center overflow-hidden ${
                                                            isImg ? 'cursor-pointer' : ''
                                                        }`}
                                                    >
                                                        {isImg && asset.url ? (
                                                            <>
                                                                <img
                                                                    src={asset.url}
                                                                    alt={asset.name}
                                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                                    loading="lazy"
                                                                />
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                    <span className="p-2 rounded-full bg-black/75 text-white backdrop-blur-xs">
                                                                        <Maximize2 className="w-4 h-4" />
                                                                    </span>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="p-4 text-center">
                                                                <FileImage className="w-8 h-8 mx-auto text-muted-foreground opacity-60 mb-1" />
                                                                <span className="text-[10px] font-mono text-muted-foreground uppercase">
                                                                    {asset.type || 'file'}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {asset.disk && (
                                                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/60 text-white backdrop-blur-xs uppercase">
                                                                {asset.disk}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Asset Metadata & Action */}
                                                    <div className="p-2.5 flex flex-col gap-1.5 bg-card">
                                                        <span
                                                            className="text-xs font-semibold text-foreground truncate block"
                                                            title={asset.name}
                                                        >
                                                            {asset.name}
                                                        </span>

                                                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                                            <span>{formatDate(asset.created_at)}</span>

                                                            {asset.url && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleCopyUrl(asset)}
                                                                    className="p-1 rounded hover:bg-muted text-foreground transition-colors"
                                                                    title="Copy Asset CDN URL"
                                                                >
                                                                    {isCopied ? (
                                                                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                                    ) : (
                                                                        <Copy className="w-3.5 h-3.5" />
                                                                    )}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2">
                                            <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm font-semibold text-foreground">No assets uploaded</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            This project has no images or media assets stored in R2 or local storage.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab Content: Project Requests */}
                        {activeTab === 'requests' && (
                            <div className="divide-y divide-border/60">
                                {activeProject.requests.length > 0 ? (
                                    activeProject.requests.map((req) => (
                                        <div
                                            key={req.id}
                                            className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between gap-4"
                                        >
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-bold text-foreground">
                                                        {req.title}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground border border-border">
                                                        {req.status_label}
                                                    </span>
                                                </div>
                                                <span className="text-[11px] text-muted-foreground">
                                                    {req.category_label} &bull; Submitted {formatDate(req.created_at)}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/projects/${activeProject.id}/edit?request_id=${req.id}`}
                                                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-muted hover:bg-muted/80 text-foreground transition-colors"
                                                >
                                                    Fulfill in Editor
                                                </Link>
                                                <Link
                                                    href={`/admin/requests/${req.id}`}
                                                    className="px-2.5 py-1 rounded-md text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                                                >
                                                    View Details &rarr;
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-12 text-center text-xs text-muted-foreground">
                                        No service requests submitted for this project.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Asset Image Lightbox Modal */}
            {zoomedAsset && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setZoomedAsset(null)}
                >
                    <div
                        className="relative max-w-4xl max-h-[90vh] bg-card rounded-2xl border border-border p-4 shadow-2xl flex flex-col gap-3 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-border pb-2">
                            <div className="min-w-0">
                                <h3 className="text-sm font-bold text-foreground truncate">{zoomedAsset.name}</h3>
                                <p className="text-[11px] text-muted-foreground truncate">{zoomedAsset.path}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {zoomedAsset.url && (
                                    <button
                                        type="button"
                                        onClick={() => handleCopyUrl(zoomedAsset)}
                                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-muted hover:bg-muted/80 text-foreground flex items-center gap-1 transition-colors"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>Copy URL</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => setZoomedAsset(null)}
                                    className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto flex items-center justify-center min-h-[300px] max-h-[70vh]">
                            {zoomedAsset.url && (
                                <img
                                    src={zoomedAsset.url}
                                    alt={zoomedAsset.name}
                                    className="max-w-full max-h-[70vh] object-contain rounded-lg"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
