const nativeWebSocket = globalThis.WebSocket;

if (!nativeWebSocket) {
  throw new Error(
    'WebSocket is not available in this runtime. The "ws" shim expected a native WebSocket implementation.',
  );
}

export default nativeWebSocket;
export const WebSocket = nativeWebSocket;
