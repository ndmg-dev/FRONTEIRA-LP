/**
 * Sistema de motion (§7). Todo variant/transition da landing nasce aqui —
 * componentes não redefinem transições soltas.
 *
 * Toda função recebe `reduced` (o retorno de `useReducedMotion()`): quando true
 * os variants viram identidade, sem `y`/`scale` e sem stagger, e o conteúdo
 * aparece estático.
 */

import { useInView } from 'framer-motion'
import { useRef } from 'react'
import type { Transition, Variants } from 'framer-motion'

export const EASE_OUT = [0.22, 0.61, 0.36, 1] as const

export const baseTransition: Transition = {
  duration: 0.6,
  ease: EASE_OUT,
}

export const softSpring: Transition = {
  type: 'spring',
  stiffness: 240,
  damping: 26,
  mass: 0.7,
}

export const shortSpring: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 30,
}

/** Viewport padrão do reveal on-scroll. */
export const revealViewport = { once: true, margin: '-40px' } as const

/**
 * Dispara o reveal quando o elemento entra na viewport.
 *
 * A app roda dentro de `<LazyMotion features={domAnimation}>` para enxugar o
 * bundle, e esse conjunto de features não inclui a prop `whileInView` — daí o
 * gatilho vir do hook `useInView` e alimentar `animate`. Mesmo `once` e mesma
 * margem de antes.
 */
export function useRevealInView<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const inView = useInView(ref, revealViewport)
  return { ref, animate: inView ? 'show' : 'hidden' } as const
}

/** Reveal padrão das seções: opacity 0→1, y 18→0. */
export const fadeUp = (reduced: boolean): Variants => ({
  hidden: { opacity: 0, y: reduced ? 0 : 18 },
  show: { opacity: 1, y: 0, transition: baseTransition },
})

/** Container de stagger (memória de cálculo, listas de bullets). */
export const staggerContainer = (reduced: boolean): Variants => ({
  hidden: {},
  show: {
    transition: reduced
      ? { staggerChildren: 0, delayChildren: 0 }
      : { staggerChildren: 0.09, delayChildren: 0.1 },
  },
})

/** Filho de um container de stagger. */
export const staggerItem = (reduced: boolean): Variants => fadeUp(reduced)

/** Entrada do resultado do cálculo — último, com leve scale em spring suave. */
export const resultPop = (reduced: boolean): Variants => ({
  hidden: { opacity: 0, y: reduced ? 0 : 10, scale: reduced ? 1 : 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: reduced ? baseTransition : softSpring },
})

/** Hover dos cartões (Flow/Diff). A borda dourada é responsabilidade do CSS. */
export const cardHover = (reduced: boolean) =>
  reduced ? {} : { whileHover: { y: -3, transition: shortSpring } }

/** Hover/tap do botão primary. */
export const buttonMotion = (reduced: boolean) =>
  reduced
    ? {}
    : {
        whileHover: { y: -1, transition: shortSpring },
        whileTap: { scale: 0.98, transition: shortSpring },
      }

export const collapseTransition: Transition = {
  duration: 0.32,
  ease: EASE_OUT,
}

/** Conteúdo de accordion (Como funciona): altura 0↔auto, com fade. */
export const collapseContent = (reduced: boolean): Variants => ({
  collapsed: {
    height: 0,
    opacity: 0,
    transition: reduced ? { duration: 0 } : collapseTransition,
  },
  open: {
    height: 'auto',
    opacity: 1,
    transition: reduced ? { duration: 0 } : collapseTransition,
  },
})

/** Chevron do header do accordion: gira 180° ao abrir. */
export const chevronRotate = (reduced: boolean): Variants => ({
  collapsed: { rotate: 0 },
  open: { rotate: reduced ? 0 : 180, transition: shortSpring },
})

/**
 * Indicador das pills de volume (§A.2). `domAnimation` (o feature set do
 * `LazyMotion` desta app) não inclui layout animations — `layoutId`/`layout`
 * não funcionam — e trocar para `domMax` incharia o bundle. O indicador
 * desliza por transform manual: 4 pills de largura igual, indicador com
 * `width: 25%` e `x = index * 100%` do próprio container do indicador.
 */
export const pillIndicatorTransition: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 34,
}

export const pillIndicatorX = (index: number, reduced: boolean) => ({
  x: `${index * 100}%`,
  transition: reduced ? { duration: 0 } : pillIndicatorTransition,
})

/** Shake de erro nos campos do form (§A.3) — off sob reduced-motion. */
export const shakeX = (reduced: boolean): Variants => ({
  idle: { x: 0 },
  shake: {
    x: reduced ? 0 : [0, -4, 4, -2, 0],
    transition: { duration: 0.32, ease: EASE_OUT },
  },
})

/**
 * Botão do formulário como máquina de estados ocioso→enviando→enviado (§A.4).
 * `idleWidth` é medido em px pelo componente (largura natural do rótulo) —
 * animar `width` entre dois números é motion básico, não depende de
 * layout/layoutId, então funciona normalmente em `domAnimation`.
 */
export const submitButtonMachine = (reduced: boolean, idleWidth: number): Variants => ({
  idle: {
    width: idleWidth,
    borderRadius: 10,
    transition: reduced ? { duration: 0 } : shortSpring,
  },
  loading: {
    width: 46,
    borderRadius: 999,
    transition: reduced ? { duration: 0 } : shortSpring,
  },
  success: {
    width: 46,
    borderRadius: 999,
    transition: reduced ? { duration: 0 } : shortSpring,
  },
})

/** Label do botão: some ao sair do estado ocioso. */
export const submitLabelFade = (reduced: boolean): Variants => ({
  idle: { opacity: 1, transition: reduced ? { duration: 0 } : { duration: 0.12 } },
  loading: { opacity: 0, transition: reduced ? { duration: 0 } : { duration: 0.1 } },
  success: { opacity: 0, transition: { duration: 0 } },
})

/** Check SVG do botão: traço se desenha via pathLength (animável em domAnimation). */
export const checkDraw = (reduced: boolean): Variants => ({
  hidden: { pathLength: 0, opacity: 0 },
  show: {
    pathLength: 1,
    opacity: 1,
    transition: reduced ? { duration: 0 } : { duration: 0.4, ease: EASE_OUT },
  },
})
