import React from 'react';
import { Radio } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-12 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-sm">
                <Radio className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-slate-900">
                AutoPulse <span className="text-sky-600">AI</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Intelligent connected vehicle ecosystem. Real-time road hazard detection, microsecond V2V alert dispatch, and predictive vehicle health diagnostics.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>V2V WebSocket Network Online</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-900 mb-4">Ecosystem</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/dashboard" className="hover:text-sky-600 transition-colors">
                  Live Operations Dashboard
                </Link>
              </li>
              <li>
                <Link to="/dashboard/map" className="hover:text-sky-600 transition-colors">
                  Interactive Fleet Map
                </Link>
              </li>
              <li>
                <Link to="/dashboard/ai-detection" className="hover:text-sky-600 transition-colors">
                  AI Hazard Vision
                </Link>
              </li>
              <li>
                <Link to="/dashboard/simulation" className="hover:text-sky-600 transition-colors">
                  Traffic Sandbox Simulation
                </Link>
              </li>
            </ul>
          </div>

          {/* Core Modules */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-900 mb-4">Features</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/dashboard/hazards" className="hover:text-sky-600 transition-colors">
                  Hazard Lifecycle Management
                </Link>
              </li>
              <li>
                <Link to="/dashboard/v2v-alerts" className="hover:text-sky-600 transition-colors">
                  V2V Proximity Alert Engine
                </Link>
              </li>
              <li>
                <Link to="/dashboard/vehicle-health" className="hover:text-sky-600 transition-colors">
                  Telematics Health Telemetry
                </Link>
              </li>
              <li>
                <Link to="/dashboard/documents" className="hover:text-sky-600 transition-colors">
                  PUC & Document Compliance
                </Link>
              </li>
            </ul>
          </div>

          {/* Architectural Stack */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-900 mb-4">Architecture</h4>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-700 font-mono">FastAPI</span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-700 font-mono">WebSockets</span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-700 font-mono">YOLO Vision</span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-700 font-mono">Leaflet OSM</span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-700 font-mono">React 19</span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-700 font-mono">SQLite / ORM</span>
            </div>
            <p className="text-xs text-slate-400 mt-4 leading-relaxed">
              Designed for high-throughput automotive safety telematics and intelligent transportation systems.
            </p>
          </div>
        </div>

        {/* Bottom Legal / Disclaimer */}
        <div className="pt-8 border-t border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} AutoPulse AI. Intelligent Vehicle Communication & Road Hazard Awareness System.
          </div>
          <div className="text-slate-400 text-center md:text-right">
            <span>Notice: Simulated road telematics and safety preview models are for research & demonstration.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
