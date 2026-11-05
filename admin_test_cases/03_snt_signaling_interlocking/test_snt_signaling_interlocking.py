"""
Test Case 03: S&T Department Signaling & Electronic Interlocking Workflow
Scope: Electronic Interlocking, point machine overhaul, axle counters (SSDAC).
"""

import pytest
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from app.main import app
from app.models.task import MaintenanceTask
from app.models.asset import Asset
from app.models.corridor import Corridor
from app.services.prioritization.priority_engine import default_priority_engine

client = TestClient(app)


def test_snt_department_priority_calculation():
    """Admin verifies that fail-safe signaling interlock failures receive maximum safety scoring."""
    result = default_priority_engine.calculate_priority(
        criticality=5,
        urgency=5,
        overdue_days=10,
        department="SIGNAL_TELECOMMUNICATION",
        asset_type="ELECTRONIC_INTERLOCKING"
    )
    assert result.score >= 90.0, f"Expected top priority for S&T Interlocking, got {result.score}"
    assert "SIGNAL_TELECOMMUNICATION" in result.explanation


def test_snt_task_submission_and_signal_disconnection(db_session):
    """Admin submits S&T Point Machine Overhaul & SSDAC Digital Axle Counter Recalibration."""
    corridor = db_session.query(Corridor).first()
    assert corridor is not None

    asset = db_session.query(Asset).filter(Asset.department == "SIGNAL_TELECOMMUNICATION").first()
    if not asset:
        asset = Asset(
            id="AST-SNT-TEST-01",
            name="Point Machine 104A/B & SSDAC Head",
            type="POINT_MACHINE",
            department="SIGNAL_TELECOMMUNICATION",
            corridor_id=corridor.id,
            line="UP_SLOW",
            section="KYN-THK"
        )
        db_session.add(asset)
        db_session.commit()

    now = datetime.now(timezone.utc)
    task_payload = {
        "title": "Electronic Interlocking Logic Card Swap & Point Machine 104 Testing",
        "description": "Requires S&T Disconnection Notice S-10. Signal testing on lines 1 & 2.",
        "department": "SIGNAL_TELECOMMUNICATION",
        "asset_id": asset.id,
        "corridor_id": corridor.id,
        "duration_minutes": 90,
        "criticality": 5,
        "urgency": 4,
        "overdue_days": 5,
        "earliest_start": now.isoformat(),
        "deadline": (now + timedelta(days=2)).isoformat(),
        "status": "PENDING"
    }

    res = client.post("/api/tasks", json=task_payload)
    assert res.status_code == 201
    task_data = res.json()
    assert task_data["department"] == "SIGNAL_TELECOMMUNICATION"
    assert task_data["duration_minutes"] == 90

    # Admin verifies task retrieval in S&T filtered queue
    list_res = client.get("/api/tasks?department=SIGNAL_TELECOMMUNICATION")
    assert list_res.status_code == 200
    tasks = list_res.json()
    assert any(t["id"] == task_data["id"] for t in tasks)

