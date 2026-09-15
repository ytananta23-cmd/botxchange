import { useEffect, useRef } from 'react';
import { wsClient } from '../lib/ws';

/**
 * Subscribes to a live channel on the backend's WebSocket hub
 * (backend/src/services/wsHub.ts) for as long as `channel` is truthy, and
 * unsubscribes automatically on unmount or when `channel` changes.
 *
 * `onMessage` does NOT need to be memoized with useCallback — the latest
 * closure is always used (via a ref) without tearing down and
 * re-subscribing the socket on every render.
 */
export function useWsChannel(channel: string | null | undefined, onMessage: (data: any) => void) {
  const handlerRef = useRef(onMessage);
  handlerRef.current = onMessage;

  useEffect(() => {
    if (!channel) return;
    return wsClient.subscribe(channel, data => handlerRef.current(data));
  }, [channel]);
}
