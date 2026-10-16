import React, { useState, useEffect } from 'react';
import { 
  Car, AlertTriangle, Radio, Zap, 
  Activity, CheckCircle2 
} from 'lucide-react';

export const RoadSafetyPreview: React.FC = () => {
  const [carProgress, setCarProgress] = useState(25);
  const [activeAlert, setActiveAlert] = useState<string | null>(null);
  const [v2vActive, setV2vActive] = useState(true);
  const [_radarAngle, setRadarAngle] = useState(0);

  // Animate vehicle movement and radar sweep
  useEffect(() => {
    const interval = setInterval(() => {
      setCarProgress((prev) => (prev >= 85 ? 15 : prev + 0.35));
      setRadarAngle((prev) => (prev + 3) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Trigger simulated warning when vehicle approaches pothole at ~55%
  useEffect(() => {
    if (carProgress > 45 && carProgress < 68) {
      if (v2vActive) {
        setActiveAlert('V2V Warning: Deep Pothole 180m Ahead – Speed Decreased');
      } else {
        setActiveAlert('Standard Blind Spot: Hazard Not Detected in Advance');
      }
    } else {
      setActiveAlert(null);
    }
  }, [carProgress, v2vActive]);

  return (
    <div className="relative bg-white rounded-3xl p-6 lg:p-8 shadow-xl shadow-slate-200/60 border border-slate-200/90 overflow-hidden">
      {/* Top Header & Simulation Disclaimer Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">V2V Hazard Detection Sandbox</h3>
            <p className="text-xs text-slate-500">Live multi-vehicle radar & telemetry broadcast</p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
          <span>Simulated Data Preview</span>
        </div>
      </div>

      {/* Roadway Canvas Representation */}
      <div className="relative mt-6 h-72 sm:h-80 w-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 rounded-2xl overflow-hidden p-4 shadow-inner flex flex-col justify-between">
        {/* Subtle grid and lane markings */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        
        {/* Road Surface */}
        <div className="absolute inset-y-12 inset-x-0 bg-slate-900/90 border-y-2 border-slate-700/60 flex flex-col justify-center">
          {/* Dashed center lane line */}
          <div className="w-full border-t-2 border-dashed border-amber-400/40 my-auto" />
        </div>

        {/* Top Status Bar Inside Screen */}
        <div className="relative z-10 flex items-center justify-between text-xs font-mono text-slate-300">
          <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>V2V LINK: 18ms</span>
            <span className="text-slate-500">|</span>
            <span>FREQ: 5.9 GHz DSRC</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700">
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            <span>RANGE: 1,000m</span>
          </div>
        </div>

        {/* Hazard Marker on Road */}
        <div 
          className="absolute z-10 flex flex-col items-center"
          style={{ left: '60%', top: '48%', transform: 'translate(-50%, -50%)' }}
        >
          <div className="relative group cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-rose-500/20 animate-ping absolute -inset-0" />
            <div className="w-9 h-9 rounded-xl bg-rose-600 border border-rose-300 text-white flex items-center justify-center shadow-lg shadow-rose-600/40">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <span className="mt-1 px-2 py-0.5 bg-slate-900/90 text-[10px] font-mono text-rose-300 rounded border border-rose-500/40 whitespace-nowrap">
            Deep Pothole #1
          </span>
        </div>

        {/* Moving Vehicle (Pulse Alpha) */}
        <div
          className="absolute z-20 flex flex-col items-center transition-all duration-75 ease-linear"
          style={{ left: `${carProgress}%`, top: '46%', transform: 'translate(-50%, -50%)' }}
        >
          {/* Forward Radar Cone Beam */}
          <div 
            className="absolute left-8 w-32 h-20 bg-gradient-to-r from-sky-400/25 to-transparent pointer-events-none rounded-r-full"
            style={{ clipPath: 'polygon(0% 40%, 100% 0%, 100% 100%, 0% 60%)' }}
          />

          <div className="relative p-2.5 rounded-xl bg-sky-500 text-white shadow-xl shadow-sky-500/50 border border-sky-300">
            <Car className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-teal-300 rounded-full border border-sky-600 animate-pulse" />
          </div>
          <span className="mt-1 px-2 py-0.5 bg-slate-900/90 text-[10px] font-mono text-sky-300 rounded border border-sky-500/40 whitespace-nowrap">
            Pulse Alpha (52 km/h)
          </span>
        </div>

        {/* Secondary Connected Vehicle (Pulse Beta) Ahead */}
        <div
          className="absolute z-20 flex flex-col items-center"
          style={{ left: '82%', top: '34%', transform: 'translate(-50%, -50%)' }}
        >
          <div className="p-2 rounded-lg bg-teal-600 text-white shadow-md border border-teal-300">
            <Car className="w-5 h-5" />
          </div>
          <span className="mt-1 px-1.5 py-0.5 bg-slate-900/90 text-[9px] font-mono text-teal-300 rounded border border-teal-500/40 whitespace-nowrap">
            Pulse Beta
          </span>
        </div>

        {/* Connecting V2V Wireless Transmission Beam */}
        {v2vActive && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-15">
            <line
              x1={`${carProgress}%`}
              y1="46%"
              x2="82%"
              y2="34%"
              stroke="#06b6d4"
              strokeWidth="2"
              strokeDasharray="6 4"
              className="animate-pulse"
            />
          </svg>
        )}

        {/* Bottom Alert Banner overlay */}
        <div className="relative z-10">
          {activeAlert ? (
            <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-lg transition-all ${
              v2vActive 
                ? 'bg-rose-500/95 text-white border border-rose-400' 
                : 'bg-amber-500/95 text-slate-900 border border-amber-300'
            }`}>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 animate-bounce" />
                <span>{activeAlert}</span>
              </div>
              <span className="px-2 py-0.5 bg-black/25 rounded text-[10px] font-mono">
                {v2vActive ? 'BRAKE ASSIST ON' : 'NO V2V'}
              </span>
            </div>
          ) : (
            <div className="p-2 rounded-xl bg-slate-800/80 backdrop-blur-md text-xs text-slate-400 flex items-center justify-between border border-slate-700">
              <span className="flex items-center gap-1.5 text-teal-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Sector Clear: Next hazard 420m</span>
              </span>
              <span className="font-mono text-[10px]">Scanning forward 1.2km</span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setV2vActive(!v2vActive)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              v2vActive
                ? 'bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100'
                : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${v2vActive ? 'text-sky-600 fill-sky-600' : ''}`} />
            <span>V2V Mesh: {v2vActive ? 'ENABLED' : 'DISABLED'}</span>
          </button>

          <button
            onClick={() => setCarProgress(30)}
            className="px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Replay Approach
          </button>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-slate-400 block font-medium">
            Calculated Deceleration Distance
          </span>
          <span className="text-xs font-bold font-mono text-slate-800">
            {v2vActive ? '180m Advance Notice (Safe Stop)' : '15m Panic Reaction'}
          </span>
        </div>
      </div>
    </div>
  );
};
