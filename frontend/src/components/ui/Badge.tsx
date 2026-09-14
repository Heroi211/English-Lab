import type { HTMLAttributes } from 'react'
import clsx from 'clsx'

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={clsx(
        'inline-flex rounded border border-teal-900 bg-teal-950/50 px-2 py-0.5 font-mono text-xs text-teal-300',
        className,
      )}
      {...props}
    />
  )
}
