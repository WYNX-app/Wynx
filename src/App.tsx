import { PasswordField } from './components/PasswordField'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import {
  categoryShare,
  companyProducts,
  formatDate,
  formatMoney,
  labelMovement,
  salesByDay,
  topProducts
} from './engine'
import { useSession, useStore } from './store'
import { MovementType, PLANS, PageId, PlanId, Product, Role, SEGMENTS } from './types'
import { Logo, Modal, NAV, Stat } from './ui'
import Aurora from './components/Aurora'
import ThemeToggle from './components/ThemeToggle'

const COLORS = ['#1D6FBE', '#06B6D4', '#FFB84D', '#CDA8FF', '#FFABD0', '#1A3A6B']

export default function App() {
  const { ready, state } = useStore()
  const [splash, setSplash] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 1400)
    return () => clearTimeout(t)
  }, [])

  if (!ready || splash) return <Splash />
  if (!state.sessionUserId) return <Auth />
  return <Shell />
}

/* ============================================================
   SPLASH
   ============================================================ */
function Splash() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-gradient-to-br from-[#1A0B2E] via-[#2A1145] to-[#1A0B2E] px-6">
      <Aurora variant="splash" />

      <div className="relative z-10 text-center">
        <Logo className="mx-auto h-28 w-28 wynx-logo-pulse sm:h-36 sm:w-36 md:h-44 md:w-44" />

        <h1 className="mt-6 font-display text-5xl font-extrabold tracking-tight wynx-fade-up wynx-delay-1 sm:text-6xl md:text-7xl">
          <span className="wynx-title-gradient">WYNX</span>
        </h1>

        <p className="mx-auto mt-5 max-w-lg text-base text-white/85 wynx-fade-up wynx-delay-2 sm:mt-6 sm:text-lg">
          Transformando o controle de estoque em inteligência para o seu negócio.
        </p>

        <div className="mx-auto mt-10 flex justify-center gap-2 wynx-fade-in wynx-delay-3 sm:mt-12">
          <span className="h-2 w-2 rounded-full bg-brand-pink wynx-logo-pulse" />
          <span className="h-2 w-2 rounded-full bg-brand-violet wynx-logo-pulse" style={{ animationDelay: '0.2s' }} />
          <span className="h-2 w-2 rounded-full bg-brand-cyan wynx-logo-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   AUTH
   ============================================================ */
function Auth() {
  const { login, register, error, setError } = useStore()
  const [mode, setMode] = useState<'login' | 'cadastro'>('login')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
    segment: SEGMENTS[0],
    city: '',
    stateUf: 'PI'
  })

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (mode === 'login') await login(form.email, form.password)
    else await register({ ...form })
  }

  return (
    <div className="grid min-h-screen place-items-center p-4 sm:p-6">
      <div className="card grid w-full max-w-5xl overflow-hidden md:grid-cols-2">
        {/* Painel esquerdo — só visível em md+ */}
        <div className="relative hidden min-h-[640px] overflow-hidden bg-gradient-to-br from-[#2A1145] via-[#1A0B2E] to-[#3A1F5C] md:block">
          <Aurora variant="login" />

          <div className="relative z-10 flex h-full flex-col p-8 text-white">
            <Logo className="h-20 w-20 wynx-logo-pulse" />

            <h1 className="mt-8 font-display text-4xl font-extrabold leading-tight wynx-fade-up wynx-delay-1">
              Gestão inteligente
              <br />
              de estoque
            </h1>

            <p className="mt-4 max-w-md text-sm text-white/85 wynx-fade-up wynx-delay-2">
              Saiba o que tem, o que está acabando, o que está parado e o que fazer a seguir.
            </p>

            <ul className="mt-8 space-y-2.5 text-sm text-white/85 wynx-fade-up wynx-delay-3">
              {[
                'Cadastro de produtos, entradas e saídas',
                'Alertas de estoque mínimo',
                'Relatórios e insights com dados reais',
                'Equipe, permissões e planos SaaS'
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-auto rounded-2xl border border-white/20 bg-white/10 p-4 text-sm backdrop-blur wynx-fade-up wynx-delay-4">
              <p className="font-semibold">Pronto para começar?</p>
              <p className="mt-1 text-white/80">
                Crie sua conta gratuitamente e controle seu estoque em menos de 1 minuto.
              </p>
            </div>
          </div>
        </div>

        {/* Painel direito — formulário */}
        <form className="relative flex flex-col justify-center space-y-3 p-6 sm:p-8" onSubmit={submit}>
          {/* Header mobile com logo */}
          <div className="mb-4 flex items-center justify-between md:hidden">
            <div className="flex items-center gap-2">
              <Logo className="h-10 w-10" />
              <span className="font-display text-xl font-bold">WYNX</span>
            </div>
            <ThemeToggle />
          </div>

          {/* ThemeToggle desktop */}
          <div className="absolute right-4 top-4 hidden md:block">
            <ThemeToggle />
          </div>

          <div className="mb-2">
            <h2 className="font-display text-2xl font-bold text-text-primary">
              {mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              {mode === 'login' ? 'Acesse o painel da sua empresa' : 'Comece grátis em menos de 1 minuto'}
            </p>
          </div>

          <div className="flex gap-2 text-sm">
            {(['login', 'cadastro'] as const).map((m) => (
              <button
                type="button"
                key={m}
                className={`rounded-full px-3 py-1.5 font-medium transition ${
                  mode === m
                    ? 'bg-brand-gradient text-white shadow-soft'
                    : 'bg-bg-soft text-text-secondary hover:bg-brand-violet/20'
                }`}
                onClick={() => {
                  setMode(m)
                  setError(null)
                }}
              >
                {m === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>

          {mode === 'cadastro' && (
            <>
              <input className="field" placeholder="Seu nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <input className="field" placeholder="Nome da empresa" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
              <select className="field" value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value })}>
                {SEGMENTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input className="field" placeholder="Cidade" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
                <input className="field" placeholder="UF" maxLength={2} value={form.stateUf} onChange={(e) => setForm({ ...form, stateUf: e.target.value })} required />
              </div>
            </>
          )}

          <input className="field" type="email" placeholder="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />

          <PasswordField
            placeholder="Senha"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          {error && (
            <div className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </div>
          )}

          <button className="btn-primary w-full" type="submit">
            {mode === 'login' ? 'Acessar a WYNX' : 'Criar minha empresa'}
          </button>

          <p className="pt-2 text-center text-xs text-text-muted">
            Ao continuar você concorda com os Termos e a Política de Privacidade.
          </p>
        </form>
      </div>
    </div>
  )
}

/* ============================================================
   SHELL (layout logado)
   ============================================================ */
function Shell() {
  const { user, company, notifications } = useSession()
  const { logout } = useStore()
  const [page, setPage] = useState<PageId>('dashboard')
  const [q, setQ] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const unread = notifications.filter((n) => !n.read).length

  // Fechar menu ao trocar de página
  const goTo = (id: PageId) => {
    setPage(id)
    setQ('')
    setMenuOpen(false)
  }

  // Atalhos de teclado
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        if (document.activeElement === searchRef.current) {
          setQ('')
          searchRef.current?.blur()
        }
      }
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Bloquear scroll do body quando menu mobile está aberto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const searchActive = q.trim().length > 0
  const pageLabel = NAV.find((n) => n.id === page)?.label

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      {/* Backdrop mobile */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-72 flex-col
          bg-gradient-to-b from-brand-pink via-brand-violet to-brand-blue
          text-text-primary transition-transform duration-300 ease-out
          lg:static lg:z-0 lg:translate-x-0
          ${menuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <Logo className="h-10 w-10 lg:h-12 lg:w-12" />
            <div className="min-w-0">
              <p className="font-display text-xl font-bold lg:text-2xl">WYNX</p>
              <p className="truncate text-xs text-text-secondary lg:text-sm">{company?.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Fechar menu"
            className="rounded-lg p-2 text-text-primary/70 transition hover:bg-white/30 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-3">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => goTo(item.id)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-base transition ${
                page === item.id
                  ? 'bg-white/60 text-text-primary font-semibold'
                  : 'text-text-primary/80 hover:bg-white/30'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </span>
              {item.id === 'alertas' && unread > 0 && (
                <span className="rounded-full bg-accent-1 px-2 text-xs text-black">{unread}</span>
              )}
            </button>
          ))}
        </nav>

        <button
          className="m-3 rounded-xl bg-white/50 px-3 py-3 text-base font-medium text-text-primary transition hover:bg-white/70"
          onClick={() => {
            setMenuOpen(false)
            logout()
          }}
        >
          Sair
        </button>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="mb-4 flex flex-col gap-3 border-b border-border-subtle px-4 py-4 sm:mb-6 sm:px-6 lg:border-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menu"
              className="rounded-xl border border-border-subtle bg-bg-surface p-2.5 text-text-primary transition hover:bg-bg-soft active:scale-95 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1">
              <h2 className="truncate font-display text-xl font-bold capitalize sm:text-2xl">
                {pageLabel}
              </h2>
              <p className="truncate text-xs text-text-muted sm:text-sm">
                Olá, {user?.name} · <span className="capitalize">{user?.role}</span>
                <span className="hidden sm:inline">
                  {' '}· Plano {company ? PLANS[company.plan].name : ''}
                </span>
              </p>
            </div>

            <div className="hidden items-center gap-3 lg:flex">
              <div className="relative">
                <input
                  ref={searchRef}
                  className="field w-72 pr-16"
                  placeholder="Busca global..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
                {q ? (
                  <button
                    type="button"
                    onClick={() => setQ('')}
                    aria-label="Limpar busca"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs text-text-muted transition hover:bg-bg-soft hover:text-text-primary"
                  >
                    Limpar
                  </button>
                ) : (
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border-subtle px-1.5 py-0.5 text-xs text-text-muted">
                    /
                  </span>
                )}
              </div>
              <ThemeToggle />
            </div>
          </div>

          {/* Busca mobile + toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="relative flex-1">
              <input
                ref={searchRef}
                className="field w-full pr-16"
                placeholder="Buscar..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              {q && (
                <button
                  type="button"
                  onClick={() => setQ('')}
                  aria-label="Limpar busca"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs text-text-muted transition hover:bg-bg-soft"
                >
                  Limpar
                </button>
              )}
            </div>
            <ThemeToggle />
          </div>
        </header>

        <div className="flex-1 px-4 pb-8 sm:px-6">
          {searchActive && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-brand-violet/30 bg-brand-violet/10 px-3 py-2 text-sm text-text-secondary animate-[wynx-fade-in_0.3s_ease-out]">
              <span className="min-w-0 truncate">
                Buscando por <strong className="text-text-primary">"{q}"</strong>
              </span>
              <button
                type="button"
                onClick={() => setQ('')}
                className="ml-auto shrink-0 text-xs font-medium text-brand-violet hover:underline"
              >
                limpar
              </button>
            </div>
          )}

          {page === 'dashboard' && <Dashboard q={q} go={goTo} />}
          {page === 'produtos' && <Products q={q} />}
          {page === 'estoque' && <Stock q={q} />}
          {page === 'relatorios' && <Reports q={q} />}
          {page === 'insights' && <Insights q={q} />}
          {page === 'alertas' && <Alerts q={q} />}
          {page === 'historico' && <History q={q} />}
          {page === 'equipe' && <Team q={q} />}
          {page === 'perfil' && <Profile />}
          {page === 'configuracoes' && <Settings />}
          {page === 'assinatura' && <Billing />}
          {page === 'suporte' && <Support />}
        </div>
      </main>
    </div>
  )
}

/* ============================================================
   DASHBOARD
   ============================================================ */
function Dashboard({ q, go }: { q: string; go: (p: PageId) => void }) {
  const { state } = useStore()
  const { kpis: k, products, movements, insights, notifications } = useSession()
  const line = salesByDay(state)
  const pie = categoryShare(state)
  const filtered = products.filter((p) => matches(p, q)).slice(0, 6)

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat label="Produtos" value={String(k.products)} hint={`${k.units} un. em saldo`} />
        <Stat label="Estoque baixo" value={String(k.low)} hint="No mínimo ou abaixo" />
        <Stat label="Capital em estoque" value={formatMoney(k.value)} />
        <Stat label="Receita das vendas" value={formatMoney(k.revenue)} hint={`${k.sales} vendas`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-4 lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold sm:text-base">Vendas (unidades) — 14 dias</h3>
          <div className="h-56 sm:h-64">
            <ResponsiveContainer>
              <LineChart data={line}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" fontSize={11} />
                <YAxis allowDecimals={false} fontSize={11} />
                <Tooltip />
                <Line type="monotone" dataKey="qty" stroke="#1D6FBE" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-4">
          <h3 className="mb-3 text-sm font-semibold sm:text-base">Saldo por categoria</h3>
          <div className="h-56 sm:h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pie} dataKey="qty" nameKey="name" outerRadius={70} label>
                  {pie.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold sm:text-base">Insights da IA</h3>
            <button className="text-xs text-blue-brand sm:text-sm" onClick={() => go('insights')}>
              Ver todos
            </button>
          </div>
          <div className="space-y-3">
            {insights.slice(0, 3).map((i) => (
              <div key={i.id} className="rounded-xl bg-ice p-3">
                <p className="text-xs uppercase text-cyan-brand">{i.severity}</p>
                <p className="font-semibold">{i.title}</p>
                <p className="text-sm text-navy/70">{i.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <h3 className="mb-3 text-sm font-semibold sm:text-base">Movimentações recentes</h3>
          <ul className="space-y-2">
            {movements.slice(0, 6).map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-2 border-b border-mist py-2 text-sm last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{m.productName}</p>
                  <p className="text-xs text-text-muted">
                    {labelMovement(m.type)} · {m.qty} un.
                  </p>
                </div>
                <span className="shrink-0 text-xs text-navy/50">{formatDate(m.createdAt)}</span>
              </li>
            ))}
          </ul>
          {filtered.length > 0 && q && (
            <p className="mt-3 text-sm text-navy/60">{filtered.length} produto(s) encontrados na busca.</p>
          )}
          {notifications[0] && (
            <p className="mt-3 rounded-xl bg-pink-100 px-3 py-2 text-sm">{notifications[0].message}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function matches(p: Product, q: string) {
  const s = normalize(q.trim())
  if (!s) return true
  return normalize(
    [p.name, p.sku, p.category, p.color, p.size, p.barcode].join(' ')
  ).includes(s)
}

/* ============================================================
   PRODUTOS
   ============================================================ */
function Products({ q }: { q: string }) {
  const { saveProduct, removeProduct, error, state } = useStore()
  const { products, categories, user } = useSession()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [category, setCategory] = useState('todas')
  const list = products.filter((p) => matches(p, q) && (category === 'todas' || p.category === category))

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <button className="btn-primary w-full sm:w-auto" onClick={() => { setEditing(null); setOpen(true) }}>
          Novo produto
        </button>
        <select className="field w-full sm:max-w-xs" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="todas">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {/* Desktop: tabela */}
      <div className="card hidden overflow-auto md:block">
        <table className="w-full text-sm">
          <thead className="bg-mist text-left">
            <tr>
              <th className="p-3">Produto</th>
              <th>Código</th>
              <th>Categoria</th>
              <th>Preço</th>
              <th>Saldo</th>
              <th>Mínimo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-t border-mist">
                <td className="p-3 font-medium">
                  {p.name}
                  <div className="text-xs text-navy/50">{p.color} {p.size}</div>
                </td>
                <td>{p.sku}</td>
                <td>{p.category}</td>
                <td>{formatMoney(p.price)}</td>
                <td className={p.qty <= p.minQty ? 'font-bold text-red-600' : ''}>{p.qty}</td>
                <td>{p.minQty}</td>
                <td className="p-3 text-right">
                  <button className="btn-ghost mr-2 px-3 py-1" onClick={() => { setEditing(p); setOpen(true) }}>
                    Editar
                  </button>
                  {user?.role === 'administrador' && (
                    <button className="btn-ghost px-3 py-1" onClick={() => removeProduct(p.id)}>
                      Excluir
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-sm text-text-muted">
                  {q ? `Nada encontrado para "${q}".` : 'Nenhum produto cadastrado.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards */}
      <div className="space-y-3 md:hidden">
        {list.length === 0 && (
          <div className="card p-6 text-center text-sm text-text-muted">
            {q ? `Nada encontrado para "${q}".` : 'Nenhum produto cadastrado.'}
          </div>
        )}
        {list.map((p) => (
          <div key={p.id} className="card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{p.name}</p>
                <p className="mt-0.5 text-xs text-text-muted">
                  {p.sku} · {p.category}
                  {p.color && ` · ${p.color}`}
                  {p.size && ` · ${p.size}`}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                p.qty === 0
                  ? 'bg-red-100 text-red-700'
                  : p.qty <= p.minQty
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-700'
              }`}>
                {p.qty} un.
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 text-sm">
              <div>
                <p className="text-xs text-text-muted">Preço</p>
                <p className="font-medium">{formatMoney(p.price)}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Mínimo</p>
                <p className="font-medium">{p.minQty} un.</p>
              </div>
              <div className="flex gap-2">
                <button className="btn-ghost px-3 py-1.5 text-xs" onClick={() => { setEditing(p); setOpen(true) }}>
                  Editar
                </button>
                {user?.role === 'administrador' && (
                  <button className="btn-ghost px-3 py-1.5 text-xs" onClick={() => removeProduct(p.id)}>
                    Excluir
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <ProductForm
          product={editing}
          categories={categories.length ? categories : ['Geral']}
          onClose={() => setOpen(false)}
          onSave={(data) => {
            if (saveProduct(data)) setOpen(false)
          }}
        />
      )}

      {companyProducts(state).length === 0 && (
        <p className="mt-4 text-sm text-text-muted">Nenhum produto cadastrado ainda.</p>
      )}
    </div>
  )
}

function ProductForm({
  product,
  categories,
  onClose,
  onSave
}: {
  product: Product | null
  categories: string[]
  onClose: () => void
  onSave: (data: any) => void
}) {
  const [form, setForm] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    category: product?.category || categories[0],
    color: product?.color || '',
    size: product?.size || '',
    barcode: product?.barcode || '',
    price: product?.price || 0,
    cost: product?.cost || 0,
    qty: product?.qty || 0,
    minQty: product?.minQty || 3,
    notes: product?.notes || ''
  })
  return (
    <Modal title={product ? 'Editar produto' : 'Cadastrar produto'} onClose={onClose}>
      <form
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault()
          onSave({ ...form, id: product?.id })
        }}
      >
        <input className="field sm:col-span-2" placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="field" placeholder="Código / SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
        <select className="field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input className="field" placeholder="Cor" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
        <input className="field" placeholder="Tamanho" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} />
        <input className="field" placeholder="Código de barras" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
        <input className="field" type="number" step="0.01" placeholder="Preço" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
        <input className="field" type="number" step="0.01" placeholder="Custo" value={form.cost} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })} />
        {!product && (
          <input className="field" type="number" placeholder="Quantidade inicial" value={form.qty} onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })} />
        )}
        <input className="field" type="number" placeholder="Estoque mínimo" value={form.minQty} onChange={(e) => setForm({ ...form, minQty: Number(e.target.value) })} />
        <textarea className="field sm:col-span-2" placeholder="Observações" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <button className="btn-primary sm:col-span-2" type="submit">
          Salvar
        </button>
      </form>
    </Modal>
  )
}

/* ============================================================
   ESTOQUE
   ============================================================ */
function Stock({ q }: { q: string }) {
  const { move, error } = useStore()
  const { products } = useSession()
  const [form, setForm] = useState({ productId: '', type: 'venda' as MovementType, qty: 1, note: '' })
  const list = products.filter((p) => matches(p, q))

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <form
        className="card space-y-3 p-4 sm:p-5"
        onSubmit={(e) => {
          e.preventDefault()
          if (move(form)) setForm({ ...form, qty: 1, note: '' })
        }}
      >
        <h3 className="font-semibold">Registrar movimentação</h3>
        <select className="field" value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} required>
          <option value="">Selecione o produto</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.qty} un.)
            </option>
          ))}
        </select>
        <select className="field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as MovementType })}>
          <option value="entrada">Entrada / compra</option>
          <option value="venda">Venda</option>
          <option value="consumo">Consumo interno</option>
          <option value="saida">Outra saída</option>
          <option value="ajuste">Ajuste (define o saldo)</option>
        </select>
        <input className="field" type="number" min={1} value={form.qty} onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })} />
        <input className="field" placeholder="Observação" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn-primary w-full">Lançar</button>
        <p className="text-xs text-navy/50">A IA nunca altera o saldo. Toda mudança passa por esta validação.</p>
      </form>

      <div className="card p-2 lg:col-span-2">
        {/* Desktop */}
        <div className="hidden overflow-auto md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-3">Produto</th>
                <th>Saldo</th>
                <th>Mínimo</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} className="border-t border-mist">
                  <td className="p-3">{p.name}</td>
                  <td>{p.qty}</td>
                  <td>{p.minQty}</td>
                  <td>
                    <span className={`rounded-full px-2 py-1 text-xs ${p.qty === 0 ? 'bg-red-100 text-red-700' : p.qty <= p.minQty ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-700'}`}>
                      {p.qty === 0 ? 'Ruptura' : p.qty <= p.minQty ? 'Reposição' : 'OK'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="space-y-2 p-2 md:hidden">
          {list.map((p) => (
            <div key={p.id} className="rounded-xl border border-border-subtle p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="min-w-0 flex-1 truncate font-medium">{p.name}</p>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  p.qty === 0
                    ? 'bg-red-100 text-red-700'
                    : p.qty <= p.minQty
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {p.qty === 0 ? 'Ruptura' : p.qty <= p.minQty ? 'Reposição' : 'OK'}
                </span>
              </div>
              <div className="mt-2 flex gap-4 text-xs text-text-muted">
                <span>Saldo: <strong className="text-text-primary">{p.qty}</strong></span>
                <span>Mínimo: <strong className="text-text-primary">{p.minQty}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   RELATÓRIOS
   ============================================================ */
function Reports({ q }: { q: string }) {
  const { state, exportBackup } = useStore()
  const { movements, kpis: k } = useSession()
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
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'wynx-relatorio.csv'
    a.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <input className="field sm:max-w-[180px]" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input className="field sm:max-w-[180px]" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <div className="flex gap-2">
          <button className="btn-accent flex-1 sm:flex-initial" onClick={csv}>
            Exportar CSV
          </button>
          <button className="btn-ghost flex-1 sm:flex-initial" onClick={exportBackup}>
            Backup JSON
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <Stat label="Movimentações no filtro" value={String(filtered.length)} />
        <Stat label="Itens parados" value={String(k.idle)} hint="Sem giro há 21+ dias" />
        <Stat label="Capital parado" value={formatMoney(k.value)} />
      </div>

      <div className="card p-4">
        <h3 className="mb-3 text-sm font-semibold sm:text-base">Giro por produto (vendas)</h3>
        <div className="h-56 sm:h-72">
          <ResponsiveContainer>
            <BarChart data={ranking}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" hide />
              <YAxis fontSize={11} />
              <Tooltip />
              <Bar dataKey="qty" fill="#06B6D4" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {filtered.length > 0 && (
        <div className="card overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-mist text-left">
              <tr>
                <th className="p-3">Quando</th>
                <th>Produto</th>
                <th>Tipo</th>
                <th>Qtd</th>
                <th className="hidden sm:table-cell">Usuário</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map((m) => (
                <tr key={m.id} className="border-t border-mist">
                  <td className="p-3">{formatDate(m.createdAt)}</td>
                  <td>{m.productName}</td>
                  <td>{labelMovement(m.type)}</td>
                  <td>{m.qty}</td>
                  <td className="hidden sm:table-cell">{m.userName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ============================================================
   INSIGHTS
   ============================================================ */
function Insights({ q }: { q: string }) {
  const { insights } = useSession()
  const filtered = q
    ? insights.filter(
        (i) => normalize(i.title).includes(normalize(q)) || normalize(i.body).includes(normalize(q))
      )
    : insights

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {filtered.length === 0 && q && (
        <p className="col-span-full text-sm text-text-muted">Nenhum insight para "{q}".</p>
      )}
      {filtered.map((i) => (
        <article key={i.id} className="card p-4 sm:p-5">
          <p className="text-xs uppercase tracking-wide text-cyan-brand">Severidade {i.severity}</p>
          <h3 className="mt-1 font-display text-base font-bold sm:text-lg">{i.title}</h3>
          <p className="mt-2 text-sm text-navy/75">{i.body}</p>
        </article>
      ))}
    </div>
  )
}

/* ============================================================
   ALERTAS
   ============================================================ */
function Alerts({ q }: { q: string }) {
  const { notifications } = useSession()
  const { readOne, readAll } = useStore()
  const filtered = q
    ? notifications.filter(
        (n) => normalize(n.title).includes(normalize(q)) || normalize(n.message).includes(normalize(q))
      )
    : notifications

  return (
    <div>
      <button className="btn-ghost mb-4 w-full sm:w-auto" onClick={readAll}>
        Marcar todos como lidos
      </button>
      <div className="space-y-3">
        {filtered.map((n) => (
          <div key={n.id} className={`card p-4 ${n.read ? 'opacity-70' : ''}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{n.title}</p>
                <p className="text-sm text-navy/70">{n.message}</p>
                <p className="mt-1 text-xs text-navy/40">{formatDate(n.createdAt)}</p>
              </div>
              {!n.read && (
                <button className="btn-ghost self-start px-3 py-1 text-sm" onClick={() => readOne(n.id)}>
                  Marcar lido
                </button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-text-muted">
            {q ? `Nenhum alerta para "${q}".` : 'Nenhum alerta no momento.'}
          </p>
        )}
      </div>
    </div>
  )
}

/* ============================================================
   HISTÓRICO
   ============================================================ */
function History({ q }: { q: string }) {
  const { movements, audit } = useSession()
  const [tab, setTab] = useState<'mov' | 'aud'>('mov')

  const filteredMovements = q
    ? movements.filter(
        (m) =>
          normalize(m.productName).includes(normalize(q)) ||
          normalize(m.userName).includes(normalize(q)) ||
          normalize(m.note).includes(normalize(q))
      )
    : movements

  const filteredAudit = q
    ? audit.filter(
        (a) =>
          normalize(a.userName).includes(normalize(q)) ||
          normalize(a.action).includes(normalize(q)) ||
          normalize(a.details).includes(normalize(q))
      )
    : audit

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button className={tab === 'mov' ? 'btn-primary' : 'btn-ghost'} onClick={() => setTab('mov')}>
          Movimentações
        </button>
        <button className={tab === 'aud' ? 'btn-primary' : 'btn-ghost'} onClick={() => setTab('aud')}>
          Auditoria
        </button>
      </div>

      {/* Desktop table */}
      <div className="card hidden overflow-auto md:block">
        <table className="w-full text-sm">
          <thead className="bg-mist text-left">
            {tab === 'mov' ? (
              <tr>
                <th className="p-3">Quando</th>
                <th>Produto</th>
                <th>Tipo</th>
                <th>Qtd</th>
                <th>Saldo</th>
                <th>Usuário</th>
                <th>Detalhe</th>
              </tr>
            ) : (
              <tr>
                <th className="p-3">Quando</th>
                <th>Usuário</th>
                <th>Ação</th>
                <th>Detalhes</th>
              </tr>
            )}
          </thead>
          <tbody>
            {tab === 'mov'
              ? filteredMovements.map((m) => (
                  <tr key={m.id} className="border-t border-mist">
                    <td className="p-3">{formatDate(m.createdAt)}</td>
                    <td>{m.productName}</td>
                    <td>{labelMovement(m.type)}</td>
                    <td>{m.qty}</td>
                    <td>{m.resultingQty}</td>
                    <td>{m.userName}</td>
                    <td>{m.note}</td>
                  </tr>
                ))
              : filteredAudit.map((a) => (
                  <tr key={a.id} className="border-t border-mist">
                    <td className="p-3">{formatDate(a.createdAt)}</td>
                    <td>{a.userName}</td>
                    <td>{a.action}</td>
                    <td>{a.details}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {tab === 'mov' && filteredMovements.map((m) => (
          <div key={m.id} className="card p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 flex-1 truncate font-medium">{m.productName}</p>
              <span className="shrink-0 text-xs text-text-muted">{formatDate(m.createdAt)}</span>
            </div>
            <p className="mt-1 text-sm text-text-secondary">
              {labelMovement(m.type)} · {m.qty} un. · Saldo {m.resultingQty}
            </p>
            {m.note && <p className="mt-1 text-xs text-text-muted">{m.note}</p>}
            <p className="mt-1 text-xs text-text-muted">por {m.userName}</p>
          </div>
        ))}
        {tab === 'aud' && filteredAudit.map((a) => (
          <div key={a.id} className="card p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium">{a.action}</p>
              <span className="shrink-0 text-xs text-text-muted">{formatDate(a.createdAt)}</span>
            </div>
            <p className="mt-1 text-sm text-text-secondary">{a.details}</p>
            <p className="mt-1 text-xs text-text-muted">por {a.userName}</p>
          </div>
        ))}
        {(tab === 'mov' ? filteredMovements : filteredAudit).length === 0 && (
          <div className="card p-6 text-center text-sm text-text-muted">
            {q ? `Nada encontrado para "${q}".` : 'Nenhum registro.'}
          </div>
        )}
      </div>
    </div>
  )
}

/* ============================================================
   EQUIPE
   ============================================================ */
function Team({ q }: { q: string }) {
  const { team, user } = useSession()
  const { setRole, error } = useStore()
  const [form, setForm] = useState({ name: '', email: '', role: 'editor' as Role, password: '' })

  const filtered = q
    ? team.filter(
        (m) => normalize(m.name).includes(normalize(q)) || normalize(m.email).includes(normalize(q))
      )
    : team

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <form
        className="card space-y-3 p-4 sm:p-5"
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <h3 className="font-semibold">Adicionar colaborador</h3>
        <input className="field" placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="field" type="email" placeholder="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <select className="field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
          <option value="administrador">Administrador</option>
          <option value="editor">Editor</option>
          <option value="visualizador">Visualizador</option>
        </select>
        <PasswordField
          placeholder="Senha inicial"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="button"
          disabled
          className="btn-primary w-full cursor-not-allowed opacity-50"
          title="Disponível na próxima versão"
        >
          Convidar
        </button>
        <div className="rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
          <p className="font-medium">Convite por e-mail</p>
          <p className="mt-0.5 text-warning/90">
            Em desenvolvimento. Nesta versão, novos usuários criam a própria conta na tela de cadastro.
          </p>
        </div>
        <p className="text-xs text-navy/50">
          Administrador gerencia tudo. Editor cadastra e movimenta. Visualizador só consulta.
        </p>
      </form>

      <div className="card p-4 sm:p-5 lg:col-span-2">
        {filtered.length === 0 && q && (
          <p className="text-sm text-text-muted">Nenhum colaborador encontrado para "{q}".</p>
        )}
        {filtered.map((m) => (
          <div key={m.id} className="flex flex-col gap-2 border-b border-mist py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-medium">{m.name}</p>
              <p className="truncate text-sm text-navy/60">{m.email}</p>
            </div>
            <select
              className="field w-full sm:max-w-[180px]"
              value={m.role}
              disabled={m.id === user?.id}
              onChange={(e) => setRole(m.id, e.target.value as Role)}
            >
              <option value="administrador">administrador</option>
              <option value="editor">editor</option>
              <option value="visualizador">visualizador</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ============================================================
   PERFIL
   ============================================================ */
function Profile() {
  const { user, company } = useSession()
  const { setProfile } = useStore()
  const [name, setName] = useState(user?.name || '')
  return (
    <div className="card max-w-xl space-y-3 p-5 sm:p-6">
      <p className="text-sm text-navy/60">{user?.email}</p>
      <input className="field" value={name} onChange={(e) => setName(e.target.value)} />
      <p className="text-sm">
        Empresa: {company?.name} · {company?.city}/{company?.state}
      </p>
      <button className="btn-primary w-full sm:w-auto" onClick={() => setProfile(name)}>
        Salvar perfil
      </button>
    </div>
  )
}

/* ============================================================
   CONFIGURAÇÕES
   ============================================================ */
function Settings() {
  const { company, categories } = useSession()
  const { setCompany, newCategory } = useStore()
  const [form, setForm] = useState({
    name: company?.name || '',
    segment: company?.segment || SEGMENTS[0],
    city: company?.city || '',
    state: company?.state || ''
  })
  const [cat, setCat] = useState('')
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <form
        className="card space-y-3 p-4 sm:p-5"
        onSubmit={(e) => {
          e.preventDefault()
          setCompany(form)
        }}
      >
        <h3 className="font-semibold">Empresa</h3>
        <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <select className="field" value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value })}>
          {SEGMENTS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input className="field" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <input className="field" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
        </div>
        <button className="btn-primary w-full sm:w-auto">Salvar empresa</button>
      </form>

      <div className="card space-y-3 p-4 sm:p-5">
        <h3 className="font-semibold">Categorias</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <span key={c} className="rounded-full bg-purple-100 px-3 py-1 text-sm">
              {c}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input className="field flex-1" value={cat} onChange={(e) => setCat(e.target.value)} placeholder="Nova categoria" />
          <button
            className="btn-accent w-full sm:w-auto"
            onClick={() => {
              if (newCategory(cat)) setCat('')
            }}
          >
            Adicionar
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-border-subtle bg-bg-soft/40 px-3 py-3 text-xs text-text-muted">
          <p className="font-medium text-text-secondary">Backup dos dados</p>
          <p className="mt-1">
            Seus dados ficam salvos no Supabase (nuvem), com backup automático. Para exportar um
            snapshot, use <strong className="text-text-secondary">Relatórios → Backup JSON</strong>.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   ASSINATURA
   ============================================================ */
function Billing() {
  const { company, products, team } = useSession()
  const { setPlan } = useStore()
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(Object.keys(PLANS) as PlanId[]).map((id) => {
          const plan = PLANS[id]
          const current = company?.plan === id
          return (
            <div key={id} className={`card p-5 ${current ? 'ring-2 ring-accent-1' : ''}`}>
              <p className="text-sm text-navy/50">{plan.name}</p>
              <p className="font-display text-3xl font-bold">{plan.price === 0 ? 'Grátis' : formatMoney(plan.price)}</p>
              <ul className="mt-3 space-y-1 text-sm">
                <li>{plan.products === Infinity ? 'Produtos ilimitados' : `Até ${plan.products} produtos`}</li>
                <li>{plan.users === Infinity ? 'Usuários ilimitados' : `${plan.users} usuário(s)`}</li>
                <li>{plan.ai}</li>
                <li>{plan.extras}</li>
              </ul>
              <button className="btn-primary mt-4 w-full" disabled={current} onClick={() => setPlan(id)}>
                {current ? 'Plano atual' : 'Selecionar'}
              </button>
            </div>
          )
        })}
      </div>
      <p className="text-sm text-navy/60">
        Uso atual: {products.length} produtos e {team.length} usuários. Valores do Projeto Integrador — neste app local a
        troca de plano é simulada, sem cobrança real.
      </p>
    </div>
  )
}

/* ============================================================
   SUPORTE
   ============================================================ */
function Support() {
  return (
    <div className="card max-w-2xl space-y-3 p-5 sm:p-6">
      <h3 className="font-display text-lg font-bold sm:text-xl">Suporte WYNX</h3>
      <p className="text-sm sm:text-base">
        Equipe fundadora: Heitor (CEO e produto), Enzo (Co-CEO e marketing) e Lara (design e UX/UI). Projeto Integrador
        do IFPI — Campus Picos.
      </p>
      <p className="text-sm sm:text-base">
        Este programa funciona offline no Windows. Os dados ficam salvos na nuvem. Faça backup com frequência na área
        de Relatórios.
      </p>
      <p className="text-xs text-navy/60 sm:text-sm">
        A IA deste MVP interpreta saldo, mínimo, giro e itens parados. Ela não inventa vendas futuras como certeza e não
        altera o estoque sozinha.
      </p>
    </div>
  )
}