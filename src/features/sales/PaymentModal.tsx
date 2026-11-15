import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Banknote, CreditCard, QrCode, CheckCircle2, Delete } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onConfirm: (payments: any[]) => void;
}

type Method = 'dinheiro' | 'pix' | 'credito' | 'debito';

export function PaymentModal({ isOpen, onClose, total, onConfirm }: PaymentModalProps) {
  const [payments, setPayments] = useState<{ method: Method; amount: number; received: number }[]>([]);
  const [currentMethod, setCurrentMethod] = useState<Method>('dinheiro');
  const [amountInput, setAmountInput] = useState('');
  const [receivedInput, setReceivedInput] = useState('');

  const remaining = Math.max(0, total - payments.reduce((acc, p) => acc + p.amount, 0));

  const handleNumpad = (val: string) => {
    if (val === 'backspace') {
      if (currentMethod === 'dinheiro') setReceivedInput(prev => prev.slice(0, -1));
      else setAmountInput(prev => prev.slice(0, -1));
    } else if (val === '.') {
      if (currentMethod === 'dinheiro' && !receivedInput.includes('.')) setReceivedInput(prev => prev + '.');
      else if (currentMethod !== 'dinheiro' && !amountInput.includes('.')) setAmountInput(prev => prev + '.');
    } else {
      if (currentMethod === 'dinheiro') setReceivedInput(prev => prev + val);
      else setAmountInput(prev => prev + val);
    }
  };

  const addPayment = () => {
    const amount = parseFloat(amountInput.replace(',', '.')) || remaining;
    const received = currentMethod === 'dinheiro' ? (parseFloat(receivedInput.replace(',', '.')) || amount) : amount;

    if (currentMethod === 'dinheiro' && received < amount) {
      alert('Valor recebido é menor que o valor do pagamento.');
      return;
    }

    setPayments([...payments, { method: currentMethod, amount, received }]);
    setAmountInput('');
    setReceivedInput('');
  };

  const handleConfirm = () => {
    if (payments.length === 0) {
      onConfirm([{
        method: currentMethod,
        amount: total,
        received_amount: currentMethod === 'dinheiro' ? (parseFloat(receivedInput.replace(',', '.')) || total) : total,
        change_amount: currentMethod === 'dinheiro' ? Math.max(0, (parseFloat(receivedInput.replace(',', '.')) || total) - total) : 0
      }]);
    } else {
      const finalPayments = payments.map(p => ({
        method: p.method,
        amount: p.amount,
        received_amount: p.received,
        change_amount: p.received - p.amount
      }));
      
      if (remaining > 0) {
        finalPayments.push({
          method: currentMethod,
          amount: remaining,
          received_amount: currentMethod === 'dinheiro' ? (parseFloat(receivedInput.replace(',', '.')) || remaining) : remaining,
          change_amount: currentMethod === 'dinheiro' ? Math.max(0, (parseFloat(receivedInput.replace(',', '.')) || remaining) - remaining) : 0
        });
      }
      onConfirm(finalPayments);
    }
  };

  if (!isOpen) return null;

  const change = currentMethod === 'dinheiro' && parseFloat(receivedInput) > (parseFloat(amountInput) || remaining) 
    ? parseFloat(receivedInput) - (parseFloat(amountInput) || remaining) 
    : 0;

  return (
    <AnimatePresence>
      {/* OVERLAY COM Z-INDEX ALTÍSSIMO PARA COBRIR A DOCK */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 dark:bg-black/70 backdrop-blur-md p-2 sm:p-4"
      >
        <motion.div 
          initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} 
          className="w-full max-w-3xl max-h-[90dvh] bg-white/70 dark:bg-[#16142E]/80 backdrop-blur-3xl border border-white/50 dark:border-white/10 rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.2)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden"
        >
          {/* HEADER DO MODAL */}
          <div className="flex justify-between items-center p-4 sm:p-6 border-b border-black/5 dark:border-white/5 shrink-0">
            <h2 className="text-xl font-bold text-text-primary dark:text-white">Pagamento</h2>
            <button onClick={onClose} className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors text-text-muted dark:text-white/60">
              <X size={20} />
            </button>
          </div>

          {/* CONTEÚDO COM ROLAGEM PARA O BOTÃO NÃO FICAR CORTADO NO MOBILE */}
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 p-4 sm:p-8 overflow-y-auto custom-scrollbar">
            
            {/* LADO ESQUERDO: TOTAL E MÉTODOS */}
            <div className="space-y-6">
              <div className="text-center bg-brand-pink/10 dark:bg-brand-pink/5 rounded-3xl p-6 border border-brand-pink/20 dark:border-brand-pink/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] dark:shadow-none">
                <p className="text-text-muted dark:text-white/50 text-xs font-bold uppercase tracking-wider mb-1">Total a Pagar</p>
                <h3 className="text-4xl sm:text-5xl font-black text-brand-pink tracking-tight drop-shadow-sm">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(remaining)}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'dinheiro', icon: Banknote, label: 'Dinheiro' },
                  { id: 'pix', icon: QrCode, label: 'PIX' },
                  { id: 'credito', icon: CreditCard, label: 'Crédito' },
                  { id: 'debito', icon: CreditCard, label: 'Débito' },
                ].map((m) => (
                  <button 
                    key={m.id} 
                    onClick={() => setCurrentMethod(m.id as Method)} 
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                      currentMethod === m.id 
                        ? 'bg-brand-pink/20 border-brand-pink/50 text-brand-pink shadow-[0_0_15px_rgba(249,168,212,0.3)]' 
                        : 'bg-white/50 dark:bg-white/5 border-black/5 dark:border-white/5 hover:bg-white dark:hover:bg-white/10 text-text-muted dark:text-white/60'
                    }`}
                  >
                    <m.icon size={24} className="mb-2" />
                    <span className="font-semibold text-sm">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* LADO DIREITO: TECLADO E INPUT */}
            <div className="space-y-4 flex flex-col justify-between">
              
              <div>
                <label className="text-xs font-bold text-text-muted dark:text-white/50 uppercase mb-2 block tracking-wider">
                  {currentMethod === 'dinheiro' ? 'Valor Recebido' : 'Valor do Pagamento'}
                </label>
                <input
                  type="text"
                  placeholder="0.00"
                  value={currentMethod === 'dinheiro' ? receivedInput : amountInput}
                  readOnly
                  className="w-full bg-white/60 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-2xl px-6 py-4 text-4xl font-bold text-right text-text-primary dark:text-white placeholder-text-muted/30 dark:placeholder-white/10 outline-none focus:ring-2 focus:ring-brand-pink/50 transition-all shadow-inner"
                />
              </div>

              {/* ÁREA DO TROCO */}
              <div className={`h-14 rounded-2xl flex items-center justify-between px-6 transition-all duration-300 ${change > 0 ? 'bg-brand-pink/20 border border-brand-pink/40' : 'bg-transparent border border-transparent'}`}>
                {change > 0 && (
                  <>
                    <span className="text-brand-pink font-bold">Troco</span>
                    <span className="text-2xl font-black text-brand-pink">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(change)}
                    </span>
                  </>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'].map(key => (
                  <button 
                    key={key} 
                    onClick={() => handleNumpad(key)} 
                    className="bg-white/60 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10 border border-black/5 dark:border-white/5 rounded-xl py-3 text-xl font-bold text-text-primary dark:text-white transition-all active:scale-95 shadow-sm flex items-center justify-center"
                  >
                    {key === 'backspace' ? <Delete size={20} /> : key}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={addPayment} 
                  disabled={remaining <= 0} 
                  className="flex-1 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-black/5 dark:border-white/10 disabled:opacity-50 text-text-primary dark:text-white py-4 rounded-2xl font-bold transition-all active:scale-95"
                >
                  Add Pagamento
                </button>
                <button 
                  onClick={handleConfirm} 
                  disabled={remaining > 0 && payments.length === 0} 
                  className="flex-1 bg-brand-pink hover:bg-brand-pink/90 disabled:opacity-50 text-black py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-[0_0_20px_rgba(249,168,212,0.4)] flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={20} />
                  Confirmar
                </button>
              </div>

            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}