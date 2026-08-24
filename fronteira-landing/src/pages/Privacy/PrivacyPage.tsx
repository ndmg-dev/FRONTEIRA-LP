import { ArrowLeft } from 'lucide-react'

import { BrandLogo } from '../../components/ui/BrandLogo'
import { footer, privacyPolicy } from '../../lib/copy'
import styles from './PrivacyPage.module.css'

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a className={styles.backLink} href="/">
            <ArrowLeft size={16} aria-hidden="true" />
            {privacyPolicy.backLink}
          </a>
        </div>
      </header>

      <div className={styles.body}>
        <article className={styles.article}>
          <BrandLogo height={28} />

          <h1 className={styles.title}>{privacyPolicy.title}</h1>
          <p className={styles.updatedAt}>{privacyPolicy.updatedAt}</p>

          <p className={styles.intro}>{privacyPolicy.intro}</p>
          <p className={styles.controllerNotice}>{privacyPolicy.controllerNotice}</p>

          {privacyPolicy.sections.map((section) => (
            <section className={styles.section} key={section.heading}>
              <h2 className={styles.heading}>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p className={styles.paragraph} key={paragraph}>
                  {paragraph}
                </p>
              ))}
              {section.bullets ? (
                <ul className={styles.bullets}>
                  {section.bullets.map((bullet) => (
                    <li className={styles.bullet} key={bullet}>
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          <div className={styles.contact}>
            {privacyPolicy.contact.label}{' '}
            <a className={styles.contactEmail} href={`mailto:${privacyPolicy.contact.email}`}>
              {privacyPolicy.contact.email}
            </a>
          </div>
        </article>
      </div>

      <footer className={styles.footer}>{footer.copyright}</footer>
    </div>
  )
}
