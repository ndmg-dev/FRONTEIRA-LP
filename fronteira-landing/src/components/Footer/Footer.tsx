import { Instagram, Mail, MessageCircle } from 'lucide-react'

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
              <BrandLogo height={32} />
            </span>
            <p className={styles.tagline}>{footer.tagline}</p>

            <div className={styles.contact}>
              <span className={styles.contactLabel}>{footer.contact.label}</span>
              <div className={styles.contactLinks}>
                <a
                  className={styles.contactLink}
                  href={footer.contact.whatsapp.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={footer.contact.whatsapp.label}
                >
                  <MessageCircle size={17} strokeWidth={1.75} aria-hidden="true" />
                </a>
                <a
                  className={styles.contactLink}
                  href={footer.contact.instagram.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={footer.contact.instagram.label}
                >
                  <Instagram size={17} strokeWidth={1.75} aria-hidden="true" />
                </a>
                <a
                  className={styles.contactLink}
                  href={footer.contact.email.href}
                  aria-label={footer.contact.email.label}
                >
                  <Mail size={17} strokeWidth={1.75} aria-hidden="true" />
                </a>
              </div>
            </div>
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
