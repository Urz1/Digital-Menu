-- =============================================================================
-- STAGE 4: DISH REVIEWS SCHEMA (MULTI-TENANT & RLS)
-- Enables honest dish ratings, quick tags, photos, moderation, and audit logs
-- =============================================================================

-- 1. ADD REVIEWS_ENABLED FLAGS
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS reviews_enabled BOOLEAN DEFAULT true;

ALTER TABLE public.items 
ADD COLUMN IF NOT EXISTS reviews_enabled BOOLEAN DEFAULT true;

-- 2. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    item_id UUID REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
    
    -- Rating & Content
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    comment TEXT,
    photo_url TEXT,
    
    -- Anti-Spam & Identification (Privacy-first: no PII required)
    session_token VARCHAR(64) NOT NULL,
    table_number VARCHAR(32),
    
    -- Moderation status: 'published', 'flagged', 'reported', 'removed'
    status VARCHAR(20) DEFAULT 'published' NOT NULL,
    flagged_reason TEXT,
    report_count INT DEFAULT 0 NOT NULL,
    
    -- Owner / Staff Public Reply
    owner_reply TEXT,
    owner_reply_at TIMESTAMPTZ,
    owner_reply_by VARCHAR(120),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. REVIEW MODERATION AUDIT LOG
CREATE TABLE IF NOT EXISTS public.review_moderation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE NOT NULL,
    user_role VARCHAR(20) NOT NULL, -- 'owner', 'staff'
    user_name VARCHAR(120) NOT NULL,
    action VARCHAR(32) NOT NULL, -- 'approve', 'remove', 'reply', 'flag'
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RESTAURANT REVIEW SETTINGS
CREATE TABLE IF NOT EXISTS public.restaurant_review_settings (
    restaurant_id UUID PRIMARY KEY REFERENCES public.restaurants(id) ON DELETE CASCADE,
    reviews_enabled BOOLEAN DEFAULT true NOT NULL,
    notification_frequency VARCHAR(20) DEFAULT 'daily_digest' NOT NULL, -- 'instant', 'daily_digest', 'off'
    available_tags TEXT[] DEFAULT ARRAY[
        'Great portion',
        'Would order again',
        'Fresh ingredients',
        'Crispy texture',
        'Perfect spice',
        'Too salty',
        'Could be hotter',
        'Needs more seasoning'
    ]::TEXT[],
    min_reviews_threshold INT DEFAULT 3 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_reviews_item_status ON public.reviews(item_id, status);
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_status ON public.reviews(restaurant_id, status);
CREATE INDEX IF NOT EXISTS idx_reviews_session_item ON public.reviews(session_token, item_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_restaurant ON public.review_moderation_logs(restaurant_id, created_at DESC);

-- 6. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_review_settings ENABLE ROW LEVEL SECURITY;

-- Anonymous diners can view published reviews
CREATE POLICY "Public can view published reviews"
    ON public.reviews FOR SELECT
    USING (status = 'published');

-- Anonymous diners can submit reviews
CREATE POLICY "Public can submit reviews"
    ON public.reviews FOR INSERT
    WITH CHECK (true);

-- Anonymous diners can report a review
CREATE POLICY "Public can report reviews"
    ON public.reviews FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Staff and owners can view all reviews for their restaurant
CREATE POLICY "Staff can view all reviews"
    ON public.reviews FOR SELECT
    TO authenticated
    USING (
        restaurant_id IN (
            SELECT restaurant_id FROM public.staff_users WHERE user_id = auth.uid()
        )
    );

-- Staff can reply and update reviews
CREATE POLICY "Staff can update reviews"
    ON public.reviews FOR UPDATE
    TO authenticated
    USING (
        restaurant_id IN (
            SELECT restaurant_id FROM public.staff_users WHERE user_id = auth.uid()
        )
    );

-- Only owners/managers can delete reviews
CREATE POLICY "Owners can delete reviews"
    ON public.reviews FOR DELETE
    TO authenticated
    USING (
        restaurant_id IN (
            SELECT restaurant_id FROM public.staff_users 
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

-- Staff and owners can view and write moderation logs
CREATE POLICY "Staff can view moderation logs"
    ON public.review_moderation_logs FOR SELECT
    TO authenticated
    USING (
        restaurant_id IN (
            SELECT restaurant_id FROM public.staff_users WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Staff can insert moderation logs"
    ON public.review_moderation_logs FOR INSERT
    TO authenticated
    WITH CHECK (
        restaurant_id IN (
            SELECT restaurant_id FROM public.staff_users WHERE user_id = auth.uid()
        )
    );

-- Review Settings RLS
CREATE POLICY "Public can view review settings"
    ON public.restaurant_review_settings FOR SELECT
    USING (true);

CREATE POLICY "Staff can manage review settings"
    ON public.restaurant_review_settings FOR ALL
    TO authenticated
    USING (
        restaurant_id IN (
            SELECT restaurant_id FROM public.staff_users WHERE user_id = auth.uid()
        )
    );

-- Realtime publication for reviews
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
