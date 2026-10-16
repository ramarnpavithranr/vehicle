import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Radio, LayoutDashboard, Map, Camera, AlertTriangle, 
  Wifi, HeartPulse, FileText, Activity, Bell, Settings, 
  LogOut, ChevronDown, Volume2, VolumeX, Car, ChevronLeft, 
  ChevronRight, ShieldAlert, Sparkles 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useVehicle } from '../context/VehicleContext';
import { useAlert } from '../context/AlertContext';

export const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  
  const { user, logout } = useAuth();
  const { vehicles, selectedVehicle, setSelectedVehicleId } = useVehicle();
  const { 
    activeAlerts, notifications, unreadCount, connectionStatus, 
    isMuted, toggleMute, dismissAlert, broadcastTestAlert, markNotificationAsRead 
  } = useAlert();
  
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/dashboard/map', label: 'Live Map', icon: Map },
    { to: '/dashboard/ai-detection', label: 'AI Detection', icon: Camera },
    { to: '/dashboard/hazards', label: 'Hazard Management', icon: AlertTriangle },
    { to: '/dashboard/v2v-alerts', label: 'V2V Communication', icon: Wifi },
    { to: '/dashboard/vehicle-health', label: 'Vehicle Health', icon: HeartPulse },
    { to: '/dashboard/documents', label: 'Documents & Reminders', icon: FileText },
    { to: '/dashboard/simulation', label: 'Traffic Simulation', icon: Activity },
    { to: '/dashboard/notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { to: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* High-Priority Active V2V Alert Dropdown Banner */}
      {activeAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 text-white px-4 py-2.5 shadow-lg flex items-center justify-between z-50 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center animate-bounce shadow-sm">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold uppercase tracking-wider text-xs bg-black/30 px-2 py-0.5 rounded mr-2">
                ACTIVE V2V WARNING
              </span>
              <span className="text-sm font-semibold">{activeAlerts[0].message}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => dismissAlert(activeAlerts[0].hazard_id)}
              className="text-xs bg-white text-rose-700 hover:bg-slate-100 font-bold px-3 py-1.5 rounded-lg shadow-sm transition-colors"
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Collapsible Sidebar */}
        <aside
          className={`bg-white border-r border-slate-200/80 flex flex-col transition-all duration-300 select-none z-30 shadow-sm ${
            collapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* Brand Header */}
          <div className="p-4 border-b border-slate-100/80 flex items-center justify-between bg-gradient-to-br from-white to-sky-50/40">
            <Link to="/" className="flex items-center gap-3 overflow-hidden group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex-shrink-0 flex items-center justify-center text-white shadow-md shadow-sky-600/20 group-hover:shadow-sky-600/40 group-hover:scale-105 transition-all">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              {!collapsed && (
                <div className="truncate">
                  <span className="font-bold text-slate-900 tracking-tight block text-base">
                    AutoPulse <span className="text-sky-600">AI</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase block">
                    Telemetry System
                  </span>
                </div>
              )}
            </Link>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-all"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-50 to-teal-50/60 text-sky-700 shadow-sm border border-sky-100/80 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                  {!collapsed && Boolean(item.badge) && item.badge! > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white shadow-sm">
                      {item.badge}
                    </span>
                  )}
                  {isActive && !collapsed && (
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 flex-shrink-0" />
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Sidebar Bottom Banner */}
          {!collapsed && (
            <div className="p-3 m-3 rounded-2xl bg-gradient-to-br from-sky-50 via-teal-50/50 to-white border border-sky-100 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-bold text-slate-900">V2V Protection</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Proximity alerts active within 1,000m radius of detected road defects.
              </p>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Navigation Bar */}
          <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 z-20 shadow-sm">
            {/* Left: Active Vehicle Selector */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/90 hover:bg-slate-200/80 rounded-xl transition-colors border border-slate-200 shadow-xs">
                <Car className="w-4 h-4 text-sky-600" />
                <select
                  value={selectedVehicle?.id || 1}
                  onChange={(e) => setSelectedVehicleId(Number(e.target.value))}
                  className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer pr-1"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.plate_number})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Badge */}
              <div
                className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border shadow-xs ${
                  connectionStatus === 'connected'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                <span>{connectionStatus === 'connected' ? 'V2V WebSocket Online' : 'Connecting to Mesh...'}</span>
              </div>
            </div>

            {/* Right: Actions, Notifications, Audio, Profile */}
            <div className="flex items-center gap-2.5">
              {/* Test V2V Broadcast Button */}
              <button
                onClick={() => broadcastTestAlert()}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 hover:shadow-sm transition-all"
                title="Send a sample V2V proximity broadcast"
              >
                <Wifi className="w-3.5 h-3.5" />
                <span>Test V2V Alert</span>
              </button>

              {/* Audio Voice Alert Toggle */}
              <button
                onClick={toggleMute}
                className={`p-2 rounded-xl border transition-all shadow-xs hover:shadow-sm ${
                  isMuted
                    ? 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                    : 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'
                }`}
                title={isMuted ? 'Voice alerts muted. Click to enable' : 'Voice alerts active. Click to mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Notification Bell Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all shadow-xs hover:shadow-sm"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white shadow-sm" />
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-900">Notifications ({unreadCount} new)</span>
                      <Link
                        to="/dashboard/notifications"
                        onClick={() => setNotifDropdownOpen(false)}
                        className="text-[11px] text-sky-600 font-semibold hover:underline"
                      >
                        View all
                      </Link>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {notifications.slice(0, 4).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationAsRead(n.id)}
                          className={`p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                            n.is_read ? 'bg-slate-50 text-slate-500' : 'bg-sky-50/70 text-slate-800 font-medium'
                          }`}
                        >
                          <div className="font-semibold text-slate-900 truncate">{n.title}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-2">{n.message}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 shadow-xs hover:shadow-sm"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                    {user?.full_name?.charAt(0) || 'A'}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 hidden lg:inline-block max-w-[120px] truncate">
                    {user?.full_name || 'Inspector Alex'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-slate-900">{user?.full_name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      <span className="mt-1 inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                        {user?.role || 'Safety Inspector'}
                      </span>
                    </div>

                    <div className="pt-1">
                      <Link
                        to="/dashboard/settings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5 text-slate-400" />
                        Account Settings
                      </Link>
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                          navigate('/');
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 font-medium transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page Contents */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
