# RailBlock AI (SIH 2026 — SIH26027)

> **AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways**

RailBlock AI is an intelligent operations research and automated scheduling platform engineered for the Ministry of Railways. The system consolidates maintenance requirements across **Engineering (Civil/Track)**, **Traction Distribution (TRD/Electrical)**, and **Signal & Telecommunication (S&T)** departments, balancing maintenance urgency with train timetable constraints to generate optimal, conflict-free weekly and monthly maintenance block schedules.

---

## 1. System Architecture & Directory Layout

```
Railblock AI/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/          # REST route handlers (health, maintenance, scheduling)
│   │   ├── core/                # App configuration, settings, and CORS
│   │   ├── db/                  # SQLAlchemy engine, session, and declarative base
│   │   ├── models/              # Database entities
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   ├── repositories/        # Database query abstractions
│   │   ├── services/
│   │   │   ├── prioritization/  # Multi-department task urgency scoring
│   │   │   ├── scheduling/      # Google OR-Tools CP-SAT constraint engine
│   │   │   └── conflict_detection/ # Timetable and block conflict analyzer
│   │   ├── utils/               # Common helper utilities
│   │   └── main.py              # FastAPI app instance and lifespan
│   ├── tests/                   # Pytest automated test suites
│   ├── requirements.txt         # Python dependencies
│   ├── .env.example             # Backend environment template
│   └── README.md                # Backend documentation
├── frontend/
│   ├── public/                  # Public assets
│   ├── src/
│   │   ├── api/                 # Axios client and API services
│   │   ├── assets/              # Static styling assets
│   │   ├── components/          # Reusable design system components
│   │   ├── features/            # Feature modules (dashboard, maintenance, scheduling, assets)
│   │   ├── hooks/               # Custom React hooks
│   │   ├── layouts/             # Page layouts
│   │   ├── pages/               # Route views
│   │   ├── routes/              # React Router definitions
│   │   ├── types/               # TypeScript domain interfaces
│   │   ├── utils/               # Formatters and date helpers
│   │   ├── App.tsx              # Root React component & health diagnostic view
│   │   ├── main.tsx             # React DOM entry point
│   │   └── index.css            # Tailwind CSS directives
│   ├── package.json             # Frontend dependencies
│   ├── vite.config.ts           # Vite bundler & reverse proxy config
│   ├── tailwind.config.js       # Custom railway theme palette
│   ├── .env.example             # Frontend environment template
│   └── README.md                # Frontend documentation
├── docs/
│   ├── architecture.md          # Full architectural specification
│   └── api-reference.md         # API route specifications
├── README.md                    # Root project manual
└── .gitignore                   # Workspace gitignore
```

---

## 2. Tech Stack

| Domain | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | React 18 + Vite | Fast HMR, component architecture |
| | TypeScript | Strict type checking |
| | Tailwind CSS | Sleek dark UI with railway color accents |
| | Axios | REST communication with interceptors |
| | Lucide React | Modern railway and system iconography |
| | Recharts | Timetable & block visualization charts |
| **Backend** | Python 3.12+ | High-performance core runtime |
| | FastAPI | Asynchronous REST API framework |
| | Pydantic v2 | Schema validation and serialization |
| | SQLAlchemy 2.0 | SQLite (development) & PostgreSQL ready |
| | Google OR-Tools | CP-SAT constraint optimization engine |
| | Uvicorn | ASGI web server |

---

## 3. Getting Started

Run the frontend and backend as **two completely separate applications** in separate terminal windows.

### Terminal 1: Backend Setup & Execution

#### Step 1: Navigate to the backend directory
```powershell
cd backend
```

#### Step 2: Create a virtual environment
*Python 3.12 is recommended for complete OR-Tools wheel support:*
```powershell
py -3.12 -m venv venv
```
*(or `python -m venv venv`)*

#### Step 3: Activate the virtual environment
**On Windows PowerShell:**
```powershell
.\venv\Scripts\Activate.ps1
```
*(If you see an execution policy error, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` and rerun).*

**On Linux/macOS:**
```bash
source venv/bin/activate
```

#### Step 4: Install backend dependencies
```powershell
pip install --upgrade pip
pip install -r requirements.txt
```

#### Step 5: Start the backend server
```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Verify backend in your browser:
- API Base: [http://localhost:8000](http://localhost:8000)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)
- Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Terminal 2: Frontend Setup & Execution

#### Step 1: Navigate to the frontend directory
```powershell
cd frontend
```

#### Step 2: Install dependencies
```powershell
npm install
```

#### Step 3: Start the frontend development server
```powershell
npm run dev
```

Open your browser to:
- Frontend UI: [http://localhost:5173](http://localhost:5173)

The frontend automatically connects to the backend at `http://localhost:8000` via Axios and Vite's internal reverse proxy, displaying live system health and diagnostic metadata.

---

## 4. CORS Configuration for Local Development

Cross-Origin Resource Sharing (CORS) is pre-configured in `backend/app/core/config.py` and `backend/.env`:
```env
BACKEND_CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173","http://localhost:3000"]
```
This enables the frontend running on port `5173` to make direct cross-origin API calls or use Vite's proxy at `/health` and `/api/v1/*`.

---

## 5. Running Automated Backend Tests

In the backend terminal with the virtual environment activated:
```powershell
pytest
```

---

## 6. Implementation Roadmap

- [x] **Phase 1: Project Scaffolding & Verification**
  - Modular directory architecture established.
  - Minimal working FastAPI backend with `/health` and `/api/v1/health`.
  - Minimal working React/Vite/Tailwind frontend connecting to backend.
  - Local SQLite database layer initialized.
  - Comprehensive documentation and environment templates.
- [ ] **Phase 2: Domain Modeling & Synthetic IR Dataset**
  - Track section, station, and block asset schemas.
  - Multi-department maintenance demand intake (Civil, TRD, S&T).
  - Synthetic train timetable dataset with realistic train priorities (Vande Bharat, Rajdhani, Express, Goods).
- [ ] **Phase 3: Prioritization Engine & Conflict Detection**
  - Multi-criteria asset criticality scoring (gross million tonnes, track degradation, speed restrictions).
  - Track-section and power-block conflict matrix.
- [ ] **Phase 4: Google OR-Tools Block Optimizer**
  - CP-SAT formulation for weekly and monthly block allocation.
  - Joint integrated block consolidation (Engineering + TRD + S&T).
  - Detention minimization and feasible schedule export.
- [ ] **Phase 5: Interactive Visual Block Planner UI**
  - Interactive corridor timeline and Gantt charts using Recharts.
  - Department demand submission portals and scenario simulator.
