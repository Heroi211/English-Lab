import type { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'bg-teal-500 text-zinc-950 hover:bg-teal-400',
        variant === 'secondary' && 'border border-zinc-700 bg-zinc-900 text-zinc-100 hover:border-teal-700',
        variant === 'ghost' && 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100',
        className,
      )}
      {...props}
    />
  )
}
