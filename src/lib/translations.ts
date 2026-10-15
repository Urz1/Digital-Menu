export type Language = 'en' | 'am' | 'so' | 'es';

export interface CategoryTranslation {
  name: string;
  description: string;
}

export interface AppTranslations {
  // Navigation & Header
  openNow: string;
  closed: string;
  table: string;
  wifi: string;
  wifiCopied: string;
  searchPlaceholder: string;
  allCategories: string;
  browseCategories: string;
  nextCategory: string;
  endOfCategory: string;
  viewCategory: string;

  // Filters & Sorting
  filterAll: string;
  filterOnOffer: string;
  filterChefsPick: string;
  filterFasting: string;
  filterVegetarian: string;
  filterVegan: string;
  filterGlutenFree: string;
  filterHalal: string;
  filterSpicy: string;
  sortLabel: string;
  sortFeatured: string;
  sortPriceAsc: string;
  sortPriceDesc: string;
  sortNameAsc: string;

  // Item Cards & Modal
  addToOrder: string;
  soldOut: string;
  chefsPick: string;
  specialOffer: string;
  saveAmount: string;
  customizations: string;
  goesWellWith: string;
  authenticPairing: string;
  spiceLevel: string;
  spiceNone: string;
  dietary: string;
  allergens: string;
  containsAllergens: string;
  guestReviews: string;
  reviewsCount: string;
  rateThisDish: string;
  noReviewsYet: string;
  reportReview: string;

  // Order Bar & Summary Sheet
  reviewOrder: string;
  myOrder: string;
  itemsSubtotal: string;
  totalSavings: string;
  taxLabel: string;
  taxIncluded: string;
  total: string;
  showToWaiter: string;
  clearAll: string;
  emptyOrder: string;
  emptyOrderHint: string;
  addedToOrder: string;

  // Service & Notices
  offlineNotice: string;
  offlineBadge: string;
  comingSoonCalling: string;
  waiterAssistance: string;
}

export const TRANSLATIONS: Record<Language, AppTranslations> = {
  en: {
    openNow: 'Open Now • Dine-In',
    closed: 'Closed',
    table: 'Table',
    wifi: 'WiFi',
    wifiCopied: 'WiFi info copied',
    searchPlaceholder: 'Search dishes, ingredients, dietary tags...',
    allCategories: 'All Categories',
    browseCategories: 'Menu Directory',
    nextCategory: 'Next Category',
    endOfCategory: 'End of',
    viewCategory: 'View Dishes',

    filterAll: 'All',
    filterOnOffer: '🏷️ On Offer',
    filterChefsPick: '⭐ Chef Picks',
    filterFasting: '🥗 Fasting (Tsom)',
    filterVegetarian: '🌱 Vegetarian',
    filterVegan: '🌿 Vegan',
    filterGlutenFree: '🌾 Gluten-Free',
    filterHalal: '🥩 Halal',
    filterSpicy: '🌶️ Spicy',

    sortLabel: 'Sort',
    sortFeatured: '⭐ Featured & Popular',
    sortPriceAsc: '💵 Price: Low to High',
    sortPriceDesc: '💎 Price: High to Low',
    sortNameAsc: '🔤 Name: A to Z',

    addToOrder: 'Add to Order',
    soldOut: 'Sold Out Today',
    chefsPick: "Chef's Pick",
    specialOffer: 'Special Offer',
    saveAmount: 'Saved',
    customizations: 'Customizations & Add-ons',
    goesWellWith: 'Goes well with',
    authenticPairing: 'Authentic Pairing',
    spiceLevel: 'Spice Level',
    spiceNone: 'Mild / None',
    dietary: 'Dietary',
    allergens: 'Allergens',
    containsAllergens: 'Contains Allergens',
    guestReviews: 'Guest Reviews',
    reviewsCount: 'verified ratings',
    rateThisDish: 'Rate this dish',
    noReviewsYet: 'No reviews yet for this dish. Be the first to share your thoughts!',
    reportReview: 'Report',

    reviewOrder: 'Review My Order',
    myOrder: 'My Order',
    itemsSubtotal: 'Items Subtotal',
    totalSavings: 'Total Offer Savings',
    taxLabel: 'Tax (VAT)',
    taxIncluded: 'Included in menu prices',
    total: 'Total to Pay',
    showToWaiter: 'Show Order to Waiter',
    clearAll: 'Clear All',
    emptyOrder: 'Your order is currently empty',
    emptyOrderHint: 'Tap dishes on the menu to add them to your order',
    addedToOrder: 'Added to your order',

    offlineNotice: "You're offline — showing cached menu and offline order",
    offlineBadge: 'Offline Mode',
    comingSoonCalling: 'Digital waiter calling is coming soon. Please let your waiter know in person!',
    waiterAssistance: 'Ask Waiter',
  },

  am: {
    openNow: 'ክፍት ነው • በቦታው መመገብ',
    closed: 'ተዘግቷል',
    table: 'ጠረጴዛ',
    wifi: 'ዋይፋይ',
    wifiCopied: 'የዋይፋይ መረጃ ተቀድቷል',
    searchPlaceholder: 'ምግቦች፣ ግብዓቶች ወይም የጾም ምግቦችን ይፈልጉ...',
    allCategories: 'ሁሉም ምድቦች',
    browseCategories: 'የምግብ ዝርዝር ማውጫ',
    nextCategory: 'ቀጣይ ምድብ',
    endOfCategory: 'የዚህ ምድብ መጨረሻ፦',
    viewCategory: 'ምግቦቹን ይመልከቱ',

    filterAll: 'ሁሉም',
    filterOnOffer: '🏷️ ልዩ ቅናሽ',
    filterChefsPick: '⭐ የሼፍ ምርጥ',
    filterFasting: '🥗 የጾም ምግቦች',
    filterVegetarian: '🌱 አትክልት ብቻ',
    filterVegan: '🌿 ቪጋን',
    filterGlutenFree: '🌾 ከግሉተን ነፃ',
    filterHalal: '🥩 ሀላል',
    filterSpicy: '🌶️ ቃሪያ / የሚያቃጥል',

    sortLabel: 'አስተካክል',
    sortFeatured: '⭐ ተወዳጅ እና ታዋቂ',
    sortPriceAsc: '💵 ዋጋ፦ ከዝቅተኛ ወደ ከፍተኛ',
    sortPriceDesc: '💎 ዋጋ፦ ከከፍተኛ ወደ ዝቅተኛ',
    sortNameAsc: '🔤 በፊደል ተራ፦ ሀ እስከ ፐ',

    addToOrder: 'ወደ ትዕዛዝ አክል',
    soldOut: 'ዛሬ አልቋል',
    chefsPick: 'የሼፍ ምርጥ',
    specialOffer: 'ልዩ ቅናሽ',
    saveAmount: 'ቆጥበዋል',
    customizations: 'ተጨማሪ ምርጫዎች',
    goesWellWith: 'አብሮ የሚሄድ',
    authenticPairing: 'ባህላዊ አጋዥ ጥምረት',
    spiceLevel: 'የማቃጠል መጠን',
    spiceNone: 'የማያቃጥል / አልጫ',
    dietary: 'የአመጋገብ አይነት',
    allergens: 'አለርጂዎች',
    containsAllergens: 'የያዛቸው አለርጂዎች',
    guestReviews: 'የደንበኞች አስተያየት',
    reviewsCount: 'የተረጋገጡ ደረጃዎች',
    rateThisDish: 'ለዚህ ምግብ ደረጃ ይስጡ',
    noReviewsYet: 'እስካሁን ምንም አስተያየት አልተሰጠም። ቀዳሚ ሆነው ይገምግሙ!',
    reportReview: 'ሪፖርት አድርግ',

    reviewOrder: 'ትዕዛዜን ተመልከት',
    myOrder: 'የእኔ ትዕዛዝ',
    itemsSubtotal: 'የምግቦች ድምር',
    totalSavings: 'አጠቃላይ የቅናሽ ቁጠባ',
    taxLabel: 'ግብር (ቫት)',
    taxIncluded: 'በዋጋው ውስጥ ተካቷል',
    total: 'ጠቅላላ ክፍያ',
    showToWaiter: 'ትዕዛዙን ለአስተናጋጅ አሳይ',
    clearAll: 'ሁሉንም አፅዳ',
    emptyOrder: 'ትዕዛዝዎ ባዶ ነው',
    emptyOrderHint: 'ለመምረጥ በምናሌው ላይ ያሉትን ምግቦች ይጫኑ',
    addedToOrder: 'ወደ ትዕዛዝዎ ተጨምሯል',

    offlineNotice: 'ኢንተርኔት ተቋርጧል — የተቀመጠውን ምናሌ እያሳየ ነው',
    offlineBadge: 'ከመስመር ውጭ',
    comingSoonCalling: 'በስልክ አስተናጋጅ መጥራት በቅርቡ ይጀምራል፤ እባክዎ በአካል ያነጋግሩን!',
    waiterAssistance: 'አስተናጋጅ ይጠይቁ',
  },

  so: {
    openNow: 'Furan Hadda • Cunto Gudaha',
    closed: 'Xiran',
    table: 'Miiska',
    wifi: 'WiFi',
    wifiCopied: 'Xogta WiFi waa la koobiyay',
    searchPlaceholder: 'Raadi cuntooyin, walxo ama noocyo...',
    allCategories: 'Dhammaan Qeybaha',
    browseCategories: 'Liiska Qeybaha',
    nextCategory: 'Qeybta Xigta',
    endOfCategory: 'Dhamaadka',
    viewCategory: 'Eeg Cuntooyinka',

    filterAll: 'Dhammaan',
    filterOnOffer: '🏷️ Qiimo Dhimis',
    filterChefsPick: '⭐ Xulashada Cunto-kariyaha',
    filterFasting: '🥗 Khudaar (Fasting)',
    filterVegetarian: '🌱 Khudradeed',
    filterVegan: '🌿 Vegan',
    filterGlutenFree: '🌾 Gluten La’aan',
    filterHalal: '🥩 Xalaal',
    filterSpicy: '🌶️ Basbaas leh',

    sortLabel: 'Kala Saar',
    sortFeatured: '⭐ Caan & La Jecelyahay',
    sortPriceAsc: '💵 Qiimaha: Hoose ilaa Sare',
    sortPriceDesc: '💎 Qiimaha: Sare ilaa Hoose',
    sortNameAsc: '🔤 Magaca: A ilaa Z',

    addToOrder: 'Ku dar Dalabka',
    soldOut: 'Maanta Waa Go’ay',
    chefsPick: 'Xulashada Kariyaha',
    specialOffer: 'Dalab Gaar ah',
    saveAmount: 'Badbaadi',
    customizations: 'Xulashooyin Dheeri ah',
    goesWellWith: 'Waxyaabaha la socda',
    authenticPairing: 'Isku-dhafid Dhaqan ah',
    spiceLevel: 'Heerka Basbaaska',
    spiceNone: 'Bilaa Basbaas / Khafiif',
    dietary: 'Nooca Cuntada',
    allergens: 'Waxyaabaha Xasaasiyadda',
    containsAllergens: 'Waxaa ku jira Xasaasiyad',
    guestReviews: 'Fikradaha Macaamiisha',
    reviewsCount: 'qiimeyn xaqiiq ah',
    rateThisDish: 'Qiimee cuntadan',
    noReviewsYet: 'Weli fikrad lagama dhiiban cuntadan. Noqo qofka ugu horeeya!',
    reportReview: 'Gudbi Cabasho',

    reviewOrder: 'Eeg Dalabkayga',
    myOrder: 'Dalabkayga',
    itemsSubtotal: 'Wadarta Cuntooyinka',
    totalSavings: 'Wadarta Qiimo Dhimista',
    taxLabel: 'Canshuur (VAT)',
    taxIncluded: 'Waxay ku jirtaa qiimaha',
    total: 'Wadarta Guud',
    showToWaiter: 'U tus Dalabka Qofka Khidmadda',
    clearAll: 'Tir Dhammaan',
    emptyOrder: 'Dalabkaagu hadda waa madhan yahay',
    emptyOrderHint: 'Guji cuntooyinka si aad ugu darto dalabkaaga',
    addedToOrder: 'Waxaa lagu daray dalabkaaga',

    offlineNotice: 'Khad la’aan — waxaad arkaysaa liiskii hore ee keydsanaa',
    offlineBadge: 'Khad La’aan',
    comingSoonCalling: 'Wicitaanka tooska ah ee shaqaalaha dhawaan ayuu furmi doonaa. Fadlan toos ula hadal adeegahaaga!',
    waiterAssistance: 'Weydii Adeegaha',
  },
  es: {
    openNow: 'Abierto ahora • Para comer aquí',
    closed: 'Cerrado',
    table: 'Mesa',
    wifi: 'Wi-Fi',
    wifiCopied: 'Información de Wi-Fi copiada',
    searchPlaceholder: 'Buscar platos, ingredientes o alérgenos...',
    allCategories: 'Todas las categorías',
    browseCategories: 'Directorio del menú',
    nextCategory: 'Siguiente categoría',
    endOfCategory: 'Fin de',
    viewCategory: 'Ver platos',

    filterAll: 'Todos',
    filterOnOffer: '🏷️ En oferta',
    filterChefsPick: '⭐ Selección del chef',
    filterFasting: '🥗 Ayuno (Tsom)',
    filterVegetarian: '🌱 Vegetariano',
    filterVegan: '🌿 Vegano',
    filterGlutenFree: '🌾 Sin gluten',
    filterHalal: '🥩 Halal',
    filterSpicy: '🌶️ Picante',

    sortLabel: 'Ordenar',
    sortFeatured: '⭐ Destacados y populares',
    sortPriceAsc: '💵 Precio: de menor a mayor',
    sortPriceDesc: '💎 Precio: de mayor a menor',
    sortNameAsc: '🔤 Nombre: A a Z',

    addToOrder: 'Añadir al pedido',
    soldOut: 'Agotado hoy',
    chefsPick: 'Selección del chef',
    specialOffer: 'Oferta especial',
    saveAmount: 'Ahorra',
    customizations: 'Personalizaciones y extras',
    goesWellWith: 'Combina bien con',
    authenticPairing: 'Maridaje auténtico',
    spiceLevel: 'Nivel de picante',
    spiceNone: 'Suave / Ninguno',
    dietary: 'Dietético',
    allergens: 'Alérgenos',
    containsAllergens: 'Contiene alérgenos',
    guestReviews: 'Opiniones de clientes',
    reviewsCount: 'calificaciones verificadas',
    rateThisDish: 'Califica este plato',
    noReviewsYet: 'Aún no hay opiniones sobre este plato. ¡Sé el primero!',
    reportReview: 'Reportar',

    reviewOrder: 'Revisar mi pedido',
    myOrder: 'Mi pedido',
    itemsSubtotal: 'Subtotal de platos',
    totalSavings: 'Ahorro total en ofertas',
    taxLabel: 'Impuestos (IVA)',
    taxIncluded: 'Incluido en precios del menú',
    total: 'Total a pagar',
    showToWaiter: 'Mostrar pedido al mesero',
    clearAll: 'Borrar todo',
    emptyOrder: 'Tu pedido está vacío',
    emptyOrderHint: 'Toca los platos del menú para añadirlos a tu pedido',
    addedToOrder: 'Añadido a tu pedido',

    offlineNotice: 'Estás sin conexión — mostrando menú guardado y pedido offline',
    offlineBadge: 'Modo sin conexión',
    comingSoonCalling: 'La llamada digital al mesero estará disponible pronto. ¡Por favor avisa a tu mesero en persona!',
    waiterAssistance: 'Pedir ayuda',
  },
};

export const CATEGORY_TRANSLATIONS: Record<string, Partial<Record<Language, CategoryTranslation>>> = {
  'cat-breakfast': {
    en: { name: 'Breakfast', description: 'Freshly made morning staples with fresh injera & toasted artisan bread' },
    am: { name: 'የጥዋት ቁርስ', description: 'በትኩስ እንጀራ እና ዳቦ የሚቀርቡ ምርጥ የጠዋት ምግቦች' },
    so: { name: 'Quraac', description: 'Quraac fariish ah oo lagu diyaariyay canjeero iyo rooti macaan' },
  },
  'cat-mains': {
    en: { name: 'Traditional Mains (Tibs & Firfir)', description: 'Sizzling Ethiopian meats and richly seasoned firfir platters' },
    am: { name: 'ባህላዊ ምግቦች (ጥብስ እና ፍርፍር)', description: 'በጋለ ምጣድ የሚቀርቡ የፍየል እና የበሬ ጥብሶች እና ልዩ ፍርፍሮች' },
    so: { name: 'Cuntooyinka Dhaqanka (Hilib & Firfir)', description: 'Hilib shiilan iyo suqaar dhaqameed aad u macaan' },
  },
  'cat-fasting': {
    en: { name: 'Fasting & Vegan Dishes', description: 'Traditional Ethiopian Orthodox fasting dishes prepared with zero animal products' },
    am: { name: 'የጾም ምግቦች', description: 'ከእንስሳት ተዋጽኦ ነፃ የሆኑ ልዩ የጾም በያይነቱ፣ ሽሮ እና የአትክልት ምግቦች' },
    so: { name: 'Cuntooyinka Khudaarta (Fasting)', description: 'Cuntooyin khudradeed oo aan lahayn hilib ama caano' },
  },
  'cat-mendi': {
    en: { name: 'Mendi & Roasts', description: 'Fragrant spiced basmati rice topped with tender roasted lamb, chicken & goat' },
    am: { name: 'መንዲ እና የተጠበሱ ምግቦች', description: 'በቅመማ ቅመም የበለጸገ የባስማቲ ሩዝ ከተጠበሰ የበግ እና የዶሮ ስጋ ጋር' },
    so: { name: 'Mandi & Hilib Duban', description: 'Bariis basmati udgoon oo lagu daray hilib ari, wan ama digaag duban' },
  },
  'cat-fastfood': {
    en: { name: 'Burgers & Sandwiches', description: 'Handcrafted beef patties, spiced club sandwiches and fresh wraps' },
    am: { name: 'በርገር እና ሳንድዊች', description: 'በጥንቃቄ የተዘጋጁ ጭማቂ ያላቸው በርገሮች እና ሳንድዊቾች' },
    so: { name: 'Burger & Saandwij', description: 'Burgero hilib lo’aad oo fariish ah iyo saandwijyo aad u macaan' },
  },
  'cat-shiro': {
    en: { name: 'Traditional Clay Shiro', description: 'Slow-simmered spiced chickpea stew bubbling in authentic clay tagamino pots' },
    am: { name: 'የሸክላ ሽሮ', description: 'በሸክላ ድስት የሚንተከተክ ተጋሚኖ እና ቦዘና ሽሮ' },
    so: { name: 'Shiro Dhaqan ah (Dheri)', description: 'Shiro xawaash leh oo lagu kariyay dheri dhoobo ah' },
  },
  'cat-pastries': {
    en: { name: 'Artisanal Pastries & Bakery', description: 'Buttery croissants, specialty donuts, and European-style layered cakes' },
    am: { name: 'ኬኮች እና የዳቦ መጋገሪያ', description: 'በቅቤ የተዘጋጁ ክሩሳንቶች፣ ዶናት እና ልዩ ኬኮች' },
    so: { name: 'Keeg & Rooti Macaan', description: 'Croissants subag leh, doonad iyo keegag kala duwan' },
  },
  'cat-juices': {
    en: { name: 'Fresh Juices & Spris', description: 'Handcrafted multi-layered avocado, mango, papaya and strawberry juices' },
    am: { name: 'ትኩስ ጭማቂዎች እና ስፕሪስ', description: 'በጥበብ የተደረደሩ የአቮካዶ፣ ማንጎ፣ ፓፓያ እና እንጆሪ ስፕሪስ ጭማቂዎች' },
    so: { name: 'Sharaab Fariish ah & Spris', description: 'Sharaab dabiici ah oo iskugu jira afakaadho, cambe, babaay iyo farawle' },
  },
  'cat-drinks': {
    en: { name: 'Hot Drinks & Coffee Ritual', description: 'Single-origin Ethiopian highland coffees, spiced teas and creamy macchiatos' },
    am: { name: 'ሙቅ መጠጦች እና የቡና ስነ-ስርዓት', description: 'የሀበሻ ጀበና ቡና፣ ማኪያቶ፣ ልዩ ቅመም ሻይ እና ትኩስ ወተት' },
    so: { name: 'Cabitaanno Kulul & Bun Dhaqan', description: 'Bun Itoobiyaan ah, shaah xawaash leh iyo macchiato caano leh' },
  },
  'cat-snacks': {
    en: { name: 'Snacks & Sides', description: 'Crispy samosas, loaded seasoned french fries and shareable appetizers' },
    am: { name: 'መክሰስ እና ተጨማሪዎች', description: 'ተቆርሰው የሚበሉ ጥርት ያሉ ሳምቡሳዎች እና ቅመም የተነሰነሰባቸው ቺፕሶች' },
    so: { name: 'Cunto Fudud & Wehel', description: 'Sambuusi shiilan, baradho shiilan iyo cunto fudud' },
  },
  'cat-specialty': {
    en: { name: 'Chef Specialties', description: 'Signature wood-fired artisan dishes and seasonal culinary features' },
    am: { name: 'የሼፍ ልዩ ምግቦች', description: 'የሼፉ ልዩ የእንጨት ምድጃ ውጤቶች እና ወቅታዊ ምግቦች' },
    so: { name: 'Takhasuska Kariyaha', description: 'Cuntooyin gaar ah oo lagu dubay foorno qoryo leh' },
  },
};
