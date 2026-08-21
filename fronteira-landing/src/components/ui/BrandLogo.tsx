import type { CSSProperties } from 'react'

import logoSrc from '../../assets/logo.png'
import { brand } from '../../lib/copy'
import styles from './BrandLogo.module.css'

type Props = { height?: number }

/**
 * Logo oficial (mark + wordmark, PNG). O traço escuro original (pensado
 * para fundo claro) foi recolorido para dourado — ver
 * `src/assets/logo.png` — pra ficar legível sobre o tema escuro do site
 * sem precisar de fundo atrás.
 */
export function BrandLogo({ height = 22 }: Props) {
  const style = { '--brand-logo-height': `${height}px` } as CSSProperties

  return <img className={styles.img} style={style} src={logoSrc} alt={brand.logoAlt} />
}
