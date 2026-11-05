# Test Case 06: Admin Pareto Multi-Objective Optimization Studio

## 1. Metadata
* **Domain:** Mathematical Constraint Programming & Timetable Optimization
* **Admin Persona:** Chief Planning Officer / Timetable Superintendent
* **Primary Scope:** Google OR-Tools CP-SAT solver, Multi-Objective Pareto Frontier optimization, continuous weight balancing (Safety vs Punctuality vs Cost), and Fast Real-Time Heuristic (<50ms).

## 2. Test Objectives
1. Verify execution of all 4 operational presets:
   * `BALANCED_PARETO`
   * `SAFETY_MAX`
   * `PUNCTUALITY_FIRST`
   * `FAST_HEURISTIC`
2. Validate that the Fast Dynamic Heuristic completes execution in $< 50\text{ms}$ for real-time incident response.
3. Validate that safety buffer constraints (15 minutes) prevent block boundary overlaps.
4. Ensure Pareto analysis returns computed trade-offs (e.g. `aggregate_safety_score`, `total_detention_penalty_minutes`, `crew_utilization_efficiency`).

