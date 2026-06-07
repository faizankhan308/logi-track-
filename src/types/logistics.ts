export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'driver' | 'customer';
  password?: string;
  created_at: string;
}

export type VehicleType = 'Semi-Truck' | 'Delivery Van' | 'Box Truck' | 'Electric Sprinter' | 'Reefer Truck';
export type VehicleStatus = 'available' | 'in_transit' | 'maintenance' | 'offline';

export interface Vehicle {
  id: string;
  vehicle_number: string;
  vehicle_type: VehicleType;
  capacity: string; // e.g., "10,000 lbs"
  fuel_type: 'Diesel' | 'Electric' | 'Hybrid';
  fuel_level: number; // 0 - 100
  status: VehicleStatus;
  maintenance_records: MaintenanceRecord[];
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  type: string;
  cost: number;
  description: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  license_number: string;
  assigned_vehicle_id: string | null;
  performance_score: number; // 0 - 100
  status: 'active' | 'resting' | 'inactive';
  rating: number; // 1-5
  fatigue_alert: boolean;
}

export type ShipmentStatus = 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface Shipment {
  id: string;
  tracking_number: string;
  sender_name: string;
  sender_address: string;
  receiver_name: string;
  receiver_address: string;
  pickup_lat: number;
  pickup_lng: number;
  delivery_lat: number;
  delivery_lng: number;
  package_details: string;
  status: ShipmentStatus;
  estimated_eta: string; // e.g., "3 hours" or "AI calculated"
  assigned_driver_id: string | null;
  history: ShipmentHistory[];
}

export interface ShipmentHistory {
  status: ShipmentStatus;
  timestamp: string;
  location: string;
  description: string;
}

export interface VehicleLocation {
  vehicle_id: string;
  latitude: number;
  longitude: number;
  speed: number; // mph
  distance_covered: number; // miles
  heading: number; // degrees
  last_updated: string;
}

export interface SystemNotification {
  id: string;
  user_id: string | 'all';
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  status: 'unread' | 'read';
  timestamp: string;
}

export interface RouteMetrics {
  shortest_distance: number; // miles
  est_time: number; // mins
  fuel_consumption: number; // gallons
  delay_prediction: string; // "Low" | "Medium" | "High"
  steps: Array<{ lat: number; lng: number; name: string }>;
}
