// shims/ws.js
export default function WebSocketShim() {
    throw new Error('WebSocket not supported in this environment.');
  }
  