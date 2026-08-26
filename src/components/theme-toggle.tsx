'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

const options = [
  { value: 'system', label: 'Sistema' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <label className="theme-control">
      <span className="sr-only">Tema da interface</span>
      <select
        aria-label="Tema da interface"
        value={mounted ? theme ?? 'system' : 'system'}
        onChange={(event) => setTheme(event.target.value)}
        disabled={!mounted}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
