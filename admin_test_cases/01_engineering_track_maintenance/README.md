# Test Case 01: Engineering Department Track Maintenance & USFD Flaw Workflow

## 1. Metadata
* **Department:** Engineering (Civil / Track / P-Way)
* **Admin Persona:** Chief Divisional Engineer (Sr. DEN / Co-ordination)
* **Target Corridor:** Mumbai Central — Borivali Fast Line (`WR-MCT-BVI-FAST`)
* **Primary Scope:** Ultrasonic Flaw Detection (USFD) mitigation, rail replacement, tamping machine possession, and Multi-Criteria Urgency (MCA) ranking.

## 2. Test Objectives
1. Verify that an Admin can create and submit high-priority Civil Engineering track maintenance tasks (e.g. USFD `IMR` - Immediate Removal flaw).
2. Validate that the **Priority Engine** correctly incorporates Gross Million Tonnes (GMT > 40), overdue days, and structural criticality to produce a priority score $> 70.0$.
3. Verify that track length, machine requirements (BCM/CSM tamping rake), and speed restrictions are validated.
4. Verify that the task is retrieved in the tasks endpoint with proper status `PENDING` ready for block allocation.
