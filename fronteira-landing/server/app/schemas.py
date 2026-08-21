import re
from typing import Annotated, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, ValidationInfo, field_validator

Volume = Literal["ate-10", "11-50", "51-200", "mais-de-200"]

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]{2,}$")

# Mensagens por campo, espelhando `demoForm.errors` no client (§B.3.1) — usadas
# tanto pelos @field_validator abaixo quanto pelo handler de RequestValidationError
# em main.py, para que um 422 sempre devolva `{campo: mensagem}` em pt-BR.
FIELD_MESSAGES: dict[str, str] = {
    "name": "Informe seu nome.",
    "office": "Informe o nome do escritório.",
    "email": "Informe um e-mail válido.",
    "volume": "Selecione uma faixa.",
    "consent": "É necessário aceitar para prosseguir.",
}


class DemoRequestIn(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str
    office: str
    email: str
    volume: Volume
    consent: bool
    utm: Optional[dict[str, str]] = None
    referrer: Optional[str] = None
    landing_path: Annotated[Optional[str], Field(validation_alias="landingPath")] = None
    hp: Optional[str] = None
    rendered_at: Annotated[int, Field(validation_alias="renderedAt")]

    @field_validator("name", "office")
    @classmethod
    def not_blank(cls, v: str, info: ValidationInfo) -> str:
        if not v or not v.strip():
            raise ValueError(FIELD_MESSAGES.get(info.field_name or "", "Campo obrigatório."))
        return v.strip()

    @field_validator("email")
    @classmethod
    def valid_email(cls, v: str) -> str:
        if not EMAIL_RE.match(v.strip()):
            raise ValueError(FIELD_MESSAGES["email"])
        return v.strip().lower()

    @field_validator("consent")
    @classmethod
    def must_consent(cls, v: bool) -> bool:
        if v is not True:
            raise ValueError(FIELD_MESSAGES["consent"])
        return v


class DemoRequestOut(BaseModel):
    protocol: str
