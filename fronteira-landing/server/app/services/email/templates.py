from __future__ import annotations

from typing import Any

VOLUME_LABELS: dict[str, str] = {
    "ate-10": "Até 10",
    "11-50": "11–50",
    "51-200": "51–200",
    "mais-de-200": "Mais de 200",
}


def _row(label: str, value: str) -> str:
    return (
        '<tr><td style="padding:4px 12px 4px 0;color:#727b89;font-family:Arial,sans-serif;'
        f'font-size:13px;">{label}</td>'
        f'<td style="padding:4px 0;color:#eceef2;font-family:Arial,sans-serif;font-size:13px;">{value}</td></tr>'
    )


def team_notification(row: dict[str, Any]) -> tuple[str, str]:
    """Notificação interna ao time (§B.6). `reply_to` é setado pela chamada em
    routes/demo.py com o e-mail do lead, para o time responder direto."""
    volume_label = VOLUME_LABELS.get(row["volume"], row["volume"])
    subject = f'Nova demo · {row["office"]} · {volume_label}'
    utm = row.get("utm") or {}
    utm_line = ", ".join(f"{k}={v}" for k, v in utm.items()) or "—"
    html = f"""
    <div style="font-family:Arial,sans-serif;background:#0c0e12;color:#eceef2;padding:24px;">
      <h2 style="color:#c9a961;margin:0 0 16px;">Nova solicitação de demonstração</h2>
      <table role="presentation" cellpadding="0" cellspacing="0">
        {_row("Protocolo", row["protocol"])}
        {_row("Nome", row["name"])}
        {_row("Escritório", row["office"])}
        {_row("E-mail", row["email"])}
        {_row("Faixa de empresas", volume_label)}
        {_row("Origem (referrer)", row.get("referrer") or "—")}
        {_row("Página", row.get("landing_path") or "—")}
        {_row("UTM", utm_line)}
      </table>
      <p style="margin-top:16px;color:#aab2bf;font-family:Arial,sans-serif;font-size:13px;">
        Responda este e-mail para falar direto com o lead.
      </p>
    </div>
    """
    return subject, html


def lead_autoresponse(row: dict[str, Any]) -> tuple[str, str]:
    """Auto-resposta ao lead, tom sóbrio para público fiscal (§B.6)."""
    subject = f'Recebemos sua solicitação — {row["protocol"]}'
    html = f"""
    <div style="font-family:Arial,sans-serif;background:#0c0e12;color:#eceef2;padding:24px;">
      <h2 style="color:#c9a961;margin:0 0 16px;">Solicitação registrada</h2>
      <p style="font-size:14px;">Olá, {row["name"]}.</p>
      <p style="font-size:14px;">
        Recebemos sua solicitação de demonstração do Fronteira para o escritório
        <strong>{row["office"]}</strong>.
      </p>
      <p style="font-size:14px;">
        Protocolo: <strong style="color:#e6c982;">{row["protocol"]}</strong>
      </p>
      <p style="font-size:14px;">
        Nosso time retorna em até 1 dia útil para combinar os próximos passos.
      </p>
      <p style="color:#727b89;font-size:12px;margin-top:24px;">
        Este e-mail é uma confirmação automática. Se você não solicitou esta
        demonstração, pode ignorá-lo.
      </p>
    </div>
    """
    return subject, html


def lead_followup(row: dict[str, Any]) -> tuple[str, str]:
    """Follow-up automático ao lead quando a demo ainda não foi respondida
    pelo time (§ followup). Mesmo tom sóbrio do autoresponder."""
    subject = f'Ainda por aqui? — {row["protocol"]}'
    html = f"""
    <div style="font-family:Arial,sans-serif;background:#0c0e12;color:#eceef2;padding:24px;">
      <h2 style="color:#c9a961;margin:0 0 16px;">Sua demonstração do Fronteira</h2>
      <p style="font-size:14px;">Olá, {row["name"]}.</p>
      <p style="font-size:14px;">
        Há alguns dias você solicitou uma demonstração do Fronteira para o
        escritório <strong>{row["office"]}</strong> (protocolo
        <strong style="color:#e6c982;">{row["protocol"]}</strong>) e ainda não
        conseguimos falar com você.
      </p>
      <p style="font-size:14px;">
        Se ainda tiver interesse, responda este e-mail com um horário que
        funcione — ou nos avise se prefere deixar para depois.
      </p>
      <p style="color:#727b89;font-size:12px;margin-top:24px;">
        Este e-mail é um lembrete automático referente à sua solicitação. Se
        você já foi atendido, pode ignorá-lo.
      </p>
    </div>
    """
    return subject, html
