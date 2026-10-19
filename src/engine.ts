import {
  AppState,
  Company,
  Insight,
  Movement,
  MovementType,
  PLANS,
  PlanId,
  Product,
  Role,
  User
} from './types'

const encoder = new TextEncoder()

export function uid(prefix = 'id') {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`
}

export function nowIso() {
  return new Date().toISOString()
}

export function formatMoney(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

async function deriveHash(password: string, salt: string) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: encoder.encode(salt), iterations: 120000, hash: 'SHA-256' },
    key,
    256
  )
  return Array.from(new Uint8Array(bits))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function hashPassword(password: string) {
  const salt = crypto.randomUUID()
  const passwordHash = await deriveHash(password, salt)
  return { passwordSalt: salt, passwordHash }
}

export async function verifyPassword(user: User, password: string) {
  if (!user.passwordSalt || !user.passwordHash) return false // <-- Adicione esta linha
  const hash = await deriveHash(password, user.passwordSalt)
  return hash === user.passwordHash
}

export function emptyState(): AppState {
  return {
    version: 1,
    users: [],
    companies: [],
    products: [],
    movements: [],
    notifications: [],
    audit: [],
    categories: {},
    sessionUserId: null
  }
}

export function currentUser(state: AppState) {
  return state.users.find((u) => u.id === state.sessionUserId) || null
}

export function currentCompany(state: AppState) {
  const user = currentUser(state)
  return user ? state.companies.find((c) => c.id === user.companyId) || null : null
}

export function companyProducts(state: AppState) {
  const company = currentCompany(state)
  return company ? state.products.filter((p) => p.companyId === company.id) : []
}

export function companyMovements(state: AppState) {
  const company = currentCompany(state)
  return company ? state.movements.filter((m) => m.companyId === company.id) : []
}

export function canWrite(role: Role) {
  return role === 'administrador' || role === 'editor'
}

export function canAdmin(role: Role) {
  return role === 'administrador'
}

function audit(state: AppState, action: string, details: string) {
  const user = currentUser(state)
  if (!user) return
  state.audit.unshift({
    id: uid('aud'),
    companyId: user.companyId,
    userId: user.id,
    userName: user.name,
    action,
    details,
    createdAt: nowIso()
  })
}

function notify(
  state: AppState,
  kind: AppState['notifications'][number]['kind'],
  title: string,
  message: string,
  productId?: string
) {
  const company = currentCompany(state)
  if (!company) return
  state.notifications.unshift({
    id: uid('ntf'),
    companyId: company.id,
    title,
    message,
    kind,
    productId,
    read: false,
    createdAt: nowIso()
  })
}

export async function registerAccount(
  state: AppState,
  input: { name: string; email: string; password: string; company: string; segment: string; city: string; stateUf: string }
) {
  const email = input.email.trim().toLowerCase()
  if (state.users.some((u) => u.email === email)) return { error: 'Este e-mail já está cadastrado.' }
  if (input.password.length < 6) return { error: 'A senha precisa ter pelo menos 6 caracteres.' }
  const company: Company = {
    id: uid('emp'),
    name: input.company.trim(),
    segment: input.segment,
    city: input.city.trim(),
    state: input.stateUf.trim().toUpperCase(),
    plan: 'gratuito',
    createdAt: nowIso()
  }
  const secret = await hashPassword(input.password)
  const user: User = {
    id: uid('usr'),
    name: input.name.trim(),
    email,
    role: 'administrador',
    companyId: company.id,
    createdAt: nowIso(),
    lastLoginAt: nowIso(),
    ...secret
  }
  state.companies.push(company)
  state.users.push(user)
  state.categories[company.id] = ['Geral']
  state.sessionUserId = user.id
  audit(state, 'Cadastro', `Empresa ${company.name} criada no plano Gratuito.`)
  return { error: null }
}

export async function login(state: AppState, email: string, password: string) {
  const user = state.users.find((u) => u.email === email.trim().toLowerCase())
  if (!user) return { error: 'E-mail ou senha inválidos.' }
  if (!(await verifyPassword(user, password))) return { error: 'E-mail ou senha inválidos.' }
  user.lastLoginAt = nowIso()
  state.sessionUserId = user.id
  return { error: null }
}

export async function resetPassword(state: AppState, email: string, newPassword: string) {
  const user = state.users.find((u) => u.email === email.trim().toLowerCase())
  if (!user) return { error: 'Não encontramos uma conta com este e-mail.' }
  if (newPassword.length < 6) return { error: 'A nova senha precisa ter pelo menos 6 caracteres.' }
  const secret = await hashPassword(newPassword)
  user.passwordSalt = secret.passwordSalt
  user.passwordHash = secret.passwordHash
  return { error: null }
}

export function logout(state: AppState) {
  state.sessionUserId = null
}

function planLimitError(state: AppState, kind: 'products' | 'users') {
  const company = currentCompany(state)
  if (!company) return 'Sessão inválida.'
  const plan = PLANS[company.plan]
  if (kind === 'products' && companyProducts(state).length >= plan.products) {
    return `O plano ${plan.name} permite até ${plan.products} produtos. Faça upgrade na área de assinatura.`
  }
  if (kind === 'users' && state.users.filter((u) => u.companyId === company.id).length >= plan.users) {
    return `O plano ${plan.name} permite até ${plan.users} usuário(s). Faça upgrade na área de assinatura.`
  }
  return null
}

export function upsertProduct(
  state: AppState,
  input: Omit<Product, 'id' | 'companyId' | 'createdAt' | 'updatedAt' | 'qty'> & { id?: string; qty?: number }
) {
  const user = currentUser(state)
  const company = currentCompany(state)
  if (!user || !company) return { error: 'Sessão inválida.' }
  if (!canWrite(user.role)) return { error: 'Seu perfil não pode alterar produtos.' }
  if (!input.name.trim() || !input.sku.trim()) return { error: 'Nome e código são obrigatórios.' }
  const sku = input.sku.trim().toUpperCase()
  const duplicated = companyProducts(state).find((p) => p.sku === sku && p.id !== input.id)
  if (duplicated) return { error: 'Já existe um produto com este código.' }

  if (input.id) {
    const product = state.products.find((p) => p.id === input.id)
    if (!product) return { error: 'Produto não encontrado.' }
    Object.assign(product, {
      name: input.name.trim(),
      sku,
      category: input.category,
      color: input.color,
      size: input.size,
      barcode: input.barcode,
      price: Number(input.price) || 0,
      cost: Number(input.cost) || 0,
      minQty: Math.max(0, Number(input.minQty) || 0),
      photo: input.photo,
      notes: input.notes,
      updatedAt: nowIso()
    })
    audit(state, 'Produto atualizado', `${product.name} (${product.sku})`)
    return { error: null }
  }

  const limit = planLimitError(state, 'products')
  if (limit) return { error: limit }
  const qty = Math.max(0, Number(input.qty) || 0)
  const product: Product = {
    id: uid('prd'),
    companyId: company.id,
    name: input.name.trim(),
    sku,
    category: input.category || 'Geral',
    color: input.color,
    size: input.size,
    barcode: input.barcode,
    price: Number(input.price) || 0,
    cost: Number(input.cost) || 0,
    qty,
    minQty: Math.max(0, Number(input.minQty) || 0),
    photo: input.photo,
    notes: input.notes,
    createdAt: nowIso(),
    updatedAt: nowIso()
  }
  state.products.unshift(product)
  if (qty > 0) {
    state.movements.unshift({
      id: uid('mov'),
      companyId: company.id,
      productId: product.id,
      productName: product.name,
      type: 'entrada',
      qty,
      resultingQty: qty,
      note: 'Saldo inicial no cadastro',
      userId: user.id,
      userName: user.name,
      createdAt: nowIso()
    })
  }
  if (!state.categories[company.id].includes(product.category)) {
    state.categories[company.id].push(product.category)
  }
  audit(state, 'Produto cadastrado', `${product.name} (${product.sku}) com ${qty} un.`)
  checkStockAlerts(state, product)
  return { error: null }
}

export function deleteProduct(state: AppState, productId: string) {
  const user = currentUser(state)
  if (!user || !canAdmin(user.role)) return { error: 'Apenas administradores podem excluir produtos.' }
  const product = state.products.find((p) => p.id === productId)
  if (!product) return { error: 'Produto não encontrado.' }
  state.products = state.products.filter((p) => p.id !== productId)
  audit(state, 'Produto excluído', `${product.name} (${product.sku})`)
  return { error: null }
}

export function registerMovement(
  state: AppState,
  input: { productId: string; type: MovementType; qty: number; note: string }
) {
  const user = currentUser(state)
  const company = currentCompany(state)
  if (!user || !company) return { error: 'Sessão inválida.' }
  if (!canWrite(user.role)) return { error: 'Seu perfil não pode registrar movimentações.' }
  const product = state.products.find((p) => p.id === input.productId && p.companyId === company.id)
  if (!product) return { error: 'Produto não encontrado.' }
  const qty = Math.floor(Number(input.qty))
  if (!qty || qty <= 0) return { error: 'Informe uma quantidade válida.' }

  const outgoing = input.type === 'venda' || input.type === 'consumo' || input.type === 'saida'
  const previous = product.qty
  let next = product.qty
  if (input.type === 'entrada') next += qty
  else if (outgoing) next -= qty
  else next = qty

  if (next < 0) return { error: `Saldo insuficiente. ${product.name} possui ${product.qty} un.` }

  product.qty = next
  product.updatedAt = nowIso()
  const movement: Movement = {
    id: uid('mov'),
    companyId: company.id,
    productId: product.id,
    productName: product.name,
    type: input.type,
    qty: input.type === 'ajuste' ? Math.abs(next - previous) || qty : qty,
    resultingQty: next,
    note: input.note.trim() || labelMovement(input.type),
    userId: user.id,
    userName: user.name,
    createdAt: nowIso()
  }
  state.movements.unshift(movement)
  audit(state, 'Movimentação', `${labelMovement(input.type)} de ${qty} un. em ${product.name}`)
  checkStockAlerts(state, product)
  return { error: null }
}

export function labelMovement(type: MovementType) {
  return {
    entrada: 'Entrada',
    venda: 'Venda',
    consumo: 'Consumo',
    saida: 'Outra saída',
    ajuste: 'Ajuste de saldo'
  }[type]
}

function checkStockAlerts(state: AppState, product: Product) {
  if (product.qty <= product.minQty) {
    const already = state.notifications.find(
      (n) => n.productId === product.id && n.kind === 'low_stock' && !n.read
    )
    if (!already) {
      notify(
        state,
        'low_stock',
        product.qty === 0 ? 'Ruptura de estoque' : 'Estoque baixo',
        `${product.name} está com ${product.qty} un. (mínimo ${product.minQty}). Avalie a reposição.`,
        product.id
      )
    }
  }
}

export function inviteMember(state: AppState, input: { name: string; email: string; role: Role; password: string }) {
  const user = currentUser(state)
  const company = currentCompany(state)
  if (!user || !company) return { error: 'Sessão inválida.' }
  if (!canAdmin(user.role)) return { error: 'Apenas administradores gerenciam a equipe.' }
  const limit = planLimitError(state, 'users')
  if (limit) return { error: limit }
  const email = input.email.trim().toLowerCase()
  if (state.users.some((u) => u.email === email)) return { error: 'Este e-mail já está em uso.' }
  return { error: 'pending-password', email, name: input.name, role: input.role }
}

export async function addMember(
  state: AppState,
  input: { name: string; email: string; role: Role; password: string }
) {
  const user = currentUser(state)
  const company = currentCompany(state)
  if (!user || !company) return { error: 'Sessão inválida.' }
  if (!canAdmin(user.role)) return { error: 'Apenas administradores gerenciam a equipe.' }
  const limit = planLimitError(state, 'users')
  if (limit) return { error: limit }
  const email = input.email.trim().toLowerCase()
  if (state.users.some((u) => u.email === email)) return { error: 'Este e-mail já está em uso.' }
  if (input.password.length < 6) return { error: 'A senha precisa ter pelo menos 6 caracteres.' }
  const secret = await hashPassword(input.password)
  const member: User = {
    id: uid('usr'),
    name: input.name.trim(),
    email,
    role: input.role,
    companyId: company.id,
    createdAt: nowIso(),
    ...secret
  }
  state.users.push(member)
  audit(state, 'Equipe', `${member.name} adicionado como ${member.role}.`)
  return { error: null }
}

export function changeRole(state: AppState, userId: string, role: Role) {
  const actor = currentUser(state)
  if (!actor || !canAdmin(actor.role)) return { error: 'Apenas administradores alteram permissões.' }
  const member = state.users.find((u) => u.id === userId && u.companyId === actor.companyId)
  if (!member) return { error: 'Colaborador não encontrado.' }
  if (member.id === actor.id) return { error: 'Você não pode alterar o próprio perfil por aqui.' }
  member.role = role
  audit(state, 'Permissão', `${member.name} agora é ${role}.`)
  return { error: null }
}

export function updateProfile(state: AppState, name: string) {
  const user = currentUser(state)
  if (!user) return { error: 'Sessão inválida.' }
  user.name = name.trim() || user.name
  return { error: null }
}

export function updateCompany(state: AppState, patch: Partial<Pick<Company, 'name' | 'segment' | 'city' | 'state'>>) {
  const user = currentUser(state)
  const company = currentCompany(state)
  if (!user || !company) return { error: 'Sessão inválida.' }
  if (!canAdmin(user.role)) return { error: 'Apenas administradores alteram a empresa.' }
  Object.assign(company, patch)
  audit(state, 'Empresa', 'Dados da empresa atualizados.')
  return { error: null }
}

export function addCategory(state: AppState, name: string) {
  const company = currentCompany(state)
  const user = currentUser(state)
  if (!company || !user) return { error: 'Sessão inválida.' }
  if (!canWrite(user.role)) return { error: 'Sem permissão.' }
  const label = name.trim()
  if (!label) return { error: 'Informe o nome da categoria.' }
  const list = state.categories[company.id] || []
  if (list.includes(label)) return { error: 'Categoria já existe.' }
  state.categories[company.id] = [...list, label]
  return { error: null }
}

export function changePlan(state: AppState, plan: PlanId) {
  const user = currentUser(state)
  const company = currentCompany(state)
  if (!user || !company) return { error: 'Sessão inválida.' }
  if (!canAdmin(user.role)) return { error: 'Apenas administradores alteram o plano.' }
  company.plan = plan
  audit(state, 'Assinatura', `Plano alterado para ${PLANS[plan].name}.`)
  notify(state, 'info', 'Plano atualizado', `Sua empresa agora está no plano ${PLANS[plan].name}.`)
  return { error: null }
}

export function markNotificationRead(state: AppState, id: string) {
  const item = state.notifications.find((n) => n.id === id)
  if (item) item.read = true
}

export function markAllRead(state: AppState) {
  const company = currentCompany(state)
  if (!company) return
  state.notifications.filter((n) => n.companyId === company.id).forEach((n) => (n.read = true))
}

export function kpis(state: AppState) {
  const products = companyProducts(state)
  const movements = companyMovements(state)
  const low = products.filter((p) => p.qty <= p.minQty)
  const value = products.reduce((sum, p) => sum + p.qty * p.cost, 0)
  const sales = movements.filter((m) => m.type === 'venda')
  const revenue = sales.reduce((sum, m) => {
    const product = products.find((p) => p.id === m.productId)
    return sum + m.qty * (product?.price || 0)
  }, 0)
  const idle = products.filter((p) => daysSinceLastMovement(state, p.id) >= 21)
  return {
    products: products.length,
    units: products.reduce((s, p) => s + p.qty, 0),
    low: low.length,
    value,
    sales: sales.length,
    revenue,
    idle: idle.length,
    movements: movements.length
  }
}

export function daysSinceLastMovement(state: AppState, productId: string) {
  const last = companyMovements(state).find((m) => m.productId === productId)
  if (!last) return 999
  return Math.floor((Date.now() - new Date(last.createdAt).getTime()) / 86400000)
}

export function salesByDay(state: AppState, days = 14) {
  const movements = companyMovements(state).filter((m) => m.type === 'venda')
  const map = new Map<string, number>()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - i)
    map.set(d.toISOString().slice(0, 10), 0)
  }
  movements.forEach((m) => {
    const key = m.createdAt.slice(0, 10)
    if (map.has(key)) map.set(key, (map.get(key) || 0) + m.qty)
  })
  return Array.from(map.entries()).map(([day, qty]) => ({
    day: new Date(day + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    qty
  }))
}

export function topProducts(state: AppState, limit = 5) {
  const products = companyProducts(state)
  const sold = new Map<string, number>()
  companyMovements(state)
    .filter((m) => m.type === 'venda')
    .forEach((m) => sold.set(m.productId, (sold.get(m.productId) || 0) + m.qty))
  return products
    .map((p) => ({ name: p.name, qty: sold.get(p.id) || 0, revenue: (sold.get(p.id) || 0) * p.price }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, limit)
}

export function categoryShare(state: AppState) {
  const map = new Map<string, number>()
  companyProducts(state).forEach((p) => map.set(p.category, (map.get(p.category) || 0) + p.qty))
  return Array.from(map.entries()).map(([name, qty]) => ({ name, qty }))
}

export function averageDailySales(state: AppState, productId: string, days = 30) {
  const from = Date.now() - days * 86400000
  const qty = companyMovements(state)
    .filter((m) => m.productId === productId && m.type === 'venda' && new Date(m.createdAt).getTime() >= from)
    .reduce((s, m) => s + m.qty, 0)
  return qty / days
}

export function generateInsights(state: AppState): Insight[] {
  const products = companyProducts(state)
  const company = currentCompany(state)
  const insights: Insight[] = []
  if (!company) return insights

  products.forEach((product) => {
    const avg = averageDailySales(state, product.id)
    const daysLeft = avg > 0 ? product.qty / avg : 999
    if (product.qty <= product.minQty && avg > 0) {
      const suggested = Math.max(product.minQty * 2, Math.ceil(avg * 15) - product.qty)
      insights.push({
        id: uid('ins'),
        title: `Reposição de ${product.name}`,
        body: `${product.name} tem ${product.qty} un. e saída média de ${avg.toFixed(2)} un./dia. No ritmo atual, o saldo cobre cerca de ${Math.max(0, Math.floor(daysLeft))} dia(s). Avalie repor cerca de ${Math.max(suggested, 1)} unidade(s). Esta é uma recomendação com base no histórico, não uma certeza.`,
        severity: product.qty === 0 ? 'alta' : 'media',
        action: 'Registrar entrada',
        productId: product.id
      })
    } else if (product.qty <= product.minQty) {
      insights.push({
        id: uid('ins'),
        title: `${product.name} abaixo do mínimo`,
        body: `O saldo atual é ${product.qty} un. e o mínimo configurado é ${product.minQty}. Ainda há pouca saída recente para estimar uma compra automática. Confira o giro antes de repor.`,
        severity: 'media',
        productId: product.id
      })
    }

    const idleDays = daysSinceLastMovement(state, product.id)
    if (product.qty > 0 && idleDays >= 21) {
      insights.push({
        id: uid('ins'),
        title: `${product.name} sem giro`,
        body: `Há ${idleDays === 999 ? 'nenhum histórico recente' : `${idleDays} dias`} sem movimentação e ${product.qty} un. paradas (cerca de ${formatMoney(product.qty * product.cost)} em custo). Avalie promoção, transferência ou pausa de compra.`,
        severity: idleDays >= 45 ? 'alta' : 'baixa',
        productId: product.id
      })
    }
  })

  const ranking = topProducts(state, 3).filter((p) => p.qty > 0)
  if (ranking.length) {
    insights.push({
      id: uid('ins'),
      title: 'Peças com melhor desempenho',
      body: `No histórico de vendas, os destaques são ${ranking.map((p) => `${p.name} (${p.qty} un.)`).join(', ')}. Priorize reposição desses itens antes de ampliar o mix parado.`,
      severity: 'baixa'
    })
  }

  const totals = kpis(state)
  if (totals.low === 0 && products.length > 0) {
    insights.push({
      id: uid('ins'),
      title: 'Estoque dentro dos limites',
      body: 'Nenhum produto está abaixo do mínimo neste momento. Continue registrando cada venda para que os alertas e as recomendações permaneçam confiáveis.',
      severity: 'baixa'
    })
  }

  if (company.plan === 'gratuito') {
    insights.push({
      id: uid('ins'),
      title: 'IA no plano gratuito',
      body: 'Os insights atuais usam regras sobre saldo, mínimo e histórico. Planos pagos desbloqueiam análises mais completas no mesmo motor, ainda sem alterar o estoque automaticamente.',
      severity: 'baixa'
    })
  }

  return insights.slice(0, 8)
}

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(10 + (n % 6), (n * 7) % 60, 0, 0)
  return d.toISOString()
}

export async function seedDemo(): Promise<AppState> {
  const state = emptyState()
  const company: Company = {
    id: 'emp_aurora',
    name: 'Boutique Aurora',
    segment: 'Loja de roupas e calçados',
    city: 'Picos',
    state: 'PI',
    plan: 'profissional',
    createdAt: daysAgo(80)
  }
  const marianaSecret = await hashPassword('demo1234')
  const laraSecret = await hashPassword('equipe123')
  const mariana: User = {
    id: 'usr_mariana',
    name: 'Mariana Santos',
    email: 'mariana@wynx.app',
    role: 'administrador',
    companyId: company.id,
    createdAt: daysAgo(80),
    lastLoginAt: nowIso(),
    ...marianaSecret
  }
  const colaborador: User = {
    id: 'usr_ana',
    name: 'Ana Ribeiro',
    email: 'ana@wynx.app',
    role: 'editor',
    companyId: company.id,
    createdAt: daysAgo(40),
    ...laraSecret
  }
  state.companies.push(company)
  state.users.push(mariana, colaborador)
  state.sessionUserId = null
  state.categories[company.id] = ['Vestidos', 'Blusas', 'Calças', 'Saias', 'Acessórios']

  const catalog: Array<Omit<Product, 'companyId' | 'createdAt' | 'updatedAt'>> = [
    { id: 'prd1', name: 'Vestido Linho Aurora', sku: 'VES-001', category: 'Vestidos', color: 'Areia', size: 'M', price: 189.9, cost: 78, qty: 4, minQty: 5, barcode: '789100000001' },
    { id: 'prd2', name: 'Vestido Floral Picos', sku: 'VES-002', category: 'Vestidos', color: 'Rosa', size: 'P', price: 219.9, cost: 92, qty: 9, minQty: 4, barcode: '789100000002' },
    { id: 'prd3', name: 'Blusa Ribana', sku: 'BLU-010', category: 'Blusas', color: 'Branco', size: 'M', price: 79.9, cost: 28, qty: 18, minQty: 8, barcode: '789100000003' },
    { id: 'prd4', name: 'Blusa Manga Bufante', sku: 'BLU-011', category: 'Blusas', color: 'Lilás', size: 'G', price: 99.9, cost: 35, qty: 2, minQty: 4, barcode: '789100000004' },
    { id: 'prd5', name: 'Calça Wide Leg', sku: 'CAL-020', category: 'Calças', color: 'Preto', size: '38', price: 169.9, cost: 70, qty: 7, minQty: 4, barcode: '789100000005' },
    { id: 'prd6', name: 'Calça Jeans Mom', sku: 'CAL-021', category: 'Calças', color: 'Azul', size: '40', price: 159.9, cost: 64, qty: 11, minQty: 5, barcode: '789100000006' },
    { id: 'prd7', name: 'Saia Midi Plissada', sku: 'SAI-030', category: 'Saias', color: 'Creme', size: 'M', price: 139.9, cost: 52, qty: 6, minQty: 3, barcode: '789100000007' },
    { id: 'prd8', name: 'Cinto Couro Fino', sku: 'ACE-040', category: 'Acessórios', color: 'Caramelo', size: 'U', price: 59.9, cost: 18, qty: 22, minQty: 6, barcode: '789100000008' },
    { id: 'prd9', name: 'Bolsa Tote Lona', sku: 'ACE-041', category: 'Acessórios', color: 'Cru', size: 'U', price: 129.9, cost: 48, qty: 3, minQty: 3, barcode: '789100000009' },
    { id: 'prd10', name: 'Vestido Festa Cetim', sku: 'VES-003', category: 'Vestidos', color: 'Verde', size: 'M', price: 279.9, cost: 120, qty: 1, minQty: 2, barcode: '789100000010' },
    { id: 'prd11', name: 'Blusa Cropped Linho', sku: 'BLU-012', category: 'Blusas', color: 'Azul', size: 'P', price: 89.9, cost: 31, qty: 0, minQty: 4, barcode: '789100000011' },
    { id: 'prd12', name: 'Saia Jeans Godê', sku: 'SAI-031', category: 'Saias', color: 'Azul', size: '38', price: 119.9, cost: 44, qty: 14, minQty: 4, barcode: '789100000012' }
  ]

  catalog.forEach((item, index) => {
    state.products.push({
      ...item,
      companyId: company.id,
      createdAt: daysAgo(70 - index),
      updatedAt: daysAgo(index)
    })
  })

  const script: Array<{ day: number; sku: string; type: MovementType; qty: number; user: string }> = [
    { day: 55, sku: 'VES-001', type: 'entrada', qty: 12, user: 'usr_mariana' },
    { day: 50, sku: 'VES-001', type: 'venda', qty: 2, user: 'usr_mariana' },
    { day: 44, sku: 'VES-001', type: 'venda', qty: 3, user: 'usr_ana' },
    { day: 30, sku: 'VES-001', type: 'venda', qty: 2, user: 'usr_mariana' },
    { day: 12, sku: 'VES-001', type: 'venda', qty: 1, user: 'usr_ana' },
    { day: 48, sku: 'BLU-011', type: 'entrada', qty: 10, user: 'usr_mariana' },
    { day: 40, sku: 'BLU-011', type: 'venda', qty: 3, user: 'usr_ana' },
    { day: 21, sku: 'BLU-011', type: 'venda', qty: 3, user: 'usr_mariana' },
    { day: 6, sku: 'BLU-011', type: 'venda', qty: 2, user: 'usr_ana' },
    { day: 35, sku: 'BLU-012', type: 'entrada', qty: 8, user: 'usr_mariana' },
    { day: 28, sku: 'BLU-012', type: 'venda', qty: 4, user: 'usr_ana' },
    { day: 9, sku: 'BLU-012', type: 'venda', qty: 4, user: 'usr_mariana' },
    { day: 18, sku: 'VES-003', type: 'venda', qty: 1, user: 'usr_mariana' },
    { day: 4, sku: 'ACE-041', type: 'venda', qty: 1, user: 'usr_ana' },
    { day: 2, sku: 'CAL-020', type: 'venda', qty: 1, user: 'usr_mariana' },
    { day: 1, sku: 'VES-002', type: 'venda', qty: 1, user: 'usr_ana' }
  ]

  script.forEach((row, i) => {
    const product = state.products.find((p) => p.sku === row.sku)!
    const user = state.users.find((u) => u.id === row.user)!
    state.movements.push({
      id: uid('mov'),
      companyId: company.id,
      productId: product.id,
      productName: product.name,
      type: row.type,
      qty: row.qty,
      resultingQty: product.qty,
      note: row.type === 'entrada' ? 'Compra de fornecedor' : 'Venda no balcão',
      userId: user.id,
      userName: user.name,
      createdAt: daysAgo(row.day - i * 0)
    })
  })

  state.movements.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  state.products.forEach((p) => checkStockAlerts(state, p))
  notify(
    state,
    'info',
    'Bem-vinda à WYNX',
    'A Boutique Aurora já está com dados de demonstração. Explore o dashboard, registre uma venda e veja os insights da IA.'
  )
  return state
}
