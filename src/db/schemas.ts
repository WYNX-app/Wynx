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