export const productSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    companyId: { type: 'string' },
    name: { type: 'string' },
    sku: { type: 'string' },
    category: { type: 'string' },
    color: { type: 'string' },
    size: { type: 'string' },
    barcode: { type: 'string' },
    price: { type: 'number' },
    cost: { type: 'number' },
    qty: { type: 'number' },
    minQty: { type: 'number' },
    notes: { type: 'string' },
    supplierId: { type: 'string' }, // <-- Simplificado
    storeId: { type: 'string' },    // <-- Simplificado
    updatedAt: { type: 'string' },
  },
  required: ['id', 'name', 'companyId'],
};

// Adicione ao seu schemas.ts

export const cashRegisterSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    companyId: { type: 'string' },
    userId: { type: 'string' },
    status: { type: 'string' }, // 'open' | 'closed'
    initialAmount: { type: 'number' },
    openedAt: { type: 'string' },
    closedAt: { type: 'string' },
    finalAmount: { type: 'number' },
    expectedAmount: { type: 'number' },
    discrepancy: { type: 'number' },
    notes: { type: 'string' },
    updatedAt: { type: 'string' },
    _deleted: { type: 'boolean' }
  },
  required: ['id', 'companyId', 'status', 'initialAmount', 'openedAt']
};

export const saleSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    companyId: { type: 'string' },
    cashRegisterId: { type: 'string' },
    userId: { type: 'string' },
    userName: { type: 'string' },
    status: { type: 'string' }, // 'completed' | 'cancelled'
    subtotal: { type: 'number' },
    discount: { type: 'number' },
    total: { type: 'number' },
    items: { type: 'array', items: { type: 'object' } },
    payments: { type: 'array', items: { type: 'object' } },
    createdAt: { type: 'string' },
    cancelledAt: { type: 'string' },
    cancelReason: { type: 'string' },
    updatedAt: { type: 'string' },
    _deleted: { type: 'boolean' }
  },
  required: ['id', 'companyId', 'cashRegisterId', 'total', 'status', 'createdAt']
};

export const cashMovementSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    cashRegisterId: { type: 'string' },
    companyId: { type: 'string' },
    type: { type: 'string' }, // 'suprimento' | 'sangria'
    amount: { type: 'number' },
    description: { type: 'string' },
    userId: { type: 'string' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
    _deleted: { type: 'boolean' }
  },
  required: ['id', 'cashRegisterId', 'companyId', 'type', 'amount', 'description']
};

export const movementSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    companyId: { type: 'string' },
    productId: { type: 'string' },
    productName: { type: 'string' },
    type: { type: 'string' },
    qty: { type: 'number' },
    resultingQty: { type: 'number' },
    note: { type: 'string' },
    userId: { type: 'string' },
    userName: { type: 'string' },
    createdAt: { type: 'string' },
  },
  required: ['id', 'companyId', 'productId', 'type', 'qty'],
};