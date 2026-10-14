import { Restaurant, Category, MenuItem, Order, ServiceRequest } from '@/types/database';
import { CreateOrderInput, ServiceRequestInput } from './validators';
import { createClient } from './supabase/client';

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
  },
  wifi_config: {
    ssid: 'Addis-Guest',
    password: 'tastethevibes',
  },
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
