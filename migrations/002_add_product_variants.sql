ALTER TABLE purchases ADD COLUMN IF NOT EXISTS variantid TEXT;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS variantid TEXT;
ALTER TABLE daily_close ADD COLUMN IF NOT EXISTS variantid TEXT;
ALTER TABLE inventory_log ADD COLUMN IF NOT EXISTS variantid TEXT;
ALTER TABLE product_price_history ADD COLUMN IF NOT EXISTS variantid TEXT;
ALTER TABLE product_expiry ADD COLUMN IF NOT EXISTS variantid TEXT;

CREATE TABLE IF NOT EXISTS product_variants (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  userid TEXT NOT NULL,
  productid TEXT NOT NULL,
  variantname TEXT NOT NULL,
  size TEXT,
  unit TEXT NOT NULL,
  barcode TEXT,
  buyingprice DECIMAL(10,2) NOT NULL DEFAULT '0',
  sellingprice DECIMAL(10,2) NOT NULL DEFAULT '0',
  openingstock INTEGER NOT NULL DEFAULT 0,
  currentstock INTEGER NOT NULL DEFAULT 0,
  minimumstock INTEGER NOT NULL DEFAULT 5,
  activestatus BOOLEAN NOT NULL DEFAULT TRUE,
  createdat TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedat TIMESTAMP NOT NULL DEFAULT NOW()
);
