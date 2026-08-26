import { usePage } from '@inertiajs/react';

import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-green-600 text-white font-bold text-lg">
                S
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold text-lg tracking-tight">
                    Studio<span className="text-green-600">Sync</span>
                </span>
            </div>
        </div>
    );
}
