from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.base import Base


class MaintenancePlan(Base):
    """
    Generated maintenance block schedule for a specific planning horizon.
    """
    __tablename__ = "maintenance_plans"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    planning_horizon_start = Column(DateTime(timezone=True), nullable=False)
    planning_horizon_end = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    status = Column(String(32), nullable=False, default="GENERATED")  # GENERATED, VALIDATED, APPROVED, REJECTED
    algorithm_used = Column(String(64), nullable=False, default="Google OR-Tools CP-SAT")
    
    # Quantitative metrics
    total_tasks_considered = Column(Integer, nullable=False, default=0)
    scheduled_task_count = Column(Integer, nullable=False, default=0)
    unscheduled_task_count = Column(Integer, nullable=False, default=0)
    total_maintenance_minutes = Column(Integer, nullable=False, default=0)
    overdue_high_priority_covered = Column(Integer, nullable=False, default=0)
    conflicts_detected = Column(Integer, nullable=False, default=0)
    block_utilization_percent = Column(Float, nullable=False, default=0.0)
    notes = Column(Text, nullable=True)
    safety_disclaimer = Column(
        Text,
        nullable=False,
        default=(
            "PROTOTYPE DECISION SUPPORT SYSTEM: This generated schedule is for demonstration "
            "and planning optimization only. It requires formal validation and safety clearance "
            "by authorized Indian Railways operating officers before field execution."
        )
    )

    # Relationships
    scheduled_tasks = relationship("ScheduledMaintenance", back_populates="plan", cascade="all, delete-orphan")
    unscheduled_tasks = relationship("UnscheduledTaskRecord", back_populates="plan", cascade="all, delete-orphan")


class ScheduledMaintenance(Base):
    """
    Individual task assignment to a concrete time slot inside a block window.
    """
    __tablename__ = "scheduled_maintenance"

    id = Column(String(64), primary_key=True, index=True)
    plan_id = Column(String(64), ForeignKey("maintenance_plans.id", ondelete="CASCADE"), nullable=False, index=True)
    task_id = Column(String(64), ForeignKey("maintenance_tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    block_window_id = Column(String(64), ForeignKey("block_windows.id", ondelete="CASCADE"), nullable=False, index=True)
    corridor_id = Column(String(64), nullable=False, index=True)
    assigned_start = Column(DateTime(timezone=True), nullable=False)
    assigned_end = Column(DateTime(timezone=True), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    status = Column(String(32), nullable=False, default="SCHEDULED")
    priority_score = Column(Float, nullable=False, default=0.0)
    explanation = Column(Text, nullable=False)

    # Relationships
    plan = relationship("MaintenancePlan", back_populates="scheduled_tasks")
    task = relationship("MaintenanceTask", back_populates="scheduled_entries")
    block_window = relationship("BlockWindow", back_populates="scheduled_tasks")


class UnscheduledTaskRecord(Base):
    """
    Record of a task that could not be feasibly scheduled, with explicit reason.
    """
    __tablename__ = "unscheduled_tasks"

    id = Column(String(64), primary_key=True, index=True)
    plan_id = Column(String(64), ForeignKey("maintenance_plans.id", ondelete="CASCADE"), nullable=False, index=True)
    task_id = Column(String(64), ForeignKey("maintenance_tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    reason = Column(String(255), nullable=False)
    priority_score = Column(Float, nullable=False, default=0.0)
    details = Column(Text, nullable=True)

    # Relationships
    plan = relationship("MaintenancePlan", back_populates="unscheduled_tasks")
    task = relationship("MaintenanceTask")
