# Dashboard Not Included 🚀

A premium, viewport-locked interactive helper dashboard designed for **Oxygen Not Included** colony planners. Track oxygen consumption, caloric intake, ranches, and agriculture inside a sleek, blueprint-themed, game-native interface.

---

## 🎨 Design & Theme Aesthetics

Inspired by Klei Entertainment's *Oxygen Not Included*, the dashboard features:
- **Blueprint Grid Background:** Translucent retro scanning lines and steel slate-grey panels matching the game overlays.
- **Pastel Palette Theming:** Tailored colors derived directly from gases and materials charts (Oxygen Blue, Sandstone Gold, Calories Amber, Chlorine Green, and Hydrogen Yellow).
- **Geometric Tech Typography:** Uses **Oxanium** for structural telemetry readouts and **Play** for structural interface copy.
- **Viewport-Locked Architecture:** Bound to your exact screen dimensions (`100vh`) with zero page-level scrollbars, employing custom ultra-minimal scrollbars that glow upon hover.

---

## ⚡ Core Features

### 1. Colony Demands & Aggregates Sidebar
- **Duplicant Scale:** Dynamic slider scaling from 1 to 100 duplicants.
- **Demand Telemetry:** Instantly computes Oxygen required (kg/cycle) and Calories needed (kcal/cycle) based on game formulas (60 kg O2 and 1000 kcal per Duplicant per cycle).
- **Caloric Balance:** Compares duplicant intake with active colony production, reflecting net surpluses or deficits in real-time.
- **Colony Aggregates:** 
  - Tracks **Ranch Land Space**, **Ranch Liquid Space**, and **Greenhouse Space** in tiles.
  - Automatically calculates total **Stables** and **Greenhouses** required.
  - Integrates and displays unified resource tallies (Dirt, Slime, clean/polluted Water, Algae, Coal, Reed Fiber) from both active ranches and farms.

### 2. Husbandry (Ranches) Planner
- **Critter Catalog:** Static tracking cards for Hatch, Drecko, Shine Bug, Pip, and Pacu.
- **Ranch Sizing:** Computes land/liquid requirements based on individual critter occupancy metrics.
- **Ranch Sliders:** A dual-slider interface allows selecting stable counts (0–5 stables) which defaults to full occupancy, or custom critter capacities.
- **Outputs & Telemetry:** Calculates exact daily calorie yields and eggs spawned per cycle.

### 3. Agriculture (Farms) Planner
- **Crop Catalog:** Planners for Mealwood, Bristle Blossom, Dusk Cap, Sleet Wheat, and Thimble Reed.
- **Dynamic Farm Sizing Slider:** Adjust the Greenhouse Room size between **12** and **96** tiles (the minimum and maximum in-game greenhouse limits).
- **Farm Station Deduction:** Usable crop slots per room are automatically set to `Room Size - 2` tiles (deducting the space taken up by a Farm Station).
- **Greenhouse Rooms Slider:** Range from 0–5 rooms. Adjusting it defaults the crop count to full capacity.
- **Outputs & Telemetry:** Computes daily calorie output, space required (`Greenhouses * Room Size` tiles), and precise rooms required fractionally.

---

## 💾 State Persistence

No sign-ups needed! The dashboard saves your configuration (Duplicant counts, ranch configurations, crop counts, and custom room sizes) directly to your browser's **LocalStorage** in real-time. Simply click **Reset Colony Data** in the header to start fresh.

---

## 🛠️ How to Get Started

### 📋 Prerequisites
You need **Node.js** (v18 or newer recommended) installed on your system. Download it at [nodejs.org](https://nodejs.org/).

### 💻 Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/dashboard-not-included.git
   cd dashboard-not-included
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```

### 🚀 Running the App
- To start the local Vite development server:
  - **macOS / Linux:**
    ```bash
    npm run dev
    ```
  - **Windows (PowerShell):**
    ```powershell
    npm.cmd run dev
    ```
- Open the local URL (e.g., `http://localhost:5173`) in your web browser.

### 📦 Building for Production
To generate the static production build bundle inside the `dist/` directory:
- **macOS / Linux:**
  ```bash
  npm run build
  ```
- **Windows (PowerShell):**
  ```powershell
  npm.cmd run build
  ```
