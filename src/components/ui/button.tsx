'use client'

import * as React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'icon'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
    const variantClass =
      variant === 'outline'
        ? 'border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-subtle)]'
        : variant === 'ghost'
          ? 'bg-transparent text-[var(--text)] hover:bg-[var(--surface-subtle)]'
          : 'bg-[var(--accent)] text-white hover:bg-[var(--accent-dark)]'
    const sizeClass = size === 'icon' ? 'size-9 p-0' : 'min-h-9 px-3'

    return (
      <button
        ref={ref}
        className={`relative inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 ${variantClass} ${sizeClass} ${className}`}
        {...props}
      />
    )
  },
)

Button.displayName = 'Button'
