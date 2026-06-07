import React, { useState } from 'react';
import { 
  Truck, 
  Container, 
  Clock, 
  Users, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  Zap, 
  Send,
  BellRing
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { User, Shipment, Vehicle, Driver } from '../types/logistics';

interface DashboardProps {
  analyticsData: any;
  shipments: Shipment[];
  vehicles: Vehicle[];
  drivers: Driver[];
  currentUser: User | null;
  onPostAlert: (message: string, type: 'warning' | 'alert') => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function Dashboard({
  analyticsData,
  shipments,
  vehicles,
  drivers,
  currentUser,
  onPostAlert
}: DashboardProps) {
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState<'warning' | 'alert'>('warning');

  const { summary, statusPie, shipmentPie, driveTrend } = analyticsData;

  const handleAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertMsg.trim()) return;
    onPostAlert(alertMsg, alertType);
    setAlertMsg('');
    alert(`System-wide alert broadcasted: "${alertMsg}"`);
  };

  // Compile active logs from shipments histories
  const allLogs = shipments.flatMap(s => 
    s.history.map(h => ({
      tracking_number: s.tracking_number,
      sender: s.sender_name,
      receiver: s.receiver_name,
      ...h
    }))
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const recentLogs = allLogs.slice(0, 5);

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full bg-slate-50">
      
      {/* Title & Stats description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-sans text-xl font-black text-slate-800 tracking-tight">
            Logistics Control Room & Operations Overview
          </h2>
          <p className="font-sans text-xs text-slate-500">
            Real-time sensory telemetry, load distribution status, and dispatch automation logs.
          </p>
        </div>
        <div className="font-sans text-xs text-slate-405 font-mono py-1 px-2.5 bg-white border border-slate-200 rounded">
          Last Check: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Summary Stat Widget Bento Box */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Total Vehicles Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="font-sans text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fleet Core</span>
            <Truck className="h-4 w-4 text-blue-600" />
          </div>
          <p className="font-sans text-xl font-extrabold text-slate-800">{summary.total_vehicles}</p>
          <span className="font-sans text-[10px] text-slate-400 block mt-1">registered vehicles</span>
        </div>

        {/* Active Shipments Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="font-sans text-[11px] font-bold text-slate-400 uppercase tracking-wider">In Transit</span>
            <Container className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="font-sans text-xl font-extrabold text-slate-800">{summary.active_deliveries}</p>
          <span className="font-sans text-[10px] text-slate-400 block mt-1">active dispatches</span>
        </div>

        {/* Pending Shipments Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="font-sans text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Load</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="font-sans text-xl font-extrabold text-slate-800">{summary.delayed_shipments}</p>
          <span className="font-sans text-[10px] text-slate-400 block mt-1">scheduled orders</span>
        </div>

        {/* Rest Pool Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="font-sans text-[11px] font-bold text-slate-400 uppercase tracking-wider">Driver Pool</span>
            <Users className="h-4 w-4 text-purple-600" />
          </div>
          <p className="font-sans text-xl font-extrabold text-slate-800">{summary.driver_availability}</p>
          <span className="font-sans text-[10px] text-slate-400 block mt-1">available to dispatch</span>
        </div>

        {/* Success percentage Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="font-sans text-[11px] font-bold text-slate-400 uppercase tracking-wider">Accuracy Rate</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="font-sans text-xl font-extrabold text-slate-800">{summary.delivery_success_rate}%</p>
          <span className="font-sans text-[10px] text-slate-400 block mt-1">all-time success</span>
        </div>

        {/* Total revenue Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="font-sans text-[11px] font-bold text-slate-400 uppercase tracking-wider">Est Revenue</span>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </div>
          <p className="font-sans text-xl font-extrabold text-slate-800">${summary.total_revenue_est}</p>
          <span className="font-sans text-[10px] text-slate-400 block mt-1">delivered net invoice</span>
        </div>
      </div>

      {/* Recharts Analytics Graphs Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Line Chart: Delivery Trends (Weekly) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <div className="mb-4">
            <h4 className="font-sans text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              7-Day Fleet Distance & Loading Volumes
            </h4>
            <p className="font-sans text-[11px] text-slate-405">
              Daily aggregates of total distance covered (miles) and fuel consumption.
            </p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={driveTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend iconSize={10} fontSize={11} wrapperStyle={{ paddingTop: 10 }} />
                <Line type="monotone" dataKey="distance" name="Dist Covered (mi)" stroke="#3b82f6" strokeWidth={2.5} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="fuelUsed" name="Fuel Drawn (gal)" stroke="#f59e0b" strokeWidth={1.5} />
                <Line type="monotone" dataKey="deliveries" name="Success Trips" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Vehicle Status Allocation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-sans text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Active Trailer Deployments
            </h4>
            <p className="font-sans text-[11px] text-slate-405">
              Current active operational statuses across overall vehicle fleet registry.
            </p>
          </div>
          
          <div className="h-44 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusPie.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            {/* Total Centered stat */}
            <div className="absolute text-center">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Registry</span>
              <span className="text-lg font-black text-slate-800">{vehicles.length} Units</span>
            </div>
          </div>

          {/* Pie Legends list */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 font-sans text-[10px] mt-2">
            {statusPie.map((entry: any, index: number) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-slate-600 font-semibold">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span>{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Row: Simulated logs panel and custom rapid incident report */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* System Logs tracking list */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-sans text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Active Operational Dispatch Logs
              </h4>
              <p className="font-sans text-[11px] text-slate-405">
                Sensory timeline ticks generated during simulated cargo transit.
              </p>
            </div>
            <span className="font-sans text-[10px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-extrabold uppercase">
              REAL-TIME FEED
            </span>
          </div>

          <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2">
            {recentLogs.length === 0 ? (
              <p className="font-sans text-xs text-slate-400 text-center py-10">No recent logs logged.</p>
            ) : (
              recentLogs.map((log, idx) => (
                <div key={idx} className="flex gap-3 border-l-2 border-slate-100 pl-4 py-1 hover:bg-slate-50 relative">
                  {/* Status dot representation */}
                  <span className={`absolute -left-[6px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white ${
                    log.status === 'delivered' ? 'bg-emerald-500' :
                    log.status === 'in_transit' ? 'bg-blue-500' :
                    log.status === 'picked_up' ? 'bg-yellow-500' :
                    log.status === 'out_for_delivery' ? 'bg-cyan-500' : 'bg-slate-500'
                  }`} />

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10.5px] font-extrabold text-slate-800">
                        {log.tracking_number}
                      </span>
                      <span className="font-mono text-[9px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="font-sans text-xs text-slate-600 font-semibold">
                      {log.location} — <span className="font-bold text-slate-800 capitalize">{log.status.replace('_', ' ')}</span>
                    </div>
                    <p className="font-sans text-[11px] text-slate-500 leading-relaxed">
                      {log.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dispatch Action Center (Accident Notification Creator) */}
        {currentUser?.role !== 'customer' && (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 rounded-2xl text-white shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BellRing className="h-4 w-4 text-emerald-400 animate-pulse" />
                <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-300">
                  Dispatcher Alert Broadcast
                </h4>
              </div>
              <p className="font-sans text-[11px] text-slate-400 mb-4 leading-relaxed">
                Emergency broadcast platform to push warning notifications or alerts to the driver panel on heavy route blockades or weather warnings.
              </p>

              <form onSubmit={handleAlertSubmit} className="space-y-4">
                {/* Select Type */}
                <div>
                  <span className="block font-mono text-[9px] text-slate-350 uppercase font-bold mb-1">
                    Alert Urgency Scope
                  </span>
                  <div className="flex gap-2 text-xs font-sans">
                    <button
                      type="button"
                      onClick={() => setAlertType('warning')}
                      className={`flex-1 py-1.5 rounded-lg font-bold border transition text-center ${
                        alertType === 'warning'
                          ? 'bg-amber-600/20 text-amber-300 border-amber-500'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      ⚠️ Warn Alert
                    </button>
                    <button
                      type="button"
                      onClick={() => setAlertType('alert')}
                      className={`flex-1 py-1.5 rounded-lg font-bold border transition text-center ${
                        alertType === 'alert'
                          ? 'bg-rose-600/20 text-rose-300 border-rose-500'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      🚨 Critical Issue
                    </button>
                  </div>
                </div>

                {/* Msg text */}
                <div>
                  <label className="block font-mono text-[9px] text-slate-350 uppercase font-bold mb-1 col-span-2">
                    Broadcast Message Details
                  </label>
                  <textarea
                    rows={3}
                    value={alertMsg}
                    onChange={(e) => setAlertMsg(e.target.value)}
                    placeholder="e.g. Traffic backlog at I-95 Philadelphia toll lanes, driver reroute recommended..."
                    className="w-full text-xs font-sans text-slate-205 bg-slate-950 border border-slate-700 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!alertMsg.trim()}
                  className="w-full bg-blue-600 font-sans text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 text-white hover:bg-blue-500 transition disabled:opacity-50 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Transmit Broadcast</span>
                </button>
              </form>
            </div>

            <div className="border-t border-slate-700 pt-3 mt-4 text-center">
              <span className="font-mono text-[9px] text-slate-400">
                Nexus Radio Cryptographic Signature Active
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
