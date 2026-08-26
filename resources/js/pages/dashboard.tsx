import { Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { Folder, Plus, Calendar, Layers } from 'lucide-react';

interface Workspace {
    id: number;
    name: string;
    slug: string;
    projects_count: number;
    created_at: string;
}

export default function Dashboard({ workspaces }: { workspaces: Workspace[] }) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 bg-background">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">My Workspaces</h1>
                    <Link 
                        href="/workspaces/create"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Workspace
                    </Link>
                </div>

                {workspaces && workspaces.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {workspaces.map((workspace) => (
                            <div key={workspace.id} className="flex flex-col p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-primary/10 text-primary rounded-lg mr-3">
                                            <Folder className="w-5 h-5" />
                                        </div>
                                        <h2 className="text-xl font-semibold text-foreground truncate pr-4 group-hover:text-primary transition-colors">{workspace.name}</h2>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col gap-2 mt-2 mb-6 text-sm text-muted-foreground">
                                    <div className="flex items-center">
                                        <Layers className="w-4 h-4 mr-2 opacity-70" />
                                        {workspace.projects_count} {workspace.projects_count === 1 ? 'Project' : 'Projects'}
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 opacity-70" />
                                        Created {new Date(workspace.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                                
                                <div className="mt-auto pt-4 border-t border-border flex items-center justify-end">
                                    <Link href={`/workspaces/${workspace.id}`} className="text-sm font-medium text-primary hover:text-primary/80 transition-colors inline-flex items-center">
                                        Open Workspace <span className="ml-1 group-hover:translate-x-1 transition-transform">&rarr;</span>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border border-dashed shadow-sm">
                        <div className="h-16 w-16 text-muted-foreground mb-4 bg-muted rounded-full flex items-center justify-center">
                            <Folder className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground">No workspaces yet</h3>
                        <p className="mt-2 text-sm text-muted-foreground mb-6 text-center max-w-sm">
                            Workspaces help you organize your projects. Create your first workspace to get started.
                        </p>
                        <Link 
                            href="/workspaces/create"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-6 py-2"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Workspace
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
