import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from './lib/supabase/client'
import { signIn, signUp, signOut, resetPassword as sbResetPassword } from './lib/supabase/auth'
import * as db from './lib/supabase/data'
import { getLocalDb } from './db/database'
import {
  emptyState,
  currentUser,
  currentCompany,
  generateInsights,
  kpis
} from './engine'
import { AppState, MovementType, PlanId, Product, Role, CashRegister, Sale } from './types'
import { create } from 'zustand';

// --- ZUSTAND: PDV CART ---
export type PaymentMethod = 'dinheiro' | 'pix' | 'credito' | 'debito';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  stockAvailable: number;
}

interface PDVState {
  cart: CartItem[];
  discount: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  setCart: (cart: CartItem[], discount: number) => void;
  setDiscount: (val: number) => void;
  getSubtotal: () => number;
  getTotal: () => number;
}

export const usePDVStore = create<PDVState>((set, get) => ({
  cart: [],
  discount: 0,
  addItem: (item: CartItem) => set((state: PDVState) => {
    const existing = state.cart.find(i => i.productId === item.productId);
    if (existing) {
      return {
        cart: state.cart.map(i => i.productId === item.productId 
          ? { ...i, quantity: i.quantity + 1 } : i)
      };
    }
    return { cart: [...state.cart, { ...item, quantity: 1 }] };
  }),
  removeItem: (id: string) => set((state: PDVState) => ({ cart: state.cart.filter(i => i.productId !== id) })),
  updateQuantity: (id: string, qty: number) => set((state: PDVState) => ({
    cart: state.cart.map(i => i.productId === id ? { ...i, quantity: qty } : i)
  })),
  clearCart: () => set({ cart: [], discount: 0 }),
  setCart: (cart: CartItem[], discount: number) => set({ cart, discount }),
  setDiscount: (val: number) => set({ discount: val }),
  getSubtotal: () => get().cart.reduce((acc: number, item: CartItem) => acc + (item.price * item.quantity), 0),
  getTotal: () => {
    const subtotal = get().getSubtotal();
    return Math.max(0, subtotal - get().discount);
  }
}));

// --- CONTEXTO GLOBAL DO APP ---
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
  
  // MÓDULO DE VENDAS E CAIXA
  currentCashRegister: CashRegister | null;
  sales: Sale[];
  heldSales: any[];
  openCashRegister: (initialAmount: number, notes?: string) => Promise<boolean>;
  closeCashRegister: (finalAmount: number, notes?: string) => Promise<boolean>;
  registerCashMovement: (type: 'suprimento' | 'sangria', amount: number, description: string) => Promise<boolean>;
  finalizeSale: (saleData: any) => Promise<string | null>;
  cancelSale: (saleId: string, reason: string) => Promise<boolean>;
  holdSale: (saleData: any) => void;
  resumeSale: (saleId?: string) => void;
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
      let localDb = null
      try {
        localDb = await getLocalDb()
      } catch (err) {
        console.error('Erro ao inicializar RxDB:', err)
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (cancelled) return
      
      if (session?.user) {
        // 1. Dispara a busca do Supabase e do Banco Local AO MESMO TEMPO
        const [result, localData] = await Promise.all([
          db.loadCompanyState(session.user.id),
          (async () => {
            if (!localDb) return { products: [], movements: [], cashRegisters: [], sales: [] }
            try {
              const [p, m, c, s] = await Promise.all([
                localDb.products.find().exec(),
                localDb.movements.find().exec(),
                localDb.cashRegisters.find().exec(),
                localDb.sales.find().exec()
              ])
              return {
                products: p.map((x: any) => x.toJSON()),
                movements: m.map((x: any) => x.toJSON()),
                cashRegisters: c.map((x: any) => x.toJSON()),
                sales: s.map((x: any) => x.toJSON())
              }
            } catch (err) {
              console.error('Erro ao ler banco local:', err)
              return { products: [], movements: [], cashRegisters: [], sales: [] }
            }
          })()
        ])

        if (cancelled) return

        if (result.state) {
          const remoteProducts = result.state.products || []
          const remoteMovements = result.state.movements || []
          const remoteCash = result.state.cashRegisters || []
          const remoteSales = result.state.sales || []

          // 2. MERGE INTELIGENTE: Se o local tiver mais dados, usa ele. 
          // Se o local estiver vazio ou tiver menos que o Supabase, usa o Supabase.
          const finalProducts = localData.products.length >= remoteProducts.length 
            ? localData.products 
            : remoteProducts;

          const finalMovements = localData.movements.length >= remoteMovements.length 
            ? localData.movements 
            : remoteMovements;

          // Para caixa, o local tem prioridade para não fechar sozinho
          const finalCash = localData.cashRegisters.length > 0 
            ? localData.cashRegisters 
            : remoteCash;

          const finalSales = localData.sales.length >= remoteSales.length 
            ? localData.sales 
            : remoteSales;

          setState({
            ...result.state,
            products: finalProducts,
            movements: finalMovements,
            cashRegisters: finalCash,
            sales: finalSales,
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
          const remoteState = result.state

          if (remoteState) {
            setState(prev => {
              const hasOpenCashLocal = prev.cashRegisters?.some(c => c.status === 'open');
              const hasOpenCashRemote = remoteState.cashRegisters?.some(c => c.status === 'open');
              
              // 3. PROTEÇÃO: Se o Supabase retornar vazio, mantém o que está na tela
              return {
                ...prev, 
                ...remoteState, 
                products: (remoteState.products && remoteState.products.length > 0) ? remoteState.products : prev.products,
                movements: (remoteState.movements && remoteState.movements.length > 0) ? remoteState.movements : prev.movements,
                cashRegisters: (hasOpenCashLocal && !hasOpenCashRemote) ? prev.cashRegisters : remoteState.cashRegisters || [],
                sales: (remoteState.sales && remoteState.sales.length > 0) ? remoteState.sales : prev.sales,
                cashMovements: (remoteState.cashMovements && remoteState.cashMovements.length > 0) ? remoteState.cashMovements : prev.cashMovements,
              }
            })
          }
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
      const localCashRegisters = await localDb.cashRegisters.find().exec()
      const localSales = await localDb.sales.find().exec()

      setState({
        ...result.state,
        products: localProducts.length > 0 ? localProducts.map((p: any) => p.toJSON()) : result.state.products,
        movements: localMovements.length > 0 ? localMovements.map((m: any) => m.toJSON()) : result.state.movements,
        cashRegisters: localCashRegisters.length > 0 ? localCashRegisters.map((c: any) => c.toJSON()) : result.state.cashRegisters,
        sales: localSales.length > 0 ? localSales.map((s: any) => s.toJSON()) : result.state.sales,
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

    // ==========================================
    // MÓDULO DE VENDAS E CAIXA (COM PROTEÇÃO)
    // ==========================================
    
    currentCashRegister: state.cashRegisters?.find((c: CashRegister) => c.status === 'open') || null,
    sales: state.sales || [],
    heldSales: state.heldSales || [],

    openCashRegister: async (initialAmount, notes) => {
      const user = currentUser(state);
      const company = currentCompany(state);
      if (!user || !company) return false;

      try {
        const localDb = await getLocalDb();
        const newRegister: CashRegister = {
          id: crypto.randomUUID(),
          companyId: company.id,
          userId: user.id,
          status: 'open',
          initialAmount,
          openedAt: new Date().toISOString(),
          notes
        };

        await localDb.cashRegisters.insert(newRegister);
        
        setState(prev => ({
          ...prev,
          cashRegisters: [newRegister, ...(prev.cashRegisters || [])]
        }));

        // Falha silenciosa no Supabase para não travar
        supabase.from('cash_registers').insert([newRegister]).then(({ error }) => {
          if (error) console.warn('Aviso: Supabase recusou o caixa. O offline-first continua funcionando.', error);
        });
        
        return true;
      } catch (err: any) {
        setError(err.message);
        return false;
      }
    },

    registerCashMovement: async (type, amount, description) => {
      const user = currentUser(state);
      const company = currentCompany(state);
      const currentCash = state.cashRegisters?.find((c: CashRegister) => c.status === 'open');
      if (!user || !company || !currentCash) return false;

      try {
        const localDb = await getLocalDb();
        const movement = {
          id: crypto.randomUUID(),
          cashRegisterId: currentCash.id,
          companyId: company.id,
          type,
          amount,
          description,
          userId: user.id,
          createdAt: new Date().toISOString()
        };

        await localDb.cashMovements.insert(movement);

        setState(prev => ({
          ...prev,
          cashMovements: [movement, ...(prev.cashMovements || [])]
        }));

        supabase.from('cash_movements').insert([movement]).then(({ error }) => {
          if (error) console.warn('Aviso: Supabase recusou a movimentação.', error);
        });
        return true;
      } catch (err: any) {
        setError(err.message);
        return false;
      }
    },

    finalizeSale: async (saleData) => {
      const user = currentUser(state);
      const company = currentCompany(state);
      const currentCash = state.cashRegisters?.find((c: CashRegister) => c.status === 'open');
      
      if (!user || !company || !currentCash) {
        setError('Caixa fechado ou sessão inválida.');
        return null;
      }

      try {
        const localDb = await getLocalDb();
        const saleId = crypto.randomUUID();
        
        const newSale: Sale = {
          id: saleId,
          companyId: company.id,
          cashRegisterId: currentCash.id,
          userId: user.id,
          userName: user.name,
          customerName: saleData.customerName || '',
          status: 'completed',
          subtotal: saleData.subtotal,
          discount: saleData.discount,
          total: saleData.total,
          items: saleData.items,
          payments: saleData.payments,
          createdAt: new Date().toISOString()
        };

        await localDb.sales.insert(newSale);

        const newMovements: any[] = [];
        const updatedProducts = state.products.map(p => {
          const item = saleData.items.find((i: any) => i.productId === p.id);
          if (item) {
            const nextQty = p.qty - item.quantity;
            newMovements.push({
              id: crypto.randomUUID(),
              companyId: company.id,
              productId: p.id,
              productName: p.name,
              type: 'venda',
              qty: item.quantity,
              resultingQty: nextQty,
              note: `Venda #${saleId.slice(0,6)}`,
              userId: user.id,
              userName: user.name,
              createdAt: new Date().toISOString()
            });
            return { ...p, qty: nextQty, updatedAt: new Date().toISOString() };
          }
          return p;
        });

        for (const p of updatedProducts) {
           const original = state.products.find(op => op.id === p.id);
           if (original && original.qty !== p.qty) {
               await localDb.products.upsert(p);
           }
        }
        for (const m of newMovements) {
           await localDb.movements.insert(m);
        }

        setState(prev => ({
          ...prev,
          sales: [newSale, ...(prev.sales || [])],
          products: updatedProducts,
          movements: [...newMovements, ...prev.movements]
        }));

        supabase.rpc('finalize_sale', {
          p_cash_register_id: currentCash.id,
          p_customer_name: saleData.customerName || null,
          p_total: saleData.total,
          p_subtotal: saleData.subtotal,
          p_discount: saleData.discount,
          p_items: JSON.stringify(saleData.items),
          p_payments: JSON.stringify(saleData.payments)
        }).then(({ error }) => {
          if (error) console.warn('Aviso: Supabase recusou a venda, mas o offline-first já salvou.', error);
        });

        return saleId;
      } catch (err: any) {
        setError('Erro ao finalizar venda: ' + err.message);
        return null;
      }
    },

    holdSale: (saleData) => {
      const user = currentUser(state);
      const company = currentCompany(state);
      if (!user || !company) return;

      const newHeldSale = {
        id: crypto.randomUUID(),
        companyId: company.id,
        userId: user.id,
        userName: user.name,
        customerName: saleData.customerName || '',
        items: saleData.items,
        subtotal: saleData.subtotal,
        discount: saleData.discount,
        total: saleData.total,
        createdAt: new Date().toISOString(),
      };

      setState(prev => ({
        ...prev,
        heldSales: [newHeldSale, ...(prev.heldSales || [])]
      }));
      
      usePDVStore.setState({ cart: [], discount: 0 });
    },

    resumeSale: (saleId) => {
      const held = saleId 
        ? state.heldSales?.find((s: any) => s.id === saleId)
        : state.heldSales?.[0];

      if (!held) {
        setError('Nenhuma venda suspensa encontrada.');
        return;
      }

      usePDVStore.setState({ 
        cart: held.items, 
        discount: held.discount 
      });

      setState(prev => ({
        ...prev,
        heldSales: (prev.heldSales || []).filter((s: any) => s.id !== held.id)
      }));
    },

    closeCashRegister: async (finalAmount, notes) => {
      const user = currentUser(state);
      const currentCash = state.cashRegisters?.find((c: CashRegister) => c.status === 'open');
      if (!user || !currentCash) return false;

      try {
        const localDb = await getLocalDb();
        
        const salesInCash = (state.sales || [])
          .filter((s: Sale) => s.cashRegisterId === currentCash.id && s.status === 'completed')
          .reduce((acc: number, sale: Sale) => {
            const cashPayment = sale.payments.find((p: any) => p.method === 'dinheiro');
            return acc + (cashPayment ? cashPayment.amount : 0);
          }, 0);

        const suprimentos = (state.cashMovements || [])
          .filter((m: any) => m.cashRegisterId === currentCash.id && m.type === 'suprimento')
          .reduce((acc: number, m: any) => acc + m.amount, 0);

        const sangrias = (state.cashMovements || [])
          .filter((m: any) => m.cashRegisterId === currentCash.id && m.type === 'sangria')
          .reduce((acc: number, m: any) => acc + m.amount, 0);

        const expectedAmount = currentCash.initialAmount + salesInCash + suprimentos - sangrias;
        const discrepancy = finalAmount - expectedAmount;
        
        const updatedRegister: CashRegister = {
          ...currentCash,
          status: 'closed',
          closedAt: new Date().toISOString(),
          finalAmount,
          expectedAmount,
          discrepancy,
          notes: notes || currentCash.notes
        };

        await localDb.cashRegisters.upsert(updatedRegister);

        setState(prev => ({
          ...prev,
          cashRegisters: (prev.cashRegisters || []).map((c: CashRegister) => c.id === currentCash.id ? updatedRegister : c)
        }));

        supabase.from('cash_registers').update(updatedRegister).eq('id', currentCash.id).then(({ error }) => {
          if (error) console.warn('Aviso: Supabase recusou o fechamento, mas o local já registrou.', error);
        });
        return true;
      } catch (err: any) {
        setError(err.message);
        return false;
      }
    },

    cancelSale: async (saleId, reason) => {
      const user = currentUser(state);
      if (!user) return false;

      try {
        const localDb = await getLocalDb();
        const saleToCancel = state.sales?.find((s: Sale) => s.id === saleId);
        if (!saleToCancel || saleToCancel.status === 'cancelled') return false;

        const updatedSale = {
          ...saleToCancel,
          status: 'cancelled' as const,
          cancelledAt: new Date().toISOString(),
          cancelReason: reason
        };

        await localDb.sales.upsert(updatedSale);

        const newMovements: any[] = [];
        const updatedProducts = state.products.map(p => {
          const item = saleToCancel.items.find((i: any) => i.productId === p.id);
          if (item) {
            const nextQty = p.qty + item.quantity;
            newMovements.push({
              id: crypto.randomUUID(),
              companyId: saleToCancel.companyId,
              productId: p.id,
              productName: p.name,
              type: 'devolucao',
              qty: item.quantity,
              resultingQty: nextQty,
              note: `Cancelamento Venda #${saleId.slice(0,6)}`,
              userId: user.id,
              userName: user.name,
              createdAt: new Date().toISOString()
            });
            return { ...p, qty: nextQty, updatedAt: new Date().toISOString() };
          }
          return p;
        });

        for (const p of updatedProducts) {
           const original = state.products.find(op => op.id === p.id);
           if (original && original.qty !== p.qty) await localDb.products.upsert(p);
        }
        for (const m of newMovements) {
           await localDb.movements.insert(m);
        }

        setState(prev => ({
          ...prev,
          sales: (prev.sales || []).map((s: Sale) => s.id === saleId ? updatedSale : s),
          products: updatedProducts,
          movements: [...newMovements, ...prev.movements]
        }));

        supabase.from('sales').update(updatedSale).eq('id', saleId).then(({ error }) => {
          if (error) console.warn('Aviso: Supabase recusou o cancelamento, mas o local já registrou.', error);
        });
        return true;
      } catch (err: any) {
        setError('Erro ao cancelar venda: ' + err.message);
        return false;
      }
    }

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