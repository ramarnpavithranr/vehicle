import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Plus, Search, CheckCircle2, 
  XCircle, Trash2, RefreshCw, MapPin, 
  Calendar, Eye
} from 'lucide-react';
import { api } from '../services/api';
import type { Hazard, HazardStatus, HazardSeverity } from '../types';
import { HazardModal } from '../components/HazardModal';

export const HazardManagementPage: React.FC = () => {
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [selectedHazard, setSelectedHazard] = useState<Hazard | null>(null);

  const fetchHazards = async () => {
    try {
      setLoading(true);
      const params: { status?: string; severity?: string; search?: string } = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (severityFilter !== 'all') params.severity = severityFilter;
      if (search.trim()) params.search = search.trim();
      
      const data = await api.getHazards(params);
      setHazards(data);
    } catch (err) {
      console.error('Failed to load hazards', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHazards();
  }, [statusFilter, severityFilter]);

  const handleUpdateStatus = async (hazardId: number, newStatus: HazardStatus) => {
    try {
      await api.updateHazardStatus(hazardId, newStatus, 'Alex Turner (Admin)');
      fetchHazards();
      if (selectedHazard && selectedHazard.id === hazardId) {
        setSelectedHazard(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleDelete = async (hazardId: number) => {
    if (!window.confirm('Are you sure you want to delete this hazard record?')) return;
    try {
      await api.deleteHazard(hazardId);
      fetchHazards();
      if (selectedHazard?.id === hazardId) setSelectedHazard(null);
    } catch (err) {
      console.error('Failed to delete hazard', err);
    }
  };

  const getSeverityBadge = (severity: HazardSeverity) => {
    switch (severity) {
      case 'critical':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">Critical</span>;
      case 'high':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">High</span>;
      case 'medium':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">Medium</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">Low</span>;
    }
  };

  const getStatusBadge = (status: HazardStatus) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Confirmed</span>;
      case 'pending_verification':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Pending Review</span>;
      case 'cleared':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">Cleared</span>;
      case 'rejected':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">Rejected</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">Detected</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            Hazard Management & Verification
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Review, verify, and resolve real-time road hazard reports submitted by AI sensors and drivers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchHazards()}
            className="p-2.5 text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm transition-all"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-teal-600 text-white font-semibold px-4 py-2.5 rounded-xl shadow-md hover:from-sky-700 hover:to-teal-700 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            Report Road Hazard
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search hazard descriptions, reported by, coordinates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchHazards()}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">All Statuses</option>
            <option value="detected">Detected</option>
            <option value="pending_verification">Pending Review</option>
            <option value="confirmed">Confirmed</option>
            <option value="cleared">Cleared</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hazards List */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-sky-500 mb-3" />
              Loading hazards data...
            </div>
          ) : hazards.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">No hazards found matching current filters</p>
              <p className="text-xs text-slate-400 mt-1">Try resetting search filters or report a new road hazard</p>
            </div>
          ) : (
            hazards.map((h) => (
              <div
                key={h.id}
                onClick={() => setSelectedHazard(h)}
                className={`bg-white p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
                  selectedHazard?.id === h.id 
                    ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-md' 
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0 text-amber-600">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 capitalize text-sm">
                          {h.type.replace(/_/g, ' ')}
                        </span>
                        {getSeverityBadge(h.severity)}
                        {getStatusBadge(h.status)}
                      </div>
                      <p className="text-slate-600 text-xs mt-1 line-clamp-2">
                        {h.description || 'Hazard detected on road corridor.'}
                      </p>
                      <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {h.latitude.toFixed(4)}, {h.longitude.toFixed(4)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(h.created_at).toLocaleDateString()}
                        </span>
                        <span>Confidence: {Math.round(h.confidence * 100)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedHazard(h);
                      }}
                      className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                      title="Inspect Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(h.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Hazard Inspector Panel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm h-fit sticky top-6">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
            <span>Hazard Inspector</span>
            {selectedHazard && (
              <span className="text-xs font-mono text-slate-400">ID #{selectedHazard.id}</span>
            )}
          </h2>

          {selectedHazard ? (
            <div className="space-y-4 pt-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hazard Type</label>
                <p className="text-sm font-bold text-slate-800 capitalize mt-0.5">
                  {selectedHazard.type.replace(/_/g, ' ')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Severity</label>
                  <div className="mt-1">{getSeverityBadge(selectedHazard.severity)}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedHazard.status)}</div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</label>
                <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {selectedHazard.description || 'No detailed description provided.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Coordinates:</span>
                  <p className="font-mono font-medium text-slate-700">
                    {selectedHazard.latitude.toFixed(5)}, {selectedHazard.longitude.toFixed(5)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">AI Confidence:</span>
                  <p className="font-medium text-slate-700">{Math.round(selectedHazard.confidence * 100)}%</p>
                </div>
              </div>

              <div className="text-xs">
                <span className="text-slate-400">Reported By:</span>
                <p className="font-medium text-slate-700">{selectedHazard.reported_by}</p>
                {selectedHazard.verified_by && (
                  <p className="text-slate-500 mt-1 text-[11px]">
                    Verified by: <span className="font-semibold text-emerald-600">{selectedHazard.verified_by}</span>
                  </p>
                )}
              </div>

              {/* Status Action Buttons */}
              <div className="pt-2 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Update Verification Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedHazard.id, 'confirmed')}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verify / Confirm
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedHazard.id, 'cleared')}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark Cleared
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedHazard.id, 'rejected')}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject Report
                  </button>
                  <button
                    onClick={() => handleDelete(selectedHazard.id)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-600 text-white hover:bg-rose-700 rounded-xl text-xs font-semibold transition-colors shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Record
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
              Select a hazard report from the list to view full telemetry & take verification actions.
            </div>
          )}
        </div>
      </div>

      <HazardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchHazards();
        }}
      />
    </div>
  );
};
