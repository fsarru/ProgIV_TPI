import type { ButtonHTMLAttributes } from 'react'

type Variante = 'primary' | 'secondary' | 'warning' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
}

const clases: Record<Variante, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  warning: 'btn-warning',
  danger: 'btn-danger',
}

export function Button({ variante = 'primary', className = '', type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={`${clases[variante]} ${className}`} {...props} />
}
