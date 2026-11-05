# Test Case 02: TRD Department 25kV Catenary & Power Block Workflow

## 1. Metadata
* **Department:** Traction Distribution (TRD / Electrical)
* **Admin Persona:** Senior Divisional Electrical Engineer (Sr. DEE / TRD)
* **Target Corridor:** Mumbai Churchgate — Virar 25kV AC Electrified Corridor
* **Primary Scope:** 25kV OHE contact wire wear replacement, neutral section isolator inspection, power block permit issuance, and co-requisite bundling with civil engineering.

## 2. Test Objectives
1. Verify that an Admin can create and schedule a TRD electrical maintenance task requiring 25kV power cut.
2. Validate that TRD assets (`OHE_SEGMENT`, `SUBSTATION`, `NEUTRAL_SECTION`) carry electrical safety criticality and require shadow bundling.
3. Validate that TRD tasks are queryable via department filtering (`TRACTION_DISTRIBUTION`).
4. Ensure power block duration constraints (e.g. 120-minute de-energized possession) are validated against feeder boundaries.

