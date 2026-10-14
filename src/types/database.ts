export type UserRole = 'owner' | 'staff';

export interface ThemeConfig {
  primaryColor: string; // e.g. '#E8590C'
  primaryHover: string; // e.g. '#D9480F'
  accentColor: string;  // e.g. '#F76707'
  fontFamily: 'serif' | 'sans' | 'display';
  borderRadius: 'sm' | 'md' | 'lg' | 'full';
  defaultMode: 'auto' | 'light' | 'dark';
  defaultLayout: 'list' | 'grid';
}

export interface WifiConfig {
  ssid: string;
  password?: string;
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
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  restaurant_id: string;
  name: string;
  name_es?: string;
  icon: string;
  description: string;
  description_es?: string;
  sort_order: number;
  is_active: boolean;
}

export interface ItemOption {
  id: string;
  item_id: string;
  name: string;
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
  name_es?: string;
  description: string;
  description_es?: string;
  price: number;
  image_url: string;
  tags: string[]; // e.g. ['vegetarian', 'vegan', 'gluten-free', 'halal', 'spicy', 'nut-free', 'chefsPick']
  allergens: string[];
  spice_level: number; // 0, 1, 2, 3
  is_available: boolean;
  is_chefs_pick: boolean;
  sort_order: number;
  options?: ItemOption[];
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
