import React from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { TrendingUp, Truck, MapPin, Gauge, Star, Zap } from 'lucide-react';
import { Vehicle, Driver, Shipment } from '../types/logistics';

interface AnalyticsProps {
  analyticsData: any;
  vehicles: Vehicle[];
  drivers: Driver[];
  shipments: Shipment[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export default function Analytics({
  analyticsData,
  vehicles,
  drivers,
  shipments
}: AnalyticsProps) {
  const { driveTrend, statusPie, shipmentPie, driverScores } = analyticsData;

  const totalDelivered = shipments.filter(s => s.status === 'delivered').length;
  const inTransitCount = shipments.filter(s => s.status === 'in_transit').length;

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full bg-slate-50">
      {/* Title */}
      <div>
        <h2 className="font-sans text-xl font-black text-slate-800 tracking-tight">
          Enterprise Fleet Performance Metrics & IoT Intelligence
        </h2>
        <p className="font-sans text-xs text-slate-500">
          Advanced analytics compiling fuel statistics, delivery rate successes, and driver scores using connected vehicle telemetry.
        </p>
      </div>

      {/* Grid widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Core efficiency */}
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center mb-1">
            <span className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aggregate Distance</span>
            <MapPin className="h-4 w-4 text-slate-400" />
          </div>
          <p className="font-sans text-lg font-black text-slate-800">11,500 mi</p>
          <span className="font-sans text-[10px] text-emerald-600 block mt-0.5">▲ 8.4% weekly climb</span>
        </div>

        {/* Avg fuel */}
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center mb-1">
            <span className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fuel Efficiency</span>
            <Gauge className="h-4 w-4 text-slate-400" />
          </div>
          <p className="font-sans text-lg font-black text-slate-800">7.8 mi/gal</p>
          <span className="font-sans text-[10px] text-slate-400 block mt-0.5">Heavy heavy rig aggregate</span>
        </div>

        {/* Active load */}
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center mb-1">
            <span className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trailer Utilization</span>
            <Truck className="h-4 w-4 text-slate-400" />
          </div>
          <p className="font-sans text-lg font-black text-slate-800">
            {Math.round((vehicles.filter(v => v.status === 'in_transit').length / (vehicles.length || 1)) * 105)}%
          </p>
          <span className="font-sans text-[10px] text-slate-405 block mt-0.5">Hold capacity optimized</span>
        </div>

        {/* Dispatch rating */}
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center mb-1">
            <span className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pilot Standing</span>
            <Star className="h-4 w-4 text-slate-400 animate-pulse" />
          </div>
          <p className="font-sans text-lg font-black text-amber-600">4.5 / 5.0</p>
          <span className="font-sans text-[10px] text-slate-440 block mt-0.5">Avg customer evaluation</span>
        </div>
      </div>

      {/* Graphs columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Fuel & Distance bar chart comparisons */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="mb-4">
            <h4 className="font-sans text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Comparative Fuel Loss & Distance progressions
            </h4>
            <p className="font-sans text-[11px] text-slate-405">
              Weekly summary maps validating resource draw parameters relative to total logged mileage.
            </p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={driveTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend iconSize={10} fontSize={11} wrapperStyle={{ paddingTop: 10 }} />
                <Bar dataKey="distance" name="Mileage (mi)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fuelUsed" name="Used Fuel (gal)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Horizontal Driver Rankings metrics */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="mb-4">
            <h4 className="font-sans text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Pilot Driver Safety & Performance Scores
            </h4>
            <p className="font-sans text-[11px] text-slate-405">
              Aggregated scores generated from transit timelines, promptness, and fuel compliance indexes.
            </p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={driverScores} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={90} />
                <Tooltip />
                <Legend iconSize={10} fontSize={11} wrapperStyle={{ paddingTop: 10 }} />
                <Bar dataKey="score" name="Performance Index" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie: Shipment statuses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-sans text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Cargo Delivery Pipeline split
            </h4>
            <p className="font-sans text-[11px] text-slate-450">
              Dispatched versus pending schedules across active logistics queues.
            </p>
          </div>

          <div className="h-56 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={shipmentPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {shipmentPie.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute text-center">
              <span className="block text-[10px] uppercase font-bold text-slate-400 font-sans">Active</span>
              <span className="text-lg font-black text-slate-805 tracking-tight font-sans">{shipments.length} Load Logs</span>
            </div>
          </div>

          <div className="flex justify-center gap-x-4 gap-y-1 flex-wrap text-[10px] font-sans font-semibold text-slate-600">
            {shipmentPie.map((entry: any, index: number) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span>{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic advice telemetry widget */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-blue-400 animate-pulse" />
              <h4 className="font-sans text-xs font-extrabold uppercase tracking-widest text-[#94a3b8]">
                IoT Smart Reroute Advice
              </h4>
            </div>

            <p className="font-sans text-xs text-slate-350 leading-relaxed">
              Our sensory telemetry models indicate heavy dispatch usage along the Boston-New York corridor. Carbon-compliance index is positive at 94% with an efficient fuel conversion average.
            </p>

            <div className="space-y-2.5 border-t border-slate-800 pt-4 text-xs font-sans">
              <div className="flex justify-between items-center text-slate-400">
                <span>Completed Cargo Tons:</span>
                <span className="font-bold text-white">{totalDelivered * 14} Tons</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Active Burning Fuel:</span>
                <span className="font-bold text-white">{inTransitCount * 42} gal</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Grid Load Level:</span>
                <span className="font-bold text-emerald-400">NORMAL STABLE</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-center text-[10px] font-mono text-slate-500">
            NEXUS AUTOMATED CARGO INTELLIGENCE REPORT
          </div>
        </div>
      </div>
    </div>
  );
}
