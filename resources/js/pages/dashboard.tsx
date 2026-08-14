import { Head, Link } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { dashboard } from '@/routes';

export default function Dashboard({ projects }: { projects: any[] }) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 bg-zinc-50">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Your Projects</h1>
                    <Link 
                        href="/generate-prompt" 
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 bg-zinc-900 text-zinc-50 shadow hover:bg-zinc-900/90 h-9 px-4 py-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                        </svg>
                        Create New Project
                    </Link>
                </div>

                {projects && projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <div key={project.id} className="flex flex-col p-6 bg-white rounded-xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-lg font-medium text-zinc-900 truncate pr-4">{project.project_name}</h2>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        project.status === 'active' || project.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 
                                        project.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-zinc-100 text-zinc-800'
                                    }`}>
                                        {project.status ? project.status.charAt(0).toUpperCase() + project.status.slice(1) : 'Unknown'}
                                    </span>
                                </div>
                                
                                {project.project_url ? (
                                    <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mb-4 truncate flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                                        </svg>
                                        {project.project_url}
                                    </a>
                                ) : (
                                    <div className="text-sm text-zinc-400 mb-4 italic">No URL provided</div>
                                )}
                                
                                <div className="mt-auto pt-4 border-t border-zinc-100 flex items-center justify-between">
                                    <p className="text-xs text-zinc-500">
                                        Created {new Date(project.created_at).toLocaleDateString()}
                                    </p>
                                    <Link href={`/projects/${project.id}`} className="text-xs font-medium text-zinc-900 hover:text-zinc-600 transition-colors">
                                        View Details &rarr;
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-zinc-200 border-dashed">
                        <div className="h-12 w-12 text-zinc-400 mb-4 bg-zinc-100 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-zinc-900">No projects yet</h3>
                        <p className="mt-1 text-sm text-zinc-500 mb-6 text-center max-w-sm">
                            Get started by creating a new AI-generated project. It only takes a few minutes to set up your preferences.
                        </p>
                        <Link 
                            href="/generate-prompt" 
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 bg-zinc-900 text-zinc-50 shadow hover:bg-zinc-900/90 h-9 px-4 py-2"
                        >
                            Create Your First Project
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
