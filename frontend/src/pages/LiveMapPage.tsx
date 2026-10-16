import React, { useState, useEffect } from 'react';
import { 
  MapContainer, TileLayer, Marker, Popup, Circle, useMap 
} from 'react-leaflet';
import L from 'leaflet';
import { 
  AlertTriangle, ShieldAlert, CheckCircle2, 
  Crosshair, Play, Pause, Info, ExternalLink, MapPin 
} from 'lucide-react';
import { api } from '../services/api';
import { useVehicle } from '../context/VehicleContext';
import { useAlert } from '../context/AlertContext';
import type { Hazard } from '../types';

// Custom SVG Icons for Leaflet Markers
const createVehicleIcon = (name: string, isSelected: boolean) => {
  return L.divIcon({
    className: 'custom-vehicle-marker',
    html: `
      <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -50%);">
        <div style="background:${isSelected ? '#0284c7' : '#0d9488'}; color:white; width:34px; height:34px; border-radius:10px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 10px rgba(0,0,0,0.25); border:2px solid white;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>
          </svg>
        </div>
        <span style="background:rgba(15,23,42,0.85); color:white; font-size:9px; font-weight:bold; padding:2px 6px; border-radius:4px; margin-top:2px; white-space:nowrap; border:1px solid rgba(255,255,255,0.2);">
          ${name}
        </span>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });
};

const createHazardIcon = (severity: string, type: string) => {
  const colors: Record<string, string> = {
    critical: '#e11d48',
    high: '#ea580c',
    medium: '#eab308',
    low: '#0284c7'
  };
  const bg = colors[severity] || '#ea580c';

  return L.divIcon({
    className: 'custom-hazard-marker',
    html: `
      <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -50%);">
        <div style="background:${bg}; color:white; width:32px; height:32px; border-radius:10px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px ${bg}80; border:2px solid white; animation: pulse 2s infinite;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <span style="background:rgba(15,23,42,0.9); color:#f8fafc; font-size:9px; font-weight:bold; padding:1px 5px; border-radius:4px; margin-top:2px; white-space:nowrap; text-transform:capitalize;">
          ${type.replace(/_/g, ' ')}
        </span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

// Component to handle recentering the map view
function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 14, { duration: 1.2 });
  }, [center, map]);
  return null;
}

type MapProvider = 'google-roadmap' | 'google-satellite' | 'google-hybrid' | 'google-terrain' | 'osm';

export const LiveMapPage: React.FC = () => {
  const { vehicles, selectedVehicle } = useVehicle();
  const { refreshNotifications } = useAlert();
  
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [selectedHazard, setSelectedHazard] = useState<Hazard | null>(null);
  const [isSimulatingTraffic, setIsSimulatingTraffic] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([12.9716, 77.5946]);
  const [mapProvider, setMapProvider] = useState<MapProvider>('google-roadmap');

  const loadHazards = async () => {
    try {
      const data = await api.getHazards({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        severity: severityFilter !== 'all' ? severityFilter : undefined
      });
      setHazards(data);
    } catch {
      // Ignored
    }
  };

  useEffect(() => {
    loadHazards();
  }, [statusFilter, severityFilter]);

  // Center on active vehicle on load
  useEffect(() => {
    if (selectedVehicle) {
      setMapCenter([selectedVehicle.latitude, selectedVehicle.longitude]);
    }
  }, [selectedVehicle?.id]);

  // Simulated traffic movement timer
  useEffect(() => {
    if (!isSimulatingTraffic) return;
    const interval = setInterval(() => {
      vehicles.forEach(async (v) => {
        // Move vehicle slightly
        const deltaLat = (Math.random() - 0.48) * 0.0004;
        const deltaLng = (Math.random() - 0.48) * 0.0004;
        const newLat = v.latitude + deltaLat;
        const newLng = v.longitude + deltaLng;
        try {
          await api.updateVehicleLocation(v.id, {
            latitude: newLat,
            longitude: newLng,
            speed: Math.max(30, Math.min(75, v.speed + (Math.random() - 0.5) * 4))
          });
        } catch {
          // Ignored
        }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isSimulatingTraffic, vehicles]);

  const handleUpdateStatus = async (hazardId: number, newStatus: string) => {
    try {
      await api.updateHazardStatus(hazardId, newStatus, 'Alex Turner (Operator)');
      await loadHazards();
      await refreshNotifications();
      if (selectedHazard?.id === hazardId) {
        setSelectedHazard((prev) => prev ? { ...prev, status: newStatus as any } : null);
      }
    } catch {
      // Ignored
    }
  };

  const centerOnVehicle = () => {
    if (selectedVehicle) {
      setMapCenter([selectedVehicle.latitude, selectedVehicle.longitude]);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Controls Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Interactive Geospatial Fleet Map
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Google Maps Live</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Displaying real-time connected vehicle telemetry and confirmed road hazard zones.
          </p>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Google Maps Layer Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span className="text-xs text-slate-500 font-semibold">Map View:</span>
            <select
              value={mapProvider}
              onChange={(e) => setMapProvider(e.target.value as MapProvider)}
              className="text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
            >
              <option value="google-roadmap">Google Maps (Roadmap)</option>
              <option value="google-satellite">Google Maps (Satellite)</option>
              <option value="google-hybrid">Google Maps (Hybrid)</option>
              <option value="google-terrain">Google Maps (Terrain)</option>
              <option value="osm">OpenStreetMap</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-medium text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="detected">Detected</option>
              <option value="pending_verification">Pending Verification</option>
              <option value="confirmed">Confirmed</option>
              <option value="cleared">Cleared</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="text-xs font-medium text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 outline-none cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Re-Center on Active Vehicle Button */}
          <button
            onClick={centerOnVehicle}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shadow-sm cursor-pointer"
          >
            <Crosshair className="w-4 h-4 text-sky-600" />
            <span>Center Vehicle</span>
          </button>

          {/* Toggle Simulated Moving Vehicles */}
          <button
            onClick={() => setIsSimulatingTraffic(!isSimulatingTraffic)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isSimulatingTraffic
                ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            {isSimulatingTraffic ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSimulatingTraffic ? 'Pause Traffic Sim' : 'Simulate Traffic'}</span>
          </button>
        </div>
      </div>

      {/* Map and Hazard Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[620px]">
        {/* Leaflet / Google Maps Container */}
        <div className="lg:col-span-8 bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative h-full">
          <MapContainer
            center={mapCenter}
            zoom={14}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <MapRecenter center={mapCenter} />

            {/* Google Maps / OpenStreetMap Tile Layers */}
            {mapProvider === 'google-roadmap' && (
              <TileLayer
                attribution='&copy; <a href="https://www.google.com/maps" target="_blank" rel="noreferrer">Google Maps</a>'
                url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                maxZoom={20}
              />
            )}
            {mapProvider === 'google-satellite' && (
              <TileLayer
                attribution='&copy; <a href="https://www.google.com/maps" target="_blank" rel="noreferrer">Google Maps</a>'
                url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                maxZoom={20}
              />
            )}
            {mapProvider === 'google-hybrid' && (
              <TileLayer
                attribution='&copy; <a href="https://www.google.com/maps" target="_blank" rel="noreferrer">Google Maps</a>'
                url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                maxZoom={20}
              />
            )}
            {mapProvider === 'google-terrain' && (
              <TileLayer
                attribution='&copy; <a href="https://www.google.com/maps" target="_blank" rel="noreferrer">Google Maps</a>'
                url="https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
                maxZoom={20}
              />
            )}
            {mapProvider === 'osm' && (
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
              />
            )}

            {/* 1,000m Alert Radius Circle around Active Vehicle */}
            {selectedVehicle && (
              <Circle
                center={[selectedVehicle.latitude, selectedVehicle.longitude]}
                radius={1000}
                pathOptions={{
                  color: '#0284c7',
                  fillColor: '#38bdf8',
                  fillOpacity: 0.08,
                  weight: 1.5,
                  dashArray: '4 6'
                }}
              />
            )}

            {/* Vehicle Markers */}
            {vehicles.map((v) => {
              const isSelected = selectedVehicle?.id === v.id;
              return (
                <Marker
                  key={`v-${v.id}`}
                  position={[v.latitude, v.longitude]}
                  icon={createVehicleIcon(v.name.split(' - ')[0], isSelected)}
                >
                  <Popup>
                    <div className="p-1 font-sans text-xs">
                      <div className="font-bold text-slate-900">{v.name}</div>
                      <div className="text-slate-500 font-mono mt-0.5">{v.plate_number}</div>
                      <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between gap-4">
                        <span className="text-slate-600 font-semibold">Speed:</span>
                        <span className="font-mono font-bold text-sky-600">{v.speed.toFixed(0)} km/h</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 mt-1">
                        <span className="text-slate-600 font-semibold">V2V Status:</span>
                        <span className="text-emerald-600 font-bold">Online</span>
                      </div>
                      <a
                        href={`https://www.google.com/maps?q=${v.latitude},${v.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2.5 w-full py-1.5 px-2 text-center bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>View in Google Maps</span>
                      </a>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Hazard Markers */}
            {hazards.map((h) => (
              <Marker
                key={`h-${h.id}`}
                position={[h.latitude, h.longitude]}
                icon={createHazardIcon(h.severity, h.type)}
                eventHandlers={{
                  click: () => setSelectedHazard(h)
                }}
              >
                <Popup>
                  <div className="p-1 font-sans text-xs">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-slate-900 capitalize">{h.type.replace(/_/g, ' ')}</span>
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {h.status}
                      </span>
                    </div>
                    <p className="text-slate-500 mb-2">{h.description}</p>
                    <div className="flex items-center justify-between border-t pt-1 text-[11px]">
                      <span className="text-slate-400">Confidence:</span>
                      <span className="font-mono font-bold">{Math.round(h.confidence * 100)}%</span>
                    </div>
                    <div className="flex flex-col gap-1.5 mt-2">
                      <button
                        onClick={() => setSelectedHazard(h)}
                        className="w-full py-1 text-center bg-sky-600 hover:bg-sky-700 text-white rounded font-semibold text-[11px] cursor-pointer transition-colors"
                      >
                        Inspect in Panel
                      </button>
                      <a
                        href={`https://www.google.com/maps?q=${h.latitude},${h.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-1 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3 text-sky-600" />
                        <span>View on Google Maps</span>
                      </a>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Map Overlay Legend */}
          <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-slate-200 shadow-md text-xs space-y-1.5">
            <span className="font-bold text-slate-800 block text-[11px] mb-1">Map Legend</span>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="w-3 h-3 rounded-full bg-rose-600 shadow-sm" />
              <span>Critical Hazard</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" />
              <span>High / Medium Hazard</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="w-3 h-3 rounded-full bg-sky-600 shadow-sm" />
              <span>Connected Vehicle</span>
            </div>
          </div>
        </div>

        {/* Hazard Detail & Verification Inspector Panel */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between h-full overflow-y-auto">
          {selectedHazard ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 capitalize">
                      {selectedHazard.type.replace(/_/g, ' ')}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">Incident #{selectedHazard.id}</span>
                  </div>
                </div>

                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  selectedHazard.severity === 'critical' ? 'bg-rose-100 text-rose-800' :
                  selectedHazard.severity === 'high' ? 'bg-amber-100 text-amber-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedHazard.severity}
                </span>
              </div>

              {/* Status Badge */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Lifecycle Status</span>
                  <span className="font-bold uppercase text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                    {selectedHazard.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">AI Confidence</span>
                  <span className="font-mono font-bold text-slate-800">{Math.round(selectedHazard.confidence * 100)}%</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Reported By</span>
                  <span className="text-slate-800 font-semibold">{selectedHazard.reported_by}</span>
                </div>
                {selectedHazard.verified_by && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Verified By</span>
                    <span className="text-emerald-700 font-semibold">{selectedHazard.verified_by}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Incident Description
                </label>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  {selectedHazard.description}
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Geospatial Coordinates
                </label>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 font-mono text-xs text-slate-600 flex justify-between items-center">
                  <span>Lat: {selectedHazard.latitude.toFixed(5)}</span>
                  <span>Lng: {selectedHazard.longitude.toFixed(5)}</span>
                </div>
              </div>

              {/* Open in Google Maps Link */}
              <a
                href={`https://www.google.com/maps?q=${selectedHazard.latitude},${selectedHazard.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 shadow-xs hover:shadow-sm transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
                <span>Open Location in Google Maps</span>
              </a>

              {/* Status Transition Action Buttons */}
              <div className="pt-2 space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Lifecycle Actions
                </label>

                {selectedHazard.status !== 'confirmed' && selectedHazard.status !== 'cleared' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedHazard.id, 'confirmed')}
                    className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Confirm & Broadcast V2V Alert</span>
                  </button>
                )}

                {selectedHazard.status === 'detected' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedHazard.id, 'pending_verification')}
                    className="w-full py-2.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Info className="w-4 h-4" />
                    <span>Move to Pending Verification</span>
                  </button>
                )}

                {selectedHazard.status !== 'cleared' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedHazard.id, 'cleared')}
                    className="w-full py-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark Cleared (Deactivate Warnings)</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-700">No Hazard Selected</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Click any hazard marker on the live map to inspect telemetry, verify status, or trigger V2V warnings.
                </p>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 text-center font-mono">
            V2V Proximity Radius: 1,000m | Google Maps Live Telemetry
          </div>
        </div>
      </div>
    </div>
  );
};
