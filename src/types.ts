export type Role = 'administrador' | 'editor' | 'visualizador'
export type PlanId = 'gratuito' | 'essencial' | 'profissional' | 'empresarial'
export type MovementType = 'entrada' | 'venda' | 'consumo' | 'saida' | 'ajuste'
export type PageId =
  | 'dashboard'
  | 'produtos'
  | 'estoque'
  | 'relatorios'
  | 'insights'
  | 'alertas'
  | 'historico'
  | 'equipe'
  | 'perfil'
  | 'configuracoes'
  | 'assinatura'
  | 'suporte'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  passwordSalt: string
  passwordHash: string
  companyId: string
  createdAt: string
  lastLoginAt?: string
}

export interface Company {
  id: string
  name: string
  segment: string
  city: string
  state: string
  plan: PlanId
  createdAt: string
}

export interface Product {
  id: string
  companyId: string
  name: string
  sku: string
  category: string
  color?: string
  size?: string
  barcode?: string
  price: number
  cost: number
  qty: number
  minQty: number
  photo?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Movement {
  id: string
  companyId: string
  productId: string
  productName: string
  type: MovementType
  qty: number
  resultingQty: number
  note: string
  userId: string
  userName: string
  createdAt: string
}

export interface AppNotification {
  id: string
  companyId: string
  title: string
  message: string
  kind: 'low_stock' | 'idle' | 'unusual' | 'info'
  productId?: string
  read: boolean
  createdAt: string
}

export interface AuditEvent {
  id: string
  companyId: string
  userId: string
  userName: string
  action: string
  details: string
  createdAt: string
}

export interface Insight {
  id: string
  title: string
  body: string
  severity: 'alta' | 'media' | 'baixa'
  action?: string
  productId?: string
}

export interface AppState {
  version: number
  users: User[]
  companies: Company[]
  products: Product[]
  movements: Movement[]
  notifications: AppNotification[]
  audit: AuditEvent[]
  categories: Record<string, string[]>
  sessionUserId: string | null
}

export const PLANS: Record<PlanId, { name: string; price: number; products: number; users: number; ai: string; extras: string }> = {
  gratuito: { name: 'Gratuito', price: 0, products: 100, users: 1, ai: 'Indicadores básicos', extras: 'Alertas de estoque mínimo' },
  essencial: { name: 'Essencial', price: 39.9, products: 500, users: 3, ai: 'Insights de reposição', extras: 'Relatórios por período' },
  profissional: { name: 'Profissional', price: 79.9, products: 2000, users: 10, ai: 'IA completa de recomendações', extras: 'Equipe, exportação e histórico avançado' },
  empresarial: { name: 'Empresarial', price: 149.9, products: Infinity, users: Infinity, ai: 'IA personalizada', extras: 'Suporte premium e limites ilimitados' }
}

export const SEGMENTS = [
  'Loja de roupas e calçados',
  'Mercadinho / mercearia',
  'Papelaria',
  'Eletrônicos',
  'Farmácia',
  'Pet shop',
  'Distribuidora / atacado',
  'Oficina / serviços',
  'Outro'
]
