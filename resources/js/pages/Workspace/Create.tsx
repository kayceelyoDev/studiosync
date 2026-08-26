import React, { useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { Globe, ArrowLeft, Loader2, FolderPlus } from 'lucide-react';

export default function CreateWorkspace() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: ''
    });

    // Auto-generate slug when name changes
    useEffect(() => {
        if (!data.name) return;
        
        const autoSlug = data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
            
        setData('slug', autoSlug);
    }, [data.name]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/workspaces');
    };

    return (
        <div className="flex flex-col flex-1 h-full gap-4 overflow-x-hidden rounded-xl text-foreground bg-background">
            <Head title="New Workspace" />
            
            <div className="relative w-full max-w-3xl px-4 py-8 mx-auto sm:px-6 lg:px-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="mb-8">
                    <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Dashboard
                    </Link>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 text-primary rounded-lg">
                            <FolderPlus className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                            Create Workspace
                        </h1>
                    </div>
                    <p className="mt-2 text-base text-muted-foreground">
                        Organize your projects and assets within a dedicated workspace.
                    </p>
                </div>

                <div className="bg-card text-card-foreground border border-border rounded-xl shadow-sm p-6 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                                Workspace Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                className={`flex w-full px-4 py-3 transition-colors bg-transparent border rounded-md shadow-sm border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring ${errors.name ? 'border-red-500 ring-red-500/20' : ''}`}
                                placeholder="e.g. Acme Corporation"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                autoFocus
                            />
                            {errors.name && (
                                <p className="mt-1.5 text-sm text-red-500">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="slug" className="block text-sm font-medium text-foreground mb-1.5">
                                Workspace URL Slug
                            </label>
                            <div className="flex rounded-md shadow-sm">
                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                                    <Globe className="w-4 h-4 mr-2 opacity-70" />
                                    studiosync.app/ws/
                                </span>
                                <input
                                    id="slug"
                                    type="text"
                                    className={`flex w-full px-4 py-3 transition-colors bg-transparent border rounded-r-md border-input text-foreground focus:outline-none focus:ring-1 focus:ring-ring ${errors.slug ? 'border-red-500 z-10 ring-red-500/20' : ''}`}
                                    placeholder="acme-corporation"
                                    value={data.slug}
                                    onChange={e => setData('slug', e.target.value)}
                                />
                            </div>
                            {errors.slug && (
                                <p className="mt-1.5 text-sm text-red-500">{errors.slug}</p>
                            )}
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={processing || !data.name || !data.slug}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-8 py-2"
                            >
                                {processing ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
                                ) : (
                                    'Create Workspace'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

CreateWorkspace.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' }, 
        { title: 'New Workspace', href: '/workspaces/create' }
    ]
};
