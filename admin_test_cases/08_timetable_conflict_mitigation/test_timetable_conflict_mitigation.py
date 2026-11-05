"""
Test Case 08: Admin Timetable Conflict Detection & Mitigation Workflow
Scope: Timetable clash auditing, independent safety validator, baseline comparison.
"""

import uuid
import pytest
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from app.main import app
from app.models.plan import MaintenancePlan
from app.models.train import TrainSchedule
from app.services.conflict_detection.validator import default_validator

client = TestClient(app)


def test_independent_validator_train_headway_clash():
    """Admin tests that scheduling a track possession directly on a train path triggers a verified conflict."""
    now = datetime(2026, 11, 5, 10, 0, tzinfo=timezone.utc)
    
    # Train running from 10:15 to 10:45
    train = TrainSchedule(
        id="TRN-SUB-90211",
        train_number="90211",
        train_name="Borivali Slow Local",
        train_type="SUBURBAN",
        corridor_id="WR-CCG-BVI-SLOW",
        direction="UP",
        scheduled_start=now + timedelta(minutes=15),
        scheduled_end=now + timedelta(minutes=45),
        priority_level=3
    )

    # Possession directly overlapping the train
    possession = {
        "task_id": "TSK-OVERLAP-01",
        "block_window_id": "BW-TEST-01",
        "corridor_id": "WR-CCG-BVI-SLOW",
        "assigned_start": now + timedelta(minutes=10),
        "assigned_end": now + timedelta(minutes=40),
        "duration_minutes": 30
    }

    mock_window = {
        "id": "BW-TEST-01",
        "corridor_id": "WR-CCG-BVI-SLOW",
        "start_time": now,
        "end_time": now + timedelta(hours=2)
    }

    mock_task = {
        "id": "TSK-OVERLAP-01",
        "duration_minutes": 30,
        "earliest_start": now - timedelta(hours=1),
        "deadline": now + timedelta(days=1)
    }

    report = default_validator.validate_plan(
        scheduled_tasks=[possession],
        tasks_map={"TSK-OVERLAP-01": mock_task},
        windows_map={"BW-TEST-01": mock_window},
        trains=[train],
        safety_buffer_minutes=15
    )

    assert report.total_conflicts >= 1, "Expected conflict detected for track possession overlapping train path"
    assert report.is_valid is False
    assert any("TRAIN_TIMETABLE" in str(c.conflict_type) for c in report.conflicts)


def test_api_plan_conflict_audit_and_baseline_comparison(db_session):
    """Admin retrieves active plan and requests independent conflict verification & baseline comparison."""
    plan = db_session.query(MaintenancePlan).first()
    if not plan:
        now = datetime.now(timezone.utc)
        plan = MaintenancePlan(
            id=f"PLAN-{uuid.uuid4().hex[:8].upper()}",
            name="Plan 2026-W45-Central-Fast",
            algorithm_used="Google OR-Tools CP-SAT",
            planning_horizon_start=now,
            planning_horizon_end=now + timedelta(days=7),
            scheduled_task_count=10,
            unscheduled_task_count=2,
            total_maintenance_minutes=980,
            overdue_high_priority_covered=4,
            conflicts_detected=0,
            block_utilization_percent=82.5,
            status="APPROVED"
        )
        db_session.add(plan)
        db_session.commit()

    # 1. Audit conflicts
    conflict_res = client.get(f"/api/schedules/{plan.id}/conflicts")
    assert conflict_res.status_code == 200
    conflict_data = conflict_res.json()
    assert "plan_id" in conflict_data
    assert "total_conflicts" in conflict_data

    # 2. Compare with baseline heuristic
    comp_res = client.get(f"/api/schedules/{plan.id}/comparison")
    assert comp_res.status_code == 200
    comp_data = comp_res.json()
    assert "baseline" in comp_data
    assert "optimized" in comp_data
    assert "insights" in comp_data
