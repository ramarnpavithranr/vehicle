import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Radio, ArrowRight, CheckCircle2, Zap,
  ChevronRight, ArrowLeft, Activity, User, Car,
  MapPin, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useVehicle } from '../context/VehicleContext';
import { useAlert } from '../context/AlertContext';
import { audioAlerts } from '../services/audioAlerts';

export const GetStartedPage: React.FC = () => {
  const navigate = useNavigate();
  const { demoLogin } = useAuth();
  const { setSelectedVehicleId, vehicles } = useVehicle();
  const { } = useAlert();

  // Step 1: Driver Name Question
  // Step 2: Vehicle Number Plate Question
  // Step 3: City & Region Question
  // Step 4: Warning Distance & Preferences
  const [step, setStep] = useState<number>(1);

  // Step 1 — Driver name
  const [driverName, setDriverName] = useState('');

  // Step 2 — Vehicle number plate
  const [plateNumber, setPlateNumber] = useState('');

  // Step 3 — City / Region
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');

  // Step 4 — Warning distance
  const [warningDistance, setWarningDistance] = useState(500);

  // Launch animation
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchProgress, setLaunchProgress] = useState(0);
  const [launchSpeed, setLaunchSpeed] = useState(0);
  const [launchStatusIndex, setLaunchStatusIndex] = useState(0);

  const launchSteps = [
    'Ignition Sequence Engaged • 3-Vehicle Convoy Formed...',
    'Locking 5.9 GHz V2V Mesh Frequency at High Velocity...',
    'Synchronizing GPS Telemetry Vector Across All 3 Nodes...',
    'Inter-Vehicle Radar Link Active • Cruise Speed 180 km/h...',
    'Convoy Synchronized • Entering AutoPulse Dashboard!'
  ];

  const handleStartLaunchAnimation = async () => {
    await demoLogin('driver');
    if (vehicles.length > 0) setSelectedVehicleId(vehicles[0].id);
    setIsLaunching(true);
    setLaunchProgress(0);
    setLaunchSpeed(45);
    audioAlerts.playChime('success');
  };

  useEffect(() => {
    if (!isLaunching) return;
    const interval = setInterval(() => {
      setLaunchProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => navigate('/dashboard'), 350);
          return 100;
        }
        const next = Math.min(100, prev + 3.5);
        setLaunchSpeed(Math.round(45 + (next / 100) * 135));
        if (next < 25) setLaunchStatusIndex(0);
        else if (next < 50) setLaunchStatusIndex(1);
        else if (next < 75) setLaunchStatusIndex(2);
        else if (next < 95) setLaunchStatusIndex(3);
        else setLaunchStatusIndex(4);
        return next;
      });
    }, 32);
    return () => clearInterval(interval);
  }, [isLaunching, navigate]);

  const indiaRegions = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
    'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
    'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
    'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
    'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  const stepMeta = [
    { num: 1, title: "Driver's Name", icon: User },
    { num: 2, title: 'Vehicle Plate', icon: Car },
    { num: 3, title: 'City & Region', icon: MapPin },
    { num: 4, title: 'Ready', icon: Shield },
  ];

  return (
    <div className="min-h-screen text-slate-900 flex flex-col justify-between selection:bg-sky-500 selection:text-white font-sans relative overflow-x-hidden"
      style={{ background: 'linear-gradient(160deg, #f0f9ff 0%, #ffffff 40%, #f0fdf4 100%)' }}>

      {/* Decorative Background Accents */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-sky-400/12 to-teal-400/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-400/10 to-sky-400/8 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-sky-300/5 via-teal-300/5 to-indigo-300/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Glassmorphic Header */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-6 py-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-sky-500/25 group-hover:scale-105 transition-transform">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-900">
                  AutoPulse <span className="bg-gradient-to-r from-sky-600 to-teal-600 bg-clip-text text-transparent">AI</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-sky-100 text-sky-700 tracking-wider">
                  V2.4 Live
                </span>
              </div>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mt-0.5">
                Driver Onboarding
              </span>
            </div>
          </Link>

          <button
            onClick={handleStartLaunchAnimation}
            className="text-xs font-bold text-slate-600 hover:text-sky-600 transition-all flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-sky-300 cursor-pointer"
          >
            <span>Skip to Dashboard</span>
            <ChevronRight className="w-4 h-4 text-sky-500" />
          </button>
        </div>
      </header>

      {/* ── STEPS 1 TO 4: ONBOARDING QUESTIONS (WHITE DASHBOARD THEME) ── */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col justify-center relative z-10 animate-in fade-in duration-300">

          {/* Step Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-md mx-auto mb-4 relative">
              {/* Connecting line */}
              <div className="absolute top-5 left-10 right-10 h-0.5 bg-slate-200 -z-10" />
              <div
                className="absolute top-5 left-10 h-0.5 bg-gradient-to-r from-sky-500 to-teal-500 -z-10 transition-all duration-500"
                style={{ width: `calc(${((step - 1) / 3) * 100}% - 20px * ${((step - 1) / 3)})` }}
              />

              {stepMeta.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.num} className="flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      step === s.num
                        ? 'bg-gradient-to-tr from-sky-600 to-teal-500 text-white ring-4 ring-sky-500/20 shadow-lg shadow-sky-500/30 scale-110'
                        : step > s.num
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-white text-slate-400 border border-slate-200 shadow-sm'
                    }`}>
                      {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span className={`text-[10px] font-bold whitespace-nowrap ${step === s.num ? 'text-sky-600' : step > s.num ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {s.title}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-md mx-auto bg-slate-200 h-1.5 rounded-full overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
            <p className="text-center text-xs text-slate-400 mt-2 font-medium">Step {step} of 4</p>
          </div>

          {/* White Dashboard Style Questionnaire Card */}
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-200/60 relative overflow-hidden">
            {/* Top accent bar */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-sky-500 via-teal-400 to-emerald-400" />

            <div className="p-7 sm:p-10">

              {/* ── QUESTION 1: Driver Name ── */}
              {step === 1 && (
                <div className="space-y-7 animate-in fade-in slide-in-from-bottom-3 duration-300">
                  <div className="text-center space-y-2">
                    <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-sky-500/30 mb-4">
                      <User className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                      Step 1 of 4 • Identity
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pt-1">
                      What's your name, Driver?
                    </h2>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto">
                      We'll personalise your dashboard and V2V network identity with your name.
                    </p>
                  </div>

                  <div className="space-y-3 pt-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        id="driver-name-input"
                        type="text"
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && driverName.trim() && setStep(2)}
                        placeholder="e.g. Priya Sharma"
                        autoFocus
                        className="w-full pl-11 pr-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/70 text-slate-900 placeholder-slate-400 font-medium text-base focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-400 transition-all"
                      />
                    </div>

                    {driverName.trim() && (
                      <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold animate-in fade-in duration-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Hello, {driverName.trim()}! 👋
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      id="step1-continue"
                      onClick={() => setStep(2)}
                      disabled={!driverName.trim()}
                      className="flex items-center gap-2.5 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold px-7 py-3.5 rounded-2xl shadow-xl shadow-sky-600/25 transition-all text-sm active:scale-[0.98] cursor-pointer"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ── QUESTION 2: Vehicle Number Plate ── */}
              {step === 2 && (
                <div className="space-y-7 animate-in fade-in slide-in-from-bottom-3 duration-300">
                  <div className="text-center space-y-2">
                    <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-indigo-500 to-blue-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-500/30 mb-4">
                      <Car className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                      Step 2 of 4 • Vehicle
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pt-1">
                      Enter your Vehicle Number Plate
                    </h2>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto">
                      Your plate number links your vehicle to the V2V telemetry mesh and hazard broadcast network.
                    </p>
                  </div>

                  <div className="space-y-3 pt-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Number Plate
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-4 rounded bg-indigo-100 flex items-center justify-center">
                        <span className="text-[8px] font-black text-indigo-700">IND</span>
                      </div>
                      <input
                        id="plate-number-input"
                        type="text"
                        value={plateNumber}
                        onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === 'Enter' && plateNumber.trim() && setStep(3)}
                        placeholder="e.g. MH 12 AB 1234"
                        autoFocus
                        maxLength={13}
                        className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/70 text-slate-900 placeholder-slate-400 font-mono font-bold text-base tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
                      />
                    </div>

                    {plateNumber.trim().length >= 4 && (
                      <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold animate-in fade-in duration-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Vehicle plate registered: <span className="font-mono ml-1">{plateNumber}</span>
                      </div>
                    )}
                  </div>

                  {/* Real Indian Plate Preview */}
                  {plateNumber.trim() && (
                    <div className="flex justify-center animate-in fade-in zoom-in-95 duration-300">
                      <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl border-2 border-slate-800 bg-amber-50 shadow-md">
                        <div className="w-5 h-8 rounded-sm bg-blue-700 flex items-center justify-center">
                          <span className="text-white text-[7px] font-black rotate-[-90deg] block">IND</span>
                        </div>
                        <span className="font-black text-slate-900 font-mono text-xl tracking-widest">
                          {plateNumber}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between">
                    <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-xs font-bold px-3 py-2 cursor-pointer">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      id="step2-continue"
                      onClick={() => setStep(3)}
                      disabled={!plateNumber.trim() || plateNumber.trim().length < 4}
                      className="flex items-center gap-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold px-7 py-3.5 rounded-2xl shadow-xl shadow-indigo-600/25 transition-all text-sm active:scale-[0.98] cursor-pointer"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ── QUESTION 3: City & Region ── */}
              {step === 3 && (
                <div className="space-y-7 animate-in fade-in slide-in-from-bottom-3 duration-300">
                  <div className="text-center space-y-2">
                    <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-teal-500 to-emerald-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-teal-500/30 mb-4">
                      <MapPin className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                      Step 3 of 4 • Location
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pt-1">
                      Where are you driving?
                    </h2>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto">
                      Your city and state help us load local hazard maps and regional V2V mesh nodes.
                    </p>
                  </div>

                  <div className="space-y-4 pt-1">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        City / Area
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          id="city-input"
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. Mumbai, Bengaluru, Pune..."
                          autoFocus
                          className="w-full pl-11 pr-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/70 text-slate-900 placeholder-slate-400 font-medium text-base focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-400 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        State / Region
                      </label>
                      <select
                        id="region-select"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/70 text-slate-900 font-medium text-base focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-400 transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Select your state…</option>
                        {indiaRegions.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    {city.trim() && region && (
                      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold animate-in fade-in duration-200">
                        <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                        <span>Hazard map loading for <strong>{city.trim()}, {region}</strong></span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button onClick={() => setStep(2)} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-xs font-bold px-3 py-2 cursor-pointer">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      id="step3-continue"
                      onClick={() => setStep(4)}
                      disabled={!city.trim() || !region}
                      className="flex items-center gap-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold px-7 py-3.5 rounded-2xl shadow-xl shadow-teal-600/25 transition-all text-sm active:scale-[0.98] cursor-pointer"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ── QUESTION 4: Warning Distance + Launch ── */}
              {step === 4 && (
                <div className="space-y-7 animate-in fade-in slide-in-from-bottom-3 duration-300">
                  <div className="text-center space-y-2">
                    <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-amber-500/30 mb-4">
                      <Shield className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                      Step 4 of 4 • Alert Preference
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pt-1">
                      Set Your Warning Distance
                    </h2>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto">
                      How far ahead should AutoPulse warn you about road hazards?
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-slate-50 to-sky-50/50 rounded-2xl border border-slate-200 p-6 space-y-5">
                    {/* Distance value display */}
                    <div className="text-center">
                      <div className="text-5xl font-black font-mono text-sky-600 tabular-nums">
                        {warningDistance}
                        <span className="text-xl font-bold text-sky-400 ml-1">m</span>
                      </div>
                      <div className="text-xs text-slate-500 font-medium mt-1">
                        {warningDistance <= 200 ? '🏙️ City Street Mode' :
                          warningDistance <= 600 ? '🛣️ Standard Road Mode' :
                          '🛤️ Highway Corridor Mode'}
                      </div>
                    </div>

                    <input
                      id="warning-distance-slider"
                      type="range"
                      min="100"
                      max="1000"
                      step="50"
                      value={warningDistance}
                      onChange={(e) => setWarningDistance(Number(e.target.value))}
                      className="w-full accent-sky-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-medium -mt-2">
                      <span>100m</span>
                      <span>500m (Recommended)</span>
                      <span>1000m</span>
                    </div>

                    {/* Quick presets */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      {[{ label: '🏙️ City', val: 200 }, { label: '🛣️ Standard', val: 500 }, { label: '🛤️ Highway', val: 900 }].map((p) => (
                        <button
                          key={p.val}
                          onClick={() => setWarningDistance(p.val)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            warningDistance === p.val
                              ? 'bg-sky-600 text-white border-sky-600 shadow-md'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300 hover:text-sky-700'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Driver', value: driverName || 'Not set' },
                      { label: 'Plate', value: plateNumber || 'Not set', mono: true },
                      { label: 'Location', value: city && region ? `${city}, ${region}` : 'Not set' },
                      { label: 'Alert Range', value: `${warningDistance}m` },
                    ].map((item) => (
                      <div key={item.label} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">{item.label}</span>
                        <span className={`font-extrabold text-slate-900 truncate block ${item.mono ? 'font-mono tracking-wider' : ''}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button onClick={() => setStep(3)} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-xs font-bold px-3 py-2 cursor-pointer">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      id="launch-dashboard"
                      onClick={handleStartLaunchAnimation}
                      className="flex items-center gap-3 bg-gradient-to-r from-sky-600 via-sky-600 to-teal-500 hover:from-sky-700 hover:to-teal-700 text-white font-black px-8 py-4 rounded-2xl shadow-2xl shadow-sky-600/35 hover:shadow-sky-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm cursor-pointer"
                    >
                      <Zap className="w-5 h-5" />
                      <span>Launch AutoPulse Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 px-6 text-center text-xs text-slate-500">
        AutoPulse AI • Connected Vehicle Telemetry &amp; Intelligent Road Safety Platform
      </footer>

      {/* ── CINEMATIC LAUNCH ANIMATION ── */}
      {isLaunching && (
        <div className="fixed inset-0 z-50 bg-white/96 backdrop-blur-3xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-300 select-none overflow-hidden">
          <div className="space-y-1 mb-6 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold shadow-sm">
              <Activity className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
              <span>HIGH-SPEED 3-CAR CONVOY MESH FORMATION</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              ENTERING AUTOPULSE DASHBOARD
            </h2>
            <p className="text-slate-500 text-xs font-mono">
              Convoy Speed: <strong className="text-sky-600 font-extrabold text-sm">{launchSpeed} km/h</strong> • V2V Inter-Vehicle Laser Link Active
            </p>
          </div>

          {/* Three cars */}
          <div className="relative w-full max-w-5xl h-52 overflow-hidden my-4 select-none">
            <div className="absolute inset-0 flex flex-col justify-around pointer-events-none opacity-40">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-sky-300 to-transparent animate-pulse" />
              <div className="w-full h-px bg-gradient-to-r from-transparent via-teal-300 to-transparent animate-pulse" />
              <div className="w-full h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent animate-pulse" />
            </div>

            {/* Car 1 */}
            <div className="absolute top-3 transition-all duration-75 flex items-center drop-shadow-md"
              style={{ left: `calc(-210px + (100% + 330px) * ${launchProgress / 100})` }}>
              <div className="relative flex items-center">
                <div className="absolute -left-10 flex flex-col gap-1 opacity-80">
                  <div className="w-8 h-1 bg-gradient-to-l from-sky-500 to-transparent rounded-full animate-pulse" />
                  <div className="w-12 h-1 bg-gradient-to-l from-cyan-400 to-transparent rounded-full animate-pulse" />
                </div>
                <svg width="88" height="38" viewBox="0 0 86 38" fill="none">
                  <path d="M 6 24 C 6 20, 10 16, 16 16 L 28 14 C 32 8, 40 4, 52 4 L 66 12 L 78 16 C 82 17, 85 20, 85 24 L 85 28 C 85 30, 83 31, 81 31 L 74 31 C 72 26, 64 26, 62 31 L 28 31 C 26 26, 18 26, 16 31 L 9 31 C 7 31, 6 29, 6 27 Z" fill="url(#c1g)" />
                  <path d="M 33 14 L 51 6 L 63 13 L 53 14 Z" fill="#0f172a" opacity="0.85" />
                  <circle cx="83" cy="20" r="3" fill="#fef08a" />
                  <polygon points="85,18 125,8 125,32 85,22" fill="url(#bg1)" opacity="0.75" />
                  <rect x="5" y="19" width="3" height="5" rx="1.5" fill="#ef4444" />
                  <circle cx="68" cy="30" r="7" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
                  <circle cx="22" cy="30" r="7" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
                  <defs>
                    <linearGradient id="c1g" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#0284c7" /><stop offset="100%" stopColor="#38bdf8" /></linearGradient>
                    <linearGradient id="bg1" x1="0%" y1="50%" x2="100%" y2="50%"><stop offset="0%" stopColor="#fef08a" stopOpacity="0.85" /><stop offset="100%" stopColor="#fef08a" stopOpacity="0" /></linearGradient>
                  </defs>
                </svg>
                <span className="absolute -bottom-4 left-2 text-[9px] font-mono font-extrabold text-sky-700 bg-sky-100/90 border border-sky-300 px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                  Pulse Alpha • 190 km/h
                </span>
              </div>
            </div>

            {/* Car 2 — lead with V2V beacon */}
            <div className="absolute top-20 transition-all duration-75 flex items-center drop-shadow-lg"
              style={{ left: `calc(-160px + (100% + 330px) * ${launchProgress / 100})` }}>
              <div className="absolute -top-4 left-9 flex items-center justify-center">
                <div className="w-9 h-9 rounded-full bg-teal-400/50 animate-ping absolute" />
                <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-md">
                  <Radio className="w-3 h-3" />
                </div>
              </div>
              <div className="relative flex items-center">
                <div className="absolute -left-12 flex flex-col gap-1 opacity-90">
                  <div className="w-10 h-1 bg-gradient-to-l from-teal-500 to-transparent rounded-full animate-pulse" />
                  <div className="w-14 h-1 bg-gradient-to-l from-emerald-400 to-transparent rounded-full animate-pulse" />
                </div>
                <svg width="96" height="42" viewBox="0 0 86 38" fill="none">
                  <path d="M 6 24 C 6 20, 10 16, 16 16 L 28 14 C 32 8, 40 4, 52 4 L 66 12 L 78 16 C 82 17, 85 20, 85 24 L 85 28 C 85 30, 83 31, 81 31 L 74 31 C 72 26, 64 26, 62 31 L 28 31 C 26 26, 18 26, 16 31 L 9 31 C 7 31, 6 29, 6 27 Z" fill="url(#c2g)" />
                  <path d="M 33 14 L 51 6 L 63 13 L 53 14 Z" fill="#0f172a" opacity="0.85" />
                  <circle cx="83" cy="20" r="3" fill="#fef08a" />
                  <polygon points="85,18 130,6 130,34 85,22" fill="url(#bg1)" opacity="0.8" />
                  <rect x="5" y="19" width="3" height="5" rx="1.5" fill="#ef4444" />
                  <circle cx="68" cy="30" r="7.5" fill="#0f172a" stroke="#14b8a6" strokeWidth="2.5" />
                  <circle cx="22" cy="30" r="7.5" fill="#0f172a" stroke="#14b8a6" strokeWidth="2.5" />
                  <defs>
                    <linearGradient id="c2g" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#0d9488" /><stop offset="60%" stopColor="#14b8a6" /><stop offset="100%" stopColor="#10b981" /></linearGradient>
                  </defs>
                </svg>
                <span className="absolute -bottom-4 left-2 text-[9px] font-mono font-extrabold text-teal-800 bg-teal-100/90 border border-teal-300 px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                  Pulse Beta (Lead) • V2V Active
                </span>
              </div>
            </div>

            {/* Car 3 */}
            <div className="absolute top-40 transition-all duration-75 flex items-center drop-shadow-md"
              style={{ left: `calc(-260px + (100% + 330px) * ${launchProgress / 100})` }}>
              <div className="relative flex items-center">
                <div className="absolute -left-10 flex flex-col gap-1 opacity-80">
                  <div className="w-8 h-1 bg-gradient-to-l from-amber-500 to-transparent rounded-full animate-pulse" />
                  <div className="w-12 h-1 bg-gradient-to-l from-orange-400 to-transparent rounded-full animate-pulse" />
                </div>
                <svg width="88" height="38" viewBox="0 0 86 38" fill="none">
                  <path d="M 6 24 C 6 20, 10 16, 16 16 L 28 14 C 32 8, 40 4, 52 4 L 66 12 L 78 16 C 82 17, 85 20, 85 24 L 85 28 C 85 30, 83 31, 81 31 L 74 31 C 72 26, 64 26, 62 31 L 28 31 C 26 26, 18 26, 16 31 L 9 31 C 7 31, 6 29, 6 27 Z" fill="url(#c3g)" />
                  <path d="M 33 14 L 51 6 L 63 13 L 53 14 Z" fill="#0f172a" opacity="0.85" />
                  <circle cx="83" cy="20" r="3" fill="#fef08a" />
                  <polygon points="85,18 125,8 125,32 85,22" fill="url(#bg1)" opacity="0.75" />
                  <rect x="5" y="19" width="3" height="5" rx="1.5" fill="#ef4444" />
                  <circle cx="68" cy="30" r="7" fill="#0f172a" stroke="#f59e0b" strokeWidth="2.5" />
                  <circle cx="22" cy="30" r="7" fill="#0f172a" stroke="#f59e0b" strokeWidth="2.5" />
                  <defs>
                    <linearGradient id="c3g" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#f97316" /></linearGradient>
                  </defs>
                </svg>
                <span className="absolute -bottom-4 left-2 text-[9px] font-mono font-extrabold text-amber-800 bg-amber-100/90 border border-amber-300 px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                  Pulse Gamma • Telemetry Mesh
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-md bg-slate-100 border border-slate-200 h-3 rounded-full overflow-hidden shadow-inner p-0.5 mt-5">
            <div
              className="bg-gradient-to-r from-sky-600 via-teal-500 to-emerald-500 h-full rounded-full transition-all duration-75 shadow-md"
              style={{ width: `${launchProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between w-full max-w-md text-xs font-mono text-slate-500 mt-3 px-1">
            <span className="text-slate-700 font-bold">{launchSteps[launchStatusIndex]}</span>
            <span className="text-sky-600 font-black text-base">{Math.round(launchProgress)}%</span>
          </div>
        </div>
      )}
    </div>
  );
};
