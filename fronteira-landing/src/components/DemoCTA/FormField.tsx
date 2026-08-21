import { m, useReducedMotion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useEffect, useState } from 'react'

import { resultPop, shakeX } from '../../lib/motion'
import styles from './DemoForm.module.css'

type Props = {
  id: string
  label: string
  placeholder: string
  value: string
  error?: string
  /** Campo já passou pelo blur e está válido no momento — mostra o check dourado. */
  valid?: boolean
  /** Incrementa a cada falha de validação nova, para reacionar o shake mesmo
   * quando a mensagem de erro não muda entre uma tentativa e outra. */
  shakeToken?: number
  type?: 'text' | 'email'
  autoComplete?: string
  onChange: (value: string) => void
  onBlur?: () => void
}

/** Campo de texto com validação no blur (§A.3): check dourado em spring ao
 * validar, shake leve em erro (desligado sob reduced-motion). */
export function FormField({
  id,
  label,
  placeholder,
  value,
  error,
  valid = false,
  shakeToken = 0,
  type = 'text',
  autoComplete,
  onChange,
  onBlur,
}: Props) {
  const reduced = useReducedMotion() ?? false
  const [shaking, setShaking] = useState(false)

  useEffect(() => {
    if (shakeToken === 0) return
    setShaking(true)
    const timeout = window.setTimeout(() => setShaking(false), 340)
    return () => window.clearTimeout(timeout)
  }, [shakeToken])

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>

      <m.div
        className={styles.inputWrap}
        variants={shakeX(reduced)}
        animate={shaking ? 'shake' : 'idle'}
      >
        <input
          className={[styles.input, error ? styles.invalid : ''].filter(Boolean).join(' ')}
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
        />

        {valid && !error ? (
          <m.span
            className={styles.validCheck}
            variants={resultPop(reduced)}
            initial="hidden"
            animate="show"
            aria-hidden="true"
          >
            <Check size={16} strokeWidth={2.4} />
          </m.span>
        ) : null}
      </m.div>

      {error ? (
        <p className={styles.error} id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  )
}
