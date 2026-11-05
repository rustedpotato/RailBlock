# RailBlock AI (SIH 2026 — SIH26027)

> **AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways**  
> *Developed for the Ministry of Railways — Smart India Hackathon 2026 (Problem Statement SIH26027)*  
> *Status: Fully Implemented & Verified (29/29 Pytest Test Suites Passing)*

---

## 1. System Overview & Problem Statement

In Indian Railways high-density corridors (such as the Mumbai Suburban Network across Central, Western, and Harbour lines), maintenance planning is historically fragmented across three siloed technical departments:
1. **Engineering (Civil/Track/P-Way):** Rail renewal, tamping (CSM/BCM), deep screening, and ultrasonic flaw testing (USFD).
2. **Traction Distribution (TRD/Electrical):** 25kV AC overhead catenary maintenance, contact wire wear monitoring, and feeder power isolation.
3. **Signal & Telecommunication (S&T):** Electronic interlocking, point machines, track circuits, and digital axle counters (SSDAC).

Uncoordinated possessions lead to severe suburban commuter delays, missed maintenance windows, and speed caution backlogs. **RailBlock AI** solves this by:
* Formulating maintenance allocation as a mathematical constraint satisfaction problem using **Google OR-Tools CP-SAT**.
* Generating **Pareto-optimal multi-objective schedules** balancing safety urgency, gross tonnage (GMT), and passenger train detention minutes.
* Evaluating **UIC 406 Corridor Capacity Consumption** to compute feasible continuous maintenance headroom.
* Enforcing **cryptographic tamper-evident safety seals (HMAC-SHA256)** for work permits and power-block dispatches.

---

## 2. Tech Stack & What We Have Actually Used

### 🖥️ Frontend Layer
* **Framework:** React 18 with TypeScript and Vite 5 (Fast HMR & Optimized Production Bundler).
* **Styling & Design System:** Tailwind CSS with custom **Pantone Color Tokens**:
  * **Wheat (`#F7F2E7` / `#EFE6D5`) [PANTONE 13-1016 TPG]:** Primary warm canvas and card surfaces for fatigue-free operational reading.
  * **Magnetic Blue (`#0F2452` / `#27457D`) [PANTONE 20-0146 TPM]:** Deep high-contrast headings, body typography, and metadata labels.
  * **Carrot Orange (`#FF6B35`) [PANTONE 16-1361 TCX]:** Primary action buttons, active tab indicators, and solver triggers.
  * **Night Mode (`#000000`):** True Pure Black base with charcoal surfaces (`#121212`) and Wheat typography.
* **Component Architecture:**
  * **3-Domain Grouped Sidebar Navigation:** Operations (*Dashboard, Scheduler, Conflicts, Blocks & Timetable*), Planning (*Tasks, Plans, Compare*), and Administration (*Sector Assignment, Assets, Data Pipeline*).
  * **Admin Action Center:** 1-click execution for top bottlenecks, schedule review, and crew dispatch.
  * **Collapsible Telemetry Drawer:** Minimizes visual clutter while retaining instant access to flaw injections and delay simulators.
  * **Bounded-Scroll Kanban (`max-h-[580px]`):** Sector dispatch board with progressive pagination ("Load 10 More") and **Cards vs Compact List** view toggle.
* **State & Networking:** Axios with Bearer token interceptor, custom Context APIs (`LineContext`, `AuthContext`, `ThemeContext`), and WebSocket hooks with exponential backoff & jitter.
* **Visualization:** Recharts for corridor timelines, track occupancy meters, and SVG sparkline KPI cards.
* **Icons:** Lucide React modern railway and system iconography.

### ⚙️ Backend Layer
* **Runtime & Framework:** Python 3.12+ with FastAPI (Asynchronous ASGI REST API & WebSockets).
* **Validation & Settings:** Pydantic v2 with `ConfigDict` and `pydantic-settings`.
* **Database & Concurrency:** SQLAlchemy 2.0 with SQLite in **Write-Ahead Logging (WAL) Mode** (`PRAGMA journal_mode=WAL;`, `PRAGMA synchronous=NORMAL;`, `PRAGMA foreign_keys=ON;`) for lock-free concurrent reads during telemetry streaming. PostgreSQL-ready for production.
* **Server:** Uvicorn with lifespan management.

### 🧠 Core Mathematical & Algorithmic Engines
1. **Constraint Optimization Engine (Google OR-Tools CP-SAT):**
   * Integer interval programming formulation $[S_i, E_i]$ where $E_i = S_i + D_i$.
   * Hard constraints for track possession exclusivity, passenger headway safety buffers ($\ge 15\text{ min}$), and 25kV power cut co-requisites.
2. **Multi-Objective Pareto Engine:**
   * 4 operational presets: *Balanced Pareto*, *Maximum Track Safety*, *Commuter Punctuality First*, and *Fast Dynamic Heuristic (<50ms)*.
   * Continuous weight sliders balancing track safety ($w_1$), punctuality ($w_2$), and crew efficiency ($w_3$).
3. **UIC 406 Corridor Capacity & Bottleneck Analyzer:**
   * International Union of Railways (UIC 406) methodology.
   * Computes theoretical vs practical capacity, saturation index ($K\%$), and safe continuous maintenance headroom.
4. **Deterministic Multi-Criteria Urgency Scoring (MCA):**
   * Dynamically ranks 240+ maintenance requests based on Gross Million Tonnes (GMT), ultrasonic rail flaws (USFD), track geometry index, days overdue, and speed restrictions.
5. **Conflict & Timetable Clash Detector:**
   * Evaluates train schedule detentions and suggests 1-click automated mitigations (reroute, shift window, or cancel).

### 🔒 Cryptography & Security Architecture
* **HMAC-SHA256 Tamper-Evident Safety Permits:** Generates verifiable digital seals (`SEAL-XXXX-XXXX`) for Track Fit Certificates and TRD Power Block permits.
* **JSON Web Tokens (JWT HS256):** Cryptographically signed access tokens with Role-Based Access Control (`ADMIN`, `SECTION_CONTROLLER`, `COMMUTER_VIEWER`).
* **Field-Level Encryption:** Reversible cryptographic envelope (`ENC::...`) for operational hotlines and station security codes.
* **1-Click Digital Seal Verification:** Interactive verification tool verifying permit provenance and detecting field tampering.

### 📡 Data Pipelines & External Integrations
* **OpenStreetMap (OSM) Importer:** Ingests live railway track geometries and station coordinates for the Mumbai Suburban network.
* **Sunday Mega Block Scraper:** Extracts Central and Western Railway weekly press releases.
* **Twilio / WhatsApp Field Dispatch:** Formats structured WhatsApp work orders with 1-tap acknowledgement links for field supervisors.
* **Live Telemetry Engine:** WebSocket broadcast loop streaming simulated train positions, Kavach automatic braking aspects, and emergency flaw alerts.

---

## 3. Directory Layout

```
Railblock AI/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/          # REST route handlers (dashboard, tasks, scheduler, optimizer, security)
│   │   ├── core/                # Configuration, CORS, settings, and cryptographic security
│   │   ├── db/                  # SQLAlchemy engine, WAL session, and synthetic data seeder
│   │   ├── models/              # Relational models (Corridors, Assets, Tasks, Trains, Plans)
│   │   ├── schemas/             # Pydantic v2 request/response schemas
│   │   ├── repositories/        # Database query abstractions
│   │   ├── services/
│   │   │   ├── prioritization/  # Multi-criteria urgency scoring (GMT / USFD / Overdue)
│   │   │   ├── scheduling/      # OR-Tools CP-SAT, Pareto optimizer, UIC 406 capacity analyzer
│   │   │   ├── conflict_detection/ # Timetable and block clash validator
│   │   │   └── live_telemetry_engine.py # Kavach & real-time WebSocket feed
│   │   └── main.py              # FastAPI app instance, SPA handler, and lifespan
│   ├── tests/                   # 29 Pytest automated test suites
│   ├── requirements.txt         # Python dependencies
│   ├── .env.example             # Backend environment template
│   └── README.md                # Backend documentation
├── frontend/
│   ├── src/
│   │   ├── api/                 # Axios client, security API, and optimizer services
│   │   ├── components/          # Design system, modals, drawers, and controls
│   │   ├── context/             # AuthContext, LineContext, ThemeContext
│   │   ├── data/                # Corridor lines, sector units, and mock baselines
│   │   ├── hooks/               # useRealtimeFeed with backoff & jitter
│   │   ├── layouts/             # Grouped Shell layout with 3-domain navigation
│   │   ├── pages/               # Dashboard, Scheduler, Conflicts, Sector Assignment, etc.
│   │   ├── App.tsx              # Root React component
│   │   ├── main.tsx             # React DOM entry point
│   │   └── index.css            # Tailwind directives and Pantone Wheat/Carrot color tokens
│   ├── package.json             # Frontend dependencies
│   ├── vite.config.ts           # Vite bundler & reverse proxy config
│   └── tailwind.config.js       # Railway theme extension
├── docs/                        # Architectural documentation
├── RailBlock_AI_Comprehensive_System_Report.pdf # Publication-grade system audit report
├── README.md                    # Root project manual
└── .gitignore                   # Workspace gitignore (with SQLite WAL exclusions)
```

---

## 4. Getting Started

Run the frontend and backend in **two separate terminal windows** from the project root (`d:\projects\Railblock AI`).

### Terminal 1: Backend Setup & Execution

```powershell
# 1. Navigate to the backend directory
cd backend

# 2. Activate the virtual environment
.\venv\Scripts\Activate.ps1
# (CMD: venv\Scripts\activate.bat | Bash: source venv/Scripts/activate)

# 3. (Optional) Install dependencies
pip install -r requirements.txt

# 4. (Optional) Seed demonstration corridors, assets & timetable data
python -m app.db.seed

# 5. Start the FastAPI backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

> **Backend Endpoints:**
> * API Base: http://localhost:8000
> * Interactive Swagger Docs: http://localhost:8000/docs
> * Health Check: http://localhost:8000/health
> * Security Status: http://localhost:8000/api/security/status
> * Capacity Analysis: http://localhost:8000/api/optimizer/capacity-analysis

---

### Terminal 2: Frontend Setup & Execution

```powershell
# 1. Navigate to the frontend directory
cd frontend

# 2. (Optional) Install dependencies
npm install

# 3. Start the Vite development server
npm run dev
```

> **Frontend Web App:** http://localhost:5173

---

## 5. Running Automated Backend Test Suites

All 29 automated test suites verify end-to-end functionality across solvers, priority scoring, security seals, and API contracts:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
pytest
```

**Verification Output:**
```
======================== 29 passed, 1 warning in 1.56s ========================
```

---

## 6. Implementation Roadmap Status

- [x] **Phase 1: Project Scaffolding & Verification**
  - Modular directory architecture and FastAPI backend.
  - React 18, Vite, and Tailwind CSS frontend with dark/light themes.
  - SQLite database layer with Pydantic v2 schemas.
- [x] **Phase 2: Domain Modeling & Synthetic IR Dataset**
  - Central, Western, and Harbour corridor definitions (16 sections).
  - Multi-department maintenance demands across Civil, TRD, and S&T.
  - Timetable database with suburban rakes, Vande Bharat, and freight priorities.
- [x] **Phase 3: Prioritization Engine & Conflict Detection**
  - Multi-criteria asset criticality scoring (GMT, USFD rail flaws, speed restrictions).
  - Section-level clash matrix and detention penalty calculator.
- [x] **Phase 4: Optimization Algorithms & Solvers**
  - Google OR-Tools CP-SAT formulation for weekly and monthly block allocation.
  - Dynamic Pareto multi-objective optimization (Safety vs Punctuality vs Cost).
  - Fast O(N log N) greedy heuristic for real-time incident rescheduling (<50ms).
  - International UIC 406 Corridor Capacity Consumption & Maintenance Headroom Analyzer.
- [x] **Phase 5: Visual Controller UI & Modern Design System**
  - Custom Pantone Wheat, Magnetic Blue, Carrot Orange, and True Pure Black styling.
  - Grouped 3-Domain Navigation (*Operations, Planning & Tasks, Administration*).
  - Admin Action Center with 1-click bottleneck mitigations.
  - Bounded-scroll Sector Assignment Kanban with Cards/Compact view toggle.
  - 1-Click Schedule Benchmark CSV export.
- [x] **Phase 6: Cryptographic Protection & Safety Seals**
  - HMAC-SHA256 tamper-evident Work Permit and Track Fit Certificate seals.
  - JWT session tokens with Role-Based Access Control (`require_admin`).
  - Reversible field-level encryption for sensitive operational data.
  - Interactive in-app cryptographic signature verification tool.
