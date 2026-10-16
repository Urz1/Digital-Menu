-- =============================================================================
-- DIGITAL MENU: MULTI-TENANT POSTGRESQL SCHEMA WITH ROW LEVEL SECURITY (RLS)
-- Supports Supabase Auth (Owner & Staff roles) + Supabase Realtime
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. RESTAURANTS (Multi-tenant master table)
CREATE TABLE IF NOT EXISTS public.restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(120) NOT NULL,
    short_name VARCHAR(60),
    logo_letter VARCHAR(4) DEFAULT 'A',
    logo_url TEXT,
    tagline TEXT,
    currency VARCHAR(8) DEFAULT 'ETB',
    currency_code VARCHAR(8) DEFAULT 'ETB',
    default_table VARCHAR(32) DEFAULT 'Table 1',
    hours TEXT DEFAULT 'Mon – Sun: 8:00 AM – 10:00 PM',
    address TEXT,
    announcement TEXT,
    is_open BOOLEAN DEFAULT true,
    tax_rate NUMERIC(4, 3) DEFAULT 0.080,
    tax_mode VARCHAR(16) DEFAULT 'inclusive',
    theme_config JSONB DEFAULT '{
      "primaryColor": "#E8590C",
      "primaryHover": "#D9480F",
      "accentColor": "#F76707",
      "fontFamily": "serif",
      "borderRadius": "md",
      "defaultMode": "auto",
      "defaultLayout": "list"
    }'::jsonb,
    wifi_config JSONB DEFAULT '{
      "ssid": "Guest-WiFi",
      "password": "guestpassword"
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. STAFF USERS & ROLES
CREATE TYPE public.staff_role AS ENUM ('owner', 'staff');

CREATE TABLE IF NOT EXISTS public.staff_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    username VARCHAR(64),
    pin VARCHAR(8),
    full_name VARCHAR(120),
    role public.staff_role DEFAULT 'staff' NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    name_am VARCHAR(100),
    name_so VARCHAR(100),
    name_es VARCHAR(100),
    icon VARCHAR(16) DEFAULT '🍽️',
    description TEXT,
    description_am TEXT,
    description_so TEXT,
    description_es TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MENU ITEMS
CREATE TABLE IF NOT EXISTS public.items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(120) NOT NULL,
    name_am VARCHAR(120),
    name_so VARCHAR(120),
    name_es VARCHAR(120),
    description TEXT,
    description_am TEXT,
    description_so TEXT,
    description_es TEXT,
    price NUMERIC(10, 2) NOT NULL,
    image_url TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    allergens TEXT[] DEFAULT ARRAY[]::TEXT[],
    spice_level SMALLINT DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    is_chefs_pick BOOLEAN DEFAULT false,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ITEM OPTIONS & CUSTOMIZATIONS
CREATE TABLE IF NOT EXISTS public.item_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    name_es VARCHAR(100),
    price NUMERIC(10, 2) DEFAULT 0.00,
    is_required BOOLEAN DEFAULT false,
    max_selections INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    table_number VARCHAR(32) NOT NULL,
    items JSONB NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    tax NUMERIC(10, 2) NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    status VARCHAR(24) DEFAULT 'pending' NOT NULL, -- pending, preparing, served, cancelled
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SERVICE REQUESTS (Call waiter, water, bill)
CREATE TABLE IF NOT EXISTS public.service_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    table_number VARCHAR(32) NOT NULL,
    request_type VARCHAR(24) NOT NULL, -- waiter, water, cutlery, bill
    status VARCHAR(24) DEFAULT 'pending' NOT NULL, -- pending, acknowledged, completed
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. INDEXES FOR HIGH-THROUGHPUT PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON public.restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_categories_restaurant ON public.categories(restaurant_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_items_restaurant ON public.items(restaurant_id, is_available);
CREATE INDEX IF NOT EXISTS idx_items_category ON public.items(category_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_status ON public.orders(restaurant_id, status);
CREATE INDEX IF NOT EXISTS idx_requests_restaurant_status ON public.service_requests(restaurant_id, status);

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;

-- Public customer reads: Active restaurants, categories, items, and item_options
CREATE POLICY "Public diners can read restaurants" ON public.restaurants
    FOR SELECT USING (is_open = true);

CREATE POLICY "Public diners can read active categories" ON public.categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public diners can read items" ON public.items
    FOR SELECT USING (true);

CREATE POLICY "Public diners can read item options" ON public.item_options
    FOR SELECT USING (true);

-- Public customer writes: Can place an order and request assistance
CREATE POLICY "Public diners can submit orders" ON public.orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public diners can submit service requests" ON public.service_requests
    FOR INSERT WITH CHECK (true);

-- Staff & Owner Management: Check membership via staff_users table
CREATE POLICY "Staff can view orders for their restaurant" ON public.orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.staff_users 
            WHERE staff_users.user_id = auth.uid() 
            AND staff_users.restaurant_id = orders.restaurant_id
        )
    );

CREATE POLICY "Staff can update order status" ON public.orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.staff_users 
            WHERE staff_users.user_id = auth.uid() 
            AND staff_users.restaurant_id = orders.restaurant_id
        )
    );

CREATE POLICY "Staff can view service requests" ON public.service_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.staff_users 
            WHERE staff_users.user_id = auth.uid() 
            AND staff_users.restaurant_id = service_requests.restaurant_id
        )
    );

CREATE POLICY "Staff can update service requests" ON public.service_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.staff_users 
            WHERE staff_users.user_id = auth.uid() 
            AND staff_users.restaurant_id = service_requests.restaurant_id
        )
    );

CREATE POLICY "Owners have full CRUD over their restaurant items" ON public.items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.staff_users 
            WHERE staff_users.user_id = auth.uid() 
            AND staff_users.restaurant_id = items.restaurant_id 
            AND staff_users.role = 'owner'
        )
    );

-- 10. REALTIME CONFIGURATION (Stream item updates, orders, and requests)
ALTER PUBLICATION supabase_realtime ADD TABLE public.items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_requests;

-- 11. PRODUCTION SEED DATA FOR "ADDIS CAFETERIA"
INSERT INTO public.restaurants (
    id, slug, name, short_name, logo_letter, tagline, currency, currency_code, default_table, hours, address, announcement, theme_config, wifi_config
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'addis',
    'Addis Cafeteria',
    'Addis',
    'A',
    'Authentic Ethiopian Cuisine, Wood-Fired Mendi & Artisanal Bakery',
    'ETB',
    'ETB',
    'Table 14',
    'Mon – Sun: 6:30 AM – 11:00 PM',
    'Bole Medhanealem, Addis Ababa, Ethiopia',
    '✨ Welcome to Addis Cafeteria & Bakery! Fresh injera, sizzling tibs, and artisanal pastries daily.',
    '{
      "primaryColor": "#E8590C",
      "primaryHover": "#D9480F",
      "accentColor": "#F76707",
      "fontFamily": "serif",
      "borderRadius": "md",
      "defaultMode": "auto",
      "defaultLayout": "list"
    }'::jsonb,
    '{
      "ssid": "Addis-Guest",
      "password": "tastethevibes"
    }'::jsonb
) ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name,
    currency = EXCLUDED.currency,
    currency_code = EXCLUDED.currency_code,
    tagline = EXCLUDED.tagline,
    hours = EXCLUDED.hours,
    address = EXCLUDED.address,
    announcement = EXCLUDED.announcement;

-- 12. OFFERS & HAPPY HOUR DISCOUNTS TABLE
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    badge_text TEXT NOT NULL,
    badge_color TEXT DEFAULT '#E8590C',
    description TEXT NOT NULL,
    offer_type TEXT NOT NULL DEFAULT 'item_discount', -- 'item_discount', 'order_threshold', 'category_discount', 'bogo'
    discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage', 'fixed_amount'
    discount_value NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    threshold_amount NUMERIC(10, 2),
    target_item_ids JSONB DEFAULT '[]'::jsonb,
    target_category_ids JSONB DEFAULT '[]'::jsonb,
    reward_item_id TEXT,
    start_time TEXT,
    end_time TEXT,
    days_of_week JSONB DEFAULT '[0,1,2,3,4,5,6]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    priority INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_offers_restaurant ON public.offers(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_offers_active ON public.offers(is_active);

-- 13. DISH REVIEWS & DINER FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    tags JSONB DEFAULT '[]'::jsonb,
    comment TEXT,
    photo_url TEXT,
    session_token TEXT NOT NULL,
    table_number TEXT,
    status TEXT NOT NULL DEFAULT 'published', -- 'published', 'reported', 'flagged', 'removed'
    report_count INTEGER NOT NULL DEFAULT 0,
    flagged_reason TEXT,
    owner_reply TEXT,
    owner_reply_at TIMESTAMPTZ,
    owner_reply_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_reviews_restaurant ON public.reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_item ON public.reviews(item_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON public.reviews(created_at DESC);

-- Enable RLS
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- OFFERS POLICIES
CREATE POLICY "Public can view active offers" ON public.offers
    FOR SELECT USING (is_active = true);

CREATE POLICY "Owners have full CRUD over offers" ON public.offers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.staff_users 
            WHERE staff_users.user_id = auth.uid() 
            AND staff_users.restaurant_id = offers.restaurant_id 
            AND staff_users.role = 'owner'
        )
    );

CREATE POLICY "Staff can view all offers" ON public.offers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.staff_users 
            WHERE staff_users.user_id = auth.uid() 
            AND staff_users.restaurant_id = offers.restaurant_id
        )
    );

-- REVIEWS POLICIES
CREATE POLICY "Public can view published reviews" ON public.reviews
    FOR SELECT USING (status = 'published');

CREATE POLICY "Public diners can submit reviews" ON public.reviews
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff and owners can view all reviews" ON public.reviews
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.staff_users 
            WHERE staff_users.user_id = auth.uid() 
            AND staff_users.restaurant_id = reviews.restaurant_id
        )
    );

CREATE POLICY "Staff and owners can reply to reviews" ON public.reviews
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.staff_users 
            WHERE staff_users.user_id = auth.uid() 
            AND staff_users.restaurant_id = reviews.restaurant_id
        )
    );

-- REALTIME STREAMING FOR OFFERS AND REVIEWS
ALTER PUBLICATION supabase_realtime ADD TABLE public.offers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;

-- SEED PRODUCTION OFFERS FOR ADDIS CAFETERIA (Strictly in ETB)
INSERT INTO public.offers (
    restaurant_id, title, badge_text, badge_color, description, offer_type, discount_type, discount_value, threshold_amount, is_active, priority
) VALUES 
(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Afternoon Happy Hour: 20% off all artisan wood-fired pizzas',
    '20% Off',
    '#E8590C',
    'Enjoy 20% off all wood-fired sourdough pizzas baked in our custom clay oven.',
    'category_discount',
    'percentage',
    20.00,
    NULL,
    true,
    10
),
(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Addis Sourdough Truffle Burrata Combo (40 ETB Off)',
    '40 ETB Off',
    '#D9480F',
    'Fresh hearth burrata with sourdough bread and spiced Ethiopian honey butter at a special discount.',
    'item_discount',
    'fixed_amount',
    40.00,
    NULL,
    true,
    5
),
(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Complimentary Ethiopian Single-Origin Espresso on orders over 500 ETB',
    'Free Espresso',
    '#2B8A3E',
    'Spend 500 ETB or more to receive a complimentary ceremonial Ethiopian roast espresso.',
    'order_threshold',
    'fixed_amount',
    0.00,
    500.00,
    true,
    1
);

