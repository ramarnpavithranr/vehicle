import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "AutoPulse AI"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "autopulse-secret-key-super-secure-production-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # SQLite Database File
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"sqlite:///{os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'autopulse.db'))}"
    )

    # V2V Proximity Alert Settings
    DEFAULT_ALERT_RADIUS_METERS: float = 1000.0  # 1 km default
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8080",
        "*"
    ]

settings = Settings()
