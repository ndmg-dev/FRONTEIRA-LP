import { problem } from '../../lib/copy'
import { Reveal } from '../ui/Reveal'
import { SectionHeader } from '../ui/SectionHeader'
import styles from './Problem.module.css'

export function Problem() {
  return (
    <section className="section" id="problema" aria-labelledby="problema-title">
      <div className="container">
        <SectionHeader
          eyebrow={problem.eyebrow}
          title={problem.title}
          sub={problem.sub}
          titleId="problema-title"
        />

        <ul className={styles.grid}>
          {problem.items.map((item, i) => (
            <Reveal as="li" className={styles.card} key={item.index} delay={i * 0.08}>
              <span className={styles.index}>{item.index}</span>
              <h3 className={styles.title}>{item.title}</h3>
              <p className={styles.body}>{item.body}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
