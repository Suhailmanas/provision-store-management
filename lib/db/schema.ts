import { pgTable, text, timestamp, boolean, serial, integer, decimal, date } from 'drizzle-orm/pg-core'

// --- Better Auth required tables -------------------------------------------
// Keep the Drizzle field names camelCase for Better Auth, while matching the
// existing lowercase column names already present in Postgres.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailverified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdat').notNull().defaultNow(),
  updatedAt: timestamp('updatedat').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresat').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdat').notNull().defaultNow(),
  updatedAt: timestamp('updatedat').notNull().defaultNow(),
  ipAddress: text('ipaddress'),
  userAgent: text('useragent'),
  userId: text('userid')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountid').notNull(),
  providerId: text('providerid').notNull(),
  userId: text('userid')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accesstoken'),
  refreshToken: text('refreshtoken'),
  idToken: text('idtoken'),
  accessTokenExpiresAt: timestamp('accesstokenexpiresat'),
  refreshTokenExpiresAt: timestamp('refreshtokenexpiresat'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdat').notNull().defaultNow(),
  updatedAt: timestamp('updatedat').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresat').notNull(),
  createdAt: timestamp('createdat').defaultNow(),
  updatedAt: timestamp('updatedat').defaultNow(),
})

// --- App tables ------------------------------------------------------------
// Add your app tables below. Always include a plain `userId` column so queries
// can be scoped per user — the security model depends on this column existing,
// not on a foreign key. Do NOT add a foreign key constraint
// (`.references(() => user.id, ...)`) unless the user explicitly asks for
// foreign keys or referential integrity; FK constraints make iterating on the
// schema harder.
//
// Manas Store PWA tables

export const products = pgTable('products', {
  id: text('id').primaryKey().default('gen_random_uuid()'),
  userId: text('userid').notNull(),
  name: text('name').notNull(),
  category: text('category'),
  supplierId: text('supplierid'),
  fastMoving: boolean('fastmoving').notNull().default(false),
  trackExpiry: boolean('trackexpiry').notNull().default(false),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('createdat').notNull().defaultNow(),
  updatedAt: timestamp('updatedat').notNull().defaultNow(),
})

export const productTypes = pgTable('product_types', {
  id: text('id').primaryKey().default('gen_random_uuid()'),
  userId: text('userid').notNull(),
  productId: text('productid').notNull(),
  brandName: text('brandname').notNull(),
  packSize: text('packsize').notNull(),
  unit: text('unit').notNull(),
  barcode: text('barcode'),
  expiryDate: date('expirydate'),
  buyingPricePerUnit: decimal('buyingpriceperunit', { precision: 10, scale: 2 }).notNull().default('0'),
  sellingPricePerUnit: decimal('sellingpriceperunit', { precision: 10, scale: 2 }).notNull().default('0'),
  openingStock: integer('openingstock').notNull().default(0),
  currentStock: integer('currentstock').notNull().default(0),
  minimumStock: integer('minimumstock').notNull().default(5),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('createdat').notNull().defaultNow(),
  updatedAt: timestamp('updatedat').notNull().defaultNow(),
})

// Kept as a source-compatible name while modules migrate to `productTypes`.
export const productVariants = productTypes

export const purchases = pgTable('purchases', {
  id: text('id').primaryKey().default('gen_random_uuid()'),
  userId: text('userid').notNull(),
  productId: text('productid').notNull(),
  variantId: text('variantid'),
  quantity: integer('quantity').notNull(),
  cost: decimal('cost', { precision: 10, scale: 2 }).notNull(),
  buyingPricePerUnit: decimal('buyingpriceperunit', { precision: 10, scale: 2 }).notNull().default('0'),
  purchaseDate: timestamp('purchasedate').notNull().defaultNow(),
  createdAt: timestamp('createdat').notNull().defaultNow(),
})

export const sales = pgTable('sales', {
  id: text('id').primaryKey().default('gen_random_uuid()'),
  userId: text('userid').notNull(),
  productId: text('productid').notNull(),
  variantId: text('variantid'),
  quantity: integer('quantity').notNull(),
  sellingPrice: decimal('sellingprice', { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal('totalamount', { precision: 10, scale: 2 }).notNull(),
  saleDate: timestamp('saledate').notNull().defaultNow(),
  createdAt: timestamp('createdat').notNull().defaultNow(),
})

export const dailyClose = pgTable('daily_close', {
  id: text('id').primaryKey().default('gen_random_uuid()'),
  userId: text('userid').notNull(),
  productId: text('productid').notNull(),
  variantId: text('variantid'),
  closing_stock: integer('closing_stock').notNull(),
  date: date('date').notNull().defaultNow(),
  notes: text('notes'),
  createdAt: timestamp('createdat').notNull().defaultNow(),
})

export const inventoryLog = pgTable('inventory_log', {
  id: text('id').primaryKey().default('gen_random_uuid()'),
  userId: text('userid').notNull(),
  productId: text('productid').notNull(),
  variantId: text('variantid'),
  transactionType: text('transactiontype').notNull(), // 'purchase', 'sale', 'adjustment'
  quantityChange: integer('quantitychange').notNull(),
  previousStock: integer('previousstock').notNull(),
  newStock: integer('newstock').notNull(),
  reference_id: text('reference_id'),
  reference_type: text('reference_type'),
  createdAt: timestamp('createdat').notNull().defaultNow(),
})

export const productPriceHistory = pgTable('product_price_history', {
  id: text('id').primaryKey().default('gen_random_uuid()'),
  userId: text('userid').notNull(),
  productId: text('productid').notNull(),
  variantId: text('variantid'),
  buyingPrice: decimal('buyingprice', { precision: 10, scale: 2 }).notNull(),
  sellingPrice: decimal('sellingprice', { precision: 10, scale: 2 }).notNull(),
  changedAt: timestamp('changedat').notNull().defaultNow(),
  createdAt: timestamp('createdat').notNull().defaultNow(),
})

export const productExpiry = pgTable('product_expiry', {
  id: text('id').primaryKey().default('gen_random_uuid()'),
  userId: text('userid').notNull(),
  productId: text('productid').notNull(),
  variantId: text('variantid'),
  batchNumber: text('batchnumber').notNull(),
  quantity: integer('quantity').notNull(),
  expiryDate: date('expirydate').notNull(),
  purchaseDate: date('purchasedate').notNull(),
  createdAt: timestamp('createdat').notNull().defaultNow(),
  updatedAt: timestamp('updatedat').notNull().defaultNow(),
})

