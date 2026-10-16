# RailBlock AI — API Reference

API Base Path: `/api/v1`  
Interactive OpenAPI Documentation (Swagger UI): `http://localhost:8000/docs`  
ReDoc Documentation: `http://localhost:8000/redoc`

---

## 1. System Endpoints

### 1.1 Health Check (System Root)
- **Method:** `GET`
- **Path:** `/health`
- **Description:** Basic probe for container orchestrators, load balancers, and frontend liveness checks.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "app_name": "RailBlock AI",
  "version": "0.1.0",
  "environment": "development",
  "timestamp": "2026-10-15T00:00:00.000000Z",
  "database": {
    "status": "connected",
    "engine": "sqlite"
  }
}
```

### 1.2 Health Check (API V1 Prefix)
- **Method:** `GET`
- **Path:** `/api/v1/health`
- **Description:** Verifies API v1 routing and database connection status.
- **Response:** Matches the `/health` schema.

---

## 2. Planned API Endpoints (Upcoming Phases)

### 2.1 Maintenance Demands (`/api/v1/maintenance`)
- `POST /api/v1/maintenance/demands`: Submit department maintenance block requirement (Engineering, TRD, S&T).
- `GET /api/v1/maintenance/demands`: List pending, approved, and scheduled maintenance block demands.
- `GET /api/v1/maintenance/demands/{id}`: Detailed view of a maintenance block demand.

### 2.2 Schedule Optimization (`/api/v1/scheduling`)
- `POST /api/v1/scheduling/optimize`: Run constraint satisfaction solver (Google OR-Tools) for a specified division, corridor, and planning horizon (weekly/monthly).
- `GET /api/v1/scheduling/plans/{plan_id}`: Fetch generated maintenance block plan with train detention impact matrix.
- `POST /api/v1/scheduling/plans/{plan_id}/approve`: Finalize and lock maintenance schedule.

### 2.3 Railway Asset & Corridor Registry (`/api/v1/assets`)
- `GET /api/v1/assets/corridors`: Retrieve railway divisions, sections, and block stations.
- `GET /api/v1/assets/blocks`: Track block availability status and live restrictions.
