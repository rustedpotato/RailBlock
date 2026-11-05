"""
Test Case 01: Engineering Department Track Maintenance & USFD Flaw Workflow
Scope: P-Way / Track renewal, Ultrasonic Flaw (USFD), priority score computation, and task dispatch.
"""

import pytest
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from app.main import app
from app.services.prioritization.priority_engine import default_priority_engine
from app.db.session import SessionLocal
from app.models.task import MaintenanceTask
from app.models.asset import Asset
from app.models.corridor import Corridor

client = TestClient(app)


def test_engineering_department_priority_calculation():
    """Admin validates that severe ultrasonic rail flaw (USFD) yields high safety priority."""
    result = default_priority_engine.calculate_priority(
        criticality=5,
        urgency=5,
        overdue_days=12,
        department="ENGINEERING",
        asset_type="TRACK_SEGMENT"
    )
    assert result.score >= 85.0, f"Expected high priority for critical track flaw, got {result.score}"
    assert "ENGINEERING" in result.explanation
    assert result.normalized_factors["criticality"] == 1.0


def test_engineering_task_creation_and_retrieval(db_session):
    """Admin submits a track tamping and rail replacement possession on Western Railway."""
    # Ensure asset and corridor exist
    corridor = db_session.query(Corridor).first()
    assert corridor is not None, "Corridor must exist in database"
    
    asset = db_session.query(Asset).filter(Asset.department == "ENGINEERING").first()
    if not asset:
        asset = Asset(
            id="AST-ENG-TEST-01",
            name="Track Km 14/2-6 Fast Line",
            type="TRACK_SEGMENT",
            department="ENGINEERING",
            corridor_id=corridor.id,
            line="FAST",
            section="BVI-DDR"
        )
        db_session.add(asset)
        db_session.commit()

    now = datetime.now(timezone.utc)
    task_payload = {
        "title": "USFD IMR Rail Flaw Replacement & CSM Tamping",
        "description": "Immediate rail fracture prevention; requires 03:00 hr night block with BCM/CSM tamping machine.",
        "department": "ENGINEERING",
        "asset_id": asset.id,
        "corridor_id": corridor.id,
        "duration_minutes": 180,
        "criticality": 5,
        "urgency": 5,
        "overdue_days": 8,
        "earliest_start": now.isoformat(),
        "deadline": (now + timedelta(days=2)).isoformat(),
        "status": "PENDING"
    }

    response = client.post("/api/tasks", json=task_payload)
    assert response.status_code == 201, f"Failed creating task: {response.text}"
    created = response.json()
    assert created["department"] == "ENGINEERING"
    assert created["duration_minutes"] == 180
    assert created["status"] == "PENDING"

    # Admin verifies task appears in filtered engineering department queue
    list_res = client.get("/api/tasks?department=ENGINEERING")
    assert list_res.status_code == 200
    tasks = list_res.json()
    task_ids = [t["id"] for t in tasks]
    assert created["id"] in task_ids
