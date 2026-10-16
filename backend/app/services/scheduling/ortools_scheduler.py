"""
RailBlock AI — Constraint-Based Block Scheduling Engine (Google OR-Tools CP-SAT)
================================================================================

This service formulates the Railway Maintenance Block Scheduling problem as a
Constraint Satisfaction & Optimization problem using Google OR-Tools CP-SAT solver.

SAFETY DISCLAIMER:
This system is an automated decision-support research prototype developed for SIH26027.
All generated schedules must undergo formal review, sectional simulation, and clearance
by authorized Indian Railways Operating / Traffic Control personnel prior to field execution.
"""

from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional, Tuple
from ortools.sat.python import cp_model
from app.services.prioritization.priority_engine import default_priority_engine


class OrToolsScheduler:
    """
    Mathematical optimization solver using Google OR-Tools CP-SAT for multi-departmental
    track and power block allocation.
    """

    def __init__(self, priority_engine=None):
        self.priority_engine = priority_engine or default_priority_engine

    def _ensure_utc(self, dt: datetime) -> datetime:
        if dt.tzinfo is None:
            return dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)

    def optimize_schedule(
        self,
        tasks: List[Any],
        windows: List[Any],
        trains: List[Any],
        safety_buffer_minutes: int = 15,
        allow_joint_maintenance: bool = True,
        solver_timeout_seconds: float = 10.0
    ) -> Dict[str, Any]:
        """
        Solves the maintenance block allocation using Google OR-Tools CP-SAT.
        """
        if not tasks or not windows:
            return {
                "status": "COMPLETED",
                "solver_status": "NO_DATA",
                "scheduled": [],
                "unscheduled": [
                    {
                        "task_id": getattr(t, "id", None) or t.get("id"),
                        "reason": "No block windows or maintenance tasks provided for scheduling.",
                        "priority_score": 0.0,
                        "details": "Planning horizon contains no eligible resources."
                    }
                    for t in tasks
                ],
                "total_maintenance_minutes": 0,
                "metrics": {
                    "scheduled_count": 0,
                    "unscheduled_count": len(tasks),
                    "utilization_percent": 0.0
                }
            }

        # Calculate reference epoch (t0) in UTC for integer minute conversions
        all_window_starts = [
            self._ensure_utc(getattr(w, "start_time", None) or w["start_time"])
            for w in windows
        ]
        t0 = min(all_window_starts)

        def to_minutes(dt: datetime) -> int:
            return int((self._ensure_utc(dt) - t0).total_seconds() / 60)

        def from_minutes(minutes: int) -> datetime:
            return t0 + timedelta(minutes=minutes)

        # Pre-compute priority score for each task if not already scored
        scored_tasks = []
        for t in tasks:
            t_id = getattr(t, "id", None) or t["id"]
            crit = getattr(t, "criticality", None) or t.get("criticality", 3)
            urg = getattr(t, "urgency", None) or t.get("urgency", 3)
            overdue = getattr(t, "overdue_days", None) or t.get("overdue_days", 0)
            dept = getattr(t, "department", None) or t.get("department", "ENGINEERING")
            dur = getattr(t, "duration_minutes", None) or t.get("duration_minutes", 60)

            score_res = self.priority_engine.calculate_priority(
                criticality=crit,
                urgency=urg,
                overdue_days=overdue,
                department=dept,
                duration_minutes=dur
            )
            scored_tasks.append({
                "task": t,
                "task_id": t_id,
                "priority_score": score_res.score,
                "priority_explanation": score_res.explanation
            })

        # Sort tasks by priority score descending
        scored_tasks.sort(key=lambda x: x["priority_score"], reverse=True)

        # Initialize CP-SAT Model
        model = cp_model.CpModel()

        # Data structures for decision variables
        # x[task_id, window_id] -> BoolVar
        x = {}
        task_starts = {}
        task_ends = {}
        task_intervals = {}
        feasible_pairs = []
        task_feasible_windows: Dict[str, List[str]] = {st["task_id"]: [] for st in scored_tasks}

        # Analyze feasibility for each (task, window) pair
        for st in scored_tasks:
            t = st["task"]
            t_id = st["task_id"]
            t_corr = getattr(t, "corridor_id", None) or t.get("corridor_id")
            t_dur = getattr(t, "duration_minutes", None) or t.get("duration_minutes")
            t_earliest = self._ensure_utc(getattr(t, "earliest_start", None) or t.get("earliest_start"))
            t_deadline = self._ensure_utc(getattr(t, "deadline", None) or t.get("deadline"))
            t_dept = getattr(t, "department", None) or t.get("department")

            for w in windows:
                w_id = getattr(w, "id", None) or w.get("id")
                w_corr = getattr(w, "corridor_id", None) or w.get("corridor_id")
                w_cap = getattr(w, "available_capacity_minutes", None) or w.get("available_capacity_minutes")
                w_start = self._ensure_utc(getattr(w, "start_time", None) or w.get("start_time"))
                w_end = self._ensure_utc(getattr(w, "end_time", None) or w.get("end_time"))
                w_restr = getattr(w, "department_restrictions", None) or w.get("department_restrictions")

                # Check 1: Corridor match
                if t_corr != w_corr:
                    continue

                # Check 2: Duration capacity
                if t_dur > w_cap:
                    continue

                # Check 3: Overlap with task permissible window
                effective_earliest = max(t_earliest, w_start)
                effective_latest = min(t_deadline, w_end)
                if effective_earliest + timedelta(minutes=t_dur) > effective_latest:
                    continue

                # Check 4: Department restrictions on window
                if w_restr and w_restr.upper() not in ["ALL", "NONE", ""]:
                    allowed_depts = [d.strip().upper() for d in w_restr.split(",")]
                    if str(t_dept).upper() not in allowed_depts:
                        continue

                # Feasible pair found! Create CP-SAT variables
                pair_key = (t_id, w_id)
                feasible_pairs.append(pair_key)
                task_feasible_windows[t_id].append(w_id)

                var_x = model.NewBoolVar(f"x_{t_id}_{w_id}")
                x[pair_key] = var_x

                start_min = to_minutes(effective_earliest)
                start_max = to_minutes(effective_latest) - t_dur
                start_var = model.NewIntVar(start_min, max(start_min, start_max), f"start_{t_id}_{w_id}")
                end_var = model.NewIntVar(start_min + t_dur, max(start_min, start_max) + t_dur, f"end_{t_id}_{w_id}")
                
                interval_var = model.NewOptionalIntervalVar(
                    start_var,
                    t_dur,
                    end_var,
                    var_x,
                    f"interval_{t_id}_{w_id}"
                )

                task_starts[pair_key] = start_var
                task_ends[pair_key] = end_var
                task_intervals[pair_key] = interval_var

        # Constraint 1: Each task scheduled at most once
        for st in scored_tasks:
            t_id = st["task_id"]
            assigned_vars = [x[(t_id, w_id)] for w_id in task_feasible_windows[t_id]]
            if assigned_vars:
                model.Add(sum(assigned_vars) <= 1)

        # Constraint 2: Total duration assigned in each window <= available capacity
        for w in windows:
            w_id = getattr(w, "id", None) or w.get("id")
            w_cap = getattr(w, "available_capacity_minutes", None) or w.get("available_capacity_minutes")
            
            window_task_terms = []
            for st in scored_tasks:
                t_id = st["task_id"]
                if (t_id, w_id) in x:
                    t_dur = getattr(st["task"], "duration_minutes", None) or st["task"].get("duration_minutes")
                    window_task_terms.append(t_dur * x[(t_id, w_id)])

            if window_task_terms:
                model.Add(sum(window_task_terms) <= w_cap)

        # Constraint 3: Non-overlapping maintenance tasks on the same corridor/window
        for w in windows:
            w_id = getattr(w, "id", None) or w.get("id")
            
            if not allow_joint_maintenance:
                # No tasks can overlap within the same block window
                w_intervals = [
                    task_intervals[(st["task_id"], w_id)]
                    for st in scored_tasks
                    if (st["task_id"], w_id) in task_intervals
                ]
                if len(w_intervals) > 1:
                    model.AddNoOverlap(w_intervals)
            else:
                # Same department tasks cannot overlap; different departments can share
                depts = set(getattr(st["task"], "department", None) or st["task"].get("department") for st in scored_tasks)
                for dept in depts:
                    dept_intervals = [
                        task_intervals[(st["task_id"], w_id)]
                        for st in scored_tasks
                        if (st["task_id"], w_id) in task_intervals and
                        (getattr(st["task"], "department", None) or st["task"].get("department")) == dept
                    ]
                    if len(dept_intervals) > 1:
                        model.AddNoOverlap(dept_intervals)

        # Constraint 4: Avoid train timetable intervals + safety buffer
        buffer_delta = timedelta(minutes=safety_buffer_minutes)
        for w in windows:
            w_id = getattr(w, "id", None) or w.get("id")
            w_corr = getattr(w, "corridor_id", None) or w.get("corridor_id")
            w_start = self._ensure_utc(getattr(w, "start_time", None) or w.get("start_time"))
            w_end = self._ensure_utc(getattr(w, "end_time", None) or w.get("end_time"))

            # Relevant trains traversing this corridor during or near this window
            corridor_trains = [
                trn for trn in trains
                if (getattr(trn, "corridor_id", None) or trn.get("corridor_id")) == w_corr
            ]

            for trn in corridor_trains:
                trn_num = getattr(trn, "train_number", None) or trn.get("train_number")
                trn_start = self._ensure_utc(getattr(trn, "scheduled_start", None) or trn.get("scheduled_start"))
                trn_end = self._ensure_utc(getattr(trn, "scheduled_end", None) or trn.get("scheduled_end"))

                blocked_start = trn_start - buffer_delta
                blocked_end = trn_end + buffer_delta

                # Only enforce if train buffer overlaps with window interval
                if max(w_start, blocked_start) < min(w_end, blocked_end):
                    t_blocked_start_min = to_minutes(blocked_start)
                    t_blocked_end_min = to_minutes(blocked_end)

                    for st in scored_tasks:
                        t_id = st["task_id"]
                        if (t_id, w_id) in x:
                            var_x = x[(t_id, w_id)]
                            start_var = task_starts[(t_id, w_id)]
                            end_var = task_ends[(t_id, w_id)]

                            before_train = model.NewBoolVar(f"before_{t_id}_{w_id}_{trn_num}")
                            after_train = model.NewBoolVar(f"after_{t_id}_{w_id}_{trn_num}")

                            model.Add(end_var <= t_blocked_start_min).OnlyEnforceIf(before_train)
                            model.Add(start_var >= t_blocked_end_min).OnlyEnforceIf(after_train)

                            # If task is scheduled in this window, it must be either before or after train
                            model.Add(before_train + after_train == 1).OnlyEnforceIf(var_x)

        # Objective Function:
        # Maximize: sum(priority_score * 100 * x) - minor penalty for later starts to pack early
        objective_terms = []
        for st in scored_tasks:
            t_id = st["task_id"]
            # Weight priority score scaled to integer
            p_weight = int(st["priority_score"] * 100)
            for w_id in task_feasible_windows[t_id]:
                if (t_id, w_id) in x:
                    objective_terms.append(p_weight * x[(t_id, w_id)])

        model.Maximize(sum(objective_terms))

        # Solve Model with Google OR-Tools CP-SAT
        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = solver_timeout_seconds
        solver.parameters.num_search_workers = 4
        solver_status = solver.Solve(model)

        # Collect Results
        scheduled_results = []
        unscheduled_results = []
        total_maintenance_minutes = 0
        scheduled_task_ids = set()

        if solver_status in [cp_model.OPTIMAL, cp_model.FEASIBLE]:
            for st in scored_tasks:
                t = st["task"]
                t_id = st["task_id"]
                t_dur = getattr(t, "duration_minutes", None) or t.get("duration_minutes")
                t_corr = getattr(t, "corridor_id", None) or t.get("corridor_id")
                t_title = getattr(t, "title", None) or t.get("title", f"Task {t_id}")
                t_dept = getattr(t, "department", None) or t.get("department")

                for w_id in task_feasible_windows[t_id]:
                    if (t_id, w_id) in x and solver.Value(x[(t_id, w_id)]) == 1:
                        assigned_start_min = solver.Value(task_starts[(t_id, w_id)])
                        assigned_end_min = solver.Value(task_ends[(t_id, w_id)])
                        
                        dt_start = from_minutes(assigned_start_min)
                        dt_end = from_minutes(assigned_end_min)

                        explanation = (
                            f"Assigned to Block Window {w_id} on corridor {t_corr}. "
                            f"Duration: {t_dur} min (Priority Score: {st['priority_score']:.1f}/100). "
                            f"Cleared against train paths with {safety_buffer_minutes}-min safety buffer."
                        )

                        scheduled_results.append({
                            "task_id": t_id,
                            "block_window_id": w_id,
                            "corridor_id": t_corr,
                            "assigned_start": dt_start,
                            "assigned_end": dt_end,
                            "duration_minutes": t_dur,
                            "priority_score": st["priority_score"],
                            "explanation": explanation,
                            "task_title": t_title,
                            "department": t_dept,
                            "status": "SCHEDULED"
                        })
                        scheduled_task_ids.add(t_id)
                        total_maintenance_minutes += t_dur
                        break

        # Diagnose Unscheduled Tasks with explicit reasons
        for st in scored_tasks:
            t_id = st["task_id"]
            if t_id not in scheduled_task_ids:
                t = st["task"]
                t_corr = getattr(t, "corridor_id", None) or t.get("corridor_id")
                t_dur = getattr(t, "duration_minutes", None) or t.get("duration_minutes")
                t_earliest = self._ensure_utc(getattr(t, "earliest_start", None) or t.get("earliest_start"))
                t_deadline = self._ensure_utc(getattr(t, "deadline", None) or t.get("deadline"))
                t_title = getattr(t, "title", None) or t.get("title", f"Task {t_id}")
                t_dept = getattr(t, "department", None) or t.get("department")

                # Run step-by-step diagnostic
                corridor_windows = [
                    w for w in windows
                    if (getattr(w, "corridor_id", None) or w.get("corridor_id")) == t_corr
                ]

                reason = ""
                details = ""

                if not corridor_windows:
                    reason = f"No block windows registered for corridor {t_corr}."
                    details = "Corridor has zero active block windows in the current planning period."
                elif not any(
                    (getattr(w, "available_capacity_minutes", None) or w.get("available_capacity_minutes")) >= t_dur
                    for w in corridor_windows
                ):
                    max_cap = max(
                        getattr(w, "available_capacity_minutes", None) or w.get("available_capacity_minutes")
                        for w in corridor_windows
                    )
                    reason = f"Insufficient window capacity: task requires {t_dur} min, max available is {max_cap} min."
                    details = "Consider splitting maintenance scope or requesting a special prolonged mega-block."
                elif len(task_feasible_windows[t_id]) == 0:
                    reason = f"No block window falls within task permissible interval [{t_earliest.strftime('%H:%M')} to {t_deadline.strftime('%H:%M')}]."
                    details = "Task deadline expired or earliest start is after all available block window intervals."
                else:
                    reason = "Solver conflict: available block windows occupied by higher-priority tasks or blocked by train movements."
                    details = f"Compatible windows exist ({', '.join(task_feasible_windows[t_id])}), but were allocated to higher priority jobs or restricted by train safety buffers."

                unscheduled_results.append({
                    "task_id": t_id,
                    "reason": reason,
                    "priority_score": st["priority_score"],
                    "details": details,
                    "task_title": t_title,
                    "department": t_dept
                })

        # Calculate overall block capacity utilization
        total_window_capacity = sum(
            getattr(w, "available_capacity_minutes", None) or w.get("available_capacity_minutes", 0)
            for w in windows
        )
        utilization = round((total_maintenance_minutes / total_window_capacity * 100.0), 2) if total_window_capacity > 0 else 0.0

        overdue_high_priority_covered = sum(
            1 for s in scheduled_results
            if (getattr(tasks_map.get(s["task_id"]), "overdue_days", 0) if (tasks_map := {st["task_id"]: st["task"] for st in scored_tasks}) else 0) > 0
            and (getattr(tasks_map.get(s["task_id"]), "criticality", 0) if tasks_map else 0) >= 4
        )

        return {
            "status": "OPTIMAL" if solver_status == cp_model.OPTIMAL else ("FEASIBLE" if solver_status == cp_model.FEASIBLE else "INFEASIBLE"),
            "solver_status": solver.StatusName(solver_status),
            "scheduled": scheduled_results,
            "unscheduled": unscheduled_results,
            "total_maintenance_minutes": total_maintenance_minutes,
            "metrics": {
                "scheduled_count": len(scheduled_results),
                "unscheduled_count": len(unscheduled_results),
                "total_considered": len(tasks),
                "overdue_high_priority_covered": overdue_high_priority_covered,
                "utilization_percent": utilization,
                "total_window_capacity_minutes": total_window_capacity
            }
        }


default_ortools_scheduler = OrToolsScheduler()
