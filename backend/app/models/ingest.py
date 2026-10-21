from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime, Text
from app.db.base import Base


class Station(Base):
    """Railway station imported from OpenStreetMap (Mumbai suburban network)."""
    __tablename__ = "stations"

    id = Column(String(64), primary_key=True)  # e.g. osm-node-123
    name = Column(String(128), nullable=False, index=True)
    line = Column(String(16), nullable=False, index=True)  # WR / CR / HR
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    source = Column(String(32), nullable=False, default="openstreetmap")


class BlockNotice(Base):
    """
    Mega-block announcement extracted by Gemini (Google Search grounded).
    Stays 'PENDING' until an admin approves it; only then is a BlockWindow created.
    """
    __tablename__ = "block_notices"

    id = Column(Integer, primary_key=True, autoincrement=True)
    line = Column(String(16), nullable=False, index=True)  # WR / CR / HR
    section = Column(String(255), nullable=False)
    from_station = Column(String(128), nullable=True)
    to_station = Column(String(128), nullable=True)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    block_type = Column(String(64), nullable=True)
    cancelled_trains = Column(Text, nullable=True)
    source_url = Column(String(512), nullable=True)
    stations_verified = Column(Integer, nullable=False, default=0)  # 1 if both stations matched OSM
    status = Column(String(16), nullable=False, default="PENDING", index=True)  # PENDING/APPROVED/REJECTED
    fetched_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    block_window_id = Column(String(64), nullable=True)
