"""
Test Case 10: Admin Real-Time Emergency OHE Wire Drop & Rail Defect Handling
Scope: Live telemetry stream, emergency wire snap / rail fracture injection, caution enforcement.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_realtime_snapshot_inspection():
    """Admin polls live telemetry snapshot and verifies active train movements and block sections."""
    response = client.get("/api/realtime/snapshot")
    assert response.status_code == 200
    snapshot = response.json()
    assert "trains" in snapshot
    assert "blocks" in snapshot
    assert "events" in snapshot
    assert len(snapshot["trains"]) > 0
    assert len(snapshot["blocks"]) > 0


def test_emergency_defect_wire_failure_injection():
    """Admin injects emergency OHE catenary wire parting alert; asserts instant speed reduction."""
    target_section = "Mumbai Central – Bandra Fast"
    defect_desc = "EMERGENCY: 25kV OHE Catenary Contact Wire Parted at KM 11/8. Neutral section tripping."

    res = client.post("/api/realtime/trigger-defect", json={
        "section": target_section,
        "description": defect_desc
    })
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "SUCCESS"
    event = data["event"]
    assert event["severity"] == "CRITICAL"
    assert target_section in event["message"]

    # Verify that block section status updated to CAUTION and speed was restricted to 20 km/h
    snap_res = client.get("/api/realtime/snapshot")
    assert snap_res.status_code == 200
    snapshot = snap_res.json()
    blocks = snapshot["blocks"]
    matched = [b for b in blocks if b.get("section") == target_section]
    assert len(matched) == 1, f"Expected section '{target_section}' in snapshot blocks"
    sec_status = matched[0]
    assert sec_status["status"] == "CAUTION"
    assert sec_status["speed_limit"] <= 20
    assert sec_status["signal"] in ["YELLOW", "RED"]


def test_emergency_train_delay_simulation():
    """Admin triggers unexpected delay on Mumbai-Delhi Rajdhani to prompt timetable rescheduling."""
    res = client.post("/api/realtime/trigger-delay", json={
        "train_number": "12951",
        "delay_minutes": 25
    })
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "SUCCESS"
    assert data["event"]["severity"] in ["WARNING", "CRITICAL"]
