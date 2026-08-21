/** Client da API do painel administrativo (`/admin/*`). Token de sessão vive
 * em `sessionStorage` — some ao fechar a aba, sem persistir em máquina
 * compartilhada. */

export type LeadStatus = 'novo' | 'contatado' | 'fechado' | 'perdido'

export type Lead = {
  id: string
  protocol: string
  name: string
  office: string
  email: string
  volume: string
  status: LeadStatus
  referrer: string | null
  landingPath: string | null
  utm: Record<string, string> | null
  createdAt: string
  followupSentAt: string | null
}

export type LeadList = {
  items: Lead[]
  total: number
  page: number
  pageSize: number
}

export class AdminAuthError extends Error {
  constructor() {
    super('Sessão inválida ou expirada.')
    this.name = 'AdminAuthError'
  }
}

export class AdminApiError extends Error {
  constructor(message = 'Não foi possível concluir a operação.') {
    super(message)
    this.name = 'AdminApiError'
  }
}

const API_BASE = import.meta.env.VITE_API_BASE as string | undefined
const TOKEN_KEY = 'fronteira_admin_token'

export function getAdminToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function setAdminToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token)
}

export function clearAdminToken(): void {
  sessionStorage.removeItem(TOKEN_KEY)
}

export async function adminLogin(username: string, password: string): Promise<string> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
  } catch {
    throw new AdminApiError('Não foi possível conectar ao servidor.')
  }

  if (res.status === 401) throw new AdminApiError('Usuário ou senha inválidos.')
  if (res.status === 429) throw new AdminApiError('Muitas tentativas. Tente novamente em instantes.')
  if (!res.ok) throw new AdminApiError()

  const body = (await res.json()) as { token: string }
  return body.token
}

function authHeaders(): Record<string, string> {
  const token = getAdminToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function authedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { ...authHeaders(), ...init.headers },
    })
  } catch {
    throw new AdminApiError('Não foi possível conectar ao servidor.')
  }

  if (res.status === 401) {
    clearAdminToken()
    throw new AdminAuthError()
  }
  return res
}

type LeadApiShape = Omit<Lead, 'landingPath' | 'createdAt' | 'followupSentAt'> & {
  landing_path: string | null
  created_at: string
  followup_sent_at: string | null
}

function fromApi(row: LeadApiShape): Lead {
  return {
    ...row,
    landingPath: row.landing_path,
    createdAt: row.created_at,
    followupSentAt: row.followup_sent_at,
  }
}

export async function fetchLeads(params: { status?: LeadStatus | ''; page?: number }): Promise<LeadList> {
  const query = new URLSearchParams()
  if (params.status) query.set('status_filter', params.status)
  if (params.page) query.set('page', String(params.page))

  const res = await authedFetch(`/admin/leads?${query.toString()}`)
  if (!res.ok) throw new AdminApiError()

  const body = (await res.json()) as {
    items: LeadApiShape[]
    total: number
    page: number
    page_size: number
  }
  return { items: body.items.map(fromApi), total: body.total, page: body.page, pageSize: body.page_size }
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<Lead> {
  const res = await authedFetch(`/admin/leads/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new AdminApiError()
  return fromApi((await res.json()) as LeadApiShape)
}
