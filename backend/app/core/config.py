import os
from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Ensure .env settings strictly override any stale system environment variables
load_dotenv(override=True)

class Settings(BaseSettings):
    PROJECT_NAME: str = "E-COM Custom Commerce API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    
    # Database (Neon Cloud PostgreSQL)
    DATABASE_URL: str = "postgresql+asyncpg://neondb_owner:npg_co6MJSXeWK8z@ep-still-king-axcdr7h1-pooler.c-4.us-east-2.aws.neon.tech/neondb"

    @validator("DATABASE_URL", pre=True)
    def assemble_database_url(cls, v: str) -> str:
        if isinstance(v, str):
            if "127.0.0.1" in v or "localhost" in v or "e-com-postgres" in v or "supabase.co" in v:
                v = "postgresql+asyncpg://neondb_owner:npg_co6MJSXeWK8z@ep-still-king-axcdr7h1-pooler.c-4.us-east-2.aws.neon.tech/neondb"
            if v.startswith("postgresql://"):
                v = v.replace("postgresql://", "postgresql+asyncpg://", 1)
            elif v.startswith("postgres://"):
                v = v.replace("postgres://", "postgresql+asyncpg://", 1)
            v = v.replace("?ssl=require", "").replace("&ssl=require", "").replace("?sslmode=require", "").replace("&sslmode=require", "")
        return v
    
    # CORS
    CORS_ORIGINS: Union[str, List[str]] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://e-com.vercel.app",
        "https://e-com-shop.vercel.app"
    ]

    @validator("CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # JWT Authentication
    JWT_SECRET: str = "super_secret_jwt_key_ecom_2026_dev"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200 # 30 days

    # Redis & Celery Config (Upstash Cloud Redis)
    REDIS_URL: str = "rediss://default:gQAAAAAAApeoAAIgcDIyYmVlZDhhODBhY2Q0MjhiYmUzYzkzMzlkNDY3N2ZiYw@relaxed-beetle-169896.upstash.io:6379"

    # Third Party Integrations
    RAZORPAY_KEY_ID: str = "rzp_test_ecom_demo"
    RAZORPAY_KEY_SECRET: str = "ecom_demo_secret_12345"
    RAZORPAY_WEBHOOK_SECRET: str = "whsec_ecom_demo"

    SHIPROCKET_EMAIL: str = "demo@e-com.in"
    SHIPROCKET_PASSWORD: str = "demo_password"

    # Cloudinary CDN Configuration
    CLOUDINARY_CLOUD_NAME: str = "rluropic"
    CLOUDINARY_API_KEY: str = "556369161351125"
    CLOUDINARY_API_SECRET: str = "x3_oLOramAzVWpcOoz7EXhbQudk"
    CLOUDINARY_URL: str = "cloudinary://556369161351125:x3_oLOramAzVWpcOoz7EXhbQudk@rluropic"

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"

settings = Settings()
