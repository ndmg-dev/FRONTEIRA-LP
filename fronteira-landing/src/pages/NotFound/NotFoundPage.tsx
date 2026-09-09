import { useEffect } from 'react'

import { BrandLogo } from '../../components/ui/BrandLogo'
import { notFound } from '../../lib/copy'
import styles from './NotFoundPage.module.css'

/**
 * 404 renderizado no client — o nginx sempre devolve 200 + index.html pra
 * qualquer path (SPA sem SSR, `try_files $uri /index.html`), então não dá
 * pra ter um status HTTP 404 de verdade sem um servidor/edge function na
 * frente. O `noindex` injetado aqui evita que buscadores indexem essa
 * página como se fosse conteúdo real, mas não substitui um 404 de
 * protocolo — limitação conhecida de SPA, ver DEPLOY.md.
 */
export default function NotFoundPage() {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.appendChild(meta)
    return () => {
      document.head.removeChild(meta)
    }
  }, [])

  return (
    <div className={styles.page}>
      <BrandLogo height={32} />
      <span className={styles.eyebrow}>{notFound.eyebrow}</span>
      <h1 className={styles.title}>{notFound.title}</h1>
      <p className={styles.body}>{notFound.body}</p>
      <a className={styles.backLink} href="/">
        {notFound.backLink}
      </a>
    </div>
  )
}
