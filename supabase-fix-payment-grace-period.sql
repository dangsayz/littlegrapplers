-- Fix Payment Grace Period Migration
-- 1. Remove duplicate rows in platform_status (keep the one with payment_due_date set)
-- 2. Update check_payment_status() to disable immediately on due date (no grace period)

-- Step 1: Clean up duplicate rows - keep only the row with a payment_due_date
DELETE FROM platform_status 
WHERE id NOT IN (
  SELECT id FROM platform_status 
  WHERE payment_due_date IS NOT NULL 
  ORDER BY created_at ASC 
  LIMIT 1
);

-- If no row has payment_due_date, keep the oldest one
DELETE FROM platform_status 
WHERE id NOT IN (
  SELECT id FROM platform_status 
  ORDER BY created_at ASC 
  LIMIT 1
)
AND NOT EXISTS (
  SELECT 1 FROM platform_status WHERE payment_due_date IS NOT NULL
);

-- Step 2: Update the due date to February 1st, 2026 (today's billing cycle)
UPDATE platform_status 
SET 
  payment_due_date = '2026-02-01',
  payment_overdue_days = GREATEST(0, CURRENT_DATE - '2026-02-01'::date),
  updated_at = NOW();

-- Step 3: Replace the check_payment_status function with NO GRACE PERIOD
CREATE OR REPLACE FUNCTION check_payment_status() RETURNS JSONB AS $$
DECLARE
  v_payment_due_date DATE;
  v_payment_received_at TIMESTAMPTZ;
  v_is_enabled BOOLEAN;
  v_overdue_days INTEGER;
  v_result JSONB;
BEGIN
  SELECT payment_due_date, payment_received_at, is_enabled
  INTO v_payment_due_date, v_payment_received_at, v_is_enabled
  FROM platform_status LIMIT 1;
  
  -- If no due date set, platform is fine
  IF v_payment_due_date IS NULL THEN
    RETURN jsonb_build_object('status', 'ok', 'message', 'No payment due date set');
  END IF;
  
  -- If payment received on or after due date, platform is fine
  IF v_payment_received_at IS NOT NULL AND v_payment_received_at::date >= v_payment_due_date THEN
    RETURN jsonb_build_object('status', 'ok', 'message', 'Payment received');
  END IF;
  
  -- Calculate overdue days
  v_overdue_days := CURRENT_DATE - v_payment_due_date;
  
  -- Update overdue days
  UPDATE platform_status SET 
    payment_overdue_days = GREATEST(0, v_overdue_days),
    last_checked_at = NOW();
  
  -- NO GRACE PERIOD: If due date has passed (overdue >= 0 means today or later) and still enabled, auto-disable
  IF v_overdue_days >= 0 AND v_is_enabled THEN
    PERFORM update_platform_status(
      false,
      CASE 
        WHEN v_overdue_days = 0 THEN 'Automatically disabled - payment due today'
        ELSE 'Automatically disabled due to payment overdue by ' || v_overdue_days || ' days'
      END,
      'system',
      true
    );
    
    RETURN jsonb_build_object(
      'status', 'auto_disabled',
      'overdue_days', v_overdue_days,
      'message', 'Platform auto-disabled due to payment overdue'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'status', CASE WHEN v_overdue_days > 0 THEN 'overdue' ELSE 'ok' END,
    'overdue_days', GREATEST(0, v_overdue_days)
  );
END;
$$ LANGUAGE plpgsql;

-- Step 4: Run the check immediately to disable if overdue
SELECT check_payment_status();

-- Verification
SELECT 
  id,
  is_enabled,
  payment_due_date,
  payment_overdue_days,
  auto_disabled,
  disabled_reason
FROM platform_status;
