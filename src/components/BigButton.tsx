import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: 'primary' | 'ghost' | 'soft'
}

export function BigButton({
  children,
  variant = 'primary',
  className = '',
  ...rest
}: Props) {
  return (
    <button
      type="button"
      className={`big-btn big-btn-${variant} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  )
}
