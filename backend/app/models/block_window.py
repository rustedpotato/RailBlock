from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db.base import Base


class BlockWindow(Base):
    """
    Authorized track or power block interval available for railway maintenance.
    
    Timezone note:
    start_time and end_time are stored in UTC.
    available_capacity_minutes defines the effective working duration allowed
    after deducting traction power cut-off / restoration and shadow clearance protocols.
    """
    __tablename__ = "block_windows"

    id = Column(String(64), primary_key=True, index=True)
    corridor_id = Column(String(64), ForeignKey("corridors.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(128), nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    available_capacity_minutes = Column(Integer, nullable=False)
    department_restrictions = Column(String(255), nullable=True)  # Comma-separated or 'ALL'
    line_affected = Column(String(16), nullable=False, default="BOTH")  # UP, DOWN, BOTH
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    corridor = relationship("Corridor", back_populates="block_windows")
    scheduled_tasks = relationship("ScheduledMaintenance", back_populates="block_window", cascade="all, delete-orphan")
