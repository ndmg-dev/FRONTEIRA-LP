import { m, useReducedMotion } from 'framer-motion'
import type { KeyboardEvent } from 'react'

import type { VolumeOption } from '../../lib/copy'
import { pillIndicatorX } from '../../lib/motion'
import styles from './VolumePills.module.css'

type Props = {
  id: string
  label: string
  options: readonly VolumeOption[]
  value: VolumeOption['value'] | ''
  error?: string
  onChange: (value: VolumeOption['value']) => void
}

/**
 * Volume como pills segmentadas (§A.2) — `role="radiogroup"` de `role="radio"`
 * navegáveis por seta, com roving tabindex. O indicador dourado desliza sob a
 * opção ativa por transform manual (ver `pillIndicatorX` em lib/motion.ts):
 * `domAnimation` não tem layout animations, então nada de `layoutId`.
 */
export function VolumePills({ id, label, options, value, error, onChange }: Props) {
  const reduced = useReducedMotion() ?? false
  const selectedIndex = options.findIndex((option) => option.value === value)
  const focusIndex = selectedIndex >= 0 ? selectedIndex : 0

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      return
    }
    event.preventDefault()

    let nextIndex = focusIndex
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (focusIndex + 1) % options.length
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (focusIndex - 1 + options.length) % options.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = options.length - 1
    }

    onChange(options[nextIndex].value)
    const nextButton = event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]')[
      nextIndex
    ]
    nextButton?.focus()
  }

  return (
    <div className={styles.field}>
      <span className={styles.label} id={`${id}-label`}>
        {label}
      </span>

      <div
        className={[styles.track, error ? styles.invalid : ''].filter(Boolean).join(' ')}
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        aria-describedby={error ? `${id}-error` : undefined}
        onKeyDown={handleKeyDown}
      >
        {selectedIndex >= 0 ? (
          <m.div
            className={styles.indicator}
            initial={false}
            animate={pillIndicatorX(selectedIndex, reduced)}
            aria-hidden="true"
          />
        ) : null}

        {options.map((option, index) => {
          const selected = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={index === focusIndex ? 0 : -1}
              className={[styles.pill, selected ? styles.pillSelected : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </button>
          )
        })}
      </div>

      {error ? (
        <p className={styles.error} id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  )
}
