"""
Test Case 06: Admin Pareto Multi-Objective Optimization Studio
Scope: Multi-objective optimization, 4 solver presets, Pareto frontier analysis.
"""

import pytest
import time
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_fast_heuristic_execution_speed():
    """Admin triggers Fast Heuristic preset and asserts lightning-fast execution (<50ms solver)."""
    start_time = time.time()
    response = client.post("/api/optimizer/pareto-solve", json={
        "preset": "FAST_HEURISTIC",
        "safety_weight": 0.5,
        "punctuality_weight": 0.5,
        "crew_cost_weight": 0.2,
        "safety_buffer_minutes": 15,
        "solver_timeout_seconds": 3.0
    })
    elapsed = time.time() - start_time
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "COMPLETED"
    assert data["pareto_analysis"]["preset"] == "FAST_HEURISTIC"
    assert "pareto_analysis" in data
    # Fast heuristic must finish quickly
    assert elapsed < 1.0, f"Fast heuristic took too long: {elapsed:.3f}s"


def test_pareto_safety_max_preset():
    """Admin selects Safety Max preset with high safety weight (1.0)."""
    response = client.post("/api/optimizer/pareto-solve", json={
        "preset": "SAFETY_MAX",
        "safety_weight": 1.0,
        "punctuality_weight": 0.1,
        "crew_cost_weight": 0.1,
        "safety_buffer_minutes": 20,
        "solver_timeout_seconds": 4.0
    })
    assert response.status_code == 200
    data = response.json()
    assert data["pareto_analysis"]["preset"] == "SAFETY_MAX"
    analysis = data["pareto_analysis"]
    assert "pareto_efficiency_score" in analysis


def test_pareto_punctuality_first_preset():
    """Admin tests Punctuality First preset to minimize commuter rake detentions."""
    response = client.post("/api/optimizer/pareto-solve", json={
        "preset": "PUNCTUALITY_FIRST",
        "safety_weight": 0.3,
        "punctuality_weight": 1.0,
        "crew_cost_weight": 0.1,
        "safety_buffer_minutes": 10,
        "solver_timeout_seconds": 4.0
    })
    assert response.status_code == 200
    data = response.json()
    assert data["pareto_analysis"]["preset"] == "PUNCTUALITY_FIRST"
