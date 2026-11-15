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
        name: 'wynxdb_v6',
        storage: getRxStorageDexie(),
      });

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

      // APENAS PULL (Baixar dados do Supabase para o app)
      // O envio (push) agora é feito manualmente no store.tsx

      replicateSupabase({
        tableName: 'products',
        client: supabase,
        collection: productsCol,
        replicationIdentifier: 'products-supabase',
        live: true,
        autoStart: true,
        pull: {
          batchSize: 100,
          modifier: (doc: any) => {
            if (doc.supplier_id === null) delete doc.supplier_id;
            if (doc.store_id === null) delete doc.store_id;
            return doc;
          }
        }
        // push removido para não dar erro 400
      });

      replicateSupabase({
        tableName: 'movements',
        client: supabase,
        collection: movementsCol,
        replicationIdentifier: 'movements-supabase',
        live: true,
        autoStart: true,
        pull: { batchSize: 50 }
      });

      replicateSupabase({
        tableName: 'cash_registers',
        client: supabase,
        collection: cashRegistersCol,
        replicationIdentifier: 'cash_registers-supabase',
        live: true,
        autoStart: true,
        pull: { batchSize: 20 }
      });

      replicateSupabase({
        tableName: 'sales',
        client: supabase,
        collection: salesCol,
        replicationIdentifier: 'sales-supabase',
        live: true,
        autoStart: true,
        pull: { batchSize: 50 }
      });

      replicateSupabase({
        tableName: 'cash_movements',
        client: supabase,
        collection: cashMovementsCol,
        replicationIdentifier: 'cash_movements-supabase',
        live: true,
        autoStart: true,
        pull: { batchSize: 50 }
      });

      dbInstance = db;
      console.log('%c[WYNX] Banco offline pronto (Modo Leitura)!', 'color: #06B6D4; font-weight: bold;');
      return db;
    } catch (error) {
      dbPromise = null;
      throw error;
    }
  })();

  return dbPromise;
}