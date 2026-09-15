import { getAuthToken } from '../api/client';

// Falls back to the backend's own default port (see backend/src/env.ts) —
// deliberately NOT 3000, since that's this frontend's own dev server port
// (frontend/package.json's "dev" script).
const BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:4000/api';

type Listener = (data: any) => void;

// Backend's single WS endpoint (see backend/src/services/wsHub.ts):
//   ws(s)://<same host as the API>/ws?token=<jwt>
// Derived from VITE_API_BASE_URL's origin so this works whether the API is
// on localhost, a custom domain, or an onrender.com URL, regardless of
// whatever path suffix (e.g. "/api") VITE_API_BASE_URL happens to have.
function getWsUrl(): string {
  let origin: string;
  try {
    origin = new URL(BASE_URL).origin;
  } catch {
    origin = 'http://localhost:4000';
  }
  const wsOrigin = origin.replace(/^http/, 'ws');
  const token = getAuthToken();
  return `${wsOrigin}/ws${token ? `?token=${encodeURIComponent(token)}` : ''}`;
}

/**
 * A single shared WebSocket connection for the whole app, mirroring the
 * backend's channel model: components subscribe to a channel name
 * ("market:BTCUSD", "orders:<accountId>", "bots:<accountId>") and get
 * called back with that channel's `data` payload whenever the server
 * broadcasts one. Multiple components can subscribe to the same channel;
 * the socket itself is only opened once and reused.
 */
class WsClient {
  private ws: WebSocket | null = null;
  private connecting = false;
  private listeners = new Map<string, Set<Listener>>();
  private reconnectDelayMs = 1000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  private ensureConnected() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return;
    if (this.connecting) return;
    this.connecting = true;

    const ws = new WebSocket(getWsUrl());
    this.ws = ws;

    ws.onopen = () => {
      this.connecting = false;
      this.reconnectDelayMs = 1000;
      // Re-subscribe to every channel any component currently wants —
      // needed both on first connect and after a reconnect.
      for (const channel of this.listeners.keys()) {
        ws.send(JSON.stringify({ type: 'subscribe', channel }));
      }
    };

    ws.onmessage = event => {
      let msg: any;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }
      if (typeof msg?.channel === 'string') {
        this.listeners.get(msg.channel)?.forEach(fn => fn(msg.data));
      }
    };

    ws.onclose = () => {
      this.connecting = false;
      this.ws = null;
      // Only keep retrying while something still wants a live channel —
      // no point reconnecting forever after the last subscriber unmounts.
      if (this.listeners.size > 0 && !this.reconnectTimer) {
        this.reconnectTimer = setTimeout(() => {
          this.reconnectTimer = null;
          this.ensureConnected();
        }, this.reconnectDelayMs);
        this.reconnectDelayMs = Math.min(this.reconnectDelayMs * 2, 15_000);
      }
    };

    ws.onerror = () => {
      // onclose fires right after and drives the reconnect logic above.
    };
  }

  /** Subscribes to a channel; returns an unsubscribe function. */
  subscribe(channel: string, listener: Listener): () => void {
    const isNewChannel = !this.listeners.has(channel);
    if (isNewChannel) this.listeners.set(channel, new Set());
    this.listeners.get(channel)!.add(listener);

    this.ensureConnected();
    if (isNewChannel && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'subscribe', channel }));
    }

    return () => {
      const set = this.listeners.get(channel);
      if (!set) return;
      set.delete(listener);
      if (set.size === 0) {
        this.listeners.delete(channel);
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: 'unsubscribe', channel }));
        }
      }
    };
  }
}

export const wsClient = new WsClient();
