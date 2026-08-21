import { m, useReducedMotion } from 'framer-motion'
import type { RefObject } from 'react'

import { demoForm } from '../../lib/copy'
import { staggerContainer, staggerItem } from '../../lib/motion'
import { Button } from '../ui/Button'
import styles from './ProtocolConfirmation.module.css'

type Props = {
  protocol: string
  office: string
  email: string
  volumeLabel: string
  confirmationRef: RefObject<HTMLDivElement>
  onReset: () => void
}

/**
 * Confirmação-protocolo (§A.5) — mesmo DNA visual do `CalcMemory`: cabeçalho,
 * dado em destaque dourado, campos ecoados em IBM Plex Mono. O protocolo vem
 * do backend (`result.protocol`), nunca é gerado no client.
 */
export function ProtocolConfirmation({
  protocol,
  office,
  email,
  volumeLabel,
  confirmationRef,
  onReset,
}: Props) {
  const reduced = useReducedMotion() ?? false
  const item = staggerItem(reduced)

  return (
    <m.div
      className={styles.card}
      role="status"
      tabIndex={-1}
      ref={confirmationRef}
      variants={staggerContainer(reduced)}
      initial="hidden"
      animate="show"
    >
      <m.div className={styles.head} variants={item}>
        <span className={styles.title}>{demoForm.confirmation.title}</span>
        <span className={styles.dot} aria-hidden="true" />
      </m.div>

      <m.div className={styles.protocolBox} variants={item}>
        <span className={styles.protocolLabel}>{demoForm.confirmation.protocolLabel}</span>
        <span className={styles.protocolValue}>{protocol}</span>
      </m.div>

      <div className={styles.fields}>
        <m.div className={styles.row} variants={item}>
          <span className={styles.rowLabel}>{demoForm.confirmation.fieldsLabels.office}</span>
          <span className={styles.rowValue}>{office}</span>
        </m.div>
        <m.div className={styles.row} variants={item}>
          <span className={styles.rowLabel}>{demoForm.confirmation.fieldsLabels.email}</span>
          <span className={styles.rowValue}>{email}</span>
        </m.div>
        <m.div className={styles.row} variants={item}>
          <span className={styles.rowLabel}>{demoForm.confirmation.fieldsLabels.volume}</span>
          <span className={styles.rowValue}>{volumeLabel}</span>
        </m.div>
      </div>

      <m.p className={styles.note} variants={item}>
        {demoForm.confirmation.note}
      </m.p>

      <m.div variants={item}>
        <Button variant="ghost" onClick={onReset}>
          {demoForm.confirmation.again}
        </Button>
      </m.div>
    </m.div>
  )
}
