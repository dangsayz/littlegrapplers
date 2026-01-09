-- Work Orders table for developer billing/request system
-- Allows clients to submit requests, developers to quote and respond

CREATE TABLE IF NOT EXISTS work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Request details (client submits)
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  category TEXT NOT NULL DEFAULT 'feature' CHECK (category IN ('feature', 'bugfix', 'enhancement', 'maintenance')),
  
  -- Quote details (developer sets)
  quoted_cost DECIMAL(10,2),
  quoted_hours DECIMAL(5,2),
  developer_notes TEXT,
  
  -- Status workflow
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'quoted', 'approved', 'in_progress', 'completed', 'cancelled')),
  
  -- Payment tracking
  paid BOOLEAN NOT NULL DEFAULT FALSE,
  paid_at TIMESTAMPTZ,
  stripe_payment_id TEXT,
  
  -- Audit fields
  requested_by TEXT NOT NULL, -- email of requester
  assigned_to TEXT, -- developer email
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Deliverables (set by developer on completion)
  deliverables TEXT[], -- array of what was delivered
  files_modified TEXT[], -- array of files changed
  technical_summary TEXT
);

-- Work order comments for back-and-forth discussion
CREATE TABLE IF NOT EXISTS work_order_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_requested_by ON work_orders(requested_by);
CREATE INDEX IF NOT EXISTS idx_work_orders_created_at ON work_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_work_order_comments_order_id ON work_order_comments(work_order_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_work_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER work_orders_updated_at
  BEFORE UPDATE ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_work_orders_updated_at();

-- RLS Policies
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_comments ENABLE ROW LEVEL SECURITY;

-- Work orders: readable by authorized emails only (devs and clients)
-- Since this is admin-only, we use supabaseAdmin for all operations
-- No public access needed

-- Grant usage to authenticated users (policies will restrict further)
GRANT ALL ON work_orders TO authenticated;
GRANT ALL ON work_order_comments TO authenticated;
