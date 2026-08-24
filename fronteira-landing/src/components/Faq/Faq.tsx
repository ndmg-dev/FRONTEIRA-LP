import { faq } from '../../lib/copy'
import { SectionHeader } from '../ui/SectionHeader'
import { FaqItem } from './FaqItem'
import styles from './Faq.module.css'

export function Faq() {
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
