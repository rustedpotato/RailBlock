"""
RailBlock AI — UIC 406 Railway Corridor Capacity & Headway Analyzer (SIH26027)
==============================================================================

Implements the International Union of Railways (UIC 406) capacity consumption
methodology used by Indian Railways Operating Departments.

Key Outputs:
1. Corridor Saturation Index (K %): Evaluates track occupation vs safe headway.
2. Usable Maintenance Headroom: Maximum feasible continuous block possession.
3. Bottleneck Identification: Highlights constrained suburban pinch-points.
4. Intelligent Recommendation: Tells controllers whether daytime shadow blocks,
   night corridor possessions, or Sunday Mega Blocks are necessary.
"""

from typing import List, Dict, Any


class CorridorCapacityAnalyzer:
    """
    Computes UIC 406 capacity consumption and block availability for railway lines.
    """

    MUMBAI_SUBURBAN_BASELINES = {
        "Kalyan – Kasara Up": {"headway_min": 3.5, "trains_per_day": 210, "tracks": 2, "corridor": "Central Line"},
        "Thane – Dombivli Fast": {"headway_min": 3.0, "trains_per_day": 260, "tracks": 2, "corridor": "Central Line"},
        "Kasara – Igatpuri Ghat": {"headway_min": 6.0, "trains_per_day": 140, "tracks": 2, "corridor": "Central Line"},
        "Churchgate – Mumbai Central Fast": {"headway_min": 3.0, "trains_per_day": 280, "tracks": 2, "corridor": "Western Line"},
        "Mumbai Central – Bandra Fast": {"headway_min": 3.2, "trains_per_day": 270, "tracks": 2, "corridor": "Western Line"},
        "Bandra – Borivali Fast": {"headway_min": 3.0, "trains_per_day": 290, "tracks": 2, "corridor": "Western Line"},
        "Borivali – Virar Fast": {"headway_min": 3.5, "trains_per_day": 240, "tracks": 2, "corridor": "Western Line"},
        "CSMT – Vadala Road Harbour": {"headway_min": 4.0, "trains_per_day": 190, "tracks": 2, "corridor": "Harbour Line"},
        "Kurla – Vashi Harbour": {"headway_min": 4.5, "trains_per_day": 175, "tracks": 2, "corridor": "Harbour Line"},
        "Vashi – Panvel Harbour": {"headway_min": 5.0, "trains_per_day": 160, "tracks": 2, "corridor": "Harbour Line"}
    }

    def analyze_corridor_capacity(self, section_name: str, active_blocks_hours: float = 3.5) -> Dict[str, Any]:
        """
        Analyzes capacity consumption for a specific railway section according to UIC 406.
        """
        baseline = self.MUMBAI_SUBURBAN_BASELINES.get(
            section_name,
            {"headway_min": 4.0, "trains_per_day": 200, "tracks": 2, "corridor": "Suburban Trunk"}
        )

        headway = baseline["headway_min"]
        trains = baseline["trains_per_day"]
        
        # Theoretical daily capacity: 1440 mins / headway
        c_theo = round(1440.0 / headway)
        # Practical capacity factor for high-density suburban (mu = 0.72)
        c_prac = round(c_theo * 0.72)
        
        # UIC 406 Capacity Consumption K (%)
        train_occupancy_mins = trains * headway
        block_occupancy_mins = active_blocks_hours * 60.0
        total_occupied_mins = min(1440.0, train_occupancy_mins + (block_occupancy_mins * 0.7))
        saturation_pct = min(98.5, round((total_occupied_mins / 1440.0) * 100.0, 1))

        # Usable maintenance headroom (minutes in 24h window)
        headroom_mins = max(45, int(1440.0 - train_occupancy_mins))

        if saturation_pct > 85.0:
            status = "CRITICAL_SATURATION"
            recommendation = "Night Mega Block or Sunday Traffic Block mandatory. Daytime maintenance poses severe detention risk."
            badge_color = "#DC2626"
        elif saturation_pct > 72.0:
            status = "MODERATE_SATURATION"
            recommendation = "Shadow window feasible between morning and evening rush hours (11:30 - 15:30) with 20km/h cautions."
            badge_color = "#FF6B35"
        else:
            status = "OPTIMAL_CAPACITY"
            recommendation = "Ample track headroom available. Routine daytime multi-departmental block possession permitted."
            badge_color = "#15803D"

        return {
            "section": section_name,
            "corridor": baseline["corridor"],
            "headway_minutes": headway,
            "trains_per_day": trains,
            "theoretical_capacity_trains": c_theo,
            "practical_capacity_trains": c_prac,
            "saturation_percent": saturation_pct,
            "usable_headroom_minutes": headroom_mins,
            "max_continuous_block_hours": round(headroom_mins / 60.0, 1),
            "status": status,
            "badge_color": badge_color,
            "recommendation": recommendation
        }

    def analyze_network_overview(self) -> List[Dict[str, Any]]:
        """
        Returns full network capacity diagnostics across all Mumbai Suburban sections.
        """
        return [
            self.analyze_corridor_capacity(sec)
            for sec in self.MUMBAI_SUBURBAN_BASELINES.keys()
        ]


# Singleton instance
corridor_capacity_analyzer = CorridorCapacityAnalyzer()

