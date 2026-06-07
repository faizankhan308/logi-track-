import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { 
  users, 
  vehicles, 
  drivers, 
  shipments, 
  vehicleLocations, 
  notifications, 
  updateSimulatedLocations 
} from './server/db';
import { getAiRouteMetrics, analyzeDriverFatigue } from './server/gemini';
import { User, Vehicle, Driver, Shipment, VehicleLocation, SystemNotification } from './src/types/logistics';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body parsing
  app.use(express.json());

  // Static API Middleware to allow easily accessible logs inside sandbox
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // REST API: Authentication & Security
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Mock Token Generation (Base64 of simple JSON)
    const tokenPayload = { id: user.id, email: user.email, role: user.role, time: Date.now() };
    const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

    // Return user without password
    const { password: _, ...userSafe } = user;
    res.json({
      token,
      user: userSafe
    });
  });

  // REST API: Get Current User details from Token
  app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: missing authorization header' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decodedPayload = JSON.parse(Buffer.from(token, 'base64').toString('ascii'));
      const user = users.find(u => u.id === decodedPayload.id);
      if (!user) {
        return res.status(404).json({ error: 'User does not exist' });
      }
      const { password: _, ...userSafe } = user;
      res.json(userSafe);
    } catch (e) {
      res.status(401).json({ error: 'Invalid token signature' });
    }
  });

  // REST API: Vehicles Management (GET, POST, PUT, DELETE)
  app.get('/api/vehicles', (req, res) => {
    res.json(vehicles);
  });

  app.post('/api/vehicles', (req, res) => {
    const { vehicle_number, vehicle_type, capacity, fuel_type, fuel_level } = req.body;
    if (!vehicle_number || !vehicle_type || !capacity) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const vehicleId = 'veh_' + Math.random().toString(36).substr(2, 9);
    const newVehicle: Vehicle = {
      id: vehicleId,
      vehicle_number,
      vehicle_type,
      capacity,
      fuel_type: fuel_type || 'Diesel',
      fuel_level: typeof fuel_level === 'number' ? fuel_level : 100,
      status: 'available',
      maintenance_records: []
    };

    vehicles.push(newVehicle);

    // Create default locations for live mock if needed
    vehicleLocations[vehicleId] = {
      vehicle_id: vehicleId,
      latitude: 40.7128 + (Math.random() - 0.5) * 0.4,
      longitude: -74.0060 + (Math.random() - 0.5) * 0.4,
      speed: 0,
      distance_covered: 0,
      heading: 0,
      last_updated: new Date().toISOString()
    };

    res.status(201).json(newVehicle);
  });

  app.put('/api/vehicles/:id', (req, res) => {
    const { id } = req.params;
    const { vehicle_number, vehicle_type, capacity, fuel_type, fuel_level, status } = req.body;

    const index = vehicles.findIndex(v => v.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    vehicles[index] = {
      ...vehicles[index],
      vehicle_number: vehicle_number || vehicles[index].vehicle_number,
      vehicle_type: vehicle_type || vehicles[index].vehicle_type,
      capacity: capacity || vehicles[index].capacity,
      fuel_type: fuel_type || vehicles[index].fuel_type,
      fuel_level: typeof fuel_level === 'number' ? fuel_level : vehicles[index].fuel_level,
      status: status || vehicles[index].status
    };

    res.json(vehicles[index]);
  });

  app.delete('/api/vehicles/:id', (req, res) => {
    const { id } = req.params;
    const index = vehicles.findIndex(v => v.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    vehicles.splice(index, 1);
    delete vehicleLocations[id];
    res.json({ success: true, message: 'Vehicle deleted successfully' });
  });

  // REST API: Drivers Management (GET, POST, PUT, DELETE, fatigue prediction)
  app.get('/api/drivers', (req, res) => {
    res.json(drivers);
  });

  app.post('/api/drivers', (req, res) => {
    const { name, phone, license_number, assigned_vehicle_id } = req.body;
    if (!name || !phone || !license_number) {
      return res.status(400).json({ error: 'Missing name, phone, or license' });
    }

    const driverId = 'drv_' + Math.random().toString(36).substr(2, 9);
    const newDriver: Driver = {
      id: driverId,
      name,
      phone,
      license_number,
      assigned_vehicle_id: assigned_vehicle_id || null,
      performance_score: 95,
      status: 'resting',
      rating: 4.8,
      fatigue_alert: false
    };

    if (assigned_vehicle_id) {
      const vehicle = vehicles.find(v => v.id === assigned_vehicle_id);
      if (vehicle) vehicle.status = 'available';
    }

    drivers.push(newDriver);
    res.status(201).json(newDriver);
  });

  app.put('/api/drivers/:id', (req, res) => {
    const { id } = req.params;
    const { name, phone, license_number, assigned_vehicle_id, status, performance_score } = req.body;

    const index = drivers.findIndex(d => d.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    drivers[index] = {
      ...drivers[index],
      name: name || drivers[index].name,
      phone: phone || drivers[index].phone,
      license_number: license_number || drivers[index].license_number,
      assigned_vehicle_id: assigned_vehicle_id !== undefined ? assigned_vehicle_id : drivers[index].assigned_vehicle_id,
      status: status || drivers[index].status,
      performance_score: typeof performance_score === 'number' ? performance_score : drivers[index].performance_score
    };

    res.json(drivers[index]);
  });

  app.delete('/api/drivers/:id', (req, res) => {
    const { id } = req.params;
    const index = drivers.findIndex(d => d.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    drivers.splice(index, 1);
    res.json({ success: true, message: 'Driver dismissed successfully' });
  });

  // Call Gemini-based driver fatigue prediction
  app.post('/api/drivers/:id/analyze-fatigue', async (req, res) => {
    const { id } = req.params;
    const { hours_driven } = req.body; // mock user hours entry

    const driver = drivers.find(d => d.id === id);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const driveHours = parseFloat(hours_driven) || 6.5; 
    const analysis = await analyzeDriverFatigue(
      driver.name,
      driveHours,
      driver.rating,
      driver.performance_score
    );

    // Update driver fatigue alert real state
    driver.fatigue_alert = analysis.requiresRest;
    if (analysis.requiresRest) {
      driver.status = 'resting';
      // Notify admin
      notifications.unshift({
        id: 'notif_' + Math.random().toString(36).substr(2, 9),
        user_id: 'all',
        message: `ALERT: Driver ${driver.name} flagged for fatigued transit list. AI Index is ${analysis.fatigueIndex}%. Mandatory off-duty resting scheduled immediately.`,
        type: 'alert',
        status: 'unread',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      driver_id: id,
      name: driver.name,
      fatigue_index: analysis.fatigueIndex,
      requires_rest: analysis.requiresRest,
      ai_recommendation: analysis.aiRecommendation
    });
  });

  // REST API: Shipments API (GET, POST, PUT, DELETE, plus auto-ETA tracking via AI)
  app.get('/api/shipments', (req, res) => {
    res.json(shipments);
  });

  app.post('/api/shipments', async (req, res) => {
    const { 
      sender_name, 
      sender_address, 
      receiver_name, 
      receiver_address, 
      pickup_lat, 
      pickup_lng, 
      delivery_lat, 
      delivery_lng, 
      package_details 
    } = req.body;

    if (!sender_name || !sender_address || !receiver_name || !receiver_address) {
      return res.status(400).json({ error: 'Sender and receiver name and address are required' });
    }

    // Default coordinates around NYC region if missing
    const pLat = parseFloat(pickup_lat) || 40.7128;
    const pLng = parseFloat(pickup_lng) || -74.0060;
    const dLat = parseFloat(delivery_lat) || 42.3601;
    const dLng = parseFloat(delivery_lng) || -71.0589;

    // Trigger AI predictions for distance, ETA, and optimal fuel usage!
    const aiMetrics = await getAiRouteMetrics(sender_address, receiver_address, package_details || 'Cargo Pallets');

    const trackingNumber = 'TRK-' + new Date().getFullYear() + String(new Date().getMonth() + 1).padStart(2, '0') + '-' + Math.floor(1000 + Math.random() * 9000);
    const newShipment: Shipment = {
      id: 'sh_' + Math.random().toString(36).substr(2, 9),
      tracking_number: trackingNumber,
      sender_name,
      sender_address,
      receiver_name,
      receiver_address,
      pickup_lat: pLat,
      pickup_lng: pLng,
      delivery_lat: dLat,
      delivery_lng: dLng,
      package_details: package_details || 'General Merchandising',
      status: 'pending',
      estimated_eta: `${(aiMetrics.est_time / 60).toFixed(1)} hours (AI Predicted)`,
      assigned_driver_id: null,
      history: [
        {
          status: 'pending',
          timestamp: new Date().toISOString(),
          location: sender_address,
          description: `Shipment logged successfully. AI routing optimization recommended distance: ${aiMetrics.shortest_distance} miles. Predicted Fuel needed: ${aiMetrics.fuel_consumption} gals.`
        }
      ]
    };

    shipments.unshift(newShipment);

    // Create system notification
    notifications.unshift({
      id: 'notif_' + Math.random().toString(36).substr(2, 9),
      user_id: 'all',
      message: `New shipment created! Route: ${sender_name} → ${receiver_name}. Est: ${newShipment.estimated_eta}`,
      type: 'success',
      status: 'unread',
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      shipment: newShipment,
      metrics: aiMetrics
    });
  });

  // Assign driver and vehicle and set shipment to in_transit
  app.put('/api/shipments/:id/assign', (req, res) => {
    const { id } = req.params;
    const { driver_id } = req.body;

    const shipment = shipments.find(s => s.id === id);
    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    const driver = drivers.find(d => d.id === driver_id);
    if (!driver) {
      return res.status(404).json({ error: 'Driver profile not found' });
    }

    if (!driver.assigned_vehicle_id) {
       return res.status(400).json({ error: 'Driver does not have an assigned vehicle. Must assign a vehicle before starting transit.' });
    }

    const vehicle = vehicles.find(v => v.id === driver.assigned_vehicle_id);
    if (!vehicle) {
      return res.status(400).json({ error: 'Assigned vehicle is missing from registry' });
    }

    // Set statuses
    shipment.assigned_driver_id = driver_id;
    shipment.status = 'in_transit';
    shipment.history.push({
      status: 'in_transit',
      timestamp: new Date().toISOString(),
      location: shipment.sender_address,
      description: `Driver ${driver.name} departed from pickup dock with vehicle ${vehicle.vehicle_number}.`
    });

    driver.status = 'active';
    vehicle.status = 'in_transit';

    // Initialize/reset position
    vehicleLocations[vehicle.id] = {
      vehicle_id: vehicle.id,
      latitude: shipment.pickup_lat,
      longitude: shipment.pickup_lng,
      speed: 55,
      distance_covered: 0,
      heading: 90,
      last_updated: new Date().toISOString()
    };

    // System Warning if fuel level is low
    if (vehicle.fuel_level < 30) {
      notifications.unshift({
        id: 'notif_' + Math.random().toString(36).substr(2, 9),
        user_id: 'all',
        message: `Low fuel on vehicle ${vehicle.vehicle_number} for active trip. Suggest refuel along first exit.`,
        type: 'warning',
        status: 'unread',
        timestamp: new Date().toISOString()
      });
    }

    res.json(shipment);
  });

  // Update shipment transit manually
  app.put('/api/shipments/:id', (req, res) => {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const shipment = shipments.find(s => s.id === id);
    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    shipment.status = status || shipment.status;
    shipment.history.push({
      status: shipment.status,
      timestamp: new Date().toISOString(),
      location: remarks ? 'En Route Checkpoint' : 'Operational Center',
      description: remarks || `Shipment status manually modulated to ${shipment.status}.`
    });

    if (shipment.status === 'delivered' && shipment.assigned_driver_id) {
      const driver = drivers.find(d => d.id === shipment.assigned_driver_id);
      if (driver) {
        driver.status = 'resting';
        if (driver.assigned_vehicle_id) {
          const v = vehicles.find(veh => veh.id === driver.assigned_vehicle_id);
          if (v) v.status = 'available';
        }
      }
    }

    res.json(shipment);
  });

  // REST API: Live tracking coordinates map
  app.get('/api/tracking/locations', (req, res) => {
    res.json(vehicleLocations);
  });

  // REST API: Trigger Manual Tick for simulation (instant updates)
  app.post('/api/tracking/simulate-tick', (req, res) => {
    updateSimulatedLocations();
    res.json({ success: true, message: 'Simulation ticker stepped successfully. Vehicle metrics re-calculated.', positions: vehicleLocations });
  });

  // REST API: Retrieve analytics metrics
  app.get('/api/analytics', (req, res) => {
    // Distance, Fuel, Utilization metrics compiled dynamically
    const inTransitCount = vehicles.filter(v => v.status === 'in_transit').length;
    const maintenanceCount = vehicles.filter(v => v.status === 'maintenance').length;
    const availableCount = vehicles.filter(v => v.status === 'available').length;
    const offlineCount = vehicles.filter(v => v.status === 'offline').length;

    const statusPie = [
      { name: 'Active', value: inTransitCount },
      { name: 'Available', value: availableCount },
      { name: 'Maintenance', value: maintenanceCount },
      { name: 'Offline', value: offlineCount }
    ];

    const cargoDeliveredCount = shipments.filter(s => s.status === 'delivered').length;
    const transitCount = shipments.filter(s => s.status === 'in_transit').length;
    const pendingCount = shipments.filter(s => s.status === 'pending').length;
    const canceledCount = shipments.filter(s => s.status === 'cancelled').length;

    const shipmentPie = [
      { name: 'Delivered', value: cargoDeliveredCount },
      { name: 'In Transit', value: transitCount },
      { name: 'Pending', value: pendingCount },
      { name: 'Cancelled', value: canceledCount }
    ];

    // Simulated 7-day distance logging trend
    const driveTrend = [
      { day: 'Mon', distance: 1240, fuelUsed: 148, deliveries: 12 },
      { day: 'Tue', distance: 1450, fuelUsed: 174, deliveries: 15 },
      { day: 'Wed', distance: 1890, fuelUsed: 226, deliveries: 18 },
      { day: 'Thu', distance: 1620, fuelUsed: 194, deliveries: 14 },
      { day: 'Fri', distance: 2200, fuelUsed: 264, deliveries: 22 },
      { day: 'Sat', distance: 1100, fuelUsed: 132, deliveries: 9 },
      { day: 'Sun', distance: 1350, fuelUsed: 162, deliveries: 11 }
    ];

    const driverScores = drivers.map(d => ({
      name: d.name,
      score: d.performance_score,
      rating: d.rating
    }));

    res.json({
      summary: {
        total_vehicles: vehicles.length,
        active_deliveries: transitCount + shipments.filter(s => s.status === 'out_for_delivery').length,
        delayed_shipments: shipments.filter(s => s.status === 'pending').length,
        driver_availability: drivers.filter(d => d.status === 'resting').length,
        delivery_success_rate: Math.round(((cargoDeliveredCount) / (shipments.length || 1)) * 100),
        total_revenue_est: cargoDeliveredCount * 450 // dynamic revenue rate
      },
      statusPie,
      shipmentPie,
      driveTrend,
      driverScores
    });
  });

  // REST API: Notifications management
  app.get('/api/notifications', (req, res) => {
    res.json(notifications);
  });

  app.put('/api/notifications/read-all', (req, res) => {
    notifications.forEach(n => n.status = 'read');
    res.json({ success: true });
  });

  // REST API: Create System-Wide Issue / Accident / Breakdown alert
  app.post('/api/notifications/alert', (req, res) => {
    const { driver_id, message, type } = req.body;
    const newNotif: SystemNotification = {
      id: 'notif_' + Math.random().toString(36).substr(2, 9),
      user_id: 'all',
      message: message || `Logistics Alert: Unscheduled cargo interruption reported by driver.`,
      type: type || 'warning',
      status: 'unread',
      timestamp: new Date().toISOString()
    };
    notifications.unshift(newNotif);
    res.status(201).json(newNotif);
  });

  // Vite middleware for rendering dev build SPA, OR serve compiled production bundles
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Logistics Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Critical: Failed to boot express delivery microservice:", err);
});
