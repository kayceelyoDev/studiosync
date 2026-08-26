import { Link, usePage } from '@inertiajs/react';
import { BookOpen, FolderGit2, LayoutGrid } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Projects',
        href: '/generate-prompt',
        icon: FolderGit2,
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'Client Requests',
        href: '/admin/workspaces',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props as any;
    const isAdmin = auth?.roles && (auth.roles.includes('admin') || auth.roles.includes('super_admin'));

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {!isAdmin && <NavMain items={mainNavItems} />}
                {isAdmin && <NavMain items={adminNavItems} />}
            </SidebarContent>

            <SidebarFooter>

                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
