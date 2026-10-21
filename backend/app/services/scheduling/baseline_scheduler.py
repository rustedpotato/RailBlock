"""
RailBlock AI — Baseline Heuristic Scheduler
===========================================

Provides a simple First-Come First-Served (FIFO) earliest-feasible baseline
scheduler used to benchmark against the Google OR-Tools CP-SAT optimizer.
"""

from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any
from app.services.prioritization.priority_engine import default_priority_engine


class BaselineScheduler:
    """
    Greedy earliest-fit heuristic scheduler without global constraint optimization.
    """

    def __init__(self, priority_engine=None):
        self.priority_engine = priority_engine or default_priority_engine

    def _ensure_utc(self, dt: datetime) -> datetime:
        if dt.tzinfo is None:
            return dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)

    def generate_baseline(
        self,
        tasks: List[Any],
        windows: List[Any],
        trains: List[Any],
        safety_buffer_minutes: int = 15
    ) -> Dict[str, Any]:
        """
        Greedily schedules tasks in incoming FIFO order into the first available block window slot.
        """
        buffer_delta = timedelta(minutes=safety_buffer_minutes)
        scheduled = []
        unscheduled = []
        total_minutes = 0

        def _v(obj, key, default=None):
            if hasattr(obj, key):
                val = getattr(obj, key)
                return val if val is not None else default
            if isinstance(obj, dict):
                val = obj.get(key)
                return val if val is not None else default
            return default

        # Track occupied time segments per window: window_id -> list of (start_dt, end_dt)
        window_occupancy: Dict[str, List[tuple]] = {
            _v(w, "id"): [] for w in windows
        }

        # Train intervals per corridor
        corridor_trains: Dict[str, List[tuple]] = {}
        for trn in trains:
            c_id = _v(trn, "corridor_id")
            s_time = self._ensure_utc(_v(trn, "scheduled_start"))
            e_time = self._ensure_utc(_v(trn, "scheduled_end"))
            corridor_trains.setdefault(c_id, []).append((s_time - buffer_delta, e_time + buffer_delta))

        for t in tasks:
            t_id = _v(t, "id")
            t_dur = _v(t, "duration_minutes", 60)
            t_corr = _v(t, "corridor_id")
            t_earliest = self._ensure_utc(_v(t, "earliest_start"))
            t_deadline = self._ensure_utc(_v(t, "deadline"))
            t_title = _v(t, "title", f"Task {t_id}")
            t_dept = _v(t, "department")

            crit = _v(t, "criticality", 3)
            urg = _v(t, "urgency", 3)
            overdue = _v(t, "overdue_days", 0)
            score_res = self.priority_engine.calculate_priority(crit, urg, overdue, t_dept, duration_minutes=t_dur)

            assigned = False

            # Search available windows on same corridor
            for w in windows:
                w_id = _v(w, "id")
                w_corr = _v(w, "corridor_id")
                if w_corr != t_corr:
                    continue

                w_start = self._ensure_utc(_v(w, "start_time"))
                w_end = self._ensure_utc(_v(w, "end_time"))

                # Try simple slot placement starting from max(w_start, t_earliest)
                candidate_start = max(w_start, t_earliest)
                candidate_end = candidate_start + timedelta(minutes=t_dur)

                # Step forward through window until end of window or deadline
                while candidate_end <= min(w_end, t_deadline):
                    # Check collision with existing tasks in this window
                    collides_with_task = any(
                        max(candidate_start, occ[0]) < min(candidate_end, occ[1])
                        for occ in window_occupancy[w_id]
                    )

                    # Check collision with train safety buffer on this corridor
                    collides_with_train = any(
                        max(candidate_start, trn_int[0]) < min(candidate_end, trn_int[1])
                        for trn_int in corridor_trains.get(t_corr, [])
                    )

                    if not collides_with_task and not collides_with_train:
                        # Feasible slot found in baseline
                        window_occupancy[w_id].append((candidate_start, candidate_end))
                        scheduled.append({
                            "task_id": t_id,
                            "block_window_id": w_id,
                            "corridor_id": t_corr,
                            "assigned_start": candidate_start,
                            "assigned_end": candidate_end,
                            "duration_minutes": t_dur,
                            "priority_score": score_res.score,
                            "explanation": f"Baseline FIFO greedy assignment to window {w_id}.",
                            "task_title": t_title,
                            "department": t_dept,
                            "status": "SCHEDULED"
                        })
                        total_minutes += t_dur
                        assigned = True
                        break
                    
                    # Step 15 minutes forward
                    candidate_start += timedelta(minutes=15)
                    candidate_end = candidate_start + timedelta(minutes=t_dur)

                if assigned:
                    break

            if not assigned:
                unscheduled.append({
                    "task_id": t_id,
                    "reason": "Baseline greedy search could not find an unblocked slot in FIFO order.",
                    "priority_score": score_res.score,
                    "details": "Lack of global constraint optimization resulted in window exhaustion.",
                    "task_title": t_title,
                    "department": t_dept
                })

        total_cap = sum(_v(w, "available_capacity_minutes", 0) for w in windows)
        utilization = round((total_minutes / total_cap * 100.0), 2) if total_cap > 0 else 0.0

        return {
            "scheduled": scheduled,
            "unscheduled": unscheduled,
            "total_maintenance_minutes": total_minutes,
            "metrics": {
                "scheduled_count": len(scheduled),
                "unscheduled_count": len(unscheduled),
                "utilization_percent": utilization
            }
        }


default_baseline_scheduler = BaselineScheduler()
