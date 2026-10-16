import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, Play, Pause, RotateCcw, Sliders, Car, 
  Radio, CheckCircle2, 
  Volume2, VolumeX, Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import type { SimulationState } from '../types';
import { audioAlerts } from '../services/audioAlerts';

export const SimulationPage: React.FC = () => {
  const [simState, setSimState] = useState<SimulationState | null>(null);
  const [_loading, setLoading] = useState(true);
  const [stepping, setStepping] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2>(1);
  const [audioFeedback, setAudioFeedback] = useState(true);
  
  // Simulation configuration parameters
  const [trafficVolume, setTrafficVolume] = useState('Medium');
  const [avgSpeed, setAvgSpeed] = useState(60);
  const [alertRadius, setAlertRadius] = useState(500);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [configSuccess, setConfigSuccess] = useState<string | null>(null);
  
  // Interactive view selection
  const [viewMode, setViewMode] = useState<'visual' | 'cards'>('visual');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const autoRunTimerRef = useRef<number | null>(null);

  const fetchSimulationState = async () => {
    try {
      setLoading(true);
      const res = await api.getSimulationState();
      setSimState(res.state);
      setTrafficVolume(
        res.state.traffic_volume 
          ? res.state.traffic_volume.charAt(0).toUpperCase() + res.state.traffic_volume.slice(1).toLowerCase() 
          : 'Medium'
      );
      setAvgSpeed(res.state.average_speed_kmh || 60);
      setAlertRadius(res.state.alert_radius_meters || 500);
      setAlertsEnabled(res.state.alerts_enabled ?? true);
    } catch (err) {
      console.error('Failed to load simulation state', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimulationState();
  }, []);

  // Step simulation logic
  const handleStep = async (silent: boolean = false) => {
    try {
      if (!silent) setStepping(true);
      const res = await api.stepSimulation();
      setSimState(res.state);

      // Play audio chime if new alerts occurred during auto-run
      if (audioFeedback && res.state.metrics.vehicles_alerted > 0 && Math.random() > 0.6) {
        audioAlerts.playChime('warning');
      }
    } catch (err) {
      console.error('Failed to step simulation', err);
      setIsRunning(false);
    } finally {
      if (!silent) setStepping(false);
    }
  };

  // Continuous auto-run loop
  useEffect(() => {
    if (isRunning) {
      const intervalMs = playbackSpeed === 2 ? 800 : 1500;
      autoRunTimerRef.current = window.setInterval(() => {
        handleStep(true);
      }, intervalMs);
    } else {
      if (autoRunTimerRef.current) {
        clearInterval(autoRunTimerRef.current);
        autoRunTimerRef.current = null;
      }
    }

    return () => {
      if (autoRunTimerRef.current) {
        clearInterval(autoRunTimerRef.current);
      }
    };
  }, [isRunning, playbackSpeed, audioFeedback]);

  const toggleAutoRun = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = async () => {
    setIsRunning(false);
    try {
      await api.resetSimulation();
      fetchSimulationState();
    } catch (err) {
      console.error('Failed to reset simulation', err);
    }
  };

  const handleConfigure = async () => {
    try {
      await api.configureSimulation({
        traffic_volume: trafficVolume.toLowerCase(),
        average_speed: avgSpeed,
        alert_radius_meters: alertRadius,
        alerts_enabled: alertsEnabled,
      });
      setConfigSuccess('Simulation parameters updated & applied successfully!');
      setTimeout(() => setConfigSuccess(null), 3000);
      fetchSimulationState();
    } catch (err) {
      console.error('Failed to configure simulation', err);
    }
  };

  const metrics = simState?.metrics;
  const centerLat = 12.9716;
  const centerLng = 77.5946;

  // Map lat/lng coordinates to SVG arena coordinates (viewBox 0 0 600 450)
  const getCoordinatesInArena = (lat: number, lng: number) => {
    const scale = 16000; // coordinate projection multiplier
    const cx = 300 + (lng - centerLng) * scale;
    const cy = 225 - (lat - centerLat) * scale;
    return {
      x: Math.max(25, Math.min(575, cx)),
      y: Math.max(25, Math.min(425, cy))
    };
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-sky-600" />
            Connected Vehicle Traffic Simulation Lab
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Simulate V2V hazard propagation, virtual node traffic, and measure accident risk reduction metrics.
          </p>
        </div>

        {/* Action Buttons: Auto-Run, Step, Reset */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Continuous Auto-Run Button */}
          <button
            onClick={toggleAutoRun}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl shadow-md transition-all active:scale-[0.98] ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isRunning ? 'Pause Auto-Run' : 'Start Live Auto-Run'}</span>
          </button>

          {/* Single Step Button */}
          <button
            onClick={() => handleStep(false)}
            disabled={stepping || isRunning}
            className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold px-4 py-2 text-xs rounded-xl shadow-md transition-all active:scale-[0.99]"
          >
            <Play className={`w-3.5 h-3.5 ${stepping ? 'animate-spin' : ''}`} />
            <span>{stepping ? 'Stepping...' : 'Step Traffic'}</span>
          </button>

          {/* Reset State Button */}
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl shadow-sm transition-all"
            title="Reset Simulation Sandbox"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Nodes</span>
          <span className="text-2xl font-extrabold text-slate-900 font-mono mt-1 block">
            {metrics?.total_vehicles ?? 12}
          </span>
          <span className="text-[10px] text-slate-400">Virtual vehicles</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Vehicles Alerted</span>
          <span className="text-2xl font-extrabold text-emerald-600 font-mono mt-1 block">
            {metrics?.vehicles_alerted ?? 0}
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold">Protected in radius</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Warning Distance</span>
          <span className="text-2xl font-extrabold text-sky-600 font-mono mt-1 block">
            {Math.round(metrics?.avg_warning_distance_meters ?? 280)}m
          </span>
          <span className="text-[10px] text-slate-400">Average buffer</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Response Time</span>
          <span className="text-2xl font-extrabold text-indigo-600 font-mono mt-1 block">
            {metrics?.avg_response_time_seconds ?? 0.8}s
          </span>
          <span className="text-[10px] text-slate-400">V2V latency</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Risk Reduction</span>
          <span className="text-2xl font-extrabold text-teal-600 font-mono mt-1 block">
            {Math.round(metrics?.simulated_risk_reduction_pct ?? 74)}%
          </span>
          <span className="text-[10px] text-teal-600 font-semibold">Collision reduction</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Packets Sent</span>
          <span className="text-2xl font-extrabold text-purple-600 font-mono mt-1 block">
            {metrics?.alerts_dispatched_count ?? 0}
          </span>
          <span className="text-[10px] text-slate-400">Total broadcasts</span>
        </div>
      </div>

      {/* Main Grid: Controls on Left, Visual Simulation Sandbox on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Simulation Controls & Parameter Adjustments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-sky-600" />
              Environment Parameters
            </h2>
            <button
              onClick={() => setAudioFeedback(!audioFeedback)}
              className={`p-1.5 rounded-lg border text-xs ${
                audioFeedback 
                  ? 'bg-sky-50 text-sky-700 border-sky-200' 
                  : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}
              title={audioFeedback ? 'Sound chimes active' : 'Sound chimes muted'}
            >
              {audioFeedback ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>

          {configSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {configSuccess}
            </div>
          )}

          <div className="space-y-4">
            {/* Traffic Volume Pills */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Traffic Density Volume</label>
              <div className="grid grid-cols-3 gap-2">
                {['Low', 'Medium', 'High'].map((vol) => (
                  <button
                    key={vol}
                    type="button"
                    onClick={() => setTrafficVolume(vol)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      trafficVolume.toLowerCase() === vol.toLowerCase()
                        ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {vol}
                  </button>
                ))}
              </div>
            </div>

            {/* Average Traffic Speed Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Average Traffic Speed</span>
                <span className="font-mono text-sky-600 font-bold">{avgSpeed} km/h</span>
              </div>
              <input
                type="range"
                min="30"
                max="120"
                step="5"
                value={avgSpeed}
                onChange={(e) => setAvgSpeed(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>30 km/h (Slow)</span>
                <span>60 km/h</span>
                <span>120 km/h (Highway)</span>
              </div>
            </div>

            {/* V2V Warning Radius Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>V2V Warning Radius</span>
                <span className="font-mono text-sky-600 font-bold">{alertRadius}m</span>
              </div>
              <input
                type="range"
                min="100"
                max="1200"
                step="50"
                value={alertRadius}
                onChange={(e) => setAlertRadius(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>100m (Close)</span>
                <span>500m</span>
                <span>1200m (Long Range)</span>
              </div>
            </div>

            {/* Auto-Run Speed Control */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Simulation Clock Speed</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPlaybackSpeed(1)}
                  className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    playbackSpeed === 1 
                      ? 'bg-slate-800 text-white border-slate-800' 
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  1x Normal Speed
                </button>
                <button
                  type="button"
                  onClick={() => setPlaybackSpeed(2)}
                  className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    playbackSpeed === 2 
                      ? 'bg-slate-800 text-white border-slate-800' 
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  2x Turbo Speed
                </button>
              </div>
            </div>

            {/* V2V Warning Broadcast Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-800 block">V2V Warning Broadcasts</span>
                <span className="text-[10px] text-slate-500">Decelerates vehicles within radius</span>
              </div>
              <input
                type="checkbox"
                checked={alertsEnabled}
                onChange={(e) => setAlertsEnabled(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500 cursor-pointer"
              />
            </div>

            {/* Apply Button */}
            <button
              onClick={handleConfigure}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-sky-400" />
              Apply Simulation Settings
            </button>
          </div>
        </div>

        {/* Right 2 Columns: LIVE ANIMATED SIMULATION ARENA */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Radio className="w-5 h-5 text-sky-600 animate-pulse" />
                  Live Animated Traffic Corridor Arena
                </h2>
                {isRunning && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 animate-pulse">
                    Live Continuous Auto-Run
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Dynamic 2D corridor visualizer showing real-time vehicle vectors, hazard broadcast zones, and alerts.
              </p>
            </div>

            {/* View Switcher: Interactive Visual Sandbox vs Telemetry Cards */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('visual')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'visual'
                    ? 'bg-white text-sky-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Visual Arena
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'cards'
                    ? 'bg-white text-sky-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Node Grid
              </button>
            </div>
          </div>

          {/* VIEW 1: LIVE INTERACTIVE VISUAL ARENA (SVG 2D RADAR & ROADWAYS) */}
          {viewMode === 'visual' && (
            <div className="space-y-3">
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-inner select-none">
                <svg
                  viewBox="0 0 600 450"
                  className="w-full h-full"
                >
                  <defs>
                    {/* Road Grid Pattern */}
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
                    </pattern>

                    {/* Radial Radar Gradient */}
                    <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                      <stop offset="60%" stopColor="#0284c7" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
                    </radialGradient>

                    {/* Hazard Warning Wave Gradient */}
                    <radialGradient id="hazard-wave" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.35" />
                      <stop offset="70%" stopColor="#ef4444" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Background grid */}
                  <rect width="600" height="450" fill="#090d16" />
                  <rect width="600" height="450" fill="url(#grid)" />

                  {/* Concentric Radar Distance Rings */}
                  <circle cx="300" cy="225" r="70" fill="none" stroke="rgba(14, 165, 233, 0.2)" strokeWidth="1" strokeDasharray="3 3" />
                  <circle cx="300" cy="225" r="140" fill="none" stroke="rgba(14, 165, 233, 0.25)" strokeWidth="1" strokeDasharray="4 4" />
                  <circle cx="300" cy="225" r="210" fill="none" stroke="rgba(14, 165, 233, 0.15)" strokeWidth="1" strokeDasharray="5 5" />
                  <circle cx="300" cy="225" r="210" fill="url(#radar-glow)" />

                  {/* Road Corridors (Cross Intersection Layout) */}
                  {/* Horizontal Highway */}
                  <rect x="0" y="195" width="600" height="60" fill="rgba(30, 41, 59, 0.6)" />
                  <line x1="0" y1="225" x2="600" y2="225" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.6" />
                  <line x1="0" y1="195" x2="600" y2="195" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  <line x1="0" y1="255" x2="600" y2="255" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

                  {/* Vertical Highway */}
                  <rect x="270" y="0" width="60" height="450" fill="rgba(30, 41, 59, 0.6)" />
                  <line x1="300" y1="0" x2="300" y2="450" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.6" />
                  <line x1="270" y1="0" x2="270" y2="450" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  <line x1="330" y1="0" x2="330" y2="450" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

                  {/* Radar Sweep Beams */}
                  <g className="origin-center" style={{ transformOrigin: '300px 225px' }}>
                    <line x1="300" y1="225" x2="510" y2="225" stroke="#38bdf8" strokeWidth="1.5" opacity="0.4" />
                  </g>

                  {/* Simulated Hazards & Their Broadcast Warning Waves */}
                  {simState?.simulated_hazards?.map((h, idx) => {
                    const pos = getCoordinatesInArena(h.lat, h.lng);
                    const waveRadius = Math.min(180, (alertRadius / 1000) * 150);
                    return (
                      <g key={h.id || idx}>
                        {/* Dynamic Warning Wave Halo */}
                        {alertsEnabled && (
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r={waveRadius}
                            fill="url(#hazard-wave)"
                            stroke="rgba(239, 68, 68, 0.4)"
                            strokeWidth="1.5"
                            strokeDasharray="4 3"
                            className="animate-pulse"
                          />
                        )}

                        {/* Hazard Icon Point */}
                        <circle cx={pos.x} cy={pos.y} r="10" fill="#ef4444" opacity="0.9" />
                        <circle cx={pos.x} cy={pos.y} r="16" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.6" className="animate-ping" />
                        <text
                          x={pos.x}
                          y={pos.y + 3}
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          ⚠
                        </text>

                        {/* Hazard Label */}
                        <text
                          x={pos.x}
                          y={pos.y - 14}
                          fill="#f87171"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {h.label || h.type}
                        </text>
                      </g>
                    );
                  })}

                  {/* Virtual Vehicles Dynamic Vector Nodes */}
                  {simState?.virtual_vehicles?.map((v) => {
                    const pos = getCoordinatesInArena(v.lat, v.lng);
                    const isSelected = selectedNodeId === v.id;
                    const isAlerted = v.alerted;

                    return (
                      <g
                        key={v.id}
                        onClick={() => setSelectedNodeId(v.id === selectedNodeId ? null : v.id)}
                        className="cursor-pointer transition-all duration-300"
                        style={{ cursor: 'pointer' }}
                      >
                        {/* Halo on alert */}
                        {isAlerted && (
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r="18"
                            fill="rgba(239, 68, 68, 0.3)"
                            stroke="#ef4444"
                            strokeWidth="1.5"
                            className="animate-pulse"
                          />
                        )}

                        {/* Vehicle Pod Body */}
                        <rect
                          x={pos.x - 12}
                          y={pos.y - 8}
                          width="24"
                          height="16"
                          rx="4"
                          fill={isAlerted ? '#ef4444' : isSelected ? '#38bdf8' : '#0284c7'}
                          stroke={isSelected ? '#ffffff' : isAlerted ? '#fca5a5' : '#7dd3fc'}
                          strokeWidth={isSelected ? '2' : '1'}
                          transform={`rotate(${v.heading || 0}, ${pos.x}, ${pos.y})`}
                        />

                        {/* Vehicle Headlights Vector */}
                        <circle
                          cx={pos.x + 10}
                          cy={pos.y}
                          r="2.5"
                          fill="#fef08a"
                          transform={`rotate(${v.heading || 0}, ${pos.x}, ${pos.y})`}
                        />

                        {/* Vehicle Tag Label */}
                        <text
                          x={pos.x}
                          y={pos.y + 18}
                          fill={isAlerted ? '#fca5a5' : '#cbd5e1'}
                          fontSize="8.5"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {v.name.replace('Virtual Vehicle ', 'V')} ({Math.round(v.speed)}k)
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Floating Arena Overlay Legend */}
                <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 text-[10px] text-slate-300 flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
                    <span>Cruising Vehicle</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block animate-pulse" />
                    <span>Alerted / Decelerating</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-rose-400 font-bold">⚠</span>
                    <span>Road Hazard Beacon</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span>Radius: {alertRadius}m</span>
                  </div>
                </div>

                {/* Step Counter Indicator */}
                <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono font-bold text-white flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`} />
                  Step: {simState?.step_count ?? 0}
                </div>
              </div>

              {/* Selected Node Telemetry Callout */}
              {selectedNodeId && (() => {
                const node = simState?.virtual_vehicles?.find(x => x.id === selectedNodeId);
                if (!node) return null;
                return (
                  <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sky-900">{node.name} Selected</span>
                      <p className="text-sky-700 text-[11px] mt-0.5 font-mono">
                        Speed: {Math.round(node.speed)} km/h • Heading: {Math.round(node.heading)}° • Status: {node.status}
                      </p>
                    </div>
                    {node.alerted && (
                      <span className="font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-lg">
                        Hazard Warning: {Math.round(node.warning_distance)}m Ahead
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* VIEW 2: DETAILED NODE TELEMETRY GRID */}
          {viewMode === 'cards' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
                {simState?.virtual_vehicles?.map((vv) => (
                  <div
                    key={vv.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      vv.alerted
                        ? 'border-rose-300 bg-rose-50/70 shadow-xs'
                        : 'border-slate-200/80 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          vv.alerted ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-200 text-slate-700'
                        }`}>
                          <Car className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-800">{vv.name}</h4>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {vv.lat.toFixed(4)}, {vv.lng.toFixed(4)}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        vv.alerted ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {vv.alerted ? 'Alerted' : 'Normal'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-600 mt-2.5 pt-2 border-t border-slate-100/80">
                      <span>Speed: <strong className="font-mono text-slate-800">{Math.round(vv.speed)} km/h</strong></span>
                      <span>Heading: <strong className="font-mono text-slate-800">{Math.round(vv.heading)}°</strong></span>
                      {vv.alerted && (
                        <span className="text-rose-600 font-bold">
                          Warning: {Math.round(vv.warning_distance)}m
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
