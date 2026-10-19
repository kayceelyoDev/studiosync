import React from 'react';
import { Head } from '@inertiajs/react';
import {
    Clock,
    ShieldAlert,
    RotateCw,
    Sun,
    Moon,
    Sparkles,
    ShieldCheck,
} from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';

interface ExpiredProps {
    projectName: string;
    entryUrl: string;
}

export default function BookingExpired({ projectName, entryUrl }: ExpiredProps) {
    const { appearance, updateAppearance } = useAppearance();

    const toggleTheme = () => {
        if (appearance === 'dark') {
            updateAppearance('light');
        } else {
            updateAppearance('dark');
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/20 selection:text-foreground">
            <Head title={`Session Expired - ${projectName}`} />

            {/* Top Brand Banner */}
            <header className="w-full border-b border-border/80 bg-card/60 backdrop-blur-md sticky top-0 z-10 transition-colors">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shadow-xs">
                            <Clock className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                                Secure Booking Portal
                            </span>
                            <h1 className="text-sm font-bold text-foreground leading-none">
                                {projectName}
                            </h1>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                        title="Toggle color theme"
                        aria-label="Toggle theme"
                    >
                        {appearance === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md mx-auto text-center">
                    <div className="p-8 rounded-2xl bg-card border border-border shadow-lg space-y-6">
                        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 mx-auto flex items-center justify-center shadow-inner">
                            <ShieldAlert className="w-8 h-8" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight text-foreground">
                                Booking Session Expired
                            </h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                For your security and privacy, booking links are time-limited. Your session for <strong className="text-foreground">{projectName}</strong> has ended.
                            </p>
                        </div>

                        <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-xs text-muted-foreground text-left space-y-2">
                            <div className="flex items-center gap-2 font-medium text-foreground">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                <span>Dynamic Link Protection Active</span>
                            </div>
                            <p>
                                Each booking session generates a unique, single-session token. To schedule your appointment, simply launch a fresh session.
                            </p>
                        </div>

                        <a
                            href={entryUrl}
                            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:bg-primary/90 transition-all hover:shadow-lg active:scale-[0.99]"
                        >
                            <RotateCw className="w-4 h-4" />
                            <span>Start Fresh Booking Session</span>
                        </a>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
                <div className="flex items-center justify-center gap-1.5 opacity-80">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span>Powered by StudioSync Real-time Booking Engine</span>
                </div>
            </footer>
        </div>
    );
}
