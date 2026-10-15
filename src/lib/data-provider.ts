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
  tagline: 'Artisanal Roasts, Handcrafted Pastries & Modern Comfort Dining',
  currency: '$',
  currency_code: 'USD',
  default_table: 'Table 14',
  hours: 'Mon – Sun: 7:00 AM – 10:00 PM',
  address: '742 Bole Road, Culinary Arts District',
  announcement: '✨ Welcome to Addis! Fresh single-origin espresso & seasonal pastries are ready.',
  is_open: true,
  tax_rate: 0.08,
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
  closed_message: "We're currently resting! Our kitchen re-opens tomorrow at 7:00 AM.",
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
    id: 'cat-starters',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    name: 'Starters & Small Bites',
    name_es: 'Entrantes & Tapas',
    icon: '🥗',
    description: 'Artisanal appetizers crafted to awaken the senses and share with the table.',
    description_es: 'Aperitivos artesanales para abrir el apetito y compartir.',
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'cat-mains',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    name: "Chef's Entrées & Prime Cuts",
    name_es: 'Platos Fuertes & Cortes Prime',
    icon: '🥩',
    description: 'Prime dry-aged steaks, pan-roasted wild catches, and heritage cuts.',
    description_es: 'Cortes madurados selectos, pesca fresca y recetas de autor.',
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'cat-woodfired',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    name: 'Wood-Fired Specialties & Burgers',
    name_es: 'Horno de Leña & Hamburguesas',
    icon: '🍕',
    description: '72-hour sourdough crusts and gourmet brioche smash burgers.',
    description_es: 'Masa madre fermentada por 72 horas y hamburguesas gourmet al carbón.',
    sort_order: 3,
    is_active: true,
  },
  {
    id: 'cat-greens',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    name: 'Artisanal Greens & Bowls',
    name_es: 'Ensaladas & Bowls',
    icon: '🥑',
    description: 'Hyper-seasonal produce, crisp organic greens, and superfood vinaigrettes.',
    description_es: 'Vegetales orgánicos de temporada y granos ancestrales.',
    sort_order: 4,
    is_active: true,
  },
  {
    id: 'cat-desserts',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    name: 'Pastry & Decadence',
    name_es: 'Postres & Repostería',
    icon: '🍰',
    description: 'Handcrafted confectionary, French pastry creations, and house gelato.',
    description_es: 'Repostería fina hecha en casa y helados artesanales.',
    sort_order: 5,
    is_active: true,
  },
  {
    id: 'cat-drinks',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    name: 'Craft Coffee & Mixology',
    name_es: 'Café de Especialidad & Cócteles',
    icon: '☕',
    description: 'Single-origin Ethiopian roasts, botanical mocktails, and sommelier cellar.',
    description_es: 'Café de origen etíope tostado en casa y coctelería botánica.',
    sort_order: 6,
    is_active: true,
  },
];

export const MOCK_ITEMS_ADDIS: MenuItem[] = [
  // --- STARTERS ---
  {
    id: 'item-burrata',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-starters',
    name: 'Truffle Burrata & Heirloom Crudo',
    name_es: 'Burrata Trufada con Tomates Heirloom',
    description: 'Creamy Puglia burrata paired with marinated heirloom tomatoes, aged balsamic caviar, and warm grilled garlic focaccia.',
    description_es: 'Burrata cremosa con tomates de huerta macerados, caviar balsámico y focaccia a la brasa.',
    price: 18.50,
    image_url: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=600&q=80',
    tags: ['vegetarian', 'chefsPick'],
    allergens: ['Dairy', 'Gluten'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: true,
    sort_order: 1,
    options: [
      { id: 'opt-1', item_id: 'item-burrata', name: 'Add Prosciutto di Parma +$4.50', price: 4.50, is_required: false },
      { id: 'opt-2', item_id: 'item-burrata', name: 'Extra Grilled Garlic Focaccia +$2.50', price: 2.50, is_required: false },
    ],
  },
  {
    id: 'item-calamari',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-starters',
    name: 'Crispy Point Judith Calamari Fritti',
    name_es: 'Calamares Crujientes Fritti',
    description: 'Flash-fried tender squid tossed with pickled cherry peppers, charred lemon, and smoked paprika remoulade.',
    description_es: 'Calamares frescos fritos con pimientos encurtidos y salsa tártara de pimentón ahumado.',
    price: 17.00,
    image_url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
    tags: ['spicy', 'halal'],
    allergens: ['Seafood', 'Gluten', 'Egg'],
    spice_level: 1,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 2,
  },
  {
    id: 'item-carpaccio',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-starters',
    name: 'Wagyu Beef Carpaccio',
    name_es: 'Carpaccio de Res Wagyu',
    description: 'Thinly sliced A5 Miyazaki Wagyu, caper berries, shaved Parmigiano Reggiano 24-month, winter truffle oil, and baby arugula.',
    description_es: 'Finas láminas de Wagyu A5 con alcaparras gigantes, lascas de Parmigiano y aceite de trufa.',
    price: 22.00,
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    tags: ['chefsPick', 'gluten-free', 'halal'],
    allergens: ['Dairy'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: true,
    sort_order: 3,
  },
  {
    id: 'item-edamame',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-starters',
    name: 'Charred Edamame & Togarashi',
    name_es: 'Edamame a la Brasa con Togarashi',
    description: 'Wok-seared organic soy pods glazed with sesame tamari reduction, Maldon sea salt, and Japanese seven-spice blend.',
    description_es: 'Vainas de soya tostadas al wok con reducción de tamari y sésamo con togarashi.',
    price: 11.50,
    image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    tags: ['vegan', 'vegetarian', 'gluten-free', 'spicy'],
    allergens: ['Soy', 'Sesame'],
    spice_level: 2,
    is_available: false, // SOLD OUT DEMO
    is_chefs_pick: false,
    sort_order: 4,
  },

  // --- ENTRÉES ---
  {
    id: 'item-ribeye',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-mains',
    name: '45-Day Dry-Aged Prime Ribeye (14oz)',
    name_es: 'Ribeye Prime Madurado 45 Días (14oz)',
    description: 'Cast-iron seared USDA Prime ribeye, rosemary bone marrow butter, roasted Cipollini onions, and red wine demi-glace.',
    description_es: 'Ojo de bife madurado a la mantequilla de tuétano y romero con cebollas caramelizadas.',
    price: 54.00,
    image_url: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80',
    tags: ['chefsPick', 'gluten-free', 'halal'],
    allergens: ['Dairy'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: true,
    sort_order: 5,
    options: [
      { id: 'opt-meat-1', item_id: 'item-ribeye', name: 'Cooking: Rare', price: 0, is_required: true },
      { id: 'opt-meat-2', item_id: 'item-ribeye', name: 'Cooking: Medium Rare (Chef Pick)', price: 0, is_required: true },
      { id: 'opt-meat-3', item_id: 'item-ribeye', name: 'Cooking: Medium', price: 0, is_required: true },
      { id: 'opt-prawns', item_id: 'item-ribeye', name: 'Add Garlic Butter Jumbo Prawns +$12.00', price: 12.00, is_required: false },
      { id: 'opt-truffle-mash', item_id: 'item-ribeye', name: 'Add Truffle Yukon Gold Mash +$6.50', price: 6.50, is_required: false },
    ],
  },
  {
    id: 'item-seabass',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-mains',
    name: 'Pan-Seared Chilean Sea Bass',
    name_es: 'Corvina Chilena Sellada',
    description: 'Sustainably caught sea bass fillet, lemongrass miso broth, baby bok choy, pickled beech mushrooms, and ginger emulsion.',
    description_es: 'Filete de lubina chilena en caldo de miso y limoncillo con baby bok choy.',
    price: 46.00,
    image_url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
    tags: ['gluten-free', 'halal'],
    allergens: ['Fish', 'Soy'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 6,
  },
  {
    id: 'item-tagliatelle',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-mains',
    name: 'Braised Beef Short Rib Tagliatelle',
    name_es: 'Tagliatelle con Costilla Braseada',
    description: 'Handmade egg pasta ribbons, 12-hour braised chuck ragù, san marzano tomato, fresh thyme, and shaved Pecorino Romano.',
    description_es: 'Pasta fresca hecha a mano con ragú de costilla braseada durante 12 horas.',
    price: 32.00,
    image_url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281729?auto=format&fit=crop&w=600&q=80',
    tags: ['halal'],
    allergens: ['Gluten', 'Dairy', 'Egg'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 7,
  },
  {
    id: 'item-cauliflower',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-mains',
    name: 'Roasted Organic Cauliflower Steak',
    name_es: 'Bife de Coliflor Rostizada',
    description: "Za'atar-spiced thick cauliflower steak, golden turmeric tahini puree, pomegranate molasses reduction, toasted pine nuts, and mint chimichurri.",
    description_es: "Filete de coliflor al za'atar con puré dorado de tahini y chimichurri de menta.",
    price: 24.00,
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    tags: ['vegan', 'vegetarian', 'gluten-free'],
    allergens: ['Sesame', 'Tree Nuts'],
    spice_level: 1,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 8,
  },

  // --- WOOD FIRED & BURGERS ---
  {
    id: 'item-tartufo-pizza',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-woodfired',
    name: 'Tartufo & Wild Morel Sourdough Pizza',
    name_es: 'Pizza de Masa Madre con Trufa & Morillas',
    description: 'White sauce base, fior di latte mozzarella, fontina, wild morel mushrooms, fresh shaved black truffle, and cracked black pepper.',
    description_es: 'Base blanca, fior di latte, setas colmenillas y láminas de trufa negra fresca.',
    price: 25.50,
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
    tags: ['vegetarian', 'chefsPick'],
    allergens: ['Gluten', 'Dairy'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: true,
    sort_order: 9,
    options: [
      { id: 'opt-gf-crust', item_id: 'item-tartufo-pizza', name: 'Cauliflower Gluten-Free Crust +$3.50', price: 3.50, is_required: false },
      { id: 'opt-prosciutto', item_id: 'item-tartufo-pizza', name: 'Add Prosciutto di San Daniele +$4.00', price: 4.00, is_required: false },
    ],
  },
  {
    id: 'item-addis-burger',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-woodfired',
    name: 'The Addis Prime Bacon & Wagyu Smash Burger',
    name_es: 'Hamburguesa Smash de Wagyu Addis Prime',
    description: 'Two 4oz Wagyu patties, thick bourbon applewood bacon, aged Vermont cheddar, caramelized onions, house truffle relish, on a toasted brioche bun.',
    description_es: 'Doble carne Wagyu smash, tocino ahumado al bourbon, cheddar de Vermont y relish de trufa en pan brioche.',
    price: 21.00,
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    tags: ['halal', 'chefsPick'],
    allergens: ['Gluten', 'Dairy', 'Egg'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: true,
    sort_order: 10,
    options: [
      { id: 'opt-parm-fries', item_id: 'item-addis-burger', name: 'Truffle Parmesan Fries +$4.00', price: 4.00, is_required: false },
      { id: 'opt-gf-bun', item_id: 'item-addis-burger', name: 'Gluten-Free Brioche Bun +$2.00', price: 2.00, is_required: false },
    ],
  },
  {
    id: 'item-diavola',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-woodfired',
    name: 'Spicy Diavola Calabrian Salami Pizza',
    name_es: 'Pizza Diavola con Salami Calabrés',
    description: 'San Marzano tomatoes, spicy soppressata, chili-infused hot honey drizzle, fresh oregano, and Calabrian chili oil.',
    description_es: 'Salsa San Marzano, soppressata picante, miel aromatizada con chile y orégano fresco.',
    price: 23.00,
    image_url: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=600&q=80',
    tags: ['spicy'],
    allergens: ['Gluten', 'Dairy'],
    spice_level: 2,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 11,
  },

  // --- GREENS & BOWLS ---
  {
    id: 'item-salmon-bowl',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-greens',
    name: 'Citrus Poached Salmon & Quinoa Bowl',
    name_es: 'Bowl de Salmón Pochado y Quinoa',
    description: 'Wild Alaskan salmon, organic tri-color quinoa, Hass avocado, edamame, cucumber ribbons, and a yuzu ginger vinaigrette.',
    description_es: 'Salmón salvaje en cítricos, quinoa tricolor, aguacate Hass, edamame y vinagreta de yuzu.',
    price: 24.50,
    image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    tags: ['gluten-free', 'halal', 'nut-free'],
    allergens: ['Fish', 'Soy'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 12,
  },
  {
    id: 'item-mezze-bowl',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-greens',
    name: 'Mediterranean Mezze Superfood Bowl',
    name_es: 'Superfood Bowl Mezze Mediterráneo',
    description: 'Spiced crispy chickpeas, beetroot hummus, Kalamata olives, Persian cucumbers, heirloom cherry tomatoes, quinoa, and lemon tahini.',
    description_es: 'Garbanzos crujientes especiados, hummus de remolacha, aceitunas kalamata y tahini.',
    price: 18.00,
    image_url: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=600&q=80',
    tags: ['vegan', 'vegetarian', 'gluten-free', 'nut-free'],
    allergens: ['Sesame'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 13,
  },

  // --- DESSERTS ---
  {
    id: 'item-fondant',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-desserts',
    name: 'Molten Valrhona 70% Dark Chocolate Fondant',
    name_es: 'Volcán de Chocolate Valrhona 70%',
    description: 'Warm single-origin Guanaja chocolate cake with a molten center, served with Madagascar vanilla gelato and 24k gold leaf.',
    description_es: 'Bizcocho tibio de chocolate puro con centro fundido y helado de vainilla bourbon.',
    price: 14.50,
    image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
    tags: ['vegetarian', 'chefsPick'],
    allergens: ['Dairy', 'Gluten', 'Egg'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: true,
    sort_order: 14,
  },
  {
    id: 'item-creme-brulee',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-desserts',
    name: 'Bourbon Madagascar Vanilla Bean Crème Brûlée',
    name_es: 'Crème Brûlée de Vainilla Bourbon',
    description: 'Silky custard infused with whole Bourbon vanilla pods, finished with a glass-like caramelized turbinado sugar crust.',
    description_es: 'Crema suave horneada con vainas de vainilla bourbon y corteza crujiente caramelizada.',
    price: 12.00,
    image_url: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?auto=format&fit=crop&w=600&q=80',
    tags: ['vegetarian', 'gluten-free', 'nut-free'],
    allergens: ['Dairy', 'Egg'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 15,
  },

  // --- CRAFT COFFEE & BEVERAGES ---
  {
    id: 'item-yirgacheffe',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-drinks',
    name: 'Ethiopian Yirgacheffe V60 Pour-Over',
    name_es: 'Café de Especialidad Yirgacheffe V60',
    description: 'Lightly roasted single-origin heirloom beans with delicate jasmine floral aroma, bright bergamot citrus, and honey nectar finish.',
    description_es: 'Café de origen etíope con notas florales a jazmín, bergamota y miel.',
    price: 7.50,
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    tags: ['vegan', 'gluten-free', 'halal', 'chefsPick'],
    allergens: [],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: true,
    sort_order: 16,
  },
  {
    id: 'item-coldbrew',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-drinks',
    name: 'Nitro Lavender Vanilla Cold Brew',
    name_es: 'Nitro Cold Brew con Vainilla y Lavanda',
    description: '18-hour cold steeped artisan roast charged with micro-nitrogen bubbles, organic Madagascar vanilla, and house lavender syrup.',
    description_es: 'Extracción en frío durante 18 horas con microburbujas de nitrógeno y jarabe de lavanda.',
    price: 8.00,
    image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
    tags: ['vegetarian', 'gluten-free', 'nut-free'],
    allergens: ['Dairy'],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 17,
  },
  {
    id: 'item-yuzu-spritz',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-drinks',
    name: 'Yuzu Hibiscus Botanical Spritz (Zero-Proof)',
    name_es: 'Spritz Botánico de Yuzu e Hibisco (Sin Alcohol)',
    description: 'Sparkling craft mocktail: cold-brewed hibiscus flowers, Japanese yuzu citrus, crushed mint, organic agave, club soda.',
    description_es: 'Cóctel sin alcohol: flor de Jamaica, cítrico yuzu, menta fresca y soda artesanal.',
    price: 10.50,
    image_url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=600&q=80',
    tags: ['vegan', 'vegetarian', 'gluten-free', 'halal', 'nut-free'],
    allergens: [],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: false,
    sort_order: 18,
  },
  {
    id: 'item-old-fashioned',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    category_id: 'cat-drinks',
    name: 'Smoked Rosemary Old Fashioned',
    name_es: 'Old Fashioned con Romero Ahumado',
    description: 'Small-batch Kentucky bourbon, Angostura & orange bitters, demerara syrup, torched fresh rosemary sprig, expressed orange peel.',
    description_es: 'Bourbon artesanal, amargos de naranja y angostura, jarabe demerara y romero flameado.',
    price: 17.50,
    image_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80',
    tags: ['chefsPick'],
    allergens: [],
    spice_level: 0,
    is_available: true,
    is_chefs_pick: true,
    sort_order: 19,
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
        item_id: 'item-ribeye',
        name: '45-Day Dry-Aged Prime Ribeye (14oz)',
        price: 54.00,
        quantity: 1,
        selected_options: [{ name: 'Cooking: Medium Rare (Chef Pick)', price: 0 }],
        line_total: 54.00,
      },
      {
        item_id: 'item-yirgacheffe',
        name: 'Ethiopian Yirgacheffe V60 Pour-Over',
        price: 7.50,
        quantity: 2,
        selected_options: [],
        line_total: 15.00,
      }
    ],
    subtotal: 69.00,
    tax: 5.52,
    total: 74.52,
    status: 'pending',
    notes: 'No ice for the pour-over please',
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
  if (slug.toLowerCase() === 'addis' || slug === 'default' || slug === 'aura') {
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

      if (!error && data && data.length > 0) return data as Category[];
    } catch {
      // Fallback below
    }
  }

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

      if (!error && data && data.length > 0) return data as MenuItem[];
    } catch {
      // Fallback below
    }
  }

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
    description: 'Save $4.00 when enjoying our signature Truffle Burrata Flatbread.',
    badge_text: 'Save $4',
    template_type: 'money_off',
    status: 'live',
    is_paused: false,
    discount_type: 'fixed_amount',
    discount_value: 4.0,
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
    total_savings: 36.0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'f3c0e3f4-5678-4901-c234-56789abc03',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    title: 'Complimentary Single-Origin Espresso over $30',
    description: 'Free single-origin Yirgacheffe espresso automatically added to orders over $30.',
    badge_text: 'Free Gift',
    template_type: 'free_item',
    status: 'live',
    is_paused: false,
    discount_type: 'free_item',
    discount_value: 0,
    min_order_amount: 30.0,
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

let inMemoryOffers: Offer[] = [...MOCK_OFFERS_ADDIS];

export async function getOffers(restaurantId: string): Promise<Offer[]> {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('priority', { ascending: false });

      if (!error && data && data.length > 0) return data as Offer[];
    } catch {
      // Fallback
    }
  }

  return inMemoryOffers.filter(
    (o) => o.restaurant_id === restaurantId || restaurantId === MOCK_RESTAURANT_ADDIS.id
  );
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

let inMemoryReviews: DishReview[] = [...MOCK_REVIEWS_ADDIS];

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
  return [...list].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
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
  userName: string = 'Manager'
): Promise<{ success: boolean; error?: string }> {
  // Enforce role permissions: only owners/managers can remove reviews
  if (action === 'remove' && !canRemoveReview(userRole)) {
    return {
      success: false,
      error: 'Permission denied: Only managers and owners can remove reviews.',
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
  const item = MOCK_ITEMS_ADDIS.find((i) => i.id === itemId);
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
    category_ids: ['cat-starters', 'cat-drinks'],
    is_active: true,
  },
  {
    id: 'sched-lunch-dinner',
    restaurant_id: MOCK_RESTAURANT_ADDIS.id,
    name: 'Main Dining & Prime Cuts',
    start_time: '11:30',
    end_time: '22:00',
    days_of_week: [0, 1, 2, 3, 4, 5, 6],
    category_ids: ['cat-mains', 'cat-woodfired', 'cat-greens', 'cat-desserts'],
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
    items_snapshot: [...MOCK_ITEMS_ADDIS],
  },
];

let inMemoryMenuVersions: MenuVersion[] = [...MOCK_MENU_VERSIONS_ADDIS];

let inMemoryItems: MenuItem[] = [...MOCK_ITEMS_ADDIS];
let inMemoryCategories: Category[] = [...MOCK_CATEGORIES_ADDIS];
let inMemoryRestaurant: Restaurant = { ...MOCK_RESTAURANT_ADDIS };

export async function saveMenuItem(itemData: Partial<MenuItem>): Promise<MenuItem> {
  const existingIdx = inMemoryItems.findIndex((i) => i.id === itemData.id);

  if (existingIdx >= 0) {
    inMemoryItems[existingIdx] = {
      ...inMemoryItems[existingIdx],
      ...itemData,
    } as MenuItem;
    return inMemoryItems[existingIdx];
  } else {
    const newItem: MenuItem = {
      id: itemData.id || `item-${Date.now()}`,
      restaurant_id: itemData.restaurant_id || MOCK_RESTAURANT_ADDIS.id,
      category_id: itemData.category_id || inMemoryCategories[0]?.id || 'cat-starters',
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
    inMemoryItems.unshift(newItem);
    return newItem;
  }
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
  return duplicated;
}

export async function archiveMenuItem(itemId: string, archived: boolean = true): Promise<boolean> {
  const item = inMemoryItems.find((i) => i.id === itemId);
  if (!item) return false;
  item.is_archived = archived;
  return true;
}

export async function deleteMenuItem(itemId: string): Promise<boolean> {
  inMemoryItems = inMemoryItems.filter((i) => i.id !== itemId);
  return true;
}

export async function bulkUpdateItems(
  itemIds: string[],
  updates: Partial<MenuItem>
): Promise<MenuItem[]> {
  const targetSet = new Set(itemIds);
  inMemoryItems = inMemoryItems.map((item) => {
    if (targetSet.has(item.id)) {
      return { ...item, ...updates };
    }
    return item;
  });
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

