import { Check } from 'lucide-react'

import { demoCta } from '../../lib/copy'
import { Eyebrow } from '../ui/Eyebrow'
import { Reveal } from '../ui/Reveal'
import { DemoForm } from './DemoForm'
import styles from './DemoCTA.module.css'

export function DemoCTA() {
  return (
    <section className="section" id="demonstracao" aria-labelledby="demonstracao-title">
      <div className={[styles.grid, 'container'].join(' ')}>
        <Reveal className={styles.pitch}>
          <Eyebrow>{demoCta.eyebrow}</Eyebrow>
          <h2 className={styles.title} id="demonstracao-title">
            {demoCta.title}
          </h2>
          <p className={styles.sub}>{demoCta.sub}</p>

          <ul className={styles.bullets}>
            {demoCta.bullets.map((bullet) => (
              <li className={styles.bullet} key={bullet}>
                <Check className={styles.check} size={17} strokeWidth={2.2} aria-hidden="true" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>

          <p className={styles.note}>{demoCta.note}</p>
        </Reveal>

        <Reveal className={styles.formColumn} delay={0.08}>
          <DemoForm />
        </Reveal>
      </div>
    </section>
  )
}
