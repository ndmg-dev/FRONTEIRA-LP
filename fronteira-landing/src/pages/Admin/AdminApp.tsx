import { useCallback, useState } from 'react'

import { getAdminToken, setAdminToken } from '../../lib/admin'
import styles from './Admin.module.css'
import { Dashboard } from './Dashboard'
import { Login } from './Login'

export default function AdminApp() {
  const [authed, setAuthed] = useState(() => Boolean(getAdminToken()))

  const handleLoginSuccess = useCallback((token: string) => {
    setAdminToken(token)
    setAuthed(true)
  }, [])

  const handleSessionExpired = useCallback(() => {
    setAuthed(false)
  }, [])

  return (
    <div className={styles.page}>
      {authed ? (
        <Dashboard onSessionExpired={handleSessionExpired} />
      ) : (
        <Login onSuccess={handleLoginSuccess} />
      )}
    </div>
  )
}
