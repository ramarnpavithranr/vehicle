import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Calendar, 
  Trash2, Edit2, ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';
import type { DocumentReminder } from '../types';
import { DocumentModal } from '../components/DocumentModal';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentReminder[]>([]);
  const [sampleFines, setSampleFines] = useState<Record<string, string>>({});
  const [_loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentReminder | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const cat = categoryFilter === 'all' ? undefined : categoryFilter;
      const data = await api.getDocuments(cat);
      setDocuments(data);
    } catch (err) {
      console.error('Failed to load documents', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFines = async () => {
    try {
      const fines = await api.getSampleFines();
      setSampleFines(fines);
    } catch (err) {
      console.error('Failed to load fines', err);
    }
  };

  useEffect(() => {
    fetchDocs();
    fetchFines();
  }, [categoryFilter]);

  const handleDelete = async (docId: number) => {
    if (!window.confirm('Delete this document reminder?')) return;
    try {
      await api.deleteDocument(docId);
      fetchDocs();
    } catch (err) {
      console.error('Failed to delete document', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Valid</span>;
      case 'due_soon':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Due Soon</span>;
      case 'overdue':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">Overdue</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">Upcoming</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-sky-600" />
            Documents, Compliance & Renewal Reminders
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track motor insurance, PUC certificates, driving licenses, and prevent statutory penalties.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingDoc(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-teal-600 text-white font-semibold px-4 py-2.5 rounded-xl shadow-md hover:from-sky-700 hover:to-teal-700 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Document Reminder
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'insurance', 'license', 'puc', 'fitness', 'service'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
              categoryFilter === cat
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat === 'puc' ? 'PUC Certificate' : cat}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 relative hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2 py-0.5 rounded">
                  {doc.category}
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-1.5">{doc.title}</h3>
                {doc.document_number && (
                  <span className="text-xs font-mono text-slate-500 block">
                    No: {doc.document_number}
                  </span>
                )}
              </div>
              <div>{getStatusBadge(doc.status)}</div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Expires on: <strong className="text-slate-800">{new Date(doc.expiry_date).toLocaleDateString()}</strong></span>
            </div>

            {doc.notes && (
              <p className="text-xs text-slate-500 italic">
                Note: {doc.notes}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setEditingDoc(doc);
                  setIsModalOpen(true);
                }}
                className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-sky-50 transition-colors"
                title="Edit Document"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(doc.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                title="Delete Reminder"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Statutory Traffic Penalty Reference Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            Statutory Traffic Fines & Non-Compliance Penalties Reference
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Legal penalty guidance for driving with expired documents under motor vehicle laws.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(sampleFines).map(([category, fineText], idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/70 text-xs">
              <span className="font-bold text-amber-900 uppercase block tracking-wider text-[10px]">
                {category.replace(/_/g, ' ')}
              </span>
              <p className="font-semibold text-amber-800 mt-1">{fineText}</p>
            </div>
          ))}
        </div>
      </div>

      <DocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchDocs();
        }}
        initialData={editingDoc}
      />
    </div>
  );
};
