import React from 'react';
import { Head, Link, setLayoutProps } from '@inertiajs/react';
import { Plus, LayoutTemplate, Calendar, Globe, ArrowUpRight } from 'lucide-react';

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
    created_at: string;
}

export default function ShowWorkspace({ workspace, projects }: { workspace: Workspace, projects: Project[] }) {
    setLayoutProps({
        breadcrumbs: [
            { title: 'Dashboard', href: '/dashboard' },
            { title: workspace.name, href: '#' },
        ],
    });

    return (
        <>
            <Head title={workspace.name} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 bg-background">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">{workspace.name}</h1>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="inline-flex items-center">
                                <Globe className="w-4 h-4 mr-1.5 opacity-70" />
                                /{workspace.slug}
                            </span>
                            <span className="inline-flex items-center">
                                <Calendar className="w-4 h-4 mr-1.5 opacity-70" />
                                Created {new Date(workspace.created_at).toLocaleDateString()}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted text-foreground text-xs font-medium">
                                {projects?.length || 0} Projects
                            </span>
                        </div>
                    </div>
                    
                    <Link 
                        href={`/generate-prompt?workspace_id=${workspace.id}`}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-6 py-2"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Project
                    </Link>
                </div>

                {/* Projects Grid */}
                {projects && projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-4 duration-500 delay-75">
                        {projects.map((project) => (
                            <div key={project.id} className="flex flex-col p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-xl font-semibold text-foreground truncate pr-4 group-hover:text-primary transition-colors">{project.project_name}</h2>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        project.status === 'active' || project.status === 'completed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                                        project.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 
                                        project.status === 'failed' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                                        'bg-muted text-muted-foreground border border-border'
                                    }`}>
                                        {project.status ? project.status.charAt(0).toUpperCase() + project.status.slice(1) : 'Unknown'}
                                    </span>
                                </div>
                                
                                {project.project_url ? (
                                    <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline mb-4 truncate flex items-center bg-primary/5 p-2 rounded-md">
                                        <ArrowUpRight className="w-4 h-4 mr-1.5 opacity-70" />
                                        {project.project_url}
                                    </a>
                                ) : (
                                    <div className="text-sm text-muted-foreground mb-4 italic p-2">No URL provided</div>
                                )}
                                
                                <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(project.created_at).toLocaleDateString()}
                                    </p>
                                    <Link href={`/projects/${project.id}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                                        View Details &rarr;
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border border-dashed shadow-sm animate-in fade-in slide-in-from-right-4 duration-500 delay-75 flex-1">
                        <div className="h-16 w-16 text-muted-foreground mb-4 bg-muted rounded-full flex items-center justify-center">
                            <LayoutTemplate className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground">No projects yet</h3>
                        <p className="mt-2 text-sm text-muted-foreground mb-6 text-center max-w-sm">
                            Your workspace is ready. Start generating beautiful AI projects right here.
                        </p>
                        <Link 
                            href={`/generate-prompt?workspace_id=${workspace.id}`}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-6 py-2"
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

ShowWorkspace.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Workspace', href: '#' },
    ],
};
