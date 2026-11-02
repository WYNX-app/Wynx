import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { PasswordField } from './PasswordField'
import { Logo } from '@/ui'
import { useToast } from '@/components/ui/Toast'
import { motion } from 'framer-motion'
import { CheckCircle2, ShieldCheck } from 'lucide-react'

export function ResetPassword() {
  const { push } = useToast()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // O Supabase coloca o token na URL. Ele detecta sozinho e cria uma sessão temporária.
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        push({ tone: 'error', title: 'Link inválido ou expirado', description: 'Solicite um novo link.' })
      }
    }
    checkSession()
  }, [push])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      return push({ tone: 'error', title: 'Senha muito curta', description: 'Mínimo de 6 caracteres.' })
    }
    if (password !== confirm) {
      return push({ tone: 'error', title: 'Senhas não coincidem' })
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      push({ tone: 'error', title: 'Erro ao atualizar', description: error.message })
    } else {
      setSuccess(true)
      push({ tone: 'success', title: 'Senha alterada com sucesso!' })
      setTimeout(() => {
        window.location.href = '/' // Volta para o login
      }, 2000)
    }
  }

  if (success) {
    return (
      <div className="grid min-h-screen place-items-center bg-bg-base dark:bg-[#0A0514] p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-4">
          <CheckCircle2 className="h-20 w-20 text-success mx-auto" />
          <h1 className="text-2xl font-bold">Senha atualizada!</h1>
          <p className="text-text-muted">Redirecionando para o login...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="grid min-h-screen place-items-center bg-bg-base dark:bg-[#0A0514] p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-border-subtle dark:border-white/10 bg-white/80 dark:bg-white/5 p-8 shadow-2xl backdrop-blur-2xl"
      >
        <div className="mb-8 flex items-center gap-3">
          <Logo className="h-10 w-10" />
          <span className="font-display text-2xl font-bold text-text-primary dark:text-white">WYNX</span>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 text-brand-pink mb-2">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-wide">Segurança</span>
          </div>
          <h2 className="text-xl font-semibold text-text-primary dark:text-white">Criar nova senha</h2>
          <p className="mt-1 text-sm text-text-muted dark:text-white/50">Defina uma senha forte para proteger sua conta.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <PasswordField 
            placeholder="Nova senha" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <PasswordField 
            placeholder="Confirme a nova senha" 
            value={confirm} 
            onChange={(e) => setConfirm(e.target.value)} 
            required 
          />
          <button disabled={loading} className="w-full rounded-xl bg-brand-gradient py-3 font-bold text-white shadow-lg transition hover:brightness-110 disabled:opacity-50" type="submit">
            {loading ? 'Salvando...' : 'Salvar nova senha'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}