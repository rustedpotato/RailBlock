from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
import json


from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
DEFAULT_DB_PATH = (BACKEND_DIR / "railblock.db").resolve().as_posix()


class Settings(BaseSettings):
    PROJECT_NAME: str = "RailBlock AI Backend"
    ENVIRONMENT: str = "development"
    API_V1_STR: str = "/api/v1"
    
    # CORS Origins allowed to communicate with API
    BACKEND_CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    # Database Configuration - defaults to backend/railblock.db regardless of CWD
    DATABASE_URL: str = f"sqlite:///{DEFAULT_DB_PATH}"

    # Cryptography & Security Configuration
    SECRET_KEY: str = "railblock-sih26027-quantum-safe-sha256-operational-secret-mumbai"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    FIELD_ENCRYPTION_KEY: str = "dGVzdC1jcnlwdG8ta2V5LXJhaWxibG9jay1zaWgyNjAyNw=="

    # Gemini (Google Search grounded mega-block fetcher)
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.5-flash-lite"

    # WhatsApp & Twilio Dispatch Configuration
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_WHATSAPP_NUMBER: str = "whatsapp:+14155238886"
    PUBLIC_BASE_URL: str = "http://localhost:5173"

    # Server binding defaults
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    RELOAD: bool = True

    model_config = SettingsConfigDict(
        env_file=[str(BACKEND_DIR / ".env"), ".env"],
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def resolve_sqlite_path(cls, v: str) -> str:
        if isinstance(v, str) and v.startswith("sqlite:///") and "./" in v:
            relative_part = v.replace("sqlite:///", "").replace("./", "")
            resolved = (BACKEND_DIR / relative_part).resolve().as_posix()
            return f"sqlite:///{resolved}"
        return v

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, str) and v.startswith("["):
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return [str(item) for item in parsed]
            except Exception:
                pass
        return v if isinstance(v, list) else []


settings = Settings()
