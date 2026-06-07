import React from 'react';
import { 
  Building2, 
  Truck, 
  Users, 
  MapPin, 
  TrendingUp, 
  FileText, 
  BrainCircuit, 
  ShieldCheck 
} from 'lucide-react';
import { User } from '../types/logistics';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
}

export default function Sidebar({ activeTab, setActiveTab, currentUser }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Control Room', icon: Building2, roles: ['admin', 'manager', 'driver', 'customer'] },
    { id: 'tracking', label: 'Interactive Live Map', icon: MapPin, roles: ['admin', 'manager', 'driver', 'customer'] },
    { id: 'shipments', label: 'Shipment Operations', icon: FileText, roles: ['admin', 'manager', 'customer', 'driver'] },
    { id: 'fleet', label: 'Fleet Registry', icon: Truck, roles: ['admin', 'manager'] },
    { id: 'drivers', label: 'Driver Status & Fatigue', icon: Users, roles: ['admin', 'manager'] },
    { id: 'analytics', label: 'Fleet Analytics', icon: TrendingUp, roles: ['admin', 'manager'] },
  ];

  const filteredItems = menuItems.filter(item => 
    !currentUser || item.roles.includes(currentUser.role)
  );

  return (
    <nav className="w-64 border-r border-slate-200 bg-slate-50 flex flex-col justify-between shrink-0">
      <div className="py-6 px-4">
        <div className="mb-6 px-3">
          <span className="font-sans text-[10px] font-bold text-slate-400 tracking-wider block uppercase mb-1">
            Logistics Console
          </span>
          <div className="h-1.5 w-12 bg-blue-600 rounded"></div>
        </div>

        <ul className="space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-xs font-semibold tracking-wide transition font-sans ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer metadata stamp */}
      <div className="p-4 border-t border-slate-200 bg-slate-100/50">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span className="font-sans text-[10px] uppercase font-bold text-slate-500">Security Gate Active</span>
        </div>
        <p className="font-mono text-[9px] text-slate-400 leading-normal">
          Authorized User Session • Role: <span className="font-semibold text-slate-700 capitalize">{currentUser?.role}</span>
        </p>
      </div>
    </nav>
  );
}
