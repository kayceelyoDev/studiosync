import { cn } from '@/lib/utils';

interface PasswordRulesProps {
    password?: string;
    className?: string;
}

export default function PasswordRules({ password = '', className }: PasswordRulesProps) {
    const score = [
        password.length >= 12,
        /[A-Z]/.test(password),
        /[a-z]/.test(password),
        /[0-9]/.test(password),
        /[^A-Za-z0-9]/.test(password),
    ].filter(Boolean).length;

    const getScoreColor = () => {
        if (score <= 2) return 'bg-red-500';
        if (score <= 4) return 'bg-amber-500';
        return 'bg-green-600';
    };

    return (
        <div className={cn('flex flex-col gap-2', className)}>
            <div className="flex gap-1 h-1 w-full">
                {[1, 2, 3, 4, 5].map((index) => (
                    <div
                        key={index}
                        className={cn(
                            'h-full flex-1 rounded-full transition-colors duration-300',
                            password.length === 0
                                ? 'bg-zinc-200 dark:bg-zinc-800'
                                : index <= score
                                ? getScoreColor()
                                : 'bg-zinc-200 dark:bg-zinc-800'
                        )}
                    />
                ))}
            </div>
            <p className="text-[0.8rem] text-muted-foreground leading-snug">
                Use at least 12 characters with a mix of uppercase, lowercase, numbers, and special symbols (e.g., @, #, $).
            </p>
        </div>
    );
}
