import { useEffect } from 'react'

import { faq } from '../../lib/copy'
import { SectionHeader } from '../ui/SectionHeader'
import { FaqItem } from './FaqItem'
import styles from './Faq.module.css'

/** Schema.org FAQPage (§SEO) — gerado a partir do mesmo `faq.items` que
 * renderiza o accordion, pra nunca dessincronizar dos dois. Injetado no
 * `<head>` em vez de hardcoded no index.html porque o site é uma SPA sem
 * SSR: o Googlebot executa JS e lê o DOM final, então isso funciona, mas só
 * existe enquanto o componente está montado — cai fora, por exemplo, se um
 * dia a FAQ virar lazy/condicional. */
function useFaqStructuredData() {
  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    })
    document.head.appendChild(script)
    return () => {
      document.head.removeChild(script)
    }
  }, [])
}

export function Faq() {
  useFaqStructuredData()

  return (
    <section className="section" id="faq" aria-labelledby="faq-title">
      <div className="container">
        <SectionHeader eyebrow={faq.eyebrow} title={faq.title} titleId="faq-title" />

        <ul className={styles.accordion}>
          {faq.items.map((item) => (
            <FaqItem item={item} key={item.id} />
          ))}
        </ul>
      </div>
    </section>
  )
}
