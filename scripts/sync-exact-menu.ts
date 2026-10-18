import { MOCK_ITEMS_ADDIS } from '../src/lib/data-provider';

// Direct Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vekhuxcaqybqkoxfknfk.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_oLod2_N8a7RgMgxmVf8Zvg_qV9kc7OR';
const RESTAURANT_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

export interface RawCategory {
  id: string;
  name: string;
  name_am: string;
  icon: string;
  description: string;
  sort_order: number;
}

export interface RawDish {
  name: string;
  price: number;
  category_id: string;
  tags?: string[];
  allergens?: string[];
  spice_level?: number;
  is_chefs_pick?: boolean;
}

export const CATEGORIES_DATA: RawCategory[] = [
  {
    id: 'cat-soft-cake',
    name: 'Soft Cake',
    name_am: 'ለስላሳ ኬክ',
    icon: '🍰',
    description: 'Freshly baked artisanal cakes, pastries, tortas, and sweet confections.',
    sort_order: 1,
  },
  {
    id: 'cat-bread',
    name: 'Bread',
    name_am: 'ዳቦ',
    icon: '🥖',
    description: 'Oven-fresh artisanal breads, baguettes, and traditional bakery loaves.',
    sort_order: 2,
  },
  {
    id: 'cat-breakfast',
    name: 'Berak Fast',
    name_am: 'ቁርስ',
    icon: '🍳',
    description: 'Traditional morning platters, fetira, ful, and hearty breakfast combos.',
    sort_order: 3,
  },
  {
    id: 'cat-burgers',
    name: 'Burgers',
    name_am: 'በርገር',
    icon: '🍔',
    description: 'Juicy handcrafted patties, melted cheese, and toasted brioche buns.',
    sort_order: 4,
  },
  {
    id: 'cat-pizzas',
    name: 'Pizzas',
    name_am: 'ፒዛ',
    icon: '🍕',
    description: 'Wood-fired sourdough crust baked with mozzarella and fresh toppings.',
    sort_order: 5,
  },
  {
    id: 'cat-snack-menu',
    name: 'Snack Menu',
    name_am: 'ስናክ',
    icon: '🍟',
    description: 'Crispy fries, golden spring rolls, wings, and chicken tenders.',
    sort_order: 6,
  },
  {
    id: 'cat-hot-beverage',
    name: 'Hot Beverage (Addis Cafe)',
    name_am: 'ትኩስ መጠጦች',
    icon: '☕',
    description: 'Single-origin Ethiopian coffee, rich macchiato, and aromatic teas.',
    sort_order: 7,
  },
  {
    id: 'cat-juice',
    name: 'Juice',
    name_am: 'ጭማቂ',
    icon: '🥤',
    description: '100% freshly pressed tropical fruits, creamy avocados, and thick shakes.',
    sort_order: 8,
  },
  {
    id: 'cat-cold-drinks',
    name: 'Cold Drinks',
    name_am: 'ቀዝቃዛ መጠጦች',
    icon: '🧊',
    description: 'Chilled coffees, refreshing mojitos, natural mineral water, and sodas.',
    sort_order: 9,
  },
  {
    id: 'cat-lunch-dinner',
    name: 'Lunch and Dinner',
    name_am: 'ምሳ እና እራት',
    icon: '🥘',
    description: 'Sizzling lamb and beef tibs, slow-simmered wots, aromatic rice, and pasta.',
    sort_order: 10,
  },
  {
    id: 'cat-mendi',
    name: 'Mendi',
    name_am: 'መንዲ',
    icon: '🍖',
    description: 'Slow-cooked fragrant spiced rice served with tender roasted meats.',
    sort_order: 11,
  },
  {
    id: 'cat-half-half',
    name: 'Half Half',
    name_am: 'ግማሽ በግማሽ',
    icon: '🍲',
    description: 'Two hearty signature dishes combined side-by-side on fresh injera.',
    sort_order: 12,
  },
  {
    id: 'cat-wraps',
    name: 'Wraps',
    name_am: 'ሻዋርማ እና ሳንድዊች',
    icon: '🌯',
    description: 'Warm pita wraps and toasted sandwiches loaded with fillings and sauce.',
    sort_order: 13,
  },
  {
    id: 'cat-fasting-lunch',
    name: 'Fasting Lunch',
    name_am: 'የፆም ምግብ',
    icon: '🥬',
    description: '100% plant-based Ethiopian vegan specialties, Beyaynetu, and fresh salads.',
    sort_order: 14,
  },
  {
    id: 'cat-takeaway-extras',
    name: 'Takeaway & Extras',
    name_am: 'ተጨማሪዎች',
    icon: '📦',
    description: 'Packaging, takeaway boxes, and extra gourmet toppings.',
    sort_order: 15,
  },
];

export const DISHES_DATA: RawDish[] = [
  // 1. Soft Cake
  { name: 'cream cake', price: 200, category_id: 'cat-soft-cake', tags: ['vegetarian'] },
  { name: 'Black Forest', price: 230, category_id: 'cat-soft-cake', tags: ['popular', 'vegetarian'], is_chefs_pick: true },
  { name: 'Black&White Forest', price: 230, category_id: 'cat-soft-cake', tags: ['vegetarian'] },
  { name: 'strawberry cake', price: 230, category_id: 'cat-soft-cake', tags: ['vegetarian'] },
  { name: 'Opera cake', price: 250, category_id: 'cat-soft-cake', tags: ['vegetarian'] },
  { name: 'Torta cake', price: 1500, category_id: 'cat-soft-cake', tags: ['popular', 'vegetarian'] },
  { name: 'Cup cake', price: 150, category_id: 'cat-soft-cake', tags: ['vegetarian'] },
  { name: 'English Cake', price: 1050, category_id: 'cat-soft-cake', tags: ['vegetarian'] },
  { name: 'Basbousa', price: 100, category_id: 'cat-soft-cake', tags: ['vegetarian'] },
  { name: 'Orange Basbousa', price: 190, category_id: 'cat-soft-cake', tags: ['vegetarian'] },
  { name: 'Croissant Plain', price: 150, category_id: 'cat-soft-cake', tags: ['vegetarian'] },
  { name: 'White Plain', price: 150, category_id: 'cat-soft-cake', tags: ['vegetarian'] },
  { name: 'Orange Fasting', price: 150, category_id: 'cat-soft-cake', tags: ['vegan', 'fasting'] },
  { name: 'Orange cake', price: 150, category_id: 'cat-soft-cake', tags: ['vegetarian'] },
  { name: 'Venus plain BIG', price: 150, category_id: 'cat-soft-cake', tags: ['vegetarian'] },
  { name: 'Venus plane SHORT', price: 100, category_id: 'cat-soft-cake', tags: ['vegetarian'] },
  { name: 'Beckewhe', price: 80, category_id: 'cat-soft-cake', tags: ['vegetarian'] },
  { name: 'COOKISE', price: 800, category_id: 'cat-soft-cake', tags: ['vegetarian'] },

  // 2. Bread
  { name: 'CALVINE BREAD', price: 50, category_id: 'cat-bread', tags: ['vegan'] },
  { name: 'OTES BREAD', price: 50, category_id: 'cat-bread', tags: ['vegan'] },
  { name: 'FEWAST BREAD', price: 50, category_id: 'cat-bread', tags: ['vegan'] },
  { name: 'RAGEST BRADE', price: 50, category_id: 'cat-bread', tags: ['vegan'] },
  { name: 'AJA BREAD', price: 20, category_id: 'cat-bread', tags: ['vegan'] },
  { name: 'AJA RAGKESTE', price: 10, category_id: 'cat-bread', tags: ['vegan'] },
  { name: 'GEBIS BREAD', price: 15, category_id: 'cat-bread', tags: ['vegan'] },
  { name: 'GEBIS BAGET', price: 15, category_id: 'cat-bread', tags: ['vegan'] },
  { name: 'GEBIS MINI', price: 15, category_id: 'cat-bread', tags: ['vegan'] },
  { name: 'MIN BREAD ROG', price: 10, category_id: 'cat-bread', tags: ['vegan'] },
  { name: 'NORMAL BREAD 180G', price: 50, category_id: 'cat-bread', tags: ['vegan'] },
  { name: 'NORMAL BREAD 110G', price: 20, category_id: 'cat-bread', tags: ['vegan'] },
  { name: 'CARE BREAD', price: 100, category_id: 'cat-bread', tags: ['vegan'] },
  { name: 'CRIZIL BREAD', price: 50, category_id: 'cat-bread', tags: ['vegan'] },
  { name: 'GEBIC CAKE', price: 100, category_id: 'cat-bread', tags: ['vegetarian'] },
  { name: 'AJA BAGESTE LONG', price: 50, category_id: 'cat-bread', tags: ['vegan'] },
  { name: 'BABESFI BREAD', price: 150, category_id: 'cat-bread', tags: ['vegan'] },
  { name: 'BOMBOLINO', price: 60, category_id: 'cat-bread', tags: ['vegetarian'] },
  { name: 'BOKSENYA', price: 110, category_id: 'cat-bread', tags: ['vegan'] },

  // 3. Berak Fast
  { name: 'Feta with Honey', price: 350, category_id: 'cat-breakfast', tags: ['vegetarian', 'popular'] },
  { name: 'Feta with Tamer', price: 350, category_id: 'cat-breakfast', tags: ['vegetarian'] },
  { name: 'Feta with Honey, Tamer, and banana', price: 450, category_id: 'cat-breakfast', tags: ['vegetarian', 'popular'], is_chefs_pick: true },
  { name: 'Fetira', price: 300, category_id: 'cat-breakfast', tags: ['vegetarian'] },
  { name: 'Special Fetira', price: 450, category_id: 'cat-breakfast', tags: ['vegetarian', 'popular'], is_chefs_pick: true },
  { name: 'Full Normal', price: 280, category_id: 'cat-breakfast', tags: ['vegetarian'] },
  { name: 'Full Special', price: 575, category_id: 'cat-breakfast', tags: ['vegetarian', 'popular'] },
  { name: 'Addis Combo Break fast', price: 750, category_id: 'cat-breakfast', tags: ['popular'], is_chefs_pick: true },
  { name: 'Scramble Egg', price: 300, category_id: 'cat-breakfast', tags: ['vegetarian'] },
  { name: 'Egg Sandwich', price: 350, category_id: 'cat-breakfast', tags: ['vegetarian'] },
  { name: 'Omelet', price: 350, category_id: 'cat-breakfast', tags: ['vegetarian'] },
  { name: 'Avocado Toast', price: 350, category_id: 'cat-breakfast', tags: ['vegan', 'fasting'] },
  { name: 'Chechebisa Fasting', price: 300, category_id: 'cat-breakfast', tags: ['vegan', 'fasting'] },
  { name: 'Chechebisa', price: 400, category_id: 'cat-breakfast', tags: ['vegetarian', 'popular'] },
  { name: 'Chechebisa Teff', price: 400, category_id: 'cat-breakfast', tags: ['gluten-free', 'vegetarian'] },
  { name: 'Oats', price: 300, category_id: 'cat-breakfast', tags: ['vegan', 'fasting'] },
  { name: 'Siga Firfir', price: 500, category_id: 'cat-breakfast', tags: ['popular'] },
  { name: 'Injera Firfir', price: 350, category_id: 'cat-breakfast', tags: ['vegan', 'fasting'] },

  // 4. Burgers
  { name: 'Special Burger', price: 799, category_id: 'cat-burgers', tags: ['popular'], is_chefs_pick: true },
  { name: 'Chicken Burger', price: 599, category_id: 'cat-burgers', tags: ['popular'] },
  { name: 'Cheese Burger', price: 599, category_id: 'cat-burgers', tags: ['popular'] },
  { name: 'Beef Burger', price: 498, category_id: 'cat-burgers', tags: ['popular'] },

  // 5. Pizzas
  { name: 'Speacial Pizza', price: 1099, category_id: 'cat-pizzas', tags: ['popular'], is_chefs_pick: true },
  { name: 'Margarita Pizza', price: 700, category_id: 'cat-pizzas', tags: ['vegetarian'] },
  { name: 'Chicken Pizza', price: 899, category_id: 'cat-pizzas', tags: ['popular'] },
  { name: 'Tuna Pizza', price: 899, category_id: 'cat-pizzas', tags: ['popular'] },
  { name: 'Vegetable Pizza', price: 460, category_id: 'cat-pizzas', tags: ['vegan', 'fasting'] },

  // 6. Snack Menu
  { name: 'French frise', price: 345, category_id: 'cat-snack-menu', tags: ['vegan', 'fasting'] },
  { name: 'Spring roll vegetable', price: 345, category_id: 'cat-snack-menu', tags: ['vegan', 'fasting'] },
  { name: 'Spring roll meat', price: 500, category_id: 'cat-snack-menu', tags: ['popular'] },
  { name: 'Addis snack', price: 575, category_id: 'cat-snack-menu', tags: ['popular'] },
  { name: 'Fish & chips', price: 750, category_id: 'cat-snack-menu', tags: ['popular'], is_chefs_pick: true },
  { name: 'Fried Chicken wings', price: 750, category_id: 'cat-snack-menu', tags: ['popular'] },
  { name: 'Chicken nugget', price: 750, category_id: 'cat-snack-menu', tags: ['popular'] },
  { name: 'A. Chicken Tender 4pcs', price: 600, category_id: 'cat-snack-menu', tags: ['popular'] },
  { name: 'A. Chicken Tender 6pcs', price: 800, category_id: 'cat-snack-menu', tags: ['popular'], is_chefs_pick: true },

  // 7. Hot Beverage (Addis Cafe)
  { name: 'SPECIAL MILK', price: 200, category_id: 'cat-hot-beverage', tags: ['vegetarian'] },
  { name: 'COFFEE', price: 120, category_id: 'cat-hot-beverage', tags: ['vegan', 'popular'] },
  { name: 'TEA', price: 60, category_id: 'cat-hot-beverage', tags: ['vegan'] },
  { name: 'MACCHIATO', price: 120, category_id: 'cat-hot-beverage', tags: ['vegetarian', 'popular'] },
  { name: 'DOUBLE MACCHIATO', price: 220, category_id: 'cat-hot-beverage', tags: ['vegetarian', 'popular'], is_chefs_pick: true },
  { name: 'STEAM COFFEE', price: 100, category_id: 'cat-hot-beverage', tags: ['vegan'] },
  { name: 'SPECIAL TEA', price: 200, category_id: 'cat-hot-beverage', tags: ['vegan', 'popular'] },
  { name: 'SAFI MILK', price: 120, category_id: 'cat-hot-beverage', tags: ['vegetarian'] },
  { name: 'CAFE LATE', price: 150, category_id: 'cat-hot-beverage', tags: ['vegetarian'] },
  { name: 'CAPPUCCINO', price: 200, category_id: 'cat-hot-beverage', tags: ['vegetarian'] },
  { name: 'GINGER TEA', price: 100, category_id: 'cat-hot-beverage', tags: ['vegan', 'fasting'] },
  { name: 'LEWOZE TEA', price: 170, category_id: 'cat-hot-beverage', tags: ['vegan'] },
  { name: 'MILK TEA', price: 140, category_id: 'cat-hot-beverage', tags: ['vegetarian'] },
  { name: 'SOMALI TEA', price: 140, category_id: 'cat-hot-beverage', tags: ['vegan', 'popular'] },
  { name: 'GREEN TEA', price: 80, category_id: 'cat-hot-beverage', tags: ['vegan', 'fasting'] },
  { name: 'ORANGE TEA', price: 120, category_id: 'cat-hot-beverage', tags: ['vegan', 'fasting'] },
  { name: 'AMERICANO COFFEE', price: 200, category_id: 'cat-hot-beverage', tags: ['vegan'] },
  { name: 'LEMON TEA', price: 80, category_id: 'cat-hot-beverage', tags: ['vegan', 'fasting'] },
  { name: 'SPRICE TEA', price: 120, category_id: 'cat-hot-beverage', tags: ['vegan'] },
  { name: 'HOT CHOCOLATE', price: 200, category_id: 'cat-hot-beverage', tags: ['vegetarian'] },
  { name: 'NANA TEA', price: 100, category_id: 'cat-hot-beverage', tags: ['vegan', 'fasting'] },
  { name: 'LIPTON TEA', price: 80, category_id: 'cat-hot-beverage', tags: ['vegan'] },

  // 8. Juice
  { name: 'AVOCADO', price: 300, category_id: 'cat-juice', tags: ['vegan', 'fasting', 'popular'], is_chefs_pick: true },
  { name: 'PAPAYA JUICE', price: 300, category_id: 'cat-juice', tags: ['vegan', 'fasting'] },
  { name: 'WATERMELON JUICE', price: 300, category_id: 'cat-juice', tags: ['vegan', 'fasting'] },
  { name: 'MANGO', price: 350, category_id: 'cat-juice', tags: ['vegan', 'fasting', 'popular'] },
  { name: 'SPRICE JUICE', price: 350, category_id: 'cat-juice', tags: ['vegan', 'fasting', 'popular'] },
  { name: 'GISHITA JUICE', price: 350, category_id: 'cat-juice', tags: ['vegan', 'fasting'] },
  { name: 'ANANAS', price: 350, category_id: 'cat-juice', tags: ['vegan', 'fasting'] },
  { name: 'ORANGE', price: 350, category_id: 'cat-juice', tags: ['vegan', 'fasting'] },
  { name: 'GINGER JUICE', price: 280, category_id: 'cat-juice', tags: ['vegan', 'fasting'] },
  { name: 'STROBERRY SHAKE', price: 280, category_id: 'cat-juice', tags: ['vegetarian'] },
  { name: 'BANANA SHAKE', price: 400, category_id: 'cat-juice', tags: ['vegetarian'] },
  { name: 'AVOCADO SHAKE', price: 400, category_id: 'cat-juice', tags: ['vegetarian'] },
  { name: 'MANGO SHAKE', price: 400, category_id: 'cat-juice', tags: ['vegetarian'] },
  { name: 'CHOCOLATE SHAKE', price: 450, category_id: 'cat-juice', tags: ['vegetarian'] },
  { name: 'Special juice', price: 450, category_id: 'cat-juice', tags: ['vegan', 'popular'], is_chefs_pick: true },

  // 9. Cold Drinks
  { name: 'ICE COFFEE', price: 200, category_id: 'cat-cold-drinks', tags: ['vegan', 'popular'] },
  { name: 'ICE LATE/AMERICANO', price: 200, category_id: 'cat-cold-drinks', tags: ['vegetarian'] },
  { name: 'MOJITO', price: 350, category_id: 'cat-cold-drinks', tags: ['vegan', 'popular'] },
  { name: 'SOFT DRINKS', price: 80, category_id: 'cat-cold-drinks', tags: ['vegan'] },
  { name: 'AMBO WATER', price: 100, category_id: 'cat-cold-drinks', tags: ['vegan', 'popular'] },
  { name: 'WATER 300ML', price: 305, category_id: 'cat-cold-drinks', tags: ['vegan'] },
  { name: 'WATER 600ML', price: 50, category_id: 'cat-cold-drinks', tags: ['vegan'] },
  { name: 'WATER 1000ML', price: 70, category_id: 'cat-cold-drinks', tags: ['vegan'] },
  { name: 'CARAMEL ICED COFFEE', price: 200, category_id: 'cat-cold-drinks', tags: ['vegetarian'] },

  // 10. Lunch and Dinner
  { name: 'Yebeg Tibs', price: 900, category_id: 'cat-lunch-dinner', tags: ['popular'], is_chefs_pick: true },
  { name: 'Rice with meat', price: 575, category_id: 'cat-lunch-dinner', tags: ['popular'] },
  { name: 'Rice with Vegetable', price: 450, category_id: 'cat-lunch-dinner', tags: ['vegan', 'fasting'] },
  { name: 'Quanta Firfir', price: 550, category_id: 'cat-lunch-dinner', tags: ['popular'] },
  { name: 'Shiro with Butter', price: 400, category_id: 'cat-lunch-dinner', tags: ['vegetarian', 'popular'] },
  { name: 'Smart shiro', price: 400, category_id: 'cat-lunch-dinner', tags: ['vegetarian'] },
  { name: 'Pasta with Vegetable', price: 450, category_id: 'cat-lunch-dinner', tags: ['vegan', 'fasting'] },
  { name: 'Pasta with meat', price: 575, category_id: 'cat-lunch-dinner', tags: ['popular'] },
  { name: 'Pasta with tomato', price: 400, category_id: 'cat-lunch-dinner', tags: ['vegan', 'fasting'] },
  { name: 'Doro Tibs', price: 800, category_id: 'cat-lunch-dinner', tags: ['popular'], is_chefs_pick: true },
  { name: 'Vigitable sup', price: 300, category_id: 'cat-lunch-dinner', tags: ['vegan', 'fasting'] },
  { name: 'Chikina Tibs', price: 900, category_id: 'cat-lunch-dinner', tags: ['popular'], is_chefs_pick: true },
  { name: 'Tibs Tefersho', price: 700, category_id: 'cat-lunch-dinner', tags: ['popular'] },
  { name: 'Yebeg Keywot', price: 700, category_id: 'cat-lunch-dinner', tags: ['popular'] },
  { name: 'Agelegil', price: 900, category_id: 'cat-lunch-dinner', tags: ['popular'], is_chefs_pick: true },
  { name: 'Gomen Besiga', price: 700, category_id: 'cat-lunch-dinner', tags: ['popular'] },
  { name: 'Grilled Fish', price: 850, category_id: 'cat-lunch-dinner', tags: ['popular'] },

  // 11. Mendi
  { name: 'Mofo', price: 700, category_id: 'cat-mendi', tags: ['popular'] },
  { name: 'Special Mendi', price: 2000, category_id: 'cat-mendi', tags: ['popular'], is_chefs_pick: true },
  { name: 'Mend 1/2', price: 900, category_id: 'cat-mendi', tags: ['popular'] },
  { name: 'Mend Full', price: 1800, category_id: 'cat-mendi', tags: ['popular'], is_chefs_pick: true },
  { name: '1/2 Roasted Chicken', price: 1098, category_id: 'cat-mendi', tags: ['popular'] },
  { name: 'Roasted Chicken Full', price: 1900, category_id: 'cat-mendi', tags: ['popular'], is_chefs_pick: true },

  // 12. Half Half
  { name: 'Keywot and Fitfit', price: 790, category_id: 'cat-half-half', tags: ['popular'], is_chefs_pick: true },
  { name: 'Tibs and Fitfit', price: 900, category_id: 'cat-half-half', tags: ['popular'], is_chefs_pick: true },
  { name: 'Cooked Vegs and Aja', price: 600, category_id: 'cat-half-half', tags: ['vegan', 'fasting'] },

  // 13. Wraps
  { name: 'Tuna Sandwich', price: 600, category_id: 'cat-wraps', tags: ['popular'] },
  { name: 'Beef Shewarema', price: 699, category_id: 'cat-wraps', tags: ['popular'], is_chefs_pick: true },
  { name: 'Chicken Shewarma', price: 600, category_id: 'cat-wraps', tags: ['popular'] },

  // 14. Fasting Lunch
  { name: 'Shiro', price: 350, category_id: 'cat-fasting-lunch', tags: ['vegan', 'fasting', 'popular'] },
  { name: 'Beyaynetu', price: 500, category_id: 'cat-fasting-lunch', tags: ['vegan', 'fasting', 'popular'], is_chefs_pick: true },
  { name: 'Fasting Agelegil', price: 600, category_id: 'cat-fasting-lunch', tags: ['vegan', 'fasting', 'popular'] },
  { name: 'Suf fitfit', price: 350, category_id: 'cat-fasting-lunch', tags: ['vegan', 'fasting'] },
  { name: 'Addis special Salad', price: 400, category_id: 'cat-fasting-lunch', tags: ['vegan', 'fasting'] },
  { name: 'Aja with spinach', price: 400, category_id: 'cat-fasting-lunch', tags: ['vegan', 'fasting'] },

  // 15. Takeaway & Extras
  { name: 'Takeaway', price: 50, category_id: 'cat-takeaway-extras', tags: [] },
  { name: 'Pizza takeaway', price: 100, category_id: 'cat-takeaway-extras', tags: [] },
  { name: 'Extra cheese', price: 100, category_id: 'cat-takeaway-extras', tags: ['vegetarian'] },
];

const imageByDishId = new Map(MOCK_ITEMS_ADDIS.map((item) => [item.id, item.image_url]));

function getImageForDish(category_id: string, name: string, id?: string): string {
  if (id && imageByDishId.has(id)) {
    return imageByDishId.get(id)!;
  }
  const match = MOCK_ITEMS_ADDIS.find((item) => item.name.toLowerCase() === name.toLowerCase());
  if (match) return match.image_url;
  return '/images/dishes/special-burger.jpg';
}

async function run() {
  console.log('🚀 Starting Exact Menu Sync with Supabase Database...');

  // 1. Update restaurant default_table to "Table 1"
  console.log('1. Updating restaurant default_table to "Table 1"...');
  const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/restaurants?id=eq.${RESTAURANT_ID}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      default_table: 'Table 1',
      tax_rate: 0.15,
      tax_mode: 'exclusive',
      currency: 'ETB',
      currency_code: 'ETB',
    }),
  });
  console.log('   Restaurant update status:', patchRes.status);

  // 2. Clear old items completely
  console.log('2. Clearing old items from Supabase items table...');
  const delItemsRes = await fetch(`${SUPABASE_URL}/rest/v1/items?restaurant_id=eq.${RESTAURANT_ID}`, {
    method: 'DELETE',
    headers,
  });
  console.log('   Items deleted status:', delItemsRes.status);

  // 3. Clear old categories
  console.log('3. Clearing old categories from Supabase categories table...');
  const delCatsRes = await fetch(`${SUPABASE_URL}/rest/v1/categories?restaurant_id=eq.${RESTAURANT_ID}`, {
    method: 'DELETE',
    headers,
  });
  console.log('   Categories deleted status:', delCatsRes.status);

  // 4. Insert exact 15 categories
  console.log('4. Inserting 15 official categories...');
  const catPayload = CATEGORIES_DATA.map((c) => ({
    id: c.id,
    restaurant_id: RESTAURANT_ID,
    name: c.name,
    name_am: c.name_am,
    icon: c.icon,
    description: c.description,
    sort_order: c.sort_order,
    is_active: true,
  }));

  const insCatsRes = await fetch(`${SUPABASE_URL}/rest/v1/categories`, {
    method: 'POST',
    headers,
    body: JSON.stringify(catPayload),
  });
  console.log('   Categories insert status:', insCatsRes.status);

  // 5. Insert exact dishes
  console.log(`5. Inserting ${DISHES_DATA.length} official dishes with exact ETB prices...`);
  const itemsPayload = DISHES_DATA.map((dish, idx) => {
    const slug = dish.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = `item-${slug}-${idx + 1}`;
    return {
      id,
      restaurant_id: RESTAURANT_ID,
      category_id: dish.category_id,
      name: dish.name,
      price: dish.price,
      description: `${dish.name} prepared freshly at Addis Cafeteria with authentic premium ingredients.`,
      image_url: getImageForDish(dish.category_id, dish.name, id),
      tags: dish.tags || [],
      allergens: [],
      spice_level: dish.name.toLowerCase().includes('tibs') ? 2 : 0,
      is_available: true,
      is_chefs_pick: dish.is_chefs_pick ?? false,
      sort_order: idx + 1,
    };
  });

  // Batch insert in chunks of 50 to avoid request body limits
  for (let i = 0; i < itemsPayload.length; i += 50) {
    const chunk = itemsPayload.slice(i, i + 50);
    const insItemsRes = await fetch(`${SUPABASE_URL}/rest/v1/items`, {
      method: 'POST',
      headers,
      body: JSON.stringify(chunk),
    });
    console.log(`   Batch ${Math.floor(i / 50) + 1} (${chunk.length} items) status:`, insItemsRes.status);
    if (!insItemsRes.ok) {
      console.error('Error payload:', await insItemsRes.text());
    }
  }

  // 6. Fix Offers in Supabase so no offer reduces random items to 0 ETB!
  console.log('6. Updating Offers in Supabase to prevent 0 ETB anomalies...');
  // Find "Addis Sourdough Truffle Burrata Combo (40 ETB Off)" and scope it strictly to Special Fetira or pause it
  const updateOffer1 = await fetch(`${SUPABASE_URL}/rest/v1/offers?restaurant_id=eq.${RESTAURANT_ID}&discount_type=eq.fixed_amount`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      is_active: false, // deactivate fixed amount 40 ETB off so dishes don't show 0 ETB
      target_item_ids: [],
      target_category_ids: [],
    }),
  });
  console.log('   Deactivated blanket fixed 40 ETB offer status:', updateOffer1.status);

  // Target pizza discount strictly to cat-pizzas
  const updatePizzaOffer = await fetch(`${SUPABASE_URL}/rest/v1/offers?restaurant_id=eq.${RESTAURANT_ID}&discount_type=eq.percentage`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      is_active: true,
      target_category_ids: ['cat-pizzas'],
      target_item_ids: [],
    }),
  });
  console.log('   Scoped pizza offer to cat-pizzas status:', updatePizzaOffer.status);

  console.log('✅ Supabase database synchronized successfully!');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
