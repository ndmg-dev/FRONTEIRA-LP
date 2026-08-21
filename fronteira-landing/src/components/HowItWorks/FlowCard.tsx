import { m, useReducedMotion } from 'framer-motion'
import { ChevronDown, FileUp, Layers, Scale } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { FlowItem } from '../../lib/copy'
import { chevronRotate, collapseContent, staggerContainer, staggerItem } from '../../lib/motion'
import styles from './FlowCard.module.css'

const ICONS: Record<string, LucideIcon> = {
  wizard: FileUp,
  lote: Layers,
  sefaz: Scale,
}

type Props = {
  flow: FlowItem
  open: boolean
  onToggle: () => void
}

export function FlowCard({ flow, open, onToggle }: Props) {
  const reduced = useReducedMotion() ?? false
  const Icon = ICONS[flow.id] ?? FileUp
  const panelId = `flow-panel-${flow.id}`
  const headerId = `flow-header-${flow.id}`
  const state = open ? 'open' : 'collapsed'

  return (
    <li className={[styles.card, open ? styles.cardOpen : ''].filter(Boolean).join(' ')}>
      <h3 className={styles.headerRow}>
        <button
          className={styles.header}
          id={headerId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span className={styles.icon} aria-hidden="true">
            <Icon size={18} strokeWidth={1.75} />
          </span>

          <span className={styles.headerText}>
            <span className={styles.name}>{flow.name}</span>
            <span className={styles.summary}>{flow.summary}</span>
          </span>

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
        <m.ul
          className={styles.bullets}
          variants={staggerContainer(reduced)}
          initial="hidden"
          animate={open ? 'show' : 'hidden'}
        >
          {flow.bullets.map((bullet) => (
            <m.li className={styles.bullet} key={bullet} variants={staggerItem(reduced)}>
              {bullet}
            </m.li>
          ))}
        </m.ul>
      </m.div>
    </li>
  )
}
