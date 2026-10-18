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
  image_url?: string;
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
  { name: 'cream cake', price: 200, category_id: 'cat-soft-cake', image_url: '/images/dishes/cream-cake-1.jpg', tags: ['vegetarian']  },
  { name: 'Black Forest', price: 230, category_id: 'cat-soft-cake', image_url: '/images/dishes/black-forest-2.jpg', tags: ['popular', 'vegetarian'], is_chefs_pick: true  },
  { name: 'Black&White Forest', price: 230, category_id: 'cat-soft-cake', image_url: '/images/dishes/black-white-forest-3.jpg', tags: ['vegetarian']  },
  { name: 'strawberry cake', price: 230, category_id: 'cat-soft-cake', image_url: '/images/dishes/strawberry-cake-4.jpg', tags: ['vegetarian']  },
  { name: 'Opera cake', price: 250, category_id: 'cat-soft-cake', image_url: '/images/dishes/opera-cake-5.jpg', tags: ['vegetarian']  },
  { name: 'Torta cake', price: 1500, category_id: 'cat-soft-cake', image_url: '/images/dishes/torta-cake-6.jpg', tags: ['popular', 'vegetarian']  },
  { name: 'Cup cake', price: 150, category_id: 'cat-soft-cake', image_url: '/images/dishes/cup-cake-7.jpg', tags: ['vegetarian']  },
  { name: 'English Cake', price: 1050, category_id: 'cat-soft-cake', image_url: '/images/dishes/english-cake-8.jpg', tags: ['vegetarian']  },
  { name: 'Basbousa', price: 100, category_id: 'cat-soft-cake', image_url: '/images/dishes/basbousa-9.jpg', tags: ['vegetarian']  },
  { name: 'Orange Basbousa', price: 190, category_id: 'cat-soft-cake', image_url: '/images/dishes/orange-basbousa-10.jpg', tags: ['vegetarian']  },
  { name: 'Croissant Plain', price: 150, category_id: 'cat-soft-cake', image_url: '/images/dishes/croissant-plain-11.jpg', tags: ['vegetarian']  },
  { name: 'White Plain', price: 150, category_id: 'cat-soft-cake', image_url: '/images/dishes/white-plain-12.jpg', tags: ['vegetarian']  },
  { name: 'Orange Fasting', price: 150, category_id: 'cat-soft-cake', image_url: '/images/dishes/orange-fasting-13.jpg', tags: ['vegan', 'fasting']  },
  { name: 'Orange cake', price: 150, category_id: 'cat-soft-cake', image_url: '/images/dishes/orange-cake-14.jpg', tags: ['vegetarian']  },
  { name: 'Venus plain BIG', price: 150, category_id: 'cat-soft-cake', image_url: '/images/dishes/venus-plain-big-15.jpg', tags: ['vegetarian']  },
  { name: 'Venus plane SHORT', price: 100, category_id: 'cat-soft-cake', image_url: '/images/dishes/venus-plane-short-16.jpg', tags: ['vegetarian']  },
  { name: 'Beckewhe', price: 80, category_id: 'cat-soft-cake', image_url: '/images/dishes/beckewhe-17.jpg', tags: ['vegetarian']  },
  { name: 'COOKISE', price: 800, category_id: 'cat-soft-cake', image_url: '/images/dishes/cookise-18.jpg', tags: ['vegetarian']  },

  // 2. Bread
  { name: 'CALVINE BREAD', price: 50, category_id: 'cat-bread', image_url: '/images/dishes/calvine-bread-19.jpg', tags: ['vegan']  },
  { name: 'OTES BREAD', price: 50, category_id: 'cat-bread', image_url: '/images/dishes/otes-bread-20.jpg', tags: ['vegan']  },
  { name: 'FEWAST BREAD', price: 50, category_id: 'cat-bread', image_url: '/images/dishes/fewast-bread-21.jpg', tags: ['vegan']  },
  { name: 'RAGEST BRADE', price: 50, category_id: 'cat-bread', image_url: '/images/dishes/ragest-brade-22.jpg', tags: ['vegan']  },
  { name: 'AJA BREAD', price: 20, category_id: 'cat-bread', image_url: '/images/dishes/aja-bread-23.jpg', tags: ['vegan']  },
  { name: 'AJA RAGKESTE', price: 10, category_id: 'cat-bread', image_url: '/images/dishes/aja-ragkeste-24.jpg', tags: ['vegan']  },
  { name: 'GEBIS BREAD', price: 15, category_id: 'cat-bread', image_url: '/images/dishes/gebis-bread-25.jpg', tags: ['vegan']  },
  { name: 'GEBIS BAGET', price: 15, category_id: 'cat-bread', image_url: '/images/dishes/gebis-baget-26.jpg', tags: ['vegan']  },
  { name: 'GEBIS MINI', price: 15, category_id: 'cat-bread', image_url: '/images/dishes/gebis-mini-27.jpg', tags: ['vegan']  },
  { name: 'MIN BREAD ROG', price: 10, category_id: 'cat-bread', image_url: '/images/dishes/min-bread-rog-28.jpg', tags: ['vegan']  },
  { name: 'NORMAL BREAD 180G', price: 50, category_id: 'cat-bread', image_url: '/images/dishes/normal-bread-180g-29.jpg', tags: ['vegan']  },
  { name: 'NORMAL BREAD 110G', price: 20, category_id: 'cat-bread', image_url: '/images/dishes/normal-bread-110g-30.jpg', tags: ['vegan']  },
  { name: 'CARE BREAD', price: 100, category_id: 'cat-bread', image_url: '/images/dishes/care-bread-31.jpg', tags: ['vegan']  },
  { name: 'CRIZIL BREAD', price: 50, category_id: 'cat-bread', image_url: '/images/dishes/crizil-bread-32.jpg', tags: ['vegan']  },
  { name: 'GEBIC CAKE', price: 100, category_id: 'cat-bread', image_url: '/images/dishes/gebic-cake-33.jpg', tags: ['vegetarian']  },
  { name: 'AJA BAGESTE LONG', price: 50, category_id: 'cat-bread', image_url: '/images/dishes/aja-bageste-long-34.jpg', tags: ['vegan']  },
  { name: 'BABESFI BREAD', price: 150, category_id: 'cat-bread', image_url: '/images/dishes/babesfi-bread-35.jpg', tags: ['vegan']  },
  { name: 'BOMBOLINO', price: 60, category_id: 'cat-bread', image_url: '/images/dishes/bombolino-36.jpg', tags: ['vegetarian']  },
  { name: 'BOKSENYA', price: 110, category_id: 'cat-bread', image_url: '/images/dishes/boksenya-37.jpg', tags: ['vegan']  },

  // 3. Berak Fast
  { name: 'Feta with Honey', price: 350, category_id: 'cat-breakfast', image_url: '/images/dishes/feta-with-honey-38.jpg', tags: ['vegetarian', 'popular']  },
  { name: 'Feta with Tamer', price: 350, category_id: 'cat-breakfast', image_url: '/images/dishes/feta-with-tamer-39.jpg', tags: ['vegetarian']  },
  { name: 'Feta with Honey, Tamer, and banana', price: 450, category_id: 'cat-breakfast', image_url: '/images/dishes/feta-with-honey-tamer-and-banana-40.jpg', tags: ['vegetarian', 'popular'], is_chefs_pick: true  },
  { name: 'Fetira', price: 300, category_id: 'cat-breakfast', image_url: '/images/dishes/fetira.jpeg', tags: ['vegetarian']  },
  { name: 'Special Fetira', price: 450, category_id: 'cat-breakfast', image_url: '/images/dishes/special-fetira.jpg', tags: ['vegetarian', 'popular'], is_chefs_pick: true  },
  { name: 'Full Normal', price: 280, category_id: 'cat-breakfast', image_url: '/images/dishes/full-normal-43.jpg', tags: ['vegetarian']  },
  { name: 'Full Special', price: 575, category_id: 'cat-breakfast', image_url: '/images/dishes/ful-special.jpg', tags: ['vegetarian', 'popular']  },
  { name: 'Addis Combo Break fast', price: 750, category_id: 'cat-breakfast', image_url: '/images/dishes/addis-combo-break-fast-45.jpg', tags: ['popular'], is_chefs_pick: true  },
  { name: 'Scramble Egg', price: 300, category_id: 'cat-breakfast', image_url: '/images/dishes/scramble-egg-46.jpg', tags: ['vegetarian']  },
  { name: 'Egg Sandwich', price: 350, category_id: 'cat-breakfast', image_url: '/images/dishes/egg-sandwich-47.jpg', tags: ['vegetarian']  },
  { name: 'Omelet', price: 350, category_id: 'cat-breakfast', image_url: '/images/dishes/omelet-48.jpg', tags: ['vegetarian']  },
  { name: 'Avocado Toast', price: 350, category_id: 'cat-breakfast', image_url: '/images/dishes/avocado-toast-49.jpg', tags: ['vegan', 'fasting']  },
  { name: 'Chechebisa Fasting', price: 300, category_id: 'cat-breakfast', image_url: '/images/dishes/chechebisa-fasting-50.jpg', tags: ['vegan', 'fasting']  },
  { name: 'Chechebisa', price: 400, category_id: 'cat-breakfast', image_url: '/images/dishes/chechebisa-51.jpg', tags: ['vegetarian', 'popular']  },
  { name: 'Chechebisa Teff', price: 400, category_id: 'cat-breakfast', image_url: '/images/dishes/chechebisa-teff-52.jpg', tags: ['gluten-free', 'vegetarian']  },
  { name: 'Oats', price: 300, category_id: 'cat-breakfast', image_url: '/images/dishes/oats-53.jpg', tags: ['vegan', 'fasting']  },
  { name: 'Siga Firfir', price: 500, category_id: 'cat-breakfast', image_url: '/images/dishes/siga-firfir-54.jpg', tags: ['popular']  },
  { name: 'Injera Firfir', price: 350, category_id: 'cat-breakfast', image_url: '/images/dishes/injera-firfir-55.jpg', tags: ['vegan', 'fasting']  },

  // 4. Burgers
  { name: 'Special Burger', price: 799, category_id: 'cat-burgers', image_url: '/images/dishes/special-burger-56.jpg', tags: ['popular'], is_chefs_pick: true  },
  { name: 'Chicken Burger', price: 599, category_id: 'cat-burgers', image_url: '/images/dishes/chicken-burger-57.jpg', tags: ['popular']  },
  { name: 'Cheese Burger', price: 599, category_id: 'cat-burgers', image_url: '/images/dishes/cheese-burger-58.jpg', tags: ['popular']  },
  { name: 'Beef Burger', price: 498, category_id: 'cat-burgers', image_url: '/images/dishes/beef-burger-59.jpg', tags: ['popular']  },

  // 5. Pizzas
  { name: 'Speacial Pizza', price: 1099, category_id: 'cat-pizzas', image_url: '/images/dishes/speacial-pizza-60.jpg', tags: ['popular'], is_chefs_pick: true  },
  { name: 'Margarita Pizza', price: 700, category_id: 'cat-pizzas', image_url: '/images/dishes/margarita-pizza-61.jpg', tags: ['vegetarian']  },
  { name: 'Chicken Pizza', price: 899, category_id: 'cat-pizzas', image_url: '/images/dishes/chicken-pizza-62.jpg', tags: ['popular']  },
  { name: 'Tuna Pizza', price: 899, category_id: 'cat-pizzas', image_url: '/images/dishes/tuna-pizza-63.jpg', tags: ['popular']  },
  { name: 'Vegetable Pizza', price: 460, category_id: 'cat-pizzas', image_url: '/images/dishes/vegetable-pizza-64.jpg', tags: ['vegan', 'fasting']  },

  // 6. Snack Menu
  { name: 'French frise', price: 345, category_id: 'cat-snack-menu', image_url: '/images/dishes/french-frise-65.jpg', tags: ['vegan', 'fasting']  },
  { name: 'Spring roll vegetable', price: 345, category_id: 'cat-snack-menu', image_url: '/images/dishes/spring-roll-vegetable-66.jpg', tags: ['vegan', 'fasting']  },
  { name: 'Spring roll meat', price: 500, category_id: 'cat-snack-menu', image_url: '/images/dishes/spring-roll-meat-67.jpg', tags: ['popular']  },
  { name: 'Addis snack', price: 575, category_id: 'cat-snack-menu', image_url: '/images/dishes/addis-snack-68.jpg', tags: ['popular']  },
  { name: 'Fish & chips', price: 750, category_id: 'cat-snack-menu', image_url: '/images/dishes/fish-chips-69.jpg', tags: ['popular'], is_chefs_pick: true  },
  { name: 'Fried Chicken wings', price: 750, category_id: 'cat-snack-menu', image_url: '/images/dishes/fried-chicken-wings-70.jpg', tags: ['popular']  },
  { name: 'Chicken nugget', price: 750, category_id: 'cat-snack-menu', image_url: '/images/dishes/chicken-nugget-71.jpg', tags: ['popular']  },
  { name: 'A. Chicken Tender 4pcs', price: 600, category_id: 'cat-snack-menu', image_url: '/images/dishes/a-chicken-tender-4pcs-72.jpg', tags: ['popular']  },
  { name: 'A. Chicken Tender 6pcs', price: 800, category_id: 'cat-snack-menu', image_url: '/images/dishes/a-chicken-tender-6pcs-73.jpg', tags: ['popular'], is_chefs_pick: true  },

  // 7. Hot Beverage (Addis Cafe)
  { name: 'SPECIAL MILK', price: 200, category_id: 'cat-hot-beverage', image_url: '/images/dishes/special-milk-74.jpg', tags: ['vegetarian']  },
  { name: 'COFFEE', price: 120, category_id: 'cat-hot-beverage', image_url: '/images/dishes/ethiopian-buna.jpg', tags: ['vegan', 'popular']  },
  { name: 'TEA', price: 60, category_id: 'cat-hot-beverage', image_url: '/images/dishes/tea-76.jpg', tags: ['vegan']  },
  { name: 'MACCHIATO', price: 120, category_id: 'cat-hot-beverage', image_url: '/images/dishes/macchiato-77.jpg', tags: ['vegetarian', 'popular']  },
  { name: 'DOUBLE MACCHIATO', price: 220, category_id: 'cat-hot-beverage', image_url: '/images/dishes/double-macchiato-78.jpg', tags: ['vegetarian', 'popular'], is_chefs_pick: true  },
  { name: 'STEAM COFFEE', price: 100, category_id: 'cat-hot-beverage', image_url: '/images/dishes/steam-coffee-79.jpg', tags: ['vegan']  },
  { name: 'SPECIAL TEA', price: 200, category_id: 'cat-hot-beverage', image_url: '/images/dishes/special-tea-80.jpg', tags: ['vegan', 'popular']  },
  { name: 'SAFI MILK', price: 120, category_id: 'cat-hot-beverage', image_url: '/images/dishes/safi-milk-81.jpg', tags: ['vegetarian']  },
  { name: 'CAFE LATE', price: 150, category_id: 'cat-hot-beverage', image_url: '/images/dishes/cafe-late-82.jpg', tags: ['vegetarian']  },
  { name: 'CAPPUCCINO', price: 200, category_id: 'cat-hot-beverage', image_url: '/images/dishes/cappuccino-83.jpg', tags: ['vegetarian']  },
  { name: 'GINGER TEA', price: 100, category_id: 'cat-hot-beverage', image_url: '/images/dishes/ginger-tea-84.jpg', tags: ['vegan', 'fasting']  },
  { name: 'LEWOZE TEA', price: 170, category_id: 'cat-hot-beverage', image_url: '/images/dishes/lewoze-tea-85.jpg', tags: ['vegan']  },
  { name: 'MILK TEA', price: 140, category_id: 'cat-hot-beverage', image_url: '/images/dishes/milk-tea-86.jpg', tags: ['vegetarian']  },
  { name: 'SOMALI TEA', price: 140, category_id: 'cat-hot-beverage', image_url: '/images/dishes/somali-tea-87.jpg', tags: ['vegan', 'popular']  },
  { name: 'GREEN TEA', price: 80, category_id: 'cat-hot-beverage', image_url: '/images/dishes/green-tea-88.jpg', tags: ['vegan', 'fasting']  },
  { name: 'ORANGE TEA', price: 120, category_id: 'cat-hot-beverage', image_url: '/images/dishes/orange-tea-89.jpg', tags: ['vegan', 'fasting']  },
  { name: 'AMERICANO COFFEE', price: 200, category_id: 'cat-hot-beverage', image_url: '/images/dishes/americano-coffee-90.jpg', tags: ['vegan']  },
  { name: 'LEMON TEA', price: 80, category_id: 'cat-hot-beverage', image_url: '/images/dishes/lemon-tea-91.jpg', tags: ['vegan', 'fasting']  },
  { name: 'SPRICE TEA', price: 120, category_id: 'cat-hot-beverage', image_url: '/images/dishes/sprice-tea-92.jpg', tags: ['vegan']  },
  { name: 'HOT CHOCOLATE', price: 200, category_id: 'cat-hot-beverage', image_url: '/images/dishes/hot-chocolate-93.jpg', tags: ['vegetarian']  },
  { name: 'NANA TEA', price: 100, category_id: 'cat-hot-beverage', image_url: '/images/dishes/nana-tea-94.jpg', tags: ['vegan', 'fasting']  },
  { name: 'LIPTON TEA', price: 80, category_id: 'cat-hot-beverage', image_url: '/images/dishes/lipton-tea-95.jpg', tags: ['vegan']  },

  // 8. Juice
  { name: 'AVOCADO', price: 300, category_id: 'cat-juice', image_url: '/images/dishes/avocado-96.jpg', tags: ['vegan', 'fasting', 'popular'], is_chefs_pick: true  },
  { name: 'PAPAYA JUICE', price: 300, category_id: 'cat-juice', image_url: '/images/dishes/papaya-juice-97.jpg', tags: ['vegan', 'fasting']  },
  { name: 'WATERMELON JUICE', price: 300, category_id: 'cat-juice', image_url: '/images/dishes/watermelon-juice-98.jpg', tags: ['vegan', 'fasting']  },
  { name: 'MANGO', price: 350, category_id: 'cat-juice', image_url: '/images/dishes/mango-99.jpg', tags: ['vegan', 'fasting', 'popular']  },
  { name: 'SPRICE JUICE', price: 350, category_id: 'cat-juice', image_url: '/images/dishes/spris-juice.jpg', tags: ['vegan', 'fasting', 'popular']  },
  { name: 'GISHITA JUICE', price: 350, category_id: 'cat-juice', image_url: '/images/dishes/gishita-juice-101.jpg', tags: ['vegan', 'fasting']  },
  { name: 'ANANAS', price: 350, category_id: 'cat-juice', image_url: '/images/dishes/ananas-102.jpg', tags: ['vegan', 'fasting']  },
  { name: 'ORANGE', price: 350, category_id: 'cat-juice', image_url: '/images/dishes/orange-103.jpg', tags: ['vegan', 'fasting']  },
  { name: 'GINGER JUICE', price: 280, category_id: 'cat-juice', image_url: '/images/dishes/ginger-juice-104.jpg', tags: ['vegan', 'fasting']  },
  { name: 'STROBERRY SHAKE', price: 280, category_id: 'cat-juice', image_url: '/images/dishes/stroberry-shake-105.jpg', tags: ['vegetarian']  },
  { name: 'BANANA SHAKE', price: 400, category_id: 'cat-juice', image_url: '/images/dishes/banana-shake-106.jpg', tags: ['vegetarian']  },
  { name: 'AVOCADO SHAKE', price: 400, category_id: 'cat-juice', image_url: '/images/dishes/avocado-shake-107.jpg', tags: ['vegetarian']  },
  { name: 'MANGO SHAKE', price: 400, category_id: 'cat-juice', image_url: '/images/dishes/mango-shake-108.jpg', tags: ['vegetarian']  },
  { name: 'CHOCOLATE SHAKE', price: 450, category_id: 'cat-juice', image_url: '/images/dishes/chocolate-shake-109.jpg', tags: ['vegetarian']  },
  { name: 'Special juice', price: 450, category_id: 'cat-juice', image_url: '/images/dishes/special-juice-110.jpg', tags: ['vegan', 'popular'], is_chefs_pick: true  },

  // 9. Cold Drinks
  { name: 'ICE COFFEE', price: 200, category_id: 'cat-cold-drinks', image_url: '/images/dishes/ice-coffee-111.jpg', tags: ['vegan', 'popular']  },
  { name: 'ICE LATE/AMERICANO', price: 200, category_id: 'cat-cold-drinks', image_url: '/images/dishes/ice-late-americano-112.jpg', tags: ['vegetarian']  },
  { name: 'MOJITO', price: 350, category_id: 'cat-cold-drinks', image_url: '/images/dishes/mojito-113.jpg', tags: ['vegan', 'popular']  },
  { name: 'SOFT DRINKS', price: 80, category_id: 'cat-cold-drinks', image_url: '/images/dishes/soft-drinks-114.jpg', tags: ['vegan']  },
  { name: 'AMBO WATER', price: 100, category_id: 'cat-cold-drinks', image_url: '/images/dishes/ambo-water-115.jpg', tags: ['vegan', 'popular']  },
  { name: 'WATER 300ML', price: 305, category_id: 'cat-cold-drinks', image_url: '/images/dishes/water-300ml-116.jpg', tags: ['vegan']  },
  { name: 'WATER 600ML', price: 50, category_id: 'cat-cold-drinks', image_url: '/images/dishes/water-600ml-117.jpg', tags: ['vegan']  },
  { name: 'WATER 1000ML', price: 70, category_id: 'cat-cold-drinks', image_url: '/images/dishes/water-1000ml-118.jpg', tags: ['vegan']  },
  { name: 'CARAMEL ICED COFFEE', price: 200, category_id: 'cat-cold-drinks', image_url: '/images/dishes/caramel-iced-coffee-119.jpg', tags: ['vegetarian']  },

  // 10. Lunch and Dinner
  { name: 'Yebeg Tibs', price: 900, category_id: 'cat-lunch-dinner', image_url: '/images/dishes/yebeg-tibs.jpg', tags: ['popular'], is_chefs_pick: true  },
  { name: 'Rice with meat', price: 575, category_id: 'cat-lunch-dinner', image_url: '/images/dishes/rice-with-meat-121.jpg', tags: ['popular']  },
  { name: 'Rice with Vegetable', price: 450, category_id: 'cat-lunch-dinner', image_url: '/images/dishes/rice-with-vegetable-122.jpg', tags: ['vegan', 'fasting']  },
  { name: 'Quanta Firfir', price: 550, category_id: 'cat-lunch-dinner', image_url: '/images/dishes/quanta-firfir.jpg', tags: ['popular']  },
  { name: 'Shiro with Butter', price: 400, category_id: 'cat-lunch-dinner', image_url: '/images/dishes/shiro.jpg', tags: ['vegetarian', 'popular']  },
  { name: 'Smart shiro', price: 400, category_id: 'cat-lunch-dinner', image_url: '/images/dishes/smart-shiro-125.jpg', tags: ['vegetarian']  },
  { name: 'Pasta with Vegetable', price: 450, category_id: 'cat-lunch-dinner', image_url: '/images/dishes/pasta-with-vegetable-126.jpg', tags: ['vegan', 'fasting']  },
  { name: 'Pasta with meat', price: 575, category_id: 'cat-lunch-dinner', image_url: '/images/dishes/pasta-with-meat-127.jpg', tags: ['popular']  },
  { name: 'Pasta with tomato', price: 400, category_id: 'cat-lunch-dinner', image_url: '/images/dishes/pasta-with-tomato-128.jpg', tags: ['vegan', 'fasting']  },
  { name: 'Doro Tibs', price: 800, category_id: 'cat-lunch-dinner', image_url: '/images/dishes/doro-tibs-129.jpg', tags: ['popular'], is_chefs_pick: true  },
  { name: 'Vigitable sup', price: 300, category_id: 'cat-lunch-dinner', image_url: '/images/dishes/vigitable-sup-130.jpg', tags: ['vegan', 'fasting']  },
  { name: 'Chikina Tibs', price: 900, category_id: 'cat-lunch-dinner', image_url: '/images/dishes/chikina-tibs-131.jpg', tags: ['popular'], is_chefs_pick: true  },
  { name: 'Tibs Tefersho', price: 700, category_id: 'cat-lunch-dinner', image_url: '/images/dishes/tibs-tefersho-132.jpg', tags: ['popular']  },
  { name: 'Yebeg Keywot', price: 700, category_id: 'cat-lunch-dinner', image_url: '/images/dishes/yebeg-keywot.jpg', tags: ['popular']  },
  { name: 'Agelegil', price: 900, category_id: 'cat-lunch-dinner', image_url: '/images/dishes/agelegil-134.jpg', tags: ['popular'], is_chefs_pick: true  },
  { name: 'Gomen Besiga', price: 700, category_id: 'cat-lunch-dinner', image_url: '/images/dishes/gomen-besiga-135.jpg', tags: ['popular']  },
  { name: 'Grilled Fish', price: 850, category_id: 'cat-lunch-dinner', image_url: '/images/dishes/grilled-fish-136.jpg', tags: ['popular']  },

  // 11. Mendi
  { name: 'Mofo', price: 700, category_id: 'cat-mendi', image_url: '/images/dishes/mofo-137.jpg', tags: ['popular']  },
  { name: 'Special Mendi', price: 2000, category_id: 'cat-mendi', image_url: '/images/dishes/special-mendi.jpg', tags: ['popular'], is_chefs_pick: true  },
  { name: 'Mend 1/2', price: 900, category_id: 'cat-mendi', image_url: '/images/dishes/mend-1-2-139.jpg', tags: ['popular']  },
  { name: 'Mend Full', price: 1800, category_id: 'cat-mendi', image_url: '/images/dishes/mend-full-140.jpg', tags: ['popular'], is_chefs_pick: true  },
  { name: '1/2 Roasted Chicken', price: 1098, category_id: 'cat-mendi', image_url: '/images/dishes/1-2-roasted-chicken-141.jpg', tags: ['popular']  },
  { name: 'Roasted Chicken Full', price: 1900, category_id: 'cat-mendi', image_url: '/images/dishes/roasted-chicken-full-142.jpg', tags: ['popular'], is_chefs_pick: true  },

  // 12. Half Half
  { name: 'Keywot and Fitfit', price: 790, category_id: 'cat-half-half', image_url: '/images/dishes/keywot-and-fitfit-143.jpg', tags: ['popular'], is_chefs_pick: true  },
  { name: 'Tibs and Fitfit', price: 900, category_id: 'cat-half-half', image_url: '/images/dishes/tibs-and-fitfit-144.jpg', tags: ['popular'], is_chefs_pick: true  },
  { name: 'Cooked Vegs and Aja', price: 600, category_id: 'cat-half-half', image_url: '/images/dishes/cooked-vegs-and-aja-145.jpg', tags: ['vegan', 'fasting']  },

  // 13. Wraps
  { name: 'Tuna Sandwich', price: 600, category_id: 'cat-wraps', image_url: '/images/dishes/tuna-sandwich-146.jpg', tags: ['popular']  },
  { name: 'Beef Shewarema', price: 699, category_id: 'cat-wraps', image_url: '/images/dishes/beef-shewarema-147.jpg', tags: ['popular'], is_chefs_pick: true  },
  { name: 'Chicken Shewarma', price: 600, category_id: 'cat-wraps', image_url: '/images/dishes/chicken-shewarma-148.jpg', tags: ['popular']  },

  // 14. Fasting Lunch
  { name: 'Shiro', price: 350, category_id: 'cat-fasting-lunch', image_url: '/images/dishes/shiro-149.jpg', tags: ['vegan', 'fasting', 'popular']  },
  { name: 'Beyaynetu', price: 500, category_id: 'cat-fasting-lunch', image_url: '/images/dishes/beyaynetu.jpg', tags: ['vegan', 'fasting', 'popular'], is_chefs_pick: true  },
  { name: 'Fasting Agelegil', price: 600, category_id: 'cat-fasting-lunch', image_url: '/images/dishes/fasting-agelegil-151.jpg', tags: ['vegan', 'fasting', 'popular']  },
  { name: 'Suf fitfit', price: 350, category_id: 'cat-fasting-lunch', image_url: '/images/dishes/suf-fitfit-152.jpg', tags: ['vegan', 'fasting']  },
  { name: 'Addis special Salad', price: 400, category_id: 'cat-fasting-lunch', image_url: '/images/dishes/addis-special-salad-153.jpg', tags: ['vegan', 'fasting']  },
  { name: 'Aja with spinach', price: 400, category_id: 'cat-fasting-lunch', image_url: '/images/dishes/aja-with-spinach-154.jpg', tags: ['vegan', 'fasting']  },

  // 15. Takeaway & Extras
  { name: 'Takeaway', price: 50, category_id: 'cat-takeaway-extras', image_url: '/images/dishes/takeaway-155.jpg', tags: []  },
  { name: 'Pizza takeaway', price: 100, category_id: 'cat-takeaway-extras', image_url: '/images/dishes/pizza-takeaway-156.jpg', tags: []  },
  { name: 'Extra cheese', price: 100, category_id: 'cat-takeaway-extras', image_url: '/images/dishes/extra-cheese-157.jpg', tags: ['vegetarian']  },
];
