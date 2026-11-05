"""
Test Case 05: Admin JWT Role-Based Access Control (RBAC) & Authorization
Scope: JWT HS256 tokens, RBAC roles, admin authorization vs non-admin rejection.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token, verify_access_token

client = TestClient(app)


def test_admin_token_issuance():
    """Verify that admin credentials yield a valid JWT token with ADMIN role."""
    response = client.post("/api/security/token", json={
        "username": "divisional.admin",
        "role": "ADMIN",
        "division": "Mumbai Western Railway"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "ADMIN"
    assert data["token_type"] == "bearer"

    # Verify claims payload directly
    payload = verify_access_token(data["access_token"])
    assert payload["sub"] == "divisional.admin"
    assert payload["role"] == "ADMIN"


def test_admin_privileged_route_execution():
    """Verify that an ADMIN token grants access to administrative permit sealing."""
    # 1. Obtain admin token
    admin_token_res = client.post("/api/security/token", json={
        "username": "chief.controller",
        "role": "ADMIN",
        "division": "Central Railway HQ"
    })
    admin_token = admin_token_res.json()["access_token"]

    # 2. Call admin-protected endpoint with Bearer auth
    headers = {"Authorization": f"Bearer {admin_token}"}
    seal_res = client.post("/api/security/seal-permit", json={
        "task_id": "TSK-ADMIN-EXEC-01",
        "corridor": "MUMBAI-MAIN-LINE",
        "supervisor": "Chief Operating Manager",
        "issued_at": "05-Nov-2026 18:00:00 UTC"
    }, headers=headers)
    assert seal_res.status_code == 200
    seal_data = seal_res.json()
    assert seal_data["is_tamper_evident"] is True
    assert seal_data["cryptographic_seal"].startswith("SEAL-")


def test_non_admin_forbidden_on_protected_endpoints():
    """Verify that a non-admin role (e.g. COMMUTER_VIEWER) is strictly denied access with HTTP 403."""
    # 1. Obtain viewer token
    viewer_res = client.post("/api/security/token", json={
        "username": "commuter.public",
        "role": "COMMUTER_VIEWER",
        "division": "Public Passenger App"
    })
    viewer_token = viewer_res.json()["access_token"]

    # 2. Attempt admin-protected action with viewer token
    headers = {"Authorization": f"Bearer {viewer_token}"}
    unauthorized_res = client.post("/api/security/seal-permit", json={
        "task_id": "TSK-TAMPER-ATTEMPT",
        "corridor": "CENTRAL-MAIN",
        "supervisor": "Unverified Passenger"
    }, headers=headers)
    assert unauthorized_res.status_code == 403
    assert "Access denied" in unauthorized_res.json()["detail"]
