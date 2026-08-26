import { Head, useForm, Link } from '@inertiajs/react';
import { FormEvent } from 'react';

export default function AdminWorkspacesShow({ workspace }: { workspace: any }) {
    const { data, setData, put, processing, errors } = useForm({
        status: workspace.status || 'pending',
        generated_prompt: workspace.generated_prompt || '',
        project_url: workspace.project_url || '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(`/admin/workspaces/${workspace.id}`);
    };

    return (
        <>
            <Head title={`Review Request - ${workspace.project_name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto rounded-xl p-6 bg-zinc-50">

                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/admin/workspaces" className="text-sm text-zinc-500 hover:text-zinc-900 mb-2 inline-block">
                            &larr; Back to all requests
                        </Link>
                        <h1 className="text-2xl font-semibold tracking-tight">Review: {workspace.project_name}</h1>
                        <p className="text-sm text-zinc-500 mt-1">Requested by {workspace.user?.name} ({workspace.user?.email})</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Right Column: Admin Actions */}
                    <div className="lg:col-span-2">
                        <form onSubmit={submit} className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-6">
                            <h2 className="text-lg font-medium text-zinc-900">Manage Request</h2>

                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-zinc-700 mb-1">Status</label>
                                <select
                                    id="status"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                                {errors.status && <div className="text-red-500 text-xs mt-1">{errors.status}</div>}
                            </div>

                            <div>
                                <label htmlFor="generated_prompt" className="block text-sm font-medium text-zinc-700 mb-1">
                                    Generated Prompt (Admin View)
                                </label>
                                <textarea
                                    id="generated_prompt"
                                    value={data.generated_prompt}
                                    onChange={(e) => setData('generated_prompt', e.target.value)}
                                    rows={10}
                                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 font-mono"
                                    placeholder="The AI generated prompt will appear here. You can edit it before passing it to the builder."
                                />
                                {errors.generated_prompt && <div className="text-red-500 text-xs mt-1">{errors.generated_prompt}</div>}
                            </div>

                            <div>
                                <label htmlFor="project_url" className="block text-sm font-medium text-zinc-700 mb-1">
                                    Deployed Project URL
                                </label>
                                <input
                                    id="project_url"
                                    type="url"
                                    value={data.project_url}
                                    onChange={(e) => setData('project_url', e.target.value)}
                                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950"
                                    placeholder="https://client-project.com"
                                />
                                {errors.project_url && <div className="text-red-500 text-xs mt-1">{errors.project_url}</div>}
                            </div>

                            <div className="flex justify-end pt-4 border-t border-zinc-100">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 bg-zinc-900 text-zinc-50 shadow hover:bg-zinc-900/90 h-9 px-4 py-2"
                                >
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

            </div>
        </>
    );
}

AdminWorkspacesShow.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/admin/workspaces',
        },
        {
            title: 'Client Requests',
            href: '/admin/workspaces',
        },
        {
            title: 'Review',
            href: '#',
        },
    ],
};
