from sqlalchemy import Column, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class Asset(Base):
    """
    Railway physical asset requiring scheduled inspections and maintenance.
    Departments:
      - ENGINEERING (Civil / Permanent Way / Bridges)
      - TRACTION_DISTRIBUTION (TRD / 25kV OHE / Substations)
      - SIGNAL_TELECOMMUNICATION (S&T / Interlocking / Points / Track Circuits)
    """
    __tablename__ = "assets"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    asset_type = Column(String(64), nullable=False)  # TRACK_SEGMENT, OHE_LINE, POINT_MACHINE, etc.
    corridor_id = Column(String(64), ForeignKey("corridors.id", ondelete="CASCADE"), nullable=False, index=True)
    department = Column(String(64), nullable=False)  # ENGINEERING, TRACTION_DISTRIBUTION, SIGNAL_TELECOMMUNICATION
    availability_status = Column(String(64), nullable=False, default="OPERATIONAL")  # OPERATIONAL, DEGRADED, MAINTENANCE_REQUIRED, UNDER_MAINTENANCE
    location_km = Column(Float, nullable=True)

    # Relationships
    corridor = relationship("Corridor", back_populates="assets")
    tasks = relationship("MaintenanceTask", back_populates="asset", cascade="all, delete-orphan")
