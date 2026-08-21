import { m, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

import { fadeUp, useRevealInView } from '../../lib/motion'

type Props = {
  children: ReactNode
  className?: string
  /** Atraso extra em segundos, para escalonar irmãos fora de um container. */
  delay?: number
  as?: 'div' | 'li' | 'article' | 'section'
}

/** Wrapper de reveal on-scroll (§7): fadeUp, uma vez, com margem de -40px. */
export function Reveal({ children, className, delay = 0, as = 'div' }: Props) {
  const reduced = useReducedMotion() ?? false
  const { ref, animate } = useRevealInView<HTMLDivElement>()
  // `m[as]` é polimórfico; fixar o tipo em m.div evita a interseção de refs.
  const Component = m[as] as typeof m.div

  return (
    <Component
      ref={ref}
      className={className}
      variants={fadeUp(reduced)}
      initial="hidden"
      animate={animate}
      transition={delay && !reduced ? { delay } : undefined}
    >
      {children}
    </Component>
  )
}
