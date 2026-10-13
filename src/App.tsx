import { FormEvent, useEffect, useState } from 'react'
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

function Splash() {
  return (
    <div className="grid min-h-screen place-items-center">
      <div className="text-center">
        <Logo className="mx-auto h-24 w-24" />
        <h1 className="mt-4 font-display text-4xl font-extrabold text-navy">WYNX</h1>
        <p className="mt-2 text-navy/70">Transformando o controle de estoque em inteligência para o seu negócio.</p>
      </div>
    </div>
  )
}

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
        <div className="bg-gradient-to-br from-pink-100 via-white to-purple-100 p-8">
          <Logo />
          <h1 className="mt-6 font-display text-3xl font-extrabold">Gestão inteligente de estoque</h1>
          <p className="mt-3 text-navy/70">
            Saiba o que tem, o que está acabando, o que está parado e o que fazer a seguir — pensado para Mariana e para
            o pequeno negócio brasileiro.
          </p>
          <ul className="mt-6 space-y-2 text-sm">
            <li>• Cadastro de produtos, entradas e saídas</li>
            <li>• Alertas de estoque mínimo</li>
            <li>• Relatórios e insights com base em dados reais</li>
            <li>• Equipe, permissões e planos SaaS</li>
          </ul>
          <div className="mt-8 rounded-2xl bg-white/70 p-4 text-sm">
            <p className="font-semibold">Conta de demonstração</p>
            <p>E-mail: mariana@wynx.app</p>
            <p>Senha: demo1234</p>
            <button className="btn-accent mt-3" onClick={() => resetDemo()}>
              Restaurar dados da Boutique Aurora
            </button>
          </div>
        </div>
        <form className="space-y-3 p-8" onSubmit={submit}>
          <div className="flex gap-2 text-sm">
            {(['login', 'cadastro', 'recuperar'] as const).map((m) => (
              <button
                type="button"
                key={m}
                className={`rounded-full px-3 py-1 ${mode === m ? 'bg-navy text-white' : 'bg-ice'}`}
                onClick={() => {
                  setMode(m)
                  setError(null)
                }}
              >
                {m === 'login' ? 'Entrar' : m === 'cadastro' ? 'Criar conta' : 'Recuperar senha'}
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
          <input
            className="field"
            type="password"
            placeholder={mode === 'recuperar' ? 'Nova senha' : 'Senha'}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn-primary w-full" type="submit">
            {mode === 'login' ? 'Acessar a WYNX' : mode === 'cadastro' ? 'Criar minha empresa' : 'Redefinir senha'}
          </button>
        </form>
      </div>
    </div>
  )
}

function Shell() {
  const { user, company, notifications } = useSession()
  const { logout } = useStore()
  const [page, setPage] = useState<PageId>('dashboard')
  const [q, setQ] = useState('')
  const unread = notifications.filter((n) => !n.read).length

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col bg-gradient-to-b from-brand-pink via-brand-violet to-brand-blue text-text-primary">
        <div className="flex items-center gap-3 p-5">
          <Logo className="h-10 w-10" />
          <div>
            <p className="font-display text-2xl font-bold">WYNX</p>
            <p className="text-sm text-white/70">{company?.name}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm ${
                page === item.id ? 'bg-white/15 text-accent-1' : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <span>
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </span>
              {item.id === 'alertas' && unread > 0 && (
                <span className="rounded-full bg-accent-1 px-2 text-xs text-black">{unread}</span>
              )}
            </button>
          ))}
        </nav>
        <button className="m-3 rounded-xl bg-white/10 px-3 py-2 text-sm" onClick={logout}>
          Sair
        </button>
      </aside>
      <main className="flex-1 p-6">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold capitalize">{NAV.find((n) => n.id === page)?.label}</h2>
            <p className="text-sm text-navy/60">
              Olá, {user?.name} · {user?.role} · Plano {company ? PLANS[company.plan].name : ''}
            </p>
          </div>
          <input
            className="field max-w-sm"
            placeholder="Busca global: produto, código, categoria..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </header>
        {page === 'dashboard' && <Dashboard q={q} go={setPage} />}
        {page === 'produtos' && <Products q={q} />}
        {page === 'estoque' && <Stock q={q} />}
        {page === 'relatorios' && <Reports />}
        {page === 'insights' && <Insights />}
        {page === 'alertas' && <Alerts />}
        {page === 'historico' && <History />}
        {page === 'equipe' && <Team />}
        {page === 'perfil' && <Profile />}
        {page === 'configuracoes' && <Settings />}
        {page === 'assinatura' && <Billing />}
        {page === 'suporte' && <Support />}
      </main>
    </div>
  )
}

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

function matches(p: Product, q: string) {
  const s = q.trim().toLowerCase()
  if (!s) return true
  return [p.name, p.sku, p.category, p.color, p.size, p.barcode].join(' ').toLowerCase().includes(s)
}

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
  onSave: (data: Parameters<typeof useStore> extends never ? never : any) => void
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

function Reports() {
  const { state, exportBackup } = useStore()
  const { movements, kpis: k } = useSession()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const ranking = topProducts(state, 8)
  const filtered = movements.filter((m) => {
    const d = m.createdAt.slice(0, 10)
    if (from && d < from) return false
    if (to && d > to) return false
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
    </div>
  )
}

function Insights() {
  const { insights } = useSession()
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {insights.map((i) => (
        <article key={i.id} className="card p-5">
          <p className="text-xs uppercase tracking-wide text-cyan-brand">Severidade {i.severity}</p>
          <h3 className="mt-1 font-display text-lg font-bold">{i.title}</h3>
          <p className="mt-2 text-navy/75">{i.body}</p>
        </article>
      ))}
    </div>
  )
}

function Alerts() {
  const { notifications } = useSession()
  const { readOne, readAll } = useStore()
  return (
    <div>
      <button className="btn-ghost mb-4" onClick={readAll}>
        Marcar todos como lidos
      </button>
      <div className="space-y-3">
        {notifications.map((n) => (
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
        {notifications.length === 0 && <p>Nenhum alerta no momento.</p>}
      </div>
    </div>
  )
}

function History() {
  const { movements, audit } = useSession()
  const [tab, setTab] = useState<'mov' | 'aud'>('mov')
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
              ? movements.map((m) => (
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
              : audit.map((a) => (
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
    </div>
  )
}

function Team() {
  const { team, user } = useSession()
  const { invite, setRole, error } = useStore()
  const [form, setForm] = useState({ name: '', email: '', role: 'editor' as Role, password: '' })
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
        <input className="field" placeholder="Senha inicial" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn-primary w-full">Convidar</button>
        <p className="text-xs text-navy/50">Administrador gerencia tudo. Editor cadastra e movimenta. Visualizador só consulta.</p>
      </form>
      <div className="card p-5 lg:col-span-2">
        {team.map((m) => (
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
