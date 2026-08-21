import { hero } from '../../lib/copy'
import { Button } from '../ui/Button'
import { Eyebrow } from '../ui/Eyebrow'
import { CalcMemory } from './CalcMemory'
import styles from './Hero.module.css'

export function Hero() {
  return (
    <section className={styles.hero} id="topo" aria-labelledby="hero-title">
      <div className={[styles.grid, 'container'].join(' ')}>
        {/*
          A coluna de texto entra estática de propósito: é o LCP da página e
          qualquer fade de entrada atrasa a marca. A cascata do hero vive no
          CalcMemory, o elemento-assinatura (§6).
        */}
        <div className={styles.copy}>
          <Eyebrow>{hero.eyebrow}</Eyebrow>

          <h1 className={styles.title} id="hero-title">
            {hero.headline.before}
            <span className={styles.highlight}>{hero.headline.highlight}</span>
            {hero.headline.after}
          </h1>

          <p className={styles.lead}>{hero.lead}</p>

          <div className={styles.actions}>
            <Button as="a" href="#demonstracao" variant="primary">
              {hero.ctaPrimary}
            </Button>
            <Button as="a" href="#como-funciona" variant="ghost">
              {hero.ctaGhost}
            </Button>
          </div>

          <dl className={styles.stats}>
            {hero.stats.map((stat) => (
              <div className={styles.stat} key={stat.value}>
                <dt className={styles.statValue}>{stat.value}</dt>
                <dd className={styles.statLabel}>{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className={styles.aside}>
          <CalcMemory />
        </div>
      </div>
    </section>
  )
}
