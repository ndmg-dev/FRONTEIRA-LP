import { useState, type FormEvent } from 'react'

import { adminLogin } from '../../lib/admin'
import { adminLoginCopy } from '../../lib/copy'
import styles from './Admin.module.css'

type Props = {
  onSuccess: (token: string) => void
}

export function Login({ onSuccess }: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const token = await adminLogin(username, password)
      onSuccess(token)
    } catch (err) {
      setError(err instanceof Error ? err.message : adminLoginCopy.genericError)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.loginWrap}>
      <div className={styles.loginCard}>
        <h1 className={styles.loginTitle}>{adminLoginCopy.title}</h1>
        <p className={styles.loginSubtitle}>{adminLoginCopy.subtitle}</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="admin-username">
              {adminLoginCopy.usernameLabel}
            </label>
            <input
              id="admin-username"
              className={styles.input}
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="admin-password">
              {adminLoginCopy.passwordLabel}
            </label>
            <input
              id="admin-password"
              className={styles.input}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <button className={styles.submit} type="submit" disabled={submitting}>
            {submitting ? adminLoginCopy.submitting : adminLoginCopy.submit}
          </button>
        </form>

        <a className={styles.backLink} href="/">
          {adminLoginCopy.backToSite}
        </a>
      </div>
    </div>
  )
}
