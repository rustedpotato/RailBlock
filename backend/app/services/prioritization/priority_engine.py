"""
RailBlock AI — Rule-Based Priority Scoring Engine
=================================================

NOTE ON ALGORITHM TRANSPARENCY:
This is a deterministic, rule-based prioritization engine designed for Indian Railways
maintenance operations. It is NOT a machine learning or black-box predictive model.
All weights, normalization bounds, and scoring rules are explicitly defined, mathematically
reproducible, and fully auditable by railway engineers and operating superintendents.
"""

from typing import Dict, Any, Optional
from dataclasses import dataclass


@dataclass
class PriorityResult:
    score: float
    explanation: str
    normalized_factors: Dict[str, float]
    raw_factors: Dict[str, Any]


class PriorityEngine:
    """
    Deterministic rule-based prioritization engine for multi-departmental railway maintenance tasks.
    
    Formula:
      Priority Score (0-100) = 100 * (
          w_criticality * norm_criticality +
          w_urgency     * norm_urgency +
          w_overdue     * norm_overdue +
          w_impact      * norm_impact
      )
    """

    def __init__(
        self,
        criticality_weight: float = 0.35,
        urgency_weight: float = 0.25,
        overdue_weight: float = 0.25,
        impact_weight: float = 0.15,
        overdue_saturation_days: int = 14
    ):
        # Validate weights sum to 1.0 (with slight tolerance)
        total_weight = criticality_weight + urgency_weight + overdue_weight + impact_weight
        if abs(total_weight - 1.0) > 0.001:
            raise ValueError(f"Priority weights must sum to 1.0; received {total_weight}")

        self.criticality_weight = criticality_weight
        self.urgency_weight = urgency_weight
        self.overdue_weight = overdue_weight
        self.impact_weight = impact_weight
        self.overdue_saturation_days = overdue_saturation_days

    def _normalize_scale_1_to_5(self, value: int) -> float:
        """Normalizes an integer rating from scale [1, 5] to [0.0, 1.0]."""
        val_clamped = max(1, min(5, value))
        return (val_clamped - 1) / 4.0

    def _normalize_overdue_days(self, days: int) -> float:
        """Normalizes overdue days to [0.0, 1.0] saturated at overdue_saturation_days."""
        if days <= 0:
            return 0.0
        return min(days / float(self.overdue_saturation_days), 1.0)

    def _derive_operational_impact(self, department: str, asset_type: Optional[str] = None) -> float:
        """
        Determines operational disruption factor on a scale of [0.0, 1.0] based on
        railway asset vulnerability and interlocking impact.
        """
        if asset_type:
            atype = asset_type.upper()
            if "INTERLOCKING" in atype or "POINT_MACHINE" in atype:
                return 0.95  # Severe station junction bottleneck
            if "TRACK_SEGMENT" in atype or "BRIDGE" in atype:
                return 0.90  # Derailment risk / speed restriction impact
            if "OHE" in atype or "SUBSTATION" in atype:
                return 0.85  # Traction power shutdown impact

        # Department fallback defaults
        dept_str = str(department).upper()
        if "SIGNAL" in dept_str:
            return 0.90
        elif "ENGINEERING" in dept_str:
            return 0.85
        elif "TRACTION" in dept_str:
            return 0.80
        return 0.70

    def calculate_priority(
        self,
        criticality: int,
        urgency: int,
        overdue_days: int,
        department: str,
        asset_type: Optional[str] = None,
        duration_minutes: Optional[int] = None
    ) -> PriorityResult:
        """
        Calculates the normalized deterministic score and human-readable explanation.
        """
        norm_crit = self._normalize_scale_1_to_5(criticality)
        norm_urg = self._normalize_scale_1_to_5(urgency)
        norm_overdue = self._normalize_overdue_days(overdue_days)
        norm_impact = self._derive_operational_impact(department, asset_type)

        crit_contrib = self.criticality_weight * norm_crit * 100.0
        urg_contrib = self.urgency_weight * norm_urg * 100.0
        overdue_contrib = self.overdue_weight * norm_overdue * 100.0
        impact_contrib = self.impact_weight * norm_impact * 100.0

        total_score = round(crit_contrib + urg_contrib + overdue_contrib + impact_contrib, 2)

        # Build transparent human-readable explanation
        explanation_parts = [
            f"Deterministic Priority Score: {total_score}/100.",
            f"Criticality (L{criticality}/5, weight {int(self.criticality_weight*100)}%): +{crit_contrib:.1f} pts.",
            f"Urgency (L{urgency}/5, weight {int(self.urgency_weight*100)}%): +{urg_contrib:.1f} pts.",
            f"Overdue ({overdue_days} days overdue, cap {self.overdue_saturation_days}d, weight {int(self.overdue_weight*100)}%): +{overdue_contrib:.1f} pts.",
            f"Operational Impact ({department}, asset={asset_type or 'General'}, weight {int(self.impact_weight*100)}%): +{impact_contrib:.1f} pts."
        ]
        explanation = " ".join(explanation_parts)

        return PriorityResult(
            score=total_score,
            explanation=explanation,
            normalized_factors={
                "criticality": round(norm_crit, 4),
                "urgency": round(norm_urg, 4),
                "overdue": round(norm_overdue, 4),
                "operational_impact": round(norm_impact, 4)
            },
            raw_factors={
                "criticality": criticality,
                "urgency": urgency,
                "overdue_days": overdue_days,
                "department": department,
                "asset_type": asset_type,
                "duration_minutes": duration_minutes
            }
        )


# Default engine instance
default_priority_engine = PriorityEngine()
