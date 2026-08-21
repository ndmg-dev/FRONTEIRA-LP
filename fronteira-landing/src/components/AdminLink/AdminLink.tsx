import { Lock } from 'lucide-react'

import { adminLink } from '../../lib/copy'
import styles from './AdminLink.module.css'

/** Ícone discreto que leva ao painel administrativo (`/admin`). Fica fora do
 * fluxo visual da landing — não faz parte de `Nav`. */
export function AdminLink() {
  return (
    <a className={styles.link} href="/admin" aria-label={adminLink.ariaLabel}>
      <Lock size={16} strokeWidth={1.75} aria-hidden="true" />
    </a>
  )
}
