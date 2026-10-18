import asyncio
import logging
import random
import time
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
from app.core.ws_manager import ws_manager

logger = logging.getLogger("railblock-telemetry")

# Railway corridor section definitions with KM markers
LINE_SECTIONS = [
    # Western Railway
    {"name": "Churchgate – Mumbai Central Fast", "line": "western", "start_km": 0.0, "end_km": 5.0, "max_speed": 100},
    {"name": "Mumbai Central – Bandra Fast", "line": "western", "start_km": 5.0, "end_km": 15.0, "max_speed": 110},
    {"name": "Bandra – Borivali Fast", "line": "western", "start_km": 15.0, "end_km": 34.0, "max_speed": 120},
    {"name": "Borivali – Virar Fast", "line": "western", "start_km": 34.0, "end_km": 60.0, "max_speed": 130},
    {"name": "Virar – Dahanu Road Mainline", "line": "western", "start_km": 60.0, "end_km": 124.0, "max_speed": 130},
    # Central Railway
    {"name": "Thane – Dombivli Fast", "line": "central", "start_km": 34.0, "end_km": 48.0, "max_speed": 105},
    {"name": "Thane – Dombivli Slow", "line": "central", "start_km": 34.0, "end_km": 48.0, "max_speed": 80},
    {"name": "Kalyan – Kasara Up", "line": "central", "start_km": 54.0, "end_km": 121.0, "max_speed": 100},
    {"name": "Kalyan – Kasara Down", "line": "central", "start_km": 54.0, "end_km": 121.0, "max_speed": 100},
    {"name": "Kasara – Igatpuri Ghat", "line": "central", "start_km": 121.0, "end_km": 137.0, "max_speed": 60},
    # Harbour Railway
    {"name": "CSMT – Vadala Road Harbour", "line": "harbour", "start_km": 0.0, "end_km": 9.0, "max_speed": 80},
    {"name": "Vadala Road – Kurla Harbour", "line": "harbour", "start_km": 9.0, "end_km": 15.0, "max_speed": 85},
    {"name": "Kurla – Vashi Harbour", "line": "harbour", "start_km": 15.0, "end_km": 29.0, "max_speed": 90},
    {"name": "Vashi – Panvel Harbour", "line": "harbour", "start_km": 29.0, "end_km": 49.0, "max_speed": 95},
    {"name": "Vadala Road – Andheri Harbour Branch", "line": "harbour", "start_km": 9.0, "end_km": 21.0, "max_speed": 80},
    {"name": "CSMT – Kurla Harbor", "line": "harbour", "start_km": 0.0, "end_km": 15.0, "max_speed": 80},
]


class LiveTelemetryEngine:
    """
    Simulates real-time train movements, block occupancies, signal aspects,
    and field sensor alerts across Indian Railways corridors.
    """

    def __init__(self):
        self.is_running = False
        self._task: Optional[asyncio.Task] = None
        self.tick_count = 0

        # Initial active train roster
        self.trains: List[Dict[str, Any]] = [
            {
                "train_number": "12951",
                "name": "Mumbai Central - New Delhi Rajdhani Express",
                "type": "Rajdhani",
                "line": "western",
                "section": "Mumbai Central – Bandra Fast",
                "direction": "UP",
                "km": 9.4,
                "speed": 108.0,
                "target_speed": 115.0,
                "delay_minutes": 0,
                "status": "RUNNING",
                "next_stop": "Surat (ST)",
                "signal_aspect": "GREEN",
                "priority": 5,
            },
            {
                "train_number": "20901",
                "name": "Mumbai Central - Gandhinagar Vande Bharat",
                "type": "Vande Bharat",
                "line": "western",
                "section": "Bandra – Borivali Fast",
                "direction": "DOWN",
                "km": 24.2,
                "speed": 126.0,
                "target_speed": 130.0,
                "delay_minutes": 2,
                "status": "RUNNING",
                "next_stop": "Borivali (BVI)",
                "signal_aspect": "DOUBLE_YELLOW",
                "priority": 5,
            },
            {
                "train_number": "12009",
                "name": "Mumbai Central - Ahmedabad Shatabdi",
                "type": "Express",
                "line": "western",
                "section": "Borivali – Virar Fast",
                "direction": "DOWN",
                "km": 42.1,
                "speed": 94.0,
                "target_speed": 105.0,
                "delay_minutes": 0,
                "status": "RUNNING",
                "next_stop": "Vapi (VAPI)",
                "signal_aspect": "GREEN",
                "priority": 4,
            },
            {
                "train_number": "90451",
                "name": "Virar Fast Suburban EMU Local",
                "type": "Local",
                "line": "western",
                "section": "Churchgate – Mumbai Central Fast",
                "direction": "DOWN",
                "km": 3.2,
                "speed": 78.0,
                "target_speed": 85.0,
                "delay_minutes": 1,
                "status": "RUNNING",
                "next_stop": "Dadar (DDR)",
                "signal_aspect": "GREEN",
                "priority": 3,
            },
            {
                "train_number": "12137",
                "name": "Punjab Mail (CSMT – Firozpur)",
                "type": "Express",
                "line": "central",
                "section": "Kalyan – Kasara Up",
                "direction": "UP",
                "km": 78.5,
                "speed": 92.0,
                "target_speed": 95.0,
                "delay_minutes": 6,
                "status": "RUNNING",
                "next_stop": "Igatpuri (IGP)",
                "signal_aspect": "GREEN",
                "priority": 4,
            },
            {
                "train_number": "11057",
                "name": "CSMT – Amritsar Express",
                "type": "Express",
                "line": "central",
                "section": "Thane – Dombivli Fast",
                "direction": "DOWN",
                "km": 41.0,
                "speed": 84.0,
                "target_speed": 90.0,
                "delay_minutes": 4,
                "status": "RUNNING",
                "next_stop": "Kalyan (KYN)",
                "signal_aspect": "YELLOW",
                "priority": 3,
            },
            {
                "train_number": "98001",
                "name": "CSMT – Panvel Harbour EMU Local",
                "type": "Local",
                "line": "harbour",
                "section": "Kurla – Vashi Harbour",
                "direction": "DOWN",
                "km": 21.8,
                "speed": 72.0,
                "target_speed": 75.0,
                "delay_minutes": 0,
                "status": "RUNNING",
                "next_stop": "Vashi (VSH)",
                "signal_aspect": "GREEN",
                "priority": 3,
            },
            {
                "train_number": "CONCOR-7702",
                "name": "JNPT Port Container Freight Rake",
                "type": "Freight",
                "line": "western",
                "section": "Virar – Dahanu Road Mainline",
                "direction": "UP",
                "km": 88.0,
                "speed": 55.0,
                "target_speed": 60.0,
                "delay_minutes": 14,
                "status": "RUNNING",
                "next_stop": "Boisar (BOR)",
                "signal_aspect": "GREEN",
                "priority": 1,
            },
        ]

        # Initial block section statuses
        self.block_status: Dict[str, Dict[str, Any]] = {}
        for sec in LINE_SECTIONS:
            self.block_status[sec["name"]] = {
                "section": sec["name"],
                "line": sec["line"],
                "status": "FREE",  # FREE, OCCUPIED, CAUTION, MAINTENANCE_BLOCK
                "signal": "GREEN",  # GREEN, DOUBLE_YELLOW, YELLOW, RED
                "speed_limit": sec["max_speed"],
                "active_train": None,
                "active_task_id": None,
                "occupancy_pct": 0,
            }

        # Activity feed history
        self.events: List[Dict[str, Any]] = [
            {
                "id": "EVT-001",
                "timestamp": datetime.now(timezone.utc).strftime("%H:%M:%S"),
                "severity": "INFO",
                "title": "Telemetry Engine Initialized",
                "message": "Real-time track circuit telemetry connected to Western, Central & Harbour trunk lines.",
            },
            {
                "id": "EVT-002",
                "timestamp": datetime.now(timezone.utc).strftime("%H:%M:%S"),
                "severity": "WARNING",
                "title": "Caution Order Enforced",
                "message": "Speed restriction 20 km/h imposed at KM 14/18 (Bandra Fast) for emergency USFD weld renewal.",
            }
        ]

    def get_snapshot(self) -> Dict[str, Any]:
        """Returns the current full real-time snapshot."""
        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "tick": self.tick_count,
            "trains_count": len(self.trains),
            "trains": self.trains,
            "blocks": list(self.block_status.values()),
            "events": self.events[-15:],
            "system_health": {
                "gps_sync": "NOMINAL",
                "axle_counters": "99.8% OPERATIONAL",
                "active_speed_restrictions": sum(1 for b in self.block_status.values() if b["status"] == "CAUTION"),
                "occupied_blocks": sum(1 for b in self.block_status.values() if b["status"] == "OCCUPIED"),
            }
        }

    async def start(self):
        """Starts the background telemetry loop."""
        if self.is_running:
            return
        self.is_running = True
        self._task = asyncio.create_task(self._simulation_loop())
        logger.info("Real-time telemetry simulation engine started.")

    async def stop(self):
        """Stops the telemetry loop."""
        self.is_running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("Real-time telemetry simulation engine stopped.")

    async def _simulation_loop(self):
        """Runs the simulation cycle every 2 seconds."""
        while self.is_running:
            try:
                await asyncio.sleep(2.0)
                self.tick_count += 1
                await self._tick()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in telemetry simulation tick: {e}", exc_info=True)
                await asyncio.sleep(2.0)

    async def _tick(self):
        """Simulates 1 tick of train movements and signal changes."""
        dt_hours = 2.0 / 3600.0 * 20.0  # Time acceleration factor (20x) for realistic visualization

        # Reset block train assignments
        for b in self.block_status.values():
            if b["status"] != "MAINTENANCE_BLOCK":
                b["status"] = "FREE"
                b["signal"] = "GREEN"
                b["active_train"] = None
                b["occupancy_pct"] = 0

        # Update each train
        for train in self.trains:
            # Fluctuate speed slightly
            jitter = random.uniform(-1.5, 1.5)
            train["speed"] = max(20.0, min(train["target_speed"], train["speed"] + jitter))

            # Move train
            dist_km = train["speed"] * dt_hours
            if train["direction"] == "DOWN":
                train["km"] += dist_km
                if train["km"] > 120.0:
                    train["km"] = 1.0  # Loop back for continuous demo
            else:
                train["km"] -= dist_km
                if train["km"] < 1.0:
                    train["km"] = 118.0

            # Match train to section
            line_secs = [s for s in LINE_SECTIONS if s["line"] == train["line"]]
            matched_sec = None
            for sec in line_secs:
                if sec["start_km"] <= train["km"] <= sec["end_km"]:
                    matched_sec = sec
                    break
            if not matched_sec and line_secs:
                matched_sec = line_secs[0]

            if matched_sec:
                train["section"] = matched_sec["name"]
                b_status = self.block_status.get(matched_sec["name"])
                if b_status:
                    if b_status["status"] != "MAINTENANCE_BLOCK":
                        b_status["status"] = "OCCUPIED"
                        b_status["active_train"] = f"{train['train_number']} ({train['name'].split()[0]})"
                        b_status["signal"] = "RED"
                        # Calculate progress in section
                        sec_len = max(1.0, matched_sec["end_km"] - matched_sec["start_km"])
                        prog = int(((train["km"] - matched_sec["start_km"]) / sec_len) * 100)
                        b_status["occupancy_pct"] = max(5, min(95, prog))

        # Periodic random telemetry events (every 10 ticks)
        if self.tick_count % 10 == 0:
            picked_train = random.choice(self.trains)
            evt = {
                "id": f"EVT-{self.tick_count:04d}",
                "timestamp": datetime.now(timezone.utc).strftime("%H:%M:%S"),
                "severity": "INFO",
                "title": f"Train {picked_train['train_number']} Telemetry Update",
                "message": f"{picked_train['name']} passing {picked_train['section']} at {int(picked_train['speed'])} km/h. Signal: {picked_train['signal_aspect']}.",
            }
            self.events.append(evt)
            if len(self.events) > 30:
                self.events.pop(0)

        # Broadcast tick update to all active WebSocket connections
        snapshot = self.get_snapshot()
        await ws_manager.broadcast({
            "type": "TELEMETRY_UPDATE",
            "data": snapshot,
        })

    def trigger_emergency_defect(self, section: str, description: str):
        """Manually trigger an emergency track defect alert (e.g. USFD rail flaw)."""
        if section in self.block_status:
            self.block_status[section]["status"] = "CAUTION"
            self.block_status[section]["speed_limit"] = 20
            self.block_status[section]["signal"] = "YELLOW"

        evt = {
            "id": f"EVT-EMERGENCY-{int(time.time())}",
            "timestamp": datetime.now(timezone.utc).strftime("%H:%M:%S"),
            "severity": "CRITICAL",
            "title": "EMERGENCY: Track Flaw Detected",
            "message": f"USFD Flaw in {section}: {description}. Speed restricted to 20 km/h. Emergency Traffic Block required.",
        }
        self.events.append(evt)
        return evt

    def trigger_train_delay(self, train_number: str, delay_minutes: int):
        """Simulate an unexpected delay for a specific train."""
        for t in self.trains:
            if t["train_number"] == train_number:
                t["delay_minutes"] += delay_minutes
                t["status"] = "DELAYED" if t["delay_minutes"] > 5 else "RUNNING"
                evt = {
                    "id": f"EVT-DELAY-{int(time.time())}",
                    "timestamp": datetime.now(timezone.utc).strftime("%H:%M:%S"),
                    "severity": "WARNING",
                    "title": f"Train {train_number} Delay Alert",
                    "message": f"{t['name']} running +{t['delay_minutes']} min late. Auto-checking block windows for timetable clashes.",
                }
                self.events.append(evt)
                return evt
        return None


# Global singleton instance
telemetry_engine = LiveTelemetryEngine()
