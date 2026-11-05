# RailBlock AI — Admin E2E Verification & Department Test Suites

> **Comprehensive End-to-End Test Suite for Indian Railways Admin & Operating Controllers**  
> Covers all 3 core technical departments (Engineering, TRD, S&T) and complete workspace capabilities.

---

## 📁 Test Case Directory Matrix

Each test case is housed in its own dedicated directory containing the scenario description (`README.md`) and runnable test script:

| # | Test Case Folder | Scope & Department | Description |
|---|---|---|---|
| **01** | [`01_engineering_track_maintenance/`](./01_engineering_track_maintenance/) | **Engineering (Civil / Track / P-Way)** | USFD IMR rail flaw replacement, CSM/BCM machine tamping, and multi-criteria urgency scoring (GMT + overdue days). |
| **02** | [`02_trd_catenary_power_block/`](./02_trd_catenary_power_block/) | **Traction Distribution (TRD / Electrical)** | 25kV AC OHE contact wire splice, neutral section overhaul, de-energization power block permit, and shadow bundling. |
| **03** | [`03_snt_signaling_interlocking/`](./03_snt_signaling_interlocking/) | **Signal & Telecom (S&T)** | Electronic Interlocking logic update, Digital Axle Counter (SSDAC) testing, and signal disconnection memo. |
| **04** | [`04_admin_hmac_safety_permits/`](./04_admin_hmac_safety_permits/) | **Security & Digital Safety Seals** | HMAC-SHA256 digital safety seal generation (`SEAL-XXXX-XXXX`), in-app verification, and anti-tamper detection. |
| **05** | [`05_admin_jwt_rbac_authorization/`](./05_admin_jwt_rbac_authorization/) | **Admin RBAC & Authentication** | JWT HS256 tokens, `ADMIN` privileged route execution, and HTTP 403 Forbidden gating for unauthorized roles. |
| **06** | [`06_pareto_multi_objective_optimizer/`](./06_pareto_multi_objective_optimizer/) | **Pareto Optimization Studio** | 4 solver presets (*Balanced Pareto, Safety Max, Punctuality First, Fast Heuristic*), dynamic weights, and $<50\text{ms}$ local search. |
| **07** | [`07_uic_406_corridor_capacity/`](./07_uic_406_corridor_capacity/) | **UIC 406 Capacity & Headroom** | Compression method capacity analysis, corridor saturation ($K\%$), and safe continuous maintenance headroom. |
| **08** | [`08_timetable_conflict_mitigation/`](./08_timetable_conflict_mitigation/) | **Conflict Detection & Timetables** | Independent headway safety buffer auditing ($\ge 15\text{ min}$), clash matrix validation, and baseline comparison. |
| **09** | [`09_sector_assignment_dispatch/`](./09_sector_assignment_dispatch/) | **Sector Kanban & Mobile Dispatch** | Sector squad assignment, formatted WhatsApp dispatch memo preview, 1-tap mobile ACK/FIT, and hotline encryption. |
| **10** | [`10_emergency_telemetry_wire_failure/`](./10_emergency_telemetry_wire_failure/) | **Real-Time Telemetry & Emergencies** | Live SCADA snapshot, emergency catenary wire drop / rail fracture injection, 20 km/h caution orders, and WebSocket alerts. |

---

## 🚀 Running the Tests

### Run All 10 Admin User Test Cases
```powershell
pytest admin_test_cases
```

### Run an Individual Test Case Folder
```powershell
# E.g. Run Case 01 (Engineering):
pytest admin_test_cases/01_engineering_track_maintenance

# E.g. Run Case 02 (TRD Electrical):
pytest admin_test_cases/02_trd_catenary_power_block

# E.g. Run Case 04 (HMAC Digital Seals):
pytest admin_test_cases/04_admin_hmac_safety_permits
```

### Run the Entire Workspace (54 Test Suites)
```powershell
pytest
```
