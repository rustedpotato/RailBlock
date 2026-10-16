import pytest
from datetime import datetime, timedelta, timezone
from pydantic import ValidationError
from app.schemas.task import MaintenanceTaskBase, DepartmentEnum, TaskStatusEnum
from app.schemas.train import TrainScheduleBase, TrainTypeEnum
from app.schemas.block_window import BlockWindowBase
from app.services.conflict_detection.validator import ScheduleValidator


def test_invalid_task_deadline_before_earliest_start():
    now = datetime.now(timezone.utc)
    with pytest.raises(ValidationError, match="cannot be earlier than earliest start"):
        MaintenanceTaskBase(
            title="Track Welding",
            department=DepartmentEnum.ENGINEERING,
            asset_id="AST-01",
            corridor_id="CORR-01",
            duration_minutes=60,
            earliest_start=now + timedelta(hours=2),
            deadline=now + timedelta(hours=1),
            status=TaskStatusEnum.PENDING
        )


def test_invalid_task_negative_duration():
    now = datetime.now(timezone.utc)
    with pytest.raises(ValidationError):
        MaintenanceTaskBase(
            title="Track Welding",
            department=DepartmentEnum.ENGINEERING,
            asset_id="AST-01",
            corridor_id="CORR-01",
            duration_minutes=-30,  # Invalid negative duration
            earliest_start=now,
            deadline=now + timedelta(hours=3),
            status=TaskStatusEnum.PENDING
        )


def test_invalid_train_end_before_start():
    now = datetime.now(timezone.utc)
    with pytest.raises(ValidationError, match="must be after scheduled start time"):
        TrainScheduleBase(
            train_number="12345",
            train_name="Express",
            train_type=TrainTypeEnum.EXPRESS,
            corridor_id="CORR-01",
            scheduled_start=now + timedelta(hours=2),
            scheduled_end=now + timedelta(hours=1),
            priority_level=4
        )


def test_invalid_block_window_capacity_exceeds_window():
    now = datetime.now(timezone.utc)
    with pytest.raises(ValidationError, match="cannot exceed total window duration"):
        BlockWindowBase(
            corridor_id="CORR-01",
            name="Short Window",
            start_time=now,
            end_time=now + timedelta(minutes=60),
            available_capacity_minutes=120  # Cannot have 120 min capacity in a 60 min window
        )


def test_train_conflict_detection_and_buffer_violation():
    validator = ScheduleValidator(default_safety_buffer_minutes=15)
    base = datetime(2026, 10, 20, 10, 0, tzinfo=timezone.utc)

    # Train scheduled 12:00 to 12:30 on CORR-01
    # Buffer: 11:45 to 12:45
    trains = [
        {
            "corridor_id": "CORR-01",
            "train_number": "22436",
            "train_name": "Vande Bharat Express",
            "scheduled_start": base + timedelta(hours=2), # 12:00
            "scheduled_end": base + timedelta(hours=2, minutes=30) # 12:30
        }
    ]

    # Task assigned directly during train buffer: 11:50 to 12:20
    scheduled_tasks = [
        {
            "task_id": "T1",
            "block_window_id": "W1",
            "corridor_id": "CORR-01",
            "assigned_start": base + timedelta(hours=1, minutes=50),
            "assigned_end": base + timedelta(hours=2, minutes=20),
            "duration_minutes": 30
        }
    ]

    tasks_map = {
        "T1": {
            "id": "T1",
            "duration_minutes": 30,
            "earliest_start": base,
            "deadline": base + timedelta(hours=5),
            "department": "ENGINEERING"
        }
    }
    windows_map = {
        "W1": {
            "id": "W1",
            "start_time": base,
            "end_time": base + timedelta(hours=5)
        }
    }

    report = validator.validate_plan(
        scheduled_tasks=scheduled_tasks,
        tasks_map=tasks_map,
        windows_map=windows_map,
        trains=trains,
        safety_buffer_minutes=15
    )

    assert not report.is_valid
    assert report.total_conflicts > 0
    conflict_types = [c.conflict_type for c in report.conflicts]
    assert any("COLLISION" in ct or "BUFFER" in ct for ct in conflict_types)


def test_overlapping_maintenance_detection():
    validator = ScheduleValidator()
    base = datetime(2026, 10, 20, 10, 0, tzinfo=timezone.utc)

    # Two tasks assigned at the same time on the same corridor in the same department
    scheduled_tasks = [
        {
            "task_id": "T1",
            "block_window_id": "W1",
            "corridor_id": "CORR-01",
            "assigned_start": base + timedelta(hours=1),
            "assigned_end": base + timedelta(hours=2),
            "duration_minutes": 60
        },
        {
            "task_id": "T2",
            "block_window_id": "W1",
            "corridor_id": "CORR-01",
            "assigned_start": base + timedelta(hours=1, minutes=30),
            "assigned_end": base + timedelta(hours=2, minutes=30),
            "duration_minutes": 60
        }
    ]

    tasks_map = {
        "T1": {"id": "T1", "duration_minutes": 60, "earliest_start": base, "deadline": base + timedelta(hours=5), "department": "ENGINEERING"},
        "T2": {"id": "T2", "duration_minutes": 60, "earliest_start": base, "deadline": base + timedelta(hours=5), "department": "ENGINEERING"}
    }
    windows_map = {
        "W1": {"id": "W1", "start_time": base, "end_time": base + timedelta(hours=5)}
    }

    report = validator.validate_plan(
        scheduled_tasks=scheduled_tasks,
        tasks_map=tasks_map,
        windows_map=windows_map,
        trains=[],
        safety_buffer_minutes=15
    )

    assert not report.is_valid
    assert any(c.conflict_type == "OVERLAPPING_MAINTENANCE" for c in report.conflicts)
