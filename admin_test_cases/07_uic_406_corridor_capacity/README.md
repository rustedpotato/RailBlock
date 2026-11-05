# Test Case 07: Admin UIC 406 Corridor Capacity & Headroom Analysis

## 1. Metadata
* **Domain:** International Railway Capacity Standards (UIC 406)
* **Admin Persona:** Divisional Operations Manager (DOM) / Traffic Inspector
* **Target Corridor:** Mumbai Western & Central Suburban Network
* **Primary Scope:** Compression method capacity evaluation, corridor saturation percentage ($K\%$), and safe continuous maintenance window headroom estimation.

## 2. Test Objectives
1. Verify that the Admin can query network-wide UIC 406 capacity data via `/api/optimizer/capacity-analysis`.
2. Validate that each suburban section returns:
   * Theoretical Capacity (trains/hour)
   * Practical Capacity (trains/hour)
   * Saturation Rate ($K\%$)
   * Usable Continuous Maintenance Headroom (minutes)
   * Operational Status (`SATURATED`, `HEAVY`, `BALANCED`, `MAINTENANCE_FRIENDLY`)
3. Validate specific single-section querying (e.g. `MUMBAI CENTRAL - DADAR FAST`).
4. Ensure highly saturated sections (>80%) properly alert the Admin that heavy work requires night blocks.

