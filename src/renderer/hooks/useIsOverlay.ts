import { useMemo } from 'react';

export function useIsOverlay(): boolean {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('overlay') === 'true';
  }, []);
}
