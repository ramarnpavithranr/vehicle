import React, { useState } from 'react';
import { X, AlertTriangle, MapPin } from 'lucide-react';
import type { HazardType, HazardSeverity } from '../types';
import { api } from '../services/api';
import { useVehicle } from '../context/VehicleContext';

interface HazardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const HazardModal: React.FC<HazardModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { selectedVehicle } = useVehicle();
  const [type, setType] = useState<HazardType>('pothole');
  const [severity, setSeverity] = useState<HazardSeverity>('high');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState<number>(selectedVehicle?.latitude || 12.9716);
  const [longitude, setLongitude] = useState<number>(selectedVehicle?.longitude || 77.5946);
  const [confidence, setConfidence] = useState<number>(0.92);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await api.createHazard({
        type,
        severity,
        description: description || `Reported ${type.replace(/_/g, ' ')} hazard.`,
        latitude: Number(latitude),
        longitude: Number(longitude),
        confidence: Number(confidence),
        reported_by: selectedVehicle ? `${selectedVehicle.name} Sensor` : 'AutoPulse Mobile'
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit hazard');
    } finally {
      setIsSubmitting(false);
    }
  };

  const useVehicleCoords = () => {
    if (selectedVehicle) {
      setLatitude(Number(selectedVehicle.latitude.toFixed(5)));
      setLongitude(Number(selectedVehicle.longitude.toFixed(5)));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Report Road Hazard</h3>
              <p className="text-xs text-slate-500">Submits to AutoPulse AI network for verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Hazard Category</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as HazardType)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-slate-50/50 focus:bg-white focus:border-sky-500 outline-none"
            >
              <option value="pothole">Pothole / Road Surface Crater</option>
              <option value="roadwork">Roadwork / Construction Obstruction</option>
              <option value="debris">Debris / Fallen Cargo in Lane</option>
              <option value="slick_road">Slick Road / Oil Spill / Ice</option>
              <option value="stalled_vehicle">Stalled / Immobilized Vehicle</option>
              <option value="accident">Traffic Accident Incident</option>
              <option value="pedestrian_or_animal">Pedestrian / Animal on Expressway</option>
              <option value="general_obstacle">General Highway Obstacle</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Severity Level</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as HazardSeverity)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-slate-50/50 focus:bg-white focus:border-sky-500 outline-none"
              >
                <option value="low">Low (Advisory)</option>
                <option value="medium">Medium (Caution)</option>
                <option value="high">High (Decelerate)</option>
                <option value="critical">Critical (Immediate Stop)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">Confidence</label>
                <span className="font-mono text-slate-500 font-bold">{Math.round(confidence * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.0"
                step="0.01"
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                className="w-full mt-2 accent-sky-600"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">Coordinates (Latitude, Longitude)</label>
              <button
                type="button"
                onClick={useVehicleCoords}
                className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                <MapPin className="w-3 h-3" />
                <span>Sync with Active Vehicle</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                step="0.0001"
                required
                value={latitude}
                onChange={(e) => setLatitude(Number(e.target.value))}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 bg-slate-50/50 focus:bg-white focus:border-sky-500 outline-none"
                placeholder="Latitude"
              />
              <input
                type="number"
                step="0.0001"
                required
                value={longitude}
                onChange={(e) => setLongitude(Number(e.target.value))}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 bg-slate-50/50 focus:bg-white focus:border-sky-500 outline-none"
                placeholder="Longitude"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Hazard Description & Notes</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Deep hole on central lane right after junction. Rim damage risk."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50/50 focus:bg-white focus:border-sky-500 outline-none resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-sky-600 to-teal-600 text-white shadow-md shadow-sky-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Reporting...' : 'Broadcast Hazard to Network'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
