import type { InputHTMLAttributes } from 'react'
import clsx from 'clsx'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        'w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-teal-500',
        className,
      )}
      {...props}
    />
  )
}
