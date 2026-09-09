import type { CSSProperties } from 'react'

import logoSrc from '../../assets/logo.png'
import { brand } from '../../lib/copy'
import styles from './BrandLogo.module.css'

type Props = { height?: number }

// Proporção intrínseca do arquivo (463×150 — ver src/assets/logo.png) —
// usada só pra calcular `width`/`height` do <img> e o browser reservar o
// espaço certo no layout antes da imagem carregar (evita CLS; Lighthouse
// aponta isso como "unsized images" sem os atributos).
const INTRINSIC_ASPECT_RATIO = 463 / 150

/**
 * Logo oficial (mark + wordmark, PNG). O traço escuro original (pensado
 * para fundo claro) foi recolorido para dourado — ver
 * `src/assets/logo.png` — pra ficar legível sobre o tema escuro do site
 * sem precisar de fundo atrás.
 */
export function BrandLogo({ height = 22 }: Props) {
  const style = { '--brand-logo-height': `${height}px` } as CSSProperties
  const width = Math.round(height * INTRINSIC_ASPECT_RATIO)

  return (
    <img
      className={styles.img}
      style={style}
      src={logoSrc}
      width={width}
      height={height}
      alt={brand.logoAlt}
    />
  )
}
