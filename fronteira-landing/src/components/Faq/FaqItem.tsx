import { m, useReducedMotion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

import type { FaqItem as FaqItemType } from '../../lib/copy'
import { chevronRotate, collapseContent } from '../../lib/motion'
import styles from './Faq.module.css'

type Props = { item: FaqItemType }

/** Item de accordion independente — cada pergunta abre/fecha por conta
 * própria (diferente do accordion de item único de HowItWorks). */
export function FaqItem({ item }: Props) {
  const reduced = useReducedMotion() ?? false
  const [open, setOpen] = useState(false)
  const state = open ? 'open' : 'collapsed'
  const panelId = `faq-panel-${item.id}`
  const headerId = `faq-header-${item.id}`

  return (
    <li className={[styles.card, open ? styles.cardOpen : ''].filter(Boolean).join(' ')}>
      <h3 className={styles.headerRow}>
        <button
          className={styles.header}
          id={headerId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((current) => !current)}
        >
          <span className={styles.question}>{item.question}</span>

          <m.span
            className={styles.chevron}
            variants={chevronRotate(reduced)}
            animate={state}
            aria-hidden="true"
          >
            <ChevronDown size={18} strokeWidth={2} />
          </m.span>
        </button>
      </h3>

      <m.div
        className={styles.panelWrap}
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        variants={collapseContent(reduced)}
        initial="collapsed"
        animate={state}
      >
        <p className={styles.answer}>{item.answer}</p>
      </m.div>
    </li>
  )
}
