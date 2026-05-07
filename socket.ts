type EventCallback = (...args: any[]) => void;

class MockSocket {
  private events: Map<string, EventCallback[]> = new Map();
  private _connected: boolean = false;
  private typingUsers: Map<string, NodeJS.Timeout> = new Map();

  get connected() {
    return this._connected;
  }

  connect() {
    this._connected = true;
    this.emit('connect');
    return this;
  }

  disconnect() {
    this._connected = false;
    this.emit('disconnect');
  }

  on(event: string, callback: EventCallback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
    return this;
  }

  off(event: string, callback: EventCallback) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
    return this;
  }

  emit(event: string, ...args: any[]) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => cb(...args));
    }
    return this;
  }

  once(event: string, callback: EventCallback) {
    const onceCallback = (...args: any[]) => {
      callback(...args);
      this.off(event, onceCallback);
    };
    return this.on(event, onceCallback);
  }

  // Typing indicator methods
  emitTyping(username: string) {
    // Clear existing timeout for this user
    if (this.typingUsers.has(username)) {
      clearTimeout(this.typingUsers.get(username)!);
    }

    // Emit typing event
    this.emit('typing', username);

    // Set timeout to emit stopped typing
    const timeout = setTimeout(() => {
      this.emit('stoppedTyping', username);
      this.typingUsers.delete(username);
    }, 2000);

    this.typingUsers.set(username, timeout);
  }
}

let socket: MockSocket | null = null;

export function getSocket(): MockSocket {
  if (!socket) {
    socket = new MockSocket();
  }
  return socket;
}

export function connectSocket(): MockSocket {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
  }
}

export type { MockSocket };