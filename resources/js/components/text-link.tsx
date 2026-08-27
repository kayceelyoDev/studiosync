import { Link } from '@inertiajs/react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

type Props = ComponentProps<typeof Link>;

export default function TextLink({
    className = '',
    children,
    ...props
}: Props) {
    return (
        <Link
            className={cn(
                'text-foreground font-medium hover:text-green-600 transition-colors duration-200',
                className,
            )}
            {...props}
        >
            {children}
        </Link>
    );
}
