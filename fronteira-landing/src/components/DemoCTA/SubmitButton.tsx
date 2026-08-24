import { m, useReducedMotion } from 'framer-motion'
import { useLayoutEffect, useRef, useState } from 'react'

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
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [idleWidth, setIdleWidth] = useState<number | null>(null)

  useLayoutEffect(() => {
    // Largura ociosa = largura do botão enquanto ocupa 100% do form via CSS
    // (.full) — medida uma vez antes do primeiro paint, depois disso o
    // framer-motion assume o controle da largura (idle → compacto no envio).
    if (buttonRef.current && idleWidth === null) {
      setIdleWidth(buttonRef.current.offsetWidth)
    }
  }, [idleWidth])

  const machine = submitButtonMachine(reduced, idleWidth ?? 220)
  // Antes de medir, nenhuma prop de motion controla a largura — a classe
  // .full (width: 100%) manda, o que evita o efeito sanfona de nascer com
  // 220px fixo e só depois esticar para o tamanho real do form.
  const motionProps = idleWidth !== null ? { variants: machine, initial: 'idle', animate: state } : {}

  return (
    <m.button
      ref={buttonRef}
      type="submit"
      className={[
        styles.button,
        idleWidth === null ? styles.full : '',
        state !== 'idle' ? styles.compact : '',
        state === 'loading' ? styles.pulsing : '',
      ]
        .filter(Boolean)
        .join(' ')}
      {...motionProps}
      disabled={state !== 'idle'}
      aria-live="polite"
    >
      <m.span className={styles.label} variants={submitLabelFade(reduced)} animate={state}>
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
