import { Building2, FileSpreadsheet, ShieldCheck, Calculator } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { techBase } from '../../lib/copy'
import { Reveal } from '../ui/Reveal'
import { SectionHeader } from '../ui/SectionHeader'
import styles from './TechBase.module.css'

const ICONS: LucideIcon[] = [ShieldCheck, Building2, Calculator, FileSpreadsheet]

export function TechBase() {
  return (
    <section className="section" id="base-tecnica" aria-labelledby="base-tecnica-title">
      <div className="container">
        <SectionHeader
          eyebrow={techBase.eyebrow}
          title={techBase.title}
          sub={techBase.sub}
          titleId="base-tecnica-title"
        />

        <ul className={styles.grid}>
          {techBase.items.map((item, i) => {
            const Icon = ICONS[i] ?? ShieldCheck
            return (
              <Reveal as="li" className={styles.item} key={item.title} delay={i * 0.06}>
                <span className={styles.icon} aria-hidden="true">
                  <Icon size={18} strokeWidth={1.75} />
                </span>
                <h3 className={styles.title}>{item.title}</h3>
                <p className={styles.body}>{item.body}</p>
              </Reveal>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
