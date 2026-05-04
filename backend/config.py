import os
from dataclasses import dataclass
from typing import List

from dotenv import load_dotenv

load_dotenv()


def _csv_env(name: str, default: str) -> List[str]:
    value = os.getenv(name, default)
    return [item.strip() for item in value.split(",") if item.strip()]


@dataclass(frozen=True)
class Settings:
    app_env: str = os.getenv("APP_ENV", "development")
    mongo_url: str = os.getenv("MONGO_URL", "")
    mongo_db_name: str = os.getenv("MONGO_DB_NAME", "instaflow")
    secret_key: str = os.getenv("SECRET_KEY", "")
    algorithm: str = os.getenv("ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
    refresh_token_expire_days: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    cors_origins: List[str] = None
    enable_dev_routes: bool = os.getenv("ENABLE_DEV_ROUTES", "false").lower() == "true"
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    campaign_rate_limit: int = int(os.getenv("CAMPAIGN_RATE_LIMIT", "20"))
    campaign_rate_window_seconds: int = int(os.getenv("CAMPAIGN_RATE_WINDOW_SECONDS", "60"))
    comment_test_rate_limit: int = int(os.getenv("COMMENT_TEST_RATE_LIMIT", "30"))
    comment_test_rate_window_seconds: int = int(os.getenv("COMMENT_TEST_RATE_WINDOW_SECONDS", "60"))

    def __post_init__(self):
        object.__setattr__(
            self,
            "cors_origins",
            _csv_env(
                "CORS_ORIGINS",
                "http://127.0.0.1:5173,http://localhost:5173,http://127.0.0.1:5174,http://localhost:5174",
            ),
        )

        if not self.secret_key:
            raise RuntimeError("SECRET_KEY is required. Set it in backend/.env")

        if not self.mongo_url:
            raise RuntimeError("MONGO_URL is required. Set it in backend/.env")


settings = Settings()

# Backwards-compatible constants for modules that import them directly.
SECRET_KEY = settings.secret_key
ALGORITHM = settings.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes
REFRESH_TOKEN_EXPIRE_DAYS = settings.refresh_token_expire_days
