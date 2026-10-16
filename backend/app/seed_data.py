import os
import sys
import datetime

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.core.security import hash_password
from app.models.models import (
    User, Vehicle, Hazard, Alert, VehicleHealth, DocumentReminder, Notification
)

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    # Check if already seeded
    if db.query(User).first():
        print("Database already contains data. Skipping initial seeding.")
        db.close()
        return

    print("Seeding AutoPulse AI database with rich production-grade demo data...")

    # 1. Create Demo Users
    admin_user = User(
        email="demo@autopulse.ai",
        hashed_password=hash_password("password123"),
        full_name="Safety Inspector Alex Turner",
        role="admin",
        vehicle_id=1
    )
    driver_user = User(
        email="driver@autopulse.ai",
        hashed_password=hash_password("password123"),
        full_name="Connected Driver Priya Sharma",
        role="driver",
        vehicle_id=2
    )
    db.add_all([admin_user, driver_user])
    db.commit()

    # 2. Create Connected Vehicles
    vehicles = [
        Vehicle(
            name="Pulse Alpha - Tesla Model 3",
            model="Tesla Model 3 Long Range",
            plate_number="KA-01-EQ-9812",
            latitude=12.9716,
            longitude=77.5946,
            speed=52.0,
            heading=85.0,
            status="active",
            is_connected=True
        ),
        Vehicle(
            name="Pulse Beta - Ford Mach-E",
            model="Ford Mustang Mach-E",
            plate_number="KA-03-EV-4421",
            latitude=12.9745,
            longitude=77.5982,
            speed=48.0,
            heading=120.0,
            status="active",
            is_connected=True
        ),
        Vehicle(
            name="Pulse Gamma - Hyundai Ioniq 5",
            model="Hyundai Ioniq 5 AWD",
            plate_number="KA-05-AB-7709",
            latitude=12.9682,
            longitude=77.5912,
            speed=58.0,
            heading=240.0,
            status="active",
            is_connected=True
        ),
        Vehicle(
            name="Pulse Delta - Tata Nexon EV",
            model="Tata Nexon EV Max",
            plate_number="KA-02-MH-3310",
            latitude=12.9760,
            longitude=77.5905,
            speed=42.0,
            heading=310.0,
            status="active",
            is_connected=True
        ),
        Vehicle(
            name="Pulse Echo - BMW i4 eDrive40",
            model="BMW i4 Gran Coupe",
            plate_number="KA-04-CZ-1198",
            latitude=12.9650,
            longitude=77.6010,
            speed=64.0,
            heading=45.0,
            status="active",
            is_connected=True
        )
    ]
    db.add_all(vehicles)
    db.commit()

    # 3. Create Vehicle Health Records
    health_records = [
        VehicleHealth(
            vehicle_id=1,
            engine_temp=88.5,
            battery_level=84.0,
            tire_pressure=33.5,
            vibration_index=3.2,
            brake_wear=14.0,
            speed=52.0,
            mileage=14280.0,
            warning_status="Optimal"
        ),
        VehicleHealth(
            vehicle_id=2,
            engine_temp=101.4,
            battery_level=24.5,
            tire_pressure=29.2,
            vibration_index=6.4,
            brake_wear=38.0,
            speed=48.0,
            mileage=32400.0,
            warning_status="Attention: Battery Low (<25%)"
        ),
        VehicleHealth(
            vehicle_id=3,
            engine_temp=86.2,
            battery_level=92.0,
            tire_pressure=34.0,
            vibration_index=2.8,
            brake_wear=9.0,
            speed=58.0,
            mileage=8950.0,
            warning_status="Optimal"
        ),
        VehicleHealth(
            vehicle_id=4,
            engine_temp=89.0,
            battery_level=71.0,
            tire_pressure=32.8,
            vibration_index=3.9,
            brake_wear=21.0,
            speed=42.0,
            mileage=21500.0,
            warning_status="Optimal"
        ),
        VehicleHealth(
            vehicle_id=5,
            engine_temp=87.5,
            battery_level=89.0,
            tire_pressure=34.5,
            vibration_index=2.5,
            brake_wear=12.0,
            speed=64.0,
            mileage=11200.0,
            warning_status="Optimal"
        )
    ]
    db.add_all(health_records)
    db.commit()

    # 4. Create Road Hazards across the 4 statuses
    now = datetime.datetime.utcnow()
    hazards = [
        Hazard(
            type="pothole",
            severity="high",
            description="Deep crater pothole in central driving lane; potential rim damage risk.",
            latitude=12.9730,
            longitude=77.5960,
            status="confirmed",
            confidence=0.94,
            reported_by="AutoPulse AI Vision",
            verified_by="Municipal Traffic AI Authority",
            created_at=now - datetime.timedelta(minutes=45),
            updated_at=now - datetime.timedelta(minutes=30)
        ),
        Hazard(
            type="roadwork",
            severity="medium",
            description="Utility cable duct maintenance; right lane blocked with orange warning pylons.",
            latitude=12.9772,
            longitude=77.5935,
            status="pending_verification",
            confidence=0.87,
            reported_by="Pulse Delta Dashcam",
            created_at=now - datetime.timedelta(minutes=18),
            updated_at=now - datetime.timedelta(minutes=18)
        ),
        Hazard(
            type="debris",
            severity="critical",
            description="Shed commercial cargo pallet fragments scattered across fast lane.",
            latitude=12.9695,
            longitude=77.5995,
            status="confirmed",
            confidence=0.91,
            reported_by="AutoPulse AI Camera",
            verified_by="Safety Inspector Alex Turner",
            created_at=now - datetime.timedelta(minutes=12),
            updated_at=now - datetime.timedelta(minutes=8)
        ),
        Hazard(
            type="slick_road",
            severity="medium",
            description="Diesel fuel / oil sheen detected on curve; reduced traction warning.",
            latitude=12.9660,
            longitude=77.5910,
            status="detected",
            confidence=0.79,
            reported_by="Pulse Gamma Vision Sensor",
            created_at=now - datetime.timedelta(minutes=5),
            updated_at=now - datetime.timedelta(minutes=5)
        ),
        Hazard(
            type="stalled_vehicle",
            severity="high",
            description="Heavy delivery truck immobilized on shoulder with hazard blinkers on.",
            latitude=12.9755,
            longitude=77.6020,
            status="confirmed",
            confidence=0.95,
            reported_by="AutoPulse AI Vision",
            verified_by="Highway Patrol Operations",
            created_at=now - datetime.timedelta(hours=1, minutes=10),
            updated_at=now - datetime.timedelta(minutes=50)
        ),
        Hazard(
            type="accident",
            severity="critical",
            description="Two-vehicle fender incident cleared by roadside assistance; roadway re-opened.",
            latitude=12.9635,
            longitude=77.5950,
            status="cleared",
            confidence=0.97,
            reported_by="Emergency Response Unit",
            verified_by="Traffic Control Central",
            created_at=now - datetime.timedelta(hours=3),
            updated_at=now - datetime.timedelta(minutes=25)
        )
    ]
    db.add_all(hazards)
    db.commit()

    # 5. Create Initial Active Alerts for Confirmed Hazards
    alerts = [
        Alert(
            hazard_id=1,
            vehicle_id=1,
            message="DANGER: POTHOLE detected 210m ahead! Reduce speed.",
            severity="high",
            distance_meters=210.0,
            acknowledged=False,
            timestamp=now - datetime.timedelta(minutes=28)
        ),
        Alert(
            hazard_id=3,
            vehicle_id=2,
            message="CRITICAL: DEBRIS detected 390m ahead! Prepare lane change.",
            severity="critical",
            distance_meters=390.0,
            acknowledged=False,
            timestamp=now - datetime.timedelta(minutes=7)
        )
    ]
    db.add_all(alerts)

    # 6. Create Document Reminders
    reminders = [
        DocumentReminder(
            user_id=admin_user.id,
            title="Comprehensive Commercial Vehicle Insurance",
            category="insurance",
            document_number="HDFC-ERGO-POL-981204",
            expiry_date="2026-11-25",
            status="upcoming",
            notes="Zero-depreciation policy with roadside breakdown coverage."
        ),
        DocumentReminder(
            user_id=admin_user.id,
            title="Pollution Under Control (PUC) Certificate",
            category="puc",
            document_number="PUC-KA01-2026-9921",
            expiry_date="2026-10-28",
            status="due_soon",
            notes="Mandatory quarterly emission check due in 14 days."
        ),
        DocumentReminder(
            user_id=admin_user.id,
            title="Commercial Transport Driving License",
            category="license",
            document_number="DL-KA01-2019-0098214",
            expiry_date="2026-10-19",
            status="due_soon",
            notes="Driver license renewal biometric verification pending."
        ),
        DocumentReminder(
            user_id=admin_user.id,
            title="High-Voltage EV Battery Diagnostics Service",
            category="service",
            document_number="SRV-TESLA-BLR-4412",
            expiry_date="2026-09-20",
            status="overdue",
            notes="Scheduled 15,000km coolant flush and cell balancing check."
        ),
        DocumentReminder(
            user_id=admin_user.id,
            title="State RTO Vehicle Fitness Certificate",
            category="fitness",
            document_number="FIT-KA-CENTRAL-8812",
            expiry_date="2027-03-31",
            status="upcoming",
            notes="Valid annual fitness certification."
        )
    ]
    db.add_all(reminders)

    # 7. Create System Notifications
    notifications = [
        Notification(
            title="AutoPulse AI V2V Network Online",
            message="FastAPI WebSocket channel connected. 5 active telemetry vehicles streaming real-time positional data.",
            category="system",
            severity="info",
            is_read=False,
            timestamp=now - datetime.timedelta(minutes=50)
        ),
        Notification(
            title="Hazard Confirmed: Deep Pothole",
            message="Hazard #1 verified by Traffic AI. Proximity alert broadcast to Pulse Alpha at 210m distance.",
            category="hazard",
            severity="danger",
            is_read=False,
            timestamp=now - datetime.timedelta(minutes=30)
        ),
        Notification(
            title="Telematics Warning: Pulse Beta Battery",
            message="Pulse Beta reported remaining battery 24.5%. Below recommended buffer of 25%.",
            category="health",
            severity="warning",
            is_read=False,
            timestamp=now - datetime.timedelta(minutes=15)
        ),
        Notification(
            title="Document Due Soon: PUC Certificate",
            message="Pollution Under Control renewal expires on Oct 28, 2026. Schedule inspection.",
            category="document",
            severity="warning",
            is_read=True,
            timestamp=now - datetime.timedelta(hours=2)
        )
    ]
    db.add_all(notifications)

    db.commit()
    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
