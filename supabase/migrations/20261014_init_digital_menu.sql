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
    currency VARCHAR(8) DEFAULT '$',
    currency_code VARCHAR(8) DEFAULT 'USD',
    default_table VARCHAR(32) DEFAULT 'Table 1',
    hours TEXT DEFAULT 'Mon – Sun: 8:00 AM – 10:00 PM',
    address TEXT,
    announcement TEXT,
    is_open BOOLEAN DEFAULT true,
    tax_rate NUMERIC(4, 3) DEFAULT 0.080,
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
    full_name VARCHAR(120),
    role public.staff_role DEFAULT 'staff' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    name_es VARCHAR(100),
    icon VARCHAR(16) DEFAULT '🍽️',
    description TEXT,
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
    name_es VARCHAR(120),
    description TEXT,
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
    'Artisanal Roasts, Handcrafted Pastries & Modern Comfort Dining',
    '$',
    'USD',
    'Table 14',
    'Mon – Sun: 7:00 AM – 10:00 PM',
    '742 Bole Road, Culinary Arts District',
    '✨ Welcome to Addis! Fresh single-origin espresso & seasonal pastries are ready.',
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
) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
