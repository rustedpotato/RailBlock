from sqlalchemy import Column, String, Float, Text
from sqlalchemy.orm import relationship
from app.db.base import Base


class Corridor(Base):
    """
    Railway Corridor model representing a dedicated mainline section
    (e.g., New Delhi - Kanpur High Density Double Track Corridor).
    """
    __tablename__ = "corridors"

    id = Column(String(64), primary_key=True, index=True)
    code = Column(String(32), unique=True, nullable=False, index=True)
    name = Column(String(128), nullable=False)
    description = Column(Text, nullable=True)
    zone = Column(String(64), nullable=False, default="Northern Railway")
    total_km = Column(Float, nullable=False, default=100.0)

    # Relationships
    assets = relationship("Asset", back_populates="corridor", cascade="all, delete-orphan")
    tasks = relationship("MaintenanceTask", back_populates="corridor", cascade="all, delete-orphan")
    trains = relationship("TrainSchedule", back_populates="corridor", cascade="all, delete-orphan")
    block_windows = relationship("BlockWindow", back_populates="corridor", cascade="all, delete-orphan")
