# Test Case 08: Admin Timetable Conflict Detection & Mitigation Workflow

## 1. Metadata
* **Domain:** Timetable Conflict Detection & Safety Boundary Auditing
* **Admin Persona:** Chief Section Controller / Safety Validator
* **Target Corridor:** Mumbai Fast/Slow Suburban Corridors
* **Primary Scope:** Independent schedule conflict validation (`/api/schedules/{plan_id}/conflicts`), train timetable clash auditing, safety buffer verification ($\ge 15\text{ min}$), and comparison against baseline heuristic.

## 2. Test Objectives
1. Verify that the Admin can trigger schedule generation via OR-Tools CP-SAT or retrieve active maintenance plans.
2. Verify that `/api/schedules/{plan_id}/conflicts` independently audits for:
   * Train headway encroachments ($\ge 15\text{ min}$ buffer)
   * Track possession collisions
   * Window boundary breaches
3. Verify that `/api/schedules/{plan_id}/comparison` benchmarks the plan against a FIFO baseline heuristic.
4. Ensure conflict details include train IDs, section names, and risk severity ratings.
