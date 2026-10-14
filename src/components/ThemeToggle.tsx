import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

const STORAGE_KEY = 'wynx-theme'

function applyTheme(theme: 'light' | 'dark') {
  const root = document.documentElement
  if (theme === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
}

export function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY) as 'light' | 'dark' | null
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const theme = saved ?? (prefersDark ? 'dark' : 'light')
  applyTheme(theme)
}

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as 'light' | 'dark' | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(saved ?? (prefersDark ? 'dark' : 'light'))
  }, [])

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem(STORAGE_KEY, next)
    applyTheme(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
      title={theme === 'light' ? 'Modo escuro' : 'Modo claro'}
      className={`group relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border-subtle bg-bg-surface text-text-primary transition hover:bg-bg-soft active:scale-95 ${className}`}
    >
      <Sun
        className={`absolute h-5 w-5 transition-all duration-500 ${
          theme === 'light' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
        }`}
      />
      <Moon
        className={`absolute h-5 w-5 transition-all duration-500 ${
          theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
        }`}
      />
    </button>
  )
}