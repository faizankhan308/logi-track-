import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  ShieldAlert, 
  BrainCircuit, 
  Star, 
  Clock, 
  CheckCircle, 
  Sparkles,
  Phone,
  Grid
} from 'lucide-react';
import { Driver, Vehicle } from '../types/logistics';
import { apiRequest } from '../utils/api';

interface DriversProps {
  drivers: Driver[];
  vehicles: Vehicle[];
  onCreateDriver: (payload: any) => Promise<any>;
  onDeleteDriver: (id: string) => Promise<any>;
  onRefreshDrivers: () => void;
}

export default function Drivers({
  drivers,
  vehicles,
  onCreateDriver,
  onDeleteDriver,
  onRefreshDrivers
}: DriversProps) {
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  // New Profile Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newLicense, setNewLicense] = useState('');
  const [newVeh, setNewVeh] = useState('');

  // AI Fatigue Checker States
  const [shiftHours, setShiftHours] = useState(6);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<{
    fatigue_index: number;
    requires_rest: boolean;
    ai_recommendation: string;
  } | null>(null);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim() || !newLicense.trim()) {
      alert('Please fill out all mandatory driver parameters.');
      return;
    }
    try {
      await onCreateDriver({
        name: newName.trim(),
        phone: newPhone.trim(),
        license_number: newLicense.trim(),
        assigned_vehicle_id: newVeh || null
      });
      setNewName('');
      setNewPhone('');
      setNewLicense('');
      setNewVeh('');
      setShowAddForm(false);
      alert('New delivery pilot successfully logged.');
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleTriggerFatigueScan = async () => {
    if (!selectedDriver) return;
    setIsAnalyzing(true);
    setAiResult(null);
    try {
      const res = await apiRequest(`/api/drivers/${selectedDriver.id}/analyze-fatigue`, {
        method: 'POST',
        body: JSON.stringify({ hours_driven: shiftHours })
      });
      setAiResult(res);
      onRefreshDrivers(); // refresh to update fatigue flag locally
      // Update selected driver locally as well
      setSelectedDriver(prev => prev ? { ...prev, fatigue_alert: res.requires_rest } : null);
    } catch (err: any) {
      alert(`AI Evaluation error: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you absolutely certain you want to discharge this driver from logistics duties?')) return;
    try {
      await onDeleteDriver(id);
      setSelectedDriver(null);
      alert('Driver removed from active dispatch pool.');
    } catch (e: any) {
      alert(e.message);
    }
  };

  const availableVehicles = vehicles.filter(v => 
    v.status === 'available' && !drivers.some(d => d.assigned_vehicle_id === v.id)
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 h-full bg-slate-50 overflow-y-auto">
      
      {/* LEFT COLUMN: Driver profiles list */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 overflow-hidden flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="font-sans text-xl font-bold text-slate-800">
                Dispatch Personnel Registry ({drivers.length})
              </h3>
              <p className="font-sans text-xs text-slate-500">
                Fleet driver tracking profile index. Inspect license codes, performance scores, or fatigue alerts.
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1 bg-blue-600 text-white font-sans text-xs font-bold px-3 py-2 rounded-lg hover:bg-blue-500 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Register Driver</span>
            </button>
          </div>

          {/* Add form */}
          {showAddForm && (
            <form onSubmit={handleAddSubmit} className="bg-slate-55 border border-slate-200 p-4 rounded-xl mb-6 space-y-4">
              <h4 className="font-sans text-xs font-extrabold text-blue-700 uppercase tracking-wider">
                Recruit Delivery Operator profile
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[9px] text-slate-400 uppercase font-bold mb-1">
                    Pilot Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter dispatch name"
                    className="w-full text-xs font-sans text-slate-800 bg-white border border-slate-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[9px] text-slate-400 uppercase font-bold mb-1">
                    Mobile Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full text-xs font-sans text-slate-800 bg-white border border-slate-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[9px] text-slate-400 uppercase font-bold mb-1">
                    Commercial Driver License * #
                  </label>
                  <input
                    type="text"
                    required
                    value={newLicense}
                    onChange={(e) => setNewLicense(e.target.value)}
                    placeholder="DL-8832014"
                    className="w-full text-xs font-sans text-slate-800 bg-white border border-slate-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[9px] text-slate-400 uppercase font-bold mb-1">
                    Link Unassigned Vehicle
                  </label>
                  <select
                    value={newVeh}
                    onChange={(e) => setNewVeh(e.target.value)}
                    className="w-full text-xs font-sans text-slate-800 bg-white border border-slate-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Keep Pool Standby (No Vehicle)</option>
                    {availableVehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.vehicle_number} — {v.vehicle_type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="font-sans text-xs font-semibold text-slate-505 px-3 py-1.5 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="font-sans text-xs font-bold text-white bg-blue-600 px-4 py-1.5 rounded hover:bg-blue-500 transition cursor-pointer"
                >
                  Authorize Operator
                </button>
              </div>
            </form>
          )}

          {/* Grid lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
            {drivers.map((d) => {
              const assignedVeh = vehicles.find(v => v.id === d.assigned_vehicle_id);
              const isSelected = selectedDriver?.id === d.id;
              
              return (
                <div
                  key={d.id}
                  onClick={() => {
                    setSelectedDriver(d);
                    setAiResult(null); // clear old calculations
                  }}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition relative ${
                    isSelected 
                      ? 'border-blue-600 bg-blue-50/20 shadow-md' 
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                  }`}
                >
                  {d.fatigue_alert && (
                    <span className="absolute top-2 right-2 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                  )}

                  <div className="font-sans text-sm font-bold text-slate-800 mb-1">{d.name}</div>
                  
                  <div className="space-y-1 block font-sans text-[11.5px] text-slate-600 mb-3">
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3 w-3 text-slate-400" />
                      <span>{d.phone}</span>
                    </div>
                    <div>License CDL: <span className="font-mono text-xs font-semibold text-slate-700">{d.license_number}</span></div>
                    <div>Unit Truck: <span className="font-bold text-slate-800">{assignedVeh ? assignedVeh.vehicle_number : 'Standby Pool'}</span></div>
                  </div>

                  {/* Badges footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 font-sans text-[10px]">
                    <span className="flex items-center gap-1 text-yellow-600 font-bold">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      <span>{d.rating.toFixed(1)} rating</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded uppercase font-bold text-[9px] ${
                      d.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-slate-150 text-slate-600'
                    }`}>
                      {d.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-slate-100 pt-3 mt-4 text-[10px] font-mono text-slate-400">
          * Fleet operators manage driver off-duty periods strictly via fatigue scores.
        </div>
      </div>

      {/* RIGHT COLUMN: AI Fatigue calculations and Inspector */}
      <div className="w-full lg:w-96 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col justify-between shrink-0">
        <div>
          {selectedDriver ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="border-b border-slate-100 pb-4 flex justify-between items-start gap-2">
                <div>
                  <span className="font-sans text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-1">
                    operator telemetry files
                  </span>
                  <h4 className="font-sans text-base font-black text-slate-800">
                    {selectedDriver.name}
                  </h4>
                </div>
                <button
                  onClick={() => handleDelete(selectedDriver.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                  title="Wipe operator profile"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Bio Grid */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 space-y-2 text-xs font-sans text-slate-600">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-450">Dispatcher Rank Rating:</span>
                  <span className="font-bold text-slate-800">{selectedDriver.rating} / 5.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-450">Active Drive Score:</span>
                  <span className="font-bold text-blue-600">{selectedDriver.performance_score} / 100</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-450">Status:</span>
                  <span className="font-bold capitalize text-slate-800">{selectedDriver.status}</span>
                </div>
              </div>

              {/* Interactive AI fatigue predictor */}
              <div className="border-t border-slate-105 pt-4 space-y-4">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-blue-600 animate-pulse" />
                  <span className="font-sans text-xs font-black text-slate-800 uppercase tracking-wide">
                    Gemini AI Fatigue analysis
                  </span>
                </div>
                
                <p className="font-sans text-[11px] text-slate-500 leading-normal">
                  Toggle active steering hours on the current driver shift below to query AI and evaluate sleep hazard margins, risk index, and load limitations.
                </p>

                {/* Slider */}
                <div>
                  <div className="flex justify-between text-xs font-semibold font-sans mb-1.5">
                    <span className="text-slate-600">Active Shift Hours:</span>
                    <span className="text-blue-600 font-bold">{shiftHours} hours</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="0.5"
                    value={shiftHours}
                    onChange={(e) => setShiftHours(Number(e.target.value))}
                    className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between font-mono text-[9px] text-slate-400 mt-1">
                    <span>1h (Short Run)</span>
                    <span>8h (Standard Leg)</span>
                    <span>15h (Excess)</span>
                  </div>
                </div>

                {/* Diagnose trigger button */}
                <button
                  type="button"
                  onClick={handleTriggerFatigueScan}
                  disabled={isAnalyzing}
                  className="w-full bg-blue-600 hover:bg-blue-500 font-sans text-xs font-bold py-2 rounded-lg text-white font-semibold transition shadow disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <BrainCircuit className="h-4 w-4" />
                  <span>{isAnalyzing ? 'Calculating AI Vital Vitals...' : 'Compute AI Fatigue Indices'}</span>
                </button>

                {/* Results Screen */}
                {aiResult && (
                  <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 space-y-3 animate-fade-in text-xs font-sans">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-850">AI Fatigue Index:</span>
                      <span className={`font-mono font-black text-sm px-2 py-0.5 rounded ${
                        aiResult.fatigue_index > 65 ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {aiResult.fatigue_index}%
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-bold text-slate-700">Recommended Rest:</span>
                      <span className={`font-bold px-2 py-0.5 rounded ${
                        aiResult.requires_rest ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {aiResult.requires_rest ? 'MANDATORY REST' : 'STREET CLEAR'}
                      </span>
                    </div>

                    <div className="text-[11px] leading-relaxed text-slate-600 bg-white/85 p-2.5 rounded border border-blue-50/30">
                      <span className="font-bold text-blue-700 block mb-1">AI Recommendation:</span>
                      {aiResult.ai_recommendation}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2 h-72">
              <Users className="h-10 w-10 text-slate-300" />
              <p className="font-sans text-xs text-center px-4">
                Select an active truck driver on the left to review contact metrics, assign tractors, and diagnose fatigue indicators utilizing Gemini neural engines.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 pt-4 text-center">
          <span className="font-mono text-[10px] text-slate-450">
            Nexus Logistics Neural Dispatch
          </span>
        </div>
      </div>
    </div>
  );
}
