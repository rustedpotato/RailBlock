# Test Case 04: Admin HMAC-SHA256 Digital Safety Permits & Anti-Tamper Verification

## 1. Metadata
* **Domain:** Safety Governance & Cryptographic Assurance
* **Admin Persona:** Divisional Chief Controller / Safety Commissioner
* **Primary Scope:** HMAC-SHA256 tamper-evident digital safety seals (`SEAL-XXXX-XXXX`), Track Fit Certificates, and field signature integrity verification.

## 2. Test Objectives
1. Verify generation of unique cryptographic safety seals combining task ID, corridor, supervisor, and UTC timestamp.
2. Verify in-app verification API (`/api/security/verify-seal`) returns valid cryptographic provenance when metadata matches.
3. Verify anti-tamper rejection: modifying supervisor name, timestamp, or corridor must immediately return `valid: false` and detect forgery.
4. Verify overall system security status endpoint (`/api/security/status`).

