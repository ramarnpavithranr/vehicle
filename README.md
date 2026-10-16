# AutoPulse AI - Intelligent Vehicle-to-Vehicle (V2V) Safety Mesh & Telematics

AutoPulse AI is a real-time, low-latency Vehicle-to-Vehicle (V2V) cooperative safety platform and computer vision road hazard detection network.

## 🚀 Key Features

- **📷 AI Optical Hazard Detection:** Real-time road defect and obstacle identification (potholes, debris, stationary vehicles).
- **📡 5.9 GHz DSRC / WebSocket V2V Mesh:** Sub-50ms peer-to-peer advisory warning system broadcasting to vehicles within a 1,000m radius.
- **🗺️ Interactive Geospatial Fleet Map:** Live Google Maps tracking with multiple layer modes (Roadmap, Satellite, Hybrid, Terrain).
- **💓 Vehicle Health Telematics:** Real-time battery, tire pressure, and suspension diagnostics.
- **📁 Digital Document Locker:** Automated expiration tracking for PUC certificates, insurance policies, and commercial driving licenses.
- **🚦 Traffic & Safety Simulation:** Interactive physics simulator comparing V2V-assisted reaction times versus manual panic braking.

---

## 🛠️ Architecture

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Leaflet / Google Maps, Recharts.
- **Backend:** Python FastAPI, Uvicorn, WebSockets, SQLAlchemy, SQLite, Pydantic, Ultralytics YOLOv8.

---

## 💻 Quick Start

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python run.py
```
Backend runs at `http://localhost:8000` (API Docs at `http://localhost:8000/docs`).

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.
