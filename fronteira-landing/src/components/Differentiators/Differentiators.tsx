import { m, useReducedMotion } from 'framer-motion'

import { differentiators } from '../../lib/copy'
import { cardHover, fadeUp, useRevealInView } from '../../lib/motion'
import { Eyebrow } from '../ui/Eyebrow'
import { Reveal } from '../ui/Reveal'
import { SectionHeader } from '../ui/SectionHeader'
import { Tag } from '../ui/Tag'
import styles from './Differentiators.module.css'

export function Differentiators() {
  const reduced = useReducedMotion() ?? false
  const { feature, items } = differentiators
  const featureReveal = useRevealInView<HTMLElement>()

  return (
    <section className="section" id="diferenciais" aria-labelledby="diferenciais-title">
      <div className="container">
        <SectionHeader
          eyebrow={differentiators.eyebrow}
          title={differentiators.title}
          titleId="diferenciais-title"
        />

        <div className={styles.grid}>
          <m.article
            ref={featureReveal.ref}
            className={styles.feature}
            variants={fadeUp(reduced)}
            initial="hidden"
            animate={featureReveal.animate}
            {...cardHover(reduced)}
          >
            <div className={styles.featureHead}>
              <Eyebrow>{feature.tag}</Eyebrow>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
            </div>

            <div className={styles.featureAside}>
              <p className={styles.featureBody}>{feature.body}</p>
              <div className={styles.chips}>
                {feature.chips.map((chip) => (
                  <Tag key={chip} highlight={chip === feature.chipHighlight}>
                    {chip}
                  </Tag>
                ))}
              </div>
            </div>
          </m.article>

          {items.map((item, i) => (
            <Reveal as="article" className={styles.card} key={item.tag} delay={i * 0.06}>
              <Eyebrow>{item.tag}</Eyebrow>
              <p className={styles.body}>{item.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
