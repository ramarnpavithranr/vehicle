import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="driver")  # driver, operator, admin
    vehicle_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    document_reminders = relationship("DocumentReminder", back_populates="user", cascade="all, delete-orphan")

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)  # e.g., "Pulse Alpha - Model 3"
    model = Column(String(100), nullable=False)
    plate_number = Column(String(50), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    speed = Column(Float, default=45.0)  # km/h
    heading = Column(Float, default=90.0)  # degrees 0-360
    status = Column(String(50), default="active")  # active, warning_received, parked
    is_connected = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    alerts = relationship("Alert", back_populates="vehicle", cascade="all, delete-orphan")
    health = relationship("VehicleHealth", back_populates="vehicle", uselist=False, cascade="all, delete-orphan")

class Hazard(Base):
    __tablename__ = "hazards"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(50), nullable=False)  # pothole, debris, roadwork, accident, slick_road, stalled_vehicle
    severity = Column(String(50), default="medium")  # low, medium, high, critical
    description = Column(Text, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    # Lifecycle: detected -> pending_verification -> confirmed -> cleared (or rejected)
    status = Column(String(50), default="detected", index=True)
    confidence = Column(Float, default=0.88)
    reported_by = Column(String(100), default="AutoPulse AI Vision")
    verified_by = Column(String(100), nullable=True)
    image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    alerts = relationship("Alert", back_populates="hazard", cascade="all, delete-orphan")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    hazard_id = Column(Integer, ForeignKey("hazards.id"), nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    message = Column(String(255), nullable=False)
    severity = Column(String(50), default="high")
    distance_meters = Column(Float, nullable=False)
    acknowledged = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    hazard = relationship("Hazard", back_populates="alerts")
    vehicle = relationship("Vehicle", back_populates="alerts")

class VehicleHealth(Base):
    __tablename__ = "vehicle_health"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), unique=True, nullable=False)
    engine_temp = Column(Float, default=88.5)      # Celsius (normal: 80-95, alert > 105)
    battery_level = Column(Float, default=84.0)    # Percentage (normal > 25%, alert < 20%)
    tire_pressure = Column(Float, default=33.5)    # PSI (normal 32-35, alert < 28 or > 38)
    vibration_index = Column(Float, default=3.2)   # m/s^2 (alert > 7.0 indicates severe rough road/suspension issue)
    brake_wear = Column(Float, default=18.0)       # Percentage wear
    speed = Column(Float, default=52.0)            # km/h
    mileage = Column(Float, default=14280.0)       # km
    warning_status = Column(String(100), default="Optimal")
    last_updated = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    vehicle = relationship("Vehicle", back_populates="health")

class DocumentReminder(Base):
    __tablename__ = "document_reminders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False)  # insurance, license, puc, fitness, service, custom, fine_sample
    document_number = Column(String(100), nullable=True)
    expiry_date = Column(String(50), nullable=False)  # YYYY-MM-DD
    status = Column(String(50), default="upcoming")  # upcoming, due_soon, overdue, completed
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="document_reminders")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String(50), default="hazard")  # hazard, health, document, system
    severity = Column(String(50), default="info")     # info, warning, danger, success
    is_read = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
