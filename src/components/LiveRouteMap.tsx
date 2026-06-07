import React, { useState } from 'react';
import { Truck, MapPin, Navigation, Info, ShieldAlert, Zap, Layers } from 'lucide-react';
import { Vehicle, VehicleLocation, Shipment, Driver } from '../types/logistics';

interface LiveRouteMapProps {
  vehicles: Vehicle[];
  shipments: Shipment[];
  drivers: Driver[];
  locations: Record<string, VehicleLocation>;
  onTriggerTick: () => void;
}

const CITIES = [
  { name: 'Boston Depot', lat: 42.3601, lng: -71.0589, type: 'Hub' },
  { name: 'New York City', lat: 40.7128, lng: -74.0060, type: 'Port' },
  { name: 'Newark Depot', lat: 40.7357, lng: -74.1724, type: 'Hub' },
  { name: 'Philadelphia Depot', lat: 39.9526, lng: -75.1652, type: 'Warehouse' },
  { name: 'Baltimore Yard', lat: 39.2904, lng: -76.6122, type: 'Hub' },
  { name: 'Washington D.C.', lat: 38.9072, lng: -77.0369, type: 'Capital Head' }
];

const HIGHWAY_NODES = [
  { lat: 38.9072, lng: -77.0369 }, // DC
  { lat: 39.2904, lng: -76.6122 }, // Baltimore
  { lat: 39.9526, lng: -75.1652 }, // Philly
  { lat: 40.7357, lng: -74.1724 }, // Newark
  { lat: 40.7128, lng: -74.0060 }, // NYC
  { lat: 42.3601, lng: -71.0589 }  // Boston
];

export default function LiveRouteMap({
  vehicles,
  shipments,
  drivers,
  locations,
  onTriggerTick
}: LiveRouteMapProps) {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const mapWidth = 900;
  const mapHeight = 550;

  // Geographic projection projection onto 900x550 canvas box
  const getSvgCoords = (lat: number, lng: number) => {
    // bounding box around Northeast transit lines
    const minLat = 38.2;
    const maxLat = 42.8;
    const minLng = -77.8;
    const maxLng = -70.2;

    const x = ((lng - minLng) / (maxLng - minLng)) * mapWidth;
    const y = (1 - (lat - minLat) / (maxLat - minLat)) * mapHeight;
    return { x, y };
  };

  // Convert Interstate 95 route
  const highwayPoints = HIGHWAY_NODES.map(node => {
    const { x, y } = getSvgCoords(node.lat, node.lng);
    return `${x},${y}`;
  }).join(' ');

  // Find info for selected trailer inspector
  const activeLocation = selectedVehicleId ? locations[selectedVehicleId] : null;
  const activeVehicle = selectedVehicleId ? vehicles.find(v => v.id === selectedVehicleId) : null;
  const activeDriver = selectedVehicleId ? drivers.find(d => d.assigned_vehicle_id === selectedVehicleId) : null;
  const activeShipment = activeDriver ? shipments.find(s => s.assigned_driver_id === activeDriver.id && (s.status === 'in_transit' || s.status === 'out_for_delivery')) : null;

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 h-full bg-slate-50">
      {/* Map Board SVG Box */}
      <div className="flex-1 rounded-xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden relative flex flex-col min-h-[500px]">
        
        {/* Map Header details */}
        <div className="bg-slate-950/80 backdrop-blur px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-400" />
            <h3 className="font-sans text-xs font-bold text-slate-200 tracking-wider">
              NORTHEAST INTERSTATE FREIGHT COOPERATION GRAPH
            </h3>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Safe Flow
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" /> Active Trailer
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-slate-500" /> Depots
            </span>
          </div>
        </div>

        {/* SVG Rendering */}
        <div className="flex-1 w-full bg-[#0a0f1d] relative flex items-center justify-center p-4 overflow-auto">
          <svg
            viewBox={`0 0 ${mapWidth} ${mapHeight}`}
            width="100%"
            height="100%"
            className="w-full max-w-4xl select-none"
          >
            {/* Grid references */}
            <defs>
              <pattern id="mapGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.04" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mapGrid)" />

            {/* Render Interstate Highway Line (Main Expressway I-95 corridor) */}
            <polyline
              points={highwayPoints}
              fill="none"
              stroke="#1e293b"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points={highwayPoints}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="4 4"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.6"
            />

            {/* Label major highway path */}
            <text x="350" y="270" fill="#3b82f6" opacity="0.3" fontSize="10" fontFamily="monospace" textAnchor="middle">
              AMTRAK & I-95 EXPRESS FREIGHT ROUTE
            </text>

            {/* Dotted Route paths of Active Shipments */}
            {shipments.map((sh) => {
              if (sh.status === 'in_transit' || sh.status === 'out_for_delivery') {
                const start = getSvgCoords(sh.pickup_lat, sh.pickup_lng);
                const end = getSvgCoords(sh.delivery_lat, sh.delivery_lng);
                return (
                  <g key={`route-${sh.id}`}>
                    <path
                      d={`M ${start.x} ${start.y} Q ${(start.x+end.x)/2} ${(start.y+end.y)/2 - 40} ${end.x} ${end.y}`}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeDasharray="6 6"
                      opacity="0.75"
                    />
                  </g>
                );
              }
              return null;
            })}

            {/* City Nodes */}
            {CITIES.map((city, idx) => {
              const { x, y } = getSvgCoords(city.lat, city.lng);
              return (
                <g key={`city-${idx}`} className="group cursor-help">
                  <circle cx={x} cy={y} r="14" fill="#1e293b" opacity="0.25" />
                  <circle cx={x} cy={y} r="7" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
                  <circle cx={x} cy={y} r="3" fill="#64748b" className="group-hover:fill-blue-400 transitions" />
                  <text
                    x={x + 10}
                    y={y + 4}
                    fill="#94a3b8"
                    fontSize="9.5"
                    className="font-sans font-semibold tracking-wide shadow-black"
                  >
                    {city.name}
                  </text>
                </g>
              );
            })}

            {/* Active Moving Vehicles */}
            {Object.entries(locations).map(([vehId, loc]) => {
              const vehicle = vehicles.find(v => v.id === vehId);
              if (!vehicle || vehicle.status === 'offline') return null;

              const isSelected = selectedVehicleId === vehId;
              const { x, y } = getSvgCoords(loc.latitude, loc.longitude);
              const angle = loc.heading;

              return (
                <g
                  key={`marker-${vehId}`}
                  transform={`translate(${x},${y})`}
                  className="cursor-pointer"
                  onClick={() => setSelectedVehicleId(isSelected ? null : vehId)}
                >
                  {/* Selector Ring */}
                  {isSelected && (
                    <circle cx="0" cy="0" r="22" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="3 3" className="animate-spin" />
                  )}

                  {/* Pulsing indicator aura */}
                  <circle cx="0" cy="0" r="16" fill={isSelected ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)"} className="animate-ping" style={{ animationDuration: '3s' }} />
                  
                  {/* Hexagon Body Icon representation */}
                  <g transform={`rotate(${angle})`}>
                    <polygon
                      points="-10,-8 12,0 -10,8"
                      fill={isSelected ? "#ef4444" : "#10b981"}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  </g>

                  {/* Small Truck Label tag */}
                  <rect x="12" y="-22" width="75" height="15" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="1" opacity="0.9" />
                  <text x="16" y="-12" fill="#e2e8f0" fontSize="8" fontFamily="monospace" fontWeight="bold">
                    {vehicle.vehicle_number} • {loc.speed}mph
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Floating guidance bar */}
        <div className="bg-slate-950 px-5 py-3 text-slate-400 font-sans text-[11px] flex items-center justify-between border-t border-slate-850">
          <p>
            💡 <span className="text-slate-300 font-semibold">Live Simulation Interactive Node:</span> Click on any green trailer arrowhead to dock vehicle parameters, active manifests and driver performance logs.
          </p>
          <button 
            onClick={onTriggerTick}
            className="text-blue-400 hover:text-blue-300 transition font-mono font-bold text-[10px] ml-4"
          >
            TRIG TICK STEP →
          </button>
        </div>
      </div>

      {/* Docked Inspector Sheet */}
      <div className="w-full lg:w-80 rounded-xl bg-white border border-slate-200 p-5 shadow-lg shrink-0 flex flex-col justify-between">
        <div>
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-sans text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">
              Active Inspector Panel
            </h3>
            <p className="font-sans text-sm font-bold text-slate-800">
              {activeVehicle ? `Asset: ${activeVehicle.vehicle_number}` : 'No Vehicle Selected'}
            </p>
          </div>

          {activeLocation && activeVehicle ? (
            <div className="space-y-4">
              {/* Type Badge */}
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="font-sans text-[11px] font-semibold text-slate-500">Asset Type</span>
                <span className="font-sans text-xs font-bold text-slate-800 bg-slate-200/80 px-2.5 py-0.5 rounded-full">
                  {activeVehicle.vehicle_type}
                </span>
              </div>

              {/* Coordinates block */}
              <div>
                <span className="block font-sans text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                  GPS Telemetry
                </span>
                <div className="p-2.5 bg-slate-900 rounded-lg text-slate-200 font-mono text-[11px] space-y-1">
                  <div>LAT: {activeLocation.latitude.toFixed(5)}</div>
                  <div>LNG: {activeLocation.longitude.toFixed(5)}</div>
                  <div className="flex justify-between text-yellow-400 font-sans font-bold text-[10px] mt-1 pt-1 border-t border-slate-800">
                    <span>HEADING: {activeLocation.heading}°</span>
                    <span>SPEED: {activeLocation.speed} MPH</span>
                  </div>
                </div>
              </div>

              {/* Trip performance telemetry */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 border border-slate-100 bg-slate-50 rounded-lg">
                  <span className="block font-sans text-[9px] text-slate-400 uppercase font-bold">Odometer Run</span>
                  <span className="font-mono text-xs font-bold text-slate-700">{activeLocation.distance_covered.toFixed(1)} mi</span>
                </div>
                <div className="p-2.5 border border-slate-100 bg-slate-50 rounded-lg">
                  <span className="block font-sans text-[9px] text-slate-400 uppercase font-bold">Fuel Level</span>
                  <span className={`font-mono text-xs font-bold ${activeVehicle.fuel_level < 25 ? 'text-rose-600 animate-pulse' : 'text-slate-705'}`}>
                    {activeVehicle.fuel_level}%
                  </span>
                </div>
              </div>

              {/* Driver info card */}
              {activeDriver ? (
                <div className="border border-slate-150 p-3 rounded-xl bg-blue-50/40">
                  <span className="block font-sans text-[9px] font-bold text-blue-500 uppercase tracking-wider mb-1.5">
                    Assigned Dispatcher
                  </span>
                  <div className="font-sans text-xs font-bold text-slate-800">{activeDriver.name}</div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                    <span>Performance: {activeDriver.performance_score}/100</span>
                    <span className={`font-bold px-1.5 py-0.5 rounded ${activeDriver.fatigue_alert ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-emerald-100 text-emerald-800'}`}>
                      {activeDriver.fatigue_alert ? 'Fatigued!' : 'Alert'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center font-sans text-xs py-3 text-amber-600 bg-amber-50 rounded-lg p-2">
                  No registered driver associated yet.
                </div>
              )}

              {/* Shipment Manifest card */}
              {activeShipment ? (
                <div className="border border-slate-100 p-3 rounded-lg bg-emerald-50/50">
                  <span className="block font-sans text-[9px] font-bold text-emerald-600 uppercase tracking-widest mb-1">
                    Cargo Manifest
                  </span>
                  <div className="font-mono text-[10px] font-bold text-slate-700 mb-1">{activeShipment.tracking_number}</div>
                  <div className="font-sans text-[11px] text-slate-600 line-clamp-2">{activeShipment.package_details}</div>
                  <div className="font-sans text-[10px] font-bold text-emerald-700 mt-2">
                     → Delivery Target: {activeShipment.receiver_name}
                  </div>
                </div>
              ) : (
                <div className="p-3 text-center text-xs text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                  No active shipment currently assigned on this trailer wheel.
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <Truck className="h-8 w-8 text-slate-350" />
              <p className="font-sans text-xs text-center leading-normal px-4">
                Verify asset status by clicking any moving marker on the express highway grid.
              </p>
            </div>
          )}
        </div>

        {/* Footer actions helper */}
        <div className="border-t border-slate-100 pt-3 mt-4 text-center">
          <span className="font-mono text-[10px] text-slate-400">
             NEXUS SIMULATOR TELEMETRY V1.0
          </span>
        </div>
      </div>
    </div>
  );
}
