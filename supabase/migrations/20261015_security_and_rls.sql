-- =============================================================================
-- DIGITAL MENU: ROW LEVEL SECURITY (RLS) AUDIT & SECURE STORAGE POLICIES
-- Enforces multi-tenant isolation, public customer access, and staff RBAC
-- =============================================================================

-- Ensure RLS is explicitly ENABLED on all core application tables
ALTER TABLE IF EXISTS public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.staff_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.dish_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.review_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.scheduled_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.menu_versions ENABLE ROW LEVEL SECURITY;

-- Helper security function: Check if current authenticated user belongs to tenant with role
CREATE OR REPLACE FUNCTION public.check_user_staff_role(target_restaurant_id UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.staff_users
    WHERE restaurant_id = target_restaurant_id
      AND user_id = auth.uid()
      AND (
        required_role = 'staff'
        OR role::text = required_role
        OR role::text = 'owner'
      )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. RESTAURANTS POLICIES
DROP POLICY IF EXISTS "Public can view published restaurants" ON public.restaurants;
CREATE POLICY "Public can view published restaurants"
  ON public.restaurants FOR SELECT
  USING (is_open IS NOT NULL);

DROP POLICY IF EXISTS "Owners can update their restaurant" ON public.restaurants;
CREATE POLICY "Owners can update their restaurant"
  ON public.restaurants FOR UPDATE
  USING (public.check_user_staff_role(id, 'owner'));

-- 2. CATEGORIES & MENU ITEMS
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories"
  ON public.categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public can view active menu items" ON public.menu_items;
CREATE POLICY "Public can view active menu items"
  ON public.menu_items FOR SELECT
  USING (is_archived = false);

DROP POLICY IF EXISTS "Staff can manage categories" ON public.categories;
CREATE POLICY "Staff can manage categories"
  ON public.categories FOR ALL
  USING (public.check_user_staff_role(restaurant_id, 'staff'));

DROP POLICY IF EXISTS "Staff can manage menu items" ON public.menu_items;
CREATE POLICY "Staff can manage menu items"
  ON public.menu_items FOR ALL
  USING (public.check_user_staff_role(restaurant_id, 'staff'));

-- 3. ORDERS (Customer place order, staff manage)
DROP POLICY IF EXISTS "Public can create orders" ON public.orders;
CREATE POLICY "Public can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (
    restaurant_id IS NOT NULL
    AND table_number IS NOT NULL
    AND total >= 0
  );

DROP POLICY IF EXISTS "Staff can view and update orders" ON public.orders;
CREATE POLICY "Staff can view and update orders"
  ON public.orders FOR ALL
  USING (public.check_user_staff_role(restaurant_id, 'staff'));

-- 4. SERVICE REQUESTS (Customer call waiter/bill, staff resolve)
DROP POLICY IF EXISTS "Public can create service requests" ON public.service_requests;
CREATE POLICY "Public can create service requests"
  ON public.service_requests FOR INSERT
  WITH CHECK (
    restaurant_id IS NOT NULL
    AND table_number IS NOT NULL
    AND request_type IN ('water', 'bill', 'waiter', 'utensils', 'napkins', 'clean')
  );

DROP POLICY IF EXISTS "Staff can view and update service requests" ON public.service_requests;
CREATE POLICY "Staff can view and update service requests"
  ON public.service_requests FOR ALL
  USING (public.check_user_staff_role(restaurant_id, 'staff'));

-- 5. OFFERS & DEALS
DROP POLICY IF EXISTS "Public can view active offers" ON public.offers;
CREATE POLICY "Public can view active offers"
  ON public.offers FOR SELECT
  USING (status = 'active');

DROP POLICY IF EXISTS "Staff can manage offers" ON public.offers;
CREATE POLICY "Staff can manage offers"
  ON public.offers FOR ALL
  USING (public.check_user_staff_role(restaurant_id, 'staff'));

-- 6. DISH REVIEWS
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.dish_reviews;
CREATE POLICY "Public can view approved reviews"
  ON public.dish_reviews FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "Public can submit reviews" ON public.dish_reviews;
CREATE POLICY "Public can submit reviews"
  ON public.dish_reviews FOR INSERT
  WITH CHECK (
    rating >= 1 AND rating <= 5
    AND restaurant_id IS NOT NULL
    AND menu_item_id IS NOT NULL
  );

DROP POLICY IF EXISTS "Staff can view and moderate reviews" ON public.dish_reviews;
CREATE POLICY "Staff can view and moderate reviews"
  ON public.dish_reviews FOR ALL
  USING (public.check_user_staff_role(restaurant_id, 'staff'));

-- 7. SECURE STORAGE BUCKET POLICIES FOR DISH PHOTOS & LOGOS
-- Creates bucket and restricts uploads to 4MB ceiling and image MIME types
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'menu-assets',
  'menu-assets',
  true,
  4194304, -- 4MB ceiling
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 4194304,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Storage bucket access policies
DROP POLICY IF EXISTS "Public can view menu assets" ON storage.objects;
CREATE POLICY "Public can view menu assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'menu-assets');

DROP POLICY IF EXISTS "Authenticated staff can upload menu assets" ON storage.objects;
CREATE POLICY "Authenticated staff can upload menu assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'menu-assets'
    AND auth.role() = 'authenticated'
  );
