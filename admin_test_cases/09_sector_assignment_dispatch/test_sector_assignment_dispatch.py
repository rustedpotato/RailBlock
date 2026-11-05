"""
Test Case 09: Admin Sector Assignment & WhatsApp Field Dispatch Workflow
Scope: Sector dispatch memo generation, wa.me links, field acknowledgement, encryption.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import encrypt_sensitive_field, decrypt_sensitive_field

client = TestClient(app)


def test_whatsapp_memo_preview_generation():
    """Admin previews formatted WhatsApp memo before dispatching to field gang."""
    payload = {
        "task_id": "TSK-DISPATCH-99",
        "task_title": "USFD Ultrasonic Track Testing",
        "section": "DADAR - KURLA SLOW",
        "department": "ENGINEERING",
        "assigned_crew": "Gang #14 (P-Way Dadar)",
        "assigned_equipment": "USFD Trolley Machine",
        "supervisor": "Sunil Shinde (SSE/Track)",
        "phone": "+91 98200 12345",
        "assigned_slot": "01:30 - 04:30 (Night)",
        "speed_restriction": "30 km/h Caution Order",
        "power_isolation": "Not required",
        "signal_disconnection": "S&T Disconnect S-44 approved",
        "note": "Complete testing up to Km 12/4 before 04:30 sharp."
    }

    res = client.post("/api/dispatch/preview", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "memo" in data
    assert "RAILBLOCK AI" in data["memo"]
    assert "TSK-DISPATCH-99" in data["memo"]
    assert "Sunil Shinde" in data["memo"]
    assert "wa.me" in data["wa_me_url"]
    assert data["recipient"] == "919820012345"


def test_supervisor_1tap_action_acknowledgement():
    """Field supervisor taps 1-tap mobile ACK link; server confirms and logs action."""
    # 1. Simulate GET /api/dispatch/action?task=TSK-DISPATCH-99&act=ACK
    res = client.get("/api/dispatch/action?task=TSK-DISPATCH-99&act=ACK&note=Gang%20mobilized%20on%20site")
    assert res.status_code == 200
    assert "Block Acknowledged" in res.text or "ACKNOWLEDGED" in res.text

    # 2. Verify logged entry
    log_res = client.get("/api/dispatch/log")
    assert log_res.status_code == 200
    log_data = log_res.json()
    assert "log" in log_data
    assert any(entry.get("task_id") == "TSK-DISPATCH-99" for entry in log_data["log"])


def test_sensitive_field_hotline_encryption():
    """Admin encrypts emergency substation control hotline before storing in database."""
    hotline = "Substation Breaker Direct Hotline: +91-22-2200-9988 (PIN: 4492)"
    encrypted = encrypt_sensitive_field(hotline)
    assert encrypted.startswith("ENC::")
    assert encrypted != hotline

    decrypted = decrypt_sensitive_field(encrypted)
    assert decrypted == hotline
