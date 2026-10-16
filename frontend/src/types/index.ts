export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'driver' | 'admin' | 'operator';
  vehicle_id?: number | null;
}

export type HazardType = 
  | 'pothole' 
  | 'roadwork' 
  | 'debris' 
  | 'slick_road' 
  | 'stalled_vehicle' 
  | 'accident'
  | 'pedestrian_or_animal'
  | 'general_obstacle';

export type HazardSeverity = 'low' | 'medium' | 'high' | 'critical';

export type HazardStatus = 'detected' | 'pending_verification' | 'confirmed' | 'cleared' | 'rejected';

export interface Hazard {
  id: number;
  type: HazardType;
  severity: HazardSeverity;
  description: string;
  latitude: number;
  longitude: number;
  status: HazardStatus;
  confidence: number;
  reported_by: string;
  verified_by?: string | null;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: number;
  name: string;
  model: string;
  plate_number: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  status: string;
  is_connected: boolean;
  updated_at: string;
}

export interface V2VAlert {
  type: 'V2V_ALERT';
  hazard_id: number;
  hazard_type: string;
  severity: HazardSeverity;
  distance_meters: number;
  vehicle_id: number;
  vehicle_name: string;
  coordinates: { lat: number; lng: number };
  message: string;
  voice_message: string;
  timestamp: string;
}

export interface VehicleHealth {
  id: number;
  vehicle_id: number;
  engine_temp: number;
  battery_level: number;
  tire_pressure: number;
  vibration_index: number;
  brake_wear: number;
  speed: number;
  mileage: number;
  warning_status: string;
  last_updated: string;
}

export interface DocumentReminder {
  id: number;
  user_id?: number;
  title: string;
  category: 'insurance' | 'license' | 'puc' | 'fitness' | 'service' | 'custom';
  document_number?: string;
  expiry_date: string;
  status: 'upcoming' | 'due_soon' | 'overdue' | 'completed';
  notes?: string;
  created_at: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  category: 'hazard' | 'health' | 'document' | 'system';
  severity: 'info' | 'warning' | 'danger' | 'success';
  is_read: boolean;
  timestamp: string;
}

export interface DetectionBox {
  label: string;
  confidence: number;
  box: [number, number, number, number]; // [x1, y1, x2, y2]
  hazard_type?: string | null;
  severity?: HazardSeverity;
  is_ai_detected?: boolean;
}

export interface DetectionResult {
  frame_id: string;
  timestamp: string;
  width?: number;
  height?: number;
  objects_detected: number;
  detections: DetectionBox[];
  warning_level: 'Safe' | 'Caution' | 'Hazard Detected';
  summary: string;
  is_simulated: boolean;
  disclaimer?: string;
}

export interface SimulationState {
  is_running: boolean;
  step_count: number;
  alerts_enabled: boolean;
  traffic_volume: string;
  alert_radius_meters: number;
  average_speed_kmh: number;
  virtual_vehicles: Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
    speed: number;
    heading: number;
    status: string;
    alerted: boolean;
    warning_distance: number;
  }>;
  simulated_hazards: Array<{
    id: string;
    type: string;
    lat: number;
    lng: number;
    severity: string;
    label: string;
  }>;
  metrics: {
    vehicles_alerted: number;
    total_vehicles: number;
    avg_warning_distance_meters: number;
    avg_response_time_seconds: number;
    simulated_risk_reduction_pct: number;
    alerts_dispatched_count: number;
  };
}
