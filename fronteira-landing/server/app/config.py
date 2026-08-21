from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuração via env (§B.7). Nenhum segredo tem default de produção."""

    database_url: str
    resend_api_key: str = ""
    email_from: str = "Fronteira <contato@fronteira.app>"
    team_inbox: str = ""
    ip_hash_pepper: str = "change-me-in-prod"
    allowed_origins: str = "http://localhost:5173"
    rate_limit_per_hour: int = 20

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]
