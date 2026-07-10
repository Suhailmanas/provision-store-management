import { pgTable, text, timestamp, boolean, serial, integer, decimal, date } from 'drizzle-orm/pg-core'

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- App tables ------------------------------------------------------------
// Add your app tables below. Always include a plain `userId` column so queries
// can be scoped per user — the security model depends on this column existing,
// not on a foreign key. Do NOT add a foreign key constraint
// (`.references(() => user.id, ...)`) unless the user explicitly asks for
// foreign keys or referential integrity; FK constraints make iterating on the
// schema harder.
//
// Kirana Store PWA tables

export const products = pgTable('products', {
  id: text('id').primaryKey().default('gen_random_uuid()'),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  category: text('category'),
  unit: text('unit').notNull(),
  opening_stock: integer('opening_stock').notNull().default(0),
  current_stock: integer('current_stock').notNull().default(0),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const purchases = pgTable('purchases', {
  id: text('id').primaryKey().default('gen_random_uuid()'),
  userId: text('userId').notNull(),
  productId: text('productId').notNull(),
  quantity: integer('quantity').notNull(),
  cost: decimal('cost', { precision: 10, scale: 2 }).notNull(),
  purchaseDate: timestamp('purchaseDate').notNull().defaultNow(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const sales = pgTable('sales', {
  id: text('id').primaryKey().default('gen_random_uuid()'),
  userId: text('userId').notNull(),
  productId: text('productId').notNull(),
  quantity: integer('quantity').notNull(),
  sellingPrice: decimal('sellingPrice', { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal('totalAmount', { precision: 10, scale: 2 }).notNull(),
  saleDate: timestamp('saleDate').notNull().defaultNow(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const dailyClose = pgTable('daily_close', {
  id: text('id').primaryKey().default('gen_random_uuid()'),
  userId: text('userId').notNull(),
  productId: text('productId').notNull(),
  closing_stock: integer('closing_stock').notNull(),
  date: date('date').notNull().defaultNow(),
  notes: text('notes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const inventoryLog = pgTable('inventory_log', {
  id: text('id').primaryKey().default('gen_random_uuid()'),
  userId: text('userId').notNull(),
  productId: text('productId').notNull(),
  transactionType: text('transactionType').notNull(), // 'purchase', 'sale', 'adjustment'
  quantityChange: integer('quantityChange').notNull(),
  previousStock: integer('previousStock').notNull(),
  newStock: integer('newStock').notNull(),
  reference_id: text('reference_id'),
  reference_type: text('reference_type'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})
