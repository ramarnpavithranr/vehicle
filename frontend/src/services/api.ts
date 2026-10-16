import type { 
  Hazard, Vehicle, VehicleHealth, DocumentReminder, 
  NotificationItem, DetectionResult, SimulationState 
} from '../types';

const API_BASE = (import.meta.env.VITE_API_URL as string) || '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('autopulse_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export const api = {
  // Auth
  async login(creds: { email: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creds)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Authentication failed' }));
      throw new Error(err.detail || 'Login failed');
    }
    return res.json();
  },

  async register(data: { email: string; password: string; full_name: string; role?: string }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(err.detail || 'Registration failed');
    }
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch user session');
    return res.json();
  },

  // Hazards
  async getHazards(params?: { status?: string; severity?: string; hazard_type?: string; search?: string }): Promise<Hazard[]> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.severity) query.append('severity', params.severity);
    if (params?.hazard_type) query.append('hazard_type', params.hazard_type);
    if (params?.search) query.append('search', params.search);

    const res = await fetch(`${API_BASE}/hazards?${query.toString()}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch hazards');
    return res.json();
  },

  async createHazard(data: Partial<Hazard>): Promise<Hazard> {
    const res = await fetch(`${API_BASE}/hazards`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to report hazard');
    return res.json();
  },

  async updateHazardStatus(hazardId: number, status: string, verifiedBy?: string): Promise<Hazard> {
    const res = await fetch(`${API_BASE}/hazards/${hazardId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, verified_by: verifiedBy })
    });
    if (!res.ok) throw new Error('Failed to update hazard status');
    return res.json();
  },

  async deleteHazard(hazardId: number) {
    const res = await fetch(`${API_BASE}/hazards/${hazardId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete hazard');
    return res.json();
  },

  // Vehicles
  async getVehicles(): Promise<Vehicle[]> {
    const res = await fetch(`${API_BASE}/vehicles`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch vehicles');
    return res.json();
  },

  async updateVehicleLocation(vehicleId: number, loc: { latitude: number; longitude: number; speed?: number; heading?: number }) {
    const res = await fetch(`${API_BASE}/vehicles/${vehicleId}/location`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(loc)
    });
    if (!res.ok) throw new Error('Failed to update vehicle location');
    return res.json();
  },

  // Health
  async getVehicleHealth(vehicleId: number): Promise<VehicleHealth> {
    const res = await fetch(`${API_BASE}/health/${vehicleId}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch vehicle health');
    return res.json();
  },

  async updateVehicleHealth(vehicleId: number, data: Partial<VehicleHealth>): Promise<VehicleHealth> {
    const res = await fetch(`${API_BASE}/health/${vehicleId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update vehicle health');
    return res.json();
  },

  async evaluateThresholds(vehicleId: number, thresholds: Record<string, number>): Promise<VehicleHealth> {
    const res = await fetch(`${API_BASE}/health/${vehicleId}/evaluate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(thresholds)
    });
    if (!res.ok) throw new Error('Failed to evaluate thresholds');
    return res.json();
  },

  // Documents
  async getDocuments(category?: string, status?: string): Promise<DocumentReminder[]> {
    const query = new URLSearchParams();
    if (category) query.append('category', category);
    if (status) query.append('status', status);

    const res = await fetch(`${API_BASE}/documents?${query.toString()}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch documents');
    return res.json();
  },

  async createDocument(data: Partial<DocumentReminder>): Promise<DocumentReminder> {
    const res = await fetch(`${API_BASE}/documents`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create document');
    return res.json();
  },

  async updateDocument(docId: number, data: Partial<DocumentReminder>): Promise<DocumentReminder> {
    const res = await fetch(`${API_BASE}/documents/${docId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update document');
    return res.json();
  },

  async deleteDocument(docId: number) {
    const res = await fetch(`${API_BASE}/documents/${docId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete document');
    return res.json();
  },

  async getSampleFines() {
    const res = await fetch(`${API_BASE}/documents/sample-fines`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch sample fines');
    return res.json();
  },

  // Notifications
  async getNotifications(category?: string, unreadOnly?: boolean): Promise<NotificationItem[]> {
    const query = new URLSearchParams();
    if (category) query.append('category', category);
    if (unreadOnly) query.append('unread_only', 'true');

    const res = await fetch(`${API_BASE}/notifications?${query.toString()}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async markNotificationRead(notifId: number): Promise<NotificationItem> {
    const res = await fetch(`${API_BASE}/notifications/${notifId}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to mark read');
    return res.json();
  },

  async markAllNotificationsRead() {
    const res = await fetch(`${API_BASE}/notifications/mark-all-read`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to mark all read');
    return res.json();
  },

  async deleteNotification(notifId: number) {
    const res = await fetch(`${API_BASE}/notifications/${notifId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete notification');
    return res.json();
  },

  // AI Detection
  async analyzeFrame(file: Blob, confidence: number = 0.5): Promise<DetectionResult> {
    const formData = new FormData();
    formData.append('file', file, 'frame.jpg');
    formData.append('confidence_threshold', confidence.toString());

    const token = localStorage.getItem('autopulse_token');
    const res = await fetch(`${API_BASE}/detection/analyze-frame`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData
    });
    if (!res.ok) throw new Error('Failed to analyze frame');
    return res.json();
  },

  async getDemoFrame(confidence: number = 0.5): Promise<DetectionResult> {
    const res = await fetch(`${API_BASE}/detection/demo-frame?confidence_threshold=${confidence}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to get demo frame');
    return res.json();
  },

  async reportFromDetection(data: {
    hazard_type: string;
    severity: string;
    latitude: number;
    longitude: number;
    confidence: number;
    description?: string;
  }) {
    const formData = new FormData();
    formData.append('hazard_type', data.hazard_type);
    formData.append('severity', data.severity);
    formData.append('latitude', data.latitude.toString());
    formData.append('longitude', data.longitude.toString());
    formData.append('confidence', data.confidence.toString());
    if (data.description) formData.append('description', data.description);

    const token = localStorage.getItem('autopulse_token');
    const res = await fetch(`${API_BASE}/detection/report-from-detection`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData
    });
    if (!res.ok) throw new Error('Failed to report detected hazard');
    return res.json();
  },

  // Simulation
  async getSimulationState(): Promise<{ state: SimulationState; disclaimer: string }> {
    const res = await fetch(`${API_BASE}/simulation/state`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to get simulation state');
    return res.json();
  },

  async configureSimulation(config: { traffic_volume: string; average_speed: number; alert_radius_meters: number; alerts_enabled: boolean }) {
    const res = await fetch(`${API_BASE}/simulation/configure`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(config)
    });
    if (!res.ok) throw new Error('Failed to configure simulation');
    return res.json();
  },

  async resetSimulation() {
    const res = await fetch(`${API_BASE}/simulation/reset`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to reset simulation');
    return res.json();
  },

  async stepSimulation(): Promise<{ status: string; state: SimulationState }> {
    const res = await fetch(`${API_BASE}/simulation/step`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to step simulation');
    return res.json();
  },

  async getSystemStatus() {
    const res = await fetch(`${API_BASE}/system-status`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return { status: 'offline', v2v_websocket_clients: 0 };
    return res.json();
  }
};
