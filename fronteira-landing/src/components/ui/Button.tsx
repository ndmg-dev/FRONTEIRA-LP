import { m, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

import { buttonMotion } from '../../lib/motion'
import styles from './Button.module.css'

type Variant = 'primary' | 'ghost'

type CommonProps = {
  variant?: Variant
  children: ReactNode
  className?: string
}

type LinkProps = CommonProps & {
  as: 'a'
  href: string
  onClick?: () => void
}

type ButtonProps = CommonProps & {
  as?: 'button'
  type?: 'button' | 'submit'
  onClick?: () => void
  disabled?: boolean
}

export function Button(props: LinkProps | ButtonProps) {
  const reduced = useReducedMotion() ?? false
  const { variant = 'primary', children, className } = props
  const motionProps = variant === 'primary' ? buttonMotion(reduced) : {}
  const classes = [styles.base, styles[variant], className].filter(Boolean).join(' ')

  if (props.as === 'a') {
    return (
      <m.a className={classes} href={props.href} onClick={props.onClick} {...motionProps}>
        {children}
      </m.a>
    )
  }

  return (
    <m.button
      className={classes}
      type={props.type ?? 'button'}
      onClick={props.onClick}
      disabled={props.disabled}
      {...motionProps}
    >
      {children}
    </m.button>
  )
}
