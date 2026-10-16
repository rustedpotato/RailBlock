import pytest
from app.services.prioritization.priority_engine import PriorityEngine, default_priority_engine


def test_priority_engine_bounds():
    # Test lowest possible rating: Level 1 crit, Level 1 urg, 0 days overdue
    low_res = default_priority_engine.calculate_priority(
        criticality=1,
        urgency=1,
        overdue_days=0,
        department="ENGINEERING",
        asset_type="TRACK_SEGMENT"
    )
    # Only operational impact contributes
    assert 0.0 <= low_res.score <= 30.0
    assert "Criticality (L1/5" in low_res.explanation

    # Test highest possible rating: Level 5 crit, Level 5 urg, 14+ days overdue
    high_res = default_priority_engine.calculate_priority(
        criticality=5,
        urgency=5,
        overdue_days=20,
        department="SIGNAL_TELECOMMUNICATION",
        asset_type="ELECTRONIC_INTERLOCKING"
    )
    assert 90.0 <= high_res.score <= 100.0
    assert "Deterministic Priority Score:" in high_res.explanation
    assert high_res.normalized_factors["criticality"] == 1.0
    assert high_res.normalized_factors["urgency"] == 1.0
    assert high_res.normalized_factors["overdue"] == 1.0


def test_custom_weight_configuration():
    # Custom priority engine with heavy weight on overdue days
    custom_engine = PriorityEngine(
        criticality_weight=0.20,
        urgency_weight=0.20,
        overdue_weight=0.50,
        impact_weight=0.10,
        overdue_saturation_days=10
    )
    res = custom_engine.calculate_priority(
        criticality=3,
        urgency=3,
        overdue_days=10,
        department="TRACTION_DISTRIBUTION"
    )
    # overdue contributes 0.50 * 1.0 * 100 = 50 pts
    assert res.score >= 50.0


def test_invalid_weight_configuration():
    with pytest.raises(ValueError, match="must sum to 1.0"):
        PriorityEngine(criticality_weight=0.5, urgency_weight=0.5, overdue_weight=0.5, impact_weight=0.5)
