import React from 'react';
import { Sale, Company } from '../../types';

interface ThermalReceiptProps {
  sale: Sale;
  company?: Company;
}

export function ThermalReceipt({ sale, company }: ThermalReceiptProps) {
  const date = new Date(sale.createdAt).toLocaleString('pt-BR');
  const companyDocument =
    (company as any)?.cnpj ??
    (company as any)?.taxId ??
    (company as any)?.document ??
    (company as any)?.documentNumber;
  const companyCity = (company as any)?.city ?? (company as any)?.municipality;
  const companyState = (company as any)?.state ?? (company as any)?.uf;

  return (
    <div id="thermal-receipt" className="hidden print:block text-black bg-white font-mono text-xs w-[80mm] p-2">
      <style type="text/css">
        {`
          @media print {
            body * { visibility: hidden; }
            #thermal-receipt, #thermal-receipt * { visibility: visible; }
            #thermal-receipt { 
              position: absolute; 
              left: 0; 
              top: 0; 
              width: 80mm; 
              margin: 0;
              padding: 2mm;
            }
            @page { margin: 0; size: 80mm auto; }
          }
        `}
      </style>

      {/* Cabeçalho Dinâmico - Só imprime o que existir */}
      <div className="text-center mb-3">
        <h2 className="font-bold text-sm uppercase">{company?.name || 'WYNX'}</h2>

        {companyDocument && <p>CNPJ: {companyDocument}</p>}

        {companyCity && companyState && (
          <p>{companyCity} - {companyState}</p>
        )}

        <p className="mt-1">--------------------------------</p>
      </div>

      {/* Identificação */}
      <div className="mb-2">
        <p><strong>Venda:</strong> #{sale.id.slice(0, 8).toUpperCase()}</p>
        <p><strong>Data:</strong> {date}</p>
        <p><strong>Operador:</strong> {sale.userName}</p>
        {sale.customerName && <p><strong>Cliente:</strong> {sale.customerName}</p>}
      </div>

      <p>--------------------------------</p>

      {/* Itens */}
      <div className="mb-2">
        {sale.items.map((item: any, index: number) => (
          <div key={index} className="mb-1">
            <p className="font-bold">{item.name || 'Produto'}</p>
            <div className="flex justify-between">
              <span>{item.quantity} x R$ {item.unit_price.toFixed(2)}</span>
              <span>R$ {item.total_price.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      <p>--------------------------------</p>

      {/* Resumo */}
      <div className="mb-2 space-y-1">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>R$ {sale.subtotal.toFixed(2)}</span>
        </div>
        {sale.discount > 0 && (
          <div className="flex justify-between">
            <span>Desconto:</span>
            <span>- R$ {sale.discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-sm mt-1">
          <span>TOTAL:</span>
          <span>R$ {sale.total.toFixed(2)}</span>
        </div>
      </div>

      <p>--------------------------------</p>

      {/* Pagamentos */}
      <div className="mb-4 space-y-1">
        {sale.payments.map((pay: any, index: number) => (
          <div key={index} className="flex justify-between uppercase">
            <span>{pay.method}:</span>
            <span>R$ {pay.amount.toFixed(2)}</span>
          </div>
        ))}
        {sale.payments.some((p: any) => p.method === 'dinheiro') && (
          <>
            {sale.payments.map((pay: any, idx: number) => pay.method === 'dinheiro' && (
              <div key={`cash-${idx}`} className="mt-2">
                <div className="flex justify-between">
                  <span>Valor Recebido:</span>
                  <span>R$ {pay.received_amount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Troco:</span>
                  <span>R$ {pay.change_amount?.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Rodapé */}
      <div className="text-center mt-4">
        <p className="font-bold">Obrigado pela preferência!</p>
        <p className="mt-1">Wynx - Gestão Inteligente</p>
      </div>
    </div>
  );
}