-- CreateIndex
CREATE INDEX "inventory_items_variant_id_idx" ON "inventory_items"("variant_id");

-- CreateIndex
CREATE INDEX "stock_movements_performed_by_idx" ON "stock_movements"("performed_by");

-- CreateIndex
CREATE INDEX "transaction_details_variant_id_idx" ON "transaction_details"("variant_id");

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE "stores" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "transaction_details" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stock_movements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_variants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "inventory_items" ENABLE ROW LEVEL SECURITY;
