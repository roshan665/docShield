from typing import List, Optional, Union
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Centralized typed configuration for DocShield FastAPI Backend.
    Loads from environment variables and .env file.
    """
    PROJECT_NAME: str = "DocShield Backend"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    ENVIRONMENT: str = "development"
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Frontend CORS
    FRONTEND_URL: str = "http://localhost:5173"
    ALLOWED_ORIGINS: Union[List[str], str] = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"
    CORS_ORIGIN_REGEX: Optional[str] = r"^https:\/\/.*\.onrender\.com$"
    SERVE_STATIC_FRONTEND: bool = False

    # Supabase Configuration
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    SUPABASE_JWT_SECRET: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() in ("production", "prod")

    @property
    def cors_origins(self) -> List[str]:
        if isinstance(self.ALLOWED_ORIGINS, str):
            origins = [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]
        else:
            origins = list(self.ALLOWED_ORIGINS)

        # Ensure FRONTEND_URL is included if specified
        if self.FRONTEND_URL and self.FRONTEND_URL != "*" and self.FRONTEND_URL not in origins:
            origins.append(self.FRONTEND_URL)

        # Security Guard: When credentials are enabled or in production, reject wildcard "*"
        if self.is_production or "*" in origins:
            cleaned = [o for o in origins if o != "*"]
            if not cleaned:
                return [self.FRONTEND_URL] if self.FRONTEND_URL and self.FRONTEND_URL != "*" else []
            return cleaned
        return origins

    @property
    def is_supabase_configured(self) -> bool:
        return bool(self.SUPABASE_URL and self.SUPABASE_ANON_KEY)


settings = Settings()
