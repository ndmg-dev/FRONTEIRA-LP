from __future__ import annotations

from datetime import datetime, timedelta


def subtract_business_days(reference: datetime, business_days: int) -> datetime:
    """Retorna `reference` menos `business_days` dias úteis (seg–sex, sem
    feriados). Usado para achar o corte de criação a partir do qual um lead
    já "venceu" o prazo de follow-up."""
    remaining = business_days
    cursor = reference
    while remaining > 0:
        cursor -= timedelta(days=1)
        if cursor.weekday() < 5:  # 0=segunda .. 4=sexta
            remaining -= 1
    return cursor
