// src/types.ts

// ==========================================
// TIPAGENS BASE DO SISTEMA
// ==========================================

export type Role = 'administrador' | 'editor' | 'visualizador'
export type PlanId = 'gratuito' | 'essencial' | 'profissional' | 'empresarial'
export type MovementType = 'entrada' | 'venda' | 'consumo' | 'saida' | 'ajuste'
export type PaymentMethod = 'dinheiro' | 'pix' | 'credito' | 'debito'

export type PageId =
  | 'dashboard'
  | 'produtos'
  | 'estoque'
  | 'fornecedores'
  | 'lojas'
  | 'relatorios'
  | 'insights'
  | 'alertas'
  | 'historico'
  | 'equipe'
  | 'perfil'
  | 'configuracoes'
  | 'assinatura'
  | 'suporte'
  | 'pdv'
  | 'caixa'
  | 'historico-vendas'

// ==========================================
// ENTIDADES PRINCIPAIS
// ==========================================

export interface User {
  id: string
  name: string
  email: string
  role: Role
  passwordSalt?: string
  passwordHash?: string
  companyId: string
  createdAt: string
  lastLoginAt?: string
  isSuperAdmin?: boolean
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
  supplierId?: string
  storeId?: string
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

export interface Supplier {
  id: string
  companyId: string
  name: string
  cnpj?: string
  phone?: string
  email?: string
  createdAt: string
}

export interface Store {
  id: string
  companyId: string
  name: string
  type: string
  createdAt: string
}

// ==========================================
// PLANOS E ASSINATURA
// ==========================================

export interface Plan {
  id: string
  slug: string
  name: string
  price_cents: number
  product_limit: number | null
  user_limit: number | null
  features: string[]
}

export interface Subscription {
  id: string
  company_id: string
  plan_id: string
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'expired' | 'suspended'
  trial_ends_at: string
  current_period_end: string | null
}

// ==========================================
// MÓDULO DE VENDAS E CAIXA (PDV)
// ==========================================

export interface CashRegister {
  id: string
  companyId: string
  userId: string
  status: 'open' | 'closed'
  initialAmount: number
  openedAt: string
  closedAt?: string
  finalAmount?: number
  expectedAmount?: number
  discrepancy?: number
  notes?: string
}

export interface CashMovement {
  id: string
  cashRegisterId: string
  companyId: string
  type: 'suprimento' | 'sangria'
  amount: number
  description: string
  userId: string
  createdAt: string
}

export interface SaleItem {
  productId: string
  name: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface SalePayment {
  method: PaymentMethod
  amount: number
  received_amount?: number
  change_amount?: number
}

export interface Sale {
  id: string
  companyId: string
  cashRegisterId: string
  userId: string
  userName: string
  customerName?: string;
  status: 'completed' | 'cancelled'
  subtotal: number
  discount: number
  total: number
  items: SaleItem[]
  payments: SalePayment[]
  createdAt: string
  cancelledAt?: string
  cancelReason?: string
}

// ==========================================
// ESTADO GLOBAL DA APLICAÇÃO
// ==========================================

export interface AppState {
  version: number
  users: User[]
  companies: Company[]
  products: Product[]
  movements: Movement[]
  notifications: AppNotification[]
  audit: AuditEvent[]
  categories: Record<string, string[]>
  suppliers: Supplier[]
  stores: Store[]
  plans: Plan[]
  subscription: Subscription | null
  sessionUserId: string | null
  
  // MÓDULO DE VENDAS E CAIXA — OBRIGATÓRIOS (sem o "?" e sem "never[]")
  cashRegisters: CashRegister[]
  sales: Sale[]
  cashMovements: CashMovement[]
   heldSales?: any[];
}

// ==========================================
// CONSTANTES E CONFIGURAÇÕES
// ==========================================

export const PLANS: Record<PlanId, { name: string; price: number; products: number; users: number; ai: string; extras: string }> = {
  gratuito: {
    name: 'Gratuito',
    price: 0,
    products: 50,
    users: 1,
    ai: 'Insights básicos',
    extras: 'Suporte por e-mail'
  },
  essencial: {
    name: 'Starter',
    price: 149,
    products: 300,
    users: 3,
    ai: 'Insights avançados',
    extras: 'Scanner de código'
  },
  profissional: {
    name: 'Business',
    price: 499,
    products: Infinity,
    users: 10,
    ai: 'Previsão de demanda',
    extras: 'Relatórios em PDF'
  },
  empresarial: {
    name: 'Enterprise',
    price: 1299,
    products: Infinity,
    users: Infinity,
    ai: 'IA exclusiva',
    extras: 'Suporte prioritário'
  }
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