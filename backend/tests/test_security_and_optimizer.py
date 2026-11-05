import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import generate_permit_seal, verify_permit_seal, encrypt_sensitive_field, decrypt_sensitive_field

client = TestClient(app)


def test_cryptographic_seal_integrity():
    task_id = "TSK-2026-USFD-01"
    corridor = "MUMBAI CENTRAL - BORIVALI FAST"
    supervisor = "Rajesh Sharma (SSE/P-Way)"
    issued_at = "05-Nov-2026 14:00:00 UTC"

    # Generate seal
    seal = generate_permit_seal(task_id, corridor, supervisor, issued_at)
    assert seal.startswith("SEAL-")
    assert len(seal.split("-")) == 3

    # Verification should succeed with identical parameters
    assert verify_permit_seal(seal, task_id, corridor, supervisor, issued_at) is True

    # Tamper detection: modifying supervisor or corridor must fail
    tampered_supervisor = "Unknown Contractor"
    assert verify_permit_seal(seal, task_id, corridor, tampered_supervisor, issued_at) is False

    tampered_time = "05-Nov-2026 14:05:00 UTC"
    assert verify_permit_seal(seal, task_id, corridor, supervisor, tampered_time) is False


def test_field_level_encryption():
    secret_note = "Emergency Catenary Neutral Section Switch Key: #9482"
    encrypted = encrypt_sensitive_field(secret_note)
    assert encrypted.startswith("ENC::")
    assert encrypted != secret_note

    decrypted = decrypt_sensitive_field(encrypted)
    assert decrypted == secret_note


def test_jwt_session_token_endpoint():
    response = client.post("/api/security/token", json={
        "username": "divisional.controller",
        "role": "ADMIN",
        "division": "Mumbai Western Railway"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "ADMIN"
    assert data["cryptographic_algorithm"] == "HS256"


def test_security_status_endpoint():
    response = client.get("/api/security/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "OPERATIONAL"
    assert data["tamper_evidence"] == "ACTIVE"


def test_uic_406_capacity_analysis():
    response = client.get("/api/optimizer/capacity-analysis")
    assert response.status_code == 200
    data = response.json()
    assert data["methodology"] == "UIC 406 International Railway Union Standard"
    assert len(data["corridors"]) > 0

    first_sec = data["corridors"][0]
    assert "saturation_percent" in first_sec
    assert "usable_headroom_minutes" in first_sec
    assert "status" in first_sec


def test_pareto_optimizer_execution():
    response = client.post("/api/optimizer/pareto-solve", json={
        "preset": "FAST_HEURISTIC",
        "safety_weight": 0.8,
        "punctuality_weight": 0.2,
        "crew_cost_weight": 0.1,
        "safety_buffer_minutes": 15,
        "solver_timeout_seconds": 5.0
    })
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "COMPLETED"
    assert "pareto_analysis" in data
    assert "scheduled" in data

