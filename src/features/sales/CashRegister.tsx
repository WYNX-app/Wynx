import { useState } from 'react';
import { useStore } from '../../store';
import { formatMoney } from '../../engine';
import { Lock, Unlock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function CashRegister() {
  const { 
    currentCashRegister, 
    openCashRegister, 
    closeCashRegister, 
    state, 
    registerCashMovement,
    sales
  } = useStore();

  const [initialAmountInput, setInitialAmountInput] = useState('');
  const [finalAmountInput, setFinalAmountInput] = useState('');
  const [notes, setNotes] = useState('');
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [movementType, setMovementType] = useState<'suprimento' | 'sangria'>('suprimento');
  const [movementAmount, setMovementAmount] = useState('');
  const [movementDesc, setMovementDesc] = useState('');

  // CÁLCULOS DO CAIXA ATUAL
  const salesInCash = (sales || [])
    .filter(s => s.cashRegisterId === currentCashRegister?.id && s.status === 'completed')
    .reduce((acc, sale) => {
      const cashPayment = sale.payments.find(p => p.method === 'dinheiro');
      return acc + (cashPayment ? cashPayment.amount : 0);
    }, 0);

  const suprimentos = (state.cashMovements || [])
    .filter(m => m.cashRegisterId === currentCashRegister?.id && m.type === 'suprimento')
    .reduce((acc, m) => acc + m.amount, 0);

  const sangrias = (state.cashMovements || [])
    .filter(m => m.cashRegisterId === currentCashRegister?.id && m.type === 'sangria')
    .reduce((acc, m) => acc + m.amount, 0);

  const expectedAmount = (currentCashRegister?.initialAmount || 0) + salesInCash + suprimentos - sangrias;
  
  const totalSold = (sales || [])
    .filter(s => s.cashRegisterId === currentCashRegister?.id && s.status === 'completed')
    .reduce((acc, sale) => acc + sale.total, 0);
  
  const salesCount = (sales || [])
    .filter(s => s.cashRegisterId === currentCashRegister?.id && s.status === 'completed')
    .length;

  const movementsCount = (state.cashMovements || [])
    .filter(m => m.cashRegisterId === currentCashRegister?.id)
    .length;

  const finalAmountValue = parseFloat(finalAmountInput.replace(',', '.')) || 0;
  const discrepancy = finalAmountValue - expectedAmount;

  const handleCloseCash = async () => {
    if (finalAmountValue <= 0) {
      alert("Insira o valor em caixa para fechar.");
      return;
    }
    if (discrepancy !== 0 && !notes.trim()) {
      alert("Por favor, justifique a diferença no campo de observações.");
      return;
    }
    const success = await closeCashRegister(finalAmountValue, notes);
    if (success) {
      setFinalAmountInput('');
      setNotes('');
    } else {
      alert("Erro ao fechar o caixa.");
    }
  };

  const handleOpenCash = async () => {
    const val = parseFloat(initialAmountInput.replace(',', '.')) || 0;
    const success = await openCashRegister(val);
    if (success) setInitialAmountInput('');
    else alert("Erro ao abrir o caixa.");
  };

  const handleMovement = async () => {
    const val = parseFloat(movementAmount.replace(',', '.')) || 0;
    if (val <= 0) return alert('Valor inválido');
    const success = await registerCashMovement(movementType, val, movementDesc);
    if (success) {
      setShowMovementModal(false);
      setMovementAmount('');
      setMovementDesc('');
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold">Caixa</h1>
      </div>

      {!currentCashRegister ? (
        <div className="bg-white/50 dark:bg-white/5 border border-border-subtle dark:border-white/10 rounded-3xl p-6 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 bg-brand-pink/20 rounded-full flex items-center justify-center mx-auto text-brand-pink mb-2">
            <Unlock size={32} />
          </div>
          <h2 className="text-xl font-bold">Caixa Fechado</h2>
          <p className="text-sm text-text-muted dark:text-white/50">Abra o caixa para iniciar as vendas do dia.</p>
          
          <div className="pt-4 space-y-3">
            <div>
              <label className="text-xs text-text-muted block mb-1 text-left">Valor Inicial (Fundo de Troco)</label>
              <input 
                type="number" 
                value={initialAmountInput}
                onChange={(e) => setInitialAmountInput(e.target.value)}
                placeholder="0.00"
                className="w-full bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl p-3 text-center text-lg font-bold"
              />
            </div>
            <button 
              onClick={handleOpenCash}
              className="w-full bg-brand-pink text-black font-bold py-3 rounded-xl shadow-lg hover:bg-brand-pink/90 transition"
            >
              Abrir Caixa
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* CAIXA ABERTO CARD */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-green-500">
              <Lock size={64} />
            </div>
            <div className="flex items-center gap-2 text-green-500 font-bold text-sm mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              CAIXA ABERTO
            </div>
            <p className="text-3xl font-black text-text-primary dark:text-white">{formatMoney(currentCashRegister.initialAmount)}</p>
            <p className="text-xs text-text-muted dark:text-white/50 mt-1">
              Aberto em: {new Date(currentCashRegister.openedAt).toLocaleString('pt-BR')}
            </p>
          </div>

          {/* STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/50 dark:bg-white/5 border border-border-subtle dark:border-white/10 rounded-3xl p-5">
              <p className="text-xs font-bold text-text-muted dark:text-white/50 uppercase tracking-wider mb-1">Vendas Realizadas</p>
              <p className="text-2xl font-black text-brand-cyan">{salesCount}</p>
            </div>
            <div className="bg-white/50 dark:bg-white/5 border border-border-subtle dark:border-white/10 rounded-3xl p-5">
              <p className="text-xs font-bold text-text-muted dark:text-white/50 uppercase tracking-wider mb-1">Total Vendido</p>
              <p className="text-2xl font-black text-brand-pink">{formatMoney(totalSold)}</p>
            </div>
            <div className="bg-white/50 dark:bg-white/5 border border-border-subtle dark:border-white/10 rounded-3xl p-5 sm:col-span-2 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-text-muted dark:text-white/50 uppercase tracking-wider mb-1">Movimentações</p>
                <p className="text-2xl font-black text-brand-violet">{movementsCount}</p>
              </div>
              <button 
                onClick={() => setShowMovementModal(true)}
                className="bg-brand-violet/20 text-brand-violet hover:bg-brand-violet/30 px-4 py-2 rounded-xl text-sm font-bold transition"
              >
                Nova Movimentação
              </button>
            </div>
          </div>

          {/* FECHAR CAIXA CARD COM LÓGICA DE CONFERÊNCIA */}
          <div className="bg-white/50 dark:bg-white/5 border border-border-subtle dark:border-white/10 rounded-3xl p-6 mt-6 shadow-xl">
            <h3 className="font-bold text-lg mb-4">Fechar Caixa</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-muted block mb-1">Valor em Dinheiro na Gaveta (R$)</label>
                <input 
                  type="number" 
                  value={finalAmountInput}
                  onChange={(e) => setFinalAmountInput(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl p-3 text-xl font-bold text-center focus:border-brand-pink focus:ring-1 focus:ring-brand-pink outline-none transition"
                />
              </div>

              {/* CONFERÊNCIA */}
              {finalAmountInput && (
                <div className={`p-4 rounded-xl border ${discrepancy === 0 ? 'bg-green-500/10 border-green-500/20' : 'bg-orange-500/10 border-orange-500/20'}`}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-text-muted">Esperado no Caixa:</span>
                    <span className="font-bold">{formatMoney(expectedAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold border-t border-black/5 dark:border-white/5 pt-2 mt-2">
                    <span className={discrepancy === 0 ? 'text-green-500' : 'text-orange-500'}>
                      {discrepancy === 0 ? 'Tudo certo!' : discrepancy > 0 ? 'Sobra em Caixa:' : 'Falta em Caixa:'}
                    </span>
                    <span className={discrepancy === 0 ? 'text-green-500' : 'text-orange-500'}>
                      {formatMoney(Math.abs(discrepancy))}
                    </span>
                  </div>
                </div>
              )}

              {/* JUSTIFICATIVA OBRIGATÓRIA SE HOUVER DIFERENÇA */}
              {finalAmountInput && discrepancy !== 0 && (
                <div>
                  <label className="text-xs text-orange-500 font-bold block mb-1">Justificativa Obrigatória *</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Explique o motivo da diferença..."
                    className="w-full bg-black/5 dark:bg-black/20 border border-orange-500/30 rounded-xl p-3 text-sm focus:border-orange-500 outline-none resize-none h-20"
                  />
                </div>
              )}

              <button 
                onClick={handleCloseCash}
                disabled={!!finalAmountInput && discrepancy !== 0 && !notes.trim()}
                className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:hover:bg-red-500 text-white font-bold py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <Lock size={18} /> Fechar Caixa
              </button>
            </div>
          </div>
        </>
      )}

      {/* MODAL MOVIMENTAÇÃO */}
      <AnimatePresence>
        {showMovementModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-[#16142E] w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-border-subtle dark:border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Movimentação</h3>
                <button onClick={() => setShowMovementModal(false)} className="p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2 p-1 bg-black/5 dark:bg-black/20 rounded-xl">
                  <button 
                    onClick={() => setMovementType('suprimento')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${movementType === 'suprimento' ? 'bg-green-500 text-white shadow-sm' : 'text-text-muted hover:text-text-primary dark:hover:text-white'}`}
                  >
                    Suprimento (+)
                  </button>
                  <button 
                    onClick={() => setMovementType('sangria')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${movementType === 'sangria' ? 'bg-red-500 text-white shadow-sm' : 'text-text-muted hover:text-text-primary dark:hover:text-white'}`}
                  >
                    Sangria (-)
                  </button>
                </div>

                <div>
                  <label className="text-xs text-text-muted block mb-1">Valor (R$)</label>
                  <input 
                    type="number" 
                    value={movementAmount}
                    onChange={(e) => setMovementAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl p-3 text-lg font-bold text-center focus:border-brand-pink outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-text-muted block mb-1">Descrição</label>
                  <input 
                    type="text" 
                    value={movementDesc}
                    onChange={(e) => setMovementDesc(e.target.value)}
                    placeholder="Ex: Troco adicional, pagamento de fornecedor..."
                    className="w-full bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm focus:border-brand-pink outline-none"
                  />
                </div>

                <button 
                  onClick={handleMovement}
                  className="w-full bg-brand-pink text-black font-bold py-3 rounded-xl shadow-lg hover:bg-brand-pink/90 transition"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}