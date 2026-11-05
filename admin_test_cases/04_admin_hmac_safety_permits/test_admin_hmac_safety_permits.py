"""
Test Case 04: Admin HMAC-SHA256 Digital Safety Permits & Anti-Tamper Verification
Scope: Cryptographic permit seals, signature verification, and anti-forgery detection.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import generate_permit_seal, verify_permit_seal

client = TestClient(app)


def test_hmac_safety_seal_generation_and_verification():
    """Admin generates a digital safety permit seal for track possession."""
    task_id = "TSK-SIH-PERMIT-108"
    corridor = "CENTRAL-MAIN-KYN-CSMT"
    supervisor = "Anil Kulkarni (SSE/P-Way/Dadar)"
    issued_at = "05-Nov-2026 12:00:00 UTC"

    seal = generate_permit_seal(task_id, corridor, supervisor, issued_at)
    assert seal.startswith("SEAL-")
    parts = seal.split("-")
    assert len(parts) == 3
    assert len(parts[1]) == 8
    assert len(parts[2]) == 8

    # Verify via internal core security function
    assert verify_permit_seal(seal, task_id, corridor, supervisor, issued_at) is True


def test_hmac_safety_seal_anti_tamper_rejection():
    """Admin tests that altering any field (supervisor/time/corridor) triggers tamper detection."""
    task_id = "TSK-SIH-PERMIT-108"
    corridor = "CENTRAL-MAIN-KYN-CSMT"
    supervisor = "Anil Kulkarni (SSE/P-Way/Dadar)"
    issued_at = "05-Nov-2026 12:00:00 UTC"

    seal = generate_permit_seal(task_id, corridor, supervisor, issued_at)

    # 1. Tampered supervisor
    assert verify_permit_seal(seal, task_id, corridor, "Unauthorized Third Party", issued_at) is False

    # 2. Tampered time
    assert verify_permit_seal(seal, task_id, corridor, supervisor, "05-Nov-2026 12:05:00 UTC") is False

    # 3. Tampered corridor
    assert verify_permit_seal(seal, task_id, "WR-CCG-BVI", supervisor, issued_at) is False


def test_api_verify_seal_endpoint():
    """Admin calls REST verification endpoint to validate an issued permit seal."""
    task_id = "TSK-2026-ENG-44"
    corridor = "HARBOUR-LINE-PNVL-CSMT"
    supervisor = "S. Ramanathan (ADEN/Harbour)"
    issued_at = "05-Nov-2026 15:30:00 UTC"

    seal = generate_permit_seal(task_id, corridor, supervisor, issued_at)

    # Valid payload
    response = client.post("/api/security/verify-seal", json={
        "cryptographic_seal": seal,
        "task_id": task_id,
        "corridor": corridor,
        "supervisor": supervisor,
        "issued_at": issued_at
    })
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["is_valid"] is True
    assert res_data["status"] == "VERIFIED_AUTHENTIC"

    # Tampered payload via REST
    tampered_response = client.post("/api/security/verify-seal", json={
        "cryptographic_seal": seal,
        "task_id": task_id,
        "corridor": corridor,
        "supervisor": "Imposter Engineer",
        "issued_at": issued_at
    })
    assert tampered_response.status_code == 200
    tampered_data = tampered_response.json()
    assert tampered_data["is_valid"] is False
    assert tampered_data["status"] == "TAMPER_DETECTED"
