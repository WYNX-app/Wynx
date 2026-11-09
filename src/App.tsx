import { ResetPassword } from './components/ResetPassword'
import { Clock, Truck } from 'lucide-react'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import Papa from 'papaparse'
import { Upload, Download } from 'lucide-react'
import { PasswordField } from './components/PasswordField'
import { Scanner } from './components/Scanner'
import { FormEvent, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, LayoutDashboard, Package, Layers, History as HistoryIcon,
  FileText, Users, Settings as SettingsIcon, LogOut, Search, Sparkles, Plus, Minus, Scan,
  CreditCard, QrCode, CheckCircle2, ShieldCheck, Lock, Crown, Building2, Ban, RefreshCcw, LogIn, Store as StoreIcon,
  ShoppingCart, Wallet, Edit3, Bell // <-- ÍCONES DO PDV E CAIXA
} from 'lucide-react'
import { supabase } from './lib/supabase/client'
import * as db from './lib/supabase/data'
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'
import {
  categoryShare, formatDate, formatMoney, labelMovement, salesByDay, topProducts
} from './engine'
import { useSession, useStore } from './store'
import { MovementType, PLANS, PageId, PlanId, Product, Role, SEGMENTS } from './types'
import { Logo } from './ui'
import Aurora from './components/ui/Aurora'
import ThemeToggle from './components/ThemeToggle'
// Importe o GlassIcons da pasta ui
import GlassIcons from './components/ui/GlassIcons'
// Adicione esta linha no topo, junto com os outros imports:
import Particles from './components/ui/Particles' 

// IMPORTAÇÃO DAS NOVAS TELAS
import { PDVScreen } from './features/sales/PDVScreen'
import { CashRegister } from './features/sales/CashRegister'
import { SalesHistory } from './features/sales/SalesHistory'

// IMPORTAÇÃO DO REACT BITS
import SpecularButton from './components/ui/SpecularButton'

const COLORS = ['#1D6FBE', '#06B6D4', '#FFB84D', '#CDA8FF', '#FFABD0', '#1A3A6B']

const DOCK_ITEMS = [
  { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
  { id: 'pdv', label: 'Frente de Caixa', icon: ShoppingCart },
  { id: 'caixa', label: 'Caixa', icon: Wallet },
  { id: 'produtos', label: 'Produtos', icon: Package },
  { id: 'estoque', label: 'Estoque', icon: Layers },
  { id: 'lojas', label: 'Lojas', icon: StoreIcon },
  { id: 'fornecedores', label: 'Fornecedores', icon: Truck },
  { id: 'relatorios', label: 'Relatórios', icon: FileText },
  { id: 'historico', label: 'Histórico', icon: HistoryIcon },
  { id: 'equipe', label: 'Equipe', icon: Users },
  { id: 'configuracoes', label: 'Ajustes', icon: SettingsIcon },
] as const

export default function App() {
  const { ready, state } = useStore()
  const [splash, setSplash] = useState(true)

  const isResetPasswordRoute = window.location.pathname === '/reset-password'

  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 1800)
    return () => clearTimeout(t)
  }, [])

  if (!ready || splash) return <Splash />
  if (isResetPasswordRoute) return <ResetPassword />
  if (!state.sessionUserId) return <Auth />
  
  return <Shell />
}

/* ============================================================
   MODAL ESPACIAL
   ============================================================ */
function SpatialModal({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) {
  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} 
      />
      <motion.div 
        initial={{ opacity: 0, y: 100, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 100, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full sm:max-w-2xl max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-border-subtle dark:border-white/10 bg-white dark:bg-[#16142E] shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-border-subtle dark:border-white/10 px-6 py-4 shrink-0">
          <h2 className="text-lg font-bold text-text-primary dark:text-white">{title}</h2>
          <button onClick={onClose} className="rounded-full p-2 text-text-muted hover:bg-black/5 dark:hover:bg-white/10 transition">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
          {children}
        </div>
      </motion.div>
    </div>,
    document.body
  )
}

/* ============================================================
   SPLASH
   ============================================================ */
function Splash() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-bg-base dark:bg-[#0A0514] px-6">
      <div className="absolute inset-0 opacity-40 dark:opacity-20 pointer-events-none"><Aurora variant="splash" /></div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} transition={{ duration: 1.2 }}
        className="relative z-10 text-center"
      >
        <Logo className="mx-auto h-28 w-28 md:h-48 md:w-48 drop-shadow-[0_0_30px_rgba(196,181,253,0.6)]" />
        <h1 className="mt-8 font-display text-6xl font-black tracking-tighter sm:text-8xl">
          <span className="wynx-title-gradient">WYNX</span>
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-xs sm:text-sm font-medium tracking-widest text-text-secondary dark:text-white/50 uppercase">
          O sistema operacional do seu estoque
        </p>
      </motion.div>
    </div>
  )
}

/* ============================================================
   AUTH
   ============================================================ */
function Auth() {
  const { login, register, recover, error, setError } = useStore()
  const [mode, setMode] = useState<'login' | 'cadastro' | 'recuperar'>('login')
  const [isInvited, setIsInvited] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '', segment: SEGMENTS[0], city: '', stateUf: 'PI' })
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSuccessMsg(null)
    
    if (mode === 'login') {
      await login(form.email, form.password)
    } else if (mode === 'recuperar') {
      const ok = await recover(form.email, form.password)
      if (ok) {
        setSuccessMsg('Enviamos um link de recuperação para o seu e-mail. Verifique a caixa de entrada e o spam.')
        setMode('login')
      }
    } else {
      await register({ ...form })
    }
  }

  const switchMode = (newMode: 'login' | 'cadastro' | 'recuperar') => {
    setMode(newMode)
    setError(null)
    setSuccessMsg(null)
  }

  return (
    <div className="grid min-h-screen place-items-center bg-bg-base dark:bg-[#0A0514] p-4 sm:p-6 relative">
      
      {/* SUBSTITUÍDO PELO PARTICLES DO REACT BITS */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <Particles
          particleColors={['#06B6D4', '#C4B5FD', '#F9A8D4']}
          particleCount={150}
          particleSpread={12}
          speed={0.08}
          particleBaseSize={80}
          glow={0.6}
          twinkle={0.5}
          moveParticlesOnHover
          hoverEffect="parallax"
        />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-border-subtle dark:border-white/10 bg-white/80 dark:bg-[#16142E]/80 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl"
      >
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="h-10 w-10" />
            <span className="font-display text-2xl font-bold text-text-primary dark:text-white">WYNX</span>
          </div>
          <ThemeToggle />
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-text-primary dark:text-white">
            {mode === 'login' && 'Bem-vindo de volta.'}
            {mode === 'cadastro' && 'Comece agora.'}
            {mode === 'recuperar' && 'Recuperar senha.'}
          </h2>
          <p className="mt-1 text-sm text-text-muted dark:text-white/50">
            {mode === 'login' && 'O estoque não vai se controlar sozinho.'}
            {mode === 'cadastro' && 'Crie sua conta ou aceite um convite.'}
            {mode === 'recuperar' && 'Informe seu e-mail para enviarmos o link.'}
          </p>
        </div>

        {mode !== 'recuperar' ? (
          <div className="mb-6 flex rounded-full bg-black/5 dark:bg-black/40 p-1">
            {(['login', 'cadastro'] as const).map((m) => (
              <button key={m} type="button" className={`flex-1 rounded-full py-2 text-sm font-medium transition ${mode === m ? 'bg-white dark:bg-white text-black shadow-sm' : 'text-text-muted dark:text-white/60 hover:text-text-primary dark:hover:text-white'}`} onClick={() => switchMode(m)}>
                {m === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>
        ) : (
          <button type="button" onClick={() => switchMode('login')} className="mb-6 flex items-center gap-2 text-sm font-semibold text-brand-violet hover:underline transition">
            &larr; Voltar para o login
          </button>
        )}

        <form className="space-y-4" onSubmit={submit}>
          {mode === 'cadastro' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
              <input className="w-full rounded-xl border border-border-subtle dark:border-white/10 bg-black/5 dark:bg-black/20 p-3 text-text-primary dark:text-white outline-none focus:border-brand-violet" placeholder="Seu nome completo" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <div className="flex items-center gap-2 py-2">
                <input type="checkbox" id="isInvited" checked={isInvited} onChange={(e) => setIsInvited(e.target.checked)} className="h-4 w-4 rounded border-border-subtle text-brand-violet focus:ring-brand-violet" />
                <label htmlFor="isInvited" className="text-sm font-medium text-text-secondary dark:text-white/70 cursor-pointer">Fui convidado por uma empresa</label>
              </div>
              {!isInvited && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <input className="w-full rounded-xl border border-border-subtle dark:border-white/10 bg-black/5 dark:bg-black/20 p-3 text-text-primary dark:text-white outline-none focus:border-brand-violet" placeholder="Nome da sua empresa" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
                </motion.div>
              )}
            </motion.div>
          )}

          <input className="w-full rounded-xl border border-border-subtle dark:border-white/10 bg-black/5 dark:bg-black/20 p-3 text-text-primary dark:text-white outline-none focus:border-brand-violet" type="email" placeholder="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          
          {mode !== 'recuperar' && (
            <PasswordField className="w-full rounded-xl border border-border-subtle dark:border-white/10 bg-black/5 dark:bg-black/20 p-3 text-text-primary dark:text-white outline-none focus:border-brand-violet" placeholder="Senha" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          )}

          {mode === 'login' && (
            <div className="flex justify-end">
              <button type="button" onClick={() => switchMode('recuperar')} className="text-xs font-semibold text-text-muted hover:text-brand-pink transition">Esqueci minha senha</button>
            </div>
          )}

          {error && <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger">{error}</div>}
          {successMsg && <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-2 text-sm text-success">{successMsg}</div>}

          <button className="mt-2 w-full rounded-xl bg-brand-gradient py-3 font-bold text-white shadow-[0_0_20px_rgba(196,181,253,0.4)] transition hover:brightness-110" type="submit">
            {mode === 'login' ? 'Acessar Sistema' : mode === 'cadastro' ? (isInvited ? 'Aceitar Convite' : 'Iniciar Jornada') : 'Enviar link de recuperação'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

/* ============================================================
   SHELL (Layout Principal)
   ============================================================ */
function Shell() {
  const { user, company, notifications } = useSession()
  const { logout, isImpersonating, stopImpersonation } = useStore()
  const [page, setPage] = useState<PageId>('dashboard')
  const [q, setQ] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  
  const [showTour, setShowTour] = useState(false)
  const [tourStep, setTourStep] = useState(0)
  
  const unread = notifications.filter((n) => !n.read).length

  useEffect(() => {
    if (!localStorage.getItem('wynx_onboarding_done')) {
      setTimeout(() => setShowTour(true), 1000)
    }
  }, [])

  useEffect(() => {
    if (showTour) {
      if (tourStep === 3) setPage('produtos')
      else if (tourStep === 4) setPage('pdv')
      else if (tourStep === 5) setPage('estoque')
      else setPage('dashboard')
    }
  }, [tourStep, showTour])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault(); setSearchOpen(true)
      }
      if (e.key === 'Escape') { setSearchOpen(false); setMenuOpen(false) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const isSuperAdminNoCompany = user?.isSuperAdmin && !company;
  const visibleDockItems = isSuperAdminNoCompany ? [] : DOCK_ITEMS;

  const glassClasses = `
    bg-white/60 dark:bg-[#16142E]/70 
    backdrop-blur-2xl backdrop-saturate-150
    border border-white/40 dark:border-white/10 
    shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.6)] 
    dark:shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]
  `

  return (
    <div className="relative min-h-screen bg-bg-base dark:bg-[#0A0514] text-text-primary dark:text-white selection:bg-brand-pink/30 overflow-hidden transition-colors duration-500">
      
      {isImpersonating && (
        <div className="fixed top-0 inset-x-0 z-[9999] flex items-center justify-between bg-accent px-4 py-2 text-black shadow-lg">
          <div className="flex items-center gap-2 text-sm font-bold">
            <Crown className="h-4 w-4" />
            Modo Visualização: Você está logado como {user?.name}
          </div>
          <button onClick={() => stopImpersonation()} className="rounded-lg bg-black/10 px-4 py-1.5 text-xs font-bold hover:bg-black/20 transition">
            Sair e Voltar para Admin
          </button>
        </div>
      )}

      <div className="fixed inset-0 z-0 pointer-events-none opacity-40 dark:opacity-40 transition-opacity">
        <Aurora variant="login" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-base dark:from-[#0A0514] via-transparent to-transparent" />
      </div>

      <header className={`fixed inset-x-0 z-40 flex items-center justify-between px-4 sm:px-6 py-4 sm:py-6 pointer-events-none transition-all duration-300 ${isImpersonating ? 'top-10' : 'top-0'}`}>
        
        <div 
          className={`flex items-center gap-3 pointer-events-auto cursor-pointer px-4 py-2 rounded-2xl transition-transform hover:scale-[1.02] ${glassClasses}`}
          onClick={() => setPage(isSuperAdminNoCompany ? 'super-admin' as any : 'dashboard')}
        >
          <Logo className="h-6 w-6 sm:h-8 sm:w-8 shrink-0 drop-shadow-md" />
          <div className="min-w-0">
            <p className="font-display text-sm sm:text-base font-bold leading-none">{user?.name || 'Carregando...'}</p>
            <p className="text-[10px] sm:text-xs text-text-muted dark:text-white/70 truncate max-w-[80px] sm:max-w-[150px]">
              {isSuperAdminNoCompany ? 'Master Control' : company?.name}
            </p>
          </div>
        </div>

        <div className={`flex items-center gap-2 pointer-events-auto p-1.5 rounded-2xl ${glassClasses}`}>
          <button onClick={() => setSearchOpen(true)} className="flex items-center gap-2 rounded-xl px-2 sm:px-3 py-1.5 text-sm text-text-muted dark:text-white/70 transition hover:bg-black/5 dark:hover:bg-white/10">
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Buscar...</span>
          </button>
          <div className="w-px h-6 bg-black/10 dark:bg-white/10"></div>
          <ThemeToggle />
          <button onClick={() => setMenuOpen(!menuOpen)} className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 overflow-hidden rounded-xl bg-brand-violet/60 flex items-center justify-center text-sm font-bold text-white hover:scale-105 transition border border-white/20 dark:border-white/10 shadow-inner">
            {user?.name.charAt(0)}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`fixed right-4 sm:right-6 z-[1000] w-56 rounded-2xl p-2 ${glassClasses} ${isImpersonating ? 'top-28' : 'top-20 sm:top-24'}`}>
            {user?.isSuperAdmin && (
              <>
                <button onClick={() => { setPage('super-admin' as any); setMenuOpen(false) }} className="w-full text-left flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-accent hover:bg-black/5 dark:hover:bg-white/10 transition font-bold">
                  <Crown className="h-4 w-4" /> Master Control
                </button>
                <div className="my-1 h-px bg-black/10 dark:bg-white/10" />
              </>
            )}
            {!isSuperAdminNoCompany && (
              <>
                <button onClick={() => { setPage('perfil'); setMenuOpen(false) }} className="w-full text-left flex items-center gap-3 rounded-xl px-4 py-3 text-sm hover:bg-black/5 dark:hover:bg-white/10 transition"><Users className="h-4 w-4" /> Meu Perfil</button>
                <button onClick={() => { setPage('assinatura'); setMenuOpen(false) }} className="w-full text-left flex items-center gap-3 rounded-xl px-4 py-3 text-sm hover:bg-black/5 dark:hover:bg-white/10 transition"><Sparkles className="h-4 w-4" /> Assinatura</button>
              </>
            )}
            <div className="my-1 h-px bg-black/10 dark:bg-white/10" />
            <button onClick={logout} className="w-full text-left flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-danger hover:bg-danger/10 transition"><LogOut className="h-4 w-4" /> Sair do sistema</button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className={`relative z-10 mx-auto max-w-7xl px-4 pb-40 sm:px-6 h-screen overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden transition-all duration-300 ${isImpersonating ? 'pt-40 sm:pt-44' : 'pt-32 sm:pt-36'}`}>
        <AnimatePresence mode="wait">
          <motion.div key={page} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="w-full h-full">
            {isSuperAdminNoCompany ? (
              <SuperAdmin />
            ) : (
              <>
                {page === 'dashboard' && <Dashboard q={q} go={setPage} />}
                
                {/* TELAS DE VENDAS E CAIXA */}
                {page === 'pdv' && <PDVScreen />}
                {page === 'caixa' && <CashRegister />}
                {page === 'historico-vendas' && <SalesHistory />}
                
                {page === 'produtos' && <Products q={q} />}
                {page === 'fornecedores' && <Suppliers q={q} />}
                {page === 'estoque' && <Stock q={q} />}
                {page === 'relatorios' && <Reports q={q} />}
                {page === 'historico' && <History q={q} />}
                {page === 'equipe' && <Team q={q} />}
                {page === 'configuracoes' && <Settings />}
                {page === 'perfil' && <Profile />}
                {page === 'assinatura' && <Billing />}
                {page === 'insights' && <Insights q={q} />}
                {page === 'alertas' && <Alerts q={q} />}
                {page === 'lojas' && <Stores q={q} />}
                {(page as string) === 'super-admin' && <SuperAdmin />}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <div className="fixed bottom-4 sm:bottom-6 inset-x-0 z-[999] flex justify-center pointer-events-none px-4">
<motion.nav 
  id="tour-dock"
  initial={{ y: 50, opacity: 0 }} 
  animate={{ y: 0, opacity: 1 }} 
  className="pointer-events-auto flex w-full max-w-lg sm:w-max items-center justify-between sm:justify-start gap-1 sm:gap-2 rounded-[32px] p-2 bg-[#16142E]/70 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(249,168,212,0.3)] overflow-x-auto [&::-webkit-scrollbar]:hidden"
>
          {visibleDockItems.map((item) => {
            const Icon = item.icon
            const isActive = page === item.id
            return (
              <button key={item.id} onClick={() => setPage(item.id)} className={`group relative flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 flex-col items-center justify-center rounded-[20px] transition-all duration-300 ${isActive ? 'bg-white/70 dark:bg-white/20 text-brand-pink shadow-[0_2px_8px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.8)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] border border-white/60 dark:border-white/20' : 'text-text-muted dark:text-white/60 hover:bg-white/40 dark:hover:bg-white/10 hover:text-text-primary dark:hover:text-white'}`}>
                <Icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-md' : 'group-hover:scale-110'}`} />
                <span className="absolute -top-10 scale-0 rounded-lg bg-black/80 dark:bg-white/90 px-2.5 py-1.5 text-[10px] font-bold text-white dark:text-black opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100 whitespace-nowrap shadow-lg backdrop-blur-md">{item.label}</span>
                {item.id === 'estoque' && unread > 0 && <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-danger ring-2 ring-white/50 dark:ring-black/50"></span>}
                {isActive && <motion.div layoutId="dock-indicator" className="absolute -bottom-1 h-1 w-5 rounded-full bg-brand-pink shadow-[0_0_10px_rgba(249,168,212,0.8)]" />}
              </button>
            )
          })}
        </motion.nav>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] flex items-start justify-center bg-black/40 pt-32 px-4 backdrop-blur-md" onClick={() => setSearchOpen(false)}>
            <motion.div initial={{ scale: 0.95, y: -20 }} animate={{ scale: 1, y: 0 }} className={`w-full max-w-xl overflow-hidden rounded-[24px] ${glassClasses}`} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center border-b border-white/20 dark:border-white/10 px-4">
                <Search className="h-5 w-5 text-text-muted dark:text-white/40" />
                <input autoFocus className="w-full bg-transparent p-4 text-text-primary dark:text-white placeholder-text-muted dark:placeholder-white/30 outline-none" placeholder="O que você procura?" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
              <div className="p-4 text-center text-sm text-text-muted dark:text-white/40">Pressione <kbd className="rounded bg-black/10 dark:bg-white/10 px-1">Esc</kbd> para fechar.</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showTour && (
        <TourGuide 
          onClose={() => setShowTour(false)} 
          onStepChange={setTourStep} 
        />
      )}
    </div>
  )
}

/* ============================================================
   DASHBOARD
   ============================================================ */
function Dashboard({ q, go }: { q: string; go: (p: PageId) => void }) {
  const { state } = useStore()
  const { kpis: k, insights } = useSession()
  const line = salesByDay(state)
  const pie = categoryShare(state)
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } } }

  // Configuração dos Ícones de Acesso Rápido
  const quickActions = [
    { id: 'pdv', label: 'Frente de Caixa', icon: <ShoppingCart size={24} />, color: 'pink' },
    { id: 'caixa', label: 'Caixa', icon: <Wallet size={24} />, color: 'blue' },
    { id: 'produtos', label: 'Produtos', icon: <Package size={24} />, color: 'purple' },
    { id: 'estoque', label: 'Estoque', icon: <Layers size={24} />, color: 'green' },
    { id: 'relatorios', label: 'Relatórios', icon: <FileText size={24} />, color: 'orange' },
    { id: 'equipe', label: 'Equipe', icon: <Users size={24} />, color: 'indigo' },
  ]

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="space-y-4 sm:space-y-6">
      
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-display font-bold">A máquina tá <span className="text-brand-pink">a todo vapor.</span></h1>
        <p className="text-sm text-text-muted dark:text-white/50">Telemetria do seu negócio hoje.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div id="tour-kpi" variants={item} className="md:col-span-2 relative overflow-hidden rounded-3xl border border-border-subtle dark:border-white/10 bg-bg-surface/50 dark:bg-white/5 p-5 sm:p-6 backdrop-blur-md transition-colors">
          <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10"><Package className="h-32 w-32" /></div>
          <h3 className="text-sm font-medium text-text-muted dark:text-white/50">Capital em Estoque</h3>
          <p className="mt-2 text-4xl sm:text-5xl font-black">{formatMoney(k.value)}</p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1 text-success"><Plus className="h-4 w-4"/> {k.units} unidades</span>
            <span className="flex items-center gap-1 text-warning"><Minus className="h-4 w-4"/> {k.low} em falta</span>
          </div>
        </motion.div>

        <motion.div variants={item} className="rounded-3xl border border-border-subtle dark:border-white/10 bg-bg-surface/50 dark:bg-white/5 p-5 sm:p-6 backdrop-blur-md transition-colors">
          <h3 className="text-sm font-medium text-text-muted dark:text-white/50">Receita de Vendas</h3>
          <p className="mt-2 text-3xl sm:text-4xl font-black">{formatMoney(k.revenue)}</p>
          <p className="mt-2 text-xs text-brand-cyan">{k.sales} transações</p>
        </motion.div>

        <motion.div variants={item} className="md:col-span-2 rounded-3xl border border-border-subtle dark:border-white/10 bg-bg-surface/50 dark:bg-white/5 p-5 sm:p-6 backdrop-blur-md">
          <h3 className="mb-4 sm:mb-6 text-sm font-medium text-text-muted dark:text-white/50">Fluxo de Vendas (14 dias)</h3>
          <div className="h-40 sm:h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={line}>
                <Line type="monotone" dataKey="qty" stroke="#67E8F9" strokeWidth={3} dot={{ fill: 'currentColor', stroke: '#67E8F9', strokeWidth: 2, r: 3 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)', borderRadius: '12px', color: 'var(--color-text-primary)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={item} className="rounded-3xl border border-border-subtle dark:border-white/10 bg-bg-surface/50 dark:bg-white/5 p-5 sm:p-6 backdrop-blur-md">
          <h3 className="mb-2 text-sm font-medium text-text-muted dark:text-white/50">Mix de Produtos</h3>
          <div className="h-40 sm:h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pie} dataKey="qty" nameKey="name" innerRadius={35} outerRadius={65} stroke="none">
                  {pie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)', borderRadius: '12px', color: 'var(--color-text-primary)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* NOVA SESSÃO: GLASS ICONS PARA ACESSO RÁPIDO */}
      <motion.div variants={item} className="py-6 relative flex flex-col items-center justify-center border-t border-border-subtle dark:border-white/10 mt-6">
        <h2 className="text-xl font-display font-bold mb-8 text-text-primary dark:text-white">Acesso Rápido</h2>
        
        <div className="w-full max-w-4xl flex justify-center">
          <GlassIcons
            items={quickActions.map(action => ({
              id: action.id,
              label: action.label,
              icon: action.icon,
              color: action.color,
              onClick: () => go(action.id as PageId)
            }))}
            size={72}           // Tamanho do ícone
            gap={40}            // Espaçamento
            columns={6}         // 6 colunas no desktop
            roundness={0.5}     // Formato do vidro
            refraction={0.9}    // Força da distorção
            bevel={0.6}         
            frost={0.15}        // Desfoque
            shine={1}           // Brilho da borda
            tint="#F9A8D4"      // Tinta Rosa da WYNX
            tintOpacity={0.1}   // Transparência da tinta
            iconColor="#ffffff" // Cor do ícone
            plate="tilt"        // Fundo inclinado atrás do vidro
            tilt={15}           // Inclinação do fundo
            spread={0.6}        
            hover="lift"        // Efeito ao passar o mouse (levanta)
            parallax={1}        // Efeito de mover com o mouse
            labels="hover"      // Mostra o texto apenas no hover
            intro               // Animação de entrada
            theme="dark"
          />
        </div>
      </motion.div>

      {/* CARD DA IA */}
      <motion.div variants={item} className="rounded-3xl border border-brand-violet/30 bg-brand-violet/10 p-5 sm:p-6 backdrop-blur-md flex items-center justify-between group cursor-pointer" onClick={() => go('insights')}>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-violet/20"><Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-brand-violet" /></div>
          <div>
            <h3 className="text-sm sm:text-base font-bold">O que a IA diz sobre seu estoque?</h3>
            <p className="text-xs sm:text-sm text-text-muted dark:text-white/60 truncate max-w-[200px] sm:max-w-none">{insights[0]?.title || 'Análise concluída.'}</p>
          </div>
        </div>
        <div className="hidden sm:block text-brand-violet group-hover:translate-x-2 transition-transform">→</div>
      </motion.div>
    </motion.div>
  )
}

function normalize(s: string) { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') }
function matches(p: Product, q: string) {
  const s = normalize(q.trim()); if (!s) return true
  return normalize([p.name, p.sku, p.category, p.color, p.size, p.barcode].join(' ')).includes(s)
}

/* ============================================================
   PRODUTOS
   ============================================================ */
function Products({ q }: { q: string }) {
  const { saveProduct, removeProduct, error } = useStore()
  const { products, categories, user, company, team, kpis } = useSession() 
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const list = products.filter((p) => matches(p, q))

  const importFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!user || !company) return alert('Sessão inválida.')
    const fileExtension = file.name.split('.').pop()?.toLowerCase()

    try {
      let rows: any[] = []
      if (fileExtension === 'csv') {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: async (results) => {
            rows = results.data as any[]
            await processImport(rows)
          }
        })
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        const arrayBuffer = await file.arrayBuffer()
        const workbook = new ExcelJS.Workbook()
        await workbook.xlsx.load(arrayBuffer)
        const worksheet = workbook.worksheets[0]
        let headers: string[] = []
        let headerRowIndex = 0
        worksheet.eachRow((row, rowNumber) => {
          const firstCell = String(row.getCell(1).value || '')
          if (firstCell.includes('Produto') || firstCell.toLowerCase() === 'nome') {
            headerRowIndex = rowNumber
            row.eachCell((cell, colNumber) => {
              headers[colNumber] = String(cell.value || '')
            })
            return false
          }
        })
        if (headerRowIndex === 0) return alert('Cabeçalho não encontrado.')
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber > headerRowIndex) {
            const rowData: any = {}
            let isEmpty = true
            row.eachCell((cell, colNumber) => {
              const header = headers[colNumber]
              if (header && cell.value !== null && cell.value !== undefined) {
                rowData[header] = cell.value
                isEmpty = false
              }
            })
            if (!isEmpty) rows.push(rowData)
          }
        })
        await processImport(rows)
      } else {
        alert('Formato inválido. Envie um arquivo .csv, .xlsx ou .xls.')
      }
    } catch (err: any) {
      alert('Erro ao ler o arquivo: ' + err.message)
    }

    async function processImport(data: any[]) {
      const formatted = data.map(r => ({
        name: r.Nome || r.name || r.Produto || r.produto,
        sku: r.SKU || r.sku,
        category: r.Categoria || r.category,
        price: parseFloat(String(r['Preço'] || r.price || 0).replace(',', '.')),
        cost: parseFloat(String(r.Custo || r.cost || 0).replace(',', '.')),
        qty: parseInt(String(r.Estoque || r.qty || 0), 10),
        minQty: parseInt(String(r['Mínimo'] || r.minQty || 0), 10),
        barcode: String(r['Código_Barras'] || r.barcode || '')
      })).filter(p => p.name) 

      if (formatted.length === 0) return alert('Nenhum produto válido encontrado.')
      if (!company || !user) return alert('Empresa/Usuário não encontrado.')

      const r = await db.bulkCreateProducts(company.id, user.id, user.name, formatted)
      if (r.error) alert('Erro ao importar para o banco: ' + r.error)
      else { alert(`${formatted.length} produtos importados!`); window.location.reload() }
    }
  }

  const exportBeautifulExcel = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Catálogo WYNX', { views: [{ state: 'frozen', ySplit: 10 }] })
    const colorPink = 'FFF9A8D4', colorViolet = 'FFC4B5FD', colorSoftPink = 'FFFCEFF5', colorText = 'FF0A0A0A'
    
    worksheet.mergeCells('A1:G2')
    const titleCell = worksheet.getCell('A1')
    titleCell.value = 'WYNX — Relatório de Catálogo'
    titleCell.font = { name: 'Arial', size: 18, bold: true, color: { argb: colorText } }
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorPink } }
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' }

    worksheet.addRow([])
    worksheet.addRow(['Empresa:', company?.name || 'N/A', '', 'Emitido por:', user?.name || 'N/A'])
    worksheet.addRow(['Data:', new Date().toLocaleString('pt-BR'), '', 'Plano:', company?.plan?.toUpperCase() || 'N/A'])
    worksheet.addRow(['Equipe:', team.length > 0 ? team.map(t => t.name).join(', ') : 'Nenhum membro'])
    worksheet.getRow(4).font = { bold: true, color: { argb: colorText } }
    worksheet.getRow(5).font = { bold: true, color: { argb: colorText } }
    worksheet.getRow(6).font = { bold: true, color: { argb: colorText } }

    worksheet.addRow([])
    const kpiRow = worksheet.addRow(['SALDO TOTAL:', formatMoney(kpis.value), '', 'TOTAL ITENS:', kpis.units, '', 'PRODUTOS ATIVOS:', kpis.products])
    kpiRow.font = { bold: true, size: 12, color: { argb: colorText } }
    kpiRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorViolet } }
    worksheet.mergeCells(`B${kpiRow.number}:C${kpiRow.number}`)
    worksheet.mergeCells(`E${kpiRow.number}:F${kpiRow.number}`)

    worksheet.addRow([]) 
    const headerRow = worksheet.addRow(['Produto', 'SKU', 'Categoria', 'Custo', 'Preço', 'Estoque', 'Total (Custo x Qtd)'])
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: colorText } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorViolet } }
      cell.alignment = { vertical: 'middle', horizontal: 'center' }
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })

    list.forEach((p, index) => {
      const row = worksheet.addRow([p.name, p.sku, p.category, p.cost, p.price, p.qty, p.qty * p.cost])
      row.getCell(4).numFmt = '"R$" #,##0.00'
      row.getCell(5).numFmt = '"R$" #,##0.00'
      row.getCell(7).numFmt = '"R$" #,##0.00'
      row.getCell(6).alignment = { horizontal: 'center' }
      row.getCell(1).font = { bold: true }
      if (index % 2 === 0) row.eachCell((cell) => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorSoftPink } } })
      row.eachCell((cell) => { cell.border = { top: { style: 'thin', color: { argb: 'FFE2E8F0' } }, bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }, left: { style: 'thin', color: { argb: 'FFE2E8F0' } }, right: { style: 'thin', color: { argb: 'FFE2E8F0' } } } })
      if (p.qty <= p.minQty) row.getCell(6).font = { color: { argb: 'FFDC2626' }, bold: true }
    })

    worksheet.columns = [{ width: 35 }, { width: 15 }, { width: 20 }, { width: 15 }, { width: 15 }, { width: 10 }, { width: 25 }]
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, `Relatorio_Catalogo_WYNX_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl sm:text-3xl font-display font-bold">Catálogo</h1><p className="text-sm text-text-muted dark:text-white/50">Gerencie suas peças.</p></div>
        <div id="tour-csv" className="flex items-center gap-2 flex-wrap">
          <button onClick={exportBeautifulExcel} className="flex items-center justify-center gap-2 rounded-xl bg-white/50 dark:bg-white/5 border border-border-subtle dark:border-white/10 px-4 py-2.5 font-bold transition hover:bg-white dark:hover:bg-white/10"><Download className="h-4 w-4" /> Exportar</button>
          <label className="flex items-center justify-center gap-2 rounded-xl bg-white/50 dark:bg-white/5 border border-border-subtle dark:border-white/10 px-4 py-2.5 font-bold transition hover:bg-white dark:hover:bg-white/10 cursor-pointer"><Upload className="h-4 w-4" /> Importar<input type="file" accept=".csv, .xlsx, .xls" className="hidden" onChange={importFile} /></label>
          <button className="flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-2.5 font-bold text-white shadow-lg transition hover:scale-105 active:scale-95" onClick={() => { setEditing(null); setOpen(true) }}><Plus className="h-5 w-5" /> Novo Produto</button>
        </div>
      </div>
      {error && <p className="mb-4 text-sm text-danger bg-danger/10 p-3 rounded-lg border border-danger/20">{error}</p>}
      <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((p) => (
          <motion.div key={p.id} variants={{ hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } }} className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border-subtle dark:border-white/10 bg-bg-surface/50 dark:bg-[#16142E]/80 p-5 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-brand-violet/30 hover:shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div><p className="font-bold text-base sm:text-lg">{p.name}</p><p className="text-xs text-text-muted dark:text-white/50">{p.sku} · {p.category}</p></div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${p.qty === 0 ? 'bg-danger/20 text-danger' : p.qty <= p.minQty ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'}`}>{p.qty} un.</span>
            </div>
            <div className="flex items-end justify-between">
              <div><p className="text-xs text-text-muted dark:text-white/40 mb-1">Preço</p><p className="font-medium text-brand-cyan">{formatMoney(p.price)}</p></div>
              <div className="flex gap-2 opacity-100 sm:opacity-0 transition-opacity group-hover:opacity-100">
                <button className="rounded-lg bg-black/5 dark:bg-white/10 p-2 hover:bg-black/10 dark:hover:bg-white/20" onClick={() => { setEditing(p); setOpen(true) }}><SettingsIcon className="h-4 w-4" /></button>
                {user?.role === 'administrador' && <button className="rounded-lg bg-danger/10 p-2 text-danger hover:bg-danger/20" onClick={() => removeProduct(p.id)}><X className="h-4 w-4" /></button>}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      <AnimatePresence>{open && <ProductForm product={editing} categories={categories.length ? categories : ['Geral']} onClose={() => setOpen(false)} onSave={(data) => { if (saveProduct(data)) setOpen(false) }} />}</AnimatePresence>
    </div>
  )
}

function ProductForm({ product, categories, onClose, onSave }: { product: Product | null; categories: string[]; onClose: () => void; onSave: (data: any) => void }) {
  const { suppliers } = useSession()
  const [form, setForm] = useState({
    name: product?.name || '', sku: product?.sku || '', category: product?.category || categories[0], color: product?.color || '', size: product?.size || '', barcode: product?.barcode || '',
    price: product?.price || 0, cost: product?.cost || 0, qty: product?.qty || 0, minQty: product?.minQty || 3, notes: product?.notes || '',
    supplierId: product?.supplierId || ''
  })

  return (
    <SpatialModal title={product ? 'Editar produto' : 'Cadastrar produto'} onClose={onClose}>
      <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); onSave({ ...form, id: product?.id }) }}>
        <div className="flex flex-col gap-1.5 sm:col-span-2"><label className="text-sm font-medium text-text-secondary dark:text-white/70">Nome do produto *</label><input className="rounded-xl border border-border-subtle dark:border-white/10 bg-black/5 dark:bg-black/20 p-3 outline-none focus:border-brand-violet" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
        <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-text-secondary dark:text-white/70">Código / SKU *</label><input className="rounded-xl border border-border-subtle dark:border-white/10 bg-black/5 dark:bg-black/20 p-3 outline-none focus:border-brand-violet" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required /></div>
        <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-text-secondary dark:text-white/70">Categoria</label><select className="rounded-xl border border-border-subtle dark:border-white/10 bg-black/5 dark:bg-black/20 p-3 outline-none" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-sm font-medium text-text-secondary dark:text-white/70">Fornecedor</label>
          <select className="rounded-xl border border-border-subtle dark:border-white/10 bg-black/5 dark:bg-black/20 p-3 outline-none" value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
            <option value="">Nenhum / Não informado</option>
            {suppliers?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-text-secondary dark:text-white/70">Cor</label><input className="rounded-xl border border-border-subtle dark:border-white/10 bg-black/5 dark:bg-black/20 p-3 outline-none focus:border-brand-violet" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /></div>
        <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-text-secondary dark:text-white/70">Tamanho</label><input className="rounded-xl border border-border-subtle dark:border-white/10 bg-black/5 dark:bg-black/20 p-3 outline-none focus:border-brand-violet" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} /></div>
        <div className="flex flex-col gap-1.5 sm:col-span-2"><label className="text-sm font-medium text-text-secondary dark:text-white/70">Código de barras</label><input className="rounded-xl border border-border-subtle dark:border-white/10 bg-black/5 dark:bg-black/20 p-3 outline-none focus:border-brand-violet" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} /></div>
        <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-text-secondary dark:text-white/70">Preço de venda (R$)</label><input className="rounded-xl border border-border-subtle dark:border-white/10 bg-black/5 dark:bg-black/20 p-3 outline-none focus:border-brand-violet" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
        <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-text-secondary dark:text-white/70">Custo (R$)</label><input className="rounded-xl border border-border-subtle dark:border-white/10 bg-black/5 dark:bg-black/20 p-3 outline-none focus:border-brand-violet" type="number" step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })} /></div>
        {!product && <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-text-secondary dark:text-white/70">Qtd. Inicial</label><input className="rounded-xl border border-border-subtle dark:border-white/10 bg-black/5 dark:bg-black/20 p-3 outline-none focus:border-brand-violet" type="number" value={form.qty} onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })} /></div>}
        <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-text-secondary dark:text-white/70">Estoque mínimo</label><input className="rounded-xl border border-border-subtle dark:border-white/10 bg-black/5 dark:bg-black/20 p-3 outline-none focus:border-brand-violet" type="number" value={form.minQty} onChange={(e) => setForm({ ...form, minQty: Number(e.target.value) })} /></div>
        <button className="mt-4 rounded-xl bg-brand-gradient p-3 font-bold text-white shadow-lg sm:col-span-2 transition hover:scale-[1.02] active:scale-[0.98]" type="submit">Salvar produto</button>
      </form>
    </SpatialModal>
  )
}

/* ============================================================
   ESTOQUE
   ============================================================ */
function Stock({ q }: { q: string }) {
  const { move, error } = useStore()
  const [scannerOpen, setScannerOpen] = useState(false)
  const { products } = useSession()
  const [form, setForm] = useState({ productId: '', type: 'venda' as MovementType, qty: 1, note: '' })

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <motion.form initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="sticky top-28 space-y-5 rounded-3xl border border-border-subtle dark:border-white/10 bg-bg-surface/50 dark:bg-white/5 p-5 sm:p-6 backdrop-blur-xl" onSubmit={(e) => { e.preventDefault(); if (move(form)) setForm({ ...form, qty: 1, note: '' }) }}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold">Mover Estoque</h2>
            <button id="tour-scanner" type="button" className="flex items-center gap-2 rounded-xl bg-brand-violet/20 px-3 py-1.5 text-sm text-brand-violet transition hover:bg-brand-violet/30" onClick={() => setScannerOpen(true)}><Scan className="h-4 w-4" /> Scanner</button>
          </div>

          <div className="space-y-4">
            <select className="w-full rounded-xl border border-border-subtle dark:border-white/10 bg-black/5 dark:bg-black/40 p-3 outline-none focus:border-brand-violet" value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} required>
              <option value="">Selecione o produto...</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.qty} un.)</option>)}
            </select>
            
            <div className="grid grid-cols-2 gap-2">
               <button type="button" onClick={() => setForm({...form, type: 'entrada'})} className={`rounded-xl py-2 text-sm font-medium transition ${form.type === 'entrada' ? 'bg-success/20 text-success border border-success/30' : 'bg-black/5 dark:bg-black/40 text-text-muted dark:text-white/50 border border-transparent'}`}>Entrada</button>
               <button type="button" onClick={() => setForm({...form, type: 'venda'})} className={`rounded-xl py-2 text-sm font-medium transition ${form.type === 'venda' ? 'bg-danger/20 text-danger border border-danger/30' : 'bg-black/5 dark:bg-black/40 text-text-muted dark:text-white/50 border border-transparent'}`}>Saída</button>
            </div>

            <input className="w-full rounded-xl border border-border-subtle dark:border-white/10 bg-black/5 dark:bg-black/40 p-3 outline-none text-center text-2xl font-bold" type="number" min={1} value={form.qty} onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })} />
            <input className="w-full rounded-xl border border-border-subtle dark:border-white/10 bg-black/5 dark:bg-black/40 p-3 text-sm outline-none" placeholder="Observação (opcional)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </div>

          {error && <p className="text-sm text-danger text-center">{error}</p>}
          <button className="w-full rounded-xl bg-text-primary dark:bg-white py-3 font-bold text-white dark:text-black transition hover:scale-[1.02]">Confirmar</button>
        </motion.form>
      </div>

      <div className="lg:col-span-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
           {products.filter((p) => matches(p, q)).map((p) => (
             <div key={p.id} className="flex items-center justify-between rounded-2xl border border-border-subtle dark:border-white/5 bg-bg-surface/50 dark:bg-white/5 p-4 hover:bg-black/5 dark:hover:bg-white/10 transition">
                <div className="flex items-center gap-4">
                  <div className={`h-3 w-3 rounded-full ${p.qty === 0 ? 'bg-danger' : p.qty <= p.minQty ? 'bg-warning' : 'bg-success'}`} />
                  <div><p className="font-medium">{p.name}</p><p className="text-xs text-text-muted dark:text-white/50">Mínimo: {p.minQty}</p></div>
                </div>
                <div className="text-right"><p className="text-xl sm:text-2xl font-black">{p.qty}</p><p className="text-[10px] text-text-muted dark:text-white/40 uppercase">Unidades</p></div>
             </div>
           ))}
        </motion.div>
      </div>

      <AnimatePresence>
        {scannerOpen && (
          <Scanner 
            onScan={(code) => {
              const found = products.find((p) => p.barcode === code || p.sku.toLowerCase() === code.toLowerCase())
              if (found) setForm({ ...form, productId: found.id })
              else alert(`Nenhum produto encontrado: ${code}`)
            }} 
            onClose={() => setScannerOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/* ============================================================
   RELATÓRIOS
   ============================================================ */
function Reports({ q }: { q: string }) {
  const { state, exportBackup } = useStore()
  const { movements, kpis: k, company, user } = useSession()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const ranking = topProducts(state, 8)
  const filtered = movements.filter((m) => {
    const d = m.createdAt.slice(0, 10)
    if (from && d < from) return false
    if (to && d > to) return false
    if (q && !normalize(m.productName).includes(normalize(q))) return false
    return true
  })

  const csv = () => {
    const rows = [['Data', 'Produto', 'Tipo', 'Qtd', 'Saldo', 'Usuário', 'Obs'], ...filtered.map((m) => [formatDate(m.createdAt), m.productName, labelMovement(m.type), m.qty, m.resultingQty, m.userName, m.note])]
    const blob = new Blob([rows.map((r) => r.join(';')).join('\n')], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `wynx-relatorio-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
  }

  const pdf = async () => {
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    doc.setFillColor(196, 181, 253); doc.rect(0, 0, 210, 35, 'F')
    doc.setFillColor(249, 168, 212); doc.rect(0, 30, 210, 5, 'F')
    doc.setTextColor(255, 255, 255); doc.setFontSize(24); doc.setFont('helvetica', 'bold'); doc.text('WYNX', 14, 15)
    doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.text('Relatório de Movimentações', 14, 22)
    doc.setTextColor(31, 41, 55); doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.text(company?.name || '', 14, 48)
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(107, 114, 128); doc.text(`Emitido em ${new Date().toLocaleString('pt-BR')} por ${user?.name || ''}`, 14, 54)
    if (from || to) { const periodo = [from ? `de ${new Date(from).toLocaleDateString('pt-BR')}` : '', to ? `até ${new Date(to).toLocaleDateString('pt-BR')}` : ''].filter(Boolean).join(' '); doc.text(`Período: ${periodo}`, 14, 60) }
    doc.setFontSize(9); doc.setTextColor(107, 114, 128); doc.text('Total de movimentações:', 14, 72)
    doc.setTextColor(10, 10, 10); doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.text(String(filtered.length), 14, 80)
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(107, 114, 128); doc.text('Itens parados:', 80, 72)
    doc.setTextColor(10, 10, 10); doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.text(String(k.idle), 80, 80)
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(107, 114, 128); doc.text('Capital em estoque:', 140, 72)
    doc.setTextColor(10, 10, 10); doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.text(formatMoney(k.value), 140, 80)
    autoTable(doc, {
      startY: 90, head: [['Data', 'Produto', 'Tipo', 'Qtd', 'Saldo', 'Usuário']], body: filtered.slice(0, 300).map((m) => [formatDate(m.createdAt), m.productName, labelMovement(m.type), String(m.qty), String(m.resultingQty), m.userName]),
      styles: { font: 'helvetica', fontSize: 8, cellPadding: 2, textColor: [31, 41, 55] }, headStyles: { fillColor: [196, 181, 253], textColor: [255, 255, 255], fontStyle: 'bold' }, alternateRowStyles: { fillColor: [250, 245, 255] },
      columnStyles: { 0: { cellWidth: 30 }, 1: { cellWidth: 60 }, 2: { cellWidth: 25 }, 3: { cellWidth: 15, halign: 'right' }, 4: { cellWidth: 15, halign: 'right' }, 5: { cellWidth: 'auto' } },
      didDrawPage: () => { const pageHeight = doc.internal.pageSize.getHeight(); doc.setFontSize(8); doc.setTextColor(107, 114, 128); doc.text('WYNX — Transformando o controle de estoque em inteligência.', 14, pageHeight - 8) }
    })
    doc.save(`wynx-relatorio-${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl sm:text-3xl font-display font-bold">Relatórios</h1><p className="text-sm text-text-muted dark:text-white/50">Inteligência de dados.</p></div>
      <div className="flex flex-col sm:flex-row gap-3 sm:flex-wrap items-end">
        <div className="flex flex-col gap-1.5 w-full sm:w-auto"><label className="text-xs text-text-muted dark:text-white/50">Data início</label><input className="w-full rounded-xl border border-border-subtle dark:border-white/10 bg-black/5 dark:bg-black/20 p-2 text-sm outline-none" type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div className="flex flex-col gap-1.5 w-full sm:w-auto"><label className="text-xs text-text-muted dark:text-white/50">Data fim</label><input className="w-full rounded-xl border border-border-subtle dark:border-white/10 bg-black/5 dark:bg-black/20 p-2 text-sm outline-none" type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="rounded-xl bg-brand-gradient px-4 py-2 text-sm font-bold text-white transition hover:scale-105 flex-1 sm:flex-initial shadow-lg" onClick={pdf}>Exportar PDF</button>
          <button className="rounded-xl bg-black/5 dark:bg-white/10 px-4 py-2 text-sm font-bold transition hover:bg-black/10 dark:hover:bg-white/20 flex-1 sm:flex-initial" onClick={csv}>Exportar CSV</button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-border-subtle dark:border-white/10 bg-bg-surface/50 dark:bg-white/5 p-5 backdrop-blur-md"><p className="text-xs text-text-muted dark:text-white/50 uppercase">Movimentações</p><p className="mt-1 text-2xl sm:text-3xl font-black">{filtered.length}</p></div>
        <div className="rounded-3xl border border-border-subtle dark:border-white/10 bg-bg-surface/50 dark:bg-white/5 p-5 backdrop-blur-md"><p className="text-xs text-text-muted dark:text-white/50 uppercase">Itens Parados</p><p className="mt-1 text-2xl sm:text-3xl font-black text-warning">{k.idle}</p></div>
        <div className="rounded-3xl border border-border-subtle dark:border-white/10 bg-bg-surface/50 dark:bg-white/5 p-5 backdrop-blur-md"><p className="text-xs text-text-muted dark:text-white/50 uppercase">Capital Parado</p><p className="mt-1 text-2xl sm:text-3xl font-black text-brand-cyan">{formatMoney(k.value)}</p></div>
      </div>
      <div className="rounded-3xl border border-border-subtle dark:border-white/10 bg-bg-surface/50 dark:bg-white/5 p-5 sm:p-6 backdrop-blur-md">
        <h3 className="mb-4 sm:mb-6 text-sm font-medium text-text-muted dark:text-white/50">Giro por produto (vendas)</h3>
        <div className="h-56 sm:h-64 w-full">
          <ResponsiveContainer>
            <BarChart data={ranking}><CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} /><XAxis dataKey="name" hide /><YAxis fontSize={11} stroke="currentColor" opacity={0.5} /><Tooltip contentStyle={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)', borderRadius: '12px', color: 'var(--color-text-primary)' }} /><Bar dataKey="qty" fill="#67E8F9" radius={[4, 4, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   DEMAIS TELAS
   ============================================================ */
function Insights({ q }: { q: string }) {
  const { insights } = useSession()
  const filtered = q ? insights.filter((i) => normalize(i.title).includes(normalize(q))) : insights
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl sm:text-3xl font-display font-bold">Insights de IA</h1><p className="text-sm text-text-muted dark:text-white/50">Recomendações inteligentes.</p></div>
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((i) => (
          <article key={i.id} className="rounded-3xl border border-border-subtle dark:border-white/10 bg-bg-surface/50 dark:bg-white/5 p-5 sm:p-6 backdrop-blur-md hover:border-brand-violet/30 transition">
            <p className="text-xs uppercase tracking-wide text-brand-cyan mb-2">Prioridade {i.severity}</p>
            <h3 className="text-base sm:text-lg font-bold">{i.title}</h3>
            <p className="mt-2 text-sm text-text-secondary dark:text-white/70">{i.body}</p>
          </article>
        ))}
      </div>
    </div>
  )
}

function Alerts({ q }: { q: string }) {
  const { notifications } = useSession()
  const { readOne, readAll } = useStore()
  const filtered = q ? notifications.filter((n) => normalize(n.title).includes(normalize(q))) : notifications
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><h1 className="text-2xl sm:text-3xl font-display font-bold">Alertas</h1><p className="text-sm text-text-muted dark:text-white/50">Avisos do sistema.</p></div><button className="rounded-xl bg-black/5 dark:bg-white/10 px-4 py-2 text-sm hover:bg-black/10 dark:hover:bg-white/20 transition w-full sm:w-auto" onClick={readAll}>Marcar lidos</button></div>
      <div className="space-y-3">
        {filtered.map((n) => (
          <div key={n.id} className={`rounded-2xl border p-4 flex flex-col sm:flex-row gap-4 justify-between items-start ${n.read ? 'border-border-subtle dark:border-white/10 bg-bg-surface/30 dark:bg-white/5 opacity-50' : 'border-warning/30 bg-warning/5'}`}>
            <div><p className="font-bold">{n.title}</p><p className="text-sm text-text-secondary dark:text-white/70">{n.message}</p><p className="text-xs text-text-muted dark:text-white/40 mt-1">{formatDate(n.createdAt)}</p></div>
            {!n.read && <button className="rounded-lg bg-warning/20 px-3 py-1 text-xs text-warning hover:bg-warning/30 transition self-start" onClick={() => readOne(n.id)}>Marcar lido</button>}
          </div>
        ))}
      </div>
    </div>
  )
}

function History({ q }: { q: string }) {
  const { movements } = useSession()
  const filtered = q ? movements.filter((m) => normalize(m.productName).includes(normalize(q))) : movements
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl sm:text-3xl font-display font-bold">Histórico</h1><p className="text-sm text-text-muted dark:text-white/50">Linha do tempo.</p></div>
      <div className="space-y-3">
        {filtered.map((m) => (
          <div key={m.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-2xl border border-border-subtle dark:border-white/5 bg-bg-surface/50 dark:bg-white/5 p-4 hover:bg-black/5 dark:hover:bg-white/10 transition gap-4">
            <div className="flex items-center gap-4">
               <div className={`h-2 w-2 rounded-full ${m.type === 'entrada' ? 'bg-success' : 'bg-danger'}`} />
               <div><p className="font-medium">{m.productName}</p><p className="text-xs text-text-muted dark:text-white/50">{labelMovement(m.type)}</p></div>
            </div>
            <div className="text-left sm:text-right"><p className={`font-bold ${m.type === 'entrada' ? 'text-success' : 'text-text-primary dark:text-white'}`}>{m.type === 'entrada' ? '+' : '-'}{m.qty}</p><p className="text-xs text-text-muted dark:text-white/40">{formatDate(m.createdAt)}</p></div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Team({ q }: { q: string }) {
  const { team, user, company } = useSession()
  const { setRole: updateMemberRole, removeMember } = useStore() 
  
  const [invites, setInvites] = useState<any[]>([])
  const [email, setEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<Role>('editor')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const fetchInvites = async () => {
    if (!company?.id) return
    const { data } = await supabase
      .from('invites')
      .select('*')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false })
    
    if (data) setInvites(data)
  }

  useEffect(() => {
    fetchInvites()
  }, [company?.id])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!company?.id) return
    setLoading(true)
    setMsg(null)

    const cleanEmail = email.trim().toLowerCase()
    const { data, error } = await supabase.rpc('invite_member_to_company', {
      p_email: cleanEmail,
      p_role: inviteRole,
      p_company_id: company.id
    })

    if (error) {
      setMsg({ type: 'error', text: 'Erro interno: ' + error.message })
    } else if (data.status === 'error') {
      setMsg({ type: 'error', text: data.message })
    } else {
      setMsg({ type: 'success', text: data.message })
      setEmail('')
      if (data.status === 'added') {
        window.location.reload();
      } else {
        fetchInvites()
      }
    }
    setLoading(false)
  }

  const handleCancelInvite = async (id: string) => {
    await supabase.from('invites').delete().eq('id', id)
    fetchInvites()
  }

  const filteredTeam = q
    ? team.filter((m) => normalize(m.name).includes(normalize(q)) || normalize(m.email).includes(normalize(q)))
    : team

  return (
    <div className="grid gap-6 lg:grid-cols-3 items-start">
      <div className="space-y-6">
        <form className="rounded-3xl border border-border-subtle dark:border-white/10 bg-bg-surface/50 dark:bg-white/5 p-6 backdrop-blur-md space-y-4" onSubmit={handleInvite}>
          <div>
            <h3 className="text-lg font-bold">Convidar</h3>
            <p className="text-xs text-text-muted dark:text-white/50 mt-1">Adicione alguém à sua equipe.</p>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary dark:text-white/70">E-mail do colaborador</label>
            <input type="email" className="w-full rounded-xl border border-border-subtle dark:border-white/10 bg-black/5 dark:bg-black/20 p-3 text-sm outline-none focus:border-brand-violet" placeholder="nome@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary dark:text-white/70">Permissão</label>
            <select className="w-full rounded-xl border border-border-subtle dark:border-white/10 bg-black/5 dark:bg-black/20 p-3 text-sm outline-none focus:border-brand-violet" value={inviteRole} onChange={(e) => setInviteRole(e.target.value as Role)}>
              <option value="administrador">Administrador (Total)</option>
              <option value="editor">Editor (Operacional)</option>
              <option value="visualizador">Visualizador (Leitura)</option>
            </select>
          </div>

          {msg && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className={`rounded-xl border px-3 py-2 text-xs ${msg.type === 'success' ? 'border-success/30 bg-success/10 text-success' : 'border-danger/30 bg-danger/10 text-danger'}`}>
              {msg.text}
            </motion.div>
          )}

          <button type="submit" disabled={loading} className="w-full rounded-xl bg-brand-gradient py-3 text-sm font-bold text-white shadow-lg transition hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex justify-center items-center gap-2">
            {loading ? 'Processando...' : <><Plus className="h-4 w-4"/> Adicionar / Convidar</>}
          </button>
        </form>

        {invites.length > 0 && (
          <div className="rounded-3xl border border-warning/30 bg-warning/5 p-5 backdrop-blur-md space-y-3">
            <h4 className="text-sm font-bold text-warning flex items-center gap-2">
              <HistoryIcon className="h-4 w-4" /> Pendentes ({invites.length})
            </h4>
            <div className="space-y-2">
              {invites.map(inv => (
                <div key={inv.id} className="flex items-center justify-between rounded-xl bg-black/5 dark:bg-black/20 p-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate text-text-primary dark:text-white">{inv.email}</p>
                    <p className="text-[10px] text-text-muted dark:text-white/50 uppercase">{inv.role}</p>
                  </div>
                  <button onClick={() => handleCancelInvite(inv.id)} className="text-danger hover:bg-danger/20 p-1.5 rounded-lg transition" title="Cancelar convite"><X className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="lg:col-span-2 rounded-3xl border border-border-subtle dark:border-white/10 bg-bg-surface/50 dark:bg-white/5 p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Equipe Ativa</h3>
          <span className="rounded-full bg-brand-violet/20 px-3 py-1 text-xs font-bold text-brand-violet">{team.length} membros</span>
        </div>
        
        {filteredTeam.length === 0 && q && (
          <p className="text-sm text-text-muted dark:text-white/50 py-4 text-center">Nenhum colaborador encontrado para "{q}".</p>
        )}

        <div className="space-y-3">
          {filteredTeam.map((m) => {
            const iAmAdmin = user?.role === 'administrador'
            const isSelf = m.id === user?.id

            return (
              <div key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-border-subtle dark:border-white/5 bg-black/5 dark:bg-white/5 p-4 gap-4 hover:bg-black/10 dark:hover:bg-white/10 transition">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white font-bold shadow-md">
                    {m.name ? m.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate text-text-primary dark:text-white">
                      {m.name || 'Sem nome'} {isSelf && <span className="text-xs text-text-muted font-normal">(você)</span>}
                    </p>
                    <p className="text-sm text-text-muted dark:text-white/50 truncate">{m.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {iAmAdmin && !isSelf ? (
                    <>
                      <select className="w-full sm:w-auto rounded-xl border border-border-subtle dark:border-white/10 bg-bg-surface dark:bg-black/40 p-2 text-sm outline-none focus:border-brand-violet cursor-pointer" value={m.role} onChange={(e) => updateMemberRole(m.id, e.target.value as Role)}>
                        <option value="administrador">Administrador</option>
                        <option value="editor">Editor</option>
                        <option value="visualizador">Visualizador</option>
                      </select>
                      <button onClick={() => { if (confirm(`Tem certeza que deseja remover ${m.name} da equipe?`)) removeMember(m.id) }} className="rounded-xl bg-danger/10 p-2 text-danger hover:bg-danger/20 transition" title="Remover da equipe"><X className="h-4 w-4" /></button>
                    </>
                  ) : (
                    <span className={`rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${m.role === 'administrador' ? 'bg-brand-violet/20 text-brand-violet' : m.role === 'editor' ? 'bg-brand-cyan/20 text-brand-cyan' : 'bg-black/10 dark:bg-white/10 text-text-muted dark:text-white/50'}`}>
                      {m.role}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Profile() {
  const { user, company } = useSession()
  const { setProfile, deleteAccount } = useStore()
  const [name, setName] = useState(user?.name || '')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (confirmText !== 'EXCLUIR') return
    setIsDeleting(true)
    await deleteAccount()
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold">Perfil</h1>
        <p className="text-sm text-text-muted dark:text-white/50">Informações da conta.</p>
      </div>
      
      <div className="rounded-3xl border border-border-subtle dark:border-white/10 bg-bg-surface/50 dark:bg-white/5 p-6 space-y-4 backdrop-blur-md">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-text-muted dark:text-white/50">E-mail</label>
          <input className="w-full rounded-xl border border-border-subtle dark:border-white/5 bg-black/5 dark:bg-white/5 p-3 cursor-not-allowed opacity-70 outline-none" value={user?.email || ''} disabled />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-text-muted dark:text-white/50">Nome</label>
          <input className="w-full rounded-xl border border-border-subtle dark:border-white/10 bg-black/5 dark:bg-black/20 p-3 outline-none focus:border-brand-violet" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-text-muted dark:text-white/50">Empresa</label>
          <input className="w-full rounded-xl border border-border-subtle dark:border-white/5 bg-black/5 dark:bg-white/5 p-3 cursor-not-allowed opacity-70 outline-none" value={company?.name || ''} disabled />
        </div>
        <button className="w-full rounded-xl bg-text-primary dark:bg-white py-3 font-bold text-white dark:text-black hover:scale-[1.02] transition mt-2" onClick={() => setProfile(name)}>
          Salvar Alterações
        </button>
      </div>

      <div className="rounded-3xl border border-danger/30 bg-danger/5 p-6 space-y-4 backdrop-blur-md">
        <div>
          <h3 className="text-lg font-bold text-danger">Zona de Perigo</h3>
          <p className="text-sm text-danger/70 mt-1">Ações irreversíveis. Se você for o dono da empresa, todos os dados (produtos, movimentações e equipe) serão apagados permanentemente.</p>
        </div>
        <button className="rounded-xl border border-danger bg-transparent px-4 py-2 text-sm font-bold text-danger transition hover:bg-danger hover:text-white" onClick={() => setShowDeleteModal(true)}>
          Excluir minha conta
        </button>
      </div>

      <AnimatePresence>
        {showDeleteModal && (
          <SpatialModal title="Excluir conta permanentemente" onClose={() => !isDeleting && setShowDeleteModal(false)}>
            <div className="space-y-4">
              <div className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
                <p className="font-bold">Atenção: Esta ação não pode ser desfeita.</p>
                <p className="mt-1">Sua conta e todo o histórico serão apagados permanentemente.</p>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-secondary dark:text-white/70">Digite <strong className="text-danger">EXCLUIR</strong> para confirmar:</label>
                <input className="w-full rounded-xl border border-border-subtle dark:border-white/10 bg-black/5 dark:bg-black/20 p-3 outline-none focus:border-danger text-text-primary dark:text-white" value={confirmText} onChange={(e) => setConfirmText(e.target.value.toUpperCase())} placeholder="EXCLUIR" />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button className="rounded-xl px-4 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10 transition" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>Cancelar</button>
                <button className="rounded-xl bg-danger px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50 flex items-center gap-2" onClick={handleDelete} disabled={confirmText !== 'EXCLUIR' || isDeleting}>
                  {isDeleting ? 'Excluindo...' : 'Excluir Definitivamente'}
                </button>
              </div>
            </div>
          </SpatialModal>
        )}
      </AnimatePresence>
    </div>
  )
}

function Suppliers({ q }: { q: string }) {
  const { saveSupplier, removeSupplier, error } = useStore()
  const { suppliers, user } = useSession()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  
  const list = (suppliers || []).filter((s: any) => normalize(s.name).includes(normalize(q)))

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl sm:text-3xl font-display font-bold">Fornecedores</h1><p className="text-sm text-text-muted dark:text-white/50">Sua rede de contatos.</p></div>
        <button className="flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-2.5 font-bold text-white shadow-lg transition hover:scale-105" onClick={() => { setEditing(null); setOpen(true) }}>
          <Plus className="h-5 w-5" /> Novo Fornecedor
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-danger bg-danger/10 p-3 rounded-lg border border-danger/20">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((s: any) => (
          <div key={s.id} className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border-subtle dark:border-white/10 bg-bg-surface/50 dark:bg-[#16142E]/80 p-5 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-brand-violet/30 hover:shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-bold text-base sm:text-lg">{s.name}</p>
                <p className="text-xs text-text-muted dark:text-white/50">{s.cnpj || 'Sem CNPJ'}</p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-violet/20 text-brand-violet"><Truck className="h-5 w-5" /></div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-text-muted dark:text-white/40 mb-1">Contato</p>
                <p className="font-medium text-brand-cyan">{s.phone || 'Sem telefone'}</p>
                <p className="text-xs text-text-muted dark:text-white/50">{s.email || ''}</p>
              </div>
              <div className="flex gap-2 opacity-100 sm:opacity-0 transition-opacity group-hover:opacity-100">
                <button className="rounded-lg bg-black/5 dark:bg-white/10 p-2 hover:bg-black/10 dark:hover:bg-white/20" onClick={() => { setEditing(s); setOpen(true) }}><SettingsIcon className="h-4 w-4" /></button>
                {user?.role === 'administrador' && <button className="rounded-lg bg-danger/10 p-2 text-danger hover:bg-danger/20" onClick={() => removeSupplier(s.id)}><X className="h-4 w-4" /></button>}
              </div>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="col-span-full text-center py-8 text-text-muted dark:text-white/50">Nenhum fornecedor encontrado.</p>}
      </div>

      {open && (
        <SpatialModal title={editing ? 'Editar Fornecedor' : 'Novo Fornecedor'} onClose={() => setOpen(false)}>
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault()
            const form = e.currentTarget
            const data = {
              id: editing?.id,
              name: (form.elements.namedItem('name') as HTMLInputElement).value,
              cnpj: (form.elements.namedItem('cnpj') as HTMLInputElement).value,
              phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
              email: (form.elements.namedItem('email') as HTMLInputElement).value,
            }
            if (saveSupplier(data)) setOpen(false)
          }}>
            <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-text-secondary dark:text-white/70">Nome da Empresa *</label><input name="name" defaultValue={editing?.name} className="rounded-xl border border-border-subtle dark:border-white/10 bg-black/5 dark:bg-black/20 p-3 outline-none focus:border-brand-violet" required /></div>
            <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-text-secondary dark:text-white/70">CNPJ</label><input name="cnpj" defaultValue={editing?.cnpj} className="rounded-xl border border-border-subtle dark:border-white/10 bg-black/5 dark:bg-black/20 p-3 outline-none focus:border-brand-violet" /></div>
            <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-text-secondary dark:text-white/70">Telefone</label><input name="phone" defaultValue={editing?.phone} className="rounded-xl border border-border-subtle dark:border-white/10 bg-black/5 dark:bg-black/20 p-3 outline-none focus:border-brand-violet" /></div>
            <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-text-secondary dark:text-white/70">E-mail</label><input name="email" type="email" defaultValue={editing?.email} className="rounded-xl border border-border-subtle dark:border-white/10 bg-black/5 dark:bg-black/20 p-3 outline-none focus:border-brand-violet" /></div>
            <button className="mt-4 rounded-xl bg-brand-gradient p-3 font-bold text-white shadow-lg w-full transition hover:scale-[1.02]" type="submit">Salvar Fornecedor</button>
          </form>
        </SpatialModal>
      )}
    </div>
  )
}
function Stores({ q }: { q: string }) {
  const { saveStore, removeStore, error } = useStore()
  const { stores, user } = useSession()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  
  const list = (stores || []).filter((s: any) => normalize(s.name).includes(normalize(q)))

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl sm:text-3xl font-display font-bold">Lojas e Locais</h1><p className="text-sm text-text-muted dark:text-white/50">Gerencie onde seu estoque fica.</p></div>
        <button className="flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-2.5 font-bold text-white shadow-lg transition hover:scale-105" onClick={() => { setEditing(null); setOpen(true) }}>
          <Plus className="h-5 w-5" /> Novo Local
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-danger bg-danger/10 p-3 rounded-lg border border-danger/20">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((s: any) => (
          <div key={s.id} className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border-subtle dark:border-white/10 bg-bg-surface/50 dark:bg-[#16142E]/80 p-5 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-brand-violet/30 hover:shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-bold text-base sm:text-lg">{s.name}</p>
                <p className="text-xs text-text-muted dark:text-white/50 uppercase">{s.type}</p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-pink/20 text-brand-pink"><StoreIcon className="h-5 w-5" /></div>
            </div>
            <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 transition-opacity group-hover:opacity-100 mt-4">
              <button className="rounded-lg bg-black/5 dark:bg-white/10 p-2 hover:bg-black/10 dark:hover:bg-white/20" onClick={() => { setEditing(s); setOpen(true) }}><SettingsIcon className="h-4 w-4" /></button>
              {user?.role === 'administrador' && <button className="rounded-lg bg-danger/10 p-2 text-danger hover:bg-danger/20" onClick={() => removeStore(s.id)}><X className="h-4 w-4" /></button>}
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="col-span-full text-center py-8 text-text-muted dark:text-white/50">Nenhum local cadastrado.</p>}
      </div>

      {open && (
        <SpatialModal title={editing ? 'Editar Local' : 'Novo Local'} onClose={() => setOpen(false)}>
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault()
            const form = e.currentTarget
            const data = {
              id: editing?.id,
              name: (form.elements.namedItem('name') as HTMLInputElement).value,
              type: (form.elements.namedItem('type') as HTMLSelectElement).value,
            }
            if (saveStore(data)) setOpen(false)
          }}>
            <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-text-secondary dark:text-white/70">Nome do Local *</label><input name="name" defaultValue={editing?.name} placeholder="Ex: Loja Centro ou Depósito" className="rounded-xl border border-border-subtle dark:border-white/10 bg-black/5 dark:bg-black/20 p-3 outline-none focus:border-brand-violet" required /></div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary dark:text-white/70">Tipo</label>
              <select name="type" defaultValue={editing?.type || 'loja'} className="rounded-xl border border-border-subtle dark:border-white/10 bg-black/5 dark:bg-black/20 p-3 outline-none focus:border-brand-violet">
                <option value="loja">Loja (Vendas)</option>
                <option value="deposito">Depósito (Armazenamento)</option>
              </select>
            </div>
            <button className="mt-4 rounded-xl bg-brand-gradient p-3 font-bold text-white shadow-lg w-full transition hover:scale-[1.02]" type="submit">Salvar Local</button>
          </form>
        </SpatialModal>
      )}
    </div>
  )
}

function TourGuide({ onClose, onStepChange }: { onClose: () => void; onStepChange: (step: number) => void }) {
  const [step, setStep] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)

   const steps = [
    { target: 'body', title: 'Bem-vindo ao WYNX', desc: 'Vamos fazer um tour rápido. O sistema é super intuitivo, mas queremos mostrar o caminho das pedras.' },
    { target: '#tour-kpi', title: 'Seu Pulso Financeiro', desc: 'Aqui você vê o valor total do seu estoque e quantas unidades estão em falta.' },
    { target: '#tour-dock', title: 'Navegação Rápida', desc: 'Use essa Dock flutuante para ir para qualquer tela, como o Catálogo de Produtos.' },
    { target: '#tour-csv', title: 'Planilhas e Relatórios', desc: 'Já tem os produtos no Excel? Importe de uma vez! Ou exporte um relatório lindo para o seu sócio.' },
    { target: '#tour-customer', title: 'Atendimento Premium', desc: 'No PDV, você pode registrar o nome do cliente para um histórico mais detalhado. O recibo térmico já sai com o nome dele!' },
    { target: '#tour-scanner', title: 'Câmera de Alta Velocidade', desc: 'Esqueça digitar códigos de barras. Use a câmera do celular para dar entrada ou saída em segundos.' },
    { target: 'body', title: 'Tudo pronto!', desc: 'Você já conhece o básico. Clique em começar e domine o seu negócio.' }
  ]

  useEffect(() => {
    onStepChange(step)
    const timer = setTimeout(() => {
      const el = document.querySelector(steps[step].target)
      if (el && steps[step].target !== 'body') {
        setRect(el.getBoundingClientRect())
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else {
        setRect(null)
      }
    }, 450)
    return () => clearTimeout(timer)
  }, [step])

  const next = () => {
    if (step < steps.length - 1) {
      setStep(s => s + 1)
    } else {
      localStorage.setItem('wynx_onboarding_done', 'true')
      onClose()
    }
  }

  const currentStep = steps[step]

  return createPortal(
    <div className="fixed inset-0 z-[2000] pointer-events-none">
      {rect ? (
        <div 
          className="absolute rounded-2xl pointer-events-auto transition-all duration-500 ease-out"
          style={{
            top: rect.top - 8, left: rect.left - 8, width: rect.width + 16, height: rect.height + 16,
            boxShadow: '0 0 0 9999px rgba(10, 5, 20, 0.75)',
            zIndex: 1999,
            border: '2px solid #F9A8D4',
            borderRadius: '16px'
          }}
          onClick={next}
        />
      ) : (
        <div className="absolute inset-0 bg-[#0A0514]/75 pointer-events-auto z-[1999]" onClick={next} />
      )}

      <motion.div 
        key={step}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="absolute pointer-events-auto w-[90%] max-w-sm rounded-3xl border border-white/20 bg-white/90 dark:bg-[#16142E]/95 p-6 shadow-2xl backdrop-blur-2xl"
        style={{
          top: rect ? (rect.top > window.innerHeight / 2 ? rect.top - 180 : rect.bottom + 30) : '50%',
          left: rect ? Math.max(16, Math.min(rect.left, window.innerWidth - 384)) : '50%',
          transform: rect ? 'none' : 'translate(-50%, -50%)',
          zIndex: 2000
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-gradient shadow-lg text-white font-bold">{step + 1}</div>
          <h3 className="text-lg font-bold text-text-primary dark:text-white">{currentStep.title}</h3>
        </div>
        
        <p className="text-sm text-text-secondary dark:text-white/70 mb-6">{currentStep.desc}</p>

        <div className="flex justify-between items-center">
          <button onClick={() => { localStorage.setItem('wynx_onboarding_done', 'true'); onClose() }} className="text-xs font-semibold text-text-muted hover:text-text-primary dark:text-white/40 dark:hover:text-white transition">Pular tutorial</button>
          <button onClick={next} className="rounded-xl bg-brand-gradient px-6 py-2.5 text-sm font-bold text-white shadow-lg transition hover:scale-105 active:scale-95">{step === steps.length - 1 ? 'Começar' : 'Entendi'}</button>
        </div>
      </motion.div>
    </div>,
    document.body
  )
}

function Settings() {
  const { company, categories } = useSession()
  const { setCompany, newCategory } = useStore()
  const [form, setForm] = useState({ name: company?.name || '', segment: company?.segment || SEGMENTS[0], city: company?.city || '', state: company?.state || '' })
  const [cat, setCat] = useState('')

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold">Ajustes</h1>
        <p className="text-sm text-text-muted dark:text-white/50">Configurações do sistema.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <form className="rounded-3xl border border-border-subtle dark:border-white/10 bg-white dark:bg-[#16142E] p-6 space-y-4 shadow-xl" onSubmit={(e) => { e.preventDefault(); setCompany(form) }}>
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><Building2 className="h-5 w-5 text-brand-violet" /> Empresa</h3>
          <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-text-muted dark:text-white/50">Nome Fantasia</label><input className="w-full rounded-xl border border-border-subtle dark:border-white/10 bg-black/5 dark:bg-black/20 p-3 outline-none focus:border-brand-violet text-text-primary dark:text-white" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-text-muted dark:text-white/50">Segmento</label><select className="w-full rounded-xl border border-border-subtle dark:border-white/10 bg-black/5 dark:bg-black/20 p-3 outline-none focus:border-brand-violet text-text-primary dark:text-white" value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value })}>{SEGMENTS.map((s) => <option key={s}>{s}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-text-muted dark:text-white/50">Cidade</label><input className="w-full rounded-xl border border-border-subtle dark:border-white/10 bg-black/5 dark:bg-black/20 p-3 outline-none focus:border-brand-violet text-text-primary dark:text-white" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
            <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-text-muted dark:text-white/50">UF</label><input className="w-full rounded-xl border border-border-subtle dark:border-white/10 bg-black/5 dark:bg-black/20 p-3 outline-none focus:border-brand-violet text-text-primary dark:text-white" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></div>
          </div>
          <button className="w-full rounded-xl bg-brand-gradient py-3 font-bold text-white mt-4 hover:scale-[1.02] transition shadow-lg">Salvar Empresa</button>
        </form>

        <div className="rounded-3xl border border-border-subtle dark:border-white/10 bg-white dark:bg-[#16142E] p-6 space-y-4 shadow-xl">
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><Layers className="h-5 w-5 text-brand-cyan" /> Categorias</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((c) => (<span key={c} className="rounded-full bg-brand-violet/20 border border-brand-violet/30 px-3 py-1 text-sm text-brand-violet font-medium">{c}</span>))}
            {categories.length === 0 && <p className="text-sm text-text-muted">Nenhuma categoria criada.</p>}
          </div>
          <div className="flex gap-2 pt-4 border-t border-border-subtle dark:border-white/10">
            <input className="w-full rounded-xl border border-border-subtle dark:border-white/10 bg-black/5 dark:bg-black/20 p-3 outline-none focus:border-brand-violet text-text-primary dark:text-white" value={cat} onChange={(e) => setCat(e.target.value)} placeholder="Nova categoria..." />
            <button type="button" className="rounded-xl bg-brand-gradient px-5 font-bold text-white hover:scale-105 transition shadow-lg" onClick={() => { if (newCategory(cat)) setCat('') }}>Add</button>
          </div>
        </div>

        <div className="md:col-span-2 rounded-3xl border border-brand-pink/30 bg-brand-pink/5 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-pink/20 text-brand-pink"><Sparkles className="h-6 w-6" /></div>
            <div>
              <h3 className="text-lg font-bold text-text-primary dark:text-white">Ajuda e Tour</h3>
              <p className="text-sm text-text-muted dark:text-white/50">A WYNX é intuitiva, mas se quiser rever as dicas principais ou apresentar para alguém, inicie o tour guiado.</p>
            </div>
          </div>
          <button onClick={() => { localStorage.removeItem('wynx_onboarding_done'); window.location.reload(); }} className="w-full sm:w-auto shrink-0 rounded-xl bg-brand-gradient px-6 py-3 font-bold text-white transition hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"><RefreshCcw className="h-4 w-4" /> Reiniciar Tour</button>
        </div>
      </div>
    </div>
  )
}

function ClientBillingModal({ plan, onClose }: { plan: any, onClose: () => void }) {
  const [step, setStep] = useState<'day' | 'pix' | 'sent'>('day')
  const [billingDay, setBillingDay] = useState(10)
  const [pixData, setPixData] = useState({ key: '', name: '', instructions: '' })
  const { state } = useStore() // Para pegar a company
  
  // Busca os dados reais do Pix no banco
  useEffect(() => {
    supabase.from('admin_settings').select('*').eq('id', 1).single().then(({ data }) => {
      if (data) setPixData({ key: data.pix_key, name: data.pix_receiver_name, instructions: data.pix_instructions })
    })
  }, [])

  const handleCreateSubscription = async () => {
    // Aqui chama a RPC create_subscription do Supabase
    const { error } = await supabase.rpc('create_subscription', {
      p_plan_id: plan.id,
      p_billing_day: billingDay,
      p_company_id: state.companies[0].id
    })
    if (error) alert("Erro ao criar assinatura: " + error.message)
    else setStep('pix')
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-md bg-[#16142E] border border-white/10 rounded-3xl p-6 shadow-2xl">
        {step === 'day' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Escolha seu dia de vencimento</h2>
            <p className="text-sm text-white/60">O período de teste é grátis por 30 dias. A primeira cobrança será em:</p>
            <select 
              value={billingDay} 
              onChange={(e) => setBillingDay(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3"
            >
              {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                <option key={day} value={day} className="bg-[#16142E]">Dia {day}</option>
              ))}
            </select>
            <button onClick={handleCreateSubscription} className="w-full bg-brand-pink text-black font-bold py-3 rounded-xl">Confirmar Assinatura</button>
          </div>
        )}

        {step === 'pix' && (
          <div className="space-y-4 text-center">
            <h2 className="text-xl font-bold text-white">Pague via Pix</h2>
            <div className="bg-white/5 p-4 rounded-xl space-y-2">
              <p className="text-xs text-white/50 uppercase">Chave Pix ({plan.name})</p>
              <p className="text-lg font-mono text-brand-pink">{pixData.key || 'Chave não configurada'}</p>
              <p className="text-sm text-white">Titular: {pixData.name}</p>
            </div>
            
            {pixData.key ? (
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(pixData.key)
                  alert("Chave copiada!")
                }}
                className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl transition"
              >
                Copiar Chave Pix
              </button>
            ) : (
              <p className="text-red-400 text-sm">O administrador ainda não configurou a chave Pix.</p>
            )}

            <div className="pt-4 border-t border-white/10">
              <label className="block text-sm text-white/60 mb-2">Envie o comprovante após pagar</label>
              <input type="file" className="w-full text-sm text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-brand-pink/20 file:text-brand-pink" />
              <button onClick={() => setStep('sent')} className="w-full mt-4 bg-brand-pink text-black font-bold py-3 rounded-xl">Já paguei e enviei o comprovante</button>
            </div>
          </div>
        )}

        {step === 'sent' && (
          <div className="text-center space-y-4">
            <CheckCircle2 size={48} className="text-brand-pink mx-auto" />
            <h2 className="text-xl font-bold text-white">Aguardando Confirmação</h2>
            <p className="text-sm text-white/60">O administrador vai conferir seu comprovante e ativar o plano em breve.</p>
            <button onClick={onClose} className="w-full bg-white/10 py-3 rounded-xl text-white">Fechar</button>
          </div>
        )}
      </div>
    </div>
  )
}

function SuperAdmin() {
  const { user } = useSession()
  const { impersonateUser } = useStore() 
  const [companies, setCompanies] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [pendingPayments, setPendingPayments] = useState<any[]>([])
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterPlan, setFilterPlan] = useState('todos')
  
  const [editingCompany, setEditingCompany] = useState<any>(null)
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false)
  const [showNotification, setShowNotification] = useState(false)

  const loadData = async () => {
    setLoading(true)
    const { data, logs } = await db.loadGlobalAdminData()
    if (data) setCompanies(data)
    if (logs) setLogs(logs)
    
    const { data: payments } = await supabase.from('payments').select('*, companies(name)').eq('status', 'waiting_proof').order('created_at', { ascending: false });
    if (payments) {
      setPendingPayments(payments);
      if (payments.length > 0) setShowNotification(true);
    }

    const { data: plansData } = await supabase.from('plans').select('*').order('price_cents');
    if (plansData) setPlans(plansData);
    setLoading(false)
  }

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 10000)
    return () => clearInterval(interval)
  }, [])

const confirmPayment = async (paymentId: string, companyId: string, planId: string) => {
  if (!confirm("Confirmar PIX e ativar plano do cliente?")) return;
  try {
    // 1. Tenta achar o objeto do plano pelo ID ou Slug
    let planObj = plans.find(p => p.id === planId || p.slug === planId);
    
    // 2. Se não achar, tenta achar pelo preço (empresarial/enterprise = 1299)
    if (!planObj) {
      const priceMap: Record<string, number> = {
        'basico': 89.9, 'essencial': 149, 'profissional': 499, 'empresarial': 1299, 'enterprise': 1299
      };
      const expectedPrice = priceMap[planId.toLowerCase()];
      if (expectedPrice) {
        planObj = plans.find(p => (p.price_cents / 100) === expectedPrice);
      }
    }

    // 3. Se ainda não achar, usa o próprio planId (o SQL vai resolver)
    const enumPlan = planObj ? getEnumPlan(planObj) : planId;

    const { error } = await supabase.rpc('admin_approve_payment', {
      p_payment_id: paymentId,
      p_company_id: companyId,
      p_plan_id: enumPlan
    });
    
    if (error) throw error;
    alert("Pagamento confirmado e plano ativado!");
    loadData();
  } catch (error: any) {
    alert("Erro ao confirmar: " + error.message);
  }
}

const handleChangePlan = async () => {
  if (!editingCompany || !selectedPlanId) return;
  setIsUpdatingPlan(true);
  try {
    const planObj = plans.find(p => p.id === selectedPlanId);
    const enumPlan = planObj ? getEnumPlan(planObj) : selectedPlanId;

    const { error } = await supabase.rpc('admin_change_plan', {
      p_company_id: editingCompany.id,
      p_plan_id: enumPlan
    });
    
    if (error) throw error;
    alert("Plano atualizado com sucesso!");
    setEditingCompany(null);
    loadData();
  } catch (error: any) {
    alert("Erro ao mudar plano: " + error.message);
  } finally {
    setIsUpdatingPlan(false);
  }
}
  const handleToggleStatus = async (companyId: string, currentStatus: string) => {
    if (!confirm(`Deseja realmente ${currentStatus === 'active' ? 'suspender' : 'reativar'} o acesso desta empresa?`)) return
    await db.toggleCompanyStatus(companyId, currentStatus, user?.email || '')
    await loadData()
  }

  const clientCompanies = companies.filter(c => c.ownerEmail !== 'suportewynx@gmail.com');
  const filteredCompanies = clientCompanies.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.ownerEmail.toLowerCase().includes(search.toLowerCase());
    const matchPlan = filterPlan === 'todos' || c.plan === filterPlan;
    return matchSearch && matchPlan;
  });

  const activeCompanies = clientCompanies.filter(c => c.status === 'active');
  const totalMRR = activeCompanies.reduce((acc, c) => {
    if (c.plan === 'basico') return acc + 89.90;
    if (c.plan === 'essencial') return acc + 149;
    if (c.plan === 'profissional') return acc + 499;
    if (c.plan === 'empresarial') return acc + 1299;
    return acc;
  }, 0);

  const planDistribution = [
    { name: 'Grátis', value: clientCompanies.filter(c => c.plan === 'gratuito').length, color: '#6B7280' },
    { name: 'Básico', value: clientCompanies.filter(c => c.plan === 'basico').length, color: '#F9A8D4' },
    { name: 'Starter', value: clientCompanies.filter(c => c.plan === 'essencial').length, color: '#06B6D4' },
    { name: 'Business', value: clientCompanies.filter(c => c.plan === 'profissional').length, color: '#C4B5FD' },
    { name: 'Enterprise', value: clientCompanies.filter(c => c.plan === 'empresarial').length, color: '#F5B942' },
  ].filter(p => p.value > 0);

  const growthData = [
    { mes: 'Jul', mrr: totalMRR * 0.4 }, { mes: 'Ago', mrr: totalMRR * 0.6 },
    { mes: 'Set', mrr: totalMRR * 0.7 }, { mes: 'Out', mrr: totalMRR * 0.9 },
    { mes: 'Nov', mrr: totalMRR * 0.95 }, { mes: 'Dez', mrr: totalMRR },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24">
      <AnimatePresence>
        {showNotification && pendingPayments.length > 0 && (
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="fixed top-24 right-8 z-[999] bg-brand-pink text-black px-6 py-4 rounded-2xl shadow-[0_8px_32px_rgba(249,168,212,0.6)] font-bold flex items-center gap-3 cursor-pointer" onClick={() => { setShowNotification(false); document.getElementById('pending-section')?.scrollIntoView({ behavior: 'smooth' }); }}>
            <Bell className="w-6 h-6 animate-ring" /> {pendingPayments.length} PIX aguardando você!
            <X size={18} className="ml-2 opacity-50 hover:opacity-100" onClick={(e) => { e.stopPropagation(); setShowNotification(false); }} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-white/10 bg-[#16142E]/80 p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/20 text-accent shadow-[0_0_30px_rgba(245,185,66,0.3)] border border-accent/30"><Crown className="h-8 w-8" /></div>
          <div><h1 className="text-3xl font-display font-black text-accent">Master Control</h1><p className="text-sm text-white/50">Gestão global, financeira e suporte.</p></div>
        </div>
        <button onClick={loadData} className="relative z-10 flex items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 font-bold transition text-sm text-white"><RefreshCcw className="h-4 w-4" /> Atualizar Dados</button>
      </div>

      {pendingPayments.length > 0 && (
        <div id="pending-section" className="rounded-3xl border-2 border-brand-pink/50 bg-brand-pink/5 p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(249,168,212,0.1)]">
          <h3 className="text-lg font-bold text-brand-pink mb-4 flex items-center gap-2"><Clock className="h-5 w-5" /> Cobranças Aguardando Aprovação ({pendingPayments.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingPayments.map(pay => (
              <div key={pay.id} className="bg-[#16142E] border border-white/10 p-5 rounded-2xl flex flex-col justify-between shadow-lg">
                <div>
                  <p className="font-bold text-white text-lg">{pay.companies?.name}</p>
                  <p className="text-sm text-white/50">Plano: <span className="text-brand-pink uppercase font-bold">{plans.find(p => p.slug === pay.plan_id || p.id === pay.plan_id)?.name || pay.plan_id}</span></p>
                  <p className="text-2xl font-black text-brand-pink mt-2">{formatMoney(pay.amount)}</p>
                  <p className="text-xs text-white/40 mt-1">Solicitado: {new Date(pay.created_at).toLocaleString('pt-BR')}</p>
                </div>
                <button onClick={() => confirmPayment(pay.id, pay.company_id, pay.plan_id)} className="mt-4 w-full bg-brand-pink text-black font-bold py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-2"><CheckCircle2 size={18} /> Confirmar PIX</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl relative overflow-hidden"><div className="absolute top-0 right-0 w-24 h-24 bg-success/10 blur-2xl rounded-full" /><p className="text-xs font-bold uppercase tracking-wider text-white/50">Receita (MRR)</p><p className="mt-2 text-3xl font-black text-success">{formatMoney(totalMRR)}</p></div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl relative overflow-hidden"><div className="absolute top-0 right-0 w-24 h-24 bg-brand-violet/10 blur-2xl rounded-full" /><p className="text-xs font-bold uppercase tracking-wider text-white/50">Empresas Ativas</p><p className="mt-2 text-3xl font-black text-brand-violet">{activeCompanies.length}</p></div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl relative overflow-hidden"><div className="absolute top-0 right-0 w-24 h-24 bg-danger/10 blur-2xl rounded-full" /><p className="text-xs font-bold uppercase tracking-wider text-white/50">Contas Suspensas</p><p className="mt-2 text-3xl font-black text-danger">{clientCompanies.length - activeCompanies.length}</p></div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl relative overflow-hidden"><div className="absolute top-0 right-0 w-24 h-24 bg-brand-cyan/10 blur-2xl rounded-full" /><p className="text-xs font-bold uppercase tracking-wider text-white/50">Total de Usuários</p><p className="mt-2 text-3xl font-black text-brand-cyan">{clientCompanies.reduce((acc, c) => acc + c.membersCount, 0)}</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white/50 mb-6">Evolução de Receita (MRR)</h3>
          <div className="h-56 w-full"><ResponsiveContainer><BarChart data={growthData}><CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} /><XAxis dataKey="mes" fontSize={12} stroke="currentColor" opacity={0.5} /><YAxis fontSize={12} stroke="currentColor" opacity={0.5} tickFormatter={(v) => `R$ ${v}`} /><Tooltip formatter={(value: number) => formatMoney(value)} contentStyle={{ backgroundColor: '#16142E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} /><Bar dataKey="mrr" fill="#F9A8D4" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white/50 mb-6">Distribuição de Planos</h3>
          <div className="h-56 w-full flex items-center justify-center"><ResponsiveContainer><PieChart><Pie data={planDistribution} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} stroke="none" paddingAngle={5}>{planDistribution.map((entry, index) => (<Cell key={index} fill={entry.color} />))}</Pie><Tooltip contentStyle={{ backgroundColor: '#16142E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} /></PieChart></ResponsiveContainer></div>
          <div className="flex flex-wrap justify-center gap-3 mt-4">{planDistribution.map(p => (<div key={p.name} className="flex items-center gap-1.5 text-xs text-white/60"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></span> {p.name} ({p.value})</div>))}</div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <h3 className="text-lg font-bold flex items-center gap-2 text-white"><Building2 className="h-5 w-5 text-brand-pink" /> Gestão de Clientes</h3>
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
            <input type="text" placeholder="Buscar empresa ou e-mail..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full sm:w-64 rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white outline-none focus:border-brand-pink" />
            <select value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)} className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white outline-none focus:border-brand-pink">
              <option value="todos">Todos os Planos</option><option value="gratuito">Gratuito</option><option value="basico">Básico</option><option value="essencial">Starter</option><option value="profissional">Business</option><option value="empresarial">Enterprise</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs uppercase bg-white/5 text-white/50"><tr><th className="px-4 py-3 rounded-l-xl">Empresa / Dono</th><th className="px-4 py-3">Plano</th><th className="px-4 py-3">Equipe</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Criada em</th><th className="px-4 py-3 text-right rounded-r-xl">Ações</th></tr></thead>
            <tbody>
              {loading ? (<tr><td colSpan={6} className="text-center py-8 text-white/50">Carregando dados globais...</td></tr>) : filteredCompanies.length === 0 ? (<tr><td colSpan={6} className="text-center py-8 text-white/50">Nenhuma empresa encontrada.</td></tr>) : (
                filteredCompanies.map((c) => (
                  <tr key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition">
                    <td className="px-4 py-4"><p className="font-bold text-white">{c.name}</p><p className="text-xs text-white/50">{c.ownerName} ({c.ownerEmail})</p></td>
                    <td className="px-4 py-4">
                      <button onClick={() => { setEditingCompany(c); setSelectedPlanId(c.plan); }} className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase transition-all duration-300 flex items-center gap-1.5 hover:scale-105 hover:shadow-lg ${c.plan === 'gratuito' ? 'bg-white/10 text-white/70 hover:bg-white/20' : c.plan === 'basico' ? 'bg-brand-pink/20 text-brand-pink hover:bg-brand-pink/30 hover:shadow-[0_0_15px_rgba(249,168,212,0.4)]' : c.plan === 'essencial' ? 'bg-brand-cyan/20 text-brand-cyan hover:bg-brand-cyan/30 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]' : c.plan === 'profissional' ? 'bg-brand-violet/20 text-brand-violet hover:bg-brand-violet/30 hover:shadow-[0_0_15px_rgba(196,181,253,0.4)]' : 'bg-accent/20 text-accent hover:bg-accent/30 hover:shadow-[0_0_15px_rgba(245,185,66,0.4)]'}`}>
                        {c.plan} <Edit3 size={12} className="ml-0.5" />
                      </button>
                    </td>
                    <td className="px-4 py-4 text-white/70">{c.membersCount} usuários</td>
                    <td className="px-4 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 w-max ${c.status === 'active' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}><span className={`w-1.5 h-1.5 rounded-full ${c.status === 'active' ? 'bg-success' : 'bg-danger'}`}></span>{c.status === 'active' ? 'Ativa' : 'Suspensa'}</span></td>
                    <td className="px-4 py-4 text-white/50">{new Date(c.created_at).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-4 text-right flex items-center justify-end gap-2">
                      <button onClick={() => { if (confirm(`Deseja acessar o painel da empresa ${c.name}?`)) impersonateUser(c.owner_id) }} className="p-2 rounded-lg bg-brand-cyan/10 text-brand-cyan hover:bg-brand-cyan/20 transition" title="Entrar como Cliente"><LogIn className="h-4 w-4" /></button>
                      <button onClick={() => handleToggleStatus(c.id, c.status)} className={`p-2 rounded-lg transition ${c.status === 'active' ? 'bg-danger/10 text-danger hover:bg-danger/20' : 'bg-success/10 text-success hover:bg-success/20'}`} title={c.status === 'active' ? 'Suspender Conta' : 'Reativar Conta'}>{c.status === 'active' ? <Ban className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white"><FileText className="h-5 w-5 text-brand-cyan" /> Últimas Ações Administrativas</h3>
        <div className="space-y-3">
          {logs.length === 0 ? (<p className="text-sm text-white/50">Nenhuma ação registrada.</p>) : logs.map(log => (
            <div key={log.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 rounded-xl border border-white/5 bg-black/20 text-sm"><div><span className="font-bold text-white">{log.action}</span><span className="text-white/50 ml-2">{log.details}</span></div><span className="text-xs text-white/40">{new Date(log.created_at).toLocaleString('pt-BR')}</span></div>
          ))}
        </div>
      </div>

      {editingCompany && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative w-full max-w-md bg-[#0f172a] border border-white/10 rounded-[32px] p-8 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-brand-pink/20 blur-[80px] rounded-full pointer-events-none" />
            <button onClick={() => setEditingCompany(null)} className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors z-10"><X size={20} className="text-white" /></button>
            <div className="text-center mb-8 relative z-10"><h2 className="text-2xl font-display font-bold text-white">Alterar Plano</h2><p className="text-sm text-white/50 mt-1">Empresa: <span className="text-brand-pink font-medium">{editingCompany.name}</span></p></div>
            <div className="space-y-3 relative z-10 max-h-[50vh] overflow-y-auto pr-2">
              {plans.map(plan => (
                <div key={plan.id} onClick={() => setSelectedPlanId(plan.id)} className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 relative overflow-hidden ${selectedPlanId === plan.id ? 'bg-brand-pink/10 border-brand-pink/50 shadow-[inset_0_1px_1px_rgba(249,168,212,0.2)]' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                  {selectedPlanId === plan.id && (<div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-pink" />)}
                  <div className="flex justify-between items-center">
                    <div><p className={`font-bold ${selectedPlanId === plan.id ? 'text-brand-pink' : 'text-white'}`}>{plan.name}</p><p className="text-xs text-white/50 mt-1 flex gap-2"><span>{plan.product_limit ? `${plan.product_limit} prod.` : 'Prod. Ilimitados'}</span><span>•</span><span>{plan.user_limit ? `${plan.user_limit} usuários` : 'Usuários Ilimitados'}</span></p></div>
                    <div className="text-right"><p className={`font-black ${selectedPlanId === plan.id ? 'text-white' : 'text-white/80'}`}>{formatMoney(plan.price_cents / 100)}</p><p className="text-[10px] text-white/50">/mês</p></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-8 relative z-10">
              <button onClick={() => setEditingCompany(null)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3.5 rounded-xl font-medium transition">Cancelar</button>
              <button onClick={handleChangePlan} disabled={isUpdatingPlan || selectedPlanId === editingCompany.plan} className="flex-1 bg-brand-pink text-black py-3.5 rounded-xl font-bold transition hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(249,168,212,0.3)]">{isUpdatingPlan ? 'Salvando...' : 'Confirmar Mudança'}</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

const getEnumPlan = (plan: any) => {
  // 1. Tenta pelo ID (se for exatamente um dos valores válidos)
  const validEnums = ['gratuito', 'basico', 'essencial', 'profissional', 'empresarial'];
  if (validEnums.includes(plan.id)) return plan.id;
  if (validEnums.includes(plan.slug)) return plan.slug;

  // 2. Fallback: Traduz pelo preço (que é infalível)
  const price = plan.price_cents / 100;
  if (price >= 89 && price <= 90) return 'basico';
  if (price >= 148 && price <= 150) return 'essencial';
  if (price >= 498 && price <= 500) return 'profissional'; // Aqui resolve o 'business' -> 'profissional'
  if (price >= 1290 && price <= 1300) return 'empresarial';
  
  return 'gratuito'; // Segurança
};

function PixCheckoutModal({ plan, onClose }: { plan: any, onClose: () => void }) {
  const { state } = useStore(); 
  const [step, setStep] = useState<'day' | 'link' | 'done'>('day');
  const [billingDay, setBillingDay] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatPrice = (cents: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

  const getLink = () => {
    const price = plan.price_cents / 100;
    const id = String(plan.id).toLowerCase();
    if (price === 89.9 || price === 89 || id.includes('basico') || id.includes('basic')) return 'https://nubank.com.br/cobrar/7iyotr/6af135f5-64d4-4570-a7d3-69c6659c8ef2';
    if (price === 149 || id.includes('essencial') || id.includes('starter')) return 'https://nubank.com.br/cobrar/7iyotr/6af13173-d366-4765-b03e-ee1e96fadf9c';
    if (price === 499 || id.includes('profissional') || id.includes('business')) return 'https://nubank.com.br/cobrar/7iyotr/6af131d3-3b77-45f9-a58b-36163916925d';
    if (price === 1299 || id.includes('empresarial') || id.includes('enterprise')) return 'https://nubank.com.br/cobrar/7iyotr/6af13211-97d9-423e-881f-4003bb8de23c';
    return 'https://nubank.com.br/cobrar/7iyotr/6af135f5-64d4-4570-a7d3-69c6659c8ef2';
  };

const handlePaymentDone = async () => {
  const companyId = state.companies[0]?.id;
  if (!companyId) return alert("Erro: Empresa não encontrada.");
  setIsSubmitting(true);

  try {
    // Usa a mesma lógica para evitar salvar UUIDs ou slugs errados
    const price = plan.price_cents / 100;
    let enumPlan = 'gratuito';
    if (price >= 89 && price <= 90) enumPlan = 'basico';
    if (price >= 148 && price <= 150) enumPlan = 'essencial';
    if (price >= 498 && price <= 500) enumPlan = 'profissional';
    if (price >= 1290 && price <= 1300) enumPlan = 'empresarial';

    const { error } = await supabase.from('payments').insert([{
      company_id: companyId,
      plan_id: enumPlan, // Salva 'profissional' (que o banco aceita)
      amount: plan.price_cents / 100,
      status: 'waiting_proof',
      billing_day: billingDay
    }]);
    if (error) throw error;
    setStep('done');
  } catch (err: any) {
    alert("Erro ao registrar pagamento: " + err.message);
  } finally {
    setIsSubmitting(false);
  }
};
  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-md bg-[#16142E] border border-white/10 rounded-3xl p-6 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>

        {step === 'day' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-white">Escolha o dia de vencimento</h2>
              <p className="text-sm text-white/50 mt-1">Plano {plan.name} • {formatPrice(plan.price_cents)}/mês</p>
            </div>
            <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
              <label className="text-xs text-white/50 uppercase font-bold block mb-2">Dia do mês</label>
              <select value={billingDay} onChange={(e) => setBillingDay(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:border-brand-pink">
                {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (<option key={day} value={day} className="bg-[#16142E]">Dia {day}</option>))}
              </select>
            </div>
            <div className="bg-brand-pink/10 border border-brand-pink/20 p-4 rounded-xl text-center">
              <p className="text-xs text-brand-pink/80">Período de teste de 30 dias grátis.</p>
              <p className="text-sm font-bold text-brand-pink mt-1">Primeira cobrança em {billingDay}/12/2026</p>
            </div>
            <button onClick={() => setStep('link')} className="w-full bg-brand-pink hover:bg-brand-pink/90 text-black font-bold py-3 rounded-xl transition">Ir para Pagamento</button>
          </div>
        )}

        {step === 'link' && (
          <div className="space-y-6 text-center">
            <div>
              <h2 className="text-xl font-bold text-white">Finalize seu Pagamento</h2>
              <p className="text-sm text-white/50 mt-1">Valor: {formatPrice(plan.price_cents)}</p>
            </div>
            <div className="bg-brand-pink/10 border border-brand-pink/30 p-4 rounded-2xl">
              <p className="text-xs text-white/50 uppercase mb-2">Link de Pagamento Seguro</p>
              <a href={getLink()} target="_blank" rel="noopener noreferrer" className="block w-full text-brand-pink font-mono text-sm break-all hover:underline">{getLink()}</a>
            </div>
            <p className="text-sm text-white/60">Clique no link acima para abrir a página de pagamento no site do Nubank.</p>
            <div className="pt-2">
              <button onClick={handlePaymentDone} disabled={isSubmitting} className="w-full bg-brand-pink hover:bg-brand-pink/90 disabled:opacity-50 text-black font-bold py-3 rounded-xl transition text-sm flex justify-center items-center gap-2">
                {isSubmitting ? 'Registrando...' : 'Já realizei o pagamento'}
              </button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="text-center space-y-4 py-6">
            <CheckCircle2 size={48} className="text-brand-pink mx-auto" />
            <h2 className="text-xl font-bold text-white">Aguardando Confirmação</h2>
            <p className="text-sm text-white/60">O administrador vai verificar o recebimento e ativar seu plano.</p>
            <button onClick={onClose} className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition">Entendido</button>
          </div>
        )}
      </motion.div>
    </div>,
    document.body
  );
}

function Billing() {
  const { company, plans, subscription, products, team } = useSession()
  const { changePlan } = useStore()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [showCheckout, setShowCheckout] = useState<string | null>(null)

  const currentPlan = plans.find(p => p.id === subscription?.plan_id)
  const isTrial = subscription?.status === 'trialing'
  
  const trialDaysLeft = subscription?.trial_ends_at ? Math.max(0, Math.ceil((new Date(subscription.trial_ends_at).getTime() - Date.now()) / (1000 * 3600 * 24))) : 0
  const productsUsed = products.length
  const usersUsed = team.length

  const handleUpgrade = async (planId: string) => {
    setLoadingPlan(planId)
    
    // Simula 1 segundo de processamento no banco após o usuário clicar em "Já paguei"
    setTimeout(async () => {
      const success = await changePlan(planId)
      setLoadingPlan(null)
      setShowCheckout(null)
      if (!success) alert('Erro ao ativar o plano. Verifique o console.')
    }, 1000)
  }

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
  }

  const selectedPlan = plans.find(p => p.id === showCheckout)

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Assinatura</h1>
          <p className="text-sm text-text-muted dark:text-white/50">Gerencie seu plano e limites de uso.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        
        {/* CARD: Status Atual e Consumo */}
        <div className="md:col-span-1 rounded-3xl border border-border-subtle dark:border-white/10 bg-bg-surface/80 dark:bg-[#16142E]/80 p-6 shadow-xl backdrop-blur-xl h-fit">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Seu Plano</h3>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
              isTrial ? 'bg-brand-cyan/20 text-brand-cyan' : 'bg-success/20 text-success'
            }`}>
              {subscription?.status || 'Sem assinatura'}
            </span>
          </div>
          
          <p className="text-2xl font-black text-brand-violet">{currentPlan?.name || 'Gratuito'}</p>
          <p className="text-sm text-text-muted mt-1">{currentPlan ? formatPrice(currentPlan.price_cents) + '/mês' : 'R$ 0,00'}</p>

          {isTrial && (
            <div className="mt-4 p-3 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20">
              <p className="text-sm font-bold text-brand-cyan">Período de Teste</p>
              <p className="text-xs text-brand-cyan/80 mt-1">Faltam {trialDaysLeft} dias. Aproveite todos os recursos.</p>
            </div>
          )}

          <div className="space-y-4 mt-8">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-muted">Produtos</span>
                <span className="font-bold">{productsUsed} / {currentPlan?.product_limit || '∞'}</span>
              </div>
              <div className="h-2 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-brand-violet rounded-full" style={{ width: `${currentPlan?.product_limit ? Math.min(100, (productsUsed/currentPlan.product_limit)*100) : 5}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-muted">Equipe</span>
                <span className="font-bold">{usersUsed} / {currentPlan?.user_limit || '∞'}</span>
              </div>
              <div className="h-2 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-brand-pink rounded-full" style={{ width: `${currentPlan?.user_limit ? Math.min(100, (usersUsed/currentPlan.user_limit)*100) : 5}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* GRID DE PLANOS */}
        <div className="md:col-span-2 grid gap-4 sm:grid-cols-2">
          {plans.map(p => {
            const isCurrent = p.id === currentPlan?.id
            return (
              <div key={p.id} className={`rounded-3xl border p-6 flex flex-col justify-between ${isCurrent ? 'border-brand-pink bg-brand-pink/5 shadow-lg' : 'border-border-subtle dark:border-white/10 bg-white/50 dark:bg-white/5'}`}>
                <div>
                  <p className="font-bold text-lg">{p.name}</p>
                  <p className="text-3xl font-black mt-2">{formatPrice(p.price_cents)}<span className="text-xs font-normal text-text-muted">/mês</span></p>
                  
                  <ul className="mt-6 space-y-3 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success" /> 
                      {p.product_limit ? `Até ${p.product_limit} produtos` : 'Produtos ilimitados'}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success" /> 
                      {p.user_limit ? `Até ${p.user_limit} usuários` : 'Usuários ilimitados'}
                    </li>
                    {p.features.map((f: string) => (
                      <li key={f} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  {isCurrent ? (
                    <button disabled className="w-full rounded-xl bg-black/5 dark:bg-white/10 py-3 font-bold text-text-muted cursor-default">Plano Atual</button>
                  ) : (
                    <button 
                      onClick={() => setShowCheckout(p.id)}
                      className="w-full rounded-xl bg-brand-gradient py-3 font-bold text-white transition hover:scale-105 shadow-lg"
                    >
                      Fazer Upgrade
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* MODAL DE CHECKOUT PIX */}
      {showCheckout && selectedPlan && (
<PixCheckoutModal 
  plan={{
    id: selectedPlan.id,
    name: selectedPlan.name,
    price_cents: selectedPlan.price_cents
  }}
  onClose={() => setShowCheckout(null)}
/>
      )}
    </div>
  )
}