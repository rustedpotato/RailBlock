"""
RailBlock AI — Real-Time Issue Detection & Constraint Resolution Tests
======================================================================
"""

import pytest
from datetime import datetime, timedelta, timezone
from app.services.scheduling.ortools_scheduler import default_ortools_scheduler
from app.services.conflict_detection.validator import default_validator
from app.models.task import MaintenanceTask
from app.models.train import TrainSchedule
from app.models.block_window import BlockWindow


def _dt(h: int, m: int = 0) -> datetime:
    return datetime(2026, 10, 20, h, m, tzinfo=timezone.utc)


def test_realtime_conflict_detection_and_resolution():
    # 1. Setup corridor with train and window
    window = {
        "id": "BW-TEST-01",
        "corridor_id": "CORR-TEST",
        "start_time": _dt(1, 0),
        "end_time": _dt(5, 0),
        "available_capacity_minutes": 240,
        "department_restrictions": None
    }
    train = {
        "id": "TRN-VB",
        "train_number": "20901",
        "train_name": "Vande Bharat Express",
        "corridor_id": "CORR-TEST",
        "scheduled_start": _dt(2, 30),
        "scheduled_end": _dt(3, 0),
        "priority_level": 5
    }
    task = {
        "id": "TSK-EMERG",
        "title": "Emergency Rail Flaw Replacement",
        "department": "ENGINEERING",
        "corridor_id": "CORR-TEST",
        "duration_minutes": 60,
        "criticality": 5,
        "urgency": 5,
        "overdue_days": 3,
        "earliest_start": _dt(1, 0),
        "deadline": _dt(6, 0),
        "status": "PENDING"
    }

    # 2. Simulate naive schedule causing real-time train collision (placing task at 02:15 - 03:15)
    naive_schedule = [{
        "task_id": "TSK-EMERG",
        "block_window_id": "BW-TEST-01",
        "corridor_id": "CORR-TEST",
        "assigned_start": _dt(2, 15),
        "assigned_end": _dt(3, 15),
        "duration_minutes": 60
    }]
    tasks_map = {"TSK-EMERG": task}
    windows_map = {"BW-TEST-01": window}

    # Validator must detect real-time safety collision
    naive_report = default_validator.validate_plan(
        scheduled_tasks=naive_schedule,
        tasks_map=tasks_map,
        windows_map=windows_map,
        trains=[train],
        safety_buffer_minutes=15
    )
    assert not naive_report.is_valid
    assert naive_report.critical_conflicts >= 1

    # 3. Run OR-Tools optimizer to fix the issue automatically
    solution = default_ortools_scheduler.optimize_schedule(
        tasks=[task],
        windows=[window],
        trains=[train],
        safety_buffer_minutes=15,
        solver_timeout_seconds=5.0
    )
    assert len(solution["scheduled"]) == 1

    # 4. Independent audit confirms fix with 0 conflicts
    resolved_report = default_validator.validate_plan(
        scheduled_tasks=solution["scheduled"],
        tasks_map=tasks_map,
        windows_map=windows_map,
        trains=[train],
        safety_buffer_minutes=15
    )
    assert resolved_report.is_valid
    assert resolved_report.critical_conflicts == 0
    assert resolved_report.total_conflicts == 0
