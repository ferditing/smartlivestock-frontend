/**
 * SmartLivestock — NotificationContext
 * Full WebSocket + REST notification state management.
 * Original logic 100% preserved, structure cleaned up.
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useWebSocket } from "../hooks/useWebSocket";

export interface Notification {
  id: string; type: string; title: string; message: string;
  read: boolean; data?: Record<string, any>; action_url?: string;
  created_at: string; updated_at: string;
}

interface NotificationContextType {
  notifications: Notification[]; unreadCount: number;
  isLoading: boolean; error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAll: () => Promise<void>;
  fetchNotifications: (limit?: number, offset?: number, unreadOnly?: boolean) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children, autoFetch = true }: { children: React.ReactNode; autoFetch?: boolean }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [isLoading,     setIsLoading]     = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const token    = localStorage.getItem("token");
  const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/api\/?$/, "");
  const { subscribe, unsubscribe, isConnected } = useWebSocket({ enabled: !!token });

  const apiCall = useCallback(async (method: string, endpoint: string, body?: any) => {
    try {
      const options: RequestInit = { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } };
      if (body) options.body = JSON.stringify(body);
      const response = await fetch(`${API_BASE}/api/notifications${endpoint}`, options);
      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message); throw err;
    }
  }, [token, API_BASE]);

  const fetchNotifications = useCallback(async (limit = 20, offset = 0, unreadOnly = false) => {
    setIsLoading(true); setError(null);
    try {
      const query = new URLSearchParams({ limit: limit.toString(), offset: offset.toString(), ...(unreadOnly && { read: "false" }) });
      const data  = await apiCall("GET", `/?${query}`);
      const list  = data.data || data.notifications || [];
      setNotifications(list.map((n: any) => ({ ...n, id: String(n.id) })));
    } catch (err) { console.error("Failed to fetch notifications:", err); }
    finally { setIsLoading(false); }
  }, [apiCall]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await apiCall("GET", "/unread/count");
      setUnreadCount(Number(data.unreadCount) || 0);
    } catch (err) { console.error("Failed to fetch unread count:", err); }
  }, [apiCall]);

  const playNotificationSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(880, ctx.currentTime);

      gain.gain.setValueAtTime(0.0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // Fail silently if audio is not available or blocked
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await apiCall("PATCH", `/${notificationId}/read`);
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
      await fetchUnreadCount();
    } catch (err) { console.error("Failed to mark as read:", err); }
  }, [apiCall, fetchUnreadCount]);

  const markAllAsRead = useCallback(async () => {
    try {
      await apiCall("PATCH", "/read/all");
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) { console.error("Failed to mark all as read:", err); }
  }, [apiCall]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await apiCall("DELETE", `/${notificationId}`);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      await fetchUnreadCount();
    } catch (err) { console.error("Failed to delete notification:", err); }
  }, [apiCall, fetchUnreadCount]);

  const clearAll = useCallback(async () => {
    try {
      await apiCall("DELETE", "/");
      setNotifications([]); setUnreadCount(0);
    } catch (err) { console.error("Failed to clear all:", err); }
  }, [apiCall]);

  useEffect(() => {
    if (!isConnected) return;

    const handleNewNotification = (payload: any) => {
      console.log("[Notification] New notification received:", payload);
      const notification: Notification = {
        id: String(payload.id ?? payload.userId ?? Date.now()), type: payload.type || "info",
        title: payload.title || "Notification", message: payload.message || "",
        read: payload.read ?? false, data: payload.data, action_url: payload.action_url,
        created_at: payload.created_at || new Date().toISOString(),
        updated_at: payload.updated_at || new Date().toISOString(),
      };
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      playNotificationSound();
    };
    const handleNotificationRead    = (data: { notificationId: string }) => {
      setNotifications(prev => prev.map(n => n.id === data.notificationId ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    };
    const handleUnreadCountUpdate   = (data: { count: number }) => setUnreadCount(data.count);

    subscribe("notification:new",   handleNewNotification);
    subscribe("notification:read",  handleNotificationRead);
    subscribe("unreadCount:update", handleUnreadCountUpdate);

    return () => {
      unsubscribe("notification:new",   handleNewNotification);
      unsubscribe("notification:read",  handleNotificationRead);
      unsubscribe("unreadCount:update", handleUnreadCountUpdate);
    };
  }, [isConnected, subscribe, unsubscribe, playNotificationSound]);

  useEffect(() => {
    if (autoFetch) { fetchNotifications(); fetchUnreadCount(); }
  }, [autoFetch, fetchNotifications, fetchUnreadCount]);

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, isLoading, error,
      markAsRead, markAllAsRead, deleteNotification, clearAll,
      fetchNotifications, fetchUnreadCount,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
}