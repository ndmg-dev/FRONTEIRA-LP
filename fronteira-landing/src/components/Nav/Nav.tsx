import { useScroll, useMotionValueEvent } from 'framer-motion'
import { useState } from 'react'

import { nav } from '../../lib/copy'
import { BrandLogo } from '../ui/BrandLogo'
import { Button } from '../ui/Button'
import styles from './Nav.module.css'

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 8)
  })

  return (
    <header className={styles.nav}>
      <div className="container">
        <div className={[styles.pill, scrolled ? styles.scrolled : ''].filter(Boolean).join(' ')}>
          <a className={styles.brand} href="#topo">
            <BrandLogo height={38} />
          </a>

          <nav className={styles.links} aria-label={nav.ariaLabel}>
            {nav.links.map((link) => (
              <a
                key={link.href}
                className={styles.link}
                href={link.href}
                data-label={link.label}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <Button as="a" href="#demonstracao" variant="primary" className={styles.cta}>
            {nav.cta}
          </Button>
        </div>
      </div>
    </header>
  )
}
