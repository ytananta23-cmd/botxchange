import React from 'react';
import { cn } from '../lib/utils';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-white/[0.04] bg-[length:200%_100%]',
        className
      )}
      style={{ animation: 'shimmer 1.8s ease-in-out infinite' }}
      {...props}
    />
  );
};
