import { useState } from 'react';
import { useStore } from '../../store';
import { motion } from 'framer-motion';
import { DollarSign, Lock, Unlock, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

export function CashRegister() {
  const { currentCashRegister, openCashRegister, closeCashRegister, state } = useStore();
  const [initialAmount, setInitialAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);

  const sales = state.sales || [];
  const cashMovements = state.cashMovements || [];

  const totalSales = sales.reduce((acc, sale) => acc + sale.total, 0);

  return (
    <div className="p-8 max-w-4xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-6">Caixa</h1>
      
      {!currentCashRegister ? (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
          <Lock className="mx-auto h-16 w-16 text-red-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Caixa Fechado</h2>
          <p className="text-white/60 mb-6">Abra o caixa para começar a registrar vendas.</p>
          <div className="flex flex-col items-center gap-4">
            <input 
              type="number" 
              placeholder="Valor inicial (R$)" 
              className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-center text-white w-64"
              onChange={(e) => setInitialAmount(Number(e.target.value))}
            />
            <button 
              onClick={() => openCashRegister(initialAmount)} 
              className="bg-cyan-600 hover:bg-cyan-500 px-8 py-3 rounded-xl font-bold transition"
            >
              Abrir Caixa
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-green-500/10 border border-green-500/30 rounded-3xl p-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-green-400 font-bold uppercase">Caixa Aberto</p>
              <p className="text-3xl font-bold">R$ {currentCashRegister.initialAmount.toFixed(2)}</p>
              <p className="text-xs text-white/50">Aberto em: {new Date(currentCashRegister.openedAt!).toLocaleString()}</p>
            </div>
            <Unlock className="h-10 w-10 text-green-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <p className="text-xs text-white/50 uppercase">Vendas Realizadas</p>
              <p className="text-2xl font-bold text-cyan-400">{sales.length}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <p className="text-xs text-white/50 uppercase">Total Vendido</p>
              <p className="text-2xl font-bold text-cyan-400">R$ {totalSales.toFixed(2)}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <p className="text-xs text-white/50 uppercase">Movimentações</p>
              <p className="text-2xl font-bold text-cyan-400">{cashMovements.length}</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h2 className="text-xl font-bold mb-4">Fechar Caixa</h2>
            <div className="flex flex-col items-center gap-4">
              <input 
                type="number" 
                placeholder="Valor contado (R$)" 
                className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-center text-white w-64"
                onChange={(e) => setFinalAmount(Number(e.target.value))}
              />
              <button 
                onClick={() => closeCashRegister(finalAmount)} 
                className="bg-red-600 hover:bg-red-500 px-8 py-3 rounded-xl font-bold transition"
              >
                Fechar Caixa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}