from __future__ import annotations

import warnings

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .deps import get_settings
from .routes.admin import router as admin_router
from .routes.demo import router as demo_router
from .routes.internal import router as internal_router
from .schemas import FIELD_MESSAGES

# Falso positivo cosmético do pydantic 2.13 ao processar Field(alias=...) /
# Field(validation_alias=...) através da camada de Body() do FastAPI — o
# alias funciona corretamente (ver testes), só o warning é espúrio.
warnings.filterwarnings("ignore", message=r"The '(alias|validation_alias)' attribute")

app = FastAPI(title="Fronteira — Demo Requests API", version="0.1.0")

_settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=_settings.allowed_origins_list,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH"],
    allow_headers=["Content-Type", "Authorization"],
)

app.include_router(demo_router)
app.include_router(internal_router)
app.include_router(admin_router)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Reformata os erros do pydantic em `{campo: mensagem}` (§B.3 passo 1) —
    o client em src/lib/demo.ts espera esse shape, não o `{"detail": [...]}`
    default do FastAPI."""
    errors: dict[str, str] = {}
    for error in exc.errors():
        loc = error.get("loc", ())
        field = str(loc[-1]) if loc else "form"
        errors[field] = FIELD_MESSAGES.get(field, str(error.get("msg", "Valor inválido.")))
    return JSONResponse(status_code=422, content=errors)
