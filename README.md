# 🚚 Nexus Logistics & Fleet Tracking Platform

An enterprise-grade, real-time fleet, shipment, and driver tracking portal built with a decoupled React + Express server architecture. The platform features an interactive route tracking map, live data simulations, AI-predicted ETAs, and driver safety analysis powered by Gemini.

---

## 🏗️ Architecture & Project Structure

This project is built as a complete TypeScript web application containing a React client frontend and an Express server backend:

* **Frontend**: React application built with **Vite** + **TypeScript**, styled with **Tailwind CSS**, and utilizing **Recharts** for performance telemetry and **Lucide React** for modern UI icons.
* **Backend**: **Express.js** REST API server running on Node.js. It simulates a database in-memory, manages live telemetry coordinates, and runs server-side **Gemini API** functions for predictive routing and safety alerts.

```
├── server/                     # Express Backend Services
│   ├── db.ts                   # In-memory mock database & simulation ticks
│   └── gemini.ts               # Gemini API prompt wrappers & utilities
│
├── src/                        # React Frontend Client
│   ├── components/             # Reusable UI components (Live Maps, Navbar, Sidebar)
│   ├── pages/                  # Main page views (Dashboard, Fleet, Drivers, Shipments, Analytics)
│   ├── types/                  # Shared TypeScript type definitions
│   ├── utils/                  # API request utilities and network wrappers
│   ├── App.tsx                 # Core App Shell, state handlers & router layouts
│   ├── index.css               # Global CSS & Tailwind theme configs
│   └── main.tsx                # Client entry point mounting React
│
├── index.html                  # Single Page Application HTML markup
├── server.ts                   # Unified dev integration server bootstrapper
├── package.json                # Project script triggers and dependency trees
└── README.md
```

---

## 🚀 Key Features

1. **Live Analytics Dashboard**: Consolidated operational telemetry reporting vehicle active counts, delayed deliveries, driver availability, and system-wide notifications.
2. **Interactive Live Map**: Real-time GPS coordinate visualizer displaying simulated vehicle movements, current routes, and heading parameters.
3. **AI Route Predictions (Gemini)**: Integrates Gemini to generate estimated distance, fuel consumption, and optimized ETAs for shipments based on sender and receiver location profiles.
4. **Driver Fatigue Warnings**: Monitors hours driven, operator ratings, and scores. Applies AI analysis to identify high-risk fatigued pilots and schedules mandatory off-duty rest.
5. **Shipments Dispatcher**: Log pick-up/delivery terminals, assign registered pilots, update cargo status milestones, and trace historical timeline events.
6. **Fleet & Personnel Registry**: Perform full CRUD operations to manage vehicles (truck capacities, fuel types, maintenance reports) and driver records.
7. **Simulated Sandbox Ticker**: Push the **"Simulation Step"** ticker button to instantly advance vehicle locations along active routes, triggering dynamic updates to distance and telemetry charts.

---

## 💻 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (Version 18+ recommended)
* npm (installed automatically with Node.js)

### Installation

1. Clone or navigate into the repository:
   ```bash
   cd real-time-logistics-&-fleet-tracking-platform
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set your `GEMINI_API_KEY` in `.env.local` to leverage AI-predicted ETAs and driver fatigue safety analysis:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

### Running the Application

To run the unified server (serving the Express API and proxying Vite frontend client simultaneously):

```bash
npm run dev
```

Once running, open your browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Demo Access Profiles

The sandbox terminal contains pre-configured profiles for evaluation. Select from any of the quick-login cards on the login portal:

| Role Profile | Default Credentials | Permissions Scope |
| :--- | :--- | :--- |
| **Admin Gateway** | `admin@logistics.com` / `password123` | Full control over alerts, fleet registration, and drivers. |
| **Fleet Manager** | `manager@logistics.com` / `password123` | High-level fleet coordination and shipment assignments. |
| **Pilot Driver** | `driver@logistics.com` / `password123` | Individual dashboard with route logs and fatigue status. |
| **Customer Portal** | `customer@logistics.com` / `password123` | View-only access to shipment tracking and ETA updates. |

---

## 📦 Production Deployment

Compile the optimized client bundle and packages for production use:

```bash
# Build Vite client assets and compile backend bundles
npm run build

# Start the Node.js production server
npm run start
```
