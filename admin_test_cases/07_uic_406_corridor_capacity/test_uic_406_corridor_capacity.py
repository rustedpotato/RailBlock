"""
Test Case 07: Admin UIC 406 Corridor Capacity & Headroom Analysis
Scope: International UIC 406 standard, saturation index (K %), continuous maintenance headroom.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_network_wide_uic_406_analysis():
    """Admin requests full network capacity analysis for suburban corridors."""
    response = client.get("/api/optimizer/capacity-analysis")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "COMPLETED"
    assert data["methodology"] == "UIC 406 International Railway Union Standard"
    assert "corridors" in data
    corridors = data["corridors"]
    assert len(corridors) >= 3, "Expected multiple suburban corridor sections analyzed"

    for sec in corridors:
        assert "section" in sec
        assert "saturation_percent" in sec
        assert 0.0 <= sec["saturation_percent"] <= 100.0
        assert "usable_headroom_minutes" in sec
        assert sec["usable_headroom_minutes"] >= 0
        assert "status" in sec


def test_specific_section_capacity_query():
    """Admin inspects a specific high-density corridor section."""
    section_name = "MUMBAI CENTRAL - DADAR FAST"
    response = client.get(f"/api/optimizer/capacity-analysis?section={section_name}")
    assert response.status_code == 200
    data = response.json()
    assert data["section"] == section_name
    assert "theoretical_capacity_trains" in data
    assert "practical_capacity_trains" in data
    assert data["theoretical_capacity_trains"] > data["practical_capacity_trains"]
    assert "recommendation" in data
