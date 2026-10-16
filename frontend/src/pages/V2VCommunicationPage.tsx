import React, { useState } from 'react';
import { 
  Wifi, Radio, Volume2, VolumeX, ShieldAlert, 
  Send, Car
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { useVehicle } from '../context/VehicleContext';
import { audioAlerts } from '../services/audioAlerts';

export const V2VCommunicationPage: React.FC = () => {
  const { 
    activeAlerts, connectionStatus, isMuted, 
    toggleMute, dismissAlert, broadcastTestAlert 
  } = useAlert();
  const { vehicles, selectedVehicle } = useVehicle();

  const [testHazardType, setTestHazardType] = useState('pothole');
  const [testDistance, setTestDistance] = useState(250);
  const [testSeverity, setTestSeverity] = useState('high');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const handleSendTestAlert = () => {
    setIsBroadcasting(true);
    broadcastTestAlert(testHazardType, testDistance);
    setTimeout(() => {
      setIsBroadcasting(false);
    }, 600);
  };

  const handleTestAudio = (type: 'warning' | 'critical' | 'success') => {
    audioAlerts.playChime(type);
  };

  const handleTestVoice = () => {
    audioAlerts.announceHazard(testHazardType, testDistance);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Wifi className="w-6 h-6 text-sky-600" />
            Vehicle-to-Vehicle (V2V) Communication Hub
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time low-latency telemetry mesh network and multi-vehicle emergency advisory dispatcher.
          </p>
        </div>

        {/* Live Channel Status Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border bg-white shadow-sm text-xs font-semibold">
            <span className={`w-2.5 h-2.5 rounded-full ${
              connectionStatus === 'connected' 
                ? 'bg-emerald-500 animate-pulse' 
                : connectionStatus === 'reconnecting' 
                ? 'bg-amber-500 animate-ping' 
                : 'bg-rose-500'
            }`} />
            <span className="capitalize text-slate-700">
              Mesh Link: {connectionStatus}
            </span>
          </div>

          <button
            onClick={toggleMute}
            className={`p-2 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-semibold ${
              isMuted 
                ? 'bg-rose-50 border-rose-200 text-rose-700' 
                : 'bg-sky-50 border-sky-200 text-sky-700'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            {isMuted ? 'Muted' : 'Audio Active'}
          </button>
        </div>
      </div>

      {/* Grid of Key Features */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Broadcast Simulator Console */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Radio className="w-5 h-5 text-sky-600" />
              Dispatch V2V Advisory Alert
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Broadcast an emergency packet to nearby connected vehicles within range.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Hazard Type</label>
              <select
                value={testHazardType}
                onChange={(e) => setTestHazardType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500"
              >
                <option value="pothole">Deep Pothole</option>
                <option value="accident">Accident Ahead</option>
                <option value="roadwork">Active Roadwork</option>
                <option value="debris">Debris on Road</option>
                <option value="slick_road">Slick / Wet Road Surface</option>
                <option value="stalled_vehicle">Stalled Vehicle in Lane</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Warning Distance</span>
                <span className="text-sky-600 font-mono">{testDistance} meters</span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="50"
                value={testDistance}
                onChange={(e) => setTestDistance(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>50m (Immediate)</span>
                <span>500m</span>
                <span>1000m (Long-range)</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Severity Level</label>
              <div className="grid grid-cols-3 gap-2">
                {(['medium', 'high', 'critical'] as const).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setTestSeverity(sev)}
                    className={`py-1.5 rounded-xl text-xs font-bold capitalize transition-all border ${
                      testSeverity === sev 
                        ? 'bg-sky-600 text-white border-sky-600 shadow-sm' 
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSendTestAlert}
              disabled={isBroadcasting}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold py-3 rounded-xl shadow-md transition-all active:scale-[0.99]"
            >
              <Send className={`w-4 h-4 ${isBroadcasting ? 'animate-bounce' : ''}`} />
              {isBroadcasting ? 'Broadcasting V2V Packet...' : 'Transmit V2V Alert Now'}
            </button>
          </div>

          {/* Sound & Speech Synthesizer Testing */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-xs font-bold text-slate-700 block">Test Audio Alert Engine</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleTestAudio('warning')}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold"
              >
                Caution Chime
              </button>
              <button
                onClick={() => handleTestAudio('critical')}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold"
              >
                Critical Chime
              </button>
            </div>
            <button
              onClick={handleTestVoice}
              className="w-full px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <Volume2 className="w-3.5 h-3.5" />
              Test Voice Announcement Speech
            </button>
          </div>
        </div>

        {/* Right 2 Columns: Live Alerts & Mesh Status */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Alerts Panel */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  Active V2V Emergency Broadcasts
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live collision warnings and obstacle packets received over the vehicle wireless link.
                </p>
              </div>
              <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                {activeAlerts.length} Active
              </span>
            </div>

            {activeAlerts.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                <Wifi className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald-500" />
                No active collision or hazard warnings on your frequency. Clear roadway ahead!
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeAlerts.map((alert, idx) => (
                  <div
                    key={`${alert.hazard_id}-${idx}`}
                    className="p-4 rounded-xl border border-rose-200 bg-rose-50/60 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-rose-900 text-sm">
                            {alert.message}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white uppercase">
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-xs text-rose-700 mt-1">
                          Source: <span className="font-semibold">{alert.vehicle_name}</span> • 
                          Proximity: <span className="font-bold">{Math.round(alert.distance_meters)} meters</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => dismissAlert(alert.hazard_id)}
                      className="px-3 py-1.5 bg-white hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-lg border border-rose-200 shadow-sm transition-colors"
                    >
                      Acknowledge
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Connected Vehicles in Range */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Car className="w-5 h-5 text-sky-600" />
                  Vehicles Linked in Local Mesh ({vehicles.length})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Synchronized node telemetry transmitting speed, heading, and GPS coordinates.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider">
                    <th className="pb-2 font-semibold">Vehicle</th>
                    <th className="pb-2 font-semibold">Plate #</th>
                    <th className="pb-2 font-semibold">Speed</th>
                    <th className="pb-2 font-semibold">Heading</th>
                    <th className="pb-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 font-bold text-slate-800 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${v.id === selectedVehicle?.id ? 'bg-sky-500' : 'bg-emerald-500'}`} />
                        {v.name}
                        {v.id === selectedVehicle?.id && (
                          <span className="text-[10px] bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded font-semibold">Ego</span>
                        )}
                      </td>
                      <td className="py-2.5 font-mono text-slate-600">{v.plate_number}</td>
                      <td className="py-2.5 font-semibold text-slate-700">{v.speed} km/h</td>
                      <td className="py-2.5 text-slate-600">{v.heading}°</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
