"""
RailBlock AI — Scheduling Engine Tests
=======================================

Covers:
- Deadline and duration constraints via OR-Tools CP-SAT
- Unscheduled task explanations (explicit reason reporting)
- Baseline vs. optimized plan comparison (metrics check)
"""

import pytest
from datetime import datetime, timedelta, timezone
from app.services.scheduling.ortools_scheduler import OrToolsScheduler
from app.services.scheduling.baseline_scheduler import BaselineScheduler


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _utc(h: int, m: int = 0, day_offset: int = 0) -> datetime:
    base = datetime(2026, 10, 20, 0, 0, tzinfo=timezone.utc)
    return base + timedelta(days=day_offset, hours=h, minutes=m)


def _make_task(
    task_id: str,
    corridor_id: str,
    department: str,
    duration_minutes: int,
    earliest_start: datetime,
    deadline: datetime,
    criticality: int = 3,
    urgency: int = 3,
    overdue_days: int = 0,
):
    return {
        "id": task_id,
        "title": f"Task {task_id}",
        "department": department,
        "asset_id": "AST-01",
        "corridor_id": corridor_id,
        "duration_minutes": duration_minutes,
        "criticality": criticality,
        "urgency": urgency,
        "overdue_days": overdue_days,
        "earliest_start": earliest_start,
        "deadline": deadline,
        "status": "PENDING",
    }


def _make_window(
    window_id: str,
    corridor_id: str,
    start: datetime,
    end: datetime,
    capacity_minutes: int,
    dept_restrictions: str = None,
):
    return {
        "id": window_id,
        "corridor_id": corridor_id,
        "start_time": start,
        "end_time": end,
        "available_capacity_minutes": capacity_minutes,
        "department_restrictions": dept_restrictions,
    }


# ---------------------------------------------------------------------------
# Deadline Constraint Tests
# ---------------------------------------------------------------------------

class TestDeadlineAndDurationConstraints:
    """OR-Tools must respect task deadlines and not schedule tasks whose
    completion would exceed the deadline."""

    def test_task_with_expired_deadline_is_unscheduled(self):
        scheduler = OrToolsScheduler()
        window_start = _utc(2)
        window_end = _utc(5)
        task_deadline = _utc(1)  # deadline BEFORE window opens - infeasible

        tasks = [_make_task("T-EXPIRED", "CORR-01", "ENGINEERING", 60, _utc(0), task_deadline, criticality=5, urgency=5, overdue_days=10)]
        windows = [_make_window("W-01", "CORR-01", window_start, window_end, 180)]

        result = scheduler.optimize_schedule(tasks=tasks, windows=windows, trains=[], solver_timeout_seconds=5.0)

        assert result["metrics"]["scheduled_count"] == 0
        assert len(result["unscheduled"]) == 1
        assert result["unscheduled"][0]["task_id"] == "T-EXPIRED"
        assert len(result["unscheduled"][0]["reason"]) > 0

    def test_task_duration_exceeds_all_window_capacity_is_unscheduled(self):
        scheduler = OrToolsScheduler()
        tasks = [_make_task("T-TOOBIG", "CORR-01", "ENGINEERING", 300, _utc(0), _utc(12))]
        windows = [_make_window("W-01", "CORR-01", _utc(1), _utc(6), 120)]

        result = scheduler.optimize_schedule(tasks=tasks, windows=windows, trains=[], solver_timeout_seconds=5.0)

        assert result["metrics"]["scheduled_count"] == 0
        assert result["unscheduled"][0]["task_id"] == "T-TOOBIG"
        assert len(result["unscheduled"][0]["reason"]) > 0

    def test_task_scheduled_within_exact_deadline(self):
        scheduler = OrToolsScheduler()
        tasks = [_make_task("T-TIGHT", "CORR-01", "ENGINEERING", 60, _utc(2), _utc(4))]
        windows = [_make_window("W-01", "CORR-01", _utc(2), _utc(4), 120)]

        result = scheduler.optimize_schedule(tasks=tasks, windows=windows, trains=[], solver_timeout_seconds=5.0)

        assert result["metrics"]["scheduled_count"] == 1
        assert result["scheduled"][0]["assigned_end"] <= _utc(4)


# ---------------------------------------------------------------------------
# Unscheduled Task Explanation Tests
# ---------------------------------------------------------------------------

class TestUnscheduledTaskExplanations:
    """Verify that every unscheduled task receives a non-empty, meaningful reason."""

    def test_no_corridor_windows_explanation(self):
        scheduler = OrToolsScheduler()
        tasks = [_make_task("T-NO-WIN", "CORR-99", "ENGINEERING", 60, _utc(0), _utc(10))]
        windows = [_make_window("W-01", "CORR-01", _utc(1), _utc(5), 180)]

        result = scheduler.optimize_schedule(tasks=tasks, windows=windows, trains=[], solver_timeout_seconds=5.0)

        assert len(result["unscheduled"]) == 1
        item = result["unscheduled"][0]
        assert item["task_id"] == "T-NO-WIN"
        assert len(item["reason"]) > 0
        assert any(kw in item["reason"].lower() for kw in ["corridor", "window", "no block", "registered"])

    def test_department_restriction_explanation(self):
        scheduler = OrToolsScheduler()
        tasks = [_make_task("T-DEPT-EXCL", "CORR-01", "TRACTION_DISTRIBUTION", 60, _utc(1), _utc(5))]
        windows = [_make_window("W-01", "CORR-01", _utc(1), _utc(5), 240, dept_restrictions="ENGINEERING")]

        result = scheduler.optimize_schedule(tasks=tasks, windows=windows, trains=[], solver_timeout_seconds=5.0)

        assert result["metrics"]["scheduled_count"] == 0
        item = result["unscheduled"][0]
        assert item["task_id"] == "T-DEPT-EXCL"
        assert len(item["reason"]) > 0

    def test_high_priority_task_wins_over_lower_priority(self):
        scheduler = OrToolsScheduler()
        tasks = [
            _make_task("T-HIGH", "CORR-01", "ENGINEERING", 180, _utc(1), _utc(5), criticality=5, urgency=5, overdue_days=10),
            _make_task("T-LOW", "CORR-01", "ENGINEERING", 180, _utc(1), _utc(5), criticality=1, urgency=1),
        ]
        windows = [_make_window("W-01", "CORR-01", _utc(1), _utc(5), 180)]

        result = scheduler.optimize_schedule(tasks=tasks, windows=windows, trains=[], solver_timeout_seconds=5.0)

        scheduled_ids = {s["task_id"] for s in result["scheduled"]}
        assert "T-HIGH" in scheduled_ids
        assert "T-LOW" not in scheduled_ids
        unscheduled_ids = {u["task_id"] for u in result["unscheduled"]}
        assert "T-LOW" in unscheduled_ids
        low = next(u for u in result["unscheduled"] if u["task_id"] == "T-LOW")
        assert len(low["reason"]) > 0


# ---------------------------------------------------------------------------
# Baseline vs Optimized Comparison Tests
# ---------------------------------------------------------------------------

class TestBaselineVsOptimizedComparison:
    """Verify the comparison between the greedy baseline and the OR-Tools optimizer."""

    def _run_both(self, tasks, windows, trains=None):
        trains = trains or []
        optimized = OrToolsScheduler().optimize_schedule(tasks=tasks, windows=windows, trains=trains, solver_timeout_seconds=5.0)
        baseline = BaselineScheduler().generate_baseline(tasks=tasks, windows=windows, trains=trains, safety_buffer_minutes=15)
        return optimized, baseline

    def test_optimized_not_worse_than_baseline_on_task_count(self):
        tasks = [
            _make_task("T1", "CORR-01", "ENGINEERING", 60, _utc(1), _utc(10), criticality=5, urgency=5, overdue_days=5),
            _make_task("T2", "CORR-01", "ENGINEERING", 60, _utc(1), _utc(10), criticality=4, urgency=4, overdue_days=3),
            _make_task("T3", "CORR-01", "SIGNAL_TELECOMMUNICATION", 45, _utc(1), _utc(10), criticality=3),
            _make_task("T4", "CORR-01", "TRACTION_DISTRIBUTION", 90, _utc(1), _utc(10), criticality=4),
        ]
        windows = [
            _make_window("W-01", "CORR-01", _utc(1), _utc(5), 240),
            _make_window("W-02", "CORR-01", _utc(6), _utc(10), 240),
        ]
        optimized, baseline = self._run_both(tasks, windows)
        assert optimized["metrics"]["scheduled_count"] >= baseline["metrics"]["scheduled_count"]

    def test_optimized_covers_overdue_high_priority_tasks(self):
        tasks = [
            _make_task("T-LOW-LONG", "CORR-01", "ENGINEERING", 180, _utc(1), _utc(10), criticality=1, urgency=1),
            _make_task("T-HIGH-OVERDUE", "CORR-01", "ENGINEERING", 120, _utc(1), _utc(10), criticality=5, urgency=5, overdue_days=7),
        ]
        windows = [_make_window("W-01", "CORR-01", _utc(1), _utc(5), 180)]
        optimized, _ = self._run_both(tasks, windows)
        opt_ids = {s["task_id"] for s in optimized["scheduled"]}
        assert "T-HIGH-OVERDUE" in opt_ids

    def test_comparison_metrics_are_complete(self):
        tasks = [_make_task("T1", "CORR-01", "ENGINEERING", 60, _utc(1), _utc(8))]
        windows = [_make_window("W-01", "CORR-01", _utc(1), _utc(8), 420)]
        optimized, baseline = self._run_both(tasks, windows)
        for label, result in [("optimized", optimized), ("baseline", baseline)]:
            assert "scheduled_count" in result["metrics"]
            assert "unscheduled_count" in result["metrics"]
            assert "utilization_percent" in result["metrics"]
            assert "scheduled" in result
            assert "unscheduled" in result
            assert "total_maintenance_minutes" in result

    def test_utilization_percent_bounded(self):
        tasks = [_make_task("T1", "CORR-01", "ENGINEERING", 60, _utc(1), _utc(8))]
        windows = [_make_window("W-01", "CORR-01", _utc(1), _utc(8), 420)]
        optimized, baseline = self._run_both(tasks, windows)
        for label, result in [("optimized", optimized), ("baseline", baseline)]:
            u = result["metrics"]["utilization_percent"]
            assert 0.0 <= u <= 100.0
