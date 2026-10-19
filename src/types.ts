// Adicione a interface Supplier no topo:
export interface Supplier {
  id: string
  companyId: string
  name: string
  cnpj?: string
  phone?: string
  email?: string
  createdAt: string
}

export type Role = 'administrador' | 'editor' | 'visualizador'
export type PlanId = 'gratuito' | 'essencial' | 'profissional' | 'empresarial'
export type MovementType = 'entrada' | 'venda' | 'consumo' | 'saida' | 'ajuste'
export type PageId =
  | 'dashboard'
  | 'produtos'
  | 'estoque'
  | 'fornecedores'
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
  passwordSalt?: string // <-- Opcional agora
  passwordHash?: string // <-- Opcional agora
  companyId: string
  createdAt: string
  lastLoginAt?: string
  isSuperAdmin?: boolean // <-- Adicionado
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
  sessionUserId: string | null,
  suppliers: Supplier[]
}

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
