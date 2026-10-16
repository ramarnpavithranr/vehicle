import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import VehicleHealth, Vehicle, Notification
from app.schemas.schemas import VehicleHealthResponse, VehicleHealthUpdate, HealthThresholds
from app.services.websocket_manager import ws_manager

router = APIRouter(prefix="/health", tags=["Vehicle Health"])

@router.get("/{vehicle_id}", response_model=VehicleHealthResponse)
def get_vehicle_health(vehicle_id: int, db: Session = Depends(get_db)):
    health = db.query(VehicleHealth).filter(VehicleHealth.vehicle_id == vehicle_id).first()
    if not health:
        # Create default entry if missing
        health = VehicleHealth(vehicle_id=vehicle_id)
        db.add(health)
        db.commit()
        db.refresh(health)
    return health

@router.patch("/{vehicle_id}", response_model=VehicleHealthResponse)
async def update_vehicle_health(
    vehicle_id: int, 
    update_data: VehicleHealthUpdate, 
    db: Session = Depends(get_db)
):
    health = db.query(VehicleHealth).filter(VehicleHealth.vehicle_id == vehicle_id).first()
    if not health:
        health = VehicleHealth(vehicle_id=vehicle_id)
        db.add(health)
    
    if update_data.engine_temp is not None:
        health.engine_temp = update_data.engine_temp
    if update_data.battery_level is not None:
        health.battery_level = update_data.battery_level
    if update_data.tire_pressure is not None:
        health.tire_pressure = update_data.tire_pressure
    if update_data.vibration_index is not None:
        health.vibration_index = update_data.vibration_index
    if update_data.speed is not None:
        health.speed = update_data.speed
    if update_data.mileage is not None:
        health.mileage = update_data.mileage
    
    health.last_updated = datetime.datetime.utcnow()
    db.commit()
    db.refresh(health)

    # Broadcast telemetry update
    await ws_manager.broadcast({
        "type": "HEALTH_TELEMETRY",
        "vehicle_id": vehicle_id,
        "engine_temp": health.engine_temp,
        "battery_level": health.battery_level,
        "tire_pressure": health.tire_pressure,
        "vibration_index": health.vibration_index,
        "status": health.warning_status
    })

    return health

@router.post("/{vehicle_id}/evaluate", response_model=VehicleHealthResponse)
async def evaluate_thresholds(
    vehicle_id: int, 
    thresholds: HealthThresholds, 
    db: Session = Depends(get_db)
):
    health = db.query(VehicleHealth).filter(VehicleHealth.vehicle_id == vehicle_id).first()
    if not health:
        raise HTTPException(status_code=404, detail="Health record not found")
    
    warnings = []
    if health.engine_temp > thresholds.max_engine_temp:
        warnings.append(f"Engine Overheating ({health.engine_temp:.1f}°C > {thresholds.max_engine_temp}°C)")
    if health.battery_level < thresholds.min_battery_level:
        warnings.append(f"Low Battery ({health.battery_level:.1f}% < {thresholds.min_battery_level}%)")
    if health.tire_pressure < thresholds.min_tire_pressure:
        warnings.append(f"Low Tire Pressure ({health.tire_pressure:.1f} PSI < {thresholds.min_tire_pressure} PSI)")
    elif health.tire_pressure > thresholds.max_tire_pressure:
        warnings.append(f"High Tire Pressure ({health.tire_pressure:.1f} PSI > {thresholds.max_tire_pressure} PSI)")
    if health.vibration_index > thresholds.max_vibration_index:
        warnings.append(f"Excessive Vibration / Rough Road ({health.vibration_index:.1f} m/s²)")

    if warnings:
        health.warning_status = "Attention Required: " + ", ".join(warnings)
        notif = Notification(
            title=f"Vehicle Health Warning: Vehicle #{vehicle_id}",
            message="; ".join(warnings),
            category="health",
            severity="danger" if len(warnings) > 1 else "warning"
        )
        db.add(notif)
    else:
        health.warning_status = "Optimal"

    health.last_updated = datetime.datetime.utcnow()
    db.commit()
    db.refresh(health)

    return health
