# RailBlock AI — Backend Service

FastAPI-powered REST API and optimization engine for Indian Railways automated block planning (SIH26027).

---

## 1. Features
- **FastAPI** with async endpoints, automatic OpenAPI documentation, and typed validation.
- **SQLAlchemy 2.0** ORM configured with SQLite for rapid local development and PostgreSQL ready for staging/production.
- **CORS Configured** for React/Vite development server (`http://localhost:5173`).
- **Google OR-Tools CP-SAT** ready for constraint satisfaction maintenance scheduling.
- **Modular Directory Architecture**:
  - `core/`: Settings and security configurations.
  - `db/`: Database session, engine, and base models.
  - `models/`: SQLAlchemy database entities.
  - `schemas/`: Pydantic request/response validation schemas.
  - `repositories/`: Database abstraction queries.
  - `services/`: Prioritization, conflict detection, and OR-Tools scheduling logic.
  - `api/routes/`: REST endpoint controllers.

---

## 2. Prerequisites
- **Python 3.12+** (recommended for full wheel compatibility with Google OR-Tools).
- Virtual environment tool (`venv`).

---

## 3. Installation & Setup

### Step 1: Navigate to the backend directory
```bash
cd backend
```

### Step 2: Create a virtual environment
**On Windows:**
```powershell
# Using Python 3.12 (preferred for OR-Tools)
py -3.12 -m venv venv

# Or using default python
python -m venv venv
```

### Step 3: Activate the virtual environment
**On Windows PowerShell:**
```powershell
.\venv\Scripts\Activate.ps1
```
*(If script execution is restricted, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first)*

**On Linux/macOS:**
```bash
source venv/bin/activate
```

### Step 4: Install dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 5: Environment Variables
Copy `.env.example` to `.env` (a ready-to-run `.env` is already pre-configured for local development):
```bash
cp .env.example .env
```

---

## 4. Running the Backend Server

Start the FastAPI application with Uvicorn:
```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The server will be accessible at:
- **API Base:** [http://localhost:8000](http://localhost:8000)
- **Health Check:** [http://localhost:8000/health](http://localhost:8000/health)
- **API v1 Health Check:** [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)
- **Interactive Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Documentation:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 5. Running Tests
```powershell
pytest
```
