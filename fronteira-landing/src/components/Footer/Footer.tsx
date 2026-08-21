import { footer } from '../../lib/copy'
import { BrandLogo } from '../ui/BrandLogo'
import styles from './Footer.module.css'



export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={[styles.inner, 'container'].join(' ')}>
        <div className={styles.top}>
          <div className={styles.brandBlock}>
            <span className={styles.brand}>
              <BrandLogo height={20} />
            </span>
            <p className={styles.tagline}>{footer.tagline}</p>
          </div>

          <nav className={styles.links} aria-label={footer.linksLabel}>
            {footer.links.map((link) => (
              <a className={styles.link} href={link.href} key={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <p className={styles.disclaimer}>{footer.disclaimer}</p>
        <p className={styles.copyright}>{footer.copyright}</p>
      </div>
    </footer>
  )
}
