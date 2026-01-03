-- =============================================
-- STRIPE PAYMENTS & BILLING SCHEMA
-- Run this in Supabase SQL Editor
-- =============================================

-- Invoices table - tracks what parents owe
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'paid', 'partial', 'cancelled', 'overdue')),
  amount_due DECIMAL(10,2) NOT NULL DEFAULT 0,
  amount_paid DECIMAL(10,2) NOT NULL DEFAULT 0,
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Invoice line items - individual charges on an invoice
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  item_type TEXT NOT NULL DEFAULT 'charge' CHECK (item_type IN ('charge', 'discount', 'credit', 'fee')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payments table - tracks actual payments made
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded')),
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  stripe_customer_id TEXT,
  payment_method TEXT,
  failure_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Parent balance tracking - running balance for quick lookups
CREATE TABLE IF NOT EXISTS parent_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL UNIQUE REFERENCES parents(id) ON DELETE CASCADE,
  current_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_charged DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_paid DECIMAL(10,2) NOT NULL DEFAULT 0,
  last_payment_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transaction history - audit log of all balance changes
CREATE TABLE IF NOT EXISTS balance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('charge', 'payment', 'credit', 'refund', 'adjustment')),
  amount DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoices_parent_id ON invoices(parent_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_parent_id ON payments(parent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_parent_id ON balance_transactions(parent_id);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_created_at ON balance_transactions(created_at);

-- Auto-generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYYMM') || '-' || LPAD(NEXTVAL('invoice_number_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

CREATE TRIGGER set_invoice_number
  BEFORE INSERT ON invoices
  FOR EACH ROW
  WHEN (NEW.invoice_number IS NULL)
  EXECUTE FUNCTION generate_invoice_number();

-- Update timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER parent_balances_updated_at
  BEFORE UPDATE ON parent_balances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Function to update parent balance when invoice changes
CREATE OR REPLACE FUNCTION update_parent_balance()
RETURNS TRIGGER AS $$
DECLARE
  v_total_due DECIMAL(10,2);
  v_total_paid DECIMAL(10,2);
BEGIN
  -- Calculate totals from invoices
  SELECT 
    COALESCE(SUM(amount_due), 0),
    COALESCE(SUM(amount_paid), 0)
  INTO v_total_due, v_total_paid
  FROM invoices
  WHERE parent_id = COALESCE(NEW.parent_id, OLD.parent_id)
    AND status NOT IN ('cancelled', 'draft');

  -- Upsert parent balance
  INSERT INTO parent_balances (parent_id, current_balance, total_charged, total_paid)
  VALUES (
    COALESCE(NEW.parent_id, OLD.parent_id),
    v_total_due - v_total_paid,
    v_total_due,
    v_total_paid
  )
  ON CONFLICT (parent_id) DO UPDATE SET
    current_balance = v_total_due - v_total_paid,
    total_charged = v_total_due,
    total_paid = v_total_paid,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_parent_balance_on_invoice
  AFTER INSERT OR UPDATE OR DELETE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_parent_balance();

-- Function to update invoice status based on payments
CREATE OR REPLACE FUNCTION update_invoice_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'succeeded' AND NEW.invoice_id IS NOT NULL THEN
    -- Update invoice amount_paid
    UPDATE invoices
    SET 
      amount_paid = amount_paid + NEW.amount,
      status = CASE 
        WHEN amount_paid + NEW.amount >= amount_due THEN 'paid'
        WHEN amount_paid + NEW.amount > 0 THEN 'partial'
        ELSE status
      END,
      paid_at = CASE 
        WHEN amount_paid + NEW.amount >= amount_due THEN NOW()
        ELSE paid_at
      END
    WHERE id = NEW.invoice_id;
    
    -- Update last payment date on parent balance
    UPDATE parent_balances
    SET last_payment_at = NOW()
    WHERE parent_id = NEW.parent_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_invoice_on_payment
  AFTER INSERT OR UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_status();

-- RLS Policies
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_transactions ENABLE ROW LEVEL SECURITY;

-- Parents can view their own invoices
CREATE POLICY "Parents can view own invoices" ON invoices
  FOR SELECT USING (
    parent_id IN (SELECT id FROM parents WHERE user_id::text = auth.uid()::text)
  );

-- Parents can view their own invoice items
CREATE POLICY "Parents can view own invoice items" ON invoice_items
  FOR SELECT USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE parent_id IN (
        SELECT id FROM parents WHERE user_id::text = auth.uid()::text
      )
    )
  );

-- Parents can view their own payments
CREATE POLICY "Parents can view own payments" ON payments
  FOR SELECT USING (
    parent_id IN (SELECT id FROM parents WHERE user_id::text = auth.uid()::text)
  );

-- Parents can view their own balance
CREATE POLICY "Parents can view own balance" ON parent_balances
  FOR SELECT USING (
    parent_id IN (SELECT id FROM parents WHERE user_id::text = auth.uid()::text)
  );

-- Parents can view their own transactions
CREATE POLICY "Parents can view own transactions" ON balance_transactions
  FOR SELECT USING (
    parent_id IN (SELECT id FROM parents WHERE user_id::text = auth.uid()::text)
  );

-- Service role has full access (for API routes)
CREATE POLICY "Service role full access invoices" ON invoices
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access invoice_items" ON invoice_items
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access payments" ON payments
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access parent_balances" ON parent_balances
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access balance_transactions" ON balance_transactions
  FOR ALL USING (auth.role() = 'service_role');
