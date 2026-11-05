"""
Test Case 02: TRD Department 25kV Catenary & Power Block Workflow
Scope: 25kV OHE catenary, neutral section testing, power block permit issuance.
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


def test_trd_department_priority_calculation():
    """Admin verifies that high-speed catenary contact wire wear produces high TRD urgency."""
    result = default_priority_engine.calculate_priority(
        criticality=4,
        urgency=5,
        overdue_days=7,
        department="TRACTION_DISTRIBUTION",
        asset_type="OHE_SEGMENT"
    )
    assert result.score >= 70.0, f"Expected high priority for TRD contact wire wear, got {result.score}"
    assert "TRACTION_DISTRIBUTION" in result.explanation


def test_trd_power_block_task_submission(db_session):
    """Admin creates a 25kV OHE de-energization maintenance task requiring power isolation."""
    corridor = db_session.query(Corridor).first()
    assert corridor is not None

    asset = db_session.query(Asset).filter(Asset.department == "TRACTION_DISTRIBUTION").first()
    if not asset:
        asset = Asset(
            id="AST-TRD-TEST-01",
            name="25kV Catenary Sector CCG-DDR",
            type="OHE_SEGMENT",
            department="TRACTION_DISTRIBUTION",
            corridor_id=corridor.id,
            line="FAST",
            section="CCG-DDR"
        )
        db_session.add(asset)
        db_session.commit()

    now = datetime.now(timezone.utc)
    task_payload = {
        "title": "25kV AC Contact Wire Splice & Isolator Overhaul",
        "description": "Requires 120-min 25kV traction power shutdown (TRD Power Block Permit). Co-requisite with track inspection.",
        "department": "TRACTION_DISTRIBUTION",
        "asset_id": asset.id,
        "corridor_id": corridor.id,
        "duration_minutes": 120,
        "criticality": 4,
        "urgency": 5,
        "overdue_days": 6,
        "earliest_start": now.isoformat(),
        "deadline": (now + timedelta(days=3)).isoformat(),
        "status": "PENDING"
    }

    res = client.post("/api/tasks", json=task_payload)
    assert res.status_code == 201
    data = res.json()
    assert data["department"] == "TRACTION_DISTRIBUTION"
    assert data["duration_minutes"] == 120

    # Verify query by TRD department
    list_res = client.get("/api/tasks?department=TRACTION_DISTRIBUTION")
    assert list_res.status_code == 200
    tasks = list_res.json()
    assert any(t["id"] == data["id"] for t in tasks)

