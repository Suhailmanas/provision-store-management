-- Product is the parent only; all operational values belong to product_types.
DO $$ BEGIN
  IF to_regclass('public.product_variants') IS NOT NULL AND to_regclass('public.product_types') IS NULL THEN
    ALTER TABLE product_variants RENAME TO product_types;
  END IF;
END $$;

ALTER TABLE products ADD COLUMN IF NOT EXISTS trackexpiry BOOLEAN NOT NULL DEFAULT FALSE;
UPDATE products SET trackexpiry = COALESCE(expirytracking, FALSE) WHERE trackexpiry = FALSE;

ALTER TABLE product_types RENAME COLUMN variantname TO brandname;
ALTER TABLE product_types RENAME COLUMN size TO packsize;
ALTER TABLE product_types RENAME COLUMN buyingprice TO buyingpriceperunit;
ALTER TABLE product_types RENAME COLUMN sellingprice TO sellingpriceperunit;
ALTER TABLE product_types RENAME COLUMN activestatus TO active;
ALTER TABLE product_types ALTER COLUMN packsize SET NOT NULL;

ALTER TABLE purchases ADD COLUMN IF NOT EXISTS buyingpriceperunit DECIMAL(10,2) NOT NULL DEFAULT '0';
UPDATE purchases SET buyingpriceperunit = CASE WHEN quantity > 0 THEN cost / quantity ELSE 0 END WHERE buyingpriceperunit = 0;

ALTER TABLE products DROP COLUMN IF EXISTS unit;
ALTER TABLE products DROP COLUMN IF EXISTS buyingprice;
ALTER TABLE products DROP COLUMN IF EXISTS sellingprice;
ALTER TABLE products DROP COLUMN IF EXISTS minimumstock;
ALTER TABLE products DROP COLUMN IF EXISTS opening_stock;
ALTER TABLE products DROP COLUMN IF EXISTS current_stock;
ALTER TABLE products DROP COLUMN IF EXISTS expirytracking;
