import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Banknote, CreditCard, QrCode, CheckCircle2, Delete } from 'lucide-react';
import GlassSurface from '../../components/ui/GlassSurface';
import SpecularButton from '../../components/ui/SpecularButton';

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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="w-full max-w-2xl">
          <GlassSurface width="100%" height="auto" borderRadius={32} distortionScale={-100} backgroundOpacity={0.1} blur={12} className="shadow-2xl overflow-hidden border border-white/10">
            <div className="w-full text-white">
              
              <div className="flex justify-between items-center p-6 border-b border-white/10">
                <h2 className="text-xl font-bold font-display">Pagamento</h2>
                <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
              </div>

              <div className="grid md:grid-cols-2 gap-8 p-8">
                
                {/* ESQUERDA: MÉTODOS */}
                <div className="space-y-6">
                  <div className="text-center bg-black/20 rounded-2xl p-6 border border-white/5">
                    <p className="text-white/50 text-sm mb-1 uppercase tracking-wider font-medium">Total a Pagar</p>
                    <h3 className="text-5xl font-bold text-brand-pink tracking-tight">R$ {remaining.toFixed(2)}</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'dinheiro', icon: Banknote, label: 'Dinheiro' },
                      { id: 'pix', icon: QrCode, label: 'PIX' },
                      { id: 'credito', icon: CreditCard, label: 'Crédito' },
                      { id: 'debito', icon: CreditCard, label: 'Débito' },
                    ].map((m) => (
                      <button key={m.id} onClick={() => setCurrentMethod(m.id as Method)} className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${currentMethod === m.id ? 'bg-brand-pink/20 border-brand-pink/50 text-brand-pink' : 'bg-white/5 border-transparent hover:bg-white/10 text-white/60'}`}>
                        <m.icon size={24} className="mb-2" />
                        <span className="font-semibold text-sm">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* DIREITA: TECLADO E TROCO */}
                <div className="space-y-4">
                  
                  {currentMethod === 'dinheiro' ? (
                    <div>
                      <label className="text-xs text-white/50 uppercase font-bold mb-2 block">Valor Recebido</label>
                      <input
                        type="text"
                        placeholder="0.00"
                        value={receivedInput}
                        readOnly
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-4xl font-bold text-right text-white placeholder-white/20 outline-none focus:border-brand-pink/50 transition-colors"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs text-white/50 uppercase font-bold mb-2 block">Valor do Pagamento</label>
                      <input
                        type="text"
                        placeholder={remaining.toFixed(2)}
                        value={amountInput}
                        readOnly
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-4xl font-bold text-right text-white placeholder-white/20 outline-none"
                      />
                    </div>
                  )}

                  {/* ÁREA DO TROCO BEM VISÍVEL */}
                  <div className={`h-16 rounded-2xl flex items-center justify-between px-6 transition-all duration-300 ${change > 0 ? 'bg-brand-pink/10 border border-brand-pink/30' : 'bg-transparent border border-transparent'}`}>
                    {change > 0 && (
                      <>
                        <span className="text-brand-pink font-semibold">Troco</span>
                        <span className="text-2xl font-bold text-brand-pink">R$ {change.toFixed(2)}</span>
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'].map(key => (
                      <button key={key} onClick={() => handleNumpad(key)} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 text-xl font-medium transition active:scale-95 flex items-center justify-center">
                        {key === 'backspace' ? <Delete size={20} /> : key}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button onClick={addPayment} disabled={remaining <= 0} className="flex-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white py-4 rounded-xl font-bold transition">
                      Add Pagamento
                    </button>
                    <SpecularButton
                      onClick={handleConfirm}
                      disabled={remaining > 0 && payments.length === 0}
                      size="md"
                      radius={12}
                      tint="#F9A8D4"
                      tintOpacity={0.2}
                      textColor="#ffffff"
                      lineColor="#F9A8D4"
                      baseColor="#16142E"
                      className="flex-1 py-4"
                    >
                      Confirmar
                    </SpecularButton>
                  </div>
                </div>

              </div>
            </div>
          </GlassSurface>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}