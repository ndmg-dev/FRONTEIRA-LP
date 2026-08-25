import { useEffect, useState } from 'react'

import {
  AdminAuthError,
  clearAdminToken,
  fetchLeads,
  resendFollowup,
  updateLeadStatus,
  type Lead,
  type LeadStatus,
} from '../../lib/admin'
import { adminDashboardCopy as copy } from '../../lib/copy'
import styles from './Admin.module.css'

const STATUS_OPTIONS: LeadStatus[] = ['novo', 'contatado', 'fechado', 'perdido']

type Props = {
  onSessionExpired: () => void
}

/** UTM source, ou o domínio do referrer, ou "—" — o que der pra identificar
 * de onde o lead veio sem precisar abrir o registro completo. */
function originLabel(lead: Lead): string {
  if (lead.utm?.source) return lead.utm.source
  if (lead.referrer) {
    try {
      return new URL(lead.referrer).hostname
    } catch {
      return lead.referrer
    }
  }
  return copy.originUnknown
}

export function Dashboard({ onSessionExpired }: Props) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [resendingId, setResendingId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchLeads({ status: statusFilter, page })
      .then((result) => {
        if (cancelled) return
        setLeads(result.items)
        setTotal(result.total)
        setPageSize(result.pageSize)
      })
      .catch((err) => {
        if (cancelled) return
        if (err instanceof AdminAuthError) {
          onSessionExpired()
          return
        }
        setError(copy.loadError)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [statusFilter, page, onSessionExpired])

  async function handleStatusChange(lead: Lead, status: LeadStatus) {
    const previous = leads
    setLeads((current) => current.map((l) => (l.id === lead.id ? { ...l, status } : l)))
    try {
      await updateLeadStatus(lead.id, status)
    } catch (err) {
      setLeads(previous)
      if (err instanceof AdminAuthError) {
        onSessionExpired()
        return
      }
      setError(copy.updateError)
    }
  }

  async function handleResendFollowup(lead: Lead) {
    setResendingId(lead.id)
    setError(null)
    setSuccessMessage(null)
    try {
      const updated = await resendFollowup(lead.id)
      setLeads((current) => current.map((l) => (l.id === lead.id ? updated : l)))
      setSuccessMessage(copy.resendSuccess(lead.protocol))
    } catch (err) {
      if (err instanceof AdminAuthError) {
        onSessionExpired()
        return
      }
      setError(copy.resendError)
    } finally {
      setResendingId(null)
    }
  }

  function handleLogout() {
    clearAdminToken()
    onSessionExpired()
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>{copy.title}</h1>
        <button className={styles.logoutButton} type="button" onClick={handleLogout}>
          {copy.logout}
        </button>
      </header>

      <div className={styles.body}>
        <div className={styles.toolbar}>
          <label className={styles.filterLabel} htmlFor="status-filter">
            {copy.statusFilterLabel}
          </label>
          <select
            id="status-filter"
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as LeadStatus | '')
              setPage(1)
            }}
          >
            <option value="">{copy.statusFilterAll}</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {copy.statusLabels[status]}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        {successMessage && (
          <p className={styles.success} role="status">
            {successMessage}
          </p>
        )}

        <div className={styles.tableWrap}>
          {loading ? (
            <div className={styles.loadingState}>{copy.loading}</div>
          ) : leads.length === 0 ? (
            <div className={styles.emptyState}>{copy.empty}</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{copy.columns.createdAt}</th>
                  <th>{copy.columns.name}</th>
                  <th>{copy.columns.office}</th>
                  <th>{copy.columns.email}</th>
                  <th>{copy.columns.volume}</th>
                  <th>{copy.columns.protocol}</th>
                  <th>{copy.columns.origin}</th>
                  <th>{copy.columns.status}</th>
                  <th>{copy.columns.followup}</th>
                  <th>{copy.columns.actions}</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td>{new Date(lead.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td>{lead.name}</td>
                    <td>{lead.office}</td>
                    <td>{lead.email}</td>
                    <td>{lead.volume}</td>
                    <td className={styles.mono}>{lead.protocol}</td>
                    <td>{originLabel(lead)}</td>
                    <td>
                      <select
                        className={styles.statusSelect}
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead, e.target.value as LeadStatus)}
                        aria-label={`${copy.columns.status} — ${lead.protocol}`}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {copy.statusLabels[status]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className={styles.mono}>
                      {lead.followupSentAt
                        ? new Date(lead.followupSentAt).toLocaleDateString('pt-BR')
                        : copy.followupPending}
                    </td>
                    <td>
                      <button
                        className={styles.resendButton}
                        type="button"
                        disabled={resendingId === lead.id}
                        onClick={() => handleResendFollowup(lead)}
                      >
                        {resendingId === lead.id ? copy.resendButtonSending : copy.resendButton}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageButton}
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              {copy.pagination.previous}
            </button>
            <span>{copy.pagination.pageOf(page, totalPages)}</span>
            <button
              className={styles.pageButton}
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              {copy.pagination.next}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
