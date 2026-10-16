import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, ShieldCheck, Car, HeartPulse, 
  Plus, Camera, ArrowUpRight, Zap, Activity
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { StatCard } from '../components/StatCard';
import { HazardModal } from '../components/HazardModal';
import { api } from '../services/api';
import { useVehicle } from '../context/VehicleContext';
import { useAlert } from '../context/AlertContext';
import type { Hazard } from '../types';

export const DashboardOverview: React.FC = () => {
  const navigate = useNavigate();
  const { vehicles, selectedVehicle, selectedVehicleHealth } = useVehicle();
  const { broadcastTestAlert } = useAlert();
  
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [_loading, setLoading] = useState(true);

  const fetchHazards = async () => {
    try {
      const data = await api.getHazards();
      setHazards(data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHazards();
  }, []);

  const activeHazards = hazards.filter((h) => h.status !== 'cleared' && h.status !== 'rejected');
  const confirmedHazards = hazards.filter((h) => h.status === 'confirmed');
  const criticalCount = hazards.filter((h) => h.severity === 'critical' && h.status !== 'cleared').length;

  // Chart data: Hazards by Type
  const typeCounts: Record<string, number> = {};
  hazards.forEach((h) => {
    const formatted = h.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    typeCounts[formatted] = (typeCounts[formatted] || 0) + 1;
  });
  const typeChartData = Object.keys(typeCounts).map((name) => ({
    name,
    count: typeCounts[name]
  }));

  // Activity timeline mock data
  const activityData = [
    { time: '08:00', detections: 2, alerts: 1 },
    { time: '10:00', detections: 5, alerts: 3 },
    { time: '12:00', detections: 8, alerts: 6 },
    { time: '14:00', detections: 4, alerts: 3 },
    { time: '16:00', detections: 7, alerts: 5 },
    { time: '18:00', detections: 11, alerts: 9 },
    { time: '20:00', detections: 6, alerts: 4 },
  ];

  const SEVERITY_COLORS: Record<string, string> = {
    critical: '#e11d48',
    high: '#ea580c',
    medium: '#eab308',
    low: '#0284c7'
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome & Quick Actions Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-3 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Safety Operations Center
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Fleet Active
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time telemetry, active hazard verification, and V2V proximity mesh monitoring.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 text-white text-xs font-semibold shadow-md shadow-sky-600/20 hover:shadow-lg hover:shadow-sky-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Report Road Hazard</span>
          </button>

          <button
            onClick={() => navigate('/dashboard/ai-detection')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 text-xs font-semibold shadow-xs hover:shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4 text-sky-600" />
            <span>AI Camera Feed</span>
          </button>

          <button
            onClick={() => broadcastTestAlert()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 hover:border-rose-300 text-xs font-semibold shadow-xs hover:shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 text-rose-600" />
            <span>Simulate V2V Alert</span>
          </button>
        </div>
      </div>

      {/* Primary Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Active Hazards"
          value={activeHazards.length}
          change={criticalCount > 0 ? `${criticalCount} Critical Priority` : 'All Manageable'}
          changeType={criticalCount > 0 ? 'negative' : 'positive'}
          icon={AlertTriangle}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-600"
          subtitle="Monitored in system"
          onClick={() => navigate('/dashboard/hazards')}
        />

        <StatCard
          title="Confirmed V2V Alerts"
          value={confirmedHazards.length}
          change="Broadcasting to fleet"
          changeType="positive"
          icon={ShieldCheck}
          iconBgColor="bg-rose-50"
          iconColor="text-rose-600"
          subtitle="Verified by consensus"
          onClick={() => navigate('/dashboard/v2v-alerts')}
        />

        <StatCard
          title="Connected Fleet"
          value={vehicles.length}
          change="5.9 GHz DSRC / WebSocket"
          changeType="positive"
          icon={Car}
          iconBgColor="bg-sky-50"
          iconColor="text-sky-600"
          subtitle="100% telemetry online"
          onClick={() => navigate('/dashboard/map')}
        />

        <StatCard
          title="Active Telematics Health"
          value={`${selectedVehicleHealth?.battery_level.toFixed(0) || 84}%`}
          change={selectedVehicleHealth?.warning_status || 'Optimal'}
          changeType={selectedVehicleHealth?.warning_status === 'Optimal' ? 'positive' : 'negative'}
          icon={HeartPulse}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
          subtitle={selectedVehicle?.name || 'Pulse Alpha'}
          onClick={() => navigate('/dashboard/vehicle-health')}
        />
      </div>

      {/* Main Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Detection & Alert Activity Timeline */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900">
                  24-Hour Detection & V2V Dispatch Frequency
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Simulated hourly sensor observations versus confirmed warnings dispatched
              </p>
            </div>
            <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-sky-50 text-sky-700 rounded-xl border border-sky-100 flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
              Live Stream
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDetections" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '14px', 
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
                  }} 
                />
                <Area type="monotone" dataKey="detections" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDetections)" name="Raw Detections" />
                <Area type="monotone" dataKey="alerts" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAlerts)" name="V2V Dispatched" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hazard Types Distribution */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Hazards by Category</h3>
                <span className="text-xs text-slate-500 font-medium">Categorized breakdown</span>
              </div>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
                {hazards.length} total
              </span>
            </div>
            
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeChartData} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} width={80} />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderRadius: '10px', 
                      border: '1px solid #e2e8f0',
                      fontSize: '11px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }} 
                  />
                  <Bar dataKey="count" fill="#0284c7" radius={[0, 6, 6, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Verified Incidents</span>
            <button
              onClick={() => navigate('/dashboard/hazards')}
              className="font-semibold text-sky-600 hover:text-sky-700 hover:underline inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Manage all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Active Hazards Table & Connected Fleet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Hazards Queue */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Active Road Hazard Feed</h3>
              <p className="text-xs text-slate-500">Real-time status transitions and verification queue</p>
            </div>
            <button
              onClick={() => navigate('/dashboard/hazards')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline cursor-pointer transition-colors"
            >
              View Full Table
            </button>
          </div>

          <div className="space-y-3">
            {activeHazards.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No active road hazards currently reported.
              </div>
            ) : (
              activeHazards.slice(0, 4).map((h) => (
                <div
                  key={h.id}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/70 hover:border-slate-300 flex items-center justify-between gap-3 transition-all duration-150 shadow-2xs hover:shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm flex-shrink-0"
                      style={{ backgroundColor: SEVERITY_COLORS[h.severity] || '#0284c7' }}
                    >
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 capitalize">
                          {h.type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 uppercase font-bold shadow-2xs">
                          {h.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{h.description}</p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-mono font-bold text-slate-800 block">
                      {Math.round(h.confidence * 100)}% Conf
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      [{h.latitude.toFixed(3)}, {h.longitude.toFixed(3)}]
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Connected Vehicles Overview */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Connected Vehicles</h3>
              <p className="text-xs text-slate-500">Live coordinates and speed telemetry</p>
            </div>
            <button
              onClick={() => navigate('/dashboard/map')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline cursor-pointer transition-colors"
            >
              Open Live Map
            </button>
          </div>

          <div className="space-y-3">
            {vehicles.map((v) => (
              <div
                key={v.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                  selectedVehicle?.id === v.id
                    ? 'bg-sky-50/70 border-sky-300 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{v.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono font-medium">{v.plate_number}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-slate-800">{v.speed.toFixed(0)} km/h</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    [{v.latitude.toFixed(3)}, {v.longitude.toFixed(3)}]
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hazard Report Modal */}
      <HazardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchHazards();
        }}
      />
    </div>
  );
};
