import { m, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

import { checkDraw, submitButtonMachine, submitLabelFade } from '../../lib/motion'
import styles from './SubmitButton.module.css'

export type SubmitState = 'idle' | 'loading' | 'success'

type Props = {
  state: SubmitState
  idleLabel: string
  loadingLabel: string
}

/**
 * Botão do form como máquina de estados ocioso→enviando→enviado (§A.4). O
 * rótulo some, o botão encolhe para um alvo circular com pulso dourado
 * enquanto o fetch está em voo, e um check SVG se desenha (`pathLength`)
 * antes de a confirmação assumir a tela.
 */
export function SubmitButton({ state, idleLabel, loadingLabel }: Props) {
  const reduced = useReducedMotion() ?? false
  const labelRef = useRef<HTMLSpanElement>(null)
  const [idleWidth, setIdleWidth] = useState<number | null>(null)

  useEffect(() => {
    if (labelRef.current && idleWidth === null) {
      // padding lateral do botão (ver .button) somado à largura natural do rótulo
      setIdleWidth(labelRef.current.offsetWidth + 40)
    }
  }, [idleWidth])

  const machine = submitButtonMachine(reduced, idleWidth ?? 220)

  return (
    <m.button
      type="submit"
      className={[
        styles.button,
        state !== 'idle' ? styles.compact : '',
        state === 'loading' ? styles.pulsing : '',
      ]
        .filter(Boolean)
        .join(' ')}
      variants={machine}
      initial="idle"
      animate={state}
      disabled={state !== 'idle'}
      aria-live="polite"
    >
      <m.span
        className={styles.label}
        ref={labelRef}
        variants={submitLabelFade(reduced)}
        animate={state}
      >
        {idleLabel}
      </m.span>

      {state === 'loading' ? (
        <span className={styles.spinner} aria-hidden="true">
          <span className={styles.spinnerRing} />
        </span>
      ) : null}

      {state === 'success' ? (
        <svg
          className={styles.check}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <m.path
            d="M5 12.5 10 17 19 7"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={checkDraw(reduced)}
            initial="hidden"
            animate="show"
          />
        </svg>
      ) : null}

      <span className={styles.srOnly}>{state === 'loading' ? loadingLabel : ''}</span>
    </m.button>
  )
}
