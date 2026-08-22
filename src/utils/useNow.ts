import { useSyncExternalStore } from 'react';

/**
 * The current time, as a React-safe external source.
 *
 * Calling Date.now() during render is impure — React may render more than once and get different
 * answers. useSyncExternalStore is the sanctioned way to read a mutable external source, and it
 * also keeps relative labels ("due in 3 days") fresh without a manual refresh.
 *
 * The snapshot is quantised to the interval so it is referentially stable between ticks;
 * returning a raw Date.now() here would report a change on every call and re-render forever.
 */
export function useNow(intervalMs = 60_000): number {
  return useSyncExternalStore(
    (onChange) => {
      const id = setInterval(onChange, intervalMs);
      return () => clearInterval(id);
    },
    () => Math.floor(Date.now() / intervalMs) * intervalMs,
    () => 0 // server snapshot; this app is client-only
  );
}
