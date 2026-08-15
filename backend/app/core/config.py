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
    
    # Database (Neon Cloud PostgreSQL)
    DATABASE_URL: str = "postgresql+asyncpg://neondb_owner:npg_co6MJSXeWK8z@ep-still-king-axcdr7h1-pooler.c-4.us-east-2.aws.neon.tech/neondb?ssl=require"

    @validator("DATABASE_URL", pre=True)
    def assemble_database_url(cls, v: str) -> str:
        if isinstance(v, str):
            if v.startswith("postgresql://"):
                v = v.replace("postgresql://", "postgresql+asyncpg://", 1)
            elif v.startswith("postgres://"):
                v = v.replace("postgres://", "postgresql+asyncpg://", 1)
        return v
    
    # CORS
    CORS_ORIGINS: Union[str, List[str]] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://skipd.vercel.app",
        "https://skipd-shop.vercel.app"
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

    # Redis & Celery Config (Upstash Cloud Redis)
    REDIS_URL: str = "rediss://default:gQAAAAAAApeoAAIgcDIyYmVlZDhhODBhY2Q0MjhiYmUzYzkzMzlkNDY3N2ZiYw@relaxed-beetle-169896.upstash.io:6379"

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
