# Test Case 03: S&T Department Signaling & Electronic Interlocking Workflow

## 1. Metadata
* **Department:** Signal & Telecommunication (S&T)
* **Admin Persona:** Senior Divisional Signal & Telecom Engineer (Sr. DSTE)
* **Target Corridor:** Mumbai Suburban Interlocking Network (Kalyan / Dadar Junctions)
* **Primary Scope:** Electronic Interlocking (EI) logic update, Digital Axle Counter (SSDAC) recalibration, Point Machine maintenance, and Signal Disconnection Notice issuance.

## 2. Test Objectives
1. Verify that an Admin can create and schedule critical S&T maintenance requiring signal disconnection.
2. Verify that S&T assets (`ELECTRONIC_INTERLOCKING`, `POINT_MACHINE`, `SIGNAL_POST`, `AXLE_COUNTER`) carry strict safety fail-safe ratings (criticality = 5).
3. Validate that S&T tasks are properly isolated and tagged under `SIGNAL_TELECOMMUNICATION`.
4. Ensure the system enforces earliest start and completion deadlines to prevent lingering signal disconnects.

