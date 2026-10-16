"""
RailBlock AI — Synthetic Demonstration Data Seeder (SIH26027)
=============================================================

SYNTHETIC DATA DISCLAIMER:
This script populates synthetic railway corridors, assets, timetables, and maintenance
demands for demonstration and testing of the RailBlock AI decision-support platform.
It does NOT represent authorized Indian Railways operational data or live train control logs.

Usage:
  python -m app.db.seed
"""

import sys
from datetime import datetime, timedelta, timezone
from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.models.corridor import Corridor
from app.models.asset import Asset
from app.models.task import MaintenanceTask
from app.models.train import TrainSchedule
from app.models.block_window import BlockWindow
from app.models.plan import MaintenancePlan, ScheduledMaintenance, UnscheduledTaskRecord


def seed_synthetic_data(db_session=None) -> None:
    db = db_session or SessionLocal()
    try:
        # Re-create tables
        Base.metadata.create_all(bind=engine)

        print("[Seed] Clearing existing demo records...")
        db.query(ScheduledMaintenance).delete()
        db.query(UnscheduledTaskRecord).delete()
        db.query(MaintenancePlan).delete()
        db.query(MaintenanceTask).delete()
        db.query(TrainSchedule).delete()
        db.query(BlockWindow).delete()
        db.query(Asset).delete()
        db.query(Corridor).delete()
        db.commit()

        print("[Seed] Populating Corridors...")
        c1 = Corridor(
            id="CORR-NDLS-CNB",
            code="NDLS-CNB",
            name="New Delhi - Kanpur High Density Double Track Corridor",
            description="SYNTHETIC: Northern & North Central Railway electrified double-track trunk route.",
            zone="Northern / North Central Railway",
            total_km=440.0
        )
        c2 = Corridor(
            id="CORR-BCT-ADI",
            code="BCT-ADI",
            name="Mumbai Central - Ahmedabad Western Trunk Corridor",
            description="SYNTHETIC: Western Railway high-speed electrified mainline.",
            zone="Western Railway",
            total_km=492.0
        )
        db.add_all([c1, c2])
        db.commit()

        print("[Seed] Populating Assets across Engineering, TRD, and S&T...")
        assets = [
            Asset(
                id="AST-ENG-01",
                name="Mainline Track Section KM 118-124 (Up Line)",
                asset_type="TRACK_SEGMENT",
                corridor_id="CORR-NDLS-CNB",
                department="ENGINEERING",
                availability_status="MAINTENANCE_REQUIRED",
                location_km=118.0
            ),
            Asset(
                id="AST-ENG-02",
                name="Yamuna Bridge No. 12 Structural Girder & Track",
                asset_type="BRIDGE_TRACK",
                corridor_id="CORR-NDLS-CNB",
                department="ENGINEERING",
                availability_status="DEGRADED",
                location_km=18.5
            ),
            Asset(
                id="AST-TRD-01",
                name="25kV AC OHE Cantilever Section KM 120-135",
                asset_type="OHE_LINE",
                corridor_id="CORR-NDLS-CNB",
                department="TRACTION_DISTRIBUTION",
                availability_status="OPERATIONAL",
                location_km=125.0
            ),
            Asset(
                id="AST-TRD-02",
                name="Aligarh Junction 132/25kV Traction Sub-Station",
                asset_type="TRACTION_SUBSTATION",
                corridor_id="CORR-NDLS-CNB",
                department="TRACTION_DISTRIBUTION",
                availability_status="DEGRADED",
                location_km=126.0
            ),
            Asset(
                id="AST-ST-01",
                name="Electronic Interlocking Station Rack (Ghaziabad)",
                asset_type="ELECTRONIC_INTERLOCKING",
                corridor_id="CORR-NDLS-CNB",
                department="SIGNAL_TELECOMMUNICATION",
                availability_status="MAINTENANCE_REQUIRED",
                location_km=24.0
            ),
            Asset(
                id="AST-ST-02",
                name="Turnout Point Machine 104A/B (Kanpur Yard)",
                asset_type="POINT_MACHINE",
                corridor_id="CORR-NDLS-CNB",
                department="SIGNAL_TELECOMMUNICATION",
                availability_status="OPERATIONAL",
                location_km=435.0
            ),
            Asset(
                id="AST-ST-03",
                name="Digital Axle Counter Section KM 115-120",
                asset_type="AXLE_COUNTER",
                corridor_id="CORR-NDLS-CNB",
                department="SIGNAL_TELECOMMUNICATION",
                availability_status="OPERATIONAL",
                location_km=117.5
            )
        ]
        db.add_all(assets)
        db.commit()

        # Fixed reference dates for predictable, repeatable schedule testing
        base_date = datetime(2026, 10, 20, 0, 0, tzinfo=timezone.utc)

        print("[Seed] Populating Authorized Block Windows...")
        windows = [
            BlockWindow(
                id="BW-NDLS-NIGHT-01",
                corridor_id="CORR-NDLS-CNB",
                name="Night Track & Power Mega-Block Up Line",
                start_time=base_date + timedelta(hours=1),           # 01:00 UTC
                end_time=base_date + timedelta(hours=4, minutes=30), # 04:30 UTC
                available_capacity_minutes=210,
                department_restrictions=None,  # Open to joint maintenance
                line_affected="UP",
                is_active=True
            ),
            BlockWindow(
                id="BW-NDLS-DAY-02",
                corridor_id="CORR-NDLS-CNB",
                name="Mid-Day Rolling Maintenance Window",
                start_time=base_date + timedelta(hours=11, minutes=30), # 11:30 UTC
                end_time=base_date + timedelta(hours=14, minutes=0),    # 14:00 UTC
                available_capacity_minutes=150,
                department_restrictions=None,
                line_affected="BOTH",
                is_active=True
            ),
            BlockWindow(
                id="BW-CNB-NIGHT-03",
                corridor_id="CORR-NDLS-CNB",
                name="Night S&T and Track Inspection Block",
                start_time=base_date + timedelta(days=1, hours=1),       # 2026-10-21 01:00 UTC
                end_time=base_date + timedelta(days=1, hours=4),         # 2026-10-21 04:00 UTC
                available_capacity_minutes=180,
                department_restrictions="ENGINEERING,SIGNAL_TELECOMMUNICATION",
                line_affected="DOWN",
                is_active=True
            )
        ]
        db.add_all(windows)
        db.commit()

        print("[Seed] Populating Train Schedules (commercial & freight)...")
        trains = [
            TrainSchedule(
                id="TRN-22436",
                train_number="22436",
                train_name="Vande Bharat Express (NDLS-BSB)",
                train_type="VANDE_BHARAT",
                corridor_id="CORR-NDLS-CNB",
                direction="UP",
                scheduled_start=base_date + timedelta(hours=12, minutes=0),  # 12:00 UTC
                scheduled_end=base_date + timedelta(hours=12, minutes=45),    # 12:45 UTC
                priority_level=5
            ),
            TrainSchedule(
                id="TRN-12302",
                train_number="12302",
                train_name="Howrah Rajdhani Express",
                train_type="RAJDHANI",
                corridor_id="CORR-NDLS-CNB",
                direction="DOWN",
                scheduled_start=base_date + timedelta(hours=17, minutes=0),  # 17:00 UTC
                scheduled_end=base_date + timedelta(hours=17, minutes=50),    # 17:50 UTC
                priority_level=5
            ),
            TrainSchedule(
                id="TRN-12554",
                train_number="12554",
                train_name="Vaishali Superfast Express",
                train_type="SUPERFAST",
                corridor_id="CORR-NDLS-CNB",
                direction="UP",
                scheduled_start=base_date + timedelta(hours=21, minutes=0),  # 21:00 UTC
                scheduled_end=base_date + timedelta(hours=21, minutes=55),    # 21:55 UTC
                priority_level=4
            ),
            TrainSchedule(
                id="TRN-BOXN-901",
                train_number="BOXN-901",
                train_name="Freight Coal Rake (Thermal Power Feeder)",
                train_type="FREIGHT",
                corridor_id="CORR-NDLS-CNB",
                direction="DOWN",
                scheduled_start=base_date + timedelta(hours=5, minutes=0),   # 05:00 UTC
                scheduled_end=base_date + timedelta(hours=6, minutes=15),    # 06:15 UTC
                priority_level=2
            )
        ]
        db.add_all(trains)
        db.commit()

        print("[Seed] Populating Maintenance Tasks (incorporating required test cases)...")
        tasks = [
            # Case 1: Overdue high-criticality task
            MaintenanceTask(
                id="TSK-ENG-001",
                title="USFD Rail Flaw Detection & Weld Joint Renewal",
                description="SYNTHETIC: High-speed flaw detected in ultrasonic inspection. Urgent weld replacement required.",
                department="ENGINEERING",
                asset_id="AST-ENG-01",
                corridor_id="CORR-NDLS-CNB",
                duration_minutes=120,
                criticality=5,       # Safety Critical
                urgency=5,           # Immediate
                overdue_days=8,      # 8 days overdue
                earliest_start=base_date,
                deadline=base_date + timedelta(days=2),
                status="PENDING"
            ),
            # Case 2: Conflicting train movement task (runs during midday window where Vande Bharat passes)
            MaintenanceTask(
                id="TSK-TRD-002",
                title="OHE Contact Wire Stagger & Dropper Adjustment",
                description="SYNTHETIC: 25kV OHE height profile adjustment under tower wagon.",
                department="TRACTION_DISTRIBUTION",
                asset_id="AST-TRD-01",
                corridor_id="CORR-NDLS-CNB",
                duration_minutes=90,
                criticality=4,
                urgency=4,
                overdue_days=2,
                earliest_start=base_date + timedelta(hours=11, minutes=30),
                deadline=base_date + timedelta(hours=14, minutes=0),
                status="PENDING"
            ),
            # Case 3: Task that CANNOT fit into any available block window (duration 360 min > max window 210 min)
            MaintenanceTask(
                id="TSK-ENG-003",
                title="Deep Ballast Screening Machine (BCM) Major Track Rehabilitation",
                description="SYNTHETIC: Heavy mechanised tamping and deep ballast screening requiring prolonged line block.",
                department="ENGINEERING",
                asset_id="AST-ENG-02",
                corridor_id="CORR-NDLS-CNB",
                duration_minutes=360,  # 6 hours
                criticality=3,
                urgency=3,
                overdue_days=0,
                earliest_start=base_date,
                deadline=base_date + timedelta(days=2),
                status="PENDING"
            ),
            # Case 4: Task that can be scheduled in multiple candidate windows
            MaintenanceTask(
                id="TSK-ST-004",
                title="Point Machine 104A/B Internal Motor & Clutch Overhaul",
                description="SYNTHETIC: Quarterly periodic overhauling and ground track circuit testing.",
                department="SIGNAL_TELECOMMUNICATION",
                asset_id="AST-ST-02",
                corridor_id="CORR-NDLS-CNB",
                duration_minutes=60,
                criticality=4,
                urgency=3,
                overdue_days=1,
                earliest_start=base_date,
                deadline=base_date + timedelta(days=2),
                status="PENDING"
            ),
            # Additional department tasks
            MaintenanceTask(
                id="TSK-ST-005",
                title="Electronic Interlocking Logic Card Redundancy Testing",
                description="SYNTHETIC: Signal route setting integrity and standby processor switchover drill.",
                department="SIGNAL_TELECOMMUNICATION",
                asset_id="AST-ST-01",
                corridor_id="CORR-NDLS-CNB",
                duration_minutes=75,
                criticality=4,
                urgency=4,
                overdue_days=3,
                earliest_start=base_date,
                deadline=base_date + timedelta(days=1),
                status="PENDING"
            ),
            MaintenanceTask(
                id="TSK-TRD-006",
                title="Traction Substation Circuit Breaker SF6 Gas Pressure Verification",
                description="SYNTHETIC: 132kV/25kV auxiliary power breaker routine calibration.",
                department="TRACTION_DISTRIBUTION",
                asset_id="AST-TRD-02",
                corridor_id="CORR-NDLS-CNB",
                duration_minutes=90,
                criticality=3,
                urgency=3,
                overdue_days=0,
                earliest_start=base_date + timedelta(days=1),
                deadline=base_date + timedelta(days=2),
                status="PENDING"
            )
        ]
        db.add_all(tasks)
        db.commit()

        print(f"[Seed] Successfully seeded {len(assets)} assets, {len(windows)} block windows, "
              f"{len(trains)} trains, and {len(tasks)} maintenance tasks.")
    except Exception as exc:
        db.rollback()
        print(f"[Seed Error]: {exc}")
        raise exc
    finally:
        if not db_session:
            db.close()


if __name__ == "__main__":
    seed_synthetic_data()
