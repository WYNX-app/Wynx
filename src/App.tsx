import { PasswordField } from './components/PasswordField'
import { FormEvent, useEffect, useRef, useState } from 'react'
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
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-gradient-to-br from-[#1A0B2E] via-[#2A1145] to-[#1A0B2E]">
      <Aurora variant="splash" />

      <div className="relative z-10 text-center">
        <Logo className="mx-auto h-44 w-44 wynx-logo-pulse" />

        <h1 className="mt-8 font-display text-7xl font-extrabold tracking-tight wynx-fade-up wynx-delay-1">
          <span className="wynx-title-gradient">WYNX</span>
        </h1>

        <p className="mx-auto mt-6 max-w-lg text-lg text-white/85 wynx-fade-up wynx-delay-2">
          Transformando o controle de estoque em inteligência para o seu negócio.
        </p>

        <div className="mx-auto mt-12 flex justify-center gap-2 wynx-fade-in wynx-delay-3">
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
  const { login, register, recover, error, setError, resetDemo } = useStore()
  const [mode, setMode] = useState<'login' | 'cadastro' | 'recuperar'>('login')
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
    else if (mode === 'recuperar') {
      const ok = await recover(form.email, form.password)
      if (ok) setMode('login')
    } else await register({ ...form })
  }

  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="card grid w-full max-w-5xl overflow-hidden md:grid-cols-2">
        {/* Painel esquerdo */}
        <div className="relative min-h-[640px] overflow-hidden bg-gradient-to-br from-[#2A1145] via-[#1A0B2E] to-[#3A1F5C]">
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
              <p className="font-semibold">Conta de demonstração</p>
              <p className="text-white/80">E-mail: mariana@wynx.app</p>
              <p className="text-white/80">Senha: demo1234</p>
              <button className="btn-accent mt-3" onClick={() => resetDemo()}>
                Restaurar dados da Boutique Aurora
              </button>
            </div>
          </div>
        </div>

        {/* Painel direito — formulário */}
        <form className="relative flex flex-col justify-center space-y-3 p-8" onSubmit={submit}>
          <div className="absolute right-4 top-4">
            <ThemeToggle />
          </div>

          <div className="mb-2">
            <h2 className="font-display text-2xl font-bold text-text-primary">
              {mode === 'login' && 'Bem-vindo de volta'}
              {mode === 'cadastro' && 'Crie sua conta'}
              {mode === 'recuperar' && 'Recuperar senha'}
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              {mode === 'login' && 'Acesse o painel da sua empresa'}
              {mode === 'cadastro' && 'Comece grátis em menos de 1 minuto'}
              {mode === 'recuperar' && 'Vamos enviar um link de redefinição'}
            </p>
          </div>

          <div className="flex gap-2 text-sm">
            {(['login', 'cadastro', 'recuperar'] as const).map((m) => (
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
                {m === 'login' ? 'Entrar' : m === 'cadastro' ? 'Criar conta' : 'Recuperar'}
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
            placeholder={mode === 'recuperar' ? 'Nova senha' : 'Senha'}
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
            {mode === 'login' ? 'Acessar a WYNX' : mode === 'cadastro' ? 'Criar minha empresa' : 'Redefinir senha'}
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
  const searchRef = useRef<HTMLInputElement>(null)
  const unread = notifications.filter((n) => !n.read).length

  // Atalho: tecla "/" foca a busca (igual GitHub/Linear)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === 'Escape' && document.activeElement === searchRef.current) {
        setQ('')
        searchRef.current?.blur()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const searchActive = q.trim().length > 0

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-72 flex-col bg-gradient-to-b from-brand-pink via-brand-violet to-brand-blue text-text-primary">
        <div className="flex items-center gap-3 p-5">
          <Logo className="h-12 w-12" />
          <div>
            <p className="font-display text-2xl font-bold">WYNX</p>
            <p className="text-sm text-text-secondary">{company?.name}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setPage(item.id)
                setQ('')
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-base transition ${
                page === item.id
                  ? 'bg-white/60 text-text-primary font-semibold'
                  : 'text-text-primary/80 hover:bg-white/30'
              }`}
            >
              <span>
                <span className="mr-2 text-lg">{item.icon}</span>
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
          onClick={logout}
        >
          Sair
        </button>
      </aside>
      <main className="flex-1 p-6">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold capitalize">{NAV.find((n) => n.id === page)?.label}</h2>
            <p className="text-sm text-text-muted">
              Olá, {user?.name} · <span className="capitalize">{user?.role}</span> · Plano {company ? PLANS[company.plan].name : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                ref={searchRef}
                className="field max-w-sm pr-16"
                placeholder="Busca global: produto, código, categoria..."
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
        </header>

        {searchActive && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-brand-violet/30 bg-brand-violet/10 px-3 py-2 text-sm text-text-secondary animate-[wynx-fade-in_0.3s_ease-out]">
            <span>
              Buscando por <strong className="text-text-primary">"{q}"</strong>
            </span>
            <button
              type="button"
              onClick={() => setQ('')}
              className="ml-auto text-xs font-medium text-brand-violet hover:underline"
            >
              limpar
            </button>
          </div>
        )}

        {page === 'dashboard' && <Dashboard q={q} go={setPage} />}
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
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Produtos" value={String(k.products)} hint={`${k.units} unidades em saldo`} />
        <Stat label="Estoque baixo" value={String(k.low)} hint="Itens no mínimo ou abaixo" />
        <Stat label="Capital em estoque" value={formatMoney(k.value)} />
        <Stat label="Receita das vendas" value={formatMoney(k.revenue)} hint={`${k.sales} saídas do tipo venda`} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-4 lg:col-span-2">
          <h3 className="mb-3 font-semibold">Vendas (unidades) — 14 dias</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={line}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="qty" stroke="#1D6FBE" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-4">
          <h3 className="mb-3 font-semibold">Saldo por categoria</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pie} dataKey="qty" nameKey="name" outerRadius={80} label>
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
            <h3 className="font-semibold">Insights da IA</h3>
            <button className="text-sm text-blue-brand" onClick={() => go('insights')}>
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
          <h3 className="mb-3 font-semibold">Movimentações recentes</h3>
          <table className="w-full text-sm">
            <tbody>
              {movements.slice(0, 6).map((m) => (
                <tr key={m.id} className="border-b border-mist">
                  <td className="py-2">{m.productName}</td>
                  <td>{labelMovement(m.type)}</td>
                  <td>{m.qty}</td>
                  <td className="text-right text-navy/50">{formatDate(m.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
      <div className="mb-4 flex flex-wrap gap-2">
        <button className="btn-primary" onClick={() => { setEditing(null); setOpen(true) }}>
          Novo produto
        </button>
        <select className="field max-w-xs" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="todas">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <div className="card overflow-auto">
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
                  <div className="text-xs text-navy/50">
                    {p.color} {p.size}
                  </div>
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
          </tbody>
        </table>
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
      {companyProducts(state).length === 0 && <p className="mt-4">Nenhum produto cadastrado ainda.</p>}
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
        className="grid grid-cols-2 gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          onSave({ ...form, id: product?.id })
        }}
      >
        <input className="field col-span-2" placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
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
        <textarea className="field col-span-2" placeholder="Observações" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <button className="btn-primary col-span-2" type="submit">
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
        className="card space-y-3 p-5"
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
      <div className="card overflow-auto p-2 lg:col-span-2">
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
      <div className="flex flex-wrap gap-2">
        <input className="field max-w-[180px]" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input className="field max-w-[180px]" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <button className="btn-accent" onClick={csv}>
          Exportar CSV
        </button>
        <button className="btn-ghost" onClick={exportBackup}>
          Backup JSON
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Movimentações no filtro" value={String(filtered.length)} />
        <Stat label="Itens parados" value={String(k.idle)} hint="Sem giro há 21+ dias" />
        <Stat label="Capital parado (custo)" value={formatMoney(k.value)} />
      </div>
      <div className="card p-4">
        <h3 className="mb-3 font-semibold">Giro por produto (vendas)</h3>
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={ranking}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" hide />
              <YAxis />
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
                <th>Usuário</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map((m) => (
                <tr key={m.id} className="border-t border-mist">
                  <td className="p-3">{formatDate(m.createdAt)}</td>
                  <td>{m.productName}</td>
                  <td>{labelMovement(m.type)}</td>
                  <td>{m.qty}</td>
                  <td>{m.userName}</td>
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
        <article key={i.id} className="card p-5">
          <p className="text-xs uppercase tracking-wide text-cyan-brand">Severidade {i.severity}</p>
          <h3 className="mt-1 font-display text-lg font-bold">{i.title}</h3>
          <p className="mt-2 text-navy/75">{i.body}</p>
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
      <button className="btn-ghost mb-4" onClick={readAll}>
        Marcar todos como lidos
      </button>
      <div className="space-y-3">
        {filtered.map((n) => (
          <div key={n.id} className={`card p-4 ${n.read ? 'opacity-70' : ''}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{n.title}</p>
                <p className="text-sm text-navy/70">{n.message}</p>
                <p className="mt-1 text-xs text-navy/40">{formatDate(n.createdAt)}</p>
              </div>
              {!n.read && (
                <button className="btn-ghost px-3 py-1" onClick={() => readOne(n.id)}>
                  Lido
                </button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p>{q ? `Nenhum alerta para "${q}".` : 'Nenhum alerta no momento.'}</p>
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
      <div className="card overflow-auto">
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
            {(tab === 'mov' ? filteredMovements : filteredAudit).length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-sm text-text-muted">
                  {q ? `Nada encontrado para "${q}".` : 'Nenhum registro.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
/* ============================================================
   EQUIPE
   ============================================================ */
function Team({ q }: { q: string }) {
  const { team, user } = useSession()
  const { invite, setRole, error } = useStore()
  const [form, setForm] = useState({ name: '', email: '', role: 'editor' as Role, password: '' })

  const filtered = q
    ? team.filter(
        (m) => normalize(m.name).includes(normalize(q)) || normalize(m.email).includes(normalize(q))
      )
    : team

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <form
        className="card space-y-3 p-5"
        onSubmit={async (e) => {
          e.preventDefault()
          if (await invite(form)) setForm({ name: '', email: '', role: 'editor', password: '' })
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
        <button className="btn-primary w-full">Convidar</button>
        <p className="text-xs text-navy/50">Administrador gerencia tudo. Editor cadastra e movimenta. Visualizador só consulta.</p>
      </form>
      <div className="card p-5 lg:col-span-2">
        {filtered.length === 0 && q && (
          <p className="text-sm text-text-muted">Nenhum colaborador encontrado para "{q}".</p>
        )}
        {filtered.map((m) => (
          <div key={m.id} className="flex items-center justify-between border-b border-mist py-3">
            <div>
              <p className="font-medium">{m.name}</p>
              <p className="text-sm text-navy/60">{m.email}</p>
            </div>
            <select
              className="field max-w-[180px]"
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
    <div className="card max-w-xl space-y-3 p-6">
      <p className="text-sm text-navy/60">{user?.email}</p>
      <input className="field" value={name} onChange={(e) => setName(e.target.value)} />
      <p className="text-sm">
        Empresa: {company?.name} · {company?.city}/{company?.state}
      </p>
      <button className="btn-primary" onClick={() => setProfile(name)}>
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
  const { setCompany, newCategory, importBackup, resetDemo } = useStore()
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
        className="card space-y-3 p-5"
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
        <button className="btn-primary">Salvar empresa</button>
      </form>
      <div className="card space-y-3 p-5">
        <h3 className="font-semibold">Categorias</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <span key={c} className="rounded-full bg-purple-100 px-3 py-1 text-sm">
              {c}
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input className="field" value={cat} onChange={(e) => setCat(e.target.value)} placeholder="Nova categoria" />
          <button
            className="btn-accent"
            onClick={() => {
              if (newCategory(cat)) setCat('')
            }}
          >
            Adicionar
          </button>
        </div>
        <div className="flex gap-2 pt-4">
          <button className="btn-ghost" onClick={importBackup}>
            Importar backup
          </button>
          <button className="btn-ghost" onClick={resetDemo}>
            Restaurar demonstração
          </button>
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
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
      <p className="md:col-span-2 xl:col-span-4 text-sm text-navy/60">
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
    <div className="card max-w-2xl space-y-3 p-6">
      <h3 className="font-display text-xl font-bold">Suporte WYNX</h3>
      <p>
        Equipe fundadora: Heitor (CEO e produto), Enzo (Co-CEO e marketing) e Lara (design e UX/UI). Projeto Integrador
        do IFPI — Campus Picos.
      </p>
      <p>
        Este programa funciona offline no Windows. Os dados ficam neste computador. Faça backup com frequência na área
        de Relatórios.
      </p>
      <p className="text-sm text-navy/60">
        A IA deste MVP interpreta saldo, mínimo, giro e itens parados. Ela não inventa vendas futuras como certeza e não
        altera o estoque sozinha.
      </p>
    </div>
  )
}