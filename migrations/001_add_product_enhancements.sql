-- Add new columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS buyingprice numeric(10,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS sellingprice numeric(10,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS minimumstock integer NOT NULL DEFAULT 5,
ADD COLUMN IF NOT EXISTS fastmoving boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS expirytracking boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;

-- Create product_price_history table
CREATE TABLE IF NOT EXISTS product_price_history (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  userid text NOT NULL,
  productid text NOT NULL,
  buyingprice numeric(10,2) NOT NULL,
  sellingprice numeric(10,2) NOT NULL,
  changedat timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdat timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create product_expiry table
CREATE TABLE IF NOT EXISTS product_expiry (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  userid text NOT NULL,
  productid text NOT NULL,
  batchnumber text NOT NULL,
  quantity integer NOT NULL,
  expirydate date NOT NULL,
  purchasedate date NOT NULL,
  createdat timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedat timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indices for better query performance
CREATE INDEX IF NOT EXISTS idx_product_price_history_userid ON product_price_history(userid);
CREATE INDEX IF NOT EXISTS idx_product_price_history_productid ON product_price_history(productid);
CREATE INDEX IF NOT EXISTS idx_product_expiry_userid ON product_expiry(userid);
CREATE INDEX IF NOT EXISTS idx_product_expiry_productid ON product_expiry(productid);
CREATE INDEX IF NOT EXISTS idx_product_expiry_expirydate ON product_expiry(expirydate);
