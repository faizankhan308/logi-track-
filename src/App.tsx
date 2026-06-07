import React, { useState, useEffect } from 'react';
import { apiRequest } from './utils/api';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LiveRouteMap from './components/LiveRouteMap';
import Dashboard from './pages/Dashboard';
import FleetManagement from './pages/FleetManagement';
import Drivers from './pages/Drivers';
import Shipments from './pages/Shipments';
import Analytics from './pages/Analytics';
import { User, Vehicle, Driver, Shipment, VehicleLocation, SystemNotification } from './types/logistics';
import { Truck, Layers, Lock, KeyRound, Radio } from 'lucide-react';

export default function App() {
  // Authentication states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authEmail, setAuthEmail] = useState('admin@logistics.com');
  const [authPassword, setAuthPassword] = useState('password123');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Application states
  const [activeTab, setActiveTab] = useState('dashboard');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [locations, setLocations] = useState<Record<string, VehicleLocation>>({});
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [appLoading, setAppLoading] = useState(true);

  // Check login on startup
  useEffect(() => {
    const savedToken = localStorage.getItem('logistics_token');
    if (savedToken) {
      apiRequest('/api/auth/me')
        .then(user => {
          setCurrentUser(user);
          loadAppData();
        })
        .catch(() => {
          localStorage.removeItem('logistics_token');
          setAppLoading(false);
        });
    } else {
      setAppLoading(false);
    }
  }, []);

  // Periodic polling to draw active simulation parameters smoothly (replaces heavy websockets with direct REST frames!)
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      // Refresh locations and notifications
      apiRequest('/api/tracking/locations').then(setLocations).catch(console.error);
      apiRequest('/api/notifications').then(setNotifications).catch(console.error);
      apiRequest('/api/shipments').then(setShipments).catch(console.error);
      apiRequest('/api/analytics').then(setAnalyticsData).catch(console.error);
    }, 12000); // Poll every 12 seconds
    return () => clearInterval(interval);
  }, [currentUser]);

  const loadAppData = async () => {
    try {
      setAppLoading(true);
      const [vList, dList, sList, locList, notifList, statData] = await Promise.all([
        apiRequest('/api/vehicles'),
        apiRequest('/api/drivers'),
        apiRequest('/api/shipments'),
        apiRequest('/api/tracking/locations'),
        apiRequest('/api/notifications'),
        apiRequest('/api/analytics')
      ]);

      setVehicles(vList);
      setDrivers(dList);
      setShipments(sList);
      setLocations(locList);
      setNotifications(notifList);
      setAnalyticsData(statData);
    } catch (e) {
      console.error('Failure initializing data registries:', e);
    } finally {
      setAppLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });
      localStorage.setItem('logistics_token', res.token);
      setCurrentUser(res.user);
      await loadAppData();
    } catch (err: any) {
      setAuthError(err.message || 'Invalid credentials');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('logistics_token');
    setCurrentUser(null);
    setVehicles([]);
    setDrivers([]);
    setShipments([]);
    setLocations({});
    setNotifications([]);
    setAnalyticsData(null);
  };

  // Step vehicle position directly
  const handleTriggerTick = async () => {
    setIsSimulating(true);
    try {
      const res = await apiRequest('/api/tracking/simulate-tick', { method: 'POST' });
      setLocations(res.positions);
      // Immediately reload shipments & stats
      const [sList, notifList, statData] = await Promise.all([
        apiRequest('/api/shipments'),
        apiRequest('/api/notifications'),
        apiRequest('/api/analytics')
      ]);
      setShipments(sList);
      setNotifications(notifList);
      setAnalyticsData(statData);
    } catch (e: any) {
      console.error(e.message);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleMarkNotificationsRead = async () => {
    try {
      await apiRequest('/api/notifications/read-all', { method: 'PUT' });
      const notifList = await apiRequest('/api/notifications');
      setNotifications(notifList);
    } catch (e) {
      console.error(e);
    }
  };

  // CREATE VEHICLE
  const handleCreateVehicle = async (payload: any) => {
    const res = await apiRequest('/api/vehicles', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    const vList = await apiRequest('/api/vehicles');
    setVehicles(vList);
    return res;
  };

  // UPDATE VEHICLE
  const handleUpdateVehicle = async (id: string, payload: any) => {
    const res = await apiRequest(`/api/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    const vList = await apiRequest('/api/vehicles');
    setVehicles(vList);
    return res;
  };

  // DELETE VEHICLE
  const handleDeleteVehicle = async (id: string) => {
    const res = await apiRequest(`/api/vehicles/${id}`, { method: 'DELETE' });
    const vList = await apiRequest('/api/vehicles');
    setVehicles(vList);
    return res;
  };

  // CREATE DRIVER
  const handleCreateDriver = async (payload: any) => {
    const res = await apiRequest('/api/drivers', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    const dList = await apiRequest('/api/drivers');
    setDrivers(dList);
    return res;
  };

  // DELETE DRIVER
  const handleDeleteDriver = async (id: string) => {
    const res = await apiRequest(`/api/drivers/${id}`, { method: 'DELETE' });
    const dList = await apiRequest('/api/drivers');
    setDrivers(dList);
    return res;
  };

  // CREATE SHIPMENT
  const handleCreateShipment = async (payload: any) => {
    const res = await apiRequest('/api/shipments', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    const [sList, notifList, statData] = await Promise.all([
      apiRequest('/api/shipments'),
      apiRequest('/api/notifications'),
      apiRequest('/api/analytics')
    ]);
    setShipments(sList);
    setNotifications(notifList);
    setAnalyticsData(statData);
    return res;
  };

  // ASSIGN SHIPMENT DRIVER
  const handleAssignDriver = async (shipmentId: string, driverId: string) => {
    const res = await apiRequest(`/api/shipments/${shipmentId}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ driver_id: driverId })
    });
    const [vList, dList, sList, locList, notifList, statData] = await Promise.all([
      apiRequest('/api/vehicles'),
      apiRequest('/api/drivers'),
      apiRequest('/api/shipments'),
      apiRequest('/api/tracking/locations'),
      apiRequest('/api/notifications'),
      apiRequest('/api/analytics')
    ]);
    setVehicles(vList);
    setDrivers(dList);
    setShipments(sList);
    setLocations(locList);
    setNotifications(notifList);
    setAnalyticsData(statData);
    return res;
  };

  // POST ACCIDENT ALERT
  const handlePostAlert = async (message: string, type: 'warning' | 'alert') => {
    await apiRequest('/api/notifications/alert', {
      method: 'POST',
      body: JSON.stringify({ message, type })
    });
    const [notifList, statData] = await Promise.all([
      apiRequest('/api/notifications'),
      apiRequest('/api/analytics')
    ]);
    setNotifications(notifList);
    setAnalyticsData(statData);
  };

  if (appLoading && !currentUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 font-sans">
        <div className="text-center space-y-3">
          <Truck className="mx-auto h-8 w-8 text-blue-600 animate-bounce" />
          <p className="text-xs font-bold text-slate-500 tracking-wider">CONNECTING TO TRANSIT GRAPH LOGS...</p>
        </div>
      </div>
    );
  }

  // Not Logged In screen
  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 font-sans">
        <div className="w-full max-w-sm rounded-2xl bg-white border border-slate-200 p-6 shadow-xl space-y-6">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg mb-3">
              <Layers className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-black tracking-tight text-slate-800">
              NEXUS LOGISTICS CONTROL
            </h2>
            <p className="text-[10px] uppercase font-mono tracking-widest text-[#3b82f6] mt-0.5">
              Secure Gateway Access
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 text-xs text-center font-medium">
              ⚠️ {authError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block font-mono text-[9px] text-slate-400 uppercase font-bold mb-1">
                Operator Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-3.5 w-3.5" />
                </span>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="admin@logistics.com"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-400 text-slate-850"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[9px] text-slate-400 uppercase font-bold mb-1">
                Authorization PIN / Pass
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <KeyRound className="h-3.5 w-3.5" />
                </span>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-400 text-slate-850"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-2.5 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-500 shadow-lg shadow-blue-100 transition disabled:opacity-50 cursor-pointer"
            >
              {authLoading ? 'Verifying Credentials...' : 'Sign into Terminal'}
            </button>
          </form>

          {/* Quick Helper shortcuts */}
          <div className="border-t border-slate-100 pt-4 space-y-2 text-center">
            <span className="block font-sans text-[10px] text-slate-450 uppercase font-bold">
              Rapid Quick-Sign Profiles
            </span>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono leading-none">
              <button
                type="button"
                onClick={() => { setAuthEmail('admin@logistics.com'); setAuthPassword('password123'); }}
                className="py-1.5 px-1 hover:bg-slate-50 rounded border border-slate-200 font-semibold cursor-pointer"
              >
                Admin Gateway
              </button>
              <button
                type="button"
                onClick={() => { setAuthEmail('manager@logistics.com'); setAuthPassword('password123'); }}
                className="py-1.5 px-1 hover:bg-slate-50 rounded border border-slate-200 font-semibold cursor-pointer"
              >
                Fleet Manager
              </button>
              <button
                type="button"
                onClick={() => { setAuthEmail('driver@logistics.com'); setAuthPassword('password123'); }}
                className="py-1.5 px-1 hover:bg-slate-50 rounded border border-slate-200 font-semibold cursor-pointer"
              >
                Pilot Driver
              </button>
              <button
                type="button"
                onClick={() => { setAuthEmail('customer@logistics.com'); setAuthPassword('password123'); }}
                className="py-1.5 px-1 hover:bg-slate-50 rounded border border-slate-200 font-semibold cursor-pointer"
              >
                Customer Portal
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loaded Console screen
  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans">
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        notifications={notifications}
        onMarkNotificationsRead={handleMarkNotificationsRead}
        onTriggerTick={handleTriggerTick}
        isSimulating={isSimulating}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
        />

        <main className="flex-1 overflow-hidden h-full">
          {activeTab === 'dashboard' && analyticsData && (
            <Dashboard
              analyticsData={analyticsData}
              shipments={shipments}
              vehicles={vehicles}
              drivers={drivers}
              currentUser={currentUser}
              onPostAlert={handlePostAlert}
            />
          )}

          {activeTab === 'tracking' && (
            <LiveRouteMap
              vehicles={vehicles}
              shipments={shipments}
              drivers={drivers}
              locations={locations}
              onTriggerTick={handleTriggerTick}
            />
          )}

          {activeTab === 'shipments' && (
            <Shipments
              shipments={shipments}
              drivers={drivers}
              vehicles={vehicles}
              onAssignDriver={handleAssignDriver}
              onCreateShipment={handleCreateShipment}
              onRefreshShipments={loadAppData}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'fleet' && (
            <FleetManagement
              vehicles={vehicles}
              onCreateVehicle={handleCreateVehicle}
              onUpdateVehicle={handleUpdateVehicle}
              onDeleteVehicle={handleDeleteVehicle}
            />
          )}

          {activeTab === 'drivers' && (
            <Drivers
              drivers={drivers}
              vehicles={vehicles}
              onCreateDriver={handleCreateDriver}
              onDeleteDriver={handleDeleteDriver}
              onRefreshDrivers={loadAppData}
            />
          )}

          {activeTab === 'analytics' && analyticsData && (
            <Analytics
              analyticsData={analyticsData}
              vehicles={vehicles}
              drivers={drivers}
              shipments={shipments}
            />
          )}
        </main>
      </div>
    </div>
  );
}
