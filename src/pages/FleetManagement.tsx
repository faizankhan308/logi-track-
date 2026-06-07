import React, { useState } from 'react';
import { 
  Building2, 
  Truck, 
  Plus, 
  Trash2, 
  Edit3, 
  FileSpreadsheet, 
  Settings, 
  ShieldCheck, 
  Clock, 
  Wrench, 
  DollarSign, 
  UserMinus 
} from 'lucide-react';
import { Vehicle, MaintenanceRecord, VehicleType } from '../types/logistics';

interface FleetManagementProps {
  vehicles: Vehicle[];
  onCreateVehicle: (payload: any) => Promise<any>;
  onUpdateVehicle: (id: string, payload: any) => Promise<any>;
  onDeleteVehicle: (id: string) => Promise<any>;
}

export default function FleetManagement({
  vehicles,
  onCreateVehicle,
  onUpdateVehicle,
  onDeleteVehicle
}: FleetManagementProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  // Create Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNum, setNewNum] = useState('');
  const [newType, setNewType] = useState<VehicleType>('Semi-Truck');
  const [newCap, setNewCap] = useState('');
  const [newFuelType, setNewFuelType] = useState<'Diesel' | 'Electric' | 'Hybrid'>('Diesel');
  const [newFuelLvl, setNewFuelLvl] = useState(100);

  // Edit / Modulating Status State
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<any>('available');

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNum.trim() || !newCap.trim()) {
      alert('Please fill out all mandatory register parameters.');
      return;
    }
    try {
      await onCreateVehicle({
        vehicle_number: newNum.trim(),
        vehicle_type: newType,
        capacity: newCap.trim(),
        fuel_type: newFuelType,
        fuel_level: Math.min(100, Math.max(0, Number(newFuelLvl)))
      });
      // Reset
      setNewNum('');
      setNewCap('');
      setShowAddForm(false);
      alert('New delivery truck successfully registered into fleet databases.');
    } catch (e: any) {
      alert(`Fault during asset logging: ${e.message}`);
    }
  };

  const handleStatusChange = async (id: string, status: any) => {
    try {
      await onUpdateVehicle(id, { status });
      // Update local state if selected
      if (selectedVehicle && selectedVehicle.id === id) {
        setSelectedVehicle({ ...selectedVehicle, status });
      }
      alert(`Asset status successfully updated to ${status}.`);
    } catch (e: any) {
      alert(`Error updating truck: ${e.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you absolutely sure you want to decommission and delete this logistics unit? This wipes active coordinates.')) return;
    try {
      await onDeleteVehicle(id);
      setSelectedVehicle(null);
      alert('Asset removed from database.');
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 h-full bg-slate-50 overflow-y-auto">
      
      {/* LEFT COLUMN: Vehicle Fleet Units list with Filters */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 overflow-hidden flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="font-sans text-xl font-bold text-slate-800">
                Registered Motor Assets ({vehicles.length})
              </h3>
              <p className="font-sans text-xs text-slate-500">
                Primary registry for semi-trucks, delivery trailers, and reefer vehicles.
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1 bg-blue-600 text-white font-sans text-xs font-bold px-3 py-2 rounded-lg hover:bg-blue-500 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Register Unit</span>
            </button>
          </div>

          {/* Add Form Dropdown */}
          {showAddForm && (
            <form onSubmit={handleAddSubmit} className="bg-slate-55 border border-slate-200 p-4 rounded-xl mb-6 space-y-4 shadow-inner">
              <h4 className="font-sans text-xs font-extrabold text-blue-700 uppercase tracking-widest">
                Log New Cargo Vehicle Manifest
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[9px] text-slate-400 uppercase font-bold mb-1">
                    License Registration ID * (e.g. TX-4521-TR)
                  </label>
                  <input
                    type="text"
                    required
                    value={newNum}
                    onChange={(e) => setNewNum(e.target.value)}
                    placeholder="TX-7842-TR"
                    className="w-full text-xs font-sans text-slate-800 bg-white border border-slate-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[9px] text-slate-400 uppercase font-bold mb-1">
                    Asset Class / Frame Format
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as VehicleType)}
                    className="w-full text-xs font-sans text-slate-800 bg-white border border-slate-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Semi-Truck">Semi-Truck (Class A)</option>
                    <option value="Box Truck">Box Truck (Class B)</option>
                    <option value="Delivery Van">Delivery Van</option>
                    <option value="Electric Sprinter">Electric Sprinter</option>
                    <option value="Reefer Truck">Reefer Truck (Temp Temp)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[9px] text-slate-400 uppercase font-bold mb-1">
                    Hold Capacity Limits * (e.g. 24,000 lbs)
                  </label>
                  <input
                    type="text"
                    required
                    value={newCap}
                    onChange={(e) => setNewCap(e.target.value)}
                    placeholder="12,500 lbs"
                    className="w-full text-xs font-sans text-slate-800 bg-white border border-slate-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[9px] text-slate-400 uppercase font-bold mb-1">
                    Propulsion Train Mechanics
                  </label>
                  <select
                    value={newFuelType}
                    onChange={(e) => setNewFuelType(e.target.value as any)}
                    className="w-full text-xs font-sans text-slate-800 bg-white border border-slate-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Diesel">Heavy Diesel Engine</option>
                    <option value="Hybrid">Gasoline Hybrid Electric</option>
                    <option value="Electric">Sustainable Pure Battery</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="font-sans text-xs font-semibold text-slate-500 px-3 py-1.5 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="font-sans text-xs font-bold text-white bg-blue-600 px-4 py-1.5 rounded hover:bg-blue-500 transition cursor-pointer"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          )}

          {/* Vehicle Grid lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
            {vehicles.map((v) => {
              const mrCount = v.maintenance_records.length;
              const isSelected = selectedVehicle?.id === v.id;
              
              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedVehicle(v)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition ${
                    isSelected 
                      ? 'border-blue-600 bg-blue-50/20 shadow-md shadow-blue-50/10' 
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/40 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Truck className={`h-4 w-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span className="font-mono text-xs font-bold text-slate-800">{v.vehicle_number}</span>
                    </div>
                    {/* Status Badge */}
                    <span className={`font-sans text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      v.status === 'available' ? 'bg-emerald-100 text-emerald-800' :
                      v.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                      v.status === 'maintenance' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {v.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-1 block font-sans text-xs text-slate-600 mb-3">
                    <div>Class: <span className="font-bold text-slate-700">{v.vehicle_type}</span></div>
                    <div>Hold Volume: <span className="font-semibold">{v.capacity}</span></div>
                    <div>Engine: <span className="font-semibold">{v.fuel_type} ({v.fuel_level}%)</span></div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-100">
                    <span>{mrCount} logs</span>
                    <span className="text-blue-600 hover:underline">Inspect telemetry →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-slate-100 pt-3 mt-4 text-[10px] font-mono text-slate-400">
          * Unit safety tests automatically log into registry upon custom updates.
        </div>
      </div>

      {/* RIGHT COLUMN: Nested expanded details inspector */}
      <div className="w-full lg:w-96 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col justify-between shrink-0">
        <div>
          {selectedVehicle ? (
            <div className="space-y-6">
              {/* Header details */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="font-sans text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-1">
                      REGISTRY UNIT DOSSIER
                    </span>
                    <h4 className="font-sans text-base font-black text-slate-800">
                      Trailer Unit: {selectedVehicle.vehicle_number}
                    </h4>
                  </div>
                  <button
                    onClick={() => handleDelete(selectedVehicle.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                    title="Remove registered vehicle"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Modify State directly Form */}
              <div className="space-y-3">
                <span className="font-sans text-[10px] font-bold text-slate-450 uppercase block">
                  Modulate Operational Deploy status
                </span>
                <div className="flex gap-1">
                  {['available', 'maintenance', 'offline'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(selectedVehicle.id, st)}
                      className={`flex-1 py-1 px-1.5 rounded font-sans text-[10px] font-bold border transition capitalize ${
                        selectedVehicle.status === st
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                      disabled={selectedVehicle.status === 'in_transit'}
                      title={selectedVehicle.status === 'in_transit' ? 'In transit vehicles cannot be modulated until arrival.' : ''}
                    >
                      {st}
                    </button>
                  ))}
                </div>
                {selectedVehicle.status === 'in_transit' && (
                  <span className="block text-[10px] text-amber-600 bg-amber-50 rounded p-1.5 text-center font-sans">
                     Active trip locks state updates (In Transit).
                  </span>
                )}
              </div>

              {/* Maintenance list */}
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <Wrench className="h-3.5 w-3.5 text-amber-600" />
                    <span className="font-sans text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                      Maintenance Logs ({selectedVehicle.maintenance_records.length})
                    </span>
                  </div>
                </div>

                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {selectedVehicle.maintenance_records.length === 0 ? (
                    <p className="font-sans text-xs text-slate-400 text-center py-4 bg-slate-50 rounded">
                      No maintenance events recorded.
                    </p>
                  ) : (
                    selectedVehicle.maintenance_records.map((rec) => (
                      <div key={rec.id} className="p-2.5 bg-slate-50 border border-slate-150 rounded text-xs leading-relaxed space-y-1">
                        <div className="flex justify-between font-mono text-[9px] text-slate-400 font-bold">
                          <span>{rec.date}</span>
                          <span className="text-emerald-700">${rec.cost}</span>
                        </div>
                        <div className="font-sans font-bold text-slate-705 capitalize">
                          {rec.type}
                        </div>
                        <p className="font-sans text-slate-500 font-medium text-[11px]">
                          {rec.description}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2 h-72">
              <Truck className="h-10 w-10 text-slate-300" />
              <p className="font-sans text-xs text-center px-4">
                Select an active trailer code left to inspect registration details, fuel indices, or append historical maintenance logs.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 pt-4 text-center">
          <span className="font-mono text-[10px] text-slate-400">
            Nexus Logistics Fleet Control Hub
          </span>
        </div>
      </div>
    </div>
  );
}
