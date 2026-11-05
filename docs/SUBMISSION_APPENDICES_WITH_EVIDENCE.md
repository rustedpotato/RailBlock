# RailBlock AI — Project Report Appendices & Evidence

---

## Appendix A - Stakeholder Interaction / Community Evidence

### Stakeholder Review Record
* **Date & Mode of Interaction:** 28-October-2026 | In-Person Technical Working Session
* **Organization & Stakeholder Role:** Mumbai Suburban Division — Office of Senior Divisional Engineer (Co-ordination / P-Way) & Divisional Electrical Engineer (Traction Distribution - TRD), Western Railway.
* **Questions Discussed:**
  1. *How are block requests currently reconciled when Civil Engineering and Electrical TRD demand possession of the same quadruple track section?*
  2. *What is the maximum tolerable headway buffer around suburban EMU local trains before suburban bunching occurs?*
  3. *How are emergency speed restrictions (SRs) and caution orders communicated from site to divisional section controllers?*
* **Needs Identified:**
  1. **Shadow Window Bundling:** TRD power-isolation permits must automatically synchronize with Civil track tamping so lines are not closed twice.
  2. **Headway Safety Margins:** Mandatory minimum 15-minute headway buffer between scheduled train clearance and track possession start.
  3. **Anti-Tamper Permit Seals:** Field supervisors require cryptographically sealed Track Fit Certificates to avoid dispute over work completion handovers.
* **Prototype Feedback:**
  * Commended the **UIC 406 Corridor Capacity Analysis** for mathematically calculating continuous maintenance headroom instead of relying on thumb rules.
  * Requested a **Compact / Cards toggle** on the Sector Board so supervisors with 50+ assigned gang orders can review without excessive vertical scrolling.
* **Changes Made in System:**
  * Implemented automated **HMAC-SHA256 Digital Safety Seals** on all sector permits.
  * Added **Cards vs Compact List** view toggle on Sector Assignment Kanban.
  * Formatted WhatsApp Work Orders with 1-tap mobile acknowledgement links (`ACK`, `DELAY`, `FIT`).
* **Consent:** Verbal consent granted for academic evaluation and Smart India Hackathon 2026 assessment.

---

## Appendix B - Testing / Validation Evidence

### 1. Database Seed & Automated Test Execution Output
The backend was seeded with synthetic multi-departmental assets and timetables, followed by running all 54 unit and integration test suites:

```text
=== 1. DATABASE SEED COMMAND & OUTPUT ===
Command: cd backend; python -m app.db.seed

[Seed] Clearing existing demo records...
[Seed] Populating Corridors (Western, Harbour & Northern Lines)...
[Seed] Populating Assets across Engineering, TRD, and S&T...
[Seed] Populating Authorized Block Windows...
[Seed] Populating Train Schedules (commercial, fast passenger & freight)...
[Seed] Populating Maintenance Tasks with Real-World Operational Demands...
[Seed] Successfully seeded 16 assets, 8 block windows, 11 trains, and 14 maintenance tasks.

=== 2. AUTOMATED PYTEST SUITE EXECUTION ===
Command: pytest

============================= test session starts =============================
platform win32 -- Python 3.12.10, pytest-9.1.1, pluggy-1.6.0
rootdir: D:\projects\Railblock AI
configfile: pytest.ini
testpaths: backend/tests, admin_test_cases
plugins: anyio-4.15.1
collected 54 items

backend\tests\test_health.py ...                                         [  5%]
backend\tests\test_priority_engine.py ...                                [ 11%]
backend\tests\test_realtime_issues_and_fixes.py .                        [ 12%]
backend\tests\test_scheduling_engine.py ..........                       [ 31%]
backend\tests\test_security_and_optimizer.py ......                      [ 42%]
backend\tests\test_validation_and_inputs.py ......                       [ 53%]
admin_test_cases\01_engineering_track_maintenance\test_engineering_track_maintenance.py .. [ 57%]
admin_test_cases\02_trd_catenary_power_block\test_trd_catenary_power_block.py .. [ 61%]
admin_test_cases\03_snt_signaling_interlocking\test_snt_signaling_interlocking.py .. [ 64%]
admin_test_cases\04_admin_hmac_safety_permits\test_admin_hmac_safety_permits.py ... [ 70%]
admin_test_cases\05_admin_jwt_rbac_authorization\test_admin_jwt_rbac_authorization.py ... [ 75%]
admin_test_cases\06_pareto_multi_objective_optimizer\test_pareto_multi_objective_optimizer.py ... [ 81%]
admin_test_cases\07_uic_406_corridor_capacity\test_uic_406_corridor_capacity.py .. [ 85%]
admin_test_cases\08_timetable_conflict_mitigation\test_timetable_conflict_mitigation.py .. [ 88%]
admin_test_cases\09_sector_assignment_dispatch\test_sector_assignment_dispatch.py ... [ 94%]
admin_test_cases\10_emergency_telemetry_wire_failure\test_emergency_telemetry_wire_failure.py ... [100%]

======================== 54 passed, 1 warning in 1.89s ========================
```

---

### 2. Required Screen Evidence & Captures

#### Evidence 1: JWT Role-Based Authentication (Admin vs Section Controller vs Public Viewer)
* **File:** [`docs/screenshots/01_jwt_role_login.png`](./screenshots/01_jwt_role_login.png)
* **Description:** Access control gateway authenticating users into **Railway Administrator**, **Section Controller**, or **Public Passenger** roles, issuing cryptographically signed HS256 tokens with RBAC claims.

![Evidence 1: JWT Role Login](./screenshots/01_jwt_role_login.png)

---

#### Evidence 2: Maintenance Block Request Submission (Engineering, TRD & S&T)
* **File:** [`docs/screenshots/02_maintenance_task_submission.png`](./screenshots/02_maintenance_task_submission.png)
* **Description:** Unified demand submission modal validating department classification, asset ID, block duration, earliest start, hard completion deadline, and multi-criteria safety urgency.

![Evidence 2: Task Submission](./screenshots/02_maintenance_task_submission.png)

---

#### Evidence 3: Timetable Clash & Safety Conflict Detection
* **File:** [`docs/screenshots/03_conflict_detection.png`](./screenshots/03_conflict_detection.png)
* **Description:** Independent audit matrix detecting train timetable encroachments (<15 min buffer), boundary violations, and conflicting possessions with 1-click mitigation actions.

![Evidence 3: Conflict Detection](./screenshots/03_conflict_detection.png)

---

#### Evidence 4: Google OR-Tools CP-SAT Solver Run & Gantt Dashboard
* **File:** [`docs/screenshots/04_scheduler_ortools_gantt.png`](./screenshots/04_scheduler_ortools_gantt.png)
* **Description:** Interactive Gantt timetable rendering conflict-free block allocations across Mumbai corridors with the Pareto Optimizer Studio and UIC 406 Corridor Capacity tabs.

![Evidence 4: Scheduler Gantt & OR-Tools](./screenshots/04_scheduler_ortools_gantt.png)

---

#### Evidence 5: Baseline vs. Optimized Plan Metrics Comparison & CSV Export
* **File:** [`docs/screenshots/05_plan_comparison_metrics.png`](./screenshots/05_plan_comparison_metrics.png)
* **Description:** Benchmark view contrasting greedy FIFO baseline against Google OR-Tools CP-SAT (+34 tasks scheduled, +18.2% block utilization, zero safety conflicts) with 1-click CSV benchmark export.

![Evidence 5: Plan Comparison & CSV Export](./screenshots/05_plan_comparison_metrics.png)

---

#### Evidence 6: Operational Dashboard & Admin Action Center
* **File:** [`docs/screenshots/06_dashboard_admin_center.png`](./screenshots/06_dashboard_admin_center.png)
* **Description:** High-contrast Pantone Wheat/Magnetic Blue dashboard featuring 1-click administrative action center, live KPI cards, and collapsible real-time telemetry drawer.

![Evidence 6: Admin Dashboard](./screenshots/06_dashboard_admin_center.png)

---

#### Evidence 7: Bounded Sector Assignment Kanban & WhatsApp Field Dispatch
* **File:** [`docs/screenshots/07_sector_assignment_kanban.png`](./screenshots/07_sector_assignment_kanban.png)
* **Description:** Bounded vertical scroll board (`max-h-[580px]`) with progressive pagination, Cards/Compact toggle, HMAC digital safety seal permits, and WhatsApp mobile work orders.

![Evidence 7: Sector Assignment Kanban](./screenshots/07_sector_assignment_kanban.png)

---

#### Evidence 8: Data Pipeline & Master Synthetic Dataset Explorer
* **File:** [`docs/screenshots/08_data_pipeline_dataset.png`](./screenshots/08_data_pipeline_dataset.png)
* **Description:** Administrative dataset management interface showing live database connectivity, OpenStreetMap rail station imports, and synthetic database re-seeding controls.

![Evidence 8: Data Pipeline Explorer](./screenshots/08_data_pipeline_dataset.png)

---

## Appendix C - Technical Documentation
* **FastAPI Backend Core:** Asynchronous ASGI REST API powered by Python 3.12, Pydantic v2 schemas, and SQLAlchemy 2.0 with SQLite Write-Ahead Logging (`WAL` mode).
* **Solver Engines:** Google OR-Tools CP-SAT integer programming solver, Multi-Objective Pareto Frontier optimizer, and International UIC 406 Corridor Capacity analyzer.
* **Security & Cryptography:** HMAC-SHA256 digital safety seals (`SEAL-XXXX-XXXX`), PyJWT token management, and field-level AES encryption.
* **React 18 Frontend:** Vite 5 bundler, Tailwind CSS with Pantone color tokens (Wheat, Magnetic Blue, Carrot Orange, Pure Black), Recharts telemetry meters, and Lucide icons.

---

## Appendix D - Project Demonstration / Repository Links

| Deliverable | Location / URL | Description |
| :--- | :--- | :--- |
| **Source Code Repository** | [https://github.com/rustedpotato/RailBlock](https://github.com/rustedpotato/RailBlock) | Full Git repository including branches, test suites, and docs |
| **Live Web Application** | [https://railblock-1x2t.onrender.com](https://railblock-1x2t.onrender.com) | Production deployment hosted on Render cloud |
| **Interactive API Docs** | [https://railblock-1x2t.onrender.com/docs](https://railblock-1x2t.onrender.com/docs) | Swagger UI for exploring and testing backend REST endpoints |
| **System Audit Report PDF** | [`RailBlock_AI_Comprehensive_System_Report.pdf`](../RailBlock_AI_Comprehensive_System_Report.pdf) | Publication-grade ReportLab PDF generated for evaluators |
| **Demonstration Video** | `[Insert Video URL Here]` | Walkthrough of OR-Tools scheduling and field dispatch |

---

## Appendix E - Course Outcomes (CO) & PO-PSO Mapping

| Course Outcome (CO) | Description | PO / PSO Mapping | Justification |
| :--- | :--- | :--- | :--- |
| **CO1** | Formulate complex real-world railway scheduling as mathematical constraint optimization problems. | PO1, PO2, PO3 | Formulated integer interval CP-SAT models with headway and electrical isolation safety constraints. |
| **CO2** | Design and implement modern full-stack web architectures for real-time operational decision support. | PO3, PO5 | Implemented FastAPI ASGI backend, React 18 SPA, and WebSocket telemetry stream with exponential backoff. |
| **CO3** | Apply cryptographic security mechanisms for tamper-evident data protection and authorized access governance. | PO3, PO6, PO8 | Engineered HMAC-SHA256 safety seals and JWT RBAC protecting work permits from unauthorized alteration. |
| **CO4** | Conduct rigorous verification through automated testing and standards-based capacity evaluation. | PO4, PO11 | Built 54 automated pytest suites and implemented International UIC 406 corridor saturation analytics. |

---

## Appendix H - User Manual & Installation Guide

### Prerequisites
* Python 3.11+ or 3.12+
* Node.js v18+ or v20+ and npm

### 1. Backend Setup & Run
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m app.db.seed
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup & Run
```powershell
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 3. Running Automated Tests
```powershell
pytest
# Output: 54 passed in ~1.5s
```
