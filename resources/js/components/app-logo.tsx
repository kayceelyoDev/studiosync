import { Sparkles } from 'lucide-react';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg shadow-sm">
                <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">StudioSync</span>
        </div>
    );
}
