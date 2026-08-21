import styles from './Eyebrow.module.css'

type Props = { children: string; className?: string }

export function Eyebrow({ children, className }: Props) {
  return <p className={[styles.eyebrow, className].filter(Boolean).join(' ')}>{children}</p>
}
