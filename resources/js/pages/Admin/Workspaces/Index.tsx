import { Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';

export default function AdminWorkspacesIndex({ workspaces }: { workspaces: any }) {
    return (
        <>
            <Head title="Admin - Client Requests" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 bg-zinc-50">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Client Requests</h1>
                </div>

                <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-zinc-500">
                            <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-200">
                                <tr>
                                    <th scope="col" className="px-6 py-3">ID</th>
                                    <th scope="col" className="px-6 py-3">Client</th>
                                    <th scope="col" className="px-6 py-3">Project Name</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3">Created At</th>
                                    <th scope="col" className="px-6 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {workspaces.data && workspaces.data.length > 0 ? (
                                    workspaces.data.map((workspace: any) => (
                                        <tr key={workspace.id} className="bg-white border-b border-zinc-100 hover:bg-zinc-50">
                                            <td className="px-6 py-4 font-medium text-zinc-900">{workspace.id}</td>
                                            <td className="px-6 py-4">{workspace.user?.name || 'Unknown'}</td>
                                            <td className="px-6 py-4">{workspace.project_name}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    workspace.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 
                                                    workspace.status === 'in_progress' ? 'bg-amber-100 text-amber-800' : 'bg-zinc-100 text-zinc-800'
                                                }`}>
                                                    {workspace.status ? workspace.status.charAt(0).toUpperCase() + workspace.status.slice(1).replace('_', ' ') : 'Unknown'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">{new Date(workspace.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <Link 
                                                    href={`/admin/workspaces/${workspace.id}`}
                                                    className="font-medium text-blue-600 hover:underline"
                                                >
                                                    Review
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                                            No client requests found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

AdminWorkspacesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Client Requests',
            href: '/admin/workspaces',
        },
    ],
};
