-- =============================================================================
-- DIGITAL MENU: SECURITY HARDENING MIGRATION (2026-10-18)
-- Fixes VULN-02 (Permissive Review UPDATE policy), enforces strict staff RBAC,
-- and provisions secure stored procedure for anonymous review reporting.
-- =============================================================================

-- 1. DROP INSECURE PERMISSIVE PUBLIC UPDATE POLICY ON REVIEWS
DROP POLICY IF EXISTS "Public can report reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public can report reviews" ON public.dish_reviews;

-- 2. RESTRICT REVIEW UPDATES TO AUTHENTICATED STAFF ONLY
DROP POLICY IF EXISTS "Staff can update reviews" ON public.reviews;
CREATE POLICY "Staff can update reviews"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_users
      WHERE staff_users.user_id = auth.uid()
        AND staff_users.restaurant_id = reviews.restaurant_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff_users
      WHERE staff_users.user_id = auth.uid()
        AND staff_users.restaurant_id = reviews.restaurant_id
    )
  );

-- 3. PROVISION SECURE STORED PROCEDURE FOR CUSTOMER REVIEW REPORTING
-- Replaces raw table UPDATE access with a tightly scoped, audited RPC function
CREATE OR REPLACE FUNCTION public.report_dish_review(
  p_review_id UUID,
  p_reason TEXT DEFAULT 'Reported by diner'
)
RETURNS JSONB AS $$
DECLARE
  v_new_report_count INT;
  v_new_status VARCHAR(20);
BEGIN
  -- Increment report count and auto-flag if threshold reached
  UPDATE public.reviews
  SET 
    report_count = report_count + 1,
    status = CASE WHEN (report_count + 1) >= 3 THEN 'reported' ELSE status END,
    flagged_reason = COALESCE(flagged_reason, p_reason),
    updated_at = NOW()
  WHERE id = p_review_id
  RETURNING report_count, status INTO v_new_report_count, v_new_status;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Review not found');
  END IF;

  RETURN jsonb_build_object(
    'success', true, 
    'report_count', v_new_report_count,
    'status', v_new_status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permissions to anon and authenticated callers
GRANT EXECUTE ON FUNCTION public.report_dish_review(UUID, TEXT) TO anon, authenticated;

-- 4. ORDER INTEGRITY CHECKS (Defend against negative totals and malformed orders)
DROP POLICY IF EXISTS "Public diners can submit orders" ON public.orders;
CREATE POLICY "Public diners can submit orders" ON public.orders
  FOR INSERT WITH CHECK (
    restaurant_id IS NOT NULL 
    AND table_number IS NOT NULL 
    AND total >= 0 
    AND subtotal >= 0 
    AND tax >= 0
  );
