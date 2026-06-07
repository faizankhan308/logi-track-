import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  MapPin, 
  Truck, 
  Clock, 
  Sparkles, 
  HelpCircle, 
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  User,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Shipment, Driver, Vehicle } from '../types/logistics';
import { apiRequest } from '../utils/api';

interface ShipmentsProps {
  shipments: Shipment[];
  drivers: Driver[];
  vehicles: Vehicle[];
  onAssignDriver: (shipmentId: string, driverId: string) => Promise<any>;
  onCreateShipment: (payload: any) => Promise<any>;
  onRefreshShipments: () => void;
  currentUser: any;
}

export default function Shipments({
  shipments,
  drivers,
  vehicles,
  onAssignDriver,
  onCreateShipment,
  onRefreshShipments,
  currentUser
}: ShipmentsProps) {
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  
  // Create Shipment form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [senderAddress, setSenderAddress] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');
  const [pkgDetails, setPkgDetails] = useState('');

  // AI Prediction loading
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiPreviewMetrics, setAiPreviewMetrics] = useState<{
    shortest_distance: number;
    est_time: number;
    fuel_consumption: number;
    delay_prediction: "Low" | "Medium" | "High";
    ai_rationalization: string;
  } | null>(null);

  // Driver assign selector
  const [driverAssignId, setDriverAssignId] = useState('');

  const fetchAiRoutingPreview = async () => {
    if (!senderAddress || !receiverAddress) {
      alert('Must fill out both pickup location and delivery location before planning with AI.');
      return;
    }
    setIsAiLoading(true);
    setAiPreviewMetrics(null);
    try {
      // POST mock package to trigger route prediction
      const res = await apiRequest('/api/shipments', {
        method: 'POST',
        body: JSON.stringify({
          sender_name: senderName || 'Industrial Source',
          sender_address: senderAddress,
          receiver_name: receiverName || 'Target Depot',
          receiver_address: receiverAddress,
          package_details: pkgDetails || 'Standard Freight Box'
        })
      });
      setAiPreviewMetrics(res.metrics);
      onRefreshShipments(); // refresh to load the newly formulated shipment details
      alert('AI-Engine successfully compiled transit metrics, etas, and fuel averages!');
    } catch (e: any) {
      alert(`AI error: ${e.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCreateManifestDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !senderAddress.trim() || !receiverName.trim() || !receiverAddress.trim()) {
      alert('Please fill out mandatory shipping fields.');
      return;
    }

    try {
      setIsAiLoading(true);
      const res = await apiRequest('/api/shipments', {
        method: 'POST',
        body: JSON.stringify({
          sender_name: senderName,
          sender_address: senderAddress,
          receiver_name: receiverName,
          receiver_address: receiverAddress,
          package_details: pkgDetails || 'General Freight Loading'
        })
      });
      
      // select the item
      setSelectedShipment(res.shipment);
      
      // reset form
      setSenderName('');
      setSenderAddress('');
      setReceiverName('');
      setReceiverAddress('');
      setPkgDetails('');
      setAiPreviewMetrics(null);
      setShowAddForm(false);
      onRefreshShipments();
      alert(`Shipment logged successfully! Tracking Registered: ${res.shipment.tracking_number}`);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment || !driverAssignId) return;

    try {
      await onAssignDriver(selectedShipment.id, driverAssignId);
      setDriverAssignId('');
      onRefreshShipments();
      // Update local inspect state
      const updated = shipments.find(s => s.id === selectedShipment.id);
      if (updated) setSelectedShipment(updated);
      alert('Driver assigned. Dispatch status updated to IN TRANSIT.');
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Filter possible drivers (drivers who have vehicles assigned and are NOT active driving already)
  const availableDrivers = drivers.filter(d => 
    d.assigned_vehicle_id !== null && d.status !== 'active'
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 h-full bg-slate-50 overflow-y-auto">
      
      {/* LEFT COLUMN: Shipping list logs */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 overflow-hidden flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="font-sans text-xl font-bold text-slate-800">
                Shipment Manifest Register ({shipments.length})
              </h3>
              <p className="font-sans text-xs text-slate-505">
                Register sender and receiver coordinates, assign delivery pilots, and inspect status timelines.
              </p>
            </div>
            {currentUser?.role !== 'customer' && (
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1 bg-blue-600 text-white font-sans text-xs font-bold px-3 py-2 rounded-lg hover:bg-blue-500 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Create Shipment</span>
              </button>
            )}
          </div>

          {/* Add form with AI preplanning capabilities */}
          {showAddForm && (
            <form onSubmit={handleCreateManifestDirect} className="bg-slate-55 border border-slate-200 p-4 rounded-xl mb-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-sans text-xs font-extrabold text-blue-700 uppercase tracking-widest">
                  Log New Logistics Consignment (AI Assisted Routing)
                </h4>
                <button
                  type="button"
                  onClick={fetchAiRoutingPreview}
                  disabled={isAiLoading || !senderAddress || !receiverAddress}
                  className="flex items-center gap-1 bg-gradient-to-r from-cyan-600 to-blue-550 text-white font-sans text-[10.5px] font-bold px-3 py-1 rounded shadow hover:opacity-95 disabled:opacity-40 cursor-pointer"
                  title="Request router preview using Gemini models"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>{isAiLoading ? 'Analyzing...' : 'Fetch AI Routing Preview'}</span>
                </button>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <span className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
                    Pickup Sender File
                  </span>
                  <div>
                    <label className="block font-mono text-[9px] text-slate-400 uppercase font-bold mb-1">Sender Entity / Name</label>
                    <input
                      type="text" required value={senderName} onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Apex Manufacturing Lab"
                      className="w-full text-xs font-sans text-slate-800 bg-white border border-slate-300 rounded p-1.5 focus:outline-none focus:ring-1"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[9px] text-slate-400 uppercase font-bold mb-1">Pickup Address / Terminal Location</label>
                    <input
                      type="text" required value={senderAddress} onChange={(e) => setSenderAddress(e.target.value)}
                      placeholder="Boston, MA"
                      className="w-full text-xs font-sans text-slate-800 bg-white border border-slate-300 rounded p-1.5 focus:outline-none focus:ring-1"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
                    Destination Consignee File
                  </span>
                  <div>
                    <label className="block font-mono text-[9px] text-slate-400 uppercase font-bold mb-1">Receiver Person / Name</label>
                    <input
                      type="text" required value={receiverName} onChange={(e) => setReceiverName(e.target.value)}
                      placeholder="Gotham Logistics Hub NYC"
                      className="w-full text-xs font-sans text-slate-800 bg-white border border-slate-300 rounded p-1.5 focus:outline-none focus:ring-1"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[9px] text-slate-400 uppercase font-bold mb-1">Delivery Target Address</label>
                    <input
                      type="text" required value={receiverAddress} onChange={(e) => setReceiverAddress(e.target.value)}
                      placeholder="New York, NY"
                      className="w-full text-xs font-sans text-slate-800 bg-white border border-slate-300 rounded p-1.5 focus:outline-none focus:ring-1"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block font-mono text-[9px] text-slate-400 uppercase font-bold mb-1">Package dimensions, hazardous warnings, or refrigeration details</label>
                  <input
                    type="text" value={pkgDetails} onChange={(e) => setPkgDetails(e.target.value)}
                    placeholder="Fragile, Temp-Controlled vaccines or standard 20 Pallets..."
                    className="w-full text-xs font-sans text-slate-800 bg-white border border-slate-300 rounded p-2 focus:outline-none focus:ring-1"
                  />
                </div>
              </div>

              {/* Render AI Preview indices if calculated */}
              {aiPreviewMetrics && (
                <div className="p-3 border border-cyan-100 bg-cyan-50/50 rounded-xl space-y-2 text-xs font-sans">
                  <span className="font-extrabold text-cyan-850 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-cyan-600 animate-pulse" />
                    <span>Gemini Route Optimization Projection</span>
                  </span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-slate-650 font-semibold text-[11px]">
                    <div>Est Distance: <span className="font-bold text-slate-850">{aiPreviewMetrics.shortest_distance} mi</span></div>
                    <div>Est Time (ETA): <span className="font-bold text-slate-850">{(aiPreviewMetrics.est_time / 60).toFixed(1)} hours</span></div>
                    <div>Est Fuel: <span className="font-bold text-slate-850">{aiPreviewMetrics.fuel_consumption} gals</span></div>
                    <div>Delay Risk: <span className={`font-bold px-1 rounded ${
                      aiPreviewMetrics.delay_prediction === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-110 text-emerald-800'
                    }`}>{aiPreviewMetrics.delay_prediction}</span></div>
                  </div>
                  <p className="text-[10.5px] leading-relaxed italic text-slate-500 bg-white p-2 border border-slate-100 rounded">
                    {aiPreviewMetrics.ai_rationalization}
                  </p>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setAiPreviewMetrics(null);
                  }}
                  className="font-sans text-xs font-semibold text-slate-505 px-3 py-1.5 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="font-sans text-xs font-bold text-white bg-blue-600 px-4 py-1.5 rounded hover:bg-blue-500 transition cursor-pointer"
                >
                  Generate Shipment Manifest
                </button>
              </div>
            </form>
          )}

          {/* List dispatches */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {shipments.map((s) => {
              const worksDriver = drivers.find(d => d.id === s.assigned_driver_id);
              const isSelected = selectedShipment?.id === s.id;

              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedShipment(s)}
                  className={`p-4 border rounded-xl text-left cursor-pointer transition ${
                    isSelected 
                      ? 'border-blue-600 bg-blue-50/25 shadow-md' 
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/40'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-xs font-extrabold text-slate-900">{s.tracking_number}</span>
                    <span className={`font-sans text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      s.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                      s.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                      s.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-cyan-100 text-cyan-800'
                    }`}>
                      {s.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 block font-sans text-xs text-slate-600 mb-3 leading-relaxed">
                    <div>Pickup: <span className="font-semibold text-slate-800">{s.sender_name}</span></div>
                    <div>Receiver: <span className="font-semibold text-slate-800">{s.receiver_name}</span></div>
                    <div>ETA Target: <span className="font-mono font-bold text-slate-700">{s.estimated_eta}</span></div>
                    <div>Dispatcher: <span className="font-bold text-blue-600">{worksDriver ? worksDriver.name : 'Unassigned'}</span></div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-100">
                    <span>{s.history.length} checkpoint markers</span>
                    <span className="text-blue-600 hover:underline">Inspect timeline map →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-slate-100 pt-3 mt-4 text-[10px] font-mono text-slate-400">
          * Automatic checkpoints logged instantly upon each node travel step.
        </div>
      </div>

      {/* RIGHT COLUMN: Shipment timeline history & Dispatch assigns */}
      <div className="w-full lg:w-96 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col justify-between shrink-0">
        <div>
          {selectedShipment ? (
            <div className="space-y-6">
              {/* Manifest summary */}
              <div className="border-b border-slate-100 pb-3">
                <span className="font-sans text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-1">
                  Active Timed Manifest
                </span>
                <h4 className="font-sans text-base font-black text-slate-800 mb-1">
                  {selectedShipment.tracking_number}
                </h4>
                <p className="font-sans text-[11px] text-slate-500 leading-normal">
                  Cargo: {selectedShipment.package_details}
                </p>
              </div>

              {/* Driver Assign form if pending */}
              {selectedShipment.status === 'pending' && currentUser?.role !== 'customer' && (
                <div className="border border-amber-150 p-4 rounded-xl bg-amber-50/40 space-y-3">
                  <span className="font-sans text-[10px] font-extrabold text-amber-700 uppercase tracking-wider block">
                    Assign Driver & Start Transit
                  </span>
                  
                  {availableDrivers.length === 0 ? (
                    <div className="text-xs font-sans text-amber-800 leading-relaxed">
                      ⚠️ No standby drivers with registered vehicles are available. Assign standby vehicles first in the <b>Drivers</b> panel.
                    </div>
                  ) : (
                    <form onSubmit={handleAssignSubmit} className="space-y-2">
                      <select
                        required
                        value={driverAssignId}
                        onChange={(e) => setDriverAssignId(e.target.value)}
                        className="w-full text-xs font-sans text-slate-800 bg-white border border-slate-300 rounded p-1.5 focus:outline-none"
                      >
                        <option value="">Select available pilot...</option>
                        {availableDrivers.map(d => {
                          const v = vehicles.find(veh => veh.id === d.assigned_vehicle_id);
                          return (
                            <option key={d.id} value={d.id}>
                              {d.name} (Tractor: {v?.vehicle_number || 'None'})
                            </option>
                          );
                        })}
                      </select>
                      <button
                        type="submit"
                        className="w-full bg-amber-600 text-white font-sans text-xs font-bold py-1.5 rounded hover:bg-amber-550 transition cursor-pointer"
                      >
                        Authorize Dispatch Transit
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Timeline list */}
              <div className="space-y-4">
                <span className="font-sans text-[10px] font-bold text-slate-450 uppercase block border-b border-slate-100 pb-1">
                  Secure Delivery History Timeline
                </span>
                
                <div className="relative pl-4 space-y-4 border-l border-slate-200">
                  {selectedShipment.history.map((hist, idx) => (
                    <div key={idx} className="relative text-xs leading-relaxed">
                      {/* circle */}
                      <span className="absolute -left-[20.5px] top-1.5 h-2 w-2 rounded-full bg-blue-600 border border-white" />
                      
                      <div className="font-mono text-[9px] text-slate-400 font-bold mb-0.5">
                        {new Date(hist.timestamp).toLocaleString()}
                      </div>
                      <div className="font-sans font-bold text-slate-700">
                        {hist.location} — <span className="capitalize">{hist.status.replace('_', ' ')}</span>
                      </div>
                      <p className="font-sans text-[10.5px] text-slate-550">
                        {hist.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2 h-72">
              <FileText className="h-10 w-10 text-slate-300" />
              <p className="font-sans text-xs text-center px-4">
                Select a shipment registration ledger left to review transit timeline states, estimate fuel routing, or dispatch standby pilots.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 pt-4 text-center">
          <span className="font-mono text-[10px] text-slate-400">
            Nexus Logistics Shipping Gate
          </span>
        </div>
      </div>
    </div>
  );
}
