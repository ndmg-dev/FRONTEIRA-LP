import { useScroll, useMotionValueEvent } from 'framer-motion'
import { useState } from 'react'

import { brand, nav } from '../../lib/copy'
import { Button } from '../ui/Button'
import { Logo } from '../ui/Logo'
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
            <Logo />
            <span className={styles.brandName}>{brand.name}</span>
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
