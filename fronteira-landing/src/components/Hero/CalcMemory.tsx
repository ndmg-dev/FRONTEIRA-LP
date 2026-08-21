import { m, useReducedMotion } from 'framer-motion'

import { calcMemory } from '../../lib/copy'
import { resultPop, staggerContainer, staggerItem } from '../../lib/motion'
import styles from './CalcMemory.module.css'

export function CalcMemory() {
  const reduced = useReducedMotion() ?? false
  const container = staggerContainer(reduced)
  const item = staggerItem(reduced)

  return (
    <m.figure
      className={styles.card}
      variants={container}
      initial="hidden"
      animate="show"
      aria-labelledby="calc-memory-title"
    >
      <m.figcaption className={styles.head} variants={item}>
        <span className={styles.title} id="calc-memory-title">
          {calcMemory.title}
        </span>
        <span className={styles.dot} aria-hidden="true" />
      </m.figcaption>

      <m.div className={styles.sub} variants={item}>
        <span className={styles.mono}>{calcMemory.docLabel}</span>
        <span className={styles.mono}>{calcMemory.ncmLabel}</span>
      </m.div>

      <div className={styles.steps}>
        {calcMemory.steps.map((step) => (
          <m.div className={styles.step} key={step.label} variants={item}>
            <span className={styles.stepLabel}>{step.label}</span>
            <span className={styles.stepDetail}>{step.detail}</span>
            <span
              className={[styles.stepValue, step.negative ? styles.negative : '']
                .filter(Boolean)
                .join(' ')}
            >
              {step.value}
            </span>
          </m.div>
        ))}
      </div>

      <m.div className={styles.result} variants={resultPop(reduced)}>
        <span className={styles.resultLabel}>{calcMemory.result.label}</span>
        <span className={styles.resultValue}>{calcMemory.result.value}</span>
      </m.div>

      <m.p className={styles.badge} variants={item}>
        {calcMemory.badge}
      </m.p>
    </m.figure>
  )
}
