-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  userid TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  active BOOLEAN NOT NULL DEFAULT true,
  createdat TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedat TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create new_products table
CREATE TABLE IF NOT EXISTS new_products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  userid TEXT NOT NULL,
  categoryid TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  createdat TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedat TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create product_variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  userid TEXT NOT NULL,
  productid TEXT NOT NULL,
  brand TEXT,
  packsize INTEGER NOT NULL DEFAULT 1,
  unit TEXT NOT NULL,
  buyingprice DECIMAL(10, 2) NOT NULL DEFAULT '0',
  sellingprice DECIMAL(10, 2) NOT NULL DEFAULT '0',
  minimumstock INTEGER NOT NULL DEFAULT 5,
  fastmoving BOOLEAN NOT NULL DEFAULT false,
  expirytracking BOOLEAN NOT NULL DEFAULT false,
  opening_stock INTEGER NOT NULL DEFAULT 0,
  current_stock INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  createdat TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedat TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create product_images table
CREATE TABLE IF NOT EXISTS product_images (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  userid TEXT NOT NULL,
  productid TEXT NOT NULL,
  url TEXT NOT NULL,
  alt TEXT,
  displayorder INTEGER NOT NULL DEFAULT 0,
  createdat TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create purchases_v2 table
CREATE TABLE IF NOT EXISTS purchases_v2 (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  userid TEXT NOT NULL,
  variantid TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  cost DECIMAL(10, 2) NOT NULL,
  purchasedate TIMESTAMP NOT NULL DEFAULT NOW(),
  createdat TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create sales_v2 table
CREATE TABLE IF NOT EXISTS sales_v2 (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  userid TEXT NOT NULL,
  variantid TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  sellingprice DECIMAL(10, 2) NOT NULL,
  totalamount DECIMAL(10, 2) NOT NULL,
  saledate TIMESTAMP NOT NULL DEFAULT NOW(),
  createdat TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create daily_close_v2 table
CREATE TABLE IF NOT EXISTS daily_close_v2 (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  userid TEXT NOT NULL,
  variantid TEXT NOT NULL,
  closing_stock INTEGER NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  createdat TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create inventory_log_v2 table
CREATE TABLE IF NOT EXISTS inventory_log_v2 (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  userid TEXT NOT NULL,
  variantid TEXT NOT NULL,
  transactiontype TEXT NOT NULL,
  quantitychange INTEGER NOT NULL,
  previousstock INTEGER NOT NULL,
  newstock INTEGER NOT NULL,
  reference_id TEXT,
  reference_type TEXT,
  createdat TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_categories_userid ON categories(userid);
CREATE INDEX IF NOT EXISTS idx_new_products_userid ON new_products(userid);
CREATE INDEX IF NOT EXISTS idx_new_products_categoryid ON new_products(categoryid);
CREATE INDEX IF NOT EXISTS idx_product_variants_userid ON product_variants(userid);
CREATE INDEX IF NOT EXISTS idx_product_variants_productid ON product_variants(productid);
CREATE INDEX IF NOT EXISTS idx_product_images_userid ON product_images(userid);
CREATE INDEX IF NOT EXISTS idx_product_images_productid ON product_images(productid);
CREATE INDEX IF NOT EXISTS idx_purchases_v2_userid ON purchases_v2(userid);
CREATE INDEX IF NOT EXISTS idx_purchases_v2_variantid ON purchases_v2(variantid);
CREATE INDEX IF NOT EXISTS idx_sales_v2_userid ON sales_v2(userid);
CREATE INDEX IF NOT EXISTS idx_sales_v2_variantid ON sales_v2(variantid);
CREATE INDEX IF NOT EXISTS idx_daily_close_v2_userid ON daily_close_v2(userid);
CREATE INDEX IF NOT EXISTS idx_daily_close_v2_variantid ON daily_close_v2(variantid);
CREATE INDEX IF NOT EXISTS idx_inventory_log_v2_userid ON inventory_log_v2(userid);
CREATE INDEX IF NOT EXISTS idx_inventory_log_v2_variantid ON inventory_log_v2(variantid);
