"""
Application configuration, read entirely from environment variables (see
.env.example for the full list). No secret ever has a real default value —
missing keys simply mean the feature that needs them degrades gracefully
(see app/services/ai_explain.py and app/services/bitcoin_service.py).
"""

import os
from dataclasses import dataclass, field

from dotenv import load_dotenv

# Load variables from a .env file in the backend/ working directory, if
# present, before anything below reads os.environ. Real environment
# variables (e.g. set by the shell or a deployment platform) always take
# precedence and are never overridden by .env.
load_dotenv()


def _split_csv(value: str) -> list[str]:
    return [v.strip() for v in value.split(",") if v.strip()]


def _bool(value: str, default: bool) -> bool:
    if value is None or value == "":
        return default
    return value.strip().lower() in ("1", "true", "yes", "on")


@dataclass(frozen=True)
class Settings:
    app_env: str = os.getenv("APP_ENV", "development")
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", "8000"))

    cors_origins: list[str] = field(
        default_factory=lambda: _split_csv(
            os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
        )
    )

    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./satoshi_sentinel.db")

    bitcoin_api_base_url: str = os.getenv("BITCOIN_API_BASE_URL", "https://mempool.space/api")
    bitcoin_lookup_timeout_seconds: float = float(os.getenv("BITCOIN_LOOKUP_TIMEOUT_SECONDS", "5"))

    nostr_relays: list[str] = field(
        default_factory=lambda: _split_csv(
            os.getenv(
                "NOSTR_RELAYS",
                "wss://relay.damus.io,wss://nos.lol,wss://relay.nostr.band",
            )
        )
    )
    nostr_lookup_timeout_seconds: float = float(os.getenv("NOSTR_LOOKUP_TIMEOUT_SECONDS", "5"))

    # No AI key is required for the app to run. /api/ai/explain always has a
    # deterministic local fallback; a key only unlocks a (currently unused)
    # model-backed path that never blocks startup or the endpoint's response.
    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")
    ai_explain_enabled: bool = _bool(os.getenv("AI_EXPLAIN_ENABLED", ""), False)

    def sqlite_path(self) -> str:
        """Extract a filesystem path from a sqlite:/// URL for stdlib sqlite3."""
        prefix = "sqlite:///"
        if self.database_url.startswith(prefix):
            return self.database_url[len(prefix):]
        return "satoshi_sentinel.db"


settings = Settings()
