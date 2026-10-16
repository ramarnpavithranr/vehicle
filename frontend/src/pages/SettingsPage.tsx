import React, { useState } from 'react';
import { 
  Settings, Volume2, User, 
  Radio, Server, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { useVehicle } from '../context/VehicleContext';
import { audioAlerts } from '../services/audioAlerts';

export const SettingsPage: React.FC = () => {
  const { user, demoLogin } = useAuth();
  const { isMuted, toggleMute, connectionStatus } = useAlert();
  const { vehicles, selectedVehicle, setSelectedVehicleId } = useVehicle();

  const [speechRate, setSpeechRate] = useState(1.0);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const handleSavePreferences = () => {
    setSavedMsg('Preferences saved successfully!');
    setTimeout(() => setSavedMsg(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-700" />
          System Settings & Driver Preferences
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage auditory emergency alerts, vehicle telemetry assignments, and account credentials.
        </p>
      </div>

      {savedMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {savedMsg}
        </div>
      )}

      {/* Audio Engine Configuration */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-sky-600" />
              Emergency Audio & Voice Synthesis Engine
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure Web Audio API synthesizers and emergency spoken announcements.
            </p>
          </div>
          <button
            onClick={toggleMute}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
              isMuted
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            {isMuted ? 'All Sounds Muted' : 'Audio Active'}
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-800">Mute Emergency Audio Alarms</h4>
              <p className="text-[11px] text-slate-500">Temporarily silence audio tones and spoken warnings.</p>
            </div>
            <input
              type="checkbox"
              checked={isMuted}
              onChange={toggleMute}
              className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Text-to-Speech Voice Rate</span>
              <span className="font-mono text-sky-600">{speechRate}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.4"
              step="0.05"
              value={speechRate}
              onChange={(e) => setSpeechRate(Number(e.target.value))}
              className="w-full accent-sky-600"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => audioAlerts.announceHazard('pothole', 200)}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
            >
              Test Voice Synthesizer
            </button>
            <button
              onClick={() => audioAlerts.playChime('critical')}
              className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200"
            >
              Test Critical Chime
            </button>
          </div>
        </div>
      </div>

      {/* Vehicle Profile Assignment */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Radio className="w-5 h-5 text-sky-600" />
            Ego Vehicle Telemetry Assignment
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select which registered vehicle is reporting on this console node.
          </p>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Active Vehicle Node</label>
          <select
            value={selectedVehicle?.id || 1}
            onChange={(e) => setSelectedVehicleId(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500"
          >
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} • {v.model} ({v.plate_number})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Demo Profile Switcher */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-sky-600" />
            Switch Active Profile / Role
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Current user: <strong className="text-slate-800">{user?.full_name}</strong> ({user?.role})
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => demoLogin('admin')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              user?.role === 'admin'
                ? 'border-sky-500 bg-sky-50/60 ring-2 ring-sky-500/20'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="font-bold text-xs text-slate-900 block">Safety Inspector / Admin</span>
            <span className="text-[11px] text-slate-500">Alex Turner • Full Verification Access</span>
          </button>

          <button
            onClick={() => demoLogin('driver')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              user?.role === 'driver'
                ? 'border-sky-500 bg-sky-50/60 ring-2 ring-sky-500/20'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="font-bold text-xs text-slate-900 block">Connected Driver</span>
            <span className="text-[11px] text-slate-500">Priya Sharma • Real-Time Onboard Dashboard</span>
          </button>
        </div>
      </div>

      {/* System Status Indicators */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Server className="w-5 h-5 text-emerald-600" />
          Server & WebSocket Diagnostics
        </h2>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">FastAPI REST Server</span>
            <span className="font-bold text-emerald-600 mt-1 block">Online (Port 8000)</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">V2V WebSocket Link</span>
            <span className="font-bold text-slate-800 capitalize mt-1 block">{connectionStatus}</span>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={handleSavePreferences}
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all"
        >
          Save All System Preferences
        </button>
      </div>
    </div>
  );
};
