import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from './lib/supabase/client'
import { signIn, signUp, signOut, resetPassword as sbResetPassword } from './lib/supabase/auth'
import * as db from './lib/supabase/data'
import { getLocalDb } from './db/database' // <-- BANCO OFFLINE
import {
  emptyState,
  currentUser,
  currentCompany,
  generateInsights,
  kpis
} from './engine'
import { AppState, MovementType, PlanId, Product, Role } from './types'

type Store = {
  state: AppState
  ready: boolean
  error: string | null
  setError: (value: string | null) => void
  persist: (next: AppState) => Promise<void>
  login: (email: string, password: string) => Promise<boolean>
  register: (input: { name: string; email: string; password: string; company: string; segment: string; city: string; stateUf: string }) => Promise<boolean>
  recover: (email: string, password: string) => Promise<boolean>
  logout: () => void
  saveProduct: (input: any) => boolean
  removeProduct: (id: string) => boolean
  move: (input: { productId: string; type: MovementType; qty: number; note: string }) => boolean
  invite: (input: { name: string; email: string; role: Role; password: string }) => Promise<boolean>
  setRole: (userId: string, role: Role) => boolean
  removeMember: (memberId: string) => boolean
  setProfile: (name: string) => boolean
  setCompany: (patch: { name?: string; segment?: string; city?: string; state?: string }) => boolean
  newCategory: (name: string) => boolean
  setPlan: (plan: PlanId) => boolean
  readOne: (id: string) => void
  readAll: () => void
  exportBackup: () => Promise<void>
  importBackup: () => Promise<void>
  resetDemo: () => Promise<void>
  deleteAccount: () => Promise<boolean>
  saveSupplier: (input: any) => boolean
  removeSupplier: (id: string) => boolean
  saveStore: (input: any) => boolean
  removeStore: (id: string) => boolean
  isImpersonating: boolean
  impersonateUser: (targetUserId: string) => Promise<boolean>
  stopImpersonation: () => Promise<void>
  changePlan: (planId: string) => Promise<boolean>
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(emptyState())
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [isImpersonating, setIsImpersonating] = useState(false)
  const [originalUserId, setOriginalUserId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function boot() {
      // 1. Inicializa o banco local (Dexie/IndexedDB)
      const localDb = await getLocalDb()

      const { data: { session } } = await supabase.auth.getSession()
      if (cancelled) return
      
      if (session?.user) {
        // 2. Carrega os dados do Supabase (Empresa, Planos, etc.)
        const result = await db.loadCompanyState(session.user.id)
        if (cancelled) return
        
        if (result.state) {
          // 3. Substitui a lista de produtos e movimentações pelos dados locais (Offline-first)
          const localProducts = await localDb.products.find().exec()
          const localMovements = await localDb.movements.find().exec()

          // Se o banco local estiver vazio (primeiro acesso), usamos os dados do Supabase
          const finalProducts = localProducts.length > 0 ? localProducts.map((p: any) => p.toJSON()) : result.state.products
          const finalMovements = localMovements.length > 0 ? localMovements.map((m: any) => m.toJSON()) : result.state.movements

          setState({
            ...result.state,
            products: finalProducts,
            movements: finalMovements,
          })
        }
      }
      setReady(true)
    }

    boot()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const result = await db.loadCompanyState(session.user.id)
          if (result.state) setState(result.state)
        } else {
          setState(emptyState())
        }
      }
    )

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  const reload = async (userId: string) => {
    const fresh = await db.loadCompanyState(userId)
    if (fresh.state) setState(fresh.state)
    else if (fresh.error) setError(fresh.error)
  }

  const value = useMemo<Store>(() => ({
    state,
    ready,
    error,
    setError,
    persist: async () => {},

    login: async (email, password) => {
      const { error: err } = await signIn(email, password)
      if (err) { setError(err); return false }
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { setError('Sessão não iniciada.'); return false }
      
      const localDb = await getLocalDb()
      const result = await db.loadCompanyState(session.user.id)
      if (result.error || !result.state) { setError(result.error ?? 'Erro.'); return false }
      
      const localProducts = await localDb.products.find().exec()
      const localMovements = await localDb.movements.find().exec()

      setState({
        ...result.state,
        products: localProducts.length > 0 ? localProducts.map((p: any) => p.toJSON()) : result.state.products,
        movements: localMovements.length > 0 ? localMovements.map((m: any) => m.toJSON()) : result.state.movements,
      })
      setError(null)
      return true
    },

    register: async (input) => {
      const { error: err } = await signUp(input)
      if (err) { setError(err); return false }
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { setError('Conta criada, mas não foi possível iniciar sessão.'); return false }
      const result = await db.loadCompanyState(session.user.id)
      if (result.error || !result.state) { setError(result.error ?? 'Erro.'); return false }
      setState(result.state)
      setError(null)
      return true
    },

recover: async (email) => {
  const { error: err } = await sbResetPassword(email)
  if (err) { setError(err); return false }
  setError(null)
  return true
},

    logout: () => {
      signOut()
      setState(emptyState())
    },

    // --- OFFLINE: SALVAR PRODUTO (RXDB) ---
    saveProduct: (input) => {
      const user = currentUser(state)
      const company = currentCompany(state)
      if (!user || !company) { setError('Sessão inválida.'); return false }
      
      ;(async () => {
        try {
          const localDb = await getLocalDb()
          const isUpdate = !!input.id
          const productId = input.id || crypto.randomUUID()

          const productData = {
            id: productId,
            companyId: company.id,
            name: input.name,
            sku: input.sku,
            category: input.category || 'Geral',
            color: input.color || '',
            size: input.size || '',
            barcode: input.barcode || '',
            price: Number(input.price) || 0,
            cost: Number(input.cost) || 0,
            qty: Number(input.qty) || 0,
            minQty: Number(input.minQty) || 0,
            notes: input.notes || '',
            supplierId: input.supplierId || null,
            storeId: input.storeId || null,
            updatedAt: new Date().toISOString()
          }

          if (isUpdate) {
            await localDb.products.upsert(productData)
          } else {
            await localDb.products.insert(productData)
          }

          // Atualiza a tela na hora (Optimistic UI)
          setState(prev => {
            const exists = prev.products.find(p => p.id === productId)
            if (exists) {
              return { ...prev, products: prev.products.map(p => p.id === productId ? { ...p, ...productData } as any : p) }
            }
            return { ...prev, products: [productData as any, ...prev.products] }
          })
        } catch (err: any) {
          console.error('Erro ao salvar no banco local:', err)
          setError('Erro ao salvar produto offline: ' + err.message)
        }
      })()
      return true
    },

    // --- OFFLINE: REMOVER PRODUTO (RXDB) ---
    removeProduct: (id) => {
      const user = currentUser(state)
      if (!user) return false
      ;(async () => {
        const localDb = await getLocalDb()
        const doc = await localDb.products.findOne(id).exec()
        if (doc) await doc.remove()
        setState(prev => ({ ...prev, products: prev.products.filter(p => p.id !== id) }))
      })()
      return true
    },

    // --- OFFLINE: MOVIMENTAÇÃO (RXDB) ---
    move: (input) => {
      const user = currentUser(state)
      const company = currentCompany(state)
      if (!user || !company) { setError('Sessão inválida.'); return false }
      const product = state.products.find(p => p.id === input.productId)
      if (!product) { setError('Produto não encontrado.'); return false }

      const qty = Math.floor(Number(input.qty))
      if (!qty || qty <= 0) { setError('Quantidade inválida.'); return false }

      let next = product.qty
      if (input.type === 'entrada') next += qty
      else if (input.type === 'venda' || input.type === 'consumo' || input.type === 'saida') next -= qty
      else next = qty

      if (next < 0) {
        setError(`Saldo insuficiente. ${product.name} possui ${product.qty} un.`)
        return false
      }

      ;(async () => {
        try {
          const localDb = await getLocalDb()
          
          const movementData = {
            id: crypto.randomUUID(),
            companyId: company.id,
            productId: product.id,
            productName: product.name,
            type: input.type,
            qty: qty,
            resultingQty: next,
            note: input.note || 'Movimentação',
            userId: user.id,
            userName: user.name,
            createdAt: new Date().toISOString()
          }

          await localDb.movements.insert(movementData)
          await localDb.products.upsert({ ...product, qty: next, updatedAt: new Date().toISOString() })

          // Atualiza a tela na hora
          setState(prev => ({
            ...prev,
            movements: [movementData as any, ...prev.movements],
            products: prev.products.map(p => p.id === product.id ? { ...p, qty: next } : p)
          }))
        } catch (err: any) {
          setError('Erro ao registrar movimentação offline: ' + err.message)
        }
      })()
      return true
    },

    // --- RESTANTE DAS FUNÇÕES (ONLINE / SUPABASE DIRETO) ---
    invite: async () => { return false },

    setRole: (userId, role) => {
      const user = currentUser(state)
      if (!user) return false
      ;(async () => {
        const r = await db.updateMemberRole(userId, role)
        if (r.error) { setError(r.error); return }
        await reload(user.id)
      })()
      return true
    },

    removeMember: (memberId) => {
      const user = currentUser(state)
      if (!user) return false
      ;(async () => {
        const r = await db.removeMemberDb(memberId)
        if (r.error) { setError(r.error); return }
        await reload(user.id)
      })()
      return true
    },

    setProfile: (name) => {
      const user = currentUser(state)
      if (!user) return false
      ;(async () => {
        const r = await db.updateUserProfile(user.id, name)
        if (r.error) { setError(r.error); return }
        await reload(user.id)
      })()
      return true
    },

    setCompany: (patch) => {
      const company = currentCompany(state)
      const user = currentUser(state)
      if (!company || !user) return false
      ;(async () => {
        const r = await db.updateCompanyData(company.id, patch)
        if (r.error) { setError(r.error); return }
        await reload(user.id)
      })()
      return true
    },

    newCategory: (name) => {
      const company = currentCompany(state)
      const user = currentUser(state)
      if (!company || !user) return false
      ;(async () => {
        const r = await db.addCategoryDb(company.id, name.trim())
        if (r.error) { setError(r.error); return }
        await reload(user.id)
      })()
      return true
    },

    setPlan: (plan) => {
      const company = currentCompany(state)
      const user = currentUser(state)
      if (!company || !user) return false
      const dbPlan = plan === 'gratuito' ? 'gratuito' : plan
      ;(async () => {
        const r = await db.changePlanDb(company.id, dbPlan)
        if (r.error) { setError(r.error); return }
        await reload(user.id)
      })()
      return true
    },

    readOne: (id) => {
      ;(async () => {
        await db.markAlertReadDb(id)
        setState(prev => ({
          ...prev,
          notifications: prev.notifications.map(n => n.id === id ? { ...n, read: true } : n)
        }))
      })()
    },

    readAll: () => {
      const company = currentCompany(state)
      if (!company) return
      ;(async () => {
        await db.markAllAlertsReadDb(company.id)
        setState(prev => ({
          ...prev,
          notifications: prev.notifications.map(n => ({ ...n, read: true }))
        }))
      })()
      return true
    },

    exportBackup: async () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'wynx-backup.json'
      a.click()
    },

    importBackup: async () => { setError('Importação desativada.') },
    resetDemo: async () => { setError('Modo demo desativado.') },

    deleteAccount: async () => {
      try {
        const { error } = await supabase.functions.invoke('delete-account')
        if (error) { setError(error.message); return false }
        await supabase.auth.signOut()
        setState(emptyState())
        return true
      } catch (err: any) {
        setError(err.message)
        return false
      }
    },

    saveSupplier: (input) => {
      const user = currentUser(state)
      const company = currentCompany(state)
      if (!user || !company) return false
      ;(async () => {
        const r = input.id 
          ? await db.updateSupplier(input.id, input)
          : await db.createSupplier({ ...input, companyId: company.id })
        if (r.error) { setError(r.error); return }
        await reload(user.id)
      })()
      return true
    },

    removeSupplier: (id) => {
      const user = currentUser(state)
      if (!user) return false
      ;(async () => {
        const r = await db.removeSupplier(id)
        if (r.error) { setError(r.error); return }
        await reload(user.id)
      })()
      return true
    },

    saveStore: (input) => {
      const user = currentUser(state)
      const company = currentCompany(state)
      if (!user || !company) return false
      ;(async () => {
        const r = input.id 
          ? await db.updateStore(input.id, input)
          : await db.createStore({ ...input, companyId: company.id })
        if (r.error) { setError(r.error); return }
        await reload(user.id)
      })()
      return true
    },

    removeStore: (id) => {
      const user = currentUser(state)
      if (!user) return false
      ;(async () => {
        const r = await db.removeStore(id)
        if (r.error) { setError(r.error); return }
        await reload(user.id)
      })()
      return true
    },

    changePlan: async (planId) => {
      const company = currentCompany(state)
      if (!company) return false
      
      const r = await db.updateSubscriptionPlan(company.id, planId)
      if (r.error) { setError(r.error); return false }
      
      const user = currentUser(state)
      if (user) await reload(user.id)
      return true
    },

    isImpersonating,
    
    impersonateUser: async (targetUserId) => {
      if (isImpersonating) return false
      const currentAdminId = state.sessionUserId
      if (!currentAdminId) return false

      const result = await db.loadCompanyState(targetUserId)
      if (result.state) {
        setOriginalUserId(currentAdminId)
        setIsImpersonating(true)
        setState(result.state)
        return true
      }
      return false
    },

    stopImpersonation: async () => {
      if (!originalUserId) return
      
      const result = await db.loadCompanyState(originalUserId)
      if (result.state) {
        setState(result.state)
      }
      setIsImpersonating(false)
      setOriginalUserId(null)
    },
  }), [state, ready, error, isImpersonating, originalUserId])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('Store ausente')
  return ctx
}

export function useSession() {
  const { state } = useStore()
  const user = currentUser(state)
  const company = currentCompany(state)
  
  return {
    user,
    company,
    products: company ? state.products.filter((p) => p.companyId === company.id) : [],
    movements: company ? state.movements.filter((m) => m.companyId === company.id) : [],
    notifications: company ? state.notifications.filter((n) => n.companyId === company.id) : [],
    audit: company ? state.audit.filter((a) => a.companyId === company.id) : [],
    team: company ? state.users.filter((u) => u.companyId === company.id) : [],
    categories: company ? state.categories[company.id] || [] : [],
    suppliers: company ? (state.suppliers || []).filter((s) => s.companyId === company.id) : [],
    stores: company ? (state.stores || []).filter((s) => s.companyId === company.id) : [],
    plans: state.plans || [],
    subscription: state.subscription || null,
    insights: company ? generateInsights(state) : [],
    kpis: company ? kpis(state) : { products: 0, units: 0, low: 0, value: 0, sales: 0, revenue: 0, idle: 0, movements: 0 }
  }
}

export type ProductDraft = any
export type ProductRecord = Product