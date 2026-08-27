import { Link, usePage } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0 bg-background text-foreground">
            <div className="relative hidden h-full flex-col p-10 text-foreground lg:flex border-r border-border bg-zinc-50 dark:bg-zinc-900/50">
                <div className="absolute inset-0">
                    <svg className="absolute inset-0 h-full w-full stroke-zinc-200 dark:stroke-zinc-800 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]" aria-hidden="true">
                        <defs>
                            <pattern id="grid-pattern" width="200" height="200" x="50%" y="-1" patternUnits="userSpaceOnUse">
                                <path d="M.5 200V.5H200" fill="none" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" strokeWidth="0" fill="url(#grid-pattern)" />
                    </svg>
                </div>
                <div className="relative z-20 flex items-center">
                    <Link href={home()}>
                        <AppLogo />
                    </Link>
                </div>
                
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            "Streamline your projects, enhance collaboration, and bring your studio's vision to life with StudioSync."
                        </p>
                    </blockquote>
                </div>
            </div>
            
            <div className="w-full lg:p-8 bg-background">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="relative z-20 flex items-center justify-center lg:hidden mb-4">
                        <Link href={home()}>
                            <AppLogo />
                        </Link>
                    </div>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
                        <p className="text-sm text-balance text-muted-foreground">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
