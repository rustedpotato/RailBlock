# RailBlock AI — System Architecture

**Problem Statement ID:** SIH26027  
**Title:** AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways  
**System:** RailBlock AI  

---

## 1. Executive Summary

RailBlock AI is an intelligent operations research and automated scheduling platform engineered for Indian Railways (IR). It automates and optimizes the allocation of **maintenance blocks** (time windows during which train operations are held or diverted on specific track sections) across three critical departments:
1. **Engineering (Civil / Track & Bridges)**: Track renewal, ballast tamping, rail welding, bridge inspections.
2. **Traction Distribution (TRD / Electrical)**: Overhead Equipment (OHE) checks, power block isolations, cantilever adjustments.
3. **Signal & Telecommunication (S&T)**: Point machine overhauls, track circuit testing, electronic interlocking, signal post inspections.

The system simultaneously balances maintenance urgency with timetable constraints, minimizing train detention, schedule disruptions, and passenger delay penalties while maximizing rail asset reliability.

---

## 2. High-Level System Architecture

```mermaid
graph TD
    subgraph Frontend ["Frontend (React + Vite + TypeScript)"]
        UI[Tailwind UI & Lucide Icons]
        Router[React Router]
        State[State / Hooks]
        AxiosClient[Axios API Client]
        Charts[Recharts Visualizations]
    end

    subgraph Backend ["Backend (FastAPI + Python 3.12)"]
        API[FastAPI REST API Routes]
        Core[Core Config & Security]
        Prioritize[Prioritization Engine (Safety & Asset Risk)]
        Conflict[Conflict Detection & Corridor Topology]
        Scheduler[OR-Tools CP-SAT Constraint Engine]
        Repo[Repository Layer]
        DB[(SQLAlchemy ORM - SQLite / PostgreSQL)]
    end

    AxiosClient -->|HTTP/REST with CORS| API
    API --> Prioritize
    API --> Conflict
    Prioritize --> Scheduler
    Conflict --> Scheduler
    Scheduler --> Repo
    Repo --> DB
```

---

## 3. Technology Stack

| Layer | Component | Selection | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend** | Build & Dev Tool | Vite + TypeScript | High-performance bundling and strict type safety |
| | Framework | React 18 / 19 | Component-driven UI architecture |
| | Styling | Tailwind CSS | Modern responsive design with custom railway themes |
| | Routing | React Router v6 | Modular page and feature routing |
| | Data Fetching | Axios | Unified HTTP client with interceptors |
| | Visualization | Recharts & Lucide | Corridor charts, block timelines, and UI iconography |
| **Backend** | Framework | FastAPI (Python) | High-throughput asynchronous REST API |
| | Schemas | Pydantic v2 | Data validation and serialization |
| | ORM | SQLAlchemy 2.0 | PostgreSQL production ready, SQLite local development |
| | Optimization | Google OR-Tools (CP-SAT) | Constraint programming for maintenance scheduling |
| | Testing | Pytest & HTTPX | Automated test suites for routes and solvers |

---

## 4. Maintenance Block Optimization Engine

The core planning problem is formulated as a **Constrained Multi-Departmental Scheduling Problem** solved via Google OR-Tools CP-SAT:

1. **Variables**: Start and end times of maintenance blocks per section, direction (Up/Down/Bi-directional), and track line.
2. **Hard Constraints**:
   - **No Collision**: Maintenance blocks cannot overlap with immovable high-priority train paths (e.g., Vande Bharat, Rajdhani, express trains) on the same section without planned diversions.
   - **Safety Clearance**: Adjacent line restrictions when heavy track machine (tamping/ballast cleaning machine) operations require safety buffers.
   - **Combined Block Coordination**: Where Engineering, TRD, and S&T tasks require the same block section, the engine consolidates them into a single **Joint Integrated Maintenance Block** (Shadow Block) to eliminate redundant line blocks.
   - **Resource Feasibility**: Machine crews, OHE tower wagons, and inspection trolleys must satisfy crew duty hours and turnaround intervals.
3. **Objective Functions**:
   - Maximize prioritized asset maintenance completion.
   - Minimize aggregate passenger and freight train detention minutes.
   - Minimize total number of separate line block interventions via joint blocking.

---

## 5. Security and Deployment

- **CORS Management**: Strict origin whitelisting in FastAPI for development (`localhost:5173`) and production.
- **Environment Isolation**: Distinct `.env` configurations for local SQLite development and staging/production PostgreSQL setups.
- **Auditing & Logging**: Structured request logging and traceable schedule versioning.
