-- =============================================================================
-- STAGE 3: OFFERS SYSTEM SCHEMA (MULTI-TENANT & RLS)
-- Enables templates, scheduling, rules, analytics counters, and Realtime
-- =============================================================================

-- 1. OFFERS TABLE
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(120) NOT NULL,
    description TEXT,
    badge_text VARCHAR(40) DEFAULT 'Offer',
    template_type VARCHAR(32) NOT NULL DEFAULT 'percentage_off', 
    -- 'percentage_off', 'money_off', 'happy_hour', 'combo_deal', 'bogo', 'free_item', 'todays_special', 'limited_time'
    
    status VARCHAR(16) DEFAULT 'live' NOT NULL, -- 'draft', 'scheduled', 'live', 'ended'
    is_paused BOOLEAN DEFAULT false NOT NULL,
    
    -- Discount parameters
    discount_type VARCHAR(16) NOT NULL DEFAULT 'percentage', -- 'percentage', 'fixed_amount', 'free_item'
    discount_value NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    min_order_amount NUMERIC(10, 2) DEFAULT 0.00,
    free_item_id UUID REFERENCES public.items(id) ON DELETE SET NULL,
    
    -- Scope: 'all', 'categories', 'items'
    scope_type VARCHAR(20) DEFAULT 'items' NOT NULL,
    
    -- Schedule & Timezone parameters (evaluated in restaurant's local timezone)
    timezone VARCHAR(64) DEFAULT 'Africa/Addis_Ababa' NOT NULL,
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    days_of_week INT[] DEFAULT ARRAY[0,1,2,3,4,5,6]::INT[], -- 0=Sun, 1=Mon, ..., 6=Sat
    start_time TIME, -- e.g. 16:00
    end_time TIME,   -- e.g. 18:00
    honest_urgency_hours INT DEFAULT 2, -- honest urgency: show countdown only if ending within X hours
    
    -- Non-pushy presentation
    show_top_banner BOOLEAN DEFAULT false NOT NULL,
    banner_text VARCHAR(160),
    banner_link_text VARCHAR(40) DEFAULT 'See offer',
    
    -- Stacking & Precedence
    stacking_rule VARCHAR(32) DEFAULT 'best_discount' NOT NULL, -- 'best_discount', 'allow_stack', 'exclusive'
    priority INT DEFAULT 0 NOT NULL,
    
    -- Privacy-first performance metrics (aggregated counts, no personal data)
    views_count INT DEFAULT 0 NOT NULL,
    taps_count INT DEFAULT 0 NOT NULL,
    orders_count INT DEFAULT 0 NOT NULL,
    total_savings NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. OFFER RULES (Category/cart/item level rules)
CREATE TABLE IF NOT EXISTS public.offer_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE NOT NULL,
    rule_type VARCHAR(32) NOT NULL, -- 'category', 'item', 'cart_min', 'combo'
    target_id VARCHAR(64) NOT NULL, -- Category UUID or Item UUID
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. OFFER ITEMS (Junction table linking offers to applicable items)
CREATE TABLE IF NOT EXISTS public.offer_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE NOT NULL,
    item_id UUID REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(offer_id, item_id)
);

-- 4. INDEXES
CREATE INDEX IF NOT EXISTS idx_offers_restaurant_status ON public.offers(restaurant_id, status, is_paused);
CREATE INDEX IF NOT EXISTS idx_offer_rules_offer ON public.offer_rules(offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_items_item ON public.offer_items(item_id);
CREATE INDEX IF NOT EXISTS idx_offer_items_offer ON public.offer_items(offer_id);

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_items ENABLE ROW LEVEL SECURITY;

-- Diners: Read live, unpaused offers for active restaurants
CREATE POLICY "Public diners can read live offers" ON public.offers
    FOR SELECT USING (
        is_paused = false 
        AND status IN ('live', 'scheduled')
    );

CREATE POLICY "Public diners can read offer rules" ON public.offer_rules
    FOR SELECT USING (true);

CREATE POLICY "Public diners can read offer items" ON public.offer_items
    FOR SELECT USING (true);

-- Staff: View all offers for their restaurant
CREATE POLICY "Staff can view all offers for their restaurant" ON public.offers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.staff_users 
            WHERE staff_users.user_id = auth.uid() 
            AND staff_users.restaurant_id = offers.restaurant_id
        )
    );

-- Staff: Can toggle is_paused (pause/resume live offers)
CREATE POLICY "Staff can pause or resume offers" ON public.offers
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.staff_users 
            WHERE staff_users.user_id = auth.uid() 
            AND staff_users.restaurant_id = offers.restaurant_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.staff_users 
            WHERE staff_users.user_id = auth.uid() 
            AND staff_users.restaurant_id = offers.restaurant_id
        )
    );

-- Owners: Full CRUD on offers, rules, and items
CREATE POLICY "Owners have full control over offers" ON public.offers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.staff_users 
            WHERE staff_users.user_id = auth.uid() 
            AND staff_users.restaurant_id = offers.restaurant_id 
            AND staff_users.role = 'owner'
        )
    );

CREATE POLICY "Owners have full control over offer rules" ON public.offer_rules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.offers
            JOIN public.staff_users ON staff_users.restaurant_id = offers.restaurant_id
            WHERE offers.id = offer_rules.offer_id
            AND staff_users.user_id = auth.uid()
            AND staff_users.role = 'owner'
        )
    );

CREATE POLICY "Owners have full control over offer items" ON public.offer_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.offers
            JOIN public.staff_users ON staff_users.restaurant_id = offers.restaurant_id
            WHERE offers.id = offer_items.offer_id
            AND staff_users.user_id = auth.uid()
            AND staff_users.role = 'owner'
        )
    );

-- 6. REALTIME REGISTRATION
ALTER PUBLICATION supabase_realtime ADD TABLE public.offers;

-- 7. INITIAL SAMPLE OFFERS FOR ADDIS CAFETERIA
INSERT INTO public.offers (
    id,
    restaurant_id,
    title,
    description,
    badge_text,
    template_type,
    status,
    is_paused,
    discount_type,
    discount_value,
    scope_type,
    timezone,
    days_of_week,
    start_time,
    end_time,
    honest_urgency_hours,
    show_top_banner,
    banner_text,
    banner_link_text,
    views_count,
    taps_count,
    orders_count,
    total_savings
) VALUES 
(
    'f1a8c1e2-3456-4789-a012-3456789abc01',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Happy Hour: 20% Off Wood-Fired Specialties',
    'Enjoy 20% off all artisan wood-fired mains every afternoon.',
    '20% Off',
    'happy_hour',
    'live',
    false,
    'percentage',
    20.00,
    'categories',
    'Africa/Addis_Ababa',
    ARRAY[0,1,2,3,4,5,6]::INT[],
    '15:00',
    '23:59',
    2,
    true,
    '🌿 Afternoon Happy Hour: 20% off all artisan wood-fired dishes until 6 PM.',
    'See offer',
    184,
    42,
    14,
    38.50
),
(
    'f2b9d2e3-4567-4890-b123-456789abc02',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Addis Sourdough Truffle Combo',
    'Save $4.00 when enjoying our signature Truffle Burrata Flatbread.',
    'Save $4',
    'money_off',
    'live',
    false,
    'fixed_amount',
    4.00,
    'items',
    'Africa/Addis_Ababa',
    ARRAY[0,1,2,3,4,5,6]::INT[],
    NULL,
    NULL,
    0,
    false,
    NULL,
    'See offer',
    96,
    28,
    9,
    36.00
) ON CONFLICT (id) DO NOTHING;
