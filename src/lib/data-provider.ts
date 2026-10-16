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
  default_table: 'Table 14',
  hours: 'Mon – Sun: 6:30 AM – 11:00 PM',
  address: 'Bole Medhanealem, Addis Ababa, Ethiopia',
  announcement: '✨ Welcome to Addis Cafeteria & Bakery! Fresh injera, sizzling tibs, and artisanal pastries daily.',
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
    defaultMode: 'auto',
    defaultLayout: 'list',
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
    id: 'cat-breakfast',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    name: 'Breakfast (ቁርስ)',
    name_es: 'Desayuno Etíope',
    icon: '🍳',
    description: 'Traditional morning favorites: fetira, spiced ful, and chechebisa.',
    description_es: 'Desayunos tradicionales: fetira, ful y chechebisa.',
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'cat-lunch-dinner',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    name: 'Lunch & Dinner (ምሳ እና እራት)',
    name_es: 'Almuerzo & Cena',
    icon: '🥘',
    description: 'Sizzling tibs, slow-simmered wots, rich firfir, and Italian pastas.',
    description_es: 'Tibs chisporroteantes, wots tradicionales, firfir y pastas italianas.',
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'cat-half-half',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    name: 'Half Half (ግማሽ በግማሽ)',
    name_es: 'Mitad y Mitad',
    icon: '🍲',
    description: 'Two classic signature dishes served side by side on fresh teff injera.',
    description_es: 'Dos platos emblemáticos servidos uno al lado del otro.',
    sort_order: 3,
    is_active: true,
  },
  {
    id: 'cat-fasting',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    name: 'Fasting Lunch (የፆም ምግብ)',
    name_es: 'Comida de Ayuno (Vegano)',
    icon: '🥬',
    description: '100% plant-based delicacies: grand Beyaynetu, shiro, and fresh salads.',
    description_es: 'Platos 100% vegetales: Beyaynetu, shiro y ensaladas.',
    sort_order: 4,
    is_active: true,
  },
  {
    id: 'cat-mendi',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    name: 'Mendi (መንዲ)',
    name_es: 'Mendi & Asados',
    icon: '🍗',
    description: 'Slow-roasted fall-off-the-bone lamb and chicken over spiced basmati rice.',
    description_es: 'Cordero y pollo asados a fuego lento sobre arroz basmati.',
    sort_order: 5,
    is_active: true,
  },
  {
    id: 'cat-burgers',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    name: 'Burgers & Shawarma (በርገር)',
    name_es: 'Hamburguesas & Shawarma',
    icon: '🍔',
    description: 'Handcrafted beef patties, crispy chicken, and rotisserie shawarma.',
    description_es: 'Hamburguesas artesanales de res y pollo, y shawarma.',
    sort_order: 6,
    is_active: true,
  },
  {
    id: 'cat-woodfired',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    name: 'Pizzas (ፒዛ)',
    name_es: 'Pizzas al Horno',
    icon: '🍕',
    description: 'Hand-stretched sourdough pizzas baked with mozzarella and fresh toppings.',
    description_es: 'Pizzas de masa madre fermentada con mozzarella fresca.',
    sort_order: 7,
    is_active: true,
  },
  {
    id: 'cat-snacks',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    name: 'Snack Menu (ስናክ)',
    name_es: 'Aperitivos & Snacks',
    icon: '🍟',
    description: 'Crispy calamari, chicken tenders, golden wings, fish & chips, and fries.',
    description_es: 'Calamares crujientes, tenders, alitas doradas y patatas fritas.',
    sort_order: 8,
    is_active: true,
  },
  {
    id: 'cat-drinks',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    name: 'Addis Cafe (ትኩስ መጠጦች)',
    name_es: 'Bebidas Calientes & Café',
    icon: '☕',
    description: 'Ethiopian single-origin Buna, velvety macchiato, and spiced teas.',
    description_es: 'Café de origen etíope recién tostado y macchiato.',
    sort_order: 9,
    is_active: true,
  },
  {
    id: 'cat-juices',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    name: 'Fresh Juices & Drinks (ትኩስ ጭማቂዎች)',
    name_es: 'Jugos Frescos & Batidos',
    icon: '🥑',
    description: '100% natural fruit purées, famous layered Spris, and milkshakes.',
    description_es: 'Purés naturales de frutas, el emblemático Spris y batidos.',
    sort_order: 10,
    is_active: true,
  },
  {
    id: 'cat-desserts',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    name: 'Addis Bakery (መጋገሪያ)',
    name_es: 'Panadería & Repostería',
    icon: '🍰',
    description: 'Daily baked cakes, flaky croissants, sweet basbousa, and breads.',
    description_es: 'Pasteles recién horneados, croissants y panes tradicionales.',
    sort_order: 11,
    is_active: true,
  },
];

export const MOCK_ITEMS_ADDIS: MenuItem[] = [
  // ==========================================
  // 1. BREAKFAST (ቁርስ)
  // ==========================================
  {
    id: 'item-fetira',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-breakfast',
    name: 'Fetira (ፋቲራ)',
    name_es: 'Fetira Tradicional',
    description: 'Crisp, layered pan-fried flatbread cooked with fresh egg and served with a side of spiced berbere honey.',
    description_es: 'Pan plano crujiente en capas preparado con huevo fresco y miel especiada.',
    price: 300,
    image_url: '/images/dishes/special-fetira.jpg',
    tags: ['popular', 'vegetarian'],
    allergens: ['Gluten', 'Egg'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 1,
  },
  {
    id: 'item-special-fetira',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-breakfast',
    name: 'Special Fetira (ስፔሻል ፋቲራ)',
    name_es: 'Fetira Especial con Miel y Plátano',
    description: 'Golden-crisp layered pastry stuffed with scrambled eggs, drizzled with sweet mountain honey and fresh sliced bananas.',
    description_es: 'Hojaldre crujiente relleno de huevo, bañado con miel pura de montaña y rodajas de plátano.',
    price: 450,
    image_url: '/images/dishes/special-fetira.jpg',
    tags: ['chefsPick', 'popular', 'vegetarian'],
    allergens: ['Gluten', 'Egg'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: true,
    sort_order: 2,
  },
  {
    id: 'item-feta-honey-banana',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-breakfast',
    name: 'Fetira with Honey & Banana',
    name_es: 'Fetira con Miel y Plátano',
    description: 'Sweet breakfast pastry pan-seared to golden perfection, finished with pure acacia honey and fresh banana.',
    description_es: 'Pastel dulce de desayuno dorado a la sartén con miel de acacia y plátano.',
    price: 450,
    image_url: '/images/dishes/special-fetira.jpg',
    tags: ['vegetarian'],
    allergens: ['Gluten'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 3,
  },
  {
    id: 'item-ful-normal',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-breakfast',
    name: 'Ful Normal (ፉል)',
    name_es: 'Ful Medames Clásico',
    description: 'Slow-simmered spiced fava bean stew seasoned with ground cumin, garlic, olive oil, and diced red tomatoes, served with warm crusty bread.',
    description_es: 'Guiso de habas cocidas a fuego lento con comino, ajo, aceite de oliva y tomates, con pan caliente.',
    price: 280,
    image_url: '/images/dishes/ful-special.jpg',
    tags: ['vegan', 'fasting', 'popular'],
    allergens: ['Gluten'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 4,
  },
  {
    id: 'item-ful-special',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-breakfast',
    name: 'Ful Special (ስፔሻል ፉል)',
    name_es: 'Ful Medames Especial',
    description: 'Hearty fava bean purée topped with hard-boiled egg, fresh diced tomatoes, red onions, green jalapeño chili, feta cheese, and olive oil, served with warm rolls.',
    description_es: 'Puré de habas coronado con huevo duro, tomates picados, cebolla morada, queso feta y aceite de oliva.',
    price: 575,
    image_url: '/images/dishes/ful-special.jpg',
    tags: ['chefsPick', 'popular', 'vegetarian'],
    allergens: ['Gluten', 'Egg', 'Dairy'],
    spice_level: 1,
    is_available: true,
    is_chefs_pick: true,
    sort_order: 5,
  },
  {
    id: 'item-addis-combo-breakfast',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-breakfast',
    name: 'Addis Combo Breakfast',
    name_es: 'Desayuno Combinado Addis',
    description: 'Grand morning feast featuring scrambled country eggs, spiced ful, chechebisa with honey, and freshly baked artisanal bread.',
    description_es: 'Gran desayuno matutino con huevos revueltos, ful especiado, chechebisa con miel y pan artesanal.',
    price: 750,
    image_url: '/images/dishes/chechebisa.jpg',
    tags: ['chefsPick', 'popular'],
    allergens: ['Gluten', 'Egg', 'Dairy'],
    spice_level: 1,
    is_available: true,
    is_chefs_pick: true,
    sort_order: 6,
  },
  {
    id: 'item-scrambled-eggs',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-breakfast',
    name: 'Scrambled Eggs (እንቁላል ፍርፍር)',
    name_es: 'Huevos Revueltos',
    description: 'Fresh country eggs scrambled with diced tomatoes, onions, and mild jalapeño peppers, served with toasted bread.',
    description_es: 'Huevos frescos de campo revueltos con tomates, cebollas y pimientos verdes, con pan tostado.',
    price: 300,
    image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
    tags: ['vegetarian'],
    allergens: ['Egg', 'Gluten'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 7,
  },
  {
    id: 'item-omelet',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-breakfast',
    name: 'Omelet (ኦምሌት)',
    name_es: 'Omelette Francés',
    description: 'Three-egg folded golden omelet with melted cheddar cheese, sautéed bell peppers, and fresh chives.',
    description_es: 'Omelette doblado de tres huevos con queso cheddar derretido y hierbas frescas.',
    price: 350,
    image_url: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=600&q=80',
    tags: ['vegetarian'],
    allergens: ['Egg', 'Dairy', 'Gluten'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 8,
  },
  {
    id: 'item-avocado-toast',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-breakfast',
    name: 'Avocado Toast (አቮካዶ ቶስት)',
    name_es: 'Tostada de Aguacate',
    description: 'Toasted artisanal crusty bread generously spread with freshly mashed ripe avocado, cherry tomatoes, and cold-pressed olive oil.',
    description_es: 'Pan rústico tostado con aguacate fresco machacado, tomates cherry y aceite de oliva virgen.',
    price: 350,
    image_url: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?auto=format&fit=crop&w=600&q=80',
    tags: ['vegan', 'fasting', 'healthy'],
    allergens: ['Gluten'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 9,
  },
  {
    id: 'item-chechebisa-fasting',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-breakfast',
    name: 'Chechebisa Fasting (የፆም ጨጨብሳ)',
    name_es: 'Chechebisa de Ayuno',
    description: 'Torn pieces of Ethiopian flatbread (kita) pan-fried in pure sunflower oil and fragrant berbere spice blend.',
    description_es: 'Trozos de pan plano kita salteados en aceite vegetal y mezcla aromática de berbere.',
    price: 300,
    image_url: '/images/dishes/chechebisa.jpg',
    tags: ['vegan', 'fasting'],
    allergens: ['Gluten'],
    spice_level: 1,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 10,
  },
  {
    id: 'item-chechebisa-butter-honey',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-breakfast',
    name: 'Chechebisa with Butter & Honey (ጨጨብሳ በቅቤ እና ማር)',
    name_es: 'Chechebisa con Mantequilla y Miel',
    description: 'Pan-fried shredded kita flatbread tossed in aromatic spiced clarified butter (niter kibbeh) and berbere, drizzled with golden amber honey.',
    description_es: 'Pan plano kita desmenuzado en mantequilla clarificada especiada y berbere, con miel dorada.',
    price: 400,
    image_url: '/images/dishes/chechebisa.jpg',
    tags: ['chefsPick', 'popular', 'vegetarian'],
    allergens: ['Gluten', 'Dairy'],
    spice_level: 1,
    is_available: true,
    is_chefs_pick: true,
    sort_order: 11,
  },
  {
    id: 'item-chechebisa-teff',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-breakfast',
    name: 'Chechebisa Teff (የጤፍ ጨጨብሳ)',
    name_es: 'Chechebisa de Teff',
    description: 'Traditional morning kita made from 100% whole grain brown teff flour, tossed in spiced butter and honey.',
    description_es: 'Kita tradicional de harina de teff 100% integral salteado en mantequilla especiada y miel.',
    price: 400,
    image_url: '/images/dishes/chechebisa.jpg',
    tags: ['gluten-free', 'healthy'],
    allergens: ['Dairy'],
    spice_level: 1,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 12,
  },
  {
    id: 'item-siga-firfir',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-breakfast',
    name: 'Siga Firfir (የስጋ ፍርፍር)',
    name_es: 'Firfir con Carne',
    description: 'Tender beef cubes braised in savory red berbere gravy, thoroughly tossed with shredded fresh teff injera rolls.',
    description_es: 'Dados de carne tierna en salsa berbere sofrita con injera desmenuzada.',
    price: 500,
    image_url: '/images/dishes/quanta-firfir.jpg',
    tags: ['spicy', 'halal'],
    allergens: [],
    spice_level: 2,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 13,
  },
  {
    id: 'item-injera-firfir',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-breakfast',
    name: 'Injera Firfir (የእንጀራ ፍርፍር)',
    name_es: 'Firfir de Injera',
    description: 'Fresh rolls of sourdough teff injera torn and simmered in a spiced tomato, red onion, garlic, and berbere sauce.',
    description_es: 'Injera de teff en salsa de tomate, cebolla roja, ajo y berbere.',
    price: 350,
    image_url: '/images/dishes/quanta-firfir.jpg',
    tags: ['vegan', 'fasting', 'spicy'],
    allergens: [],
    spice_level: 1,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 14,
  },
  {
    id: 'item-burrata',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-breakfast',
    name: 'Truffle Burrata & Feta Flatbread',
    name_es: 'Pan Plano con Burrata y Feta',
    description: 'Creamy burrata and tangy feta cheese on warm hearth-baked flatbread, with heirloom cherry tomatoes, olive oil, and fresh oregano.',
    description_es: 'Burrata cremosa y queso feta sobre pan plano horneado, con tomates y aceite de oliva.',
    price: 350,
    image_url: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=600&q=80',
    tags: ['vegetarian', 'chefsPick'],
    allergens: ['Dairy', 'Gluten'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: true,
    sort_order: 15,
  },

  // ==========================================
  // 2. LUNCH AND DINNER (ምሳ እና እራት)
  // ==========================================
  {
    id: 'item-yebeg-tibs',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-lunch-dinner',
    name: 'Yebeg Tibs (የበግ ጥብስ)',
    name_es: 'Tibs de Cordero',
    description: 'Sizzling tender cubed lamb pan-seared with fresh rosemary sprigs, sliced red onions, garlic, and jalapeños in spiced niter kibbeh butter. Served with fresh teff injera.',
    description_es: 'Dados de cordero salteados con romero fresco, cebolla roja, ajo y jalapeños en mantequilla especiada. Servido con injera.',
    price: 900,
    image_url: '/images/dishes/yebeg-tibs.jpg',
    tags: ['chefsPick', 'popular', 'halal'],
    allergens: ['Dairy'],
    spice_level: 1,
    is_available: true,
    is_chefs_pick: true,
    sort_order: 16,
  },
  {
    id: 'item-chikina-tibs',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-lunch-dinner',
    name: 'Chikina Tibs (የጭከና ጥብስ)',
    name_es: 'Tibs de Solomillo Prime',
    description: 'Prime beef tenderloin strips flash-seared with caramelized onions, green peppers, and rich awaze paste, served on hot ironware.',
    description_es: 'Tiras de solomillo de res salteadas a fuego vivo con cebolla caramelizada, pimientos y awaze.',
    price: 900,
    image_url: '/images/dishes/yebeg-tibs.jpg',
    tags: ['popular', 'halal'],
    allergens: ['Dairy'],
    spice_level: 2,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 17,
  },
  {
    id: 'item-doro-tibs',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-lunch-dinner',
    name: 'Doro Tibs (የዶሮ ጥብስ)',
    name_es: 'Tibs de Pollo',
    description: 'Juicy boneless chicken breast cubes sautéed with sliced onions, garlic, fresh ginger, and mild green chilies.',
    description_es: 'Trozos de pechuga de pollo salteados con cebolla, ajo, jengibre y chiles verdes suaves.',
    price: 800,
    image_url: '/images/dishes/yebeg-tibs.jpg',
    tags: ['halal'],
    allergens: ['Dairy'],
    spice_level: 1,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 18,
  },
  {
    id: 'item-tibs-tefersho',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-lunch-dinner',
    name: 'Tibs Tefersho (ጥብስ ተፈርሾ)',
    name_es: 'Tibs Tefersho Tradicional',
    description: 'Pan-fried seasoned beef strips tossed over a soft bed of rolled teff injera drenched in savory pan juices.',
    description_es: 'Tiras de carne sazonadas servidas sobre injera caliente bañada en sus jugos de cocción.',
    price: 700,
    image_url: '/images/dishes/yebeg-tibs.jpg',
    tags: ['popular', 'halal'],
    allergens: ['Dairy'],
    spice_level: 1,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 19,
  },
  {
    id: 'item-yebeg-keywot',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-lunch-dinner',
    name: 'Yebeg Keywot (የበግ ቀይ ወጥ)',
    name_es: 'Guiso de Cordero en Salsa Berbere',
    description: 'Hearty slow-cooked lamb stew simmered in deep burgundy berbere gravy infused with ginger, garlic, and served with a hard-boiled egg.',
    description_es: 'Estofado de cordero a fuego lento en salsa berbere con jengibre, ajo y huevo duro.',
    price: 700,
    image_url: '/images/dishes/yebeg-keywot.jpg',
    tags: ['spicy', 'halal', 'popular'],
    allergens: ['Egg'],
    spice_level: 2,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 20,
  },
  {
    id: 'item-gomen-besiga',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-lunch-dinner',
    name: 'Gomen Besiga (ጎመን በስጋ)',
    name_es: 'Gomen con Carne de Res',
    description: 'Tender beef morsels braised with fresh collard greens, garlic, ginger, and spiced Ethiopian butter.',
    description_es: 'Dados de res tiernos estofados con hojas de berza fresca, ajo y mantequilla especiada.',
    price: 700,
    image_url: '/images/dishes/yebeg-keywot.jpg',
    tags: ['halal'],
    allergens: ['Dairy'],
    spice_level: 1,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 21,
  },
  {
    id: 'item-agelegil',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-lunch-dinner',
    name: 'Agelegil (አገልግል)',
    name_es: 'Banquete Agelegil',
    description: 'Traditional feast in a leather-bound basket: layers of injera with lamb tibs, keywot, doro wat, ayib cottage cheese, and gomen greens.',
    description_es: 'Banquete en cesta artesanal: capas de injera con tibs de cordero, keywot, queso ayib y gomen.',
    price: 900,
    image_url: '/images/dishes/beyaynetu.jpg',
    tags: ['chefsPick', 'popular'],
    allergens: ['Dairy', 'Egg'],
    spice_level: 2,
    is_available: true,
    is_chefs_pick: true,
    sort_order: 22,
  },
  {
    id: 'item-quanta-firfir',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-lunch-dinner',
    name: 'Quanta Firfir (የቋንጣ ፍርፍር)',
    name_es: 'Firfir con Carne Seca Quanta',
    description: 'Sun-dried cured beef strips stewed in fiery red berbere sauce, tossed and soaked with rolled teff injera. Garnished with boiled egg and green chili.',
    description_es: 'Carne deshidratada curada al sol en salsa de berbere especiada con injera desmenuzada y huevo duro.',
    price: 550,
    image_url: '/images/dishes/quanta-firfir.jpg',
    tags: ['popular', 'spicy'],
    allergens: ['Egg'],
    spice_level: 2,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 23,
  },
  {
    id: 'item-shiro-butter',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-lunch-dinner',
    name: 'Shiro with Butter (ሽሮ በቅቤ)',
    name_es: 'Shiro con Mantequilla Especiada',
    description: 'Smooth, golden-orange ground chickpea stew bubbling hot in a clay tagamino pot, enriched with aromatic niter kibbeh butter.',
    description_es: 'Guiso cremoso de garbanzos molidos servido burbujeante en cazuela de barro con mantequilla clarificada.',
    price: 400,
    image_url: '/images/dishes/shiro.jpg',
    tags: ['vegetarian', 'popular'],
    allergens: ['Dairy'],
    spice_level: 1,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 24,
  },
  {
    id: 'item-smart-shiro',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-lunch-dinner',
    name: 'Smart Shiro (ስማርት ሽሮ)',
    name_es: 'Smart Shiro Especial',
    description: 'Chef’s signature tagamino shiro infused with minced sautéed garlic, jalapeño rings, and spiced mountain butter.',
    description_es: 'Shiro especial de la casa con ajo salteado, aros de jalapeño y mantequilla de montaña.',
    price: 400,
    image_url: '/images/dishes/shiro.jpg',
    tags: ['vegetarian', 'chefsPick'],
    allergens: ['Dairy'],
    spice_level: 1,
    is_available: true,
    is_chefs_pick: true,
    sort_order: 25,
  },
  {
    id: 'item-rice-meat',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-lunch-dinner',
    name: 'Rice with Meat (ሩዝ በስጋ)',
    name_es: 'Arroz con Carne',
    description: 'Fragrant basmati rice gently spiced and topped with succulent seasoned beef chunks and caramelized onions.',
    description_es: 'Arroz basmati perfumado con trozos de res sazonada y cebollas caramelizadas.',
    price: 575,
    image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80',
    tags: ['halal'],
    allergens: [],
    spice_level: 1,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 26,
  },
  {
    id: 'item-rice-vegetable',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-lunch-dinner',
    name: 'Rice with Vegetable (ሩዝ በአትክልት)',
    name_es: 'Arroz con Vegetales',
    description: 'Fluffy basmati rice tossed with garden sweet peas, diced carrots, corn, and fresh herbs.',
    description_es: 'Arroz basmati salteado con guisantes, zanahorias, maíz dulce y hierbas frescas.',
    price: 450,
    image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80',
    tags: ['vegan', 'fasting'],
    allergens: [],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 27,
  },
  {
    id: 'item-pasta-meat',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-lunch-dinner',
    name: 'Pasta with Meat (ፓስታ በስጋ)',
    name_es: 'Pasta Boloñesa Clásica',
    description: 'Addis Ababa Italian heritage spaghetti coated in a rich, slow-cooked minced beef tomato bolognese sauce.',
    description_es: 'Espaguetis estilo Addis con salsa boloñesa de carne picada cocinada a fuego lento.',
    price: 575,
    image_url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',
    tags: ['popular', 'halal'],
    allergens: ['Gluten'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 28,
  },
  {
    id: 'item-pasta-tomato',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-lunch-dinner',
    name: 'Pasta with Tomato (ፓስታ በቲማቲም)',
    name_es: 'Pasta con Tomate y Albahaca',
    description: 'Al dente spaghetti tossed with fresh garlic, sweet plum tomatoes, basil, and extra virgin olive oil.',
    description_es: 'Espaguetis al dente con ajo fresco, salsa de tomate natural y albahaca.',
    price: 400,
    image_url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',
    tags: ['vegan', 'fasting'],
    allergens: ['Gluten'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 29,
  },
  {
    id: 'item-pasta-vegetable',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-lunch-dinner',
    name: 'Pasta with Vegetable (ፓስታ በአትክልት)',
    name_es: 'Pasta Primavera',
    description: 'Spaghetti with sautéed zucchini, bell peppers, carrots, and sweet onions in light olive oil.',
    description_es: 'Espaguetis con calabacín, pimientos, zanahorias y cebolla en aceite de oliva.',
    price: 450,
    image_url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',
    tags: ['vegan', 'fasting'],
    allergens: ['Gluten'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 30,
  },
  {
    id: 'item-vigitable-sup',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-lunch-dinner',
    name: 'Vigitable Sup (የአትክልት ሾርባ)',
    name_es: 'Sopa Caliente de Vegetales',
    description: 'Soothing, hot garden vegetable soup made with leeks, carrots, potatoes, and fragrant herbs.',
    description_es: 'Sopa caliente de verduras de la huerta con puerros, zanahorias y patatas.',
    price: 300,
    image_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
    tags: ['vegan', 'fasting', 'healthy'],
    allergens: [],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 31,
  },
  {
    id: 'item-grilled-fish',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-lunch-dinner',
    name: 'Grilled Fish (የተጠበሰ አሳ)',
    name_es: 'Pescado Entero a la Parrilla',
    description: 'Whole fresh lake fish marinated with garlic, lemon juice, and rosemary, flame-grilled until tender and crispy.',
    description_es: 'Pescado fresco marinado con ajo, limón y romero, asado a la parrilla hasta dorar.',
    price: 850,
    image_url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
    tags: ['pescatarian', 'fasting', 'healthy'],
    allergens: ['Seafood'],
    spice_level: 1,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 32,
  },

  // ==========================================
  // 3. HALF HALF (ግማሽ በግማሽ)
  // ==========================================
  {
    id: 'item-half-keywot-fitfit',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-half-half',
    name: 'Keywot & Fitfit (ቀይ ወጥ እና ፍርፍር)',
    name_es: 'Keywot y Fitfit Combinado',
    description: 'Spicy slow-cooked beef Keywot paired side by side with richly seasoned berbere-soaked injera fitfit.',
    description_es: 'Keywot de res especiado servido junto a fitfit de injera en salsa berbere.',
    price: 790,
    image_url: '/images/dishes/yebeg-keywot.jpg',
    tags: ['popular', 'spicy'],
    allergens: [],
    spice_level: 2,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 33,
  },
  {
    id: 'item-half-tibs-fitfit',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-half-half',
    name: 'Tibs & Fitfit (ጥብስ እና ፍርፍር)',
    name_es: 'Tibs y Fitfit Combinado',
    description: 'Sizzling rosemary beef tibs and saucy injera firfir plated together for the ultimate indulgence.',
    description_es: 'Tibs de res chisporroteantes al romero combinados con firfir jugoso.',
    price: 900,
    image_url: '/images/dishes/yebeg-tibs.jpg',
    tags: ['chefsPick', 'popular'],
    allergens: ['Dairy'],
    spice_level: 1,
    is_available: true,
    is_chefs_pick: true,
    sort_order: 34,
  },
  {
    id: 'item-half-veg-aja',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-half-half',
    name: 'Cooked Vegetables & Aja (የበሰለ አትክልት እና አጃ)',
    name_es: 'Vegetales Cocidos con Aja',
    description: 'Healthy harmony of sautéed garden vegetables and wholesome Ethiopian whole grain aja.',
    description_es: 'Combinación saludable de verduras salteadas y grano entero aja etíope.',
    price: 600,
    image_url: '/images/dishes/beyaynetu.jpg',
    tags: ['vegan', 'fasting', 'healthy'],
    allergens: [],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 35,
  },

  // ==========================================
  // 4. FASTING LUNCH (የፆም ምግብ)
  // ==========================================
  {
    id: 'item-beyaynetu',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-fasting',
    name: 'Beyaynetu (የፆም በያይነቱ)',
    name_es: 'Banquete Vegetariano Beyaynetu',
    description: 'Traditional Ethiopian vegetarian feast: misir wot (spiced red lentils), kik alicha (yellow split peas), gomen (braised greens), shiro, atkilt wot (cabbage, potato, carrots), and beetroot salad on teff injera.',
    description_es: 'Festín vegetariano etíope con lentejas misir, guisantes kik, gomen, shiro y ensalada sobre injera.',
    price: 500,
    image_url: '/images/dishes/beyaynetu.jpg',
    tags: ['vegan', 'fasting', 'chefsPick', 'popular'],
    allergens: [],
    spice_level: 1,
    is_available: true,
    is_chefs_pick: true,
    sort_order: 36,
  },
  {
    id: 'item-fasting-agelegil',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-fasting',
    name: 'Fasting Agelegil (የፆም አገልግል)',
    name_es: 'Agelegil de Ayuno',
    description: 'Traditional woven basket loaded with fasting stews, rolled injera, and fresh jalapeños.',
    description_es: 'Cesta artesanal con guisos vegetarianos variados y rollos de injera.',
    price: 600,
    image_url: '/images/dishes/beyaynetu.jpg',
    tags: ['vegan', 'fasting'],
    allergens: [],
    spice_level: 1,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 37,
  },
  {
    id: 'item-shiro-fasting',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-fasting',
    name: 'Shiro Fasting (የፆም ሽሮ)',
    name_es: 'Shiro de Ayuno',
    description: 'Bubbling clay pot of spiced chickpea stew simmered with vegetable oil, onions, and fresh jalapeños.',
    description_es: 'Shiro aromático de garbanzos cocinado en cazuela de barro con aceite vegetal.',
    price: 350,
    image_url: '/images/dishes/shiro.jpg',
    tags: ['vegan', 'fasting', 'popular'],
    allergens: [],
    spice_level: 1,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 38,
  },
  {
    id: 'item-suf-fitfit',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-fasting',
    name: 'Suf Fitfit (የሱፍ ፍትፍት)',
    name_es: 'Suf Fitfit de Semillas de Girasol',
    description: 'Chilled rolls of teff injera soaked in silky fresh sunflower seed milk infused with onions, garlic, and green chili.',
    description_es: 'Injera empapada en leche natural de semillas de girasol con cebolla y chile verde.',
    price: 350,
    image_url: '/images/dishes/quanta-firfir.jpg',
    tags: ['vegan', 'fasting'],
    allergens: [],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 39,
  },
  {
    id: 'item-addis-salad',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-fasting',
    name: 'Addis Special Salad (የአዲስ ሰላጣ)',
    name_es: 'Ensalada Especial Addis',
    description: 'Crisp lettuce, ripe diced tomatoes, cucumber slices, red onions, and jalapeños tossed in cold-pressed lemon vinaigrette.',
    description_es: 'Lechuga crujiente, tomates maduros, pepino, cebolla morada y vinagreta de limón.',
    price: 400,
    image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    tags: ['vegan', 'fasting', 'healthy'],
    allergens: [],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 40,
  },
  {
    id: 'item-aja-spinach',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-fasting',
    name: 'Aja with Spinach (አጃ በስፒናች)',
    name_es: 'Aja Integral con Espinacas',
    description: 'Nutritious whole grain aja stewed with fresh tender spinach leaves, garlic, and mild seasonings.',
    description_es: 'Grano entero aja con hojas frescas de espinaca tierna y ajo salteado.',
    price: 400,
    image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    tags: ['vegan', 'fasting', 'healthy'],
    allergens: [],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 41,
  },

  // ==========================================
  // 5. MENDI (መንዲ)
  // ==========================================
  {
    id: 'item-special-mendi',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-mendi',
    name: 'Special Mendi (ስፔሻል መንዲ)',
    name_es: 'Mendi Especial de Cordero',
    description: 'Succulent fall-off-the-bone roasted lamb shank served over a mound of fragrant spiced long-grain basmati rice, garnished with toasted almonds, fried onions, and raisins. Served with spicy sahawi tomato salsa.',
    description_es: 'Jarrete de cordero asado tierno sobre arroz basmati especiado con almendras, cebolla frita y salsa sahawi.',
    price: 2000,
    image_url: '/images/dishes/special-mendi.jpg',
    tags: ['chefsPick', 'popular', 'halal'],
    allergens: ['Nuts'],
    spice_level: 1,
    is_available: true,
    is_chefs_pick: true,
    sort_order: 42,
  },
  {
    id: 'item-mendi-full',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-mendi',
    name: 'Mendi Full (ሙሉ መንዲ)',
    name_es: 'Mendi Completo Familiar',
    description: 'Large sharing platter of spiced long-grain basmati rice topped with a generous portion of roasted tender lamb and chicken.',
    description_es: 'Bandeja grande para compartir de arroz basmati especiado con abundante cordero y pollo asado.',
    price: 1800,
    image_url: '/images/dishes/special-mendi.jpg',
    tags: ['popular', 'halal'],
    allergens: ['Nuts'],
    spice_level: 1,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 43,
  },
  {
    id: 'item-mendi-half',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-mendi',
    name: 'Mend 1/2 (ግማሽ መንዲ)',
    name_es: 'Medio Mendi Individual',
    description: 'Individual portion of fragrant spiced basmati rice topped with slow-roasted spiced tender meat and sahawi sauce.',
    description_es: 'Porción individual de arroz basmati especiado con carne asada jugosa y salsa de tomate sahawi.',
    price: 900,
    image_url: '/images/dishes/special-mendi.jpg',
    tags: ['halal'],
    allergens: ['Nuts'],
    spice_level: 1,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 44,
  },
  {
    id: 'item-roasted-chicken-full',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-mendi',
    name: 'Roasted Chicken Full (ሙሉ የተጠበሰ ዶሮ)',
    name_es: 'Pollo Asado Entero',
    description: 'Whole crispy golden-brown roasted chicken seasoned with fragrant rosemary, garlic, black pepper, and herbs, served on a bed of fresh lemon and rosemary.',
    description_es: 'Pollo entero asado a la perfección con romero, ajo, pimienta negra y rodajas de limón fresco.',
    price: 1900,
    image_url: '/images/dishes/roasted-chicken.jpg',
    tags: ['chefsPick', 'halal'],
    allergens: [],
    spice_level: 1,
    is_available: true,
    is_chefs_pick: true,
    sort_order: 45,
  },
  {
    id: 'item-roasted-chicken-half',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-mendi',
    name: '1/2 Roasted Chicken (ግማሽ የተጠበሰ ዶሮ)',
    name_es: 'Medio Pollo Asado',
    description: 'Half succulent golden roast chicken with crisp herb-seasoned skin, juicy interior, and garlic lemon dip.',
    description_es: 'Medio pollo asado jugoso con piel crujiente a las finas hierbas y salsa de ajo y limón.',
    price: 1098,
    image_url: '/images/dishes/roasted-chicken.jpg',
    tags: ['halal'],
    allergens: [],
    spice_level: 1,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 46,
  },
  {
    id: 'item-mofo',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-mendi',
    name: 'Mofo (ሞፎ)',
    name_es: 'Mofo Asado Tradicional',
    description: 'Rich, tender roasted meat specialty seasoned with traditional spices and rendered pan juices.',
    description_es: 'Especialidad de carne asada tierna sazonada con especias tradicionales.',
    price: 700,
    image_url: '/images/dishes/yebeg-tibs.jpg',
    tags: ['halal'],
    allergens: [],
    spice_level: 1,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 47,
  },

  // ==========================================
  // 6. BURGERS & SHAWARMA (በርገር)
  // ==========================================
  {
    id: 'item-special-burger',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-burgers',
    name: 'Special Burger (ስፔሻል በርገር)',
    name_es: 'Hamburguesa Especial Addis',
    description: 'Double flame-grilled beef patty, melted cheddar cheese, fried sunny-side egg, caramelized onions, crisp lettuce, tomato, and house burger sauce on toasted brioche.',
    description_es: 'Doble hamburguesa de res a la parrilla con queso cheddar, huevo frito, cebolla caramelizada y salsa casera.',
    price: 799,
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    tags: ['chefsPick', 'popular', 'halal'],
    allergens: ['Gluten', 'Dairy', 'Egg'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: true,
    sort_order: 48,
  },
  {
    id: 'item-chicken-burger',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-burgers',
    name: 'Chicken Burger (የዶሮ በርገር)',
    name_es: 'Hamburguesa de Pollo Crujiente',
    description: 'Crispy fried chicken breast fillet, pickled slaw, melted provolone cheese, and garlic herb mayo on a warm sesame bun.',
    description_es: 'Pechuga de pollo crujiente con ensalada de col encurtida, queso fundido y mayonesa de ajo.',
    price: 599,
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    tags: ['popular', 'halal'],
    allergens: ['Gluten', 'Dairy', 'Egg'],
    spice_level: 1,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 49,
  },
  {
    id: 'item-cheese-burger',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-burgers',
    name: 'Cheese Burger (ቺዝ በርገር)',
    name_es: 'Cheeseburger Clásica',
    description: 'Juicy 100% seasoned beef patty, double melted American cheddar, dill pickles, sliced red onions, ketchup, and mustard.',
    description_es: 'Hamburguesa de res con doble queso cheddar fundido, pepinillos y cebolla roja.',
    price: 599,
    image_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80',
    tags: ['popular', 'halal'],
    allergens: ['Gluten', 'Dairy'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 50,
  },
  {
    id: 'item-beef-burger',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-burgers',
    name: 'Beef Burger (የበሬ በርገር)',
    name_es: 'Hamburguesa de Res',
    description: 'Flame-broiled seasoned beef patty with crisp lettuce, fresh tomato slices, and Addis signature relish on a toasted bun.',
    description_es: 'Hamburguesa de res con lechuga fresca, tomate y salsa de la casa.',
    price: 498,
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    tags: ['halal'],
    allergens: ['Gluten'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 51,
  },
  {
    id: 'item-beef-shawarma',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-burgers',
    name: 'Beef Shawarma (የበሬ ሻዋርማ)',
    name_es: 'Shawarma de Res',
    description: 'Spiced beef shavings wrapped in thin toasted pita with creamy tahini sauce, pickled cucumbers, and sumac onions.',
    description_es: 'Tiras de res especiadas en pan pita tostado con salsa tahini y pepinillos.',
    price: 699,
    image_url: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=600&q=80',
    tags: ['popular', 'halal'],
    allergens: ['Gluten'],
    spice_level: 1,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 52,
  },
  {
    id: 'item-chicken-shawarma',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-burgers',
    name: 'Chicken Shawarma (የዶሮ ሻዋርማ)',
    name_es: 'Shawarma de Pollo',
    description: 'Marinated rotisserie chicken shavings, fluffy garlic toum, and salted fries wrapped tight in grilled pita.',
    description_es: 'Pollo marinado al asador con crema de ajo toum y patatas en pan pita.',
    price: 600,
    image_url: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=600&q=80',
    tags: ['popular', 'halal'],
    allergens: ['Gluten'],
    spice_level: 1,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 53,
  },
  {
    id: 'item-tuna-sandwich',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-burgers',
    name: 'Tuna Sandwich (የቱና ሳንድዊች)',
    name_es: 'Sándwich de Atún',
    description: 'Light flaked tuna salad with diced celery, red onions, and lemon mayonnaise on freshly baked artisan baguette.',
    description_es: 'Ensalada de atún con apio, cebolla morada y mayonesa al limón en baguette recién horneada.',
    price: 600,
    image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
    tags: ['pescatarian'],
    allergens: ['Gluten', 'Seafood', 'Egg'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 54,
  },

  // ==========================================
  // 7. PIZZAS (ፒዛ)
  // ==========================================
  {
    id: 'item-tartufo-pizza',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-woodfired',
    name: 'Special Pizza (Tartufo & Wild Morel Sourdough Pizza)',
    name_es: 'Pizza Especial de la Casa',
    description: 'Loaded house special sourdough pizza with melted whole milk mozzarella, spiced beef sausage, sautéed mushrooms, bell peppers, and sliced black olives.',
    description_es: 'Pizza especial con masa madre fermentada, mozzarella fresca, carne especiada, setas y aceitunas.',
    price: 1099,
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
    tags: ['chefsPick', 'popular', 'halal'],
    allergens: ['Gluten', 'Dairy'],
    spice_level: 1,
    is_available: true,
    is_chefs_pick: true,
    sort_order: 55,
  },
  {
    id: 'item-chicken-pizza',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-woodfired',
    name: 'Chicken Pizza (የዶሮ ፒዛ)',
    name_es: 'Pizza de Pollo',
    description: 'Roasted chicken strips, bell peppers, sweet corn, melted mozzarella, and fresh tomato sauce on hand-stretched dough.',
    description_es: 'Tiras de pollo asado, pimientos, maíz dulce, mozzarella y salsa de tomate.',
    price: 899,
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
    tags: ['halal'],
    allergens: ['Gluten', 'Dairy'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 56,
  },
  {
    id: 'item-tuna-pizza',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-woodfired',
    name: 'Tuna Pizza (የቱና ፒዛ)',
    name_es: 'Pizza de Atún',
    description: 'Flaked tuna, sliced red onions, black olives, mozzarella, and savory tomato sauce on crispy crust.',
    description_es: 'Atún en copos, cebolla morada, aceitunas negras y mozzarella.',
    price: 899,
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
    tags: ['pescatarian'],
    allergens: ['Gluten', 'Dairy', 'Seafood'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 57,
  },
  {
    id: 'item-margarita-pizza',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-woodfired',
    name: 'Margarita Pizza (ማርጋሪታ ፒዛ)',
    name_es: 'Pizza Margarita',
    description: 'Classic simplicity: Italian plum tomato sauce, fresh mozzarella cheese, aromatic fresh basil leaves, and extra virgin olive oil.',
    description_es: 'Salsa de tomate natural, mozzarella fresca, hojas de albahaca y aceite de oliva virgen.',
    price: 700,
    image_url: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80',
    tags: ['vegetarian', 'popular'],
    allergens: ['Gluten', 'Dairy'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 58,
  },
  {
    id: 'item-vegetable-pizza',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-woodfired',
    name: 'Vegetable Pizza (የአትክልት ፒዛ)',
    name_es: 'Pizza Vegetariana',
    description: 'Generously topped with mushrooms, bell peppers, sliced red onions, tomatoes, and mozzarella on sourdough crust.',
    description_es: 'Champiñones, pimientos, cebolla morada, tomates y mozzarella.',
    price: 460,
    image_url: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=600&q=80',
    tags: ['vegetarian'],
    allergens: ['Gluten', 'Dairy'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 59,
  },

  // ==========================================
  // 8. SNACK MENU (ስናክ)
  // ==========================================
  {
    id: 'item-calamari',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-snacks',
    name: 'Crispy Point Judith Calamari Fritti',
    name_es: 'Calamares Crujientes Fritti',
    description: 'Tender squid rings flash-fried until crispy, served with fresh lemon wedges and savory house tartar sauce.',
    description_es: 'Anillas de calamar tiernas fritas al punto crujiente con gajos de limón y salsa tártara.',
    price: 750,
    image_url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
    tags: ['popular', 'pescatarian'],
    allergens: ['Seafood', 'Gluten', 'Egg'],
    spice_level: 1,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 60,
  },
  {
    id: 'item-chicken-tenders',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-snacks',
    name: 'Chicken Tenders (የዶሮ ቴንደር)',
    name_es: 'Tenders de Pollo Crujiente',
    description: 'Golden-breaded tender chicken breast strips seasoned with spices and served with honey mustard or smoky BBQ dip.',
    description_es: 'Tiras de pechuga de pollo crujientes con salsa de mostaza y miel o barbacoa.',
    price: 600,
    image_url: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80',
    tags: ['popular', 'halal'],
    allergens: ['Gluten', 'Egg'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 61,
    options: [
      { id: 'opt-tenders-4', item_id: 'item-chicken-tenders', name: '4 Pieces (Standard)', price: 0, is_required: false },
      { id: 'opt-tenders-6', item_id: 'item-chicken-tenders', name: '6 Pieces (+200 ETB)', price: 200, is_required: false },
    ],
  },
  {
    id: 'item-chicken-wings',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-snacks',
    name: 'Fried Chicken Wings (የተጠበሰ የዶሮ ክንፍ)',
    name_es: 'Alitas de Pollo Fritas',
    description: 'Crispy fried chicken wings tossed in seasoned garlic pepper rub, served with dipping sauce.',
    description_es: 'Alitas de pollo crujientes con especias de ajo y pimienta.',
    price: 750,
    image_url: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80',
    tags: ['popular', 'halal'],
    allergens: ['Gluten'],
    spice_level: 1,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 62,
  },
  {
    id: 'item-fish-chips',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-snacks',
    name: 'Fish and Chips (አሳ እና ቺፕስ)',
    name_es: 'Fish and Chips Clásico',
    description: 'Crispy golden beer-battered white fish fillets served with hot seasoned french fries and lemon tartar sauce.',
    description_es: 'Filetes de pescado blanco crujientes rebozados con patatas fritas y salsa tártara.',
    price: 750,
    image_url: 'https://images.unsplash.com/photo-1579208030886-b937da0925dc?auto=format&fit=crop&w=600&q=80',
    tags: ['pescatarian'],
    allergens: ['Gluten', 'Seafood', 'Egg'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 63,
  },
  {
    id: 'item-nuggets',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-snacks',
    name: 'Nuggets (ነጌትስ)',
    name_es: 'Nuggets de Pollo',
    description: 'Golden crispy chicken nuggets fried to perfection, served with ketchup and mayonnaise.',
    description_es: 'Nuggets crujientes de pollo con salsas.',
    price: 750,
    image_url: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80',
    tags: ['halal'],
    allergens: ['Gluten'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 64,
  },
  {
    id: 'item-spring-rolls',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-snacks',
    name: 'Spring Rolls (ስፕሪንግ ሮል)',
    name_es: 'Rollitos de Primavera',
    description: 'Crispy fried vegetable spring rolls filled with cabbage, carrots, and glass noodles, served with sweet chili sauce.',
    description_es: 'Rollitos de primavera crujientes de vegetales con salsa agridulce.',
    price: 345,
    image_url: 'https://images.unsplash.com/photo-1548946526-f69e2424cf45?auto=format&fit=crop&w=600&q=80',
    tags: ['vegan', 'fasting'],
    allergens: ['Gluten'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 65,
    options: [
      { id: 'opt-spring-3', item_id: 'item-spring-rolls', name: '3 Pieces (Standard)', price: 0, is_required: false },
      { id: 'opt-spring-6', item_id: 'item-spring-rolls', name: '6 Pieces (+155 ETB)', price: 155, is_required: false },
    ],
  },
  {
    id: 'item-french-fries',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-snacks',
    name: 'French Fries (የድንች ጥብስ)',
    name_es: 'Patatas Fritas Crujientes',
    description: 'Hot, crispy golden potato fries dusted with sea salt, served with ketchup.',
    description_es: 'Patatas fritas doradas y crujientes con sal marina.',
    price: 345,
    image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
    tags: ['vegan', 'fasting', 'popular'],
    allergens: [],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 66,
  },

  // ==========================================
  // 9. ADDIS CAFE (ትኩስ መጠጦች)
  // ==========================================
  {
    id: 'item-coffee-buna',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-drinks',
    name: 'Ethiopian Buna / Coffee (ቡና)',
    name_es: 'Café Tradicional Etíope',
    description: 'Freshly roasted Ethiopian highland Arabica coffee brewed strong and aromatic in the traditional clay pot.',
    description_es: 'Café arábica de altura etíope recién tostado y preparado con aroma intenso.',
    price: 120,
    image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
    tags: ['popular', 'vegan', 'chefsPick'],
    allergens: [],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: true,
    sort_order: 67,
  },
  {
    id: 'item-macchiato',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-drinks',
    name: 'Macchiato (ማኪያቶ)',
    name_es: 'Macchiato Clásico',
    description: 'Addis Ababa’s beloved staple: rich espresso crowned with a velvety layer of steamed whole milk micro-foam.',
    description_es: 'El clásico de Addis: espresso intenso coronado con microespuma de leche sedosa.',
    price: 120,
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    tags: ['popular', 'chefsPick'],
    allergens: ['Dairy'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: true,
    sort_order: 68,
  },
  {
    id: 'item-double-macchiato',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-drinks',
    name: 'Double Macchiato (ድርብ ማኪያቶ)',
    name_es: 'Doble Macchiato',
    description: 'Double shot of dark roasted espresso layered with dense steamed milk foam in a clear glass.',
    description_es: 'Doble espresso con densa capa de espuma de leche en vaso de cristal.',
    price: 220,
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    tags: ['popular'],
    allergens: ['Dairy'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 69,
  },
  {
    id: 'item-espresso',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-drinks',
    name: 'Single-Origin Espresso',
    name_es: 'Espresso de Origen',
    description: 'Intense single-origin Yirgacheffe extraction featuring floral notes, bright citrus acidity, and rich golden crema.',
    description_es: 'Extracción de espresso Yirgacheffe con notas florales y crema dorada.',
    price: 120,
    image_url: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=600&q=80',
    tags: ['vegan'],
    allergens: [],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 70,
  },
  {
    id: 'item-special-milk',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-drinks',
    name: 'Special Milk (ስፔሻል ወተት)',
    name_es: 'Leche Caliente Especiada',
    description: 'Steamed whole milk gently simmered with crushed ginger, whole green cardamom, and a hint of honey.',
    description_es: 'Leche entera infusionada con jengibre fresco, cardamomo y un toque de miel.',
    price: 200,
    image_url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80',
    tags: ['vegetarian'],
    allergens: ['Dairy'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 71,
  },
  {
    id: 'item-special-tea',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-drinks',
    name: 'Special Tea (ስፔሻል ሻይ)',
    name_es: 'Té Especiado con Limón',
    description: 'Black tea brewed with whole cloves, cinnamon bark, crushed cardamom pods, and a slice of fresh lemon.',
    description_es: 'Té negro aromático con clavo, canela, cardamomo y rodaja de limón.',
    price: 200,
    image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    tags: ['vegan', 'fasting'],
    allergens: [],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 72,
  },
  {
    id: 'item-somali-tea',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-drinks',
    name: 'Somali Tea (የሶማሌ ሻይ)',
    name_es: 'Té Especiado Somalí (Shaah)',
    description: 'Traditional slow-brewed spiced milk tea simmered with cardamom, ginger, cinnamon, and condensed sweetness.',
    description_es: 'Té con leche especiado tradicional cocinado a fuego lento con cardamomo y canela.',
    price: 140,
    image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    tags: ['vegetarian', 'popular'],
    allergens: ['Dairy'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 73,
  },
  {
    id: 'item-hot-chocolate',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-drinks',
    name: 'Hot Chocolate (ትኩስ ቸኮሌት)',
    name_es: 'Chocolate Caliente',
    description: 'Velvety melted dark cocoa whisked with steamed whole milk and topped with chocolate shavings.',
    description_es: 'Cacao puro batido con leche caliente y virutas de chocolate negro.',
    price: 200,
    image_url: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=600&q=80',
    tags: ['vegetarian'],
    allergens: ['Dairy'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 74,
  },

  // ==========================================
  // 10. FRESH JUICES & COLD DRINKS (ትኩስ ጭማቂዎች)
  // ==========================================
  {
    id: 'item-spris',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-juices',
    name: 'Spris Layered Juice (ስፕሪስ)',
    name_es: 'Spris Trilogía de Frutas',
    description: 'Famous Ethiopian layered fresh juice served in a tall glass: thick creamy avocado base, sweet tropical mango center, and ripe papaya top, served with fresh lime and Vimto drizzle.',
    description_es: 'El famoso jugo en tres capas: aguacate espeso, mango tropical y papaya madura con limón fresco.',
    price: 350,
    image_url: '/images/dishes/spris-juice.jpg',
    tags: ['chefsPick', 'popular', 'vegan', 'fasting'],
    allergens: [],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: true,
    sort_order: 75,
  },
  {
    id: 'item-avocado-juice',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-juices',
    name: 'Avocado Juice (አቮካዶ ጭማቂ)',
    name_es: 'Zumo Puro de Aguacate',
    description: 'Ultra-creamy puréed fresh Hass avocados with a squeeze of fresh lime juice and sweet fruit syrup.',
    description_es: 'Puré cremoso de aguacates frescos con un toque de zumo de lima recién exprimido.',
    price: 300,
    image_url: '/images/dishes/spris-juice.jpg',
    tags: ['vegan', 'fasting', 'popular'],
    allergens: [],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 76,
  },
  {
    id: 'item-mango-juice',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-juices',
    name: 'Mango Juice (ማንጎ ጭማቂ)',
    name_es: 'Zumo Natural de Mango',
    description: '100% pure thick tropical mango purée, delightfully sweet and freshly blended.',
    description_es: 'Puré natural de mangos maduros tropicales servido bien frío.',
    price: 350,
    image_url: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=600&q=80',
    tags: ['vegan', 'fasting'],
    allergens: [],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 77,
  },
  {
    id: 'item-papaya-juice',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-juices',
    name: 'Papaya Juice (ፓፓያ ጭማቂ)',
    name_es: 'Zumo Fresco de Papaya',
    description: 'Smooth and silky fresh orange papaya purée with a dash of freshly squeezed lime juice.',
    description_es: 'Puré sedoso de papaya fresca con un toque de lima.',
    price: 300,
    image_url: '/images/dishes/spris-juice.jpg',
    tags: ['vegan', 'fasting'],
    allergens: [],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 78,
  },
  {
    id: 'item-watermelon-juice',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-juices',
    name: 'Watermelon Juice (ሀብሀብ ጭማቂ)',
    name_es: 'Zumo Refrescante de Sandía',
    description: 'Cold-pressed sweet red watermelon juice served over crushed ice with fresh mint.',
    description_es: 'Zumo de sandía fresca prensada en frío con hielo picado y menta.',
    price: 300,
    image_url: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=600&q=80',
    tags: ['vegan', 'fasting'],
    allergens: [],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 79,
  },
  {
    id: 'item-milkshake',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-juices',
    name: 'Milkshake (Strawberry / Chocolate)',
    name_es: 'Batido Helado (Fresa / Chocolate)',
    description: 'Thick, frosty milkshake blended with ice cream, cold fresh milk, and rich whipped cream.',
    description_es: 'Batido espeso helado con nata montada y sirope de chocolate o fresa.',
    price: 350,
    image_url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
    tags: ['vegetarian'],
    allergens: ['Dairy'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 80,
  },
  {
    id: 'item-iced-coffee',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-juices',
    name: 'Iced Coffee (አይስ ካፌ)',
    name_es: 'Café Helado con Leche',
    description: 'Chilled double shot of espresso shaken with cold milk and poured over crystal ice cubes.',
    description_es: 'Doble shot de espresso batido con leche fría y cubitos de hielo.',
    price: 200,
    image_url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
    tags: ['vegetarian'],
    allergens: ['Dairy'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 81,
  },
  {
    id: 'item-ambo-water',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-juices',
    name: 'Ambo Mineral Water (አምቦ ውሃ)',
    name_es: 'Agua Mineral Ambo con Gas',
    description: 'Classic Ethiopian naturally sparkling mineral water from the volcanic springs of Ambo.',
    description_es: 'Agua mineral con gas natural de los manantiales volcánicos de Ambo.',
    price: 100,
    image_url: 'https://images.unsplash.com/photo-1560023907-5f339617ea30?auto=format&fit=crop&w=600&q=80',
    tags: ['vegan'],
    allergens: [],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 82,
  },

  // ==========================================
  // 11. ADDIS BAKERY (መጋገሪያ)
  // ==========================================
  {
    id: 'item-black-forest',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-desserts',
    name: 'Black Forest Cake (ብላክ ፎረስት)',
    name_es: 'Pastel Selva Negra',
    description: 'Decadent layers of dark chocolate sponge cake, light whipped cream, and tart cherry filling, finished with chocolate shavings.',
    description_es: 'Capas de bizcocho de chocolate negro, nata montada y cerezas con virutas de chocolate.',
    price: 230,
    image_url: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=600&q=80',
    tags: ['popular', 'vegetarian'],
    allergens: ['Gluten', 'Dairy', 'Egg'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: true,
    sort_order: 83,
  },
  {
    id: 'item-opera-cake',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-desserts',
    name: 'Opera Cake (ኦፔራ ኬክ)',
    name_es: 'Tarta Ópera Francesa',
    description: 'Refined French almond sponge cake soaked in coffee syrup, layered with dark chocolate ganache and coffee buttercream.',
    description_es: 'Bizcocho de almendra bañado en café con ganache de chocolate y crema de café.',
    price: 250,
    image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
    tags: ['vegetarian'],
    allergens: ['Gluten', 'Dairy', 'Egg', 'Nuts'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 84,
  },
  {
    id: 'item-basbousa',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-desserts',
    name: 'Basbousa (ባስቡሳ)',
    name_es: 'Basbousa de Sémola',
    description: 'Traditional sweet semolina cake soaked in floral orange blossom honey syrup and topped with toasted whole almonds.',
    description_es: 'Pastel dulce de sémola bañado en almíbar de azahar y miel con almendra tostada.',
    price: 100,
    image_url: 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=600&q=80',
    tags: ['vegetarian', 'popular'],
    allergens: ['Gluten', 'Dairy', 'Nuts'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 85,
  },
  {
    id: 'item-croissant',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-desserts',
    name: 'Butter Croissant (ክሩዋሳን)',
    name_es: 'Croissant Francés de Mantequilla',
    description: 'Freshly baked flaky French pastry with honeycomb interior and golden buttery crust.',
    description_es: 'Hojaldre francés crujiente horneado a diario con mantequilla pura.',
    price: 150,
    image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
    tags: ['popular', 'vegetarian'],
    allergens: ['Gluten', 'Dairy', 'Egg'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 86,
  },
  {
    id: 'item-bombolino',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-desserts',
    name: 'Bombolino (ቦምቦሊኖ)',
    name_es: 'Bomboloni Relleno de Crema',
    description: 'Italian-style sugar-rolled fluffy doughnut stuffed with creamy vanilla custard.',
    description_es: 'Dona italiana esponjosa rebozada en azúcar fina y rellena de crema pastelera.',
    price: 60,
    image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
    tags: ['vegetarian'],
    allergens: ['Gluten', 'Dairy', 'Egg'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 87,
  },
  {
    id: 'item-torta',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-desserts',
    name: 'Celebration Torta Cake (ቶርታ)',
    name_es: 'Torta de Celebración Completa',
    description: 'Whole celebratory layer cake beautifully frosted with whipped cream, vanilla custard, and seasonal fruits.',
    description_es: 'Pastel festivo completo decorado con nata montada y fruta de temporada.',
    price: 1500,
    image_url: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=600&q=80',
    tags: ['vegetarian'],
    allergens: ['Gluten', 'Dairy', 'Egg'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 88,
  },
  {
    id: 'item-traditional-breads',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-desserts',
    name: 'Calvine / Aja / Gebis Bread (ዳቦ)',
    name_es: 'Pan Rústico Tradicional',
    description: 'Hearth-baked traditional artisanal breads: wholesome barley (gebis), whole oat (aja), and crusty calvine.',
    description_es: 'Panes rústicos tradicionales horneados a la leña: cebada gebis y avena aja.',
    price: 35,
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    tags: ['vegan', 'fasting'],
    allergens: ['Gluten'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 89,
  },
];

// In-memory runtime state for live mock orders & toggles during demo/testing
const inMemoryOrders: Order[] = [
  {
    id: 'ord-101',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    table_number: 'Table 14',
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

export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  // If Supabase is connected with real credentials:
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('slug', slug)
        .single();

      if (!error && data) return data as Restaurant;
    } catch {
      // Fallback below
    }
  }

  // Built-in fallback matching requested slug
  if (slug.toLowerCase() === 'addis' || slug.toLowerCase() === 'afla' || slug.toLowerCase() === 'addis-cafeteria' || slug === 'default' || slug === 'aura') {
    return MOCK_RESTAURANT_ADDIS;
  }

  return null;
}

export async function getMenuCategories(restaurantId: string): Promise<Category[]> {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        inMemoryCategories = data as Category[];
        return inMemoryCategories;
      }
    } catch {
      // Fallback below
    }
  }

  if (inMemoryCategories.length > 0) return inMemoryCategories;
  return MOCK_CATEGORIES_ADDIS;
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
            localStorage.setItem('digital_menu_items_cache', JSON.stringify(inMemoryItems));
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
      const cached = localStorage.getItem('digital_menu_items_cache');
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
    banner_text: '🌿 Afternoon Happy Hour: 20% off all artisan wood-fired dishes until late.',
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
          banner_text: d.banner_text || `🌿 ${d.title}`,
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

export const MOCK_REVIEWS_ADDIS: DishReview[] = [
  // --- Tartufo & Wild Morel Sourdough Pizza (4 reviews -> Threshold >= 3 MET! avg 4.8) ---
  {
    id: 'rev-pizza-1',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    item_id: 'item-tartufo-pizza',
    rating: 5,
    tags: ['Crispy texture', 'Great portion'],
    comment: 'The 72-hour sourdough crust has magnificent blistering and the truffle aroma fills the room.',
    photo_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80',
    session_token: 'sess-seed-1',
    table_number: 'Table 4',
    status: 'published',
    report_count: 0,
    created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
  },
  {
    id: 'rev-pizza-2',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    item_id: 'item-tartufo-pizza',
    rating: 5,
    tags: ['Would order again', 'Fresh ingredients'],
    comment: 'Outstanding flavor profile. Best woodfired pizza in the city.',
    session_token: 'sess-seed-2',
    table_number: 'Table 14',
    status: 'published',
    report_count: 0,
    owner_reply: 'Thank you so much! Our pizza dough is fermented for 72 hours with unbleached organic flour.',
    owner_reply_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    owner_reply_by: 'Addis Kitchen Team',
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
  },
  {
    id: 'rev-pizza-3',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    item_id: 'item-tartufo-pizza',
    rating: 4,
    tags: ['Too salty', 'Great portion'],
    comment: 'Great portion size and the crust was fantastic. A tiny bit too salty on the pecorino cheese.',
    session_token: 'sess-seed-3',
    table_number: 'Table 2',
    status: 'published',
    report_count: 0,
    owner_reply: 'We appreciate this honest note! We have alerted our pizzaiolo to calibrate the pecorino balance.',
    owner_reply_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    owner_reply_by: 'Addis Kitchen Team',
    created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
  },
  {
    id: 'rev-pizza-4',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    item_id: 'item-tartufo-pizza',
    rating: 5,
    tags: ['Crispy texture', 'Fresh ingredients'],
    comment: 'Arrived piping hot and perfectly sliced. Wonderful texture.',
    session_token: 'sess-seed-4',
    table_number: 'Table 9',
    status: 'published',
    report_count: 0,
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },

  // --- Truffle Burrata & Heirloom Crudo (3 reviews -> Threshold >= 3 MET! avg 4.7) ---
  {
    id: 'rev-burrata-1',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    item_id: 'item-burrata',
    rating: 5,
    tags: ['Fresh ingredients', 'Would order again'],
    comment: 'The burrata was wonderfully creamy with the balsamic glaze.',
    session_token: 'sess-seed-5',
    table_number: 'Table 1',
    status: 'published',
    report_count: 0,
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    id: 'rev-burrata-2',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    item_id: 'item-burrata',
    rating: 5,
    tags: ['Fresh ingredients'],
    comment: 'Heirloom tomatoes were super sweet and the garlic focaccia was warm and buttery.',
    session_token: 'sess-seed-6',
    table_number: 'Table 7',
    status: 'published',
    report_count: 0,
    created_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
  },
  {
    id: 'rev-burrata-3',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    item_id: 'item-burrata',
    rating: 4,
    tags: ['Great portion'],
    comment: 'Loved the portion size for sharing.',
    session_token: 'sess-seed-7',
    table_number: 'Table 3',
    status: 'published',
    report_count: 0,
    created_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
  },

  // --- Crispy Point Judith Calamari Fritti (1 review -> Threshold < 3 NOT MET! clean state) ---
  {
    id: 'rev-calamari-1',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    item_id: 'item-calamari',
    rating: 5,
    tags: ['Crispy texture'],
    comment: 'Flash fried to perfection, not rubbery at all.',
    session_token: 'sess-seed-8',
    table_number: 'Table 5',
    status: 'published',
    report_count: 0,
    created_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
  },

  // --- Reported / Needs Attention Demo Review ---
  {
    id: 'rev-reported-demo',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    item_id: 'item-burrata',
    rating: 1,
    tags: [],
    comment: 'Check out cheap crypto telegram @spam_crypto_boost for discounts!',
    session_token: 'sess-spammer-99',
    table_number: 'Table 10',
    status: 'reported',
    report_count: 2,
    flagged_reason: 'Reported by guests as spam advertisement',
    created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
];

let inMemoryReviews: DishReview[] = [];

export const MOCK_MODERATION_LOGS_ADDIS: ReviewModerationLog[] = [
  {
    id: 'log-1',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    review_id: 'rev-pizza-2',
    user_role: 'staff',
    user_name: 'Staff - Addis Kitchen Team',
    action: 'reply',
    reason: 'Replied with baking details',
    created_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
  },
];

let inMemoryModerationLogs: ReviewModerationLog[] = [...MOCK_MODERATION_LOGS_ADDIS];

export async function getDishReviews(
  restaurantId: string,
  itemId?: string
): Promise<DishReview[]> {
  let list = inMemoryReviews.filter((r) => r.restaurant_id === restaurantId);
  if (itemId) {
    list = list.filter((r) => r.item_id === itemId);
  }

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
        const demoReported = MOCK_REVIEWS_ADDIS.filter((r) => r.status !== 'published');
        const nonPublishedLocal = demoReported.filter(
          (r) => !inMemoryReviews.some((local) => local.id === r.id && local.status === 'published')
        );
        const reportedIds = new Set(nonPublishedLocal.map((r) => r.id));
        const cleanDbReviews = (data as DishReview[]).filter((r) => !reportedIds.has(r.id));
        const allReviews = [...cleanDbReviews, ...nonPublishedLocal];
        inMemoryReviews = allReviews;
        return allReviews.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
    } catch {
      // Fallback below
    }
  }

  if (inMemoryReviews.length > 0) {
    return [...list].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }
  return MOCK_REVIEWS_ADDIS;
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
    return { success: false, error: botCheck.reason || 'Bot activity detected.' };
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

  // Broadcast feedback immediately across tabs so owner and staff receive it right away
  broadcastSync({ type: 'REVIEW_SUBMITTED', review: newReview });

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const supabase = createClient();
      await supabase.from('reviews').insert(newReview);
    } catch {
      // Handled
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
  const review = inMemoryReviews.find((r) => r.id === reviewId);
  if (!review) return false;

  review.owner_reply = replyText.trim();
  review.owner_reply_at = new Date().toISOString();
  review.owner_reply_by = staffName;
  review.updated_at = new Date().toISOString();

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

  const review = inMemoryReviews.find((r) => r.id === reviewId);
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
let inMemoryCategories: Category[] = [];
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
      localStorage.setItem('digital_menu_items_cache', JSON.stringify(inMemoryItems));
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
  if (existingIdx >= 0) {
    inMemoryCategories[existingIdx] = {
      ...inMemoryCategories[existingIdx],
      ...categoryData,
    } as Category;
    return inMemoryCategories[existingIdx];
  } else {
    const newCat: Category = {
      id: categoryData.id || `cat-${Date.now()}`,
      restaurant_id: categoryData.restaurant_id || MOCK_RESTAURANT_ADDIS.id,
      name: categoryData.name || 'New Category',
      name_es: categoryData.name_es,
      icon: categoryData.icon || '🍽️',
      description: categoryData.description || '',
      description_es: categoryData.description_es,
      sort_order: categoryData.sort_order ?? inMemoryCategories.length + 1,
      is_active: categoryData.is_active ?? true,
    };
    inMemoryCategories.push(newCat);
    return newCat;
  }
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
    updated_at: new Date().toISOString(),
  };
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

