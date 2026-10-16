from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class TrainSchedule(Base):
    """
    Timetabled commercial and freight train movement over a railway corridor.
    
    Timezone note:
    scheduled_start and scheduled_end are stored in UTC. For safety analysis,
    a buffer margin (default 15-30 min) is enforced around these intervals
    to prevent maintenance equipment from obstructing scheduled train paths.
    """
    __tablename__ = "train_schedules"

    id = Column(String(64), primary_key=True, index=True)
    train_number = Column(String(32), nullable=False, index=True)
    train_name = Column(String(128), nullable=False)
    train_type = Column(String(64), nullable=False)  # VANDE_BHARAT, RAJDHANI, SUPERFAST, EXPRESS, FREIGHT
    corridor_id = Column(String(64), ForeignKey("corridors.id", ondelete="CASCADE"), nullable=False, index=True)
    direction = Column(String(16), nullable=False, default="UP")  # UP, DOWN
    scheduled_start = Column(DateTime(timezone=True), nullable=False)
    scheduled_end = Column(DateTime(timezone=True), nullable=False)
    priority_level = Column(Integer, nullable=False, default=3)  # 5 = Premium (Vande Bharat/Rajdhani), 1 = Freight

    # Relationships
    corridor = relationship("Corridor", back_populates="trains")
