# Test Case 10: Admin Real-Time Emergency OHE Wire Drop & Rail Defect Handling

## 1. Metadata
* **Domain:** Real-Time SCADA/Telemetry Operations & Emergency Incidents
* **Admin Persona:** Chief Controller (Emergency & Disaster Management)
* **Target Corridor:** Mumbai Central — Bandra Fast Line (`Western Railway`)
* **Primary Scope:** Live SCADA telemetry snapshot (`/api/realtime/snapshot`), simulating an emergency 25kV catenary wire parting / rail fracture, automatic 20 km/h caution order restriction, signal aspect degradation to YELLOW/RED, and real-time WebSocket alert broadcasting.

## 2. Test Objectives
1. Verify that the Admin can inspect the live operational snapshot (active trains, block occupancies, signal aspects).
2. Simulate an emergency incident: trigger defect via `/api/realtime/trigger-defect` (e.g. "OHE Contact Wire Drop at KM 12/4").
3. Verify that the targeted section immediately:
   * Sets status to `CAUTION`
   * Enforces automatic speed restriction (reduced to $20\text{ km/h}$)
   * Degrades signal aspect to `YELLOW`
   * Appends emergency event to the live telemetry stream
4. Test train delay simulation via `/api/realtime/trigger-delay` and verify reschedule prompt generation.

