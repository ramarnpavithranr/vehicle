import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Vehicle, VehicleHealth } from '../types';
import { api } from '../services/api';
import { wsClient } from '../services/websocket';

interface VehicleContextType {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  selectedVehicleHealth: VehicleHealth | null;
  setSelectedVehicleId: (id: number) => void;
  refreshVehicles: () => Promise<void>;
  refreshHealth: () => Promise<void>;
  updateHealthTelemetry: (data: Partial<VehicleHealth>) => Promise<void>;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export const VehicleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number>(1);
  const [health, setHealth] = useState<VehicleHealth | null>(null);

  const fetchVehicles = async () => {
    try {
      const list = await api.getVehicles();
      setVehicles(list);
    } catch {
      // Fallback initial list
      setVehicles([
        {
          id: 1,
          name: 'Pulse Alpha - Tesla Model 3',
          model: 'Tesla Model 3 Long Range',
          plate_number: 'KA-01-EQ-9812',
          latitude: 12.9716,
          longitude: 77.5946,
          speed: 52.0,
          heading: 85.0,
          status: 'active',
          is_connected: true,
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Pulse Beta - Ford Mach-E',
          model: 'Ford Mustang Mach-E',
          plate_number: 'KA-03-EV-4421',
          latitude: 12.9745,
          longitude: 77.5982,
          speed: 48.0,
          heading: 120.0,
          status: 'active',
          is_connected: true,
          updated_at: new Date().toISOString()
        }
      ]);
    }
  };

  const fetchHealth = async () => {
    if (!selectedVehicleId) return;
    try {
      const h = await api.getVehicleHealth(selectedVehicleId);
      setHealth(h);
    } catch {
      // Fallback health
      setHealth({
        id: selectedVehicleId,
        vehicle_id: selectedVehicleId,
        engine_temp: 88.5,
        battery_level: 84.0,
        tire_pressure: 33.5,
        vibration_index: 3.2,
        brake_wear: 14.0,
        speed: 52.0,
        mileage: 14280.0,
        warning_status: 'Optimal',
        last_updated: new Date().toISOString()
      });
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [selectedVehicleId]);

  // Listen for WebSocket vehicle and health updates
  useEffect(() => {
    const unsubscribe = wsClient.subscribe((msg) => {
      if (msg.type === 'VEHICLE_MOVED') {
        setVehicles((prev) =>
          prev.map((v) =>
            v.id === msg.vehicle_id
              ? { ...v, latitude: msg.latitude, longitude: msg.longitude, speed: msg.speed ?? v.speed, heading: msg.heading ?? v.heading }
              : v
          )
        );
      } else if (msg.type === 'HEALTH_TELEMETRY' && msg.vehicle_id === selectedVehicleId) {
        setHealth((prev) =>
          prev
            ? {
                ...prev,
                engine_temp: msg.engine_temp ?? prev.engine_temp,
                battery_level: msg.battery_level ?? prev.battery_level,
                tire_pressure: msg.tire_pressure ?? prev.tire_pressure,
                vibration_index: msg.vibration_index ?? prev.vibration_index,
                warning_status: msg.status ?? prev.warning_status,
                last_updated: new Date().toISOString()
              }
            : null
        );
      }
    });

    return () => unsubscribe();
  }, [selectedVehicleId]);

  const updateHealthTelemetry = async (data: Partial<VehicleHealth>) => {
    if (!selectedVehicleId) return;
    try {
      const updated = await api.updateVehicleHealth(selectedVehicleId, data);
      setHealth(updated);
    } catch {
      // Local optimistic update
      setHealth((prev) => prev ? { ...prev, ...data } : null);
    }
  };

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0] || null;

  return (
    <VehicleContext.Provider
      value={{
        vehicles,
        selectedVehicle,
        selectedVehicleHealth: health,
        setSelectedVehicleId,
        refreshVehicles: fetchVehicles,
        refreshHealth: fetchHealth,
        updateHealthTelemetry
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
};

export const useVehicle = () => {
  const context = useContext(VehicleContext);
  if (!context) throw new Error('useVehicle must be used within a VehicleProvider');
  return context;
};
