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

        print("[Seed] Populating Corridors (Western, Harbour & Northern Lines)...")
        c1 = Corridor(
            id="CORR-BCT-VR",
            code="BCT-VR",
            name="Mumbai Central - Virar Western Trunk & Suburban Corridor",
            description="SYNTHETIC: Western Railway quadruple-track high-density passenger & suburban trunk corridor.",
            zone="Western Railway (WR)",
            total_km=60.0
        )
        c2 = Corridor(
            id="CORR-CR-HARBOUR",
            code="CR-HARBOUR",
            name="Mumbai Harbour Line (CSMT - Panvel & Goregaon Branch)",
            description="SYNTHETIC: Central Railway high-density suburban Harbour & Trans-Harbour network including Thane Creek crossing.",
            zone="Central Railway (CR Harbour)",
            total_km=49.0
        )
        c3 = Corridor(
            id="CORR-NDLS-CNB",
            code="NDLS-CNB",
            name="New Delhi - Kanpur High Density Double Track Corridor",
            description="SYNTHETIC: Northern & North Central Railway electrified double-track trunk route.",
            zone="Northern / North Central Railway (NR/NCR)",
            total_km=440.0
        )
        db.add_all([c1, c2, c3])
        db.commit()

        print("[Seed] Populating Assets across Engineering, TRD, and S&T...")
        assets = [
            # Mumbai Central - Virar Assets
            Asset(
                id="AST-BCT-PWAY-01",
                name="Down Fast Mainline Track Section KM 28.4 (Bandra - Andheri)",
                asset_type="TRACK_SEGMENT",
                corridor_id="CORR-BCT-VR",
                department="ENGINEERING",
                availability_status="MAINTENANCE_REQUIRED",
                location_km=28.4
            ),
            Asset(
                id="AST-BCT-PWAY-02",
                name="Borivali North Diamond Crossover Turnout 102A/B",
                asset_type="TURNOUT_CROSSOVER",
                corridor_id="CORR-BCT-VR",
                department="ENGINEERING",
                availability_status="DEGRADED",
                location_km=34.2
            ),
            Asset(
                id="AST-BCT-TRD-01",
                name="25kV AC OHE Catenary & Contact Wire Sector (Dadar - Bandra Up Line)",
                asset_type="OHE_LINE",
                corridor_id="CORR-BCT-VR",
                department="TRACTION_DISTRIBUTION",
                availability_status="MAINTENANCE_REQUIRED",
                location_km=14.5
            ),
            Asset(
                id="AST-BCT-TRD-02",
                name="Borivali Traction Sub-Station 110kV/25kV Feeding Post",
                asset_type="TRACTION_SUBSTATION",
                corridor_id="CORR-BCT-VR",
                department="TRACTION_DISTRIBUTION",
                availability_status="OPERATIONAL",
                location_km=33.8
            ),
            Asset(
                id="AST-BCT-ST-01",
                name="Dadar Junction Electronic Interlocking (EI) Main Server Rack",
                asset_type="ELECTRONIC_INTERLOCKING",
                corridor_id="CORR-BCT-VR",
                department="SIGNAL_TELECOMMUNICATION",
                availability_status="MAINTENANCE_REQUIRED",
                location_km=9.2
            ),
            Asset(
                id="AST-BCT-ST-02",
                name="High-Speed Digital Axle Counter (DAC) Section KM 24-28",
                asset_type="AXLE_COUNTER",
                corridor_id="CORR-BCT-VR",
                department="SIGNAL_TELECOMMUNICATION",
                availability_status="OPERATIONAL",
                location_km=26.0
            ),
            # Harbour Railway Assets
            Asset(
                id="AST-HR-VSH-34",
                name="Vashi Creek Bridge No. 34 Structural Bearings & Track",
                asset_type="BRIDGE_TRACK",
                corridor_id="CORR-CR-HARBOUR",
                department="ENGINEERING",
                availability_status="MAINTENANCE_REQUIRED",
                location_km=28.5
            ),
            Asset(
                id="AST-HR-SND-08",
                name="Sandhurst Road Elevated Viaduct 25kV OHE Neutral Section",
                asset_type="OHE_LINE",
                corridor_id="CORR-CR-HARBOUR",
                department="TRACTION_DISTRIBUTION",
                availability_status="DEGRADED",
                location_km=2.4
            ),
            Asset(
                id="AST-HR-WDL-01",
                name="Wadala Junction Dual-Route Electronic Interlocking Server Rack",
                asset_type="ELECTRONIC_INTERLOCKING",
                corridor_id="CORR-CR-HARBOUR",
                department="SIGNAL_TELECOMMUNICATION",
                availability_status="OPERATIONAL",
                location_km=9.2
            ),

            # New Delhi - Kanpur Assets
            Asset(
                id="AST-ENG-01",
                name="Mainline Track Section KM 118-124 (Up Line Aligarh)",
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

        # Fixed reference dates for repeatable schedule testing
        base_date = datetime(2026, 10, 20, 0, 0, tzinfo=timezone.utc)

        print("[Seed] Populating Authorized Block Windows...")
        windows = [
            # Mumbai Corridor Windows
            BlockWindow(
                id="BW-BCT-NIGHT-01",
                corridor_id="CORR-BCT-VR",
                name="Western Railway Mega-Block (Up & Down Fast Lines)",
                start_time=base_date + timedelta(hours=1, minutes=0),     # 01:00 UTC
                end_time=base_date + timedelta(hours=4, minutes=30),       # 04:30 UTC (210 min)
                available_capacity_minutes=210,
                department_restrictions=None,  # Multi-department joint block
                line_affected="BOTH",
                is_active=True
            ),
            BlockWindow(
                id="BW-BCT-DAY-02",
                corridor_id="CORR-BCT-VR",
                name="Western Railway Mid-day Fast Line Shadow Window",
                start_time=base_date + timedelta(hours=11, minutes=0),    # 11:00 UTC
                end_time=base_date + timedelta(hours=13, minutes=30),     # 13:30 UTC (150 min)
                available_capacity_minutes=150,
                department_restrictions=None,
                line_affected="UP",
                is_active=True
            ),
            BlockWindow(
                id="BW-BCT-DAWN-03",
                corridor_id="CORR-BCT-VR",
                name="Pre-Dawn S&T Switch & Interlocking Window",
                start_time=base_date + timedelta(days=1, hours=3, minutes=30),
                end_time=base_date + timedelta(days=1, hours=5, minutes=30),
                available_capacity_minutes=120,
                department_restrictions="SIGNAL_TELECOMMUNICATION,ENGINEERING",
                line_affected="DOWN",
                is_active=True
            ),

            # Harbour Railway Windows
            BlockWindow(
                id="BW-HR-NIGHT-01",
                corridor_id="CORR-CR-HARBOUR",
                name="Harbour Line Pre-Dawn Power & Track Block",
                start_time=base_date + timedelta(hours=1, minutes=15),
                end_time=base_date + timedelta(hours=4, minutes=45),
                available_capacity_minutes=210,
                department_restrictions=None,
                line_affected="BOTH",
                is_active=True
            ),
            BlockWindow(
                id="BW-HR-SUNDAY-02",
                corridor_id="CORR-CR-HARBOUR",
                name="Sunday Mega Block (CSMT - Chunabhatti / Vadala - Mahim)",
                start_time=base_date + timedelta(days=1, hours=11, minutes=10),
                end_time=base_date + timedelta(days=1, hours=16, minutes=10),
                available_capacity_minutes=300,
                department_restrictions=None,
                line_affected="BOTH",
                is_active=True
            ),

            # New Delhi - Kanpur Windows
            BlockWindow(
                id="BW-NDLS-NIGHT-01",
                corridor_id="CORR-NDLS-CNB",
                name="Night Track & Power Mega-Block Up Line",
                start_time=base_date + timedelta(hours=1, minutes=0),
                end_time=base_date + timedelta(hours=4, minutes=30),
                available_capacity_minutes=210,
                department_restrictions=None,
                line_affected="UP",
                is_active=True
            ),
            BlockWindow(
                id="BW-NDLS-DAY-02",
                corridor_id="CORR-NDLS-CNB",
                name="Mid-Day Rolling Maintenance Window",
                start_time=base_date + timedelta(hours=11, minutes=30),
                end_time=base_date + timedelta(hours=14, minutes=0),
                available_capacity_minutes=150,
                department_restrictions=None,
                line_affected="BOTH",
                is_active=True
            ),
            BlockWindow(
                id="BW-CNB-NIGHT-03",
                corridor_id="CORR-NDLS-CNB",
                name="Night S&T and Track Inspection Block",
                start_time=base_date + timedelta(days=1, hours=1, minutes=0),
                end_time=base_date + timedelta(days=1, hours=4, minutes=0),
                available_capacity_minutes=180,
                department_restrictions="ENGINEERING,SIGNAL_TELECOMMUNICATION",
                line_affected="DOWN",
                is_active=True
            )
        ]
        db.add_all(windows)
        db.commit()

        print("[Seed] Populating Train Schedules (commercial, fast passenger & freight)...")
        trains = [
            # Mumbai Corridor Trains
            TrainSchedule(
                id="TRN-20901",
                train_number="20901",
                train_name="Mumbai Central - Gandhinagar Vande Bharat Express",
                train_type="VANDE_BHARAT",
                corridor_id="CORR-BCT-VR",
                direction="DOWN",
                scheduled_start=base_date + timedelta(hours=6, minutes=10),
                scheduled_end=base_date + timedelta(hours=6, minutes=50),
                priority_level=5
            ),
            TrainSchedule(
                id="TRN-12951",
                train_number="12951",
                train_name="Mumbai Central - New Delhi Rajdhani Express",
                train_type="RAJDHANI",
                corridor_id="CORR-BCT-VR",
                direction="UP",
                scheduled_start=base_date + timedelta(hours=17, minutes=0),
                scheduled_end=base_date + timedelta(hours=17, minutes=40),
                priority_level=5
            ),
            TrainSchedule(
                id="TRN-12009",
                train_number="12009",
                train_name="Mumbai Central - Ahmedabad Shatabdi Express",
                train_type="SUPERFAST",
                corridor_id="CORR-BCT-VR",
                direction="DOWN",
                scheduled_start=base_date + timedelta(hours=11, minutes=45),
                scheduled_end=base_date + timedelta(hours=12, minutes=20),
                priority_level=5
            ),
            TrainSchedule(
                id="TRN-EMU-90451",
                train_number="90451",
                train_name="Virar Fast Suburban EMU Local Rake",
                train_type="EXPRESS",
                corridor_id="CORR-BCT-VR",
                direction="DOWN",
                scheduled_start=base_date + timedelta(hours=12, minutes=45),
                scheduled_end=base_date + timedelta(hours=13, minutes=15),
                priority_level=4
            ),
            TrainSchedule(
                id="TRN-CONCOR-7702",
                train_number="CONCOR-7702",
                train_name="JNPT Container Freight Express",
                train_type="FREIGHT",
                corridor_id="CORR-BCT-VR",
                direction="UP",
                scheduled_start=base_date + timedelta(hours=22, minutes=0),
                scheduled_end=base_date + timedelta(hours=23, minutes=15),
                priority_level=2
            ),

            # Harbour Railway Trains
            TrainSchedule(
                id="TRN-HR-98001",
                train_number="98001",
                train_name="CSMT - Panvel Harbour Suburban Local",
                train_type="EXPRESS",
                corridor_id="CORR-CR-HARBOUR",
                direction="DOWN",
                scheduled_start=base_date + timedelta(hours=5, minutes=0),
                scheduled_end=base_date + timedelta(hours=6, minutes=20),
                priority_level=4
            ),
            TrainSchedule(
                id="TRN-HR-CONCOR-77",
                train_number="CONCOR-77",
                train_name="JNPT Port Double-Stack Container Freight",
                train_type="FREIGHT",
                corridor_id="CORR-CR-HARBOUR",
                direction="UP",
                scheduled_start=base_date + timedelta(hours=2, minutes=30),
                scheduled_end=base_date + timedelta(hours=3, minutes=0),
                priority_level=2
            ),

            # New Delhi - Kanpur Corridor Trains
            TrainSchedule(
                id="TRN-22436",
                train_number="22436",
                train_name="Vande Bharat Express (NDLS-BSB)",
                train_type="VANDE_BHARAT",
                corridor_id="CORR-NDLS-CNB",
                direction="UP",
                scheduled_start=base_date + timedelta(hours=12, minutes=0),
                scheduled_end=base_date + timedelta(hours=12, minutes=45),
                priority_level=5
            ),
            TrainSchedule(
                id="TRN-12302",
                train_number="12302",
                train_name="Howrah Rajdhani Express",
                train_type="RAJDHANI",
                corridor_id="CORR-NDLS-CNB",
                direction="DOWN",
                scheduled_start=base_date + timedelta(hours=17, minutes=0),
                scheduled_end=base_date + timedelta(hours=17, minutes=50),
                priority_level=5
            ),
            TrainSchedule(
                id="TRN-12554",
                train_number="12554",
                train_name="Vaishali Superfast Express",
                train_type="SUPERFAST",
                corridor_id="CORR-NDLS-CNB",
                direction="UP",
                scheduled_start=base_date + timedelta(hours=21, minutes=0),
                scheduled_end=base_date + timedelta(hours=21, minutes=55),
                priority_level=4
            ),
            TrainSchedule(
                id="TRN-BOXN-901",
                train_number="BOXN-901",
                train_name="Freight Coal Rake (Thermal Power Feeder)",
                train_type="FREIGHT",
                corridor_id="CORR-NDLS-CNB",
                direction="DOWN",
                scheduled_start=base_date + timedelta(hours=5, minutes=0),
                scheduled_end=base_date + timedelta(hours=6, minutes=15),
                priority_level=2
            )
        ]
        db.add_all(trains)
        db.commit()

        print("[Seed] Populating Maintenance Tasks with Real-World Operational Demands...")
        tasks = [
            # Mumbai Corridor Demands
            MaintenanceTask(
                id="TSK-BCT-EMERG-001",
                title="Emergency USFD Rail Flaw Detection & Weld Replacement",
                description="SYNTHETIC: Severe IMR ultrasonic rail defect at KM 28.4 Down Fast line. Immediate clamped joint renewal required before morning peak.",
                department="ENGINEERING",
                asset_id="AST-BCT-PWAY-01",
                corridor_id="CORR-BCT-VR",
                duration_minutes=90,
                criticality=5,       # Safety Critical
                urgency=5,           # Immediate
                overdue_days=4,      # Overdue
                earliest_start=base_date,
                deadline=base_date + timedelta(hours=10),
                status="PENDING"
            ),
            MaintenanceTask(
                id="TSK-BCT-OHE-002",
                title="25kV Catenary Dropper & Contact Wire Hotspot Rehabilitation",
                description="SYNTHETIC: Thermal imaging flagged high-contact resistance and dropper slackening on Dadar-Bandra section. Tower wagon power block required.",
                department="TRACTION_DISTRIBUTION",
                asset_id="AST-BCT-TRD-01",
                corridor_id="CORR-BCT-VR",
                duration_minutes=90,
                criticality=4,
                urgency=4,
                overdue_days=2,
                earliest_start=base_date,
                deadline=base_date + timedelta(days=1),
                status="PENDING"
            ),
            MaintenanceTask(
                id="TSK-BCT-PNT-003",
                title="Borivali North Diamond Crossover 102A/B Point Machine Overhaul",
                description="SYNTHETIC: Switch detection ground track circuit friction spike. S&T motor replacement and facing point lock adjustment.",
                department="SIGNAL_TELECOMMUNICATION",
                asset_id="AST-BCT-PWAY-02",
                corridor_id="CORR-BCT-VR",
                duration_minutes=60,
                criticality=4,
                urgency=3,
                overdue_days=1,
                earliest_start=base_date,
                deadline=base_date + timedelta(days=2),
                status="PENDING"
            ),
            MaintenanceTask(
                id="TSK-BCT-SIG-004",
                title="Dadar Central Cabin Electronic Interlocking Standby Redundancy Test",
                description="SYNTHETIC: Periodic micro-controller dual CPU standby failover drill under signal inspector supervision.",
                department="SIGNAL_TELECOMMUNICATION",
                asset_id="AST-BCT-ST-01",
                corridor_id="CORR-BCT-VR",
                duration_minutes=60,
                criticality=3,
                urgency=3,
                overdue_days=0,
                earliest_start=base_date + timedelta(hours=1),
                deadline=base_date + timedelta(days=2),
                status="PENDING"
            ),
            MaintenanceTask(
                id="TSK-BCT-TRD-005",
                title="Borivali Traction Sub-Station 110kV Isolator Contact Lubrication",
                description="SYNTHETIC: High-voltage busbar isolator preventive maintenance and auxiliary transformer testing.",
                department="TRACTION_DISTRIBUTION",
                asset_id="AST-BCT-TRD-02",
                corridor_id="CORR-BCT-VR",
                duration_minutes=75,
                criticality=3,
                urgency=2,
                overdue_days=0,
                earliest_start=base_date,
                deadline=base_date + timedelta(days=2),
                status="PENDING"
            ),

            # Harbour Railway Demands
            MaintenanceTask(
                id="TSK-HR-201",
                title="Vashi Creek Bridge No. 34 Bearings & Track Anchor Inspection",
                description="SYNTHETIC: Saline corrosion check on girder baseplates over Thane Creek.",
                department="ENGINEERING",
                asset_id="AST-HR-VSH-34",
                corridor_id="CORR-CR-HARBOUR",
                duration_minutes=90,
                criticality=5,
                urgency=4,
                overdue_days=6,
                earliest_start=base_date,
                deadline=base_date + timedelta(days=1),
                status="PENDING"
            ),
            MaintenanceTask(
                id="TSK-HR-202",
                title="Sandhurst Road Viaduct 25kV Neutral Section Insulator Cleaning",
                description="SYNTHETIC: PTFE neutral section cleaning and contact wire tension calibration.",
                department="TRACTION_DISTRIBUTION",
                asset_id="AST-HR-SND-08",
                corridor_id="CORR-CR-HARBOUR",
                duration_minutes=60,
                criticality=4,
                urgency=4,
                overdue_days=3,
                earliest_start=base_date,
                deadline=base_date + timedelta(days=2),
                status="PENDING"
            ),
            MaintenanceTask(
                id="TSK-HR-203",
                title="Wadala Junction EI Dual-Route Standby Switchover Drill",
                description="SYNTHETIC: Interlocking failover drill between Harbour main and Goregaon branch.",
                department="SIGNAL_TELECOMMUNICATION",
                asset_id="AST-HR-WDL-01",
                corridor_id="CORR-CR-HARBOUR",
                duration_minutes=75,
                criticality=4,
                urgency=3,
                overdue_days=1,
                earliest_start=base_date,
                deadline=base_date + timedelta(days=2),
                status="PENDING"
            ),

            # New Delhi - Kanpur Corridor Demands (Incorporating specific unit test edge cases)
            MaintenanceTask(
                id="TSK-ENG-001",
                title="USFD Rail Flaw Detection & Weld Joint Renewal",
                description="SYNTHETIC: High-speed flaw detected in ultrasonic inspection. Urgent weld replacement required.",
                department="ENGINEERING",
                asset_id="AST-ENG-01",
                corridor_id="CORR-NDLS-CNB",
                duration_minutes=120,
                criticality=5,
                urgency=5,
                overdue_days=8,
                earliest_start=base_date,
                deadline=base_date + timedelta(days=2),
                status="PENDING"
            ),
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
            MaintenanceTask(
                id="TSK-ENG-003",
                title="Deep Ballast Screening Machine (BCM) Major Track Rehabilitation",
                description="SYNTHETIC: Heavy mechanised tamping and deep ballast screening requiring prolonged line block. Duration exceeds single window capacity.",
                department="ENGINEERING",
                asset_id="AST-ENG-02",
                corridor_id="CORR-NDLS-CNB",
                duration_minutes=360,  # 6 hours (tests unscheduled explanation logic)
                criticality=3,
                urgency=3,
                overdue_days=0,
                earliest_start=base_date,
                deadline=base_date + timedelta(days=2),
                status="PENDING"
            ),
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
