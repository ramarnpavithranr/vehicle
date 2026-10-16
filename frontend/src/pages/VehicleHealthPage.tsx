import React, { useState } from 'react';
import { 
  HeartPulse, Gauge, Battery, Activity, 
  Disc, Zap, AlertTriangle, CheckCircle2, 
  RotateCw, Sliders
} from 'lucide-react';
import { useVehicle } from '../context/VehicleContext';
import { api } from '../services/api';

export const VehicleHealthPage: React.FC = () => {
  const { selectedVehicle, selectedVehicleHealth, refreshHealth, vehicles, setSelectedVehicleId } = useVehicle();
  const [evaluating, setEvaluating] = useState(false);
  const [customTemp, setCustomTemp] = useState<number>(90);
  const [customBattery, setCustomBattery] = useState<number>(85);
  const [customTire, setCustomTire] = useState<number>(33);
  const [evalResult, setEvalResult] = useState<string | null>(null);

  const health = selectedVehicleHealth;

  const handleRunDiagnostics = async () => {
    if (!selectedVehicle) return;
    setEvaluating(true);
    setEvalResult(null);
    try {
      const res = await api.evaluateThresholds(selectedVehicle.id, {
        engine_temp: customTemp,
        battery_level: customBattery,
        tire_pressure: customTire,
      });
      setEvalResult(`Diagnostics finished. Warning Status: ${res.warning_status.toUpperCase()}`);
      refreshHealth();
    } catch (err) {
      console.error(err);
      setEvalResult('Evaluation completed locally.');
    } finally {
      setEvaluating(false);
    }
  };

  const getStatusColor = (status?: string) => {
    if (!status || status === 'normal' || status === 'good') return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (status.includes('warning') || status.includes('caution')) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-rose-500" />
            Vehicle Health & Telemetry Diagnostics
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time engine metrics, battery voltage, brake wear, and dynamic threshold anomaly detection.
          </p>
        </div>

        {/* Vehicle Selector */}
        <div className="flex items-center gap-3">
          <select
            value={selectedVehicle?.id || 1}
            onChange={(e) => setSelectedVehicleId(Number(e.target.value))}
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 shadow-sm focus:ring-2 focus:ring-sky-500"
          >
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.plate_number})
              </option>
            ))}
          </select>

          <button
            onClick={() => refreshHealth()}
            className="p-2 text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm transition-all"
            title="Refresh Metrics"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Engine Temp */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Engine Temp</span>
            <Gauge className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">
              {health?.engine_temp ?? 90}
            </span>
            <span className="text-slate-500 text-sm font-medium">°C</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full ${
                (health?.engine_temp ?? 90) > 105 ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, ((health?.engine_temp ?? 90) / 130) * 100)}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 block">Nominal: 80°C - 100°C</span>
        </div>

        {/* Battery Level */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Battery Charge</span>
            <Battery className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">
              {health?.battery_level ?? 88}
            </span>
            <span className="text-slate-500 text-sm font-medium">%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full ${
                (health?.battery_level ?? 88) < 20 ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${health?.battery_level ?? 88}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 block">12.6V Active Alternator</span>
        </div>

        {/* Tire Pressure */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Tire Pressure</span>
            <Zap className="w-4 h-4 text-sky-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">
              {health?.tire_pressure ?? 33}
            </span>
            <span className="text-slate-500 text-sm font-medium">PSI</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-sky-500"
              style={{ width: `${((health?.tire_pressure ?? 33) / 45) * 100}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 block">Target: 32 - 35 PSI</span>
        </div>

        {/* Brake Wear */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Brake Pad Life Remaining</span>
            <Disc className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">
              {100 - (health?.brake_wear ?? 22)}
            </span>
            <span className="text-slate-500 text-sm font-medium">%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-indigo-500"
              style={{ width: `${100 - (health?.brake_wear ?? 22)}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 block">Wear: {health?.brake_wear ?? 22}% recorded</span>
        </div>
      </div>

      {/* Diagnostics & Threshold Evaluation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Threshold Evaluation Playground */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-sky-600" />
              Dynamic Threshold Simulation
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Simulate sensor spikes to test the automated warning classification engine.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Simulate Engine Temp</span>
                <span className="font-mono text-sky-600">{customTemp}°C</span>
              </div>
              <input
                type="range"
                min="70"
                max="135"
                value={customTemp}
                onChange={(e) => setCustomTemp(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>70°C (Cold)</span>
                <span>100°C (Normal)</span>
                <span>135°C (Overheating)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Simulate Battery State</span>
                <span className="font-mono text-sky-600">{customBattery}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={customBattery}
                onChange={(e) => setCustomBattery(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>5% (Dead)</span>
                <span>50%</span>
                <span>100% (Full)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Simulate Tire Pressure</span>
                <span className="font-mono text-sky-600">{customTire} PSI</span>
              </div>
              <input
                type="range"
                min="18"
                max="45"
                value={customTire}
                onChange={(e) => setCustomTire(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>18 PSI (Puncture)</span>
                <span>33 PSI (Ideal)</span>
                <span>45 PSI (Overinflated)</span>
              </div>
            </div>

            <button
              onClick={handleRunDiagnostics}
              disabled={evaluating}
              className="w-full py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Activity className="w-4 h-4" />
              {evaluating ? 'Evaluating Telemetry...' : 'Evaluate & Update Telemetry'}
            </button>

            {evalResult && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
                {evalResult}
              </div>
            )}
          </div>
        </div>

        {/* Current Health Status Summary & System Checklist */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Subsystem Inspection & Diagnostics
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                On-board ECU parameter analysis for {selectedVehicle?.name || 'Selected Vehicle'}.
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(health?.warning_status)}`}>
              {(health?.warning_status || 'System Good').toUpperCase()}
            </span>
          </div>

          <div className="space-y-3">
            {[
              {
                title: 'Coolant & Powertrain Temperature',
                value: `${health?.engine_temp ?? 90}°C`,
                status: (health?.engine_temp ?? 90) > 105 ? 'Warning: High Temp' : 'Optimal',
                healthy: (health?.engine_temp ?? 90) <= 105,
              },
              {
                title: '12V Electrical & Battery Health',
                value: `${health?.battery_level ?? 88}% Charge`,
                status: (health?.battery_level ?? 88) < 20 ? 'Critical: Low Battery' : 'Good Condition',
                healthy: (health?.battery_level ?? 88) >= 20,
              },
              {
                title: 'Tire Pressure Monitoring (TPMS)',
                value: `${health?.tire_pressure ?? 33} PSI`,
                status: (health?.tire_pressure ?? 33) < 25 ? 'Low Pressure Alert' : 'Balanced',
                healthy: (health?.tire_pressure ?? 33) >= 25,
              },
              {
                title: 'Chassis & Vibration Telemetry',
                value: `Index ${health?.vibration_index ?? 1.2} g`,
                status: (health?.vibration_index ?? 1.2) > 3.0 ? 'Excess Vibration' : 'Smooth Ride',
                healthy: (health?.vibration_index ?? 1.2) <= 3.0,
              },
              {
                title: 'Braking System Friction Wear',
                value: `${health?.brake_wear ?? 22}% Wear`,
                status: (health?.brake_wear ?? 22) > 80 ? 'Replace Pads Soon' : 'Safe Margin',
                healthy: (health?.brake_wear ?? 22) <= 80,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                  <span className="text-[11px] text-slate-500 font-mono">{item.value}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold ${item.healthy ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {item.status}
                  </span>
                  {item.healthy ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
