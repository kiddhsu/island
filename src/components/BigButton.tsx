import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: 'primary' | 'ghost' | 'soft'
}

/** 對齊 app-btn 切角石板；保留元件以免舊呼叫端壞掉 */
export function BigButton({
  children,
  variant = 'primary',
  className = '',
  ...rest
}: Props) {
  const variantClass =
    variant === 'primary' ? '' : variant === 'soft' ? 'soft' : 'ghost'
  return (
    <button
      type="button"
      className={`app-btn ${variantClass} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  )
}
