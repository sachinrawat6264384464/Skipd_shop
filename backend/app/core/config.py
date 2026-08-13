import os
from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SKIPD Custom Commerce API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    
    # Database (PostgreSQL Port 5433)
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@127.0.0.1:5433/skipd_commerce_db"
    
    # CORS
    CORS_ORIGINS: Union[str, List[str]] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://skipd.vercel.app"
    ]

    @validator("CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # JWT Authentication
    JWT_SECRET: str = "super_secret_jwt_key_skipd_2026_dev"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200 # 30 days

    # Redis & Celery Config
    REDIS_URL: str = "redis://127.0.0.1:6379/0"

    # Third Party Integrations
    RAZORPAY_KEY_ID: str = "rzp_test_skipd_demo"
    RAZORPAY_KEY_SECRET: str = "skipd_demo_secret_12345"
    RAZORPAY_WEBHOOK_SECRET: str = "whsec_skipd_demo"

    SHIPROCKET_EMAIL: str = "demo@skipd.in"
    SHIPROCKET_PASSWORD: str = "demo_password"

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"

settings = Settings()
