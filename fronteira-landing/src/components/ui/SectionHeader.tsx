import { Eyebrow } from './Eyebrow'
import { Reveal } from './Reveal'
import styles from './SectionHeader.module.css'

type Props = {
  eyebrow: string
  title: string
  sub?: string
  /** id do <h2>, usado por aria-labelledby na section. */
  titleId: string
  align?: 'start' | 'center'
}

export function SectionHeader({ eyebrow, title, sub, titleId, align = 'start' }: Props) {
  return (
    <Reveal className={[styles.header, styles[align]].join(' ')}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className={styles.title} id={titleId}>
        {title}
      </h2>
      {sub ? <p className={styles.sub}>{sub}</p> : null}
    </Reveal>
  )
}
