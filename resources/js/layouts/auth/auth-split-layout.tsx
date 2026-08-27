import { Link, usePage } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';
import { Sparkles, Code, Layout, Globe, MonitorSmartphone, Zap, Moon, Sun } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { appearance, updateAppearance } = useAppearance();

    const toggleTheme = () => {
        if (appearance === 'dark') {
            updateAppearance('light');
        } else {
            updateAppearance('dark');
        }
    };

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0 bg-background text-foreground overflow-hidden">
            
            {/* Theme Toggle Top Right */}
            <div className="absolute top-6 right-6 lg:top-8 lg:right-8 z-50">
                <button 
                    onClick={toggleTheme}
                    className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent transition-colors bg-background/50 backdrop-blur-sm border border-border/50"
                    aria-label="Toggle dark mode"
                >
                    {appearance === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
            </div>

            {/* Left Side Branding */}
            <div className="relative hidden h-full flex-col p-10 text-foreground lg:flex border-r border-border bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
                
                {/* AI Concentric Rings Background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none opacity-60">
                    <div className="absolute w-[300px] h-[300px] border border-border/80 rounded-full animate-[spin_60s_linear_infinite]">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 p-2 bg-background border border-border rounded-full shadow-sm text-blue-500"><Code className="w-4 h-4" /></div>
                        <div className="absolute bottom-4 right-8 p-2 bg-background border border-border rounded-full shadow-sm text-purple-500"><Sparkles className="w-4 h-4" /></div>
                    </div>
                    <div className="absolute w-[500px] h-[500px] border border-border/40 rounded-full animate-[spin_90s_linear_infinite_reverse]">
                        <div className="absolute top-1/2 -left-3 -translate-y-1/2 p-2 bg-background border border-border rounded-full shadow-sm text-green-500"><Layout className="w-4 h-4" /></div>
                        <div className="absolute bottom-20 right-10 p-2 bg-background border border-border rounded-full shadow-sm text-rose-500"><Zap className="w-4 h-4" /></div>
                    </div>
                    <div className="absolute w-[800px] h-[800px] border border-border/20 rounded-full"></div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 via-transparent to-transparent dark:from-zinc-950 z-0"></div>

                <div className="relative z-20 flex items-center">
                    <Link href={home()}>
                        <AppLogo />
                    </Link>
                </div>
                
                <div className="relative z-20 mt-auto max-w-lg">
                    <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-primary bg-primary/10 border border-primary/20 mb-4">
                        <Sparkles className="w-3.5 h-3.5" />
                        AI-Powered Generation
                    </div>
                    <blockquote className="space-y-4">
                        <p className="text-2xl font-medium tracking-tight">
                            "StudioSync completely changed how we build for the web. Just type your ideas and watch production-ready code generate in seconds."
                        </p>
                        <footer className="text-sm text-muted-foreground">
                            <div className="font-semibold text-foreground">Sarah Jenkins</div>
                            Lead Developer, TechFlow
                        </footer>
                    </blockquote>
                </div>
            </div>
            
            {/* Right Side Form */}
            <div className="w-full lg:p-8 bg-background relative z-10">
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
