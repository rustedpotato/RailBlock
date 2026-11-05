# Test Case 09: Admin Sector Assignment & WhatsApp Field Dispatch Workflow

## 1. Metadata
* **Domain:** Sector Crew Assignment & Field Work Order Dispatch
* **Admin Persona:** Divisional Section Controller / Dispatch Supervisor
* **Target Corridor:** Mumbai Western & Central Divisions
* **Primary Scope:** Assigning tasks to sector maintenance gangs, status transitions, previewing/sending formatted WhatsApp dispatch memos, and 1-tap mobile acknowledgement.

## 2. Test Objectives
1. Verify that the Admin can generate a formatted WhatsApp dispatch memo for field supervisors via `/api/dispatch/preview`.
2. Verify that the generated memo includes:
   * Indian Railways official memo header
   * Target section, department, and allocated machinery
   * 25kV power isolation / S&T disconnection notices
   * Direct `wa.me` quick-dispatch link
3. Verify that 1-tap supervisor action links (`ACK`, `FIT`) record properly into the dispatch log (`/api/dispatch/log`).
4. Ensure field hotline numbers and sensitive substation codes can be securely encrypted.

