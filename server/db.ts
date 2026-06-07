import { User, Vehicle, Driver, Shipment, VehicleLocation, SystemNotification } from '../src/types/logistics';

// In-Memory Database with dynamic updates
export let users: User[] = [
  { id: 'usr_1', name: 'Alisha Sterling', email: 'admin@logistics.com', role: 'admin', password: 'password123', created_at: new Date('2026-01-10').toISOString() },
  { id: 'usr_2', name: 'Marcus Brody', email: 'manager@logistics.com', role: 'manager', password: 'password123', created_at: new Date('2026-02-15').toISOString() },
  { id: 'usr_3', name: 'Jackson Miller', email: 'driver@logistics.com', role: 'driver', password: 'password123', created_at: new Date('2026-03-01').toISOString() },
  { id: 'usr_4', name: 'Sarah Connor', email: 'customer@logistics.com', role: 'customer', password: 'password123', created_at: new Date('2026-04-12').toISOString() },
];

export let vehicles: Vehicle[] = [
  {
    id: 'veh_1',
    vehicle_number: 'TX-7842-TR',
    vehicle_type: 'Semi-Truck',
    capacity: '45,000 lbs',
    fuel_type: 'Diesel',
    fuel_level: 68,
    status: 'in_transit',
    maintenance_records: [
      { id: 'm_1', date: '2026-05-12', type: 'Oil Change', cost: 180, description: 'Engine oil and filter replaced.' },
      { id: 'm_2', date: '2026-04-01', type: 'Brake Service', cost: 1200, description: 'Replaced rear brake pads, rotors, and air lines.' }
    ]
  },
  {
    id: 'veh_2',
    vehicle_number: 'NY-9901-VN',
    vehicle_type: 'Delivery Van',
    capacity: '3,500 lbs',
    fuel_type: 'Electric',
    fuel_level: 84,
    status: 'available',
    maintenance_records: [
      { id: 'm_3', date: '2026-05-20', type: 'Tyre Rotation', cost: 85, description: 'Rotated all 4 tires and adjusted tracking.' }
    ]
  },
  {
    id: 'veh_3',
    vehicle_number: 'CA-3321-BT',
    vehicle_type: 'Box Truck',
    capacity: '12,500 lbs',
    fuel_type: 'Hybrid',
    fuel_level: 42,
    status: 'in_transit',
    maintenance_records: []
  },
  {
    id: 'veh_4',
    vehicle_number: 'MA-4512-ES',
    vehicle_type: 'Electric Sprinter',
    capacity: '4,200 lbs',
    fuel_type: 'Electric',
    fuel_level: 95,
    status: 'available',
    maintenance_records: [
      { id: 'm_4', date: '2026-03-10', type: 'Battery Health Check', cost: 150, description: 'Diagnostic test. 98% capacity remaining.' }
    ]
  },
  {
    id: 'veh_5',
    vehicle_number: 'IL-5582-RT',
    vehicle_type: 'Reefer Truck',
    capacity: '38,000 lbs',
    fuel_type: 'Diesel',
    fuel_level: 15,
    status: 'maintenance',
    maintenance_records: [
      { id: 'm_5', date: '2026-06-05', type: 'Refrigeration System Repair', cost: 2400, description: 'Compressor overhaul and leak test.' }
    ]
  }
];

export let drivers: Driver[] = [
  { id: 'drv_1', name: 'Jackson Miller', phone: '+1 (555) 123-4567', license_number: 'DL-9841284', assigned_vehicle_id: 'veh_1', performance_score: 94, status: 'active', rating: 4.8, fatigue_alert: false },
  { id: 'drv_2', name: 'Teresa Lawson', phone: '+1 (555) 765-4321', license_number: 'DL-3382104', assigned_vehicle_id: 'veh_3', performance_score: 88, status: 'active', rating: 4.5, fatigue_alert: false },
  { id: 'drv_3', name: 'Rajesh Patel', phone: '+1 (555) 987-6543', license_number: 'DL-7612938', assigned_vehicle_id: null, performance_score: 91, status: 'resting', rating: 4.7, fatigue_alert: false },
  { id: 'drv_4', name: 'Samantha Vance', phone: '+1 (555) 432-1098', license_number: 'DL-5523910', assigned_vehicle_id: 'veh_5', performance_score: 72, status: 'resting', rating: 3.9, fatigue_alert: true },
];

export let shipments: Shipment[] = [
  {
    id: 'sh_1',
    tracking_number: 'TRK-202606-0001',
    sender_name: 'Apex Manufacturing',
    sender_address: 'Boston, MA (42.3601, -71.0589)',
    receiver_name: 'Gotham Logistics Hub',
    receiver_address: 'New York, NYC (40.7128, -74.0060)',
    pickup_lat: 42.3601,
    pickup_lng: -71.0589,
    delivery_lat: 40.7128,
    delivery_lng: -74.0060,
    package_details: 'Industrial components - Fragile, 12 Pallets',
    status: 'in_transit',
    estimated_eta: '2.4 hours',
    assigned_driver_id: 'drv_1',
    history: [
      { status: 'pending', timestamp: new Date('2026-06-07T02:00:00Z').toISOString(), location: 'Boston Hub', description: 'Shipment created and scheduled.' },
      { status: 'picked_up', timestamp: new Date('2026-06-07T04:00:00Z').toISOString(), location: 'Apex Plant, Boston', description: 'Package picked up by Jackson Miller with truck TX-7842-TR.' },
      { status: 'in_transit', timestamp: new Date('2026-06-07T05:30:00Z').toISOString(), location: 'Worcester, MA', description: 'Shipment in transit on I-90 Westbound.' }
    ]
  },
  {
    id: 'sh_2',
    tracking_number: 'TRK-202606-0002',
    sender_name: 'PharmaCore Lab Ltd',
    sender_address: 'Newark, NJ (40.7357, -74.1724)',
    receiver_name: 'Mercy Bio-Research Center',
    receiver_address: 'Washington, DC (38.9072, -77.0369)',
    pickup_lat: 40.7357,
    pickup_lng: -74.1724,
    delivery_lat: 38.9072,
    delivery_lng: -77.0369,
    package_details: 'Cold-chain vaccine supplies - Temp controlled',
    status: 'in_transit',
    estimated_eta: '3.8 hours',
    assigned_driver_id: 'drv_2',
    history: [
      { status: 'pending', timestamp: new Date('2026-06-07T01:15:00Z').toISOString(), location: 'Newark Depot', description: 'Cold-chain shipment logged.' },
      { status: 'picked_up', timestamp: new Date('2026-06-07T03:00:00Z').toISOString(), location: 'PharmaCore Newark', description: 'Loaded into temperature monitored hybrid trailer. Assigned to Teresa Lawson.' },
      { status: 'in_transit', timestamp: new Date('2026-06-07T04:45:00Z').toISOString(), location: 'Cherry Hill, NJ', description: 'Refrigeration unit verified active at 4°C.' }
    ]
  },
  {
    id: 'sh_3',
    tracking_number: 'TRK-202606-0003',
    sender_name: 'TechDirect Inc',
    sender_address: 'Philadelphia, PA (39.9526, -75.1652)',
    receiver_name: 'Apex Retail Store',
    receiver_address: 'Baltimore, MD (39.2904, -76.6122)',
    pickup_lat: 39.9526,
    pickup_lng: -75.1652,
    delivery_lat: 39.2904,
    delivery_lng: -76.6122,
    package_details: 'Electronic components - high value items',
    status: 'pending',
    estimated_eta: 'AI prediction pending',
    assigned_driver_id: null,
    history: [
      { status: 'pending', timestamp: new Date('2026-06-07T06:10:00Z').toISOString(), location: 'Philadelphia Warehouse', description: 'Shipment manifest generated. Ready for driver assignment.' }
    ]
  },
  {
    id: 'sh_4',
    tracking_number: 'TRK-202606-0004',
    sender_name: 'Standard Hardware Supplies',
    sender_address: 'Washington, DC (38.9072, -77.0369)',
    receiver_name: 'Federal Materials Distribution',
    receiver_address: 'Philadelphia, PA (39.9526, -75.1652)',
    pickup_lat: 38.9072,
    pickup_lng: -77.0369,
    delivery_lat: 39.9526,
    delivery_lng: -75.1652,
    package_details: 'Steel Fasteners and Tool Sets',
    status: 'delivered',
    estimated_eta: 'Completed',
    assigned_driver_id: 'drv_3',
    history: [
      { status: 'pending', timestamp: new Date('2026-06-06T08:00:00Z').toISOString(), location: 'DC Distribution Yard', description: 'Order recorded.' },
      { status: 'picked_up', timestamp: new Date('2026-06-06T10:00:00Z').toISOString(), location: 'DC Distribution Yard', description: 'Picked up by Rajesh Patel.' },
      { status: 'in_transit', timestamp: new Date('2026-06-06T12:30:00Z').toISOString(), location: 'Baltimore, MD', description: 'Bypassed toll gate, in transit north.' },
      { status: 'out_for_delivery', timestamp: new Date('2026-06-06T15:00:00Z').toISOString(), location: 'South Philly Depot', description: 'Out for final delivery.' },
      { status: 'delivered', timestamp: new Date('2026-06-06T16:45:00Z').toISOString(), location: 'Federal Retail PA', description: 'Package successfully delivered, signature recorded from M. Vance.' }
    ]
  }
];

// Live dynamic locations for fleet vehicles
export let vehicleLocations: Record<string, VehicleLocation> = {
  'veh_1': {
    vehicle_id: 'veh_1',
    latitude: 41.5246, // Somewhere on Route from Boston to NYC
    longitude: -72.6842,
    speed: 58,
    distance_covered: 112,
    heading: 220,
    last_updated: new Date().toISOString()
  },
  'veh_3': {
    vehicle_id: 'veh_3',
    latitude: 40.1009, // Somewhere on Route from Newark to DC
    longitude: -74.9126,
    speed: 62,
    distance_covered: 45,
    heading: 245,
    last_updated: new Date().toISOString()
  }
};

export let notifications: SystemNotification[] = [
  { id: 'notif_1', user_id: 'usr_2', message: 'Vehicle IL-5582-RT is undergoing refrigerator compressor overhaul.', type: 'info', status: 'unread', timestamp: new Date('2026-06-07T05:00:00Z').toISOString() },
  { id: 'notif_2', user_id: 'usr_1', message: 'Driver Samantha Vance flagged for high-fatigue trigger. Active resting recommended!', type: 'alert', status: 'unread', timestamp: new Date('2026-06-07T06:30:00Z').toISOString() },
  { id: 'notif_3', user_id: 'all', message: 'Heavy storm warning along I-95 Northeast corridor. Expect minor routing delays.', type: 'warning', status: 'read', timestamp: new Date('2026-06-07T04:15:00Z').toISOString() }
];

// Helper functions for simulating vehicle movement along real coordinates
// Linear interpolation between sender and receiver points based on elapsed time or random step
function lerp(start: number, end: number, amt: number) {
  return (1 - amt) * start + amt * end;
}

export function updateSimulatedLocations() {
  const now = new Date();
  
  // Update in_transit shipments
  shipments.forEach(shipment => {
    if (shipment.status === 'in_transit' && shipment.assigned_driver_id) {
      const driver = drivers.find(d => d.id === shipment.assigned_driver_id);
      if (driver && driver.assigned_vehicle_id) {
        const vehicleId = driver.assigned_vehicle_id;
        const loc = vehicleLocations[vehicleId];
        
        if (loc) {
          // Increment latitude and longitude closer to target
          let step = 0.008 + Math.random() * 0.004; // small randomized incremental step
          
          let dLat = shipment.delivery_lat - loc.latitude;
          let dLng = shipment.delivery_lng - loc.longitude;
          let distanceRemaining = Math.sqrt(dLat * dLat + dLng * dLng);
          
          if (distanceRemaining < 0.15) {
            // Very close to destination, update both shipment & vehicle status!
            shipment.status = 'out_for_delivery';
            shipment.history.push({
              status: 'out_for_delivery',
              timestamp: now.toISOString(),
              location: 'Destination Depot Area',
              description: 'Entering urban delivery borders. Out for final delivery.'
            });
            
            // Add notification
            notifications.unshift({
              id: 'notif_' + Math.random().toString(36).substr(2, 9),
              user_id: 'all',
              message: `Shipment ${shipment.tracking_number} is now OUT FOR DELIVERY.`,
              type: 'info',
              status: 'unread',
              timestamp: now.toISOString()
            });
          } else {
            // Interpolate vehicle coordinate towards delivery point
            loc.latitude = loc.latitude + (dLat / distanceRemaining) * step;
            loc.longitude = loc.longitude + (dLng / distanceRemaining) * step;
            loc.speed = 50 + Math.floor(Math.random() * 15); // fluctuate speed
            loc.distance_covered += parseFloat((loc.speed / 120).toFixed(2)); // distance covered over 30s-equivalent ticker
            loc.last_updated = now.toISOString();
            
            // Randomly update heading relative to direction
            let angle = Math.atan2(dLat, dLng) * (180 / Math.PI);
            loc.heading = Math.floor(angle < 0 ? angle + 360 : angle);
          }
        } else {
          // Initialize simulation position if missing
          vehicleLocations[vehicleId] = {
            vehicle_id: vehicleId,
            latitude: shipment.pickup_lat,
            longitude: shipment.pickup_lng,
            speed: 55,
            distance_covered: 1,
            heading: 45,
            last_updated: now.toISOString()
          };
        }
      }
    } else if (shipment.status === 'out_for_delivery' && shipment.assigned_driver_id) {
      // Small chance of final delivery completion inside simulation ticker
      if (Math.random() < 0.25) {
        shipment.status = 'delivered';
        shipment.estimated_eta = 'Completed';
        shipment.history.push({
          status: 'delivered',
          timestamp: now.toISOString(),
          location: shipment.receiver_name,
          description: 'Package successfully delivered & signed.'
        });
        
        const driver = drivers.find(d => d.id === shipment.assigned_driver_id);
        if (driver) {
          driver.status = 'resting'; // driver goes back to rest/available
          if (driver.assigned_vehicle_id) {
            const v = vehicles.find(veh => veh.id === driver.assigned_vehicle_id);
            if (v) v.status = 'available';
          }
        }
        
        notifications.unshift({
          id: 'notif_' + Math.random().toString(36).substr(2, 9),
          user_id: 'all',
          message: `Arrived! Shipment ${shipment.tracking_number} has been delivered successfully.`,
          type: 'success',
          status: 'unread',
          timestamp: now.toISOString()
        });
      }
    }
  });

  // Randomize some fuel levels & driver fatigue parameters during active tracking
  drivers.forEach(drv => {
    if (drv.status === 'active' && Math.random() < 0.05) {
      drv.performance_score = Math.max(70, Math.min(100, drv.performance_score + (Math.random() > 0.4 ? 1 : -1)));
      if (drv.assigned_vehicle_id) {
        const v = vehicles.find(veh => veh.id === drv.assigned_vehicle_id);
        if (v) {
          v.fuel_level = Math.max(0, v.fuel_level - 1);
          if (v.fuel_level < 20) {
            notifications.unshift({
              id: 'notif_' + Math.random().toString(36).substr(2, 9),
              user_id: 'all',
              message: `Low Fuel Alert for Vehicle ${v.vehicle_number} (${v.fuel_level}% left).`,
              type: 'warning',
              status: 'unread',
              timestamp: now.toISOString()
            });
          }
        }
      }
    }
  });
}

// Trigger simulation ticker every 30 seconds
setInterval(updateSimulatedLocations, 30000);
