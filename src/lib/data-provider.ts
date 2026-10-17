import {
  Restaurant,
  Category,
  MenuItem,
  Order,
  ServiceRequest,
  Offer,
  DishReview,
  ReviewModerationLog,
  RestaurantReviewSettings,
  UserRole,
  ScheduledMenu,
  MenuVersion,
} from '@/types/database';
import { CreateOrderInput, ServiceRequestInput } from './validators';
import { createClient } from './supabase/client';
import { checkReviewContent, validateBotCheck, checkReviewRateLimit, canRemoveReview } from './review-engine';
import { broadcastSync } from './sync-channel';

// -----------------------------------------------------------------------------
// DEFAULT PRODUCTION SEED / FALLBACK DATA FOR "ADDIS" & MULTI-TENANT
// -----------------------------------------------------------------------------
export const MOCK_RESTAURANT_ADDIS: Restaurant = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  slug: 'addis',
  name: 'Addis Cafeteria',
  short_name: 'Addis',
  logo_letter: 'A',
  logo_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=180&h=180&q=80',
  tagline: 'Authentic Ethiopian Cuisine, Wood-Fired Mendi & Artisanal Bakery',
  currency: 'ETB',
  currency_code: 'ETB',
  default_table: 'Table 1',
  hours: 'Mon – Sun: 6:30 AM – 11:00 PM',
  branch_name: 'Main Branch — Addis Cafe & Bakery',
  address: 'XQHC+MJP Addis Cafe and Bakery, Addis Ababa, Ethiopia',
  google_maps_url: 'https://maps.app.goo.gl/R8WN2zwM9dwVXT3h9?g_st=ac',
  announcement: 'Welcome to Addis Cafeteria & Bakery • Fresh injera, sizzling tibs, and artisanal pastries daily.',
  is_open: true,
  tax_rate: 0.15,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  theme_config: {
    primaryColor: '#E8590C',
    primaryHover: '#D9480F',
    accentColor: '#F76707',
    fontFamily: 'serif',
    borderRadius: 'md',
    defaultMode: 'light',
    defaultLayout: 'grid',
    cardStyle: 'elevated',
    imageSize: 'standard',
    priceStyle: 'accented',
    badgeStyle: 'vibrant',
  },
  wifi_config: {
    ssid: 'Addis-Guest',
    password: 'tastethevibes',
  },
  reviews_enabled: true,
  feature_flags: {
    orders_enabled: true,
    waiter_call_enabled: true,
    bill_request_enabled: true,
    offers_enabled: true,
    dietary_filters_enabled: true,
    favorites_enabled: true,
    allergens_enabled: true,
    calories_enabled: true,
  },
  custom_badges: [
    { id: 'b1', name: 'House Special', color: '#E8590C' },
    { id: 'b2', name: 'Family Recipe', color: '#10B981' },
    { id: 'b3', name: 'Award Winner', color: '#8B5CF6' },
  ],
  custom_labels: {
    callWaiter: 'Call Waiter',
    requestBill: 'Request Bill',
    placeOrder: 'Send to Kitchen',
    soldOut: 'Sold out today',
  },
  holiday_closures: [
    { date: '2026-12-25', reason: 'Christmas Day' },
    { date: '2027-01-01', reason: 'New Year Day' },
  ],
  closed_message: "We're currently resting! Our kitchen re-opens tomorrow at 6:30 AM.",
  sold_out_reset_time: 'morning_6am',
  onboarding_completed: false,
  onboarding_checklist: [
    { id: 'step-brand', title: 'Brand & Logo setup', completed: true },
    { id: 'step-hours', title: 'Operating hours configured', completed: true },
    { id: 'step-dishes', title: 'Add signature dishes', completed: true },
    { id: 'step-qr', title: 'Download & print table QR codes', completed: false },
    { id: 'step-offers', title: 'Create your first promotional offer', completed: false },
  ],
};

export const MOCK_CATEGORIES_ADDIS: Category[] = [
  {
    "id": "cat-soft-cake",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Soft Cake",
    "name_am": "ለስላሳ ኬክ",
    "icon": "🍰",
    "description": "Freshly baked artisanal cakes, pastries, tortas, and sweet confections.",
    "sort_order": 1,
    "is_active": true
  },
  {
    "id": "cat-bread",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Bread",
    "name_am": "ዳቦ",
    "icon": "🥖",
    "description": "Oven-fresh artisanal breads, baguettes, and traditional bakery loaves.",
    "sort_order": 2,
    "is_active": true
  },
  {
    "id": "cat-breakfast",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Berak Fast",
    "name_am": "ቁርስ",
    "icon": "🍳",
    "description": "Traditional morning platters, fetira, ful, and hearty breakfast combos.",
    "sort_order": 3,
    "is_active": true
  },
  {
    "id": "cat-burgers",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Burgers",
    "name_am": "በርገር",
    "icon": "🍔",
    "description": "Juicy handcrafted patties, melted cheese, and toasted brioche buns.",
    "sort_order": 4,
    "is_active": true
  },
  {
    "id": "cat-pizzas",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Pizzas",
    "name_am": "ፒዛ",
    "icon": "🍕",
    "description": "Wood-fired sourdough crust baked with mozzarella and fresh toppings.",
    "sort_order": 5,
    "is_active": true
  },
  {
    "id": "cat-snack-menu",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Snack Menu",
    "name_am": "ስናክ",
    "icon": "🍟",
    "description": "Crispy fries, golden spring rolls, wings, and chicken tenders.",
    "sort_order": 6,
    "is_active": true
  },
  {
    "id": "cat-hot-beverage",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Hot Beverage (Addis Cafe)",
    "name_am": "ትኩስ መጠጦች",
    "icon": "☕",
    "description": "Single-origin Ethiopian coffee, rich macchiato, and aromatic teas.",
    "sort_order": 7,
    "is_active": true
  },
  {
    "id": "cat-juice",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Juice",
    "name_am": "ጭማቂ",
    "icon": "🥤",
    "description": "100% freshly pressed tropical fruits, creamy avocados, and thick shakes.",
    "sort_order": 8,
    "is_active": true
  },
  {
    "id": "cat-cold-drinks",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Cold Drinks",
    "name_am": "ቀዝቃዛ መጠጦች",
    "icon": "🧊",
    "description": "Chilled coffees, refreshing mojitos, natural mineral water, and sodas.",
    "sort_order": 9,
    "is_active": true
  },
  {
    "id": "cat-lunch-dinner",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Lunch and Dinner",
    "name_am": "ምሳ እና እራት",
    "icon": "🥘",
    "description": "Sizzling lamb and beef tibs, slow-simmered wots, aromatic rice, and pasta.",
    "sort_order": 10,
    "is_active": true
  },
  {
    "id": "cat-mendi",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Mendi",
    "name_am": "መንዲ",
    "icon": "🍖",
    "description": "Slow-cooked fragrant spiced rice served with tender roasted meats.",
    "sort_order": 11,
    "is_active": true
  },
  {
    "id": "cat-half-half",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Half Half",
    "name_am": "ግማሽ በግማሽ",
    "icon": "🍲",
    "description": "Two hearty signature dishes combined side-by-side on fresh injera.",
    "sort_order": 12,
    "is_active": true
  },
  {
    "id": "cat-wraps",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Wraps",
    "name_am": "ሻዋርማ እና ሳንድዊች",
    "icon": "🌯",
    "description": "Warm pita wraps and toasted sandwiches loaded with fillings and sauce.",
    "sort_order": 13,
    "is_active": true
  },
  {
    "id": "cat-fasting-lunch",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Fasting Lunch",
    "name_am": "የፆም ምግብ",
    "icon": "🥬",
    "description": "100% plant-based Ethiopian vegan specialties, Beyaynetu, and fresh salads.",
    "sort_order": 14,
    "is_active": true
  },
  {
    "id": "cat-takeaway-extras",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Takeaway & Extras",
    "name_am": "ተጨማሪዎች",
    "icon": "📦",
    "description": "Packaging, takeaway boxes, and extra gourmet toppings.",
    "sort_order": 15,
    "is_active": true
  }
];

export const MOCK_ITEMS_ADDIS: MenuItem[] = [
  {
    "id": "item-cream-cake-1",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-soft-cake",
    "name": "cream cake",
    "price": 200,
    "description": "cream cake prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/artisanal-pastry.jpg",
    "tags": [
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 1
  },
  {
    "id": "item-black-forest-2",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-soft-cake",
    "name": "Black Forest",
    "price": 230,
    "description": "Black Forest prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/artisanal-pastry.jpg",
    "tags": [
      "popular",
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": true,
    "sort_order": 2
  },
  {
    "id": "item-black-white-forest-3",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-soft-cake",
    "name": "Black&White Forest",
    "price": 230,
    "description": "Black&White Forest prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/artisanal-pastry.jpg",
    "tags": [
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 3
  },
  {
    "id": "item-strawberry-cake-4",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-soft-cake",
    "name": "strawberry cake",
    "price": 230,
    "description": "strawberry cake prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/artisanal-pastry.jpg",
    "tags": [
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 4
  },
  {
    "id": "item-opera-cake-5",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-soft-cake",
    "name": "Opera cake",
    "price": 250,
    "description": "Opera cake prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/artisanal-pastry.jpg",
    "tags": [
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 5
  },
  {
    "id": "item-torta-cake-6",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-soft-cake",
    "name": "Torta cake",
    "price": 1500,
    "description": "Torta cake prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/artisanal-pastry.jpg",
    "tags": [
      "popular",
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 6
  },
  {
    "id": "item-cup-cake-7",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-soft-cake",
    "name": "Cup cake",
    "price": 150,
    "description": "Cup cake prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/artisanal-pastry.jpg",
    "tags": [
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 7
  },
  {
    "id": "item-english-cake-8",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-soft-cake",
    "name": "English Cake",
    "price": 1050,
    "description": "English Cake prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/artisanal-pastry.jpg",
    "tags": [
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 8
  },
  {
    "id": "item-basbousa-9",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-soft-cake",
    "name": "Basbousa",
    "price": 100,
    "description": "Basbousa prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/artisanal-pastry.jpg",
    "tags": [
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 9
  },
  {
    "id": "item-orange-basbousa-10",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-soft-cake",
    "name": "Orange Basbousa",
    "price": 190,
    "description": "Orange Basbousa prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/artisanal-pastry.jpg",
    "tags": [
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 10
  },
  {
    "id": "item-croissant-plain-11",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-soft-cake",
    "name": "Croissant Plain",
    "price": 150,
    "description": "Croissant Plain prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/artisanal-pastry.jpg",
    "tags": [
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 11
  },
  {
    "id": "item-white-plain-12",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-soft-cake",
    "name": "White Plain",
    "price": 150,
    "description": "White Plain prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 12
  },
  {
    "id": "item-orange-fasting-13",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-soft-cake",
    "name": "Orange Fasting",
    "price": 150,
    "description": "Orange Fasting prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/fasting-beyaynetu.jpg",
    "tags": [
      "vegan",
      "fasting"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 13
  },
  {
    "id": "item-orange-cake-14",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-soft-cake",
    "name": "Orange cake",
    "price": 150,
    "description": "Orange cake prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/artisanal-pastry.jpg",
    "tags": [
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 14
  },
  {
    "id": "item-venus-plain-big-15",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-soft-cake",
    "name": "Venus plain BIG",
    "price": 150,
    "description": "Venus plain BIG prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 15
  },
  {
    "id": "item-venus-plane-short-16",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-soft-cake",
    "name": "Venus plane SHORT",
    "price": 100,
    "description": "Venus plane SHORT prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 16
  },
  {
    "id": "item-beckewhe-17",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-soft-cake",
    "name": "Beckewhe",
    "price": 80,
    "description": "Beckewhe prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/artisanal-pastry.jpg",
    "tags": [
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 17
  },
  {
    "id": "item-cookise-18",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-soft-cake",
    "name": "COOKISE",
    "price": 800,
    "description": "COOKISE prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/artisanal-pastry.jpg",
    "tags": [
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 18
  },
  {
    "id": "item-calvine-bread-19",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-bread",
    "name": "CALVINE BREAD",
    "price": 50,
    "description": "CALVINE BREAD prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/artisanal-pastry.jpg",
    "tags": [
      "vegan"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 19
  },
  {
    "id": "item-otes-bread-20",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-bread",
    "name": "OTES BREAD",
    "price": 50,
    "description": "OTES BREAD prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/artisanal-pastry.jpg",
    "tags": [
      "vegan"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 20
  },
  {
    "id": "item-fewast-bread-21",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-bread",
    "name": "FEWAST BREAD",
    "price": 50,
    "description": "FEWAST BREAD prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/artisanal-pastry.jpg",
    "tags": [
      "vegan"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 21
  },
  {
    "id": "item-ragest-brade-22",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-bread",
    "name": "RAGEST BRADE",
    "price": 50,
    "description": "RAGEST BRADE prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "vegan"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 22
  },
  {
    "id": "item-aja-bread-23",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-bread",
    "name": "AJA BREAD",
    "price": 20,
    "description": "AJA BREAD prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/artisanal-pastry.jpg",
    "tags": [
      "vegan"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 23
  },
  {
    "id": "item-aja-ragkeste-24",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-bread",
    "name": "AJA RAGKESTE",
    "price": 10,
    "description": "AJA RAGKESTE prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "vegan"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 24
  },
  {
    "id": "item-gebis-bread-25",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-bread",
    "name": "GEBIS BREAD",
    "price": 15,
    "description": "GEBIS BREAD prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/artisanal-pastry.jpg",
    "tags": [
      "vegan"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 25
  },
  {
    "id": "item-gebis-baget-26",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-bread",
    "name": "GEBIS BAGET",
    "price": 15,
    "description": "GEBIS BAGET prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/artisanal-pastry.jpg",
    "tags": [
      "vegan"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 26
  },
  {
    "id": "item-gebis-mini-27",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-bread",
    "name": "GEBIS MINI",
    "price": 15,
    "description": "GEBIS MINI prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "vegan"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 27
  },
  {
    "id": "item-min-bread-rog-28",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-bread",
    "name": "MIN BREAD ROG",
    "price": 10,
    "description": "MIN BREAD ROG prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/artisanal-pastry.jpg",
    "tags": [
      "vegan"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 28
  },
  {
    "id": "item-normal-bread-180g-29",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-bread",
    "name": "NORMAL BREAD 180G",
    "price": 50,
    "description": "NORMAL BREAD 180G prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/artisanal-pastry.jpg",
    "tags": [
      "vegan"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 29
  },
  {
    "id": "item-normal-bread-110g-30",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-bread",
    "name": "NORMAL BREAD 110G",
    "price": 20,
    "description": "NORMAL BREAD 110G prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/artisanal-pastry.jpg",
    "tags": [
      "vegan"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 30
  },
  {
    "id": "item-care-bread-31",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-bread",
    "name": "CARE BREAD",
    "price": 100,
    "description": "CARE BREAD prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/artisanal-pastry.jpg",
    "tags": [
      "vegan"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 31
  },
  {
    "id": "item-crizil-bread-32",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-bread",
    "name": "CRIZIL BREAD",
    "price": 50,
    "description": "CRIZIL BREAD prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/artisanal-pastry.jpg",
    "tags": [
      "vegan"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 32
  },
  {
    "id": "item-gebic-cake-33",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-bread",
    "name": "GEBIC CAKE",
    "price": 100,
    "description": "GEBIC CAKE prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/artisanal-pastry.jpg",
    "tags": [
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 33
  },
  {
    "id": "item-aja-bageste-long-34",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-bread",
    "name": "AJA BAGESTE LONG",
    "price": 50,
    "description": "AJA BAGESTE LONG prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "vegan"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 34
  },
  {
    "id": "item-babesfi-bread-35",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-bread",
    "name": "BABESFI BREAD",
    "price": 150,
    "description": "BABESFI BREAD prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/artisanal-pastry.jpg",
    "tags": [
      "vegan"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 35
  },
  {
    "id": "item-bombolino-36",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-bread",
    "name": "BOMBOLINO",
    "price": 60,
    "description": "BOMBOLINO prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/artisanal-pastry.jpg",
    "tags": [
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 36
  },
  {
    "id": "item-boksenya-37",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-bread",
    "name": "BOKSENYA",
    "price": 110,
    "description": "BOKSENYA prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/artisanal-pastry.jpg",
    "tags": [
      "vegan"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 37
  },
  {
    "id": "item-feta-with-honey-38",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-breakfast",
    "name": "Feta with Honey",
    "price": 350,
    "description": "Feta with Honey prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "vegetarian",
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 38
  },
  {
    "id": "item-feta-with-tamer-39",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-breakfast",
    "name": "Feta with Tamer",
    "price": 350,
    "description": "Feta with Tamer prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 39
  },
  {
    "id": "item-feta-with-honey-tamer-and-banana-40",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-breakfast",
    "name": "Feta with Honey, Tamer, and banana",
    "price": 450,
    "description": "Feta with Honey, Tamer, and banana prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "vegetarian",
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": true,
    "sort_order": 40
  },
  {
    "id": "item-fetira-41",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-breakfast",
    "name": "Fetira",
    "price": 300,
    "description": "Fetira prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 41
  },
  {
    "id": "item-special-fetira-42",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-breakfast",
    "name": "Special Fetira",
    "price": 450,
    "description": "Special Fetira prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "vegetarian",
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": true,
    "sort_order": 42
  },
  {
    "id": "item-full-normal-43",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-breakfast",
    "name": "Full Normal",
    "price": 280,
    "description": "Full Normal prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 43
  },
  {
    "id": "item-full-special-44",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-breakfast",
    "name": "Full Special",
    "price": 575,
    "description": "Full Special prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "vegetarian",
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 44
  },
  {
    "id": "item-addis-combo-break-fast-45",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-breakfast",
    "name": "Addis Combo Break fast",
    "price": 750,
    "description": "Addis Combo Break fast prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": true,
    "sort_order": 45
  },
  {
    "id": "item-scramble-egg-46",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-breakfast",
    "name": "Scramble Egg",
    "price": 300,
    "description": "Scramble Egg prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 46
  },
  {
    "id": "item-egg-sandwich-47",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-breakfast",
    "name": "Egg Sandwich",
    "price": 350,
    "description": "Egg Sandwich prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/shawarma-wrap.jpg",
    "tags": [
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 47
  },
  {
    "id": "item-omelet-48",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-breakfast",
    "name": "Omelet",
    "price": 350,
    "description": "Omelet prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 48
  },
  {
    "id": "item-avocado-toast-49",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-breakfast",
    "name": "Avocado Toast",
    "price": 350,
    "description": "Avocado Toast prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "vegan",
      "fasting"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 49
  },
  {
    "id": "item-chechebisa-fasting-50",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-breakfast",
    "name": "Chechebisa Fasting",
    "price": 300,
    "description": "Chechebisa Fasting prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/fasting-beyaynetu.jpg",
    "tags": [
      "vegan",
      "fasting"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 50
  },
  {
    "id": "item-chechebisa-51",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-breakfast",
    "name": "Chechebisa",
    "price": 400,
    "description": "Chechebisa prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "vegetarian",
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 51
  },
  {
    "id": "item-chechebisa-teff-52",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-breakfast",
    "name": "Chechebisa Teff",
    "price": 400,
    "description": "Chechebisa Teff prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "gluten-free",
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 52
  },
  {
    "id": "item-oats-53",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-breakfast",
    "name": "Oats",
    "price": 300,
    "description": "Oats prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "vegan",
      "fasting"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 53
  },
  {
    "id": "item-siga-firfir-54",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-breakfast",
    "name": "Siga Firfir",
    "price": 500,
    "description": "Siga Firfir prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 54
  },
  {
    "id": "item-injera-firfir-55",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-breakfast",
    "name": "Injera Firfir",
    "price": 350,
    "description": "Injera Firfir prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "vegan",
      "fasting"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 55
  },
  {
    "id": "item-special-burger-56",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-burgers",
    "name": "Special Burger",
    "price": 799,
    "description": "Special Burger prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-burger.jpg",
    "tags": [
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": true,
    "sort_order": 56
  },
  {
    "id": "item-chicken-burger-57",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-burgers",
    "name": "Chicken Burger",
    "price": 599,
    "description": "Chicken Burger prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-burger.jpg",
    "tags": [
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 57
  },
  {
    "id": "item-cheese-burger-58",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-burgers",
    "name": "Cheese Burger",
    "price": 599,
    "description": "Cheese Burger prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-burger.jpg",
    "tags": [
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 58
  },
  {
    "id": "item-beef-burger-59",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-burgers",
    "name": "Beef Burger",
    "price": 498,
    "description": "Beef Burger prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-burger.jpg",
    "tags": [
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 59
  },
  {
    "id": "item-speacial-pizza-60",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-pizzas",
    "name": "Speacial Pizza",
    "price": 1099,
    "description": "Speacial Pizza prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/woodfired-pizza.jpg",
    "tags": [
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": true,
    "sort_order": 60
  },
  {
    "id": "item-margarita-pizza-61",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-pizzas",
    "name": "Margarita Pizza",
    "price": 700,
    "description": "Margarita Pizza prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/woodfired-pizza.jpg",
    "tags": [
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 61
  },
  {
    "id": "item-chicken-pizza-62",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-pizzas",
    "name": "Chicken Pizza",
    "price": 899,
    "description": "Chicken Pizza prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/woodfired-pizza.jpg",
    "tags": [
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 62
  },
  {
    "id": "item-tuna-pizza-63",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-pizzas",
    "name": "Tuna Pizza",
    "price": 899,
    "description": "Tuna Pizza prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/woodfired-pizza.jpg",
    "tags": [
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 63
  },
  {
    "id": "item-vegetable-pizza-64",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-pizzas",
    "name": "Vegetable Pizza",
    "price": 460,
    "description": "Vegetable Pizza prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/woodfired-pizza.jpg",
    "tags": [
      "vegan",
      "fasting"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 64
  },
  {
    "id": "item-french-frise-65",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-snack-menu",
    "name": "French frise",
    "price": 345,
    "description": "French frise prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/shawarma-wrap.jpg",
    "tags": [
      "vegan",
      "fasting"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 65
  },
  {
    "id": "item-spring-roll-vegetable-66",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-snack-menu",
    "name": "Spring roll vegetable",
    "price": 345,
    "description": "Spring roll vegetable prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/shawarma-wrap.jpg",
    "tags": [
      "vegan",
      "fasting"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 66
  },
  {
    "id": "item-spring-roll-meat-67",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-snack-menu",
    "name": "Spring roll meat",
    "price": 500,
    "description": "Spring roll meat prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/shawarma-wrap.jpg",
    "tags": [
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 67
  },
  {
    "id": "item-addis-snack-68",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-snack-menu",
    "name": "Addis snack",
    "price": 575,
    "description": "Addis snack prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/shawarma-wrap.jpg",
    "tags": [
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 68
  },
  {
    "id": "item-fish-chips-69",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-snack-menu",
    "name": "Fish & chips",
    "price": 750,
    "description": "Fish & chips prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/shawarma-wrap.jpg",
    "tags": [
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": true,
    "sort_order": 69
  },
  {
    "id": "item-fried-chicken-wings-70",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-snack-menu",
    "name": "Fried Chicken wings",
    "price": 750,
    "description": "Fried Chicken wings prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/shawarma-wrap.jpg",
    "tags": [
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 70
  },
  {
    "id": "item-chicken-nugget-71",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-snack-menu",
    "name": "Chicken nugget",
    "price": 750,
    "description": "Chicken nugget prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/shawarma-wrap.jpg",
    "tags": [
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 71
  },
  {
    "id": "item-a-chicken-tender-4pcs-72",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-snack-menu",
    "name": "A. Chicken Tender 4pcs",
    "price": 600,
    "description": "A. Chicken Tender 4pcs prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/shawarma-wrap.jpg",
    "tags": [
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 72
  },
  {
    "id": "item-a-chicken-tender-6pcs-73",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-snack-menu",
    "name": "A. Chicken Tender 6pcs",
    "price": 800,
    "description": "A. Chicken Tender 6pcs prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/shawarma-wrap.jpg",
    "tags": [
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": true,
    "sort_order": 73
  },
  {
    "id": "item-special-milk-74",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-beverage",
    "name": "SPECIAL MILK",
    "price": 200,
    "description": "SPECIAL MILK prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/ethiopian-buna.jpg",
    "tags": [
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 74
  },
  {
    "id": "item-coffee-75",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-beverage",
    "name": "COFFEE",
    "price": 120,
    "description": "COFFEE prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/ethiopian-buna.jpg",
    "tags": [
      "vegan",
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 75
  },
  {
    "id": "item-tea-76",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-beverage",
    "name": "TEA",
    "price": 60,
    "description": "TEA prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/ethiopian-buna.jpg",
    "tags": [
      "vegan"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 76
  },
  {
    "id": "item-macchiato-77",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-beverage",
    "name": "MACCHIATO",
    "price": 120,
    "description": "MACCHIATO prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/ethiopian-buna.jpg",
    "tags": [
      "vegetarian",
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 77
  },
  {
    "id": "item-double-macchiato-78",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-beverage",
    "name": "DOUBLE MACCHIATO",
    "price": 220,
    "description": "DOUBLE MACCHIATO prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/ethiopian-buna.jpg",
    "tags": [
      "vegetarian",
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": true,
    "sort_order": 78
  },
  {
    "id": "item-steam-coffee-79",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-beverage",
    "name": "STEAM COFFEE",
    "price": 100,
    "description": "STEAM COFFEE prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/ethiopian-buna.jpg",
    "tags": [
      "vegan"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 79
  },
  {
    "id": "item-special-tea-80",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-beverage",
    "name": "SPECIAL TEA",
    "price": 200,
    "description": "SPECIAL TEA prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/ethiopian-buna.jpg",
    "tags": [
      "vegan",
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 80
  },
  {
    "id": "item-safi-milk-81",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-beverage",
    "name": "SAFI MILK",
    "price": 120,
    "description": "SAFI MILK prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/ethiopian-buna.jpg",
    "tags": [
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 81
  },
  {
    "id": "item-cafe-late-82",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-beverage",
    "name": "CAFE LATE",
    "price": 150,
    "description": "CAFE LATE prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/ethiopian-buna.jpg",
    "tags": [
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 82
  },
  {
    "id": "item-cappuccino-83",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-beverage",
    "name": "CAPPUCCINO",
    "price": 200,
    "description": "CAPPUCCINO prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/ethiopian-buna.jpg",
    "tags": [
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 83
  },
  {
    "id": "item-ginger-tea-84",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-beverage",
    "name": "GINGER TEA",
    "price": 100,
    "description": "GINGER TEA prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/ethiopian-buna.jpg",
    "tags": [
      "vegan",
      "fasting"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 84
  },
  {
    "id": "item-lewoze-tea-85",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-beverage",
    "name": "LEWOZE TEA",
    "price": 170,
    "description": "LEWOZE TEA prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/ethiopian-buna.jpg",
    "tags": [
      "vegan"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 85
  },
  {
    "id": "item-milk-tea-86",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-beverage",
    "name": "MILK TEA",
    "price": 140,
    "description": "MILK TEA prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/ethiopian-buna.jpg",
    "tags": [
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 86
  },
  {
    "id": "item-somali-tea-87",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-beverage",
    "name": "SOMALI TEA",
    "price": 140,
    "description": "SOMALI TEA prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/ethiopian-buna.jpg",
    "tags": [
      "vegan",
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 87
  },
  {
    "id": "item-green-tea-88",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-beverage",
    "name": "GREEN TEA",
    "price": 80,
    "description": "GREEN TEA prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/ethiopian-buna.jpg",
    "tags": [
      "vegan",
      "fasting"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 88
  },
  {
    "id": "item-orange-tea-89",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-beverage",
    "name": "ORANGE TEA",
    "price": 120,
    "description": "ORANGE TEA prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/ethiopian-buna.jpg",
    "tags": [
      "vegan",
      "fasting"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 89
  },
  {
    "id": "item-americano-coffee-90",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-beverage",
    "name": "AMERICANO COFFEE",
    "price": 200,
    "description": "AMERICANO COFFEE prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/ethiopian-buna.jpg",
    "tags": [
      "vegan"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 90
  },
  {
    "id": "item-lemon-tea-91",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-beverage",
    "name": "LEMON TEA",
    "price": 80,
    "description": "LEMON TEA prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/ethiopian-buna.jpg",
    "tags": [
      "vegan",
      "fasting"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 91
  },
  {
    "id": "item-sprice-tea-92",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-beverage",
    "name": "SPRICE TEA",
    "price": 120,
    "description": "SPRICE TEA prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/ethiopian-buna.jpg",
    "tags": [
      "vegan"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 92
  },
  {
    "id": "item-hot-chocolate-93",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-beverage",
    "name": "HOT CHOCOLATE",
    "price": 200,
    "description": "HOT CHOCOLATE prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/ethiopian-buna.jpg",
    "tags": [
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 93
  },
  {
    "id": "item-nana-tea-94",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-beverage",
    "name": "NANA TEA",
    "price": 100,
    "description": "NANA TEA prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/ethiopian-buna.jpg",
    "tags": [
      "vegan",
      "fasting"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 94
  },
  {
    "id": "item-lipton-tea-95",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-hot-beverage",
    "name": "LIPTON TEA",
    "price": 80,
    "description": "LIPTON TEA prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/ethiopian-buna.jpg",
    "tags": [
      "vegan"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 95
  },
  {
    "id": "item-avocado-96",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-juice",
    "name": "AVOCADO",
    "price": 300,
    "description": "AVOCADO prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/fresh-mango-juice.jpg",
    "tags": [
      "vegan",
      "fasting",
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": true,
    "sort_order": 96
  },
  {
    "id": "item-papaya-juice-97",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-juice",
    "name": "PAPAYA JUICE",
    "price": 300,
    "description": "PAPAYA JUICE prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/fresh-mango-juice.jpg",
    "tags": [
      "vegan",
      "fasting"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 97
  },
  {
    "id": "item-watermelon-juice-98",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-juice",
    "name": "WATERMELON JUICE",
    "price": 300,
    "description": "WATERMELON JUICE prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/fresh-mango-juice.jpg",
    "tags": [
      "vegan",
      "fasting"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 98
  },
  {
    "id": "item-mango-99",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-juice",
    "name": "MANGO",
    "price": 350,
    "description": "MANGO prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/fresh-mango-juice.jpg",
    "tags": [
      "vegan",
      "fasting",
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 99
  },
  {
    "id": "item-sprice-juice-100",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-juice",
    "name": "SPRICE JUICE",
    "price": 350,
    "description": "SPRICE JUICE prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/fresh-mango-juice.jpg",
    "tags": [
      "vegan",
      "fasting",
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 100
  },
  {
    "id": "item-gishita-juice-101",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-juice",
    "name": "GISHITA JUICE",
    "price": 350,
    "description": "GISHITA JUICE prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/fresh-mango-juice.jpg",
    "tags": [
      "vegan",
      "fasting"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 101
  },
  {
    "id": "item-ananas-102",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-juice",
    "name": "ANANAS",
    "price": 350,
    "description": "ANANAS prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/fresh-mango-juice.jpg",
    "tags": [
      "vegan",
      "fasting"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 102
  },
  {
    "id": "item-orange-103",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-juice",
    "name": "ORANGE",
    "price": 350,
    "description": "ORANGE prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/fresh-mango-juice.jpg",
    "tags": [
      "vegan",
      "fasting"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 103
  },
  {
    "id": "item-ginger-juice-104",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-juice",
    "name": "GINGER JUICE",
    "price": 280,
    "description": "GINGER JUICE prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/fresh-mango-juice.jpg",
    "tags": [
      "vegan",
      "fasting"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 104
  },
  {
    "id": "item-stroberry-shake-105",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-juice",
    "name": "STROBERRY SHAKE",
    "price": 280,
    "description": "STROBERRY SHAKE prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/fresh-mango-juice.jpg",
    "tags": [
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 105
  },
  {
    "id": "item-banana-shake-106",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-juice",
    "name": "BANANA SHAKE",
    "price": 400,
    "description": "BANANA SHAKE prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/fresh-mango-juice.jpg",
    "tags": [
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 106
  },
  {
    "id": "item-avocado-shake-107",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-juice",
    "name": "AVOCADO SHAKE",
    "price": 400,
    "description": "AVOCADO SHAKE prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/fresh-mango-juice.jpg",
    "tags": [
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 107
  },
  {
    "id": "item-mango-shake-108",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-juice",
    "name": "MANGO SHAKE",
    "price": 400,
    "description": "MANGO SHAKE prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/fresh-mango-juice.jpg",
    "tags": [
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 108
  },
  {
    "id": "item-chocolate-shake-109",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-juice",
    "name": "CHOCOLATE SHAKE",
    "price": 450,
    "description": "CHOCOLATE SHAKE prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/fresh-mango-juice.jpg",
    "tags": [
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 109
  },
  {
    "id": "item-special-juice-110",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-juice",
    "name": "Special juice",
    "price": 450,
    "description": "Special juice prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/fresh-mango-juice.jpg",
    "tags": [
      "vegan",
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": true,
    "sort_order": 110
  },
  {
    "id": "item-ice-coffee-111",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-cold-drinks",
    "name": "ICE COFFEE",
    "price": 200,
    "description": "ICE COFFEE prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/ethiopian-buna.jpg",
    "tags": [
      "vegan",
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 111
  },
  {
    "id": "item-ice-late-americano-112",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-cold-drinks",
    "name": "ICE LATE/AMERICANO",
    "price": 200,
    "description": "ICE LATE/AMERICANO prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/ethiopian-buna.jpg",
    "tags": [
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 112
  },
  {
    "id": "item-mojito-113",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-cold-drinks",
    "name": "MOJITO",
    "price": 350,
    "description": "MOJITO prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/fresh-mango-juice.jpg",
    "tags": [
      "vegan",
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 113
  },
  {
    "id": "item-soft-drinks-114",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-cold-drinks",
    "name": "SOFT DRINKS",
    "price": 80,
    "description": "SOFT DRINKS prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/fresh-mango-juice.jpg",
    "tags": [
      "vegan"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 114
  },
  {
    "id": "item-ambo-water-115",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-cold-drinks",
    "name": "AMBO WATER",
    "price": 100,
    "description": "AMBO WATER prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/fresh-mango-juice.jpg",
    "tags": [
      "vegan",
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 115
  },
  {
    "id": "item-water-300ml-116",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-cold-drinks",
    "name": "WATER 300ML",
    "price": 305,
    "description": "WATER 300ML prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/fresh-mango-juice.jpg",
    "tags": [
      "vegan"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 116
  },
  {
    "id": "item-water-600ml-117",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-cold-drinks",
    "name": "WATER 600ML",
    "price": 50,
    "description": "WATER 600ML prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/fresh-mango-juice.jpg",
    "tags": [
      "vegan"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 117
  },
  {
    "id": "item-water-1000ml-118",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-cold-drinks",
    "name": "WATER 1000ML",
    "price": 70,
    "description": "WATER 1000ML prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/fresh-mango-juice.jpg",
    "tags": [
      "vegan"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 118
  },
  {
    "id": "item-caramel-iced-coffee-119",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-cold-drinks",
    "name": "CARAMEL ICED COFFEE",
    "price": 200,
    "description": "CARAMEL ICED COFFEE prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/ethiopian-buna.jpg",
    "tags": [
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 119
  },
  {
    "id": "item-yebeg-tibs-120",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-lunch-dinner",
    "name": "Yebeg Tibs",
    "price": 900,
    "description": "Yebeg Tibs prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "popular"
    ],
    "allergens": [],
    "spice_level": 2,
    "is_available": true,
    "is_chefs_pick": true,
    "sort_order": 120
  },
  {
    "id": "item-rice-with-meat-121",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-lunch-dinner",
    "name": "Rice with meat",
    "price": 575,
    "description": "Rice with meat prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 121
  },
  {
    "id": "item-rice-with-vegetable-122",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-lunch-dinner",
    "name": "Rice with Vegetable",
    "price": 450,
    "description": "Rice with Vegetable prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "vegan",
      "fasting"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 122
  },
  {
    "id": "item-quanta-firfir-123",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-lunch-dinner",
    "name": "Quanta Firfir",
    "price": 550,
    "description": "Quanta Firfir prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 123
  },
  {
    "id": "item-shiro-with-butter-124",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-lunch-dinner",
    "name": "Shiro with Butter",
    "price": 400,
    "description": "Shiro with Butter prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/fasting-beyaynetu.jpg",
    "tags": [
      "vegetarian",
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 124
  },
  {
    "id": "item-smart-shiro-125",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-lunch-dinner",
    "name": "Smart shiro",
    "price": 400,
    "description": "Smart shiro prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/fasting-beyaynetu.jpg",
    "tags": [
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 125
  },
  {
    "id": "item-pasta-with-vegetable-126",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-lunch-dinner",
    "name": "Pasta with Vegetable",
    "price": 450,
    "description": "Pasta with Vegetable prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "vegan",
      "fasting"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 126
  },
  {
    "id": "item-pasta-with-meat-127",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-lunch-dinner",
    "name": "Pasta with meat",
    "price": 575,
    "description": "Pasta with meat prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 127
  },
  {
    "id": "item-pasta-with-tomato-128",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-lunch-dinner",
    "name": "Pasta with tomato",
    "price": 400,
    "description": "Pasta with tomato prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "vegan",
      "fasting"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 128
  },
  {
    "id": "item-doro-tibs-129",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-lunch-dinner",
    "name": "Doro Tibs",
    "price": 800,
    "description": "Doro Tibs prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "popular"
    ],
    "allergens": [],
    "spice_level": 2,
    "is_available": true,
    "is_chefs_pick": true,
    "sort_order": 129
  },
  {
    "id": "item-vigitable-sup-130",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-lunch-dinner",
    "name": "Vigitable sup",
    "price": 300,
    "description": "Vigitable sup prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "vegan",
      "fasting"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 130
  },
  {
    "id": "item-chikina-tibs-131",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-lunch-dinner",
    "name": "Chikina Tibs",
    "price": 900,
    "description": "Chikina Tibs prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "popular"
    ],
    "allergens": [],
    "spice_level": 2,
    "is_available": true,
    "is_chefs_pick": true,
    "sort_order": 131
  },
  {
    "id": "item-tibs-tefersho-132",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-lunch-dinner",
    "name": "Tibs Tefersho",
    "price": 700,
    "description": "Tibs Tefersho prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "popular"
    ],
    "allergens": [],
    "spice_level": 2,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 132
  },
  {
    "id": "item-yebeg-keywot-133",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-lunch-dinner",
    "name": "Yebeg Keywot",
    "price": 700,
    "description": "Yebeg Keywot prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 133
  },
  {
    "id": "item-agelegil-134",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-lunch-dinner",
    "name": "Agelegil",
    "price": 900,
    "description": "Agelegil prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": true,
    "sort_order": 134
  },
  {
    "id": "item-gomen-besiga-135",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-lunch-dinner",
    "name": "Gomen Besiga",
    "price": 700,
    "description": "Gomen Besiga prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 135
  },
  {
    "id": "item-grilled-fish-136",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-lunch-dinner",
    "name": "Grilled Fish",
    "price": 850,
    "description": "Grilled Fish prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 136
  },
  {
    "id": "item-mofo-137",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-mendi",
    "name": "Mofo",
    "price": 700,
    "description": "Mofo prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/traditional-mendi.jpg",
    "tags": [
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 137
  },
  {
    "id": "item-special-mendi-138",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-mendi",
    "name": "Special Mendi",
    "price": 2000,
    "description": "Special Mendi prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/traditional-mendi.jpg",
    "tags": [
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": true,
    "sort_order": 138
  },
  {
    "id": "item-mend-1-2-139",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-mendi",
    "name": "Mend 1/2",
    "price": 900,
    "description": "Mend 1/2 prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/traditional-mendi.jpg",
    "tags": [
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 139
  },
  {
    "id": "item-mend-full-140",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-mendi",
    "name": "Mend Full",
    "price": 1800,
    "description": "Mend Full prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/traditional-mendi.jpg",
    "tags": [
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": true,
    "sort_order": 140
  },
  {
    "id": "item-1-2-roasted-chicken-141",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-mendi",
    "name": "1/2 Roasted Chicken",
    "price": 1098,
    "description": "1/2 Roasted Chicken prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/traditional-mendi.jpg",
    "tags": [
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 141
  },
  {
    "id": "item-roasted-chicken-full-142",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-mendi",
    "name": "Roasted Chicken Full",
    "price": 1900,
    "description": "Roasted Chicken Full prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/traditional-mendi.jpg",
    "tags": [
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": true,
    "sort_order": 142
  },
  {
    "id": "item-keywot-and-fitfit-143",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-half-half",
    "name": "Keywot and Fitfit",
    "price": 790,
    "description": "Keywot and Fitfit prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": true,
    "sort_order": 143
  },
  {
    "id": "item-tibs-and-fitfit-144",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-half-half",
    "name": "Tibs and Fitfit",
    "price": 900,
    "description": "Tibs and Fitfit prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "popular"
    ],
    "allergens": [],
    "spice_level": 2,
    "is_available": true,
    "is_chefs_pick": true,
    "sort_order": 144
  },
  {
    "id": "item-cooked-vegs-and-aja-145",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-half-half",
    "name": "Cooked Vegs and Aja",
    "price": 600,
    "description": "Cooked Vegs and Aja prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "vegan",
      "fasting"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 145
  },
  {
    "id": "item-tuna-sandwich-146",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-wraps",
    "name": "Tuna Sandwich",
    "price": 600,
    "description": "Tuna Sandwich prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/shawarma-wrap.jpg",
    "tags": [
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 146
  },
  {
    "id": "item-beef-shewarema-147",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-wraps",
    "name": "Beef Shewarema",
    "price": 699,
    "description": "Beef Shewarema prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": true,
    "sort_order": 147
  },
  {
    "id": "item-chicken-shewarma-148",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-wraps",
    "name": "Chicken Shewarma",
    "price": 600,
    "description": "Chicken Shewarma prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/shawarma-wrap.jpg",
    "tags": [
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 148
  },
  {
    "id": "item-shiro-149",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-fasting-lunch",
    "name": "Shiro",
    "price": 350,
    "description": "Shiro prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/fasting-beyaynetu.jpg",
    "tags": [
      "vegan",
      "fasting",
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 149
  },
  {
    "id": "item-beyaynetu-150",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-fasting-lunch",
    "name": "Beyaynetu",
    "price": 500,
    "description": "Beyaynetu prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/fasting-beyaynetu.jpg",
    "tags": [
      "vegan",
      "fasting",
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": true,
    "sort_order": 150
  },
  {
    "id": "item-fasting-agelegil-151",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-fasting-lunch",
    "name": "Fasting Agelegil",
    "price": 600,
    "description": "Fasting Agelegil prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "vegan",
      "fasting",
      "popular"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 151
  },
  {
    "id": "item-suf-fitfit-152",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-fasting-lunch",
    "name": "Suf fitfit",
    "price": 350,
    "description": "Suf fitfit prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "vegan",
      "fasting"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 152
  },
  {
    "id": "item-addis-special-salad-153",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-fasting-lunch",
    "name": "Addis special Salad",
    "price": 400,
    "description": "Addis special Salad prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/fasting-beyaynetu.jpg",
    "tags": [
      "vegan",
      "fasting"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 153
  },
  {
    "id": "item-aja-with-spinach-154",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-fasting-lunch",
    "name": "Aja with spinach",
    "price": 400,
    "description": "Aja with spinach prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "vegan",
      "fasting"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 154
  },
  {
    "id": "item-takeaway-155",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-takeaway-extras",
    "name": "Takeaway",
    "price": 50,
    "description": "Takeaway prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 155
  },
  {
    "id": "item-pizza-takeaway-156",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-takeaway-extras",
    "name": "Pizza takeaway",
    "price": 100,
    "description": "Pizza takeaway prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/woodfired-pizza.jpg",
    "tags": [],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 156
  },
  {
    "id": "item-extra-cheese-157",
    "restaurant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "category_id": "cat-takeaway-extras",
    "name": "Extra cheese",
    "price": 100,
    "description": "Extra cheese prepared freshly at Addis Cafeteria with authentic premium ingredients.",
    "image_url": "/images/dishes/special-fetira.jpg",
    "tags": [
      "vegetarian"
    ],
    "allergens": [],
    "spice_level": 0,
    "is_available": true,
    "is_chefs_pick": false,
    "sort_order": 157
  }
];

const inMemoryOrders: Order[] = [
  {
    id: 'ord-101',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    table_number: 'Table 1',
    items: [
      {
        item_id: 'item-yebeg-tibs',
        name: 'Yebeg Tibs (የበግ ጥብስ)',
        price: 900,
        quantity: 1,
        selected_options: [],
        line_total: 900,
      },
      {
        item_id: 'item-macchiato',
        name: 'Macchiato (ማኪያቶ)',
        price: 120,
        quantity: 2,
        selected_options: [],
        line_total: 240,
      }
    ],
    subtotal: 1140,
    tax: 171,
    total: 1311,
    status: 'pending',
    notes: 'Please make the tibs extra sizzling with rosemary',
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    updated_at: new Date().toISOString(),
  }
];

const inMemoryServiceRequests: ServiceRequest[] = [
  {
    id: 'req-201',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    table_number: 'Table 14',
    request_type: 'water',
    status: 'pending',
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  }
];

// -----------------------------------------------------------------------------
// UNIFIED DATA ACCESS FUNCTIONS (SUPABASE + RESILIENT FALLBACK)
// -----------------------------------------------------------------------------

const STORAGE_KEY_RESTAURANT = 'digital_menu_restaurant_cache';

export function getStoredRestaurant(slug?: string): Restaurant | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RESTAURANT);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!slug || parsed.slug === slug) {
      return parsed;
    }
  } catch {}
  return null;
}

export function persistRestaurant(restaurant: Restaurant): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_RESTAURANT, JSON.stringify(restaurant));
  } catch {}
}

export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  // Check client-side cached restaurant first
  const cached = getStoredRestaurant(slug);
  if (cached) {
    inMemoryRestaurant = {
      ...inMemoryRestaurant,
      ...cached,
      theme_config: {
        ...inMemoryRestaurant.theme_config,
        ...(cached.theme_config || {}),
      },
    };
  }

  // If Supabase is connected with real credentials:
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const supabase = createClient();
      const { data, error } = await Promise.race([
        supabase.from('restaurants').select('*').eq('slug', slug).single(),
        new Promise<any>((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000)),
      ]);

      if (!error && data) {
        const merged: Restaurant = {
          ...MOCK_RESTAURANT_ADDIS,
          ...inMemoryRestaurant,
          ...(data as Restaurant),
          theme_config: {
            ...(MOCK_RESTAURANT_ADDIS.theme_config || {}),
            ...((data as any).theme_config || {}),
            ...inMemoryRestaurant.theme_config,
          },
          branch_name: (data as any).branch_name || inMemoryRestaurant.branch_name,
          address: (data as any).address || inMemoryRestaurant.address,
          google_maps_url: (data as any).google_maps_url || inMemoryRestaurant.google_maps_url,
        };
        inMemoryRestaurant = merged;
        persistRestaurant(merged);
        return merged;
      }
    } catch {
      // Fallback below
    }
  }

  // Built-in fallback matching requested slug
  if (slug.toLowerCase() === 'addis' || slug.toLowerCase() === 'afla' || slug.toLowerCase() === 'addis-cafeteria' || slug === 'default' || slug === 'aura') {
    return inMemoryRestaurant;
  }

  return null;
}

const STORAGE_KEY_CATEGORIES = 'digital_menu_categories_cache_v3';

let inMemoryCategories: Category[] = [];

function getStoredCategories(): Category[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistCategories(cats: Category[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(cats));
  } catch {}
}

export async function getMenuCategories(restaurantId: string): Promise<Category[]> {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        const local = getStoredCategories();
        const dataIds = new Set(data.map((d: any) => d.id));
        const localOnly = local.filter((c) => !dataIds.has(c.id));
        const localMap = new Map(local.map((c) => [c.id, c]));
        inMemoryCategories = [
          ...(data as Category[]).map((d) => localMap.get(d.id) || d),
          ...localOnly,
        ].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
        persistCategories(inMemoryCategories);
        return inMemoryCategories;
      }
    } catch {
      // Fallback below
    }
  }

  const local = getStoredCategories();
  if (local.length > 0) {
    inMemoryCategories = local;
    return inMemoryCategories;
  }

  if (inMemoryCategories.length > 0) return inMemoryCategories;
  inMemoryCategories = [...MOCK_CATEGORIES_ADDIS];
  persistCategories(inMemoryCategories);
  return inMemoryCategories;
}

export async function getMenuItems(restaurantId: string): Promise<MenuItem[]> {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('items')
        .select('*, options:item_options(*)')
        .eq('restaurant_id', restaurantId)
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        inMemoryItems = data as MenuItem[];
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('digital_menu_items_cache_v3', JSON.stringify(inMemoryItems));
          } catch {}
        }
        return inMemoryItems;
      }
    } catch {
      // Fallback below
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('digital_menu_items_cache_v3');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          inMemoryItems = parsed;
          return inMemoryItems;
        }
      }
    } catch {}
  }

  if (inMemoryItems.length > 0) return inMemoryItems;
  return MOCK_ITEMS_ADDIS;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    restaurant_id: input.restaurant_id,
    table_number: input.table_number,
    items: input.items,
    subtotal: input.subtotal,
    tax: input.tax,
    total: input.total,
    status: 'pending',
    notes: input.notes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  inMemoryOrders.unshift(newOrder);

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const supabase = createClient();
      await supabase.from('orders').insert(newOrder);
    } catch {
      // Handled
    }
  }

  return newOrder;
}

export async function createServiceRequest(input: ServiceRequestInput): Promise<ServiceRequest> {
  const newRequest: ServiceRequest = {
    id: `req-${Date.now()}`,
    restaurant_id: input.restaurant_id,
    table_number: input.table_number,
    request_type: input.request_type,
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  inMemoryServiceRequests.unshift(newRequest);

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const supabase = createClient();
      await supabase.from('service_requests').insert(newRequest);
    } catch {
      // Handled
    }
  }

  return newRequest;
}

export async function getLiveOrders(restaurantId: string): Promise<Order[]> {
  return inMemoryOrders.filter(o => o.restaurant_id === restaurantId || restaurantId === MOCK_RESTAURANT_ADDIS.id);
}

export async function getLiveServiceRequests(restaurantId: string): Promise<ServiceRequest[]> {
  return inMemoryServiceRequests.filter(r => r.restaurant_id === restaurantId || restaurantId === MOCK_RESTAURANT_ADDIS.id);
}

// -----------------------------------------------------------------------------
// STAGE 3: OFFERS DATA & OPERATIONS (SUPABASE + IN-MEMORY FALLBACK)
// -----------------------------------------------------------------------------

export const MOCK_OFFERS_ADDIS: Offer[] = [
  {
    id: 'f1a8c1e2-3456-4789-a012-3456789abc01',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    title: 'Happy Hour: 20% Off Wood-Fired Specialties',
    description: 'Enjoy 20% off all artisan wood-fired mains every afternoon.',
    badge_text: '20% Off',
    template_type: 'happy_hour',
    status: 'live',
    is_paused: false,
    discount_type: 'percentage',
    discount_value: 20,
    scope_type: 'categories',
    category_ids: ['cat-woodfired'],
    timezone: 'Africa/Addis_Ababa',
    days_of_week: [0, 1, 2, 3, 4, 5, 6],
    start_time: '08:00',
    end_time: '23:59',
    honest_urgency_hours: 2,
    show_top_banner: true,
    banner_text: 'Afternoon Happy Hour: 20% off all artisan wood-fired dishes until late.',
    banner_link_text: 'See offer',
    stacking_rule: 'best_discount',
    priority: 10,
    views_count: 184,
    taps_count: 42,
    orders_count: 14,
    total_savings: 38.5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'f2b9d2e3-4567-4890-b123-456789abc02',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    title: 'Addis Sourdough Truffle Burrata Combo',
    description: 'Save 40 ETB when enjoying our signature Truffle Burrata Flatbread.',
    badge_text: '40 ETB Off',
    template_type: 'money_off',
    status: 'live',
    is_paused: false,
    discount_type: 'fixed_amount',
    discount_value: 40.0,
    scope_type: 'items',
    item_ids: ['item-burrata'],
    timezone: 'Africa/Addis_Ababa',
    days_of_week: [0, 1, 2, 3, 4, 5, 6],
    honest_urgency_hours: 0,
    show_top_banner: false,
    stacking_rule: 'best_discount',
    priority: 5,
    views_count: 96,
    taps_count: 28,
    orders_count: 9,
    total_savings: 360.0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'f3c0e3f4-5678-4901-c234-56789abc03',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    title: 'Complimentary Single-Origin Espresso over 500 ETB',
    description: 'Free single-origin Yirgacheffe espresso automatically added to orders over 500 ETB.',
    badge_text: 'Free Gift',
    template_type: 'free_item',
    status: 'live',
    is_paused: false,
    discount_type: 'free_item',
    discount_value: 0,
    min_order_amount: 500.0,
    free_item_id: 'item-espresso',
    scope_type: 'all',
    timezone: 'Africa/Addis_Ababa',
    days_of_week: [0, 1, 2, 3, 4, 5, 6],
    honest_urgency_hours: 0,
    show_top_banner: false,
    stacking_rule: 'allow_stack',
    priority: 1,
    views_count: 82,
    taps_count: 19,
    orders_count: 8,
    total_savings: 40.0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let inMemoryOffers: Offer[] = [];

export async function getOffers(restaurantId: string): Promise<Offer[]> {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('priority', { ascending: false });

      if (!error && data) {
        const mapped = data.map((d: any) => ({
          ...d,
          status: d.status || (d.is_active ? 'live' : 'paused'),
          is_paused: d.is_paused ?? !d.is_active,
          show_top_banner: d.show_top_banner ?? true,
          template_type: d.template_type || d.offer_type || 'percentage_off',
          scope_type: d.scope_type || (d.target_category_ids?.length ? 'categories' : d.target_item_ids?.length ? 'items' : 'all'),
          category_ids: d.category_ids || d.target_category_ids || ['cat-woodfired'],
          item_ids: d.item_ids || d.target_item_ids || [],
          timezone: d.timezone || 'Africa/Addis_Ababa',
          days_of_week: d.days_of_week || [0, 1, 2, 3, 4, 5, 6],
          start_time: d.start_time || '00:00',
          end_time: d.end_time || '23:59',
          honest_urgency_hours: d.honest_urgency_hours ?? 2,
          banner_text: d.banner_text || d.title,
          banner_link_text: d.banner_link_text || 'See offer',
          stacking_rule: d.stacking_rule || 'best_discount',
        })) as Offer[];

        inMemoryOffers = mapped;
        return mapped;
      }
    } catch {
      // Fallback below
    }
  }

  if (inMemoryOffers.length > 0) return inMemoryOffers;
  return MOCK_OFFERS_ADDIS;
}

export async function saveOffer(offer: Partial<Offer> & { restaurant_id: string }): Promise<Offer> {
  const isExisting = offer.id && inMemoryOffers.some((o) => o.id === offer.id);

  if (isExisting && offer.id) {
    inMemoryOffers = inMemoryOffers.map((o) =>
      o.id === offer.id ? ({ ...o, ...offer, updated_at: new Date().toISOString() } as Offer) : o
    );
    const updated = inMemoryOffers.find((o) => o.id === offer.id)!;

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
      try {
        const supabase = createClient();
        await supabase.from('offers').update(updated).eq('id', updated.id);
      } catch {
        // Handled
      }
    }
    return updated;
  }

  const newOffer: Offer = {
    id: offer.id || `off-${Date.now()}`,
    restaurant_id: offer.restaurant_id,
    title: offer.title || 'Special Promotion',
    description: offer.description || '',
    badge_text: offer.badge_text || 'Offer',
    template_type: offer.template_type || 'percentage_off',
    status: offer.status || 'live',
    is_paused: offer.is_paused ?? false,
    discount_type: offer.discount_type || 'percentage',
    discount_value: Number(offer.discount_value || 0),
    min_order_amount: offer.min_order_amount,
    free_item_id: offer.free_item_id,
    scope_type: offer.scope_type || 'all',
    category_ids: offer.category_ids || [],
    item_ids: offer.item_ids || [],
    timezone: offer.timezone || 'Africa/Addis_Ababa',
    starts_at: offer.starts_at || null,
    ends_at: offer.ends_at || null,
    days_of_week: offer.days_of_week || [0, 1, 2, 3, 4, 5, 6],
    start_time: offer.start_time || null,
    end_time: offer.end_time || null,
    honest_urgency_hours: offer.honest_urgency_hours ?? 2,
    show_top_banner: offer.show_top_banner ?? false,
    banner_text: offer.banner_text || '',
    banner_link_text: offer.banner_link_text || 'See offer',
    stacking_rule: offer.stacking_rule || 'best_discount',
    priority: offer.priority ?? 5,
    views_count: 0,
    taps_count: 0,
    orders_count: 0,
    total_savings: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  inMemoryOffers.unshift(newOffer);

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const supabase = createClient();
      await supabase.from('offers').insert(newOffer);
    } catch {
      // Handled
    }
  }

  return newOffer;
}

export async function togglePauseOffer(offerId: string, isPaused: boolean): Promise<Offer | null> {
  const offer = inMemoryOffers.find((o) => o.id === offerId);
  if (!offer) return null;

  offer.is_paused = isPaused;
  offer.updated_at = new Date().toISOString();

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const supabase = createClient();
      await supabase.from('offers').update({ is_paused: isPaused }).eq('id', offerId);
    } catch {
      // Handled
    }
  }

  return offer;
}

export async function deleteOffer(offerId: string): Promise<boolean> {
  inMemoryOffers = inMemoryOffers.filter((o) => o.id !== offerId);

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const supabase = createClient();
      await supabase.from('offers').delete().eq('id', offerId);
    } catch {
      // Handled
    }
  }

  return true;
}

export async function recordOfferInteraction(
  offerId: string,
  type: 'view' | 'tap' | 'order',
  savings: number = 0
): Promise<void> {
  const offer = inMemoryOffers.find((o) => o.id === offerId);
  if (offer) {
    if (type === 'view') offer.views_count += 1;
    if (type === 'tap') offer.taps_count += 1;
    if (type === 'order') {
      offer.orders_count += 1;
      offer.total_savings += savings;
    }
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const supabase = createClient();
      if (offer) {
        await supabase
          .from('offers')
          .update({
            views_count: offer.views_count,
            taps_count: offer.taps_count,
            orders_count: offer.orders_count,
            total_savings: offer.total_savings,
          })
          .eq('id', offerId);
      }
    } catch {
      // Handled
    }
  }
}

// -----------------------------------------------------------------------------
// STAGE 4: DISH REVIEWS SYSTEM DATA LAYER
// -----------------------------------------------------------------------------
export const DEFAULT_REVIEW_SETTINGS_ADDIS: RestaurantReviewSettings = {
  restaurant_id: MOCK_RESTAURANT_ADDIS.id,
  reviews_enabled: true,
  notification_frequency: 'daily_digest',
  available_tags: [
    'Great portion',
    'Would order again',
    'Fresh ingredients',
    'Crispy texture',
    'Perfect spice',
    'Too salty',
    'Could be hotter',
    'Needs more seasoning',
  ],
  min_reviews_threshold: 3,
};

let inMemoryReviewSettings: RestaurantReviewSettings = { ...DEFAULT_REVIEW_SETTINGS_ADDIS };

export const MOCK_REVIEWS_ADDIS: DishReview[] = [];

let inMemoryReviews: DishReview[] = [];

export const MOCK_MODERATION_LOGS_ADDIS: ReviewModerationLog[] = [];

let inMemoryModerationLogs: ReviewModerationLog[] = [];

const STORAGE_KEY_REVIEW_OVERRIDES = 'digital_menu_review_overrides';
const STORAGE_KEY_REVIEWS = 'digital_menu_reviews_cache';

function getStoredReviews(): DishReview[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REVIEWS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistReviews(reviews: DishReview[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviews));
  } catch {}
}

function getStoredReviewOverrides(): Record<string, Partial<DishReview>> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REVIEW_OVERRIDES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveReviewOverride(reviewId: string, updates: Partial<DishReview>) {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredReviewOverrides();
    current[reviewId] = { ...(current[reviewId] || {}), ...updates };
    localStorage.setItem(STORAGE_KEY_REVIEW_OVERRIDES, JSON.stringify(current));
  } catch {}
}

export async function getDishReviews(
  restaurantId: string,
  itemId?: string
): Promise<DishReview[]> {
  const overrides = getStoredReviewOverrides();
  const cached = getStoredReviews();

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const supabase = createClient();
      let query = supabase
        .from('reviews')
        .select('*')
        .eq('restaurant_id', restaurantId);

      if (itemId) {
        query = query.eq('item_id', itemId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (!error && data) {
        const supabaseRevs = (data as DishReview[]).map((r) => {
          if (overrides[r.id]) {
            return { ...r, ...overrides[r.id] };
          }
          return r;
        });

        // Merge Supabase reviews with any locally cached reviews so nothing is lost
        const mergedMap = new Map<string, DishReview>();
        for (const r of supabaseRevs) {
          mergedMap.set(r.id, r);
        }
        for (const r of cached) {
          if (!mergedMap.has(r.id) && r.restaurant_id === restaurantId && (!itemId || r.item_id === itemId)) {
            mergedMap.set(r.id, overrides[r.id] ? { ...r, ...overrides[r.id] } : r);
          }
        }
        for (const r of inMemoryReviews) {
          if (!mergedMap.has(r.id) && r.restaurant_id === restaurantId && (!itemId || r.item_id === itemId)) {
            mergedMap.set(r.id, overrides[r.id] ? { ...r, ...overrides[r.id] } : r);
          }
        }

        const mergedList = Array.from(mergedMap.values()).sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        if (!itemId) {
          persistReviews(mergedList);
          inMemoryReviews = mergedList;
        }

        return mergedList;
      }
    } catch {
      // Fallback below
    }
  }

  // Fallback if Supabase offline or not configured
  const mergedMap = new Map<string, DishReview>();
  for (const r of cached) {
    if (r.restaurant_id === restaurantId && (!itemId || r.item_id === itemId)) {
      mergedMap.set(r.id, overrides[r.id] ? { ...r, ...overrides[r.id] } : r);
    }
  }
  for (const r of inMemoryReviews) {
    if (!mergedMap.has(r.id) && r.restaurant_id === restaurantId && (!itemId || r.item_id === itemId)) {
      mergedMap.set(r.id, overrides[r.id] ? { ...r, ...overrides[r.id] } : r);
    }
  }

  const list = Array.from(mergedMap.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  return list;
}

export async function submitDishReview(params: {
  restaurant_id: string;
  item_id: string;
  rating: number;
  tags?: string[];
  comment?: string;
  photo_url?: string;
  session_token: string;
  table_number?: string;
  honeypot?: string;
  submissionDurationMs?: number;
}): Promise<{ success: boolean; review?: DishReview; error?: string }> {
  // 1. Bot check
  const botCheck = validateBotCheck(params.honeypot, params.submissionDurationMs ?? 2000);
  if (!botCheck.isHuman) {
    return { success: false, error: botCheck.reason || 'Automated submission blocked.' };
  }

  // 2. Rate limit & duplicate check
  const rateLimitCheck = checkReviewRateLimit(
    inMemoryReviews,
    params.session_token,
    params.item_id
  );
  if (!rateLimitCheck.allowed) {
    return { success: false, error: rateLimitCheck.error };
  }

  // 3. Abuse / profanity / PII check
  const contentCheck = checkReviewContent(params.comment, params.tags ?? []);
  const initialStatus = contentCheck.isClean ? 'published' : 'flagged';
  const flaggedReason = contentCheck.isClean
    ? undefined
    : contentCheck.flaggedReason === 'profanity'
    ? 'Contains abusive language or profanity'
    : 'Contains personal contact information';

  const newReview: DishReview = {
    id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    restaurant_id: params.restaurant_id,
    item_id: params.item_id,
    rating: Math.max(1, Math.min(5, Math.round(params.rating))),
    tags: params.tags || [],
    comment: params.comment?.trim() || undefined,
    photo_url: params.photo_url || undefined,
    session_token: params.session_token,
    table_number: params.table_number || undefined,
    status: initialStatus,
    flagged_reason: flaggedReason,
    report_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  inMemoryReviews.unshift(newReview);
  const stored = getStoredReviews();
  persistReviews([newReview, ...stored.filter((r) => r.id !== newReview.id)]);

  // Broadcast feedback immediately across tabs so owner and staff receive it right away
  broadcastSync({ type: 'REVIEW_SUBMITTED', review: newReview });

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('reviews').insert(newReview);
      if (error) {
        console.warn('Supabase review insert warning (cached locally):', error);
      }
    } catch (err) {
      console.warn('Supabase review insert network error (cached locally):', err);
    }
  }

  return { success: true, review: newReview };
}

export async function reportDishReview(reviewId: string, reason: string): Promise<boolean> {
  const review = inMemoryReviews.find((r) => r.id === reviewId);
  if (!review) return false;

  review.report_count += 1;
  review.status = 'reported';
  review.flagged_reason = reason;
  review.updated_at = new Date().toISOString();

  inMemoryModerationLogs.unshift({
    id: `log-${Date.now()}`,
    restaurant_id: review.restaurant_id,
    review_id: review.id,
    user_role: 'staff',
    user_name: 'Dining Guest (Report)',
    action: 'flag',
    reason,
    created_at: new Date().toISOString(),
  });

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const supabase = createClient();
      await supabase
        .from('reviews')
        .update({
          report_count: review.report_count,
          status: 'reported',
          flagged_reason: reason,
        })
        .eq('id', reviewId);
    } catch {
      // Handled
    }
  }

  return true;
}

export async function replyToDishReview(
  reviewId: string,
  replyText: string,
  staffName: string = 'Addis Staff'
): Promise<boolean> {
  let review = inMemoryReviews.find((r) => r.id === reviewId);
  if (!review && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const supabase = createClient();
      const { data } = await supabase.from('reviews').select('*').eq('id', reviewId).single();
      if (data) {
        review = data as DishReview;
        inMemoryReviews.push(review);
      }
    } catch {}
  }
  if (!review) return false;

  review.owner_reply = replyText.trim();
  review.owner_reply_at = new Date().toISOString();
  review.owner_reply_by = staffName;
  review.updated_at = new Date().toISOString();

  saveReviewOverride(reviewId, {
    owner_reply: review.owner_reply,
    owner_reply_at: review.owner_reply_at,
    owner_reply_by: review.owner_reply_by,
    updated_at: review.updated_at,
  });

  inMemoryModerationLogs.unshift({
    id: `log-${Date.now()}`,
    restaurant_id: review.restaurant_id,
    review_id: review.id,
    user_role: 'staff',
    user_name: staffName,
    action: 'reply',
    reason: replyText.slice(0, 60),
    created_at: new Date().toISOString(),
  });

  broadcastSync({ type: 'REVIEW_UPDATED', review });

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const supabase = createClient();
      await supabase
        .from('reviews')
        .update({
          owner_reply: review.owner_reply,
          owner_reply_at: review.owner_reply_at,
          owner_reply_by: review.owner_reply_by,
        })
        .eq('id', reviewId);
    } catch {
      // Handled
    }
  }

  return true;
}

export async function moderateDishReview(
  reviewId: string,
  action: 'approve' | 'remove',
  reason: string,
  userRole: UserRole,
  userName: string = 'Owner'
): Promise<{ success: boolean; error?: string }> {
  // Enforce role permissions: only owners can remove reviews
  if (action === 'remove' && !canRemoveReview(userRole)) {
    return {
      success: false,
      error: 'Permission denied: Only owners can remove reviews.',
    };
  }

  if (action === 'remove' && (!reason || reason.trim().length === 0)) {
    return {
      success: false,
      error: 'A required removal reason must be provided (e.g. Profanity, Spam, PII).',
    };
  }

  let review = inMemoryReviews.find((r) => r.id === reviewId);
  if (!review && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const supabase = createClient();
      const { data } = await supabase.from('reviews').select('*').eq('id', reviewId).single();
      if (data) {
        review = data as DishReview;
        inMemoryReviews.push(review);
      }
    } catch {}
  }
  if (!review) {
    return { success: false, error: 'Review not found.' };
  }

  if (action === 'approve') {
    review.status = 'published';
    review.flagged_reason = undefined;
  } else {
    review.status = 'removed';
    review.flagged_reason = reason;
  }
  review.updated_at = new Date().toISOString();

  saveReviewOverride(reviewId, {
    status: review.status,
    flagged_reason: review.flagged_reason,
    updated_at: review.updated_at,
  });

  inMemoryModerationLogs.unshift({
    id: `log-${Date.now()}`,
    restaurant_id: review.restaurant_id,
    review_id: review.id,
    user_role: userRole,
    user_name: userName,
    action,
    reason,
    created_at: new Date().toISOString(),
  });

  broadcastSync({ type: 'REVIEW_UPDATED', review });

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const supabase = createClient();
      await supabase
        .from('reviews')
        .update({
          status: review.status,
          flagged_reason: review.flagged_reason,
        })
        .eq('id', reviewId);
    } catch {
      // Handled
    }
  }

  return { success: true };
}

export async function getReviewModerationLogs(
  restaurantId: string
): Promise<ReviewModerationLog[]> {
  return inMemoryModerationLogs.filter((l) => l.restaurant_id === restaurantId);
}

export async function getReviewSettings(
  restaurantId: string
): Promise<RestaurantReviewSettings> {
  return { ...inMemoryReviewSettings, restaurant_id: restaurantId };
}

export async function updateReviewSettings(
  restaurantId: string,
  settings: Partial<RestaurantReviewSettings>
): Promise<RestaurantReviewSettings> {
  inMemoryReviewSettings = {
    ...inMemoryReviewSettings,
    ...settings,
    restaurant_id: restaurantId,
    updated_at: new Date().toISOString(),
  };
  return inMemoryReviewSettings;
}

export async function toggleItemReviews(
  itemId: string,
  enabled: boolean
): Promise<boolean> {
  const item = inMemoryItems.find((i) => i.id === itemId);
  if (item) {
    item.reviews_enabled = enabled;
  }
  return true;
}

// -----------------------------------------------------------------------------
// STAGE 5: ADMIN EXPERIENCE DATA LAYER
// -----------------------------------------------------------------------------
export const MOCK_SCHEDULED_MENUS_ADDIS: ScheduledMenu[] = [
  {
    id: 'sched-breakfast',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    name: 'Morning Artisanal Roast & Pastries',
    start_time: '07:00',
    end_time: '11:30',
    days_of_week: [0, 1, 2, 3, 4, 5, 6],
    category_ids: ['cat-breakfast', 'cat-drinks'],
    is_active: true,
  },
  {
    id: 'sched-lunch-dinner',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    name: 'Main Dining & Prime Cuts',
    start_time: '11:30',
    end_time: '22:00',
    days_of_week: [0, 1, 2, 3, 4, 5, 6],
    category_ids: ['cat-lunch-dinner', 'cat-woodfired', 'cat-mendi', 'cat-desserts'],
    is_active: true,
  },
];

let inMemoryScheduledMenus: ScheduledMenu[] = [...MOCK_SCHEDULED_MENUS_ADDIS];

export const MOCK_MENU_VERSIONS_ADDIS: MenuVersion[] = [
  {
    id: 'v-1',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    label: 'Initial Launch Menu',
    created_at: new Date(Date.now() - 7 * 86400 * 1000).toISOString(),
    items_snapshot: [],
  },
];

let inMemoryMenuVersions: MenuVersion[] = [...MOCK_MENU_VERSIONS_ADDIS];

let inMemoryItems: MenuItem[] = [];
let inMemoryRestaurant: Restaurant = { ...MOCK_RESTAURANT_ADDIS };

export async function saveMenuItem(itemData: Partial<MenuItem>): Promise<MenuItem> {
  const existingIdx = inMemoryItems.findIndex((i) => i.id === itemData.id);
  let savedItem: MenuItem;

  if (existingIdx >= 0) {
    savedItem = {
      ...inMemoryItems[existingIdx],
      ...itemData,
    } as MenuItem;
    inMemoryItems[existingIdx] = savedItem;
  } else {
    savedItem = {
      id: itemData.id || `item-${Date.now()}`,
      restaurant_id: itemData.restaurant_id || MOCK_RESTAURANT_ADDIS.id,
      category_id: itemData.category_id || inMemoryCategories[0]?.id || 'cat-breakfast',
      name: itemData.name || 'New Dish',
      name_es: itemData.name_es,
      description: itemData.description || '',
      description_es: itemData.description_es,
      price: Number(itemData.price || 0),
      image_url: itemData.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      tags: itemData.tags || [],
      allergens: itemData.allergens || [],
      spice_level: itemData.spice_level ?? 0,
      calories: itemData.calories,
      custom_badge: itemData.custom_badge,
      is_available: itemData.is_available ?? true,
      is_chefs_pick: itemData.is_chefs_pick ?? false,
      is_draft: itemData.is_draft ?? false,
      is_archived: itemData.is_archived ?? false,
      sort_order: itemData.sort_order ?? inMemoryItems.length + 1,
      options: itemData.options || [],
    };
    inMemoryItems.unshift(savedItem);
  }

  // Broadcast update immediately to customer menu view across tabs/windows
  broadcastSync({ type: 'ITEM_UPDATED', item: savedItem });

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('digital_menu_items_cache_v3', JSON.stringify(inMemoryItems));
    } catch {}
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const supabase = createClient();
      if (itemData.id) {
        // Granular update: Only modify fields explicitly passed in itemData
        const updatePayload: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };
        if (itemData.name !== undefined) updatePayload.name = itemData.name;
        if (itemData.name_am !== undefined) updatePayload.name_am = itemData.name_am;
        if (itemData.name_so !== undefined) updatePayload.name_so = itemData.name_so;
        if (itemData.name_es !== undefined) updatePayload.name_es = itemData.name_es;
        if (itemData.description !== undefined) updatePayload.description = itemData.description;
        if (itemData.description_am !== undefined) updatePayload.description_am = itemData.description_am;
        if (itemData.description_so !== undefined) updatePayload.description_so = itemData.description_so;
        if (itemData.description_es !== undefined) updatePayload.description_es = itemData.description_es;
        if (itemData.price !== undefined) updatePayload.price = Number(itemData.price);
        if (itemData.category_id !== undefined) updatePayload.category_id = itemData.category_id;
        if (itemData.tags !== undefined) updatePayload.tags = itemData.tags;
        if (itemData.allergens !== undefined) updatePayload.allergens = itemData.allergens;
        if (itemData.spice_level !== undefined) updatePayload.spice_level = itemData.spice_level;
        if (itemData.is_available !== undefined) updatePayload.is_available = itemData.is_available;
        if (itemData.is_chefs_pick !== undefined) updatePayload.is_chefs_pick = itemData.is_chefs_pick;
        if (itemData.sort_order !== undefined) updatePayload.sort_order = itemData.sort_order;
        if (itemData.image_url !== undefined && itemData.image_url !== '') updatePayload.image_url = itemData.image_url;

        const { data: updateData, error } = await supabase
          .from('items')
          .update(updatePayload)
          .eq('id', savedItem.id)
          .select();

        if (error) {
          console.error('Supabase items.update failed:', error.message);
        } else if (!updateData || updateData.length === 0) {
          // Row did not exist yet, insert
          const dbPayload = {
            id: savedItem.id,
            restaurant_id: savedItem.restaurant_id,
            category_id: savedItem.category_id,
            name: savedItem.name,
            name_am: savedItem.name_am || null,
            name_so: savedItem.name_so || null,
            name_es: savedItem.name_es || null,
            description: savedItem.description || null,
            description_am: savedItem.description_am || null,
            description_so: savedItem.description_so || null,
            description_es: savedItem.description_es || null,
            price: savedItem.price,
            image_url: savedItem.image_url,
            tags: savedItem.tags || [],
            allergens: savedItem.allergens || [],
            spice_level: savedItem.spice_level ?? 0,
            is_available: savedItem.is_available ?? true,
            is_chefs_pick: savedItem.is_chefs_pick ?? false,
            sort_order: savedItem.sort_order ?? 0,
            updated_at: new Date().toISOString(),
          };
          await supabase.from('items').insert(dbPayload);
        }
      } else {
        const dbPayload = {
          id: savedItem.id,
          restaurant_id: savedItem.restaurant_id,
          category_id: savedItem.category_id,
          name: savedItem.name,
          name_am: savedItem.name_am || null,
          name_so: savedItem.name_so || null,
          name_es: savedItem.name_es || null,
          description: savedItem.description || null,
          description_am: savedItem.description_am || null,
          description_so: savedItem.description_so || null,
          description_es: savedItem.description_es || null,
          price: savedItem.price,
          image_url: savedItem.image_url,
          tags: savedItem.tags || [],
          allergens: savedItem.allergens || [],
          spice_level: savedItem.spice_level ?? 0,
          is_available: savedItem.is_available ?? true,
          is_chefs_pick: savedItem.is_chefs_pick ?? false,
          sort_order: savedItem.sort_order ?? 0,
          updated_at: new Date().toISOString(),
        };
        const { error } = await supabase.from('items').insert(dbPayload);
        if (error) {
          console.error('Supabase items.insert failed:', error.message);
        }
      }
    } catch (err) {
      console.error('Supabase items mutation exception:', err);
    }
  }

  return savedItem;
}

export async function duplicateMenuItem(itemId: string): Promise<MenuItem | null> {
  const original = inMemoryItems.find((i) => i.id === itemId);
  if (!original) return null;

  const duplicated: MenuItem = {
    ...original,
    id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: `${original.name} (Copy)`,
    sort_order: original.sort_order + 1,
  };

  inMemoryItems.unshift(duplicated);
  broadcastSync({ type: 'ITEM_UPDATED', item: duplicated });
  return duplicated;
}

export async function archiveMenuItem(itemId: string, archived: boolean = true): Promise<boolean> {
  const item = inMemoryItems.find((i) => i.id === itemId);
  if (!item) return false;
  item.is_archived = archived;
  broadcastSync({ type: 'ITEM_UPDATED', item });
  return true;
}

export async function deleteMenuItem(itemId: string): Promise<boolean> {
  inMemoryItems = inMemoryItems.filter((i) => i.id !== itemId);
  broadcastSync({ type: 'ITEM_DELETED', itemId });

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const supabase = createClient();
      await supabase.from('items').delete().eq('id', itemId);
    } catch {
      // Handled
    }
  }
  return true;
}

export async function bulkUpdateItems(
  itemIds: string[],
  updates: Partial<MenuItem>
): Promise<MenuItem[]> {
  const targetSet = new Set(itemIds);
  inMemoryItems = inMemoryItems.map((item) => {
    if (targetSet.has(item.id)) {
      const updated = { ...item, ...updates };
      broadcastSync({ type: 'ITEM_UPDATED', item: updated });
      return updated;
    }
    return item;
  });

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const supabase = createClient();
      const cleanUpdates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.is_available !== undefined) cleanUpdates.is_available = updates.is_available;
      if (updates.price !== undefined) cleanUpdates.price = updates.price;
      if (updates.is_chefs_pick !== undefined) cleanUpdates.is_chefs_pick = updates.is_chefs_pick;
      if (updates.image_url !== undefined) cleanUpdates.image_url = updates.image_url;

      await supabase.from('items').update(cleanUpdates).in('id', itemIds);
    } catch {
      // Handled
    }
  }

  return inMemoryItems.filter((i) => targetSet.has(i.id));
}

export async function saveCategory(categoryData: Partial<Category>): Promise<Category> {
  const existingIdx = inMemoryCategories.findIndex((c) => c.id === categoryData.id);
  let savedCategory: Category;

  if (existingIdx >= 0) {
    savedCategory = {
      ...inMemoryCategories[existingIdx],
      ...categoryData,
    } as Category;
    inMemoryCategories[existingIdx] = savedCategory;
  } else {
    const slug = (categoryData.name || 'category')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const newCat: Category = {
      id: categoryData.id || `cat-${slug || Date.now()}`,
      restaurant_id: categoryData.restaurant_id || MOCK_RESTAURANT_ADDIS.id,
      name: categoryData.name || 'New Category',
      name_am: categoryData.name_am,
      name_so: categoryData.name_so,
      name_es: categoryData.name_es,
      icon: categoryData.icon || '🍽️',
      description: categoryData.description || '',
      description_am: categoryData.description_am,
      description_so: categoryData.description_so,
      description_es: categoryData.description_es,
      sort_order: categoryData.sort_order ?? inMemoryCategories.length + 1,
      is_active: categoryData.is_active ?? true,
    };
    inMemoryCategories.push(newCat);
    savedCategory = newCat;
  }

  // Persist locally
  persistCategories(inMemoryCategories);

  // Broadcast update immediately to customer & admin across tabs
  broadcastSync({ type: 'CATEGORY_UPDATED', category: savedCategory });

  // Sync to Supabase
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const isUuid = (val?: string) =>
        val && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);

      if (isUuid(savedCategory.restaurant_id)) {
        const supabase = createClient();
        const payload: Record<string, any> = {
          name: savedCategory.name,
          name_am: savedCategory.name_am,
          name_so: savedCategory.name_so,
          name_es: savedCategory.name_es,
          icon: savedCategory.icon,
          description: savedCategory.description || '',
          description_am: savedCategory.description_am,
          description_so: savedCategory.description_so,
          description_es: savedCategory.description_es,
          sort_order: savedCategory.sort_order,
          is_active: savedCategory.is_active,
          restaurant_id: savedCategory.restaurant_id,
          updated_at: new Date().toISOString(),
        };

        if (isUuid(savedCategory.id)) {
          payload.id = savedCategory.id;
          await Promise.race([
            supabase.from('categories').upsert(payload),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000)),
          ]);
        }
      }
    } catch {
      // Offline fallback
    }
  }

  return savedCategory;
}

export async function deleteCategory(
  categoryId: string
): Promise<{ success: boolean; affectedDishesCount: number; error?: string }> {
  const idx = inMemoryCategories.findIndex((c) => c.id === categoryId);
  if (idx === -1) {
    return { success: false, affectedDishesCount: 0, error: 'Category not found.' };
  }

  // Reassign any dishes belonging to this category to the first remaining category
  const remaining = inMemoryCategories.filter((c) => c.id !== categoryId);
  const fallbackCatId = remaining[0]?.id || 'cat-breakfast';
  let affectedDishesCount = 0;

  inMemoryItems = inMemoryItems.map((item) => {
    if (item.category_id === categoryId) {
      affectedDishesCount++;
      return { ...item, category_id: fallbackCatId };
    }
    return item;
  });

  if (affectedDishesCount > 0 && typeof window !== 'undefined') {
    try {
      localStorage.setItem('digital_menu_items_cache_v3', JSON.stringify(inMemoryItems));
      broadcastSync({ type: 'ITEMS_REFRESH' });
    } catch {}
  }

  inMemoryCategories.splice(idx, 1);
  persistCategories(inMemoryCategories);

  broadcastSync({ type: 'CATEGORY_DELETED', categoryId });

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const isUuid = (val?: string) =>
        val && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);

      if (isUuid(categoryId)) {
        const supabase = createClient();
        await Promise.race([
          supabase.from('categories').delete().eq('id', categoryId),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000)),
        ]);
      }
    } catch {
      // Offline fallback
    }
  }

  return { success: true, affectedDishesCount };
}

export async function reorderCategories(reordered: Category[]): Promise<Category[]> {
  inMemoryCategories = reordered.map((cat, idx) => ({ ...cat, sort_order: idx + 1 }));
  persistCategories(inMemoryCategories);

  broadcastSync({ type: 'CATEGORIES_REFRESH' });

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const supabase = createClient();
      for (const cat of inMemoryCategories) {
        await supabase.from('categories').update({ sort_order: cat.sort_order }).eq('id', cat.id);
      }
    } catch {}
  }

  return inMemoryCategories;
}

export async function updateRestaurantSettings(
  restaurantId: string,
  updates: Partial<Restaurant>
): Promise<Restaurant> {
  inMemoryRestaurant = {
    ...inMemoryRestaurant,
    ...updates,
    theme_config: {
      ...inMemoryRestaurant.theme_config,
      ...(updates.theme_config || {}),
    },
    wifi_config: {
      ...inMemoryRestaurant.wifi_config,
      ...(updates.wifi_config || {}),
    },
    feature_flags: {
      ...inMemoryRestaurant.feature_flags,
      ...(updates.feature_flags || {}),
    },
    custom_badges: updates.custom_badges || inMemoryRestaurant.custom_badges,
    custom_labels: updates.custom_labels || inMemoryRestaurant.custom_labels,
    closed_message: updates.closed_message || inMemoryRestaurant.closed_message,
    holiday_closures: updates.holiday_closures || inMemoryRestaurant.holiday_closures,
    updated_at: new Date().toISOString(),
  };

  // 1. Persist locally to localStorage
  persistRestaurant(inMemoryRestaurant);

  // 2. Broadcast immediately across all open tabs/windows
  broadcastSync({ type: 'RESTAURANT_UPDATED', restaurant: inMemoryRestaurant });

  // 3. Sync to Supabase
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const isUuid = (val?: string) =>
        val && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);

      const supabase = createClient();
      const payload: Record<string, any> = {
        theme_config: inMemoryRestaurant.theme_config,
        wifi_config: inMemoryRestaurant.wifi_config,
        updated_at: new Date().toISOString(),
      };
      if (updates.name) payload.name = updates.name;
      if (updates.hours) payload.hours = updates.hours;
      if (updates.address) payload.address = updates.address;
      if (updates.announcement !== undefined) payload.announcement = updates.announcement;
      if (updates.is_open !== undefined) payload.is_open = updates.is_open;

      if (isUuid(restaurantId)) {
        await Promise.race([
          supabase.from('restaurants').update(payload).eq('id', restaurantId),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000)),
        ]);
      } else {
        await Promise.race([
          supabase.from('restaurants').update(payload).eq('slug', inMemoryRestaurant.slug),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000)),
        ]);
      }
    } catch {
      // Offline fallback
    }
  }

  return inMemoryRestaurant;
}

export async function getScheduledMenus(restaurantId: string): Promise<ScheduledMenu[]> {
  return inMemoryScheduledMenus.filter((m) => m.restaurant_id === restaurantId);
}

export async function saveScheduledMenu(menu: ScheduledMenu): Promise<ScheduledMenu> {
  const idx = inMemoryScheduledMenus.findIndex((m) => m.id === menu.id);
  if (idx >= 0) {
    inMemoryScheduledMenus[idx] = menu;
  } else {
    inMemoryScheduledMenus.push(menu);
  }
  return menu;
}

export async function getMenuVersions(restaurantId: string): Promise<MenuVersion[]> {
  return inMemoryMenuVersions.filter((v) => v.restaurant_id === restaurantId);
}

export async function createMenuVersion(restaurantId: string, label: string): Promise<MenuVersion> {
  const newVersion: MenuVersion = {
    id: `v-${Date.now()}`,
    restaurant_id: restaurantId,
    label: label || `Snapshot ${new Date().toLocaleDateString()}`,
    created_at: new Date().toISOString(),
    items_snapshot: JSON.parse(JSON.stringify(inMemoryItems)),
  };
  inMemoryMenuVersions.unshift(newVersion);
  return newVersion;
}

export async function restoreMenuVersion(versionId: string): Promise<MenuItem[]> {
  const ver = inMemoryMenuVersions.find((v) => v.id === versionId);
  if (ver) {
    inMemoryItems = JSON.parse(JSON.stringify(ver.items_snapshot));
  }
  return inMemoryItems;
}

