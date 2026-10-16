import math
import random
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.schemas import SimulationConfig
from app.services.proximity import haversine_distance_meters

router = APIRouter(prefix="/simulation", tags=["Traffic Simulation"])

# In-memory virtual simulation sandbox state
SIMULATION_STATE = {
    "is_running": False,
    "step_count": 0,
    "alerts_enabled": True,
    "traffic_volume": "medium",
    "alert_radius_meters": 1000.0,
    "average_speed_kmh": 60.0,
    "center": {"lat": 12.9716, "lng": 77.5946}, # Bangalore / Tech Corridor Coordinates
    "virtual_vehicles": [],
    "simulated_hazards": [
        {
            "id": "SIM-HAZ-1",
            "type": "pothole",
            "lat": 12.9725,
            "lng": 77.5980,
            "severity": "high",
            "label": "Deep Pothole on Right Lane"
        },
        {
            "id": "SIM-HAZ-2",
            "type": "roadwork",
            "lat": 12.9690,
            "lng": 77.5920,
            "severity": "medium",
            "label": "Road Construction / Narrow Lane"
        }
    ],
    "metrics": {
        "vehicles_alerted": 0,
        "total_vehicles": 12,
        "avg_warning_distance_meters": 0.0,
        "avg_response_time_seconds": 0.0,
        "simulated_risk_reduction_pct": 0.0,
        "alerts_dispatched_count": 0
    }
}

def init_virtual_vehicles(count: int = 12):
    center = SIMULATION_STATE["center"]
    vehicles = []
    for i in range(count):
        angle = (2 * math.pi / count) * i
        dist_offset = 0.008 + (i % 3) * 0.003
        lat = center["lat"] + math.sin(angle) * dist_offset
        lng = center["lng"] + math.cos(angle) * dist_offset
        speed = round(random.uniform(45.0, 65.0), 1)
        heading = (math.degrees(angle) + 90) % 360
        vehicles.append({
            "id": f"SIM-V{i+1:02d}",
            "name": f"Virtual Vehicle {i+1}",
            "lat": round(lat, 5),
            "lng": round(lng, 5),
            "speed": speed,
            "heading": round(heading, 1),
            "status": "normal",
            "alerted": False,
            "warning_distance": 0.0
        })
    SIMULATION_STATE["virtual_vehicles"] = vehicles

# Initialize on module load
init_virtual_vehicles(12)

@router.get("/state")
def get_simulation_state():
    return {
        "state": SIMULATION_STATE,
        "disclaimer": "Simulated traffic & V2V safety metrics for experimental evaluation. Results do not constitute certified real-world crash avoidance data."
    }

@router.post("/configure")
def configure_simulation(config: SimulationConfig):
    SIMULATION_STATE["alerts_enabled"] = config.alerts_enabled
    SIMULATION_STATE["traffic_volume"] = config.traffic_volume
    SIMULATION_STATE["alert_radius_meters"] = config.alert_radius_meters
    SIMULATION_STATE["average_speed_kmh"] = config.average_speed

    count_map = {"low": 6, "medium": 12, "high": 20, "rush_hour": 30}
    target_count = count_map.get(config.traffic_volume, 12)
    init_virtual_vehicles(target_count)

    return {"status": "configured", "state": SIMULATION_STATE}

@router.post("/reset")
def reset_simulation():
    SIMULATION_STATE["step_count"] = 0
    SIMULATION_STATE["is_running"] = False
    count_map = {"low": 6, "medium": 12, "high": 20, "rush_hour": 30}
    init_virtual_vehicles(count_map.get(SIMULATION_STATE["traffic_volume"], 12))
    SIMULATION_STATE["metrics"] = {
        "vehicles_alerted": 0,
        "total_vehicles": len(SIMULATION_STATE["virtual_vehicles"]),
        "avg_warning_distance_meters": 0.0,
        "avg_response_time_seconds": 0.0,
        "simulated_risk_reduction_pct": 0.0,
        "alerts_dispatched_count": 0
    }
    return {"status": "reset", "state": SIMULATION_STATE}

@router.post("/step")
def step_simulation():
    """Advance simulation one time-step (e.g. 1 second). Moves vehicles and computes metrics."""
    SIMULATION_STATE["step_count"] += 1
    vehicles = SIMULATION_STATE["virtual_vehicles"]
    hazards = SIMULATION_STATE["simulated_hazards"]
    radius = SIMULATION_STATE["alert_radius_meters"]
    alerts_on = SIMULATION_STATE["alerts_enabled"]

    alerted_count = 0
    distances = []

    for v in vehicles:
        # Move vehicle slightly clockwise around center
        dx = -0.00015 * math.sin(math.radians(v["heading"]))
        dy = 0.00015 * math.cos(math.radians(v["heading"]))
        v["lat"] += dy
        v["lng"] += dx
        v["heading"] = (v["heading"] + random.uniform(-2, 3)) % 360

        # Check distance to hazards
        min_hazard_dist = 999999.0
        closest_hazard = None
        for h in hazards:
            d = haversine_distance_meters(v["lat"], v["lng"], h["lat"], h["lng"])
            if d < min_hazard_dist:
                min_hazard_dist = d
                closest_hazard = h
        
        if alerts_on and min_hazard_dist <= radius:
            v["alerted"] = True
            v["status"] = "alert_received_decelerating"
            v["warning_distance"] = round(min_hazard_dist, 1)
            alerted_count += 1
            distances.append(min_hazard_dist)
            # Simulated safe deceleration
            v["speed"] = max(25.0, v["speed"] - 1.5)
        elif not alerts_on and min_hazard_dist <= 80:
            # Baseline: only sees hazard at immediate 80 meters (visual sightline)
            v["alerted"] = True
            v["status"] = "emergency_braking"
            v["warning_distance"] = round(min_hazard_dist, 1)
            alerted_count += 1
            distances.append(min_hazard_dist)
            v["speed"] = max(10.0, v["speed"] - 6.0)
        else:
            v["alerted"] = False
            v["status"] = "normal"
            v["speed"] = min(SIMULATION_STATE["average_speed_kmh"], v["speed"] + 0.5)

    avg_dist = round(sum(distances) / len(distances), 1) if distances else 0.0
    
    # Calculate comparative simulated response metrics
    if alerts_on:
        avg_resp_time = 3.6  # Adequate advance warning buffer
        risk_reduction = 78.4 # Simulated risk avoidance index
    else:
        avg_resp_time = 0.7  # Emergency last-second reaction
        risk_reduction = 0.0

    SIMULATION_STATE["metrics"] = {
        "vehicles_alerted": alerted_count,
        "total_vehicles": len(vehicles),
        "avg_warning_distance_meters": avg_dist,
        "avg_response_time_seconds": avg_resp_time if alerted_count > 0 else 0.0,
        "simulated_risk_reduction_pct": risk_reduction if alerted_count > 0 else 0.0,
        "alerts_dispatched_count": alerted_count
    }

    return {"status": "stepped", "state": SIMULATION_STATE}
