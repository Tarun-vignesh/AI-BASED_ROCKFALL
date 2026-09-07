const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://127.0.0.1:8000';

type Listener = (data: any) => void;

export class RockfallWebSocket {
  private ws: WebSocket | null = null;
  private mineSiteId: string;
  private listeners: Listener[] = [];
  private reconnectInterval = 3000;
  private isIntentionalClose = false;

  constructor(mineSiteId: string = 'ms-001-demo-mine') {
    this.mineSiteId = mineSiteId;
  }

  public connect() {
    this.isIntentionalClose = false;
    const url = `${WS_BASE_URL}/ws/mine/${this.mineSiteId}`;
    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log(`[WebSocket] Connected to ${url}`);
      };

      this.ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          this.listeners.forEach((fn) => fn(parsed));
        } catch (e) {
          console.warn('[WebSocket] Error parsing message:', event.data);
        }
      };

      this.ws.onclose = () => {
        console.log('[WebSocket] Connection closed.');
        if (!this.isIntentionalClose) {
          setTimeout(() => this.connect(), this.reconnectInterval);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('[WebSocket] Error encountered:', err);
      };
    } catch (e) {
      console.warn('[WebSocket] Exception during connect:', e);
    }
  }

  public subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  public close() {
    this.isIntentionalClose = true;
    if (this.ws) {
      this.ws.close();
    }
  }
}
