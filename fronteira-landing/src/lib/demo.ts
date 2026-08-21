/** Solicitação de demonstração (§A do spec de backend). */
export type Volume = 'ate-10' | '11-50' | '51-200' | 'mais-de-200'

export type DemoRequestPayload = {
  name: string
  office: string
  email: string
  volume: Volume
  consent: boolean
  // metadados coletados no client (§A.6):
  utm?: Record<string, string>
  referrer?: string
  landingPath?: string
  // anti-spam (§A.6):
  hp?: string // honeypot — deve chegar vazio
  renderedAt: number // epoch ms de quando o form montou
}

export type DemoRequestResult = { protocol: string }

/** Erro por campo, devolvido pelo backend como 422 `{ campo: mensagem }`. */
export class FieldValidationError extends Error {
  readonly fields: Record<string, string>

  constructor(fields: Record<string, string>) {
    super('Falha de validação nos campos do formulário.')
    this.name = 'FieldValidationError'
    this.fields = fields
  }
}

export class RateLimitError extends Error {
  constructor() {
    super('Limite de solicitações excedido.')
    this.name = 'RateLimitError'
  }
}

export class SubmitError extends Error {
  constructor() {
    super('Não foi possível concluir o envio.')
    this.name = 'SubmitError'
  }
}

const API_BASE = import.meta.env.VITE_API_BASE as string | undefined

export async function submitDemoRequest(
  payload: DemoRequestPayload,
): Promise<DemoRequestResult> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}/demo-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    // Falha de rede (offline, CORS, backend fora do ar) — mesmo tratamento
    // genérico do erro de submit.
    throw new SubmitError()
  }

  if (res.status === 422) throw new FieldValidationError(await res.json())
  if (res.status === 429) throw new RateLimitError()
  if (!res.ok) throw new SubmitError()

  return res.json() as Promise<DemoRequestResult>
}

export type Metadata = {
  utm?: Record<string, string>
  referrer?: string
  landingPath?: string
}

const UTM_KEYS = ['source', 'medium', 'campaign', 'term', 'content'] as const

/**
 * Lê `utm_*` da query string, o referrer e o path atuais (§A.6). Chamado uma
 * vez no mount do form; o resultado é anexado ao payload no submit.
 */
export function collectMetadata(): Metadata {
  const params = new URLSearchParams(window.location.search)
  const utm: Record<string, string> = {}

  for (const key of UTM_KEYS) {
    const value = params.get(`utm_${key}`)
    if (value) utm[key] = value
  }

  return {
    utm: Object.keys(utm).length > 0 ? utm : undefined,
    referrer: document.referrer || undefined,
    landingPath: window.location.pathname,
  }
}
