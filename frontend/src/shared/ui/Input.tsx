import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  id: string
}

export function Input({ label, id, className = '', ...props }: InputProps) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <input id={id} className={`input ${className}`} {...props} />
    </div>
  )
}
