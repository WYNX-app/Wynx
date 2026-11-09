import { createRxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { replicateSupabase } from 'rxdb/plugins/replication-supabase';
import { 
  productSchema, 
  movementSchema,
  cashRegisterSchema,
  saleSchema,
  cashMovementSchema
} from './schemas';
import { supabase } from '../lib/supabase/client';

let dbInstance: any = null;
let dbPromise: Promise<any> | null = null;

export async function getLocalDb() {
  if (dbInstance) return dbInstance;
  if (dbPromise) return dbPromise;

  dbPromise = (async () => {
    try {
      const db = await createRxDatabase({
        name: 'wynxdb_v6', // AUMENTEI A VERSÃO PARA FORÇAR O RXDB A CRIAR AS NOVAS TABELAS SEM CONFLITO
        storage: getRxStorageDexie(),
      });

      // Adicionando todas as coleções (antigas e novas)
      await db.addCollections({
        products: { schema: productSchema },
        movements: { schema: movementSchema },
        cashRegisters: { schema: cashRegisterSchema },
        sales: { schema: saleSchema },
        cashMovements: { schema: cashMovementSchema },
      });

      const productsCol = db.collections.products;
      const movementsCol = db.collections.movements;
      const cashRegistersCol = db.collections.cashRegisters;
      const salesCol = db.collections.sales;
      const cashMovementsCol = db.collections.cashMovements;

      if (!productsCol || !movementsCol || !cashRegistersCol || !salesCol || !cashMovementsCol) {
        throw new Error('Falha ao criar coleções locais.');
      }

      // ==========================================
      // SINCRONIZAÇÃO COM SUPABASE (Replication)
      // ==========================================

      // 1. Produtos
      // Sincronização de Produtos
      replicateSupabase({
        tableName: 'products',
        client: supabase,
        collection: productsCol,
        replicationIdentifier: 'products-supabase',
        live: true,
        autoStart: true, // <-- GARANTA QUE ESTÁ TRUE
        pull: {
          batchSize: 100, // Aumente o batchSize para baixar mais rápido
          modifier: (doc: any) => {
            if (doc.supplierId === null) delete doc.supplierId;
            if (doc.storeId === null) delete doc.storeId;
            return doc;
          }
        },
        push: { batchSize: 100 },
      });

      // 2. Movimentações de Estoque
      replicateSupabase({
        tableName: 'movements',
        client: supabase,
        collection: movementsCol,
        replicationIdentifier: 'movements-supabase',
        live: true,
        autoStart: true,
        pull: { batchSize: 50 },
        push: { batchSize: 50 },
      });

      // 3. Sessões de Caixa
      replicateSupabase({
        tableName: 'cash_registers',
        client: supabase,
        collection: cashRegistersCol,
        replicationIdentifier: 'cash_registers-supabase',
        live: true,
        autoStart: true,
        pull: { batchSize: 20 },
        push: { batchSize: 20 },
      });

      // 4. Vendas (PDV)
      replicateSupabase({
        tableName: 'sales',
        client: supabase,
        collection: salesCol,
        replicationIdentifier: 'sales-supabase',
        live: true,
        autoStart: true,
        pull: { batchSize: 50 },
        push: { batchSize: 50 },
      });

      // 5. Movimentações de Caixa (Sangria/Suprimento)
      replicateSupabase({
        tableName: 'cash_movements',
        client: supabase,
        collection: cashMovementsCol,
        replicationIdentifier: 'cash_movements-supabase',
        live: true,
        autoStart: true,
        pull: { batchSize: 50 },
        push: { batchSize: 50 },
      });

      dbInstance = db;
      console.log('%c[WYNX] Banco offline pronto (Produtos, Estoque, Caixa e Vendas)!', 'color: #06B6D4; font-weight: bold;');
      return db;
    } catch (error) {
      dbPromise = null;
      throw error;
    }
  })();

  return dbPromise;
}