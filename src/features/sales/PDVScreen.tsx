import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, Trash2, Plus, Minus, Printer, CheckCircle2, User, PlayCircle, ScanLine, X } from 'lucide-react';
import { useStore, usePDVStore } from '../../store';
import { PaymentModal } from './PaymentModal';
import { ThermalReceipt } from './ThermalReceipt';
import { Sale, Product } from '../../types';
import SpecularButton from '../../components/ui/SpecularButton';
import { Scanner } from '../../components/Scanner';

export function PDVScreen() {
  const { state, finalizeSale, currentCashRegister, resumeSale } = useStore();
  const { cart, addItem, removeItem, updateQuantity, clearCart, getTotal, discount, setDiscount } = usePDVStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [activeCategory, setActiveCategory] = useState('Todos');
  
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  const products = state.products;
  const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (activeCategory !== 'Todos') {
      filtered = filtered.filter(p => p.category === activeCategory);
    }
    if (!searchTerm) return filtered;
    const lower = searchTerm.toLowerCase();
    return filtered.filter((p: Product) => 
      p.name.toLowerCase().includes(lower) || 
      p.sku?.toLowerCase().includes(lower) || 
      p.barcode?.includes(searchTerm)
    );
  }, [products, searchTerm, activeCategory]);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = getTotal();

  const handleBarcodeScan = (code: string) => {
    const cleanCode = code.trim().toLowerCase();
    const product = products.find(p => p.barcode?.toLowerCase() === cleanCode || p.sku?.toLowerCase() === cleanCode);

    if (product) {
      if (product.qty > 0) {
        addItem({ productId: product.id, name: product.name, price: product.price, stockAvailable: product.qty, quantity: 1 });
        setIsScannerOpen(false);
      } else {
        alert(`O produto "${product.name}" está sem estoque!`);
      }
    } else {
      alert(`Nenhum produto encontrado com o código: ${code}`);
    }
  };

  const handleCheckout = async (payments: any[]) => {
    if (!currentCashRegister) {
      alert("Por favor, abra o caixa antes de iniciar as vendas.");
      return;
    }

    const saleId = await finalizeSale({
      subtotal, discount, total, customerName: customerName.trim(),
      items: cart.map(item => ({ productId: item.productId, name: item.name, quantity: item.quantity, unit_price: item.price, total_price: item.price * item.quantity })),
      payments
    });

    if (saleId) {
      const newSale: Sale = {
        id: saleId, companyId: state.companies[0]?.id || '', cashRegisterId: currentCashRegister.id,
        userId: state.sessionUserId || '', userName: state.users.find(u => u.id === state.sessionUserId)?.name || 'Operador',
        customerName: customerName.trim(), status: 'completed', subtotal, discount, total,
        items: cart.map(item => ({ productId: item.productId, name: item.name, quantity: item.quantity, unit_price: item.price, total_price: item.price * item.quantity })),
        payments, createdAt: new Date().toISOString()
      };
      
      setLastSale(newSale);
      setIsPaymentModalOpen(false);
      setIsMobileCartOpen(false);
      clearCart();
      setCustomerName('');
    }
  };

  const CartContent = () => (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div className="p-4 sm:p-6 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-pink/20 rounded-xl"><ShoppingCart className="text-brand-pink" size={20} /></div>
          <h2 className="text-xl font-bold font-display text-white">Carrinho</h2>
        </div>
        {cart.length > 0 && (
          <button onClick={clearCart} className="text-red-400/70 hover:text-red-400 text-sm flex items-center gap-1 transition-colors">
            <Trash2 size={16} /> Limpar
          </button>
        )}
      </div>

      <div className="px-4 sm:px-6 pb-4 shrink-0">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <User className="h-5 w-5 text-brand-pink/50 group-focus-within:text-brand-pink transition-colors" />
          </div>
          <input
            type="text" placeholder="Nome do Cliente" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
            className="w-full bg-black/20 border border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-pink/50 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 space-y-3">
        <AnimatePresence>
          {cart.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-white/20 py-10">
              <ShoppingCart size={48} className="mb-4 opacity-50" />
              <p className="text-sm font-medium">Carrinho Vazio</p>
            </motion.div>
          ) : (
            cart.map((item) => (
              <motion.div key={item.productId} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="bg-white/5 border border-white/5 rounded-2xl p-3 sm:p-4 flex justify-between items-center group min-w-0"
              >
                <div className="flex-1 pr-2 min-w-0">
                  <p className="font-medium text-sm text-white line-clamp-1">{item.name}</p>
                  <p className="text-brand-pink/80 text-xs font-semibold mt-1">R$ {item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center bg-black/40 rounded-xl border border-white/10 p-1">
                    <button onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))} className="p-1.5 text-white/50 hover:text-white transition-colors"><Minus size={14} /></button>
                    <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-1.5 text-white/50 hover:text-white transition-colors"><Plus size={14} /></button>
                  </div>
                  <button onClick={() => removeItem(item.productId)} className="p-2 text-white/20 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 sm:p-6 bg-black/20 border-t border-white/5 space-y-4 rounded-t-3xl shrink-0">
        <div className="space-y-2 text-sm text-white/60">
          <div className="flex justify-between items-center"><span>Subtotal</span><span className="text-white">R$ {subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between items-center">
            <span>Desconto</span>
            <div className="flex items-center gap-2">
              <span className="text-white/40 text-xs">R$</span>
              <input type="number" value={discount || ''} onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-right text-white focus:outline-none focus:border-brand-pink" placeholder="0.00" />
            </div>
          </div>
        </div>
        <div className="flex justify-between items-end border-t border-white/10 pt-3">
          <span className="text-base text-white/60 font-medium">Total</span>
          <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight">R$ {total.toFixed(2)}</span>
        </div>
        
        <div className="relative w-full overflow-hidden rounded-2xl">
          <SpecularButton 
            onClick={() => setIsPaymentModalOpen(true)} 
            disabled={cart.length === 0 || !currentCashRegister}
            size="lg" 
            radius={16} 
            tint="#F9A8D4" 
            tintOpacity={0.2} 
            textColor="#ffffff" 
            lineColor="#F9A8D4" 
            baseColor="#16142E" 
            intensity={1.5} 
            glow={1.2} 
            className="w-full py-3 sm:py-4 text-base sm:text-lg font-bold"
          >
            {cart.length === 0 ? 'Carrinho Vazio' : 'Finalizar Venda'}
          </SpecularButton>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-[#0A0514] text-white font-sans overflow-hidden relative">
      
      {/* SIDEBAR CATEGORIAS (Desktop) */}
      <div className="hidden md:flex w-56 lg:w-64 border-r border-white/5 p-4 lg:p-6 flex-col gap-6 backdrop-blur-md bg-white/[0.02] shrink-0">
        <div className="flex-1 overflow-y-auto">
          <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">Categorias</h3>
          <div className="space-y-2">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`w-full text-left px-4 py-3 rounded-2xl text-sm transition-all duration-300 ${activeCategory === cat ? 'bg-brand-pink/20 text-brand-pink font-bold' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => resumeSale()} className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl py-3 text-sm font-medium transition-all shrink-0">
          <PlayCircle size={18} className="text-brand-pink" /> Recuperar
        </button>
      </div>

      {/* ÁREA CENTRAL: PRODUTOS */}
      <div className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 gap-4 md:gap-6 lg:gap-8 overflow-hidden w-full min-w-0">
        
        <div className="flex items-center gap-2 md:gap-4 shrink-0 w-full">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-white/40" size={20} />
            <input type="text" placeholder="Buscar produto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl pl-12 md:pl-14 pr-4 md:pr-6 py-3 md:py-4 text-base md:text-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-pink/50 transition-all"
            />
          </div>
          <button onClick={() => setIsScannerOpen(true)}
            className="flex items-center justify-center gap-2 h-[50px] md:h-[60px] px-4 md:px-6 bg-brand-pink/10 hover:bg-brand-pink/20 border border-brand-pink/30 rounded-2xl md:rounded-3xl text-brand-pink font-bold transition-all shrink-0"
          >
            <ScanLine size={22} />
            <span className="hidden lg:block">Escanear</span>
          </button>
        </div>

        <div className="flex md:hidden overflow-x-auto gap-2 pb-1 shrink-0 w-full [&::-webkit-scrollbar]:hidden">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-brand-pink/20 text-brand-pink' : 'bg-white/5 text-white/60'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto pr-1 md:pr-2 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 auto-rows-max pb-28 md:pb-0 w-full min-w-0">
          <AnimatePresence>
            {filteredProducts.map((product: Product) => (
              <motion.div key={product.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => { if (product.qty > 0) addItem({ productId: product.id, name: product.name, price: product.price, stockAvailable: product.qty, quantity: 1 }); }}
                className={`group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 md:p-4 cursor-pointer flex flex-col justify-between h-28 md:h-32 transition-all hover:bg-white/10 hover:border-brand-pink/30 min-w-0 ${product.qty === 0 ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
              >
                <div className="flex justify-between items-start gap-2 w-full">
                  <h3 className="font-semibold text-white/90 text-xs md:text-sm leading-tight line-clamp-2 flex-1 break-words">{product.name}</h3>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ${product.qty > 5 ? 'bg-white/10 text-white/50' : 'bg-red-500/20 text-red-400'}`}>{product.qty}</span>
                </div>
                <div className="mt-auto pt-2 w-full">
                  <span className="text-brand-pink font-bold text-base md:text-lg">R$ {product.price.toFixed(2)}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* CARRINHO DESKTOP */}
      <div className="hidden md:flex w-[380px] lg:w-[420px] bg-[#16142E]/80 backdrop-blur-3xl border-l border-white/10 flex-col shadow-2xl z-10 shrink-0">
        <CartContent />
      </div>

      {/* CARRINHO MOBILE (Botão Flutuante acima da Dock) */}
      {!isMobileCartOpen && cart.length > 0 && (
        <div className="md:hidden fixed bottom-24 left-4 right-4 z-40">
          <button onClick={() => setIsMobileCartOpen(true)}
            className="w-full bg-brand-pink text-black font-bold rounded-2xl p-4 flex items-center justify-between shadow-[0_8px_32px_rgba(249,168,212,0.4)]"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart size={20} />
              <span>Ver Carrinho</span>
              <span className="bg-black/20 px-2 py-0.5 rounded-full text-sm">{cart.length}</span>
            </div>
            <span>R$ {total.toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* CARRINHO MOBILE (Bottom Sheet) */}
      <AnimatePresence>
        {isMobileCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileCartOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" 
            />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="md:hidden fixed bottom-0 left-0 right-0 max-h-[85vh] bg-[#16142E] rounded-t-3xl border-t border-white/10 z-[70] overflow-hidden"
            >
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/20 rounded-full z-50 pointer-events-none" />
              <div className="absolute top-4 right-4 z-50">
                 <button onClick={() => setIsMobileCartOpen(false)} className="p-2 bg-white/10 rounded-full"><X size={20} /></button>
              </div>
              <div className="pt-8 h-full max-h-[85vh]">
                <CartContent />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} total={total} onConfirm={handleCheckout} />

      {/* MODAL DO SCANNER LIMPO E FUNCIONAL */}
      {isScannerOpen && createPortal(
        <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-4">
          
          {/* Botão X Flutuante Fora do Container */}
          <button
            onClick={() => setIsScannerOpen(false)}
            className="absolute top-6 right-6 z-[9999999] p-3 bg-red-600 hover:bg-red-500 text-white rounded-full shadow-lg transition-transform active:scale-90"
            type="button"
          >
            <X size={32} />
          </button>

          <div className="relative w-full max-w-md bg-[#16142E] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col z-[999999]">
            
            {/* Header */}
            <div className="p-5 border-b border-white/10 bg-[#16142E] flex justify-center">
              <h3 className="font-bold text-white flex items-center gap-2 text-lg">
                <ScanLine className="text-brand-pink" size={24} />
                Aponte para o Código
              </h3>
            </div>
            
            {/* Área da Câmera (Clean, sem overlays bugados) */}
            <div className="relative w-full aspect-[4/3] bg-black overflow-hidden">
              <Scanner 
                onScan={(code) => { handleBarcodeScan(code); }} 
                onClose={() => setIsScannerOpen(false)} 
              />
            </div>

            {/* Botão de Cancelar no Rodapé */}
            <div className="p-5 bg-[#16142E] border-t border-white/10 z-[9999999]">
              <button
                onClick={() => setIsScannerOpen(false)}
                className="w-full bg-white/5 hover:bg-white/10 text-white font-medium py-4 rounded-xl transition-colors border border-white/10"
              >
                Cancelar Leitura
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de Sucesso */}
      {lastSale && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="bg-[#16142E] border border-white/10 rounded-[32px] p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-20 h-20 bg-brand-pink/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-brand-pink" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 font-display">Venda Concluída</h2>
            <p className="text-white/50 text-sm mb-6">A venda #{lastSale.id.slice(0,6).toUpperCase()} foi registrada.</p>
            
            {lastSale.customerName && (
              <div className="bg-white/5 rounded-xl p-3 mb-6 flex items-center justify-center gap-2">
                <User size={16} className="text-brand-pink" />
                <span className="text-white text-sm font-medium">{lastSale.customerName}</span>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => window.print()} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-2xl text-sm font-medium transition-colors flex items-center justify-center gap-2"><Printer size={18} /> Imprimir</button>
              <button onClick={() => setLastSale(null)} className="flex-1 bg-brand-pink hover:bg-brand-pink/90 text-black py-3 rounded-2xl text-sm font-bold transition-colors">Nova Venda</button>
            </div>
          </motion.div>
        </div>
      )}

      {lastSale && <ThermalReceipt sale={lastSale} company={state.companies[0]} />}
    </div>
  );
}