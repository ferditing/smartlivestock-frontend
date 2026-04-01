import { useEffect, useRef, useCallback, useState } from 'react';
import io, { Socket } from 'socket.io-client';

interface WebSocketOptions {
  enabled?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  subscribe: (event: string, handler: (...args: any[]) => void) => void;
  unsubscribe: (event: string, handler?: (...args: any[]) => void) => void;
  emit: (event: string, data?: any) => void;
}

const WS_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const useWebSocket = (options: WebSocketOptions = {}): UseWebSocketReturn => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { enabled = true, onConnect, onDisconnect, onError } = options;

  useEffect(() => {
    if (!enabled) return;

    // Get auth token from localStorage
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      console.warn('[WebSocket] No authentication credentials found');
      return;
    }

    try {
      // Initialize Socket.IO connection with authentication
      const socket = io(WS_URL, {
        auth: {
          token,
          userId,
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling'],
      });

      socketRef.current = socket;

      // Connection established
      socket.on('connect', () => {
        console.log('[WebSocket] Connected:', socket.id);
        setIsConnected(true);
        onConnect?.();
      });

      // Connection lost
      socket.on('disconnect', (reason) => {
        console.log('[WebSocket] Disconnected:', reason);
        setIsConnected(false);
        onDisconnect?.();
      });

      // Connection error
      socket.on('connect_error', (error) => {
        console.error('[WebSocket] Connection error:', error);
        onError?.(error);
      });

      // Heartbeat ping/pong for connection health
      socket.on('ping', () => {
        socket.emit('pong');
      });

      return () => {
        socket.disconnect();
      };
    } catch (error) {
      console.error('[WebSocket] Failed to initialize:', error);
      onError?.(error);
    }
  }, [enabled, onConnect, onDisconnect, onError]);

  const subscribe = useCallback((event: string, handler: (...args: any[]) => void) => {
    if (!socketRef.current) {
      console.warn('[WebSocket] Socket not initialized, cannot subscribe to', event);
      return;
    }
    socketRef.current.on(event, handler);
  }, []);

  const unsubscribe = useCallback((event: string, handler?: (...args: any[]) => void) => {
    if (!socketRef.current) return;
    if (handler) {
      socketRef.current.off(event, handler);
    } else {
      socketRef.current.off(event);
    }
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    if (!socketRef.current?.connected) {
      console.warn('[WebSocket] Socket not connected, cannot emit', event);
      return;
    }
    socketRef.current.emit(event, data);
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    subscribe,
    unsubscribe,
    emit,
  };
};
