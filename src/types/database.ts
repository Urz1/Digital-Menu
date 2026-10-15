export type UserRole = 'owner' | 'manager' | 'staff';

export interface ThemeConfig {
  primaryColor: string; // e.g. '#E8590C'
  primaryHover: string; // e.g. '#D9480F'
  accentColor: string;  // e.g. '#F76707'
  fontFamily: 'serif' | 'sans' | 'display';
  borderRadius: 'sm' | 'md' | 'lg' | 'full';
  defaultMode: 'auto' | 'light' | 'dark';
  defaultLayout: 'list' | 'grid';
  cardStyle?: 'minimal' | 'elevated' | 'bordered';
  imageSize?: 'compact' | 'standard' | 'large';
  priceStyle?: 'accented' | 'bold-mono' | 'classic';
  badgeStyle?: 'subtle' | 'vibrant' | 'minimal';
}

export interface WifiConfig {
  ssid: string;
  password?: string;
}

export interface RestaurantFeatureFlags {
  orders_enabled?: boolean;
  waiter_call_enabled?: boolean;
  bill_request_enabled?: boolean;
  offers_enabled?: boolean;
  dietary_filters_enabled?: boolean;
  favorites_enabled?: boolean;
  allergens_enabled?: boolean;
  calories_enabled?: boolean;
}

export interface CustomBadge {
  id: string;
  name: string;
  color: string;
}

export interface HolidayClosure {
  date: string;
  reason: string;
}

export interface OnboardingStep {
  id: string;
  title: string;
  completed: boolean;
}

export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  short_name?: string;
  logo_letter: string;
  logo_url?: string;
  tagline: string;
  currency: string;
  currency_code: string;
  default_table: string;
  hours: string;
  address: string;
  announcement?: string;
  is_open: boolean;
  theme_config: ThemeConfig;
  wifi_config: WifiConfig;
  tax_rate: number;
  tax_mode?: 'inclusive' | 'exclusive'; // 'inclusive' = tax included in prices (default), 'exclusive' = calculated on top
  reviews_enabled?: boolean;
  feature_flags?: RestaurantFeatureFlags;
  custom_badges?: CustomBadge[];
  custom_labels?: Record<string, string>;
  holiday_closures?: HolidayClosure[];
  closed_message?: string;
  sold_out_reset_time?: 'midnight' | 'morning_6am' | 'manual';
  onboarding_completed?: boolean;
  onboarding_checklist?: OnboardingStep[];
  created_at: string;
  updated_at: string;
}

export interface StaffAccount {
  id: string;
  restaurant_id: string;
  name: string;
  username: string; // phone or staff ID
  pin_code: string; // 4-digit PIN or password
  role: 'staff';
  is_active: boolean;
  created_at?: string;
}

export interface Category {
  id: string;
  restaurant_id: string;
  name: string;
  name_am?: string;
  name_so?: string;
  name_es?: string;
  icon: string;
  description: string;
  description_am?: string;
  description_so?: string;
  description_es?: string;
  sort_order: number;
  is_active: boolean;
}

export interface ItemOption {
  id: string;
  item_id: string;
  name: string;
  name_am?: string;
  name_so?: string;
  name_es?: string;
  price: number;
  is_required: boolean;
  max_selections?: number;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  name_am?: string;
  name_so?: string;
  name_es?: string;
  description: string;
  description_am?: string;
  description_so?: string;
  description_es?: string;
  price: number;
  image_url: string;
  tags: string[]; // e.g. ['vegetarian', 'vegan', 'gluten-free', 'halal', 'spicy', 'nut-free', 'chefsPick', 'fasting']
  allergens: string[];
  spice_level: number; // 0, 1, 2, 3
  calories?: number;
  custom_badge?: string;
  is_available: boolean;
  is_chefs_pick: boolean;
  is_draft?: boolean;
  is_archived?: boolean;
  sort_order: number;
  reviews_enabled?: boolean;
  sold_out_auto_reset?: 'midnight' | 'morning_6am' | 'manual';
  options?: ItemOption[];
}

export interface ScheduledMenu {
  id: string;
  restaurant_id: string;
  name: string;
  start_time: string; // e.g. "07:00"
  end_time: string;   // e.g. "11:00"
  days_of_week: number[]; // [0..6]
  category_ids: string[];
  is_active: boolean;
}

export interface MenuVersion {
  id: string;
  restaurant_id: string;
  label: string;
  created_at: string;
  items_snapshot: MenuItem[];
}

export interface OrderItemPayload {
  item_id: string;
  name: string;
  price: number;
  quantity: number;
  selected_options: { name: string; price: number }[];
  notes?: string;
  line_total: number;
}

export interface Order {
  id: string;
  restaurant_id: string;
  table_number: string;
  items: OrderItemPayload[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'preparing' | 'served' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceRequest {
  id: string;
  restaurant_id: string;
  table_number: string;
  request_type: 'waiter' | 'water' | 'cutlery' | 'bill';
  status: 'pending' | 'acknowledged' | 'completed';
  created_at: string;
}

export interface StaffUser {
  id: string;
  restaurant_id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

// -----------------------------------------------------------------------------
// STAGE 3: OFFERS SYSTEM TYPES
// -----------------------------------------------------------------------------
export type OfferTemplateType = 
  | 'percentage_off'
  | 'money_off'
  | 'happy_hour'
  | 'combo_deal'
  | 'bogo'
  | 'free_item'
  | 'todays_special'
  | 'limited_time';

export type OfferStatus = 'draft' | 'scheduled' | 'live' | 'ended';

export type OfferDiscountType = 'percentage' | 'fixed_amount' | 'free_item';

export type OfferStackingRule = 'best_discount' | 'allow_stack' | 'exclusive';

export interface Offer {
  id: string;
  restaurant_id: string;
  title: string;
  description?: string;
  badge_text: string; // e.g. "20% Off", "Save $4", "Happy Hour"
  template_type: OfferTemplateType;
  status: OfferStatus;
  is_paused: boolean;
  discount_type: OfferDiscountType;
  discount_value: number;
  min_order_amount?: number;
  free_item_id?: string;
  scope_type: 'all' | 'categories' | 'items';
  category_ids?: string[];
  item_ids?: string[];
  timezone: string; // e.g. "Africa/Addis_Ababa"
  starts_at?: string | null;
  ends_at?: string | null;
  days_of_week?: number[]; // [0..6], 0=Sunday
  start_time?: string | null; // e.g. "15:00"
  end_time?: string | null;   // e.g. "18:00"
  honest_urgency_hours: number;
  show_top_banner: boolean;
  banner_text?: string;
  banner_link_text?: string;
  stacking_rule: OfferStackingRule;
  priority: number;
  views_count: number;
  taps_count: number;
  orders_count: number;
  total_savings: number;
  created_at: string;
  updated_at: string;
}

export interface OfferRule {
  id: string;
  offer_id: string;
  rule_type: 'category' | 'item' | 'cart_min' | 'combo';
  target_id: string;
  created_at: string;
}

export interface OfferItem {
  id: string;
  offer_id: string;
  item_id: string;
  created_at: string;
}

// -----------------------------------------------------------------------------
// STAGE 4: DISH REVIEWS SYSTEM TYPES
// -----------------------------------------------------------------------------
export type ReviewStatus = 'published' | 'flagged' | 'reported' | 'removed';

export interface DishReview {
  id: string;
  restaurant_id: string;
  item_id: string;
  rating: number; // 1-5
  tags: string[]; // e.g. ["Great portion", "Too salty", "Would order again"]
  comment?: string;
  photo_url?: string;
  session_token: string;
  table_number?: string;
  status: ReviewStatus;
  flagged_reason?: string;
  report_count: number;
  owner_reply?: string;
  owner_reply_at?: string;
  owner_reply_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewModerationLog {
  id: string;
  restaurant_id: string;
  review_id: string;
  user_role: UserRole;
  user_name: string;
  action: 'approve' | 'remove' | 'reply' | 'flag';
  reason?: string;
  created_at: string;
}

export interface RestaurantReviewSettings {
  restaurant_id: string;
  reviews_enabled: boolean;
  notification_frequency: 'instant' | 'daily_digest' | 'off';
  available_tags: string[];
  min_reviews_threshold: number; // default 3
  created_at?: string;
  updated_at?: string;
}

export interface DishReviewStats {
  item_id: string;
  average_rating: number;
  review_count: number;
  rating_breakdown: Record<number, number>; // 1: n, 2: n, ...
  top_tags: { tag: string; count: number }[];
  is_threshold_met: boolean; // review_count >= min_reviews_threshold
}

