import { ReactNode } from 'react'
import { PageId } from './types'

export function Logo({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="48" fill="url(#g)" />
      <path d="M25 30 L32 60 L40 40 L48 60 L55 30" stroke="#0B0B0E" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M60 45 L75 60 M75 45 L60 60" stroke="#0B0B0E" strokeWidth="4" strokeLinecap="round" />
      <circle cx="50" cy="75" r="4" fill="#FFB84D" />
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="#FFD9E8" />
          <stop offset="100%" stopColor="#EBD6FF" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export const NAV: { id: PageId; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '▣' },
  { id: 'produtos', label: 'Produtos', icon: '▤' },
  { id: 'estoque', label: 'Estoque', icon: '☰' },
  { id: 'relatorios', label: 'Relatórios', icon: '▧' },
  { id: 'insights', label: 'Insights da IA', icon: '✦' },
  { id: 'alertas', label: 'Alertas', icon: '!' },
  { id: 'historico', label: 'Histórico', icon: '◷' },
  { id: 'equipe', label: 'Equipe', icon: '☺' },
  { id: 'assinatura', label: 'Assinatura', icon: '◆' },
  { id: 'configuracoes', label: 'Configurações', icon: '⚙' },
  { id: 'perfil', label: 'Perfil', icon: '◉' },
  { id: 'suporte', label: 'Suporte', icon: '?' }
]

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-navy/60">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-navy">{value}</p>
      {hint && <p className="mt-1 text-xs text-navy/50">{hint}</p>}
    </div>
  )
}

export function Modal({
  title,
  children,
  onClose
}: {
  title: string
  children: ReactNode
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-navy/30 p-4">
      <div className="card max-h-[90vh] w-full max-w-xl overflow-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl font-bold">{title}</h3>
          <button className="btn-ghost px-3 py-1" onClick={onClose}>
            Fechar
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
