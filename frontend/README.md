# RailBlock AI — Frontend Application

React + Vite + TypeScript web interface for Indian Railways automated block planning (SIH26027).

---

## 1. Features
- **React 18** with TypeScript for type safety and maintainable hackathon architecture.
- **Vite** fast developer experience with hot module replacement (HMR).
- **Tailwind CSS** with custom dark railway theme palette.
- **Lucide Icons** and **Recharts** ready for corridor block Gantt charts and analytics.
- **Axios Client** configured with base URL and error interceptors.
- **Vite Dev Server Proxy** mapping `/api` and `/health` to backend (`http://localhost:8000`).
- **Modular Directory Architecture**:
  - `api/`: API client instances and endpoint hooks.
  - `features/`: Department maintenance intake, dashboard, and OR-Tools scheduling views.
  - `components/`: Shared UI components.
  - `types/`: Shared TypeScript domain models.
  - `utils/`: Formatting and calculation utilities.

---

## 2. Prerequisites
- **Node.js** v18+ or v20+ (v24 tested).
- **npm** v9+ (v11 tested).

---

## 3. Installation

Navigate to the frontend directory:
```bash
cd frontend
```

Install npm dependencies:
```bash
npm install
```

Copy `.env.example` to `.env` (optional, since Vite proxy handles default local dev):
```bash
cp .env.example .env
```

---

## 4. Running the Development Server

Start Vite dev server:
```bash
npm run dev
```

The application will be accessible at:
[http://localhost:5173](http://localhost:5173)

---

## 5. Production Build
```bash
npm run build
npm run preview
```
