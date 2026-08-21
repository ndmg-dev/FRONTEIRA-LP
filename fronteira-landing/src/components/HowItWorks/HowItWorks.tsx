import { useState } from 'react'

import { howItWorks } from '../../lib/copy'
import { SectionHeader } from '../ui/SectionHeader'
import { FlowCard } from './FlowCard'
import styles from './HowItWorks.module.css'

export function HowItWorks() {
  const [openId, setOpenId] = useState<string>(howItWorks.flows[0].id)

  return (
    <section className="section" id="como-funciona" aria-labelledby="como-funciona-title">
      <div className="container">
        <SectionHeader
          eyebrow={howItWorks.eyebrow}
          title={howItWorks.title}
          sub={howItWorks.sub}
          titleId="como-funciona-title"
        />

        <ul className={styles.accordion}>
          {howItWorks.flows.map((flow) => (
            <FlowCard
              flow={flow}
              key={flow.id}
              open={openId === flow.id}
              onToggle={() => setOpenId((current) => (current === flow.id ? '' : flow.id))}
            />
          ))}
        </ul>
      </div>
    </section>
  )
}
