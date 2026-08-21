import styles from './Tag.module.css'

type Props = { children: string; highlight?: boolean }

export function Tag({ children, highlight = false }: Props) {
  return (
    <span className={[styles.tag, highlight ? styles.highlight : ''].filter(Boolean).join(' ')}>
      {children}
    </span>
  )
}
