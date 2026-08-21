from __future__ import annotations

import base64
import binascii
import re

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Campos numéricos: uma env var declarada mas vazia (comum quando o compose
# de produção repassa `${VAR}` e o Coolify não tem valor cadastrado pra ela)
# não deve derrubar o serviço — trata como "não definida" e cai no default.
_INT_FIELDS_WITH_DEFAULT = ("rate_limit_per_hour", "followup_business_days")

_BCRYPT_RE = re.compile(r"^\$2[aby]\$\d{2}\$")


class Settings(BaseSettings):
    """Configuração via env (§B.7). Nenhum segredo tem default de produção."""

    database_url: str
    resend_api_key: str = ""
    email_from: str = "Fronteira <contato@fronteira.app>"
    team_inbox: str = ""
    ip_hash_pepper: str = "change-me-in-prod"
    allowed_origins: str = "http://localhost:5173"
    rate_limit_per_hour: int = 20
    internal_api_token: str = ""
    followup_business_days: int = 2
    admin_username: str = ""
    admin_password_hash: str = ""
    admin_jwt_secret: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @model_validator(mode="before")
    @classmethod
    def _empty_string_falls_back_to_default(cls, data: object) -> object:
        if isinstance(data, dict):
            for field in _INT_FIELDS_WITH_DEFAULT:
                if data.get(field) == "":
                    data.pop(field)
        return data

    @field_validator("admin_password_hash", mode="after")
    @classmethod
    def _accept_base64_encoded_hash(cls, v: str) -> str:
        """Alguns editores de env var de PaaS corrompem hashes bcrypt (o `$`
        é interpretado como início de variável de shell em algum ponto do
        pipeline). Se o valor não parece um hash bcrypt, tenta decodificar
        como base64 — permite cadastrar `ADMIN_PASSWORD_HASH` já em base64
        pra nunca ter `$` no valor da env var."""
        if not v or _BCRYPT_RE.match(v):
            return v
        try:
            decoded = base64.b64decode(v, validate=True).decode("utf-8")
        except (binascii.Error, ValueError, UnicodeDecodeError):
            return v
        return decoded if _BCRYPT_RE.match(decoded) else v

    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]
