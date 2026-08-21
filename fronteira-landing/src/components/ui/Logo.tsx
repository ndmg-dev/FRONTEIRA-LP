import { brand } from '../../lib/copy'

type Props = { size?: number }

/**
 * Marca placeholder (§10.4): hexágono com traço de conferência, contorno
 * dourado. Substituir quando houver identidade oficial. As cores vêm dos
 * tokens via `currentColor`/vars — nenhum hex aqui.
 */
export function Logo({ size = 26 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label={brand.logoAlt}
      fill="none"
    >
      <path
        d="M16 2.6 27.5 9.3v13.4L16 29.4 4.5 22.7V9.3L16 2.6Z"
        stroke="var(--gold)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M10.6 16.2 14.4 20l7.2-8.2"
        stroke="var(--gold-bright)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
