import type { CSSProperties } from 'react'

import logoSrc from '../../assets/logo.png'
import { brand } from '../../lib/copy'
import styles from './BrandLogo.module.css'

type Props = { height?: number }

/**
 * Logo oficial (mark + wordmark, PNG). O arquivo é desenhado em tons
 * escuros para fundo claro — a pastilha (`--logo-chip-bg`, tokens.css)
 * garante contraste sobre o tema escuro do site sem recolorir a marca.
 */
export function BrandLogo({ height = 22 }: Props) {
  const style = { '--brand-logo-height': `${height}px` } as CSSProperties

  return (
    <span className={styles.chip} style={style}>
      <img className={styles.img} src={logoSrc} alt={brand.logoAlt} />
    </span>
  )
}
