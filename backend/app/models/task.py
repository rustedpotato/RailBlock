from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.base import Base


class MaintenanceTask(Base):
    """
    Departmental maintenance requirement submitted by section engineers.
    
    Timezone note:
    All timestamps (earliest_start, deadline, created_at, updated_at) are stored
    internally in UTC (Coordinated Universal Time). Indian Railways operates under
    Indian Standard Time (IST, UTC+05:30). Display formatting converts UTC to IST.
    """
    __tablename__ = "maintenance_tasks"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    department = Column(String(64), nullable=False, index=True)  # ENGINEERING, TRACTION_DISTRIBUTION, SIGNAL_TELECOMMUNICATION
    asset_id = Column(String(64), ForeignKey("assets.id", ondelete="CASCADE"), nullable=False, index=True)
    corridor_id = Column(String(64), ForeignKey("corridors.id", ondelete="CASCADE"), nullable=False, index=True)
    duration_minutes = Column(Integer, nullable=False)
    criticality = Column(Integer, nullable=False, default=3)  # Scale 1-5 (5 = Safety Critical)
    urgency = Column(Integer, nullable=False, default=3)      # Scale 1-5 (5 = Immediate)
    overdue_days = Column(Integer, nullable=False, default=0) # Days beyond planned maintenance cycle
    earliest_start = Column(DateTime(timezone=True), nullable=False)
    deadline = Column(DateTime(timezone=True), nullable=False)
    status = Column(String(32), nullable=False, default="PENDING")  # PENDING, SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    asset = relationship("Asset", back_populates="tasks")
    corridor = relationship("Corridor", back_populates="tasks")
    scheduled_entries = relationship("ScheduledMaintenance", back_populates="task", cascade="all, delete-orphan")
