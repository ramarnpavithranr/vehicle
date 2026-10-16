import React, { createContext, useContext, useState, useEffect } from 'react';
import type { V2VAlert, NotificationItem } from '../types';
import { wsClient } from '../services/websocket';
import { audioAlerts } from '../services/audioAlerts';
import { api } from '../services/api';

interface AlertContextType {
  activeAlerts: V2VAlert[];
  notifications: NotificationItem[];
  unreadCount: number;
  connectionStatus: 'connected' | 'reconnecting' | 'disconnected';
  isMuted: boolean;
  toggleMute: () => void;
  dismissAlert: (hazardId: number) => void;
  clearAllAlerts: () => void;
  broadcastTestAlert: (hazardType?: string, distanceMeters?: number) => void;
  refreshNotifications: () => Promise<void>;
  markNotificationAsRead: (id: number) => Promise<void>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeAlerts, setActiveAlerts] = useState<V2VAlert[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'reconnecting' | 'disconnected'>('disconnected');
  const [isMuted, setIsMuted] = useState<boolean>(() => audioAlerts.getIsMuted());

  const fetchNotifications = async () => {
    try {
      const items = await api.getNotifications();
      setNotifications(items);
    } catch {
      // Ignored
    }
  };

  useEffect(() => {
    // Connect WebSocket
    wsClient.connect();

    const unsubStatus = wsClient.onStatusChange((status) => {
      setConnectionStatus(status);
    });

    const unsubMessages = wsClient.subscribe((msg) => {
      if (msg.type === 'V2V_ALERT') {
        const newAlert: V2VAlert = {
          type: 'V2V_ALERT',
          hazard_id: msg.hazard_id,
          hazard_type: msg.hazard_type,
          severity: msg.severity,
          distance_meters: msg.distance_meters,
          vehicle_id: msg.vehicle_id,
          vehicle_name: msg.vehicle_name,
          coordinates: msg.coordinates,
          message: msg.message,
          voice_message: msg.voice_message,
          timestamp: msg.timestamp || new Date().toISOString()
        };
        setActiveAlerts((prev) => {
          // Deduplicate by hazard_id
          const exists = prev.some((a) => a.hazard_id === newAlert.hazard_id);
          if (exists) return prev;
          return [newAlert, ...prev];
        });
        fetchNotifications();
      } else if (msg.type === 'HAZARD_CLEARED') {
        setActiveAlerts((prev) => prev.filter((a) => a.hazard_id !== msg.hazard?.id));
        fetchNotifications();
      } else if (msg.type === 'HAZARD_CONFIRMED' || msg.type === 'HAZARD_DETECTED') {
        fetchNotifications();
      }
    });

    fetchNotifications();

    return () => {
      unsubStatus();
      unsubMessages();
    };
  }, []);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    audioAlerts.setMuted(next);
    if (!next) {
      audioAlerts.playChime('success');
      audioAlerts.speak('Audio alerts unmuted');
    }
  };

  const dismissAlert = (hazardId: number) => {
    setActiveAlerts((prev) => prev.filter((a) => a.hazard_id !== hazardId));
  };

  const clearAllAlerts = () => {
    setActiveAlerts([]);
  };

  const broadcastTestAlert = (hazardType?: string, distanceMeters?: number) => {
    const type = typeof hazardType === 'string' ? hazardType : 'pothole';
    const dist = typeof distanceMeters === 'number' ? distanceMeters : 180;
    const testAlert: V2VAlert = {
      type: 'V2V_ALERT',
      hazard_id: Math.floor(Math.random() * 900) + 100,
      hazard_type: type,
      severity: 'critical',
      distance_meters: dist,
      vehicle_id: 1,
      vehicle_name: 'Pulse Alpha',
      coordinates: { lat: 12.973, lng: 77.596 },
      message: `V2V ADVISORY: ${type.replace(/_/g, ' ').toUpperCase()} ${dist}m ahead!`,
      voice_message: `Warning. ${type.replace(/_/g, ' ')} detected ${dist} meters ahead.`,
      timestamp: new Date().toISOString()
    };
    audioAlerts.announceHazard(testAlert.hazard_type, testAlert.distance_meters);
    setActiveAlerts((prev) => [testAlert, ...prev]);
  };

  const markNotificationAsRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <AlertContext.Provider
      value={{
        activeAlerts,
        notifications,
        unreadCount,
        connectionStatus,
        isMuted,
        toggleMute,
        dismissAlert,
        clearAllAlerts,
        broadcastTestAlert,
        refreshNotifications: fetchNotifications,
        markNotificationAsRead
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) throw new Error('useAlert must be used within an AlertProvider');
  return context;
};
