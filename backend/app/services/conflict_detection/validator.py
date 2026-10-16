"""
RailBlock AI — Independent Schedule Conflict Detector & Plan Validator
========================================================================

Ensures that every generated maintenance schedule is independently audited
against railway safety regulations, train movement buffers, corridor block
window boundaries, and task deadlines.

RULE: Never report zero conflicts unless validation actually confirms it.
"""

from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from app.schemas.schedule import ConflictDetail, ScheduleConflictResponse


@dataclass
class ValidationReport:
    is_valid: bool
    total_conflicts: int
    critical_conflicts: int
    conflicts: List[ConflictDetail] = field(default_factory=list)
    summary: str = ""

    def to_schema(self, plan_id: str) -> ScheduleConflictResponse:
        return ScheduleConflictResponse(
            plan_id=plan_id,
            is_valid=self.is_valid,
            total_conflicts=self.total_conflicts,
            critical_conflicts=self.critical_conflicts,
            conflicts=self.conflicts,
            summary=self.summary
        )


class ScheduleValidator:
    """
    Independent post-optimization verification service.
    Audits maintenance task assignments against train timetable paths and block constraints.
    """

    def __init__(self, default_safety_buffer_minutes: int = 15):
        self.default_safety_buffer_minutes = default_safety_buffer_minutes

    def _ensure_utc(self, dt: datetime) -> datetime:
        if dt.tzinfo is None:
            return dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)

    def validate_plan(
        self,
        scheduled_tasks: List[Dict[str, Any]],
        tasks_map: Dict[str, Any],
        windows_map: Dict[str, Any],
        trains: List[Any],
        safety_buffer_minutes: Optional[int] = None,
        allow_joint_maintenance: bool = True
    ) -> ValidationReport:
        """
        Independently audits all scheduled maintenance tasks in a plan.

        Parameters:
          - scheduled_tasks: list of dicts with keys:
              ['task_id', 'block_window_id', 'corridor_id', 'assigned_start', 'assigned_end', 'duration_minutes']
          - tasks_map: mapping of task_id -> task model or dict
          - windows_map: mapping of window_id -> window model or dict
          - trains: list of train models or dicts for the relevant corridors
          - safety_buffer_minutes: minutes buffer required around train passages
        """
        buffer_min = safety_buffer_minutes if safety_buffer_minutes is not None else self.default_safety_buffer_minutes
        buffer_delta = timedelta(minutes=buffer_min)
        conflicts: List[ConflictDetail] = []

        # 1. Audit individual assignments for duration, window boundaries, and deadlines
        for item in scheduled_tasks:
            task_id = item["task_id"]
            window_id = item["block_window_id"]
            corridor_id = item["corridor_id"]
            start = self._ensure_utc(item["assigned_start"])
            end = self._ensure_utc(item["assigned_end"])
            duration_min = item.get("duration_minutes") or int((end - start).total_seconds() / 60)

            task = tasks_map.get(task_id)
            window = windows_map.get(window_id)

            if not task:
                conflicts.append(ConflictDetail(
                    conflict_type="ORPHAN_TASK",
                    severity="CRITICAL",
                    message=f"Scheduled task {task_id} not found in registered maintenance catalog.",
                    task_id=task_id,
                    corridor_id=corridor_id
                ))
                continue

            if not window:
                conflicts.append(ConflictDetail(
                    conflict_type="ORPHAN_WINDOW",
                    severity="CRITICAL",
                    message=f"Scheduled block window {window_id} not found in corridor block registry.",
                    task_id=task_id,
                    conflicting_entity_id=window_id,
                    corridor_id=corridor_id
                ))
                continue

            # Check task duration match
            expected_duration = getattr(task, "duration_minutes", None) or task.get("duration_minutes")
            if duration_min != expected_duration:
                conflicts.append(ConflictDetail(
                    conflict_type="DURATION_MISMATCH",
                    severity="HIGH",
                    message=(
                        f"Task {task_id} assigned duration ({duration_min} min) does not match "
                        f"required maintenance duration ({expected_duration} min)."
                    ),
                    task_id=task_id,
                    corridor_id=corridor_id,
                    start_time=start,
                    end_time=end
                ))

            # Check window boundaries
            win_start = self._ensure_utc(getattr(window, "start_time", None) or window.get("start_time"))
            win_end = self._ensure_utc(getattr(window, "end_time", None) or window.get("end_time"))

            if start < win_start or end > win_end:
                conflicts.append(ConflictDetail(
                    conflict_type="WINDOW_OUT_OF_BOUNDS",
                    severity="CRITICAL",
                    message=(
                        f"Task {task_id} assigned interval [{start.isoformat()} to {end.isoformat()}] "
                        f"violates block window {window_id} boundaries [{win_start.isoformat()} to {win_end.isoformat()}]."
                    ),
                    task_id=task_id,
                    conflicting_entity_id=window_id,
                    corridor_id=corridor_id,
                    start_time=start,
                    end_time=end
                ))

            # Check earliest start and deadline compliance
            t_earliest = self._ensure_utc(getattr(task, "earliest_start", None) or task.get("earliest_start"))
            t_deadline = self._ensure_utc(getattr(task, "deadline", None) or task.get("deadline"))

            if start < t_earliest:
                conflicts.append(ConflictDetail(
                    conflict_type="EARLIEST_START_VIOLATION",
                    severity="HIGH",
                    message=f"Task {task_id} assigned start {start.isoformat()} is earlier than earliest permissible start {t_earliest.isoformat()}.",
                    task_id=task_id,
                    corridor_id=corridor_id,
                    start_time=start,
                    end_time=end
                ))

            if end > t_deadline:
                conflicts.append(ConflictDetail(
                    conflict_type="DEADLINE_VIOLATION",
                    severity="CRITICAL",
                    message=f"Task {task_id} assigned end {end.isoformat()} exceeds mandatory safety deadline {t_deadline.isoformat()}.",
                    task_id=task_id,
                    corridor_id=corridor_id,
                    start_time=start,
                    end_time=end
                ))

        # 2. Audit for overlapping maintenance on the same corridor
        # (Tasks in the same department or conflicting operations cannot overlap in time)
        n = len(scheduled_tasks)
        for i in range(n):
            item_a = scheduled_tasks[i]
            t_id_a = item_a["task_id"]
            task_a = tasks_map.get(t_id_a)
            dept_a = getattr(task_a, "department", None) if task_a else None
            start_a = self._ensure_utc(item_a["assigned_start"])
            end_a = self._ensure_utc(item_a["assigned_end"])
            corr_a = item_a["corridor_id"]

            for j in range(i + 1, n):
                item_b = scheduled_tasks[j]
                t_id_b = item_b["task_id"]
                task_b = tasks_map.get(t_id_b)
                dept_b = getattr(task_b, "department", None) if task_b else None
                start_b = self._ensure_utc(item_b["assigned_start"])
                end_b = self._ensure_utc(item_b["assigned_end"])
                corr_b = item_b["corridor_id"]

                # Only tasks on the same corridor can have track conflict
                if corr_a == corr_b:
                    # Check time overlap: max(start_a, start_b) < min(end_a, end_b)
                    if max(start_a, start_b) < min(end_a, end_b):
                        is_same_dept = (dept_a == dept_b)
                        is_same_window = (item_a.get("block_window_id") == item_b.get("block_window_id"))
                        # If joint maintenance is permitted, different departments in the same block window
                        # constitute an authorized coordinated Joint Mega-Block
                        if allow_joint_maintenance and not is_same_dept and is_same_window:
                            continue

                        severity = "CRITICAL" if is_same_dept else "HIGH"
                        conflicts.append(ConflictDetail(
                            conflict_type="OVERLAPPING_MAINTENANCE",
                            severity=severity,
                            message=(
                                f"Simultaneous maintenance collision on corridor {corr_a} between "
                                f"Task {t_id_a} ({dept_a}) and Task {t_id_b} ({dept_b}) during interval "
                                f"[{max(start_a, start_b).isoformat()} to {min(end_a, end_b).isoformat()}]."
                            ),
                            task_id=t_id_a,
                            conflicting_entity_id=t_id_b,
                            corridor_id=corr_a,
                            start_time=max(start_a, start_b),
                            end_time=min(end_a, end_b)
                        ))

        # 3. Audit for train timetable passage conflicts and safety buffer violations
        for item in scheduled_tasks:
            t_id = item["task_id"]
            corr_id = item["corridor_id"]
            m_start = self._ensure_utc(item["assigned_start"])
            m_end = self._ensure_utc(item["assigned_end"])

            for train in trains:
                train_corr = getattr(train, "corridor_id", None) or train.get("corridor_id")
                if train_corr != corr_id:
                    continue

                trn_number = getattr(train, "train_number", None) or train.get("train_number")
                trn_name = getattr(train, "train_name", None) or train.get("train_name", f"Train {trn_number}")
                trn_start = self._ensure_utc(getattr(train, "scheduled_start", None) or train.get("scheduled_start"))
                trn_end = self._ensure_utc(getattr(train, "scheduled_end", None) or train.get("scheduled_end"))

                # Buffered forbidden interval
                blocked_start = trn_start - buffer_delta
                blocked_end = trn_end + buffer_delta

                # Check if maintenance interval overlaps with train forbidden window
                if max(m_start, blocked_start) < min(m_end, blocked_end):
                    # Direct train collision or buffer safety encroachment
                    is_direct_collision = max(m_start, trn_start) < min(m_end, trn_end)
                    conflict_type = "TRAIN_TIMETABLE_COLLISION" if is_direct_collision else "SAFETY_BUFFER_VIOLATION"
                    severity = "CRITICAL" if is_direct_collision else "HIGH"

                    conflicts.append(ConflictDetail(
                        conflict_type=conflict_type,
                        severity=severity,
                        message=(
                            f"Safety breach on corridor {corr_id}: Task {t_id} [{m_start.isoformat()} to {m_end.isoformat()}] "
                            f"conflicts with {trn_name} (#{trn_number}) corridor movement [{trn_start.isoformat()} to {trn_end.isoformat()}] "
                            f"with {buffer_min}-min safety buffer [{blocked_start.isoformat()} to {blocked_end.isoformat()}]."
                        ),
                        task_id=t_id,
                        conflicting_entity_id=str(trn_number),
                        corridor_id=corr_id,
                        start_time=max(m_start, blocked_start),
                        end_time=min(m_end, blocked_end)
                    ))

        # Tally totals
        critical_count = sum(1 for c in conflicts if c.severity == "CRITICAL")
        total_count = len(conflicts)
        is_valid = (total_count == 0)

        if is_valid:
            summary = (
                f"Schedule verified: 0 conflicts detected across {len(scheduled_tasks)} assignments. "
                f"Full clearance verified against train paths and {buffer_min}-min safety buffers."
            )
        else:
            summary = (
                f"Schedule validation failed: {total_count} conflicts detected "
                f"({critical_count} critical safety breaches, {total_count - critical_count} warnings/buffer encroaches)."
            )

        return ValidationReport(
            is_valid=is_valid,
            total_conflicts=total_count,
            critical_conflicts=critical_count,
            conflicts=conflicts,
            summary=summary
        )


default_validator = ScheduleValidator()
