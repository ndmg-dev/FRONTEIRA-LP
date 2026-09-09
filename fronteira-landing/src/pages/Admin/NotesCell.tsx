import { useState } from 'react'

import { adminDashboardCopy as copy } from '../../lib/copy'
import styles from './Admin.module.css'

type Props = {
  value: string | null
  onSave: (notes: string) => Promise<void>
}

/** Observação livre por lead — edita inline, salva no blur só se o texto
 * realmente mudou (evita PATCH desnecessário em todo clique/foco). */
export function NotesCell({ value, onSave }: Props) {
  const [draft, setDraft] = useState(value ?? '')
  const [saving, setSaving] = useState(false)

  const handleBlur = async () => {
    if (draft === (value ?? '')) return
    setSaving(true)
    try {
      await onSave(draft)
    } finally {
      setSaving(false)
    }
  }

  return (
    <input
      className={styles.notesInput}
      type="text"
      value={draft}
      placeholder={copy.notesPlaceholder}
      disabled={saving}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={handleBlur}
    />
  )
}
