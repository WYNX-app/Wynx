import { createRxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { replicateSupabase } from 'rxdb/plugins/replication-supabase';
import { productSchema, movementSchema } from './schemas';
import { supabase } from '../lib/supabase/client';

let dbInstance: any = null;
let dbPromise: Promise<any> | null = null;

export async function getLocalDb() {
  // Se o banco já está pronto, retorna ele
  if (dbInstance) return dbInstance;
  
  // Se já está sendo criado, retorna a promessa em andamento (evita o erro de duplicação)
  if (dbPromise) return dbPromise;

  // Cria o banco do zero (sem dev-mode, sem avisos)
  dbPromise = (async () => {
    try {
      const db = await createRxDatabase({
        name: 'wynxdb_v5', // Novo nome para limpar qualquer cache antigo
        storage: getRxStorageDexie(), // Sem validação AJV para ficar leve e sem erros
      });

      await db.addCollections({
        products: { schema: productSchema },
        movements: { schema: movementSchema },
      });

      const productsCol = db.collections.products;
      const movementsCol = db.collections.movements;

      if (!productsCol || !movementsCol) {
        throw new Error('Falha ao criar coleções locais.');
      }

      // Sincronização de Produtos
      replicateSupabase({
        tableName: 'products',
        client: supabase,
        collection: productsCol,
        replicationIdentifier: 'products-supabase',
        live: true,
        autoStart: true,
        pull: {
          batchSize: 50,
          modifier: (doc: any) => {
            if (doc.supplierId === null) delete doc.supplierId;
            if (doc.storeId === null) delete doc.storeId;
            return doc;
          }
        },
        push: { batchSize: 50 },
      });

      // Sincronização de Movimentações
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

      dbInstance = db;
      console.log('%c[WYNX] Banco offline pronto e sincronizado!', 'color: #06B6D4; font-weight: bold;');
      return db;
    } catch (error) {
      dbPromise = null; // Permite tentar novamente se falhar
      throw error;
    }
  })();

  return dbPromise;
}