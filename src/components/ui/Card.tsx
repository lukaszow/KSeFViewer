import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../core/utils/cn';

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                'rounded-xl border border-slate-200 bg-white shadow-sm',
                className
            )}
            {...props}
        />
    )
);
Card.displayName = 'Card';

export default Card;
