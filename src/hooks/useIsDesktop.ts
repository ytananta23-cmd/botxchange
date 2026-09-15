import { useEffect, useState } from 'react';

/**
 * Tracks whether the viewport is at or above Tailwind's `lg` breakpoint
 * (1024px). Used to conditionally *mount* an entirely different layout
 * (rather than just CSS-hiding one) when a screen-size branch contains
 * something heavy — like a TradingView widget — that shouldn't be
 * instantiated twice at once just because it's invisible.
 */
export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
  );

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return isDesktop;
}
