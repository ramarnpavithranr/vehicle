import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any

# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: Optional[str] = "driver"
    vehicle_id: Optional[int] = None

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    vehicle_id: Optional[int] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Hazard schemas
class HazardBase(BaseModel):
    type: str
    severity: str = "medium"
    description: Optional[str] = None
    latitude: float
    longitude: float
    confidence: float = 0.88
    reported_by: Optional[str] = "AutoPulse AI Vision"
    image_url: Optional[str] = None

class HazardCreate(HazardBase):
    pass

class HazardStatusUpdate(BaseModel):
    status: str  # detected, pending_verification, confirmed, cleared, rejected
    verified_by: Optional[str] = None

class HazardResponse(HazardBase):
    id: int
    status: str
    verified_by: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

# Vehicle schemas
class VehicleBase(BaseModel):
    name: str
    model: str
    plate_number: str
    latitude: float
    longitude: float
    speed: float = 45.0
    heading: float = 90.0
    status: str = "active"
    is_connected: bool = True

class VehicleCreate(VehicleBase):
    pass

class VehicleLocationUpdate(BaseModel):
    latitude: float
    longitude: float
    speed: Optional[float] = None
    heading: Optional[float] = None

class VehicleResponse(VehicleBase):
    id: int
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

# Alert schemas
class AlertResponse(BaseModel):
    id: int
    hazard_id: int
    vehicle_id: int
    message: str
    severity: str
    distance_meters: float
    acknowledged: bool
    timestamp: datetime.datetime
    hazard: Optional[HazardResponse] = None

    class Config:
        from_attributes = True

# Health schemas
class VehicleHealthResponse(BaseModel):
    id: int
    vehicle_id: int
    engine_temp: float
    battery_level: float
    tire_pressure: float
    vibration_index: float
    brake_wear: float
    speed: float
    mileage: float
    warning_status: str
    last_updated: datetime.datetime

    class Config:
        from_attributes = True

class VehicleHealthUpdate(BaseModel):
    engine_temp: Optional[float] = None
    battery_level: Optional[float] = None
    tire_pressure: Optional[float] = None
    vibration_index: Optional[float] = None
    speed: Optional[float] = None
    mileage: Optional[float] = None

class HealthThresholds(BaseModel):
    max_engine_temp: float = 100.0  # °C
    min_battery_level: float = 20.0 # %
    min_tire_pressure: float = 28.0 # PSI
    max_tire_pressure: float = 38.0 # PSI
    max_vibration_index: float = 6.5 # m/s^2

# Document schemas
class DocumentReminderCreate(BaseModel):
    title: str
    category: str
    document_number: Optional[str] = None
    expiry_date: str
    status: Optional[str] = "upcoming"
    notes: Optional[str] = None

class DocumentReminderUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    document_number: Optional[str] = None
    expiry_date: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class DocumentReminderResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    title: str
    category: str
    document_number: Optional[str] = None
    expiry_date: str
    status: str
    notes: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Notification schemas
class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    category: str
    severity: str
    is_read: bool
    timestamp: datetime.datetime

    class Config:
        from_attributes = True

# Detection schemas
class BoundingBox(BaseModel):
    label: str
    confidence: float
    box: List[float]  # [x1, y1, x2, y2] normalized or pixel coords
    hazard_type: Optional[str] = None
    severity: Optional[str] = "medium"

class DetectionFrameResponse(BaseModel):
    frame_id: str
    timestamp: str
    objects_detected: int
    detections: List[BoundingBox]
    warning_level: str  # Safe, Caution, Hazard Detected
    summary: str
    annotated_image_url: Optional[str] = None
    is_simulated: bool = False

# Simulation schemas
class SimulationConfig(BaseModel):
    traffic_volume: str = "medium"  # low, medium, high, rush_hour
    vehicle_count: int = 12
    average_speed: float = 55.0     # km/h
    alert_radius_meters: float = 1000.0
    alerts_enabled: bool = True
