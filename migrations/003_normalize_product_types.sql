-- Parent products hold descriptive data only. Legacy price/stock columns are
-- retained for existing installations but are no longer used by the app.
ALTER TABLE products ADD COLUMN IF NOT EXISTS supplierid TEXT;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS expirydate DATE;
CREATE INDEX IF NOT EXISTS idx_product_variants_productid ON product_variants(productid);
CREATE INDEX IF NOT EXISTS idx_product_variants_userid ON product_variants(userid);
