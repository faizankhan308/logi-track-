import React, { useState } from 'react';
import { Bell, User, LogOut, Radio, RefreshCw, Layers } from 'lucide-react';
import { SystemNotification, User as UserType } from '../types/logistics';

interface NavbarProps {
  currentUser: UserType | null;
  onLogout: () => void;
  notifications: SystemNotification[];
  onMarkNotificationsRead: () => void;
  onTriggerTick: () => void;
  isSimulating: boolean;
}

export default function Navbar({
  currentUser,
  onLogout,
  notifications,
  onMarkNotificationsRead,
  onTriggerTick,
  isSimulating
}: NavbarProps) {
  const [showNotif, setShowNotif] = useState(false);
  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
      {/* Brand Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-sans text-lg font-bold tracking-tight text-slate-800">
            NEXUS LOGISTICS
          </h1>
          <p className="font-mono text-[10px] tracking-wider text-slate-400">
            FLEET CONTROL PORTAL • Live
          </p>
        </div>
      </div>

      {/* Control Actions & User Meta */}
      <div className="flex items-center gap-4">
        {/* Live Simulation Step Ticker */}
        {currentUser?.role !== 'customer' && (
          <button
            onClick={onTriggerTick}
            disabled={isSimulating}
            className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 font-sans text-xs font-semibold text-emerald-700 border border-emerald-200 shadow-sm transition hover:bg-emerald-100 disabled:opacity-50"
            title="Step Vehicle Movement in Real-time"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Updating...' : 'Step Sim Movement'}</span>
          </button>
        )}

        {/* Live Pulse status marker */}
        <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 font-mono text-[11px] text-slate-600 border border-slate-200">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span className="hidden sm:inline">SYS ONLINE</span>
        </div>

        {/* System Warnings Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotif(!showNotif);
              if (unreadCount > 0) {
                onMarkNotificationsRead();
              }
            }}
            className="relative p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 transition"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 font-mono text-[9px] font-bold text-white leading-none">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-fade-in z-50">
              <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
                <span className="font-sans text-xs font-bold text-slate-800">Operational Alerts</span>
                <span className="font-mono text-[10px] text-slate-400">{notifications.length} logged</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 py-1">
                {notifications.length === 0 ? (
                  <p className="px-3 py-4 text-center font-sans text-xs text-slate-400">No alerts on file</p>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className={`p-3 text-xs transition hover:bg-slate-50 ${notif.status === 'unread' ? 'bg-slate-50/50' : ''}`}>
                      <div className="flex items-center gap-1.5 mb-1 font-medium">
                        {notif.type === 'alert' && <span className="h-2 w-2 rounded-full bg-rose-500" />}
                        {notif.type === 'warning' && <span className="h-2 w-2 rounded-full bg-amber-500" />}
                        {notif.type === 'success' && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
                        {notif.type === 'info' && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                        <span className="font-sans text-slate-700 capitalize font-semibold">{notif.type} Alert</span>
                        <span className="ml-auto font-mono text-[9px] text-slate-400">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="font-sans text-slate-600 leading-relaxed text-[11px]">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Identity Info */}
        {currentUser && (
          <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-700">
              <User className="h-4 w-4" />
            </div>
            <div className="hidden md:block">
              <div className="font-sans text-xs font-bold text-slate-800">{currentUser.name}</div>
              <div className="font-mono text-[9px] font-semibold uppercase text-blue-600 tracking-wider">
                {currentUser.role}
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-slate-700 transition"
              title="Logout session"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
