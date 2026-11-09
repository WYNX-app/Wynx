import { useStore } from '../../store';
import { Printer } from 'lucide-react';
import { ThermalReceipt } from './ThermalReceipt';
import { useState } from 'react';

export function SalesHistory() {
  const { state } = useStore();
  const sales = state.sales || [];
  const [selectedSale, setSelectedSale] = useState<any>(null);

  return (
    <div className="p-8 max-w-5xl mx-auto text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Histórico de Vendas</h1>
        <p className="text-sm text-white/50">Consulte todas as vendas realizadas no sistema.</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/20 text-white/50 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 font-medium">Venda</th>
              <th className="px-6 py-4 font-medium">Data/Hora</th>
              <th className="px-6 py-4 font-medium">Operador</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Total</th>
              <th className="px-6 py-4 font-medium text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-white/40">Nenhuma venda registrada ainda.</td>
              </tr>
            ) : (
              sales.map((sale) => (
                <tr key={sale.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="px-6 py-4 font-mono text-xs text-cyan-400">#{sale.id.slice(0, 6).toUpperCase()}</td>
                  <td className="px-6 py-4 text-white/70">{new Date(sale.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4 text-white/70">{sale.userName}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                      sale.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {sale.status === 'completed' ? 'Concluída' : 'Cancelada'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-white">
                    R$ {sale.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => setSelectedSale(sale)}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-white/70 hover:text-white"
                      title="Ver recibo"
                    >
                      <Printer size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-6 w-full max-w-sm">
            <div className="max-h-[60vh] overflow-y-auto bg-white rounded-xl p-2 mb-4">
              <ThermalReceipt sale={selectedSale} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSelectedSale(null)} className="flex-1 py-3 rounded-xl font-bold bg-white/10 hover:bg-white/20 transition">Fechar</button>
              <button onClick={() => window.print()} className="flex-1 py-3 rounded-xl font-bold bg-cyan-600 hover:bg-cyan-500 transition">Imprimir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}