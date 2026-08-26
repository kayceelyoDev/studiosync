import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, MonitorSmartphone, Code, FileText, RefreshCw } from 'lucide-react';

export default function ProjectShow({ project }) {
    const [viewMode, setViewMode] = useState<'details' | 'code' | 'preview'>('details');

    const renderStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Completed</span>;
            case 'pending':
            case 'generating_html':
            case 'reviewing_html':
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Processing</span>;
            case 'failed':
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Failed</span>;
            default:
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800">{status}</span>;
        }
    };

    return (
        <>
        <div className="flex flex-col flex-1 h-full gap-4 overflow-x-hidden rounded-xl text-foreground">
            <Head title={project.project_name || 'Project Details'} />

            <div className="relative z-10 w-full max-w-7xl px-4 py-6 sm:py-8 mx-auto sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="flex flex-wrap sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <div className="flex items-start sm:items-center gap-4">
                        <Link 
                            href="/dashboard" 
                            className="shrink-0 flex items-center justify-center w-10 h-10 transition-colors bg-white border rounded-full shadow-sm text-muted-foreground hover:text-foreground hover:bg-zinc-50 border-border"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground sm:text-3xl line-clamp-2">
                                    {project.project_name || 'Untitled Project'}
                                </h1>
                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${project.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {project.status === 'completed' ? 'Completed' : 'Draft'}
                                </span>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Created on {new Date(project.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            onClick={() => setViewMode('preview')}
                            className={`flex-1 sm:flex-none flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors border rounded-md shadow-sm ${viewMode === 'preview' ? 'bg-zinc-100 text-zinc-900 border-zinc-200' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'}`}
                        >
                            <MonitorSmartphone className="w-4 h-4 mr-2" /> Preview
                        </button>
                        <button
                            onClick={() => setViewMode('details')}
                            className={`flex-1 sm:flex-none flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors border rounded-md shadow-sm ${viewMode === 'details' ? 'bg-zinc-100 text-zinc-900 border-zinc-200' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'}`}
                        >
                            <FileText className="w-4 h-4 mr-2" /> Details
                        </button>
                        {project.html_content && (
                            <button
                                onClick={() => setViewMode('code')}
                                className={`flex-none flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors border rounded-md shadow-sm ${viewMode === 'code' ? 'bg-zinc-100 text-zinc-900 border-zinc-200' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'}`}
                            >
                                <Code className="w-4 h-4 mr-2 hidden sm:block" /> Code
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col mt-4 min-h-[500px]">
                    {viewMode === 'details' && (
                        <div className="p-4 sm:p-8 bg-white flex-1 overflow-auto">
                            <h2 className="text-xl font-semibold mb-6">Project Preferences</h2>
                            
                            {project.preferences && Array.isArray(project.preferences) && project.preferences.length > 0 ? (
                                <ul className="space-y-4">
                                    {project.preferences
                                        .filter((pref: string) => {
                                            const parts = pref.split(':');
                                            return parts.length > 1 && parts.slice(1).join(':').trim() !== '';
                                        })
                                        .map((pref: string, index: number) => {
                                        const [key, ...valueParts] = pref.split(':');
                                        const value = valueParts.join(':').trim();
                                        return (
                                            <li key={index} className="pb-4 border-b border-border/50 last:border-0">
                                                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">{key}</div>
                                                {key.trim() === 'Content' ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {value.split(',').map((item, i) => (
                                                            <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-primary/5 border border-primary/20 text-foreground">
                                                                {item.trim()}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-foreground font-medium text-sm sm:text-base leading-relaxed">{value}</div>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground italic">No specific preferences recorded for this project.</p>
                            )}
                        </div>
                    )}

                    {viewMode === 'code' && (
                        <div className="w-full h-full bg-zinc-950 p-6 overflow-auto">
                            {project.html_content ? (
                                <pre className="text-sm font-mono text-zinc-300">
                                    <code>{project.html_content}</code>
                                </pre>
                            ) : (
                                <div className="flex items-center justify-center h-full text-zinc-500">
                                    No code available yet.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
        </>
    );
}

ProjectShow.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Project Details',
            href: '#',
        }
    ],
};
