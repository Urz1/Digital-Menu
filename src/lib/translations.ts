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
  backToTop: string;

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
  guestReviewsSubtitle: string;
  reviewsCount: string;
  rateThisDish: string;
  noReviewsYet: string;
  reportReview: string;
  specialInstructions: string;
  specialInstructionsPlaceholder: string;
  pairingTitle: string;
  addPairingBtn: string;
  verifiedDiner: string;

  // Review Modal Flow
  reviewModalTitle: string;
  reviewModalSubtitle: string;
  quickTagsTitle: string;
  quickTagsOptional: string;
  commentLabel: string;
  commentOptional: string;
  commentPlaceholder: string;
  dishPhotoLabel: string;
  dishPhotoOptional: string;
  submitReview: string;
  submittingReview: string;
  thankYouReviewTitle: string;
  thankYouReviewDesc: string;
  done: string;
  alreadyReviewedMsg: string;

  // Review Report Modal
  reportTitle: string;
  reportSubtitle: string;
  reportReasonSpam: string;
  reportReasonAbuse: string;
  reportReasonPii: string;
  reportReasonOther: string;
  cancel: string;
  submitReport: string;
  reportThanks: string;

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
  freeGiftLabel: string;

  // Service, PWA & Footers
  offlineNotice: string;
  offlineBadge: string;
  comingSoonCalling: string;
  waiterAssistance: string;
  tableQr: string;
  shareMenu: string;
  allergenGuide: string;
  staffOwnerPortal: string;
  installAppTitle: string;
  installAppDesc: string;
  installAppBtn: string;
  notNowBtn: string;

  // Settings & Preferences Modal
  settingsTitle: string;
  settingsDesc: string;
  languageLabel: string;
  appearanceLabel: string;
  lightMode: string;
  darkMode: string;
  autoMode: string;
  themesLabel: string;
  themeModernMinimal: string;
  themeClassicElegance: string;
  themeBoldDark: string;
  themeWarmRustic: string;
  tableNumberLabel: string;
  guestWifiLabel: string;

  // Dietary Legend Modal
  legendTitle: string;
  legendDesc: string;
  vegetarianTitle: string;
  vegetarianDesc: string;
  veganTitle: string;
  veganDesc: string;
  glutenFreeTitle: string;
  glutenFreeDesc: string;
  halalTitle: string;
  halalDesc: string;
  nutFreeTitle: string;
  nutFreeDesc: string;
  spiceIndicatorsTitle: string;
  spiceIndicatorsDesc: string;
  chefSelectionTitle: string;
  chefSelectionDesc: string;

  // Star Rating Labels
  starRatingLabels: [string, string, string, string, string, string];

  // Default Review Quick Tags
  defaultReviewTags: string[];

  // Review Photo actions
  removePhoto: string;
  uploadPhoto: string;

  // Empty Filter / Search State
  noActiveOffers: string;
  noActiveOffersHint: string;
  noFavoritesSaved: string;
  noMatchingDishes: string;
  adjustFilterHint: string;
  resetFilters: string;
  resultsCount: string;
  dishesOnOfferCount: string;

  // Service Assistance Modal
  serviceAssistanceTitle: string;
  serviceAssistanceDesc: string;
  callWaiterTitle: string;
  callWaiterDesc: string;
  requestWaterTitle: string;
  requestWaterDesc: string;
  extraCutleryTitle: string;
  extraCutleryDesc: string;
  requestBillTitle: string;
  requestBillDesc: string;

  // Server Summary Card
  serverSummaryTitle: string;
  dineInSeating: string;
  totalItemsLabel: string;
  noteLabel: string;

  // Table QR Modal
  tableQrTitle: string;
  tableQrDesc: string;
  copyMenuLink: string;
  linkCopied: string;
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
    backToTop: 'Back to top',

    filterAll: 'All',
    filterOnOffer: 'Special Offers',
    filterChefsPick: 'Chef Picks',
    filterFasting: 'Fasting (Tsom)',
    filterVegetarian: 'Vegetarian',
    filterVegan: 'Vegan',
    filterGlutenFree: 'Gluten-Free',
    filterHalal: 'Halal',
    filterSpicy: 'Spicy',

    sortLabel: 'Sort',
    sortFeatured: 'Featured & Popular',
    sortPriceAsc: 'Price: Low to High',
    sortPriceDesc: 'Price: High to Low',
    sortNameAsc: 'Name: A to Z',

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
    guestReviewsSubtitle: 'Honest feedback from recent diners',
    reviewsCount: 'verified ratings',
    rateThisDish: 'Rate this dish',
    noReviewsYet: 'No reviews yet for this dish. Be the first to share your thoughts!',
    reportReview: 'Report',
    specialInstructions: 'Special Instructions',
    specialInstructionsPlaceholder: 'e.g. Extra napkins, dressing on side...',
    pairingTitle: 'Pairs Well',
    addPairingBtn: '+ Add',
    verifiedDiner: 'Verified Diner',

    reviewModalTitle: 'Quick Dish Review',
    reviewModalSubtitle: 'Fast, honest feedback in under 15 seconds. No account required.',
    quickTagsTitle: 'Quick Tags',
    quickTagsOptional: '(Optional, tap to select)',
    commentLabel: 'Comment',
    commentOptional: '(Optional)',
    commentPlaceholder: 'What made this dish memorable? (Keep it honest and helpful)',
    dishPhotoLabel: 'Dish Photo',
    dishPhotoOptional: '(Optional, max 4MB)',
    submitReview: 'Submit Honest Review',
    submittingReview: 'Submitting...',
    thankYouReviewTitle: 'Thank you for your review!',
    thankYouReviewDesc: 'Your honest feedback helps our culinary team maintain top quality dishes.',
    done: 'Done',
    alreadyReviewedMsg: 'You have already reviewed this dish for this table session',

    reportTitle: 'Moderate Review',
    reportSubtitle: 'Why are you reporting this review?',
    reportReasonSpam: 'Spam or advertisement',
    reportReasonAbuse: 'Offensive or abusive language',
    reportReasonPii: 'Personal information (phone, email)',
    reportReasonOther: 'Other reason',
    cancel: 'Cancel',
    submitReport: 'Submit Report',
    reportThanks: 'Thank you for reporting. Our management team will inspect it.',

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
    freeGiftLabel: 'Free Gift',

    offlineNotice: "You're offline — showing cached menu and offline cart",
    offlineBadge: 'Offline Mode',
    comingSoonCalling: 'Digital waiter calling is coming soon. Please let your waiter know in person!',
    waiterAssistance: 'Ask Waiter',
    tableQr: 'Table QR',
    shareMenu: 'Share Menu',
    allergenGuide: 'Allergen Guide',
    staffOwnerPortal: 'Staff & Owner Portal',
    installAppTitle: 'Install Addis Cafeteria App',
    installAppDesc: 'Instant access & offline dining',
    installAppBtn: 'Install',
    notNowBtn: 'Not now',

    settingsTitle: 'Display & Preferences',
    settingsDesc: 'Customize your digital dining view.',
    languageLabel: 'Language',
    appearanceLabel: 'Appearance',
    lightMode: 'Light',
    darkMode: 'Dark',
    autoMode: 'Auto',
    themesLabel: 'Atmosphere Themes',
    themeModernMinimal: 'Modern Minimal',
    themeClassicElegance: 'Classic Elegance',
    themeBoldDark: 'Bold Dark',
    themeWarmRustic: 'Warm Rustic',
    tableNumberLabel: 'Table Number',
    guestWifiLabel: 'Guest WiFi',

    legendTitle: 'Dietary & Allergen Guide',
    legendDesc: 'Our kitchen takes cross-contamination and guest wellness seriously.',
    vegetarianTitle: 'Vegetarian (V)',
    vegetarianDesc: 'Contains no meat, fish, or poultry. May include dairy or eggs.',
    veganTitle: 'Vegan (VG)',
    veganDesc: '100% plant-based with zero animal products or byproducts.',
    glutenFreeTitle: 'Gluten-Free (GF)',
    glutenFreeDesc: 'Prepared without wheat or with certified gluten-free grains.',
    halalTitle: 'Halal Certified',
    halalDesc: 'Meats sourced exclusively from certified halal suppliers.',
    nutFreeTitle: 'Nut-Free',
    nutFreeDesc: 'Formulated without peanuts or tree nuts in preparation.',
    spiceIndicatorsTitle: 'Spice Indicators',
    spiceIndicatorsDesc: 'Mild (🌶️) • Medium (🌶️🌶️) • Fiery Hot (🌶️🌶️🌶️)',
    chefSelectionTitle: "Chef's Selection",
    chefSelectionDesc: 'Signature culinary highlights recommended by our executive chef.',

    starRatingLabels: ['', 'Needs Improvement', 'Fair', 'Good', 'Very Good', 'Exceptional!'],
    defaultReviewTags: [
      'Great portion',
      'Would order again',
      'Fresh ingredients',
      'Crispy texture',
      'Perfect spice',
      'Too salty',
      'Could be hotter',
      'Needs more seasoning',
    ],
    removePhoto: 'Remove Photo',
    uploadPhoto: 'Upload a Photo',

    noActiveOffers: 'No active offers right now',
    noActiveOffersHint: 'Check back soon for upcoming happy hours and chef specials',
    noFavoritesSaved: 'No favorites saved yet',
    noMatchingDishes: 'No matching dishes found',
    adjustFilterHint: 'Try adjusting your search or clearing your active filters',
    resetFilters: 'Reset Filters',
    resultsCount: 'Results',
    dishesOnOfferCount: 'Dishes on Offer',

    serviceAssistanceTitle: 'Server Assistance',
    serviceAssistanceDesc: 'Tap a quick request below to alert your server immediately for',
    callWaiterTitle: 'Call Waiter',
    callWaiterDesc: 'Need help with recommendations or questions',
    requestWaterTitle: 'Request Water Refill',
    requestWaterDesc: 'Sparkling or still water for the table',
    extraCutleryTitle: 'Extra Cutlery / Napkins',
    extraCutleryDesc: 'Fresh forks, knives, spoons, or paper napkins',
    requestBillTitle: 'Request Bill / Check',
    requestBillDesc: 'Ready to complete your dining experience',

    serverSummaryTitle: 'SERVER SUMMARY',
    dineInSeating: 'Dine-In Seating',
    totalItemsLabel: 'Total Items',
    noteLabel: 'Note',

    tableQrTitle: 'Table QR Code',
    tableQrDesc: 'Scan with any camera to instantly load the digital menu for',
    copyMenuLink: 'Copy Direct Menu Link',
    linkCopied: 'Link Copied!',
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
    backToTop: 'ወደ ላይ ተመለስ',

    filterAll: 'ሁሉም',
    filterOnOffer: 'ልዩ ቅናሽ',
    filterChefsPick: 'የሼፍ ምርጥ',
    filterFasting: 'የጾም ምግቦች',
    filterVegetarian: 'አትክልት ብቻ',
    filterVegan: 'ቪጋን',
    filterGlutenFree: 'ከግሉተን ነፃ',
    filterHalal: 'ሀላል',
    filterSpicy: 'ቃሪያ / የሚያቃጥል',

    sortLabel: 'አስተካክል',
    sortFeatured: 'ተወዳጅ እና ታዋቂ',
    sortPriceAsc: 'ዋጋ፦ ከዝቅተኛ ወደ ከፍተኛ',
    sortPriceDesc: 'ዋጋ፦ ከከፍተኛ ወደ ዝቅተኛ',
    sortNameAsc: 'በፊደል ተራ፦ ሀ እስከ ፐ',

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
    guestReviewsSubtitle: 'ከቅርብ ጊዜ እንግዶች የተሰጠ አስተያየት',
    reviewsCount: 'የተረጋገጡ ደረጃዎች',
    rateThisDish: 'ለዚህ ምግብ ደረጃ ይስጡ',
    noReviewsYet: 'እስካሁን ምንም አስተያየት አልተሰጠም። ቀዳሚ ሆነው ይገምግሙ!',
    reportReview: 'ሪፖርት አድርግ',
    specialInstructions: 'ልዩ ትዕዛዝ',
    specialInstructionsPlaceholder: 'ምሳሌ፦ ተጨማሪ ሶስ፣ ጨው ይቀነስ...',
    pairingTitle: 'አብሮ የሚሄድ',
    addPairingBtn: '+ አክል',
    verifiedDiner: 'የተረጋገጠ ተመጋቢ',

    reviewModalTitle: 'ለዚህ ምግብ ደረጃ ይስጡ',
    reviewModalSubtitle: 'በ15 ሰከንድ ውስጥ ፈጣንና እውነተኛ አስተያየት ይስጡ። መመዝገብ አያስፈልግም።',
    quickTagsTitle: 'ፈጣን መገለጫዎች',
    quickTagsOptional: '(አማራጭ፣ ለመምረጥ ይጫኑ)',
    commentLabel: 'አስተያየት',
    commentOptional: '(አማራጭ)',
    commentPlaceholder: 'ይህንን ምግብ ልዩ ያደረገው ምንድን ነው? (እውነተኛ አስተያየት)',
    dishPhotoLabel: 'የምግብ ፎቶ',
    dishPhotoOptional: '(አማራጭ፣ ቢበዛ 4ሜባ)',
    submitReview: 'አስተያየትን ላክ',
    submittingReview: 'በመላክ ላይ...',
    thankYouReviewTitle: 'ስለ አስተያየትዎ እናመሰግናለን!',
    thankYouReviewDesc: 'የእርስዎ እውነተኛ አስተያየት የሙያተኞቻችንን ጥራት ለማሻሻል ይረዳል።',
    done: 'ተጠናቋል',
    alreadyReviewedMsg: 'ለዚህ ምግብ አስቀድመው በዚህ ጠረጴዛ አስተያየት ሰጥተዋል',

    reportTitle: 'አስተያየትን ሪፖርት ያድርጉ',
    reportSubtitle: 'ይህንን አስተያየት ለምን ሪፖርት ማድረግ ፈለጉ?',
    reportReasonSpam: 'አላስፈላጊ ማስታወቂያ ወይም ስፓም',
    reportReasonAbuse: 'ስድብ ወይም አፀያፊ ቋንቋ',
    reportReasonPii: 'የግል መረጃ (ስልክ ቁጥር፣ ኢሜይል)',
    reportReasonOther: 'ሌላ ምክንያት',
    cancel: 'ይቅር',
    submitReport: 'ሪፖርት ላክ',
    reportThanks: 'ስለገለጹልን እናመሰግናለን። አስተዳደራችን ይመረምረዋል።',

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
    freeGiftLabel: 'ነፃ ስጦታ',

    offlineNotice: 'ኢንተርኔት ተቋርጧል — የተቀመጠውን ምናሌ እያሳየ ነው',
    offlineBadge: 'ከመስመር ውጭ',
    comingSoonCalling: 'በስልክ አስተናጋጅ መጥራት በቅርቡ ይጀምራል፤ እባክዎ በአካል ያነጋግሩን!',
    waiterAssistance: 'አስተናጋጅ ይጠይቁ',
    tableQr: 'የጠረጴዛ QR',
    shareMenu: 'ምናሌውን ያጋሩ',
    allergenGuide: 'የአለርጂ መመሪያ',
    staffOwnerPortal: 'የሰራተኞች እና የባለቤት መግቢያ',
    installAppTitle: 'የአዲስ ካፌቴሪያ አፕ ጫን',
    installAppDesc: 'ቀጥታና ከመስመር ውጭ ለማዘዝ',
    installAppBtn: 'ጫን',
    notNowBtn: 'አሁን አይደለም',

    settingsTitle: 'የማሳያ እና ምርጫዎች',
    settingsDesc: 'የዲጂታል ምናሌ እይታዎን ያስተካክሉ።',
    languageLabel: 'ቋንቋ',
    appearanceLabel: 'መልክ',
    lightMode: 'ቀላል (ብርሃን)',
    darkMode: 'ጨለማ',
    autoMode: 'ራስ-ሰር',
    themesLabel: 'ገጽታዎች',
    themeModernMinimal: 'ዘመናዊ ቀላል',
    themeClassicElegance: 'ክላሲክ ውበት',
    themeBoldDark: 'ደማቅ ጨለማ',
    themeWarmRustic: 'ሞቅ ያለ ባህላዊ',
    tableNumberLabel: 'የጠረጴዛ ቁጥር',
    guestWifiLabel: 'የእንግዳ ዋይፋይ',

    legendTitle: 'የአመጋገብ እና የአለርጂ መመሪያ',
    legendDesc: 'ማዕድ ቤታችን ለምግብ ጥራት እና ለእንግዶች ጤና ከፍተኛ ጥንቃቄ ያደርጋል።',
    vegetarianTitle: 'አትክልት ብቻ (V)',
    vegetarianDesc: 'ስጋ፣ ዓሳ ወይም ዶሮ የሌለው። የወተት ተዋጽኦ ወይም እንቁላል ሊኖረው ይችላል።',
    veganTitle: 'ቪጋን (VG)',
    veganDesc: '100% ከዕፅዋት ብቻ የተዘጋጀ፤ ምንም ዓይነት የእንስሳት ተዋጽኦ የሌለው።',
    glutenFreeTitle: 'ከግሉተን ነፃ (GF)',
    glutenFreeDesc: 'ያለ ስንዴ ወይም በግሉተን-ነፃ እህሎች የተዘጋጀ።',
    halalTitle: 'የተረጋገጠ ሀላል',
    halalDesc: 'ከህጋዊ ሀላል አቅራቢዎች የተገኘ ስጋ።',
    nutFreeTitle: 'ከለውዝ ነፃ',
    nutFreeDesc: 'ምንም አይነት ለውዝ ሳይገባበት የተዘጋጀ።',
    spiceIndicatorsTitle: 'የማቃጠል ደረጃዎች',
    spiceIndicatorsDesc: 'ቀላል (🌶️) • መካከለኛ (🌶️🌶️) • በጣም የሚያቃጥል (🌶️🌶️🌶️)',
    chefSelectionTitle: 'የዋና ሼፍ ምርጥ',
    chefSelectionDesc: 'በዋናው ሼፍ የሚመከሩ ልዩ ተወዳጅ ምግቦች።',

    starRatingLabels: ['', 'ማሻሻል ይፈልጋል', 'መካከለኛ', 'ጥሩ', 'በጣም ጥሩ', 'ድንቅ ጣዕም!'],
    defaultReviewTags: [
      'ጥሩ መጠን',
      'እንደገና አዛለሁ',
      'ትኩስ ግብአት',
      'የሚጣፍጥ ቃና',
      'ተመጣጣኝ ቅመም',
      'ጨው በዝቷል',
      'ትኩስ መሆን ነበረበት',
      'ተጨማሪ ቅመም ይፈልጋል',
    ],
    removePhoto: 'ፎቶ አስወግድ',
    uploadPhoto: 'ፎቶ ጫን',

    noActiveOffers: 'በአሁኑ ሰዓት ምንም ንቁ ቅናሽ የለም',
    noActiveOffersHint: 'ለሚመጡ ልዩ ቅናሾች እና የደስታ ሰዓታት በቅርቡ ይመለሱ',
    noFavoritesSaved: 'እስካሁን ምንም የተወደዱ ምግቦች አልተቀመጡም',
    noMatchingDishes: 'ምንም ተዛማጅ ምግብ አልተገኘም',
    adjustFilterHint: 'ፍለጋዎን ይቀይሩ ወይም ማጣሪያዎችን ያጽዱ',
    resetFilters: 'ማጣሪያዎችን አጽዳ',
    resultsCount: 'የፍለጋ ውጤቶች',
    dishesOnOfferCount: 'በቅናሽ ላይ ያሉ ምግቦች',

    serviceAssistanceTitle: 'የአስተናጋጅ ድጋፍ',
    serviceAssistanceDesc: 'ለዚህ ጠረጴዛ አስተናጋጅ ለመጥራት ከታች ካሉት ይምረጡ፦',
    callWaiterTitle: 'አስተናጋጅ ጥራ',
    callWaiterDesc: 'ለጥያቄዎች ወይም ለምክር እገዛ ይፈልጋሉ',
    requestWaterTitle: 'የውሃ መጠጥ ሙላ',
    requestWaterDesc: 'ለጠረጴዛ የሚሆን ንጹህ ውሃ',
    extraCutleryTitle: 'ተጨማሪ ሹካና ማንኪያ / ሶፍት',
    extraCutleryDesc: 'ንጹህ ሹካ፣ ማንኪያ ወይም የወረቀት ሶፍት',
    requestBillTitle: 'ሒሳብ ጥራ',
    requestBillDesc: 'የተመገቡትን ክፍያ ለመፈጸም',

    serverSummaryTitle: 'የአስተናጋጅ ማጠቃለያ',
    dineInSeating: 'የመመገቢያ ጠረጴዛ',
    totalItemsLabel: 'ጠቅላላ የምግብ ብዛት',
    noteLabel: 'ማስታወሻ',

    tableQrTitle: 'የጠረጴዛ ኪው አር (QR) ኮድ',
    tableQrDesc: 'በስልክዎ ካሜራ በመቃኘት በቀጥታ ዲጂታል ሜኑውን ይክፈቱ፦',
    copyMenuLink: 'የሜኑ ሊንክ ገልብጥ',
    linkCopied: 'ሊንኩ ተገልብጧል!',
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
    backToTop: 'Kor ugu noqo',

    filterAll: 'Dhammaan',
    filterOnOffer: 'Qiimo Dhimis',
    filterChefsPick: 'Xulashada Cunto-kariyaha',
    filterFasting: 'Khudaar (Fasting)',
    filterVegetarian: 'Khudradeed',
    filterVegan: 'Vegan',
    filterGlutenFree: 'Gluten La’aan',
    filterHalal: 'Xalaal',
    filterSpicy: 'Basbaas leh',

    sortLabel: 'Kala Saar',
    sortFeatured: 'Caan & La Jecelyahay',
    sortPriceAsc: 'Qiimaha: Hoose ilaa Sare',
    sortPriceDesc: 'Qiimaha: Sare ilaa Hoose',
    sortNameAsc: 'Magaca: A ilaa Z',

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
    guestReviewsSubtitle: 'Aragtiyada dhabta ah ee macaamiisha dhawaan',
    reviewsCount: 'qiimeyn xaqiiq ah',
    rateThisDish: 'Qiimee cuntadan',
    noReviewsYet: 'Weli fikrad lagama dhiiban cuntadan. Noqo qofka ugu horeeya!',
    reportReview: 'Gudbi Cabasho',
    specialInstructions: 'Farriimo Gaar ah',
    specialInstructionsPlaceholder: 'Tusaale: Koob dheeraad ah, suugo gooni ah...',
    pairingTitle: 'Waxyaabaha la socda',
    addPairingBtn: '+ Ku dar',
    verifiedDiner: 'Macaamiil Xaqiijisan',

    reviewModalTitle: 'Qiimee Cuntadan',
    reviewModalSubtitle: 'Fikrad dhab ah 15 ilbiriqsi gudahood. Akoon looma baahna.',
    quickTagsTitle: 'Calaamado Degdeg ah',
    quickTagsOptional: '(Ikhtiyaari, taabo si aad u doorato)',
    commentLabel: 'Faallo',
    commentOptional: '(Ikhtiyaari)',
    commentPlaceholder: 'Maxaa cuntadan ka dhigay mid xusuus mudan? (Xog dhab ah)',
    dishPhotoLabel: 'Sawirka Cuntada',
    dishPhotoOptional: '(Ikhtiyaari, ugu badnaan 4MB)',
    submitReview: 'Gudbi Qiimeynta',
    submittingReview: 'Waa la dirayaa...',
    thankYouReviewTitle: 'Waad ku mahadsan tahay qiimeyntaada!',
    thankYouReviewDesc: 'Fikradaada daacadda ahi waxay ka caawisaa kooxdayada jikada inay ilaaliyaan tayada sare.',
    done: 'Dhammee',
    alreadyReviewedMsg: 'Hore ayaad u qiimeysay cuntadan miiskan.',

    reportTitle: 'Gudbi Cabasho Fikradeed',
    reportSubtitle: 'Sababtee ayaad u gudbinaysaa faalladan?',
    reportReasonSpam: 'Xayaysiis ama been-abuur (Spam)',
    reportReasonAbuse: 'Hadallo aflagaaddo ama cay ah',
    reportReasonPii: 'Xog shakhsi ah (taleefan, iimayl)',
    reportReasonOther: 'Sabab kale',
    cancel: 'Jooji',
    submitReport: 'Dir Cabashada',
    reportThanks: 'Waad ku mahadsan tahay wargalintaada. Kooxdayadu way eegi doontaa.',

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
    freeGiftLabel: 'Hadyad Bilaash ah',

    offlineNotice: 'Khad la’aan — waxaad arkaysaa liiskii hore ee keydsanaa',
    offlineBadge: 'Khad La’aan',
    comingSoonCalling: 'Wicitaanka tooska ah ee shaqaalaha dhawaan ayuu furmi doonaa. Fadlan toos ula hadal adeegahaaga!',
    waiterAssistance: 'Weydii Adeegaha',
    tableQr: 'QR-ka Miiska',
    shareMenu: 'La wadaag Liiska',
    allergenGuide: 'Hagaha Xasaasiyadda',
    staffOwnerPortal: 'Bogga Shaqaalaha & Mulkiilaha',
    installAppTitle: 'Ku rakibo App-ka Addis Cafeteria',
    installAppDesc: 'Galitaanka degdega ah iyo cunto xilliga khadka la’aan',
    installAppBtn: 'Ku rakibo',
    notNowBtn: 'Hadda maya',

    settingsTitle: 'Muuqaalka & Dookhyada',
    settingsDesc: 'Habee muuqaalkaaga cuntada dijitaalka ah.',
    languageLabel: 'Luqadda',
    appearanceLabel: 'Muuqaalka',
    lightMode: 'Iftiin',
    darkMode: 'Madow',
    autoMode: 'Toos ah',
    themesLabel: 'Mawduucyada',
    themeModernMinimal: 'Casri Fudud',
    themeClassicElegance: 'Heersare Dhaqan',
    themeBoldDark: 'Madow Qoto-dheer',
    themeWarmRustic: 'Diiran Dabiici',
    tableNumberLabel: 'Lambarka Miiska',
    guestWifiLabel: 'WiFi-ga Martida',

    legendTitle: 'Hagaha Cuntada & Xasaasiyadda',
    legendDesc: 'Jikadayadu waxay si weyn u ilaalisaa nadaafadda iyo caafimaadka macaamiisha.',
    vegetarianTitle: 'Khudradeed (V)',
    vegetarianDesc: 'Ma laha hilib, kalluun ama digaag. Waxaa ku jiri kara caano ama ukun.',
    veganTitle: 'Dhir Keliya (VG)',
    veganDesc: '100% dhir oo aan wax xoolo ama wax soo saarkooda lahayn.',
    glutenFreeTitle: 'Gluten La’aan (GF)',
    glutenFreeDesc: 'Lama isticmaalin sarreen ama hadhuudh leh gluten.',
    halalTitle: 'Xalaal Shahaado Leh',
    halalDesc: 'Hilib laga keenay shirkado xalaal ah oo la aaminsan yahay.',
    nutFreeTitle: 'Lows La’aan',
    nutFreeDesc: 'Wax loos ama laws geed ah kuma jiraan diyaarinta.',
    spiceIndicatorsTitle: 'Heerarka Basbaaska',
    spiceIndicatorsDesc: 'Khafiif (🌶️) • Dhexdhexaad (🌶️🌶️) • Aad u kulul (🌶️🌶️🌶️)',
    chefSelectionTitle: 'Xulashada Madaxa Cunto-kariyaha',
    chefSelectionDesc: 'Cuntooyin khaas ah oo uu taliyaha jikadu kugula talinayo.',

    starRatingLabels: ['', 'Hagaajin u baahan', 'Dhexdhexaad', 'Wanaagsan', 'Aad u wanaagsan', 'Heersare!'],
    defaultReviewTags: [
      'Qayb weyn',
      'Mar kale ayaan dalban lahaa',
      'Wax cusub',
      'Karis wanaagsan',
      'Basbaas ku filan',
      'Cusbo badan',
      'Kulayl dheeraad ah',
      'Xawaash dheeraad ah',
    ],
    removePhoto: 'Sawirka Ka Saar',
    uploadPhoto: 'Sawir Soo Gali',

    noActiveOffers: 'Xilligan ma jiraan qiimo dhimis firfircoon',
    noActiveOffersHint: 'Dhawaan dib u soo eeg qiimo dhimisyada gaarka ah',
    noFavoritesSaved: 'Weli ma jiraan cuntooyin la keydiyay',
    noMatchingDishes: 'Lama helin cunto ku habboon',
    adjustFilterHint: 'Isku day inaad beddesho raadintaada ama sifeeyaha',
    resetFilters: 'Dib u celi sifeeyaha',
    resultsCount: 'Natiijooyinka',
    dishesOnOfferCount: 'Cuntooyinka Qiimo Dhimista leh',

    serviceAssistanceTitle: 'Caawinta Kabalyeeriga',
    serviceAssistanceDesc: 'Guji mid ka mid ah si aad ugu yeerto kabalyeeriga miiska',
    callWaiterTitle: 'U Yeer Kabalyeeriga',
    callWaiterDesc: 'Caawin ku saabsan dalabka ama talooyin',
    requestWaterTitle: 'Biyo Dalbo',
    requestWaterDesc: 'Biyo qabow ama caadi ah oo miiska loogu talagalay',
    extraCutleryTitle: 'Fargeeto / Qalab Dheeraad ah',
    extraCutleryDesc: 'Fargeetooyin cusub, malqacado, ama masaxado',
    requestBillTitle: 'Dalbo Xisaabta / Biilka',
    requestBillDesc: 'Diyaar u ah bixinta lacagta cuntada',

    serverSummaryTitle: 'SOO KOOBIDDA KABALYEERIGA',
    dineInSeating: 'Fadhiga Miiska',
    totalItemsLabel: 'Wadarta Cuntooyinka',
    noteLabel: 'Fariin',

    tableQrTitle: 'Koodhka QR ee Miiska',
    tableQrDesc: 'Ku sawir kamaraddaada si aad isla markiiba u furto liiska cuntada ee',
    copyMenuLink: 'Koobiyee Xiriiriyaha Liiska',
    linkCopied: 'Xiriiriyaha waa la koobiyeeyay!',
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
    backToTop: 'Volver arriba',

    filterAll: 'Todos',
    filterOnOffer: 'En oferta',
    filterChefsPick: 'Selección del chef',
    filterFasting: 'Ayuno (Tsom)',
    filterVegetarian: 'Vegetariano',
    filterVegan: 'Vegano',
    filterGlutenFree: 'Sin gluten',
    filterHalal: 'Halal',
    filterSpicy: 'Picante',

    sortLabel: 'Ordenar',
    sortFeatured: 'Destacados y populares',
    sortPriceAsc: 'Precio: de menor a mayor',
    sortPriceDesc: 'Precio: de mayor a menor',
    sortNameAsc: 'Nombre: A a Z',

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
    guestReviewsSubtitle: 'Comentarios honestos de comensales recientes',
    reviewsCount: 'calificaciones verificadas',
    rateThisDish: 'Califica este plato',
    noReviewsYet: 'Aún no hay opiniones sobre este plato. ¡Sé el primero!',
    reportReview: 'Reportar',
    specialInstructions: 'Instrucciones especiales',
    specialInstructionsPlaceholder: 'p. ej. Servilletas extras, salsa aparte...',
    pairingTitle: 'Combina bien',
    addPairingBtn: '+ Añadir',
    verifiedDiner: 'Comensal verificado',

    reviewModalTitle: 'Calificación rápida del plato',
    reviewModalSubtitle: 'Opinión honesta en menos de 15 segundos. Sin registrarse.',
    quickTagsTitle: 'Etiquetas rápidas',
    quickTagsOptional: '(Opcional, toca para seleccionar)',
    commentLabel: 'Comentario',
    commentOptional: '(Opcional)',
    commentPlaceholder: '¿Qué hizo memorable este plato? (Sé honesto y útil)',
    dishPhotoLabel: 'Foto del plato',
    dishPhotoOptional: '(Opcional, máx 4MB)',
    submitReview: 'Enviar opinión honesta',
    submittingReview: 'Enviando...',
    thankYouReviewTitle: '¡Gracias por tu opinión!',
    thankYouReviewDesc: 'Tu comentario honesto ayuda a nuestro equipo de cocina a mantener la máxima calidad.',
    done: 'Listo',
    alreadyReviewedMsg: 'Ya has calificado este plato en esta mesa',

    reportTitle: 'Moderar opinión',
    reportSubtitle: '¿Por qué deseas reportar esta opinión?',
    reportReasonSpam: 'Spam o publicidad',
    reportReasonAbuse: 'Lenguaje ofensivo o inapropiado',
    reportReasonPii: 'Información personal (teléfono, correo)',
    reportReasonOther: 'Otro motivo',
    cancel: 'Cancelar',
    submitReport: 'Enviar reporte',
    reportThanks: 'Gracias por reportar. Nuestro equipo revisará el comentario.',

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
    freeGiftLabel: 'Regalo gratis',

    offlineNotice: 'Estás sin conexión — mostrando menú guardado y pedido offline',
    offlineBadge: 'Modo sin conexión',
    comingSoonCalling: 'La llamada digital al mesero estará disponible pronto. ¡Por favor avisa a tu mesero en persona!',
    waiterAssistance: 'Pedir ayuda',
    tableQr: 'QR de la mesa',
    shareMenu: 'Compartir menú',
    allergenGuide: 'Guía de alérgenos',
    staffOwnerPortal: 'Portal del personal y propietario',
    installAppTitle: 'Instalar App de Addis Cafeteria',
    installAppDesc: 'Acceso instantáneo y pedidos sin conexión',
    installAppBtn: 'Instalar',
    notNowBtn: 'Ahora no',

    settingsTitle: 'Pantalla y preferencias',
    settingsDesc: 'Personaliza tu vista del menú digital.',
    languageLabel: 'Idioma',
    appearanceLabel: 'Apariencia',
    lightMode: 'Claro',
    darkMode: 'Oscuro',
    autoMode: 'Automático',
    themesLabel: 'Temas de ambiente',
    themeModernMinimal: 'Mínimo moderno',
    themeClassicElegance: 'Elegancia clásica',
    themeBoldDark: 'Oscuro audaz',
    themeWarmRustic: 'Rústico cálido',
    tableNumberLabel: 'Número de mesa',
    guestWifiLabel: 'Wi-Fi de clientes',

    legendTitle: 'Guía dietética y de alérgenos',
    legendDesc: 'Nuestra cocina se toma muy en serio la contaminación cruzada y la salud del comensal.',
    vegetarianTitle: 'Vegetariano (V)',
    vegetarianDesc: 'No contiene carne, pescado ni aves. Puede incluir lácteos o huevos.',
    veganTitle: 'Vegano (VG)',
    veganDesc: '100% de origen vegetal sin productos ni derivados animales.',
    glutenFreeTitle: 'Sin gluten (GF)',
    glutenFreeDesc: 'Elaborado sin trigo o con cereales certificados sin gluten.',
    halalTitle: 'Certificado Halal',
    halalDesc: 'Carnes obtenidas exclusivamente de proveedores halal certificados.',
    nutFreeTitle: 'Sin frutos secos',
    nutFreeDesc: 'Formulado sin cacahuetes ni frutos secos en su preparación.',
    spiceIndicatorsTitle: 'Indicadores de picante',
    spiceIndicatorsDesc: 'Suave (🌶️) • Medio (🌶️🌶️) • Muy picante (🌶️🌶️🌶️)',
    chefSelectionTitle: 'Selección del chef',
    chefSelectionDesc: 'Platos culinarios destacados recomendados por nuestro chef ejecutivo.',

    starRatingLabels: ['', 'Necesita mejorar', 'Aceptable', 'Bueno', 'Muy bueno', '¡Excepcional!'],
    defaultReviewTags: [
      'Gran porción',
      'Pediría de nuevo',
      'Ingredientes frescos',
      'Textura crujiente',
      'Picante perfecto',
      'Muy salado',
      'Podría estar más caliente',
      'Falta sazón',
    ],
    removePhoto: 'Eliminar foto',
    uploadPhoto: 'Subir una foto',

    noActiveOffers: 'No hay ofertas activas en este momento',
    noActiveOffersHint: 'Vuelve pronto para consultar próximas promociones',
    noFavoritesSaved: 'Aún no has guardado platos favoritos',
    noMatchingDishes: 'No se encontraron platos que coincidan',
    adjustFilterHint: 'Prueba ajustando tu búsqueda o limpiando los filtros',
    resetFilters: 'Restablecer filtros',
    resultsCount: 'Resultados',
    dishesOnOfferCount: 'Platos en oferta',

    serviceAssistanceTitle: 'Asistencia del Camarero',
    serviceAssistanceDesc: 'Toca una opción para alertar de inmediato a tu camarero para la',
    callWaiterTitle: 'Llamar Camarero',
    callWaiterDesc: 'Ayuda con recomendaciones o preguntas',
    requestWaterTitle: 'Solicitar Agua',
    requestWaterDesc: 'Agua mineral o natural para la mesa',
    extraCutleryTitle: 'Cubiertos / Servilletas Extra',
    extraCutleryDesc: 'Tenedores, cuchillos, cucharas o servilletas',
    requestBillTitle: 'Pedir la Cuenta',
    requestBillDesc: 'Listo para pagar tu consumo',

    serverSummaryTitle: 'RESUMEN PARA CAMARERO',
    dineInSeating: 'Mesa en Sala',
    totalItemsLabel: 'Total de Artículos',
    noteLabel: 'Nota',

    tableQrTitle: 'Código QR de Mesa',
    tableQrDesc: 'Escanea con la cámara para cargar el menú digital de',
    copyMenuLink: 'Copiar Enlace Directo',
    linkCopied: '¡Enlace copiado!',
  },
};

export const CATEGORY_TRANSLATIONS: Record<string, Partial<Record<Language, CategoryTranslation>>> = {
  'cat-breakfast': {
    en: { name: 'Breakfast (ቁርስ)', description: 'Freshly made morning staples with fresh injera & toasted artisan bread' },
    am: { name: 'የጥዋት ቁርስ', description: 'በትኩስ እንጀራ እና ዳቦ የሚቀርቡ ምርጥ የጠዋት ምግቦች' },
    so: { name: 'Quraac Fariish ah', description: 'Quraac fariish ah oo lagu diyaariyay canjeero iyo rooti macaan' },
  },
  'cat-mains': {
    en: { name: 'Lunch & Dinner (ምሳ እና እራት)', description: 'Sizzling Ethiopian meats and richly seasoned firfir platters' },
    am: { name: 'ባህላዊ ምግቦች (ምሳ እና እራት)', description: 'በጋለ ምጣድ የሚቀርቡ የፍየል እና የበሬ ጥብሶች እና ልዩ ፍርፍሮች' },
    so: { name: 'Qado & Casho (Hilib & Firfir)', description: 'Hilib shiilan iyo suqaar dhaqameed aad u macaan' },
  },
  'cat-fasting': {
    en: { name: 'Fasting Lunch (የፆም ምግብ)', description: 'Traditional Ethiopian Orthodox fasting dishes prepared with zero animal products' },
    am: { name: 'የጾም ምግቦች', description: 'ከእንስሳት ተዋጽኦ ነፃ የሆኑ ልዩ የጾም በያይነቱ፣ ሽሮ እና የአትክልት ምግቦች' },
    so: { name: 'Cuntooyinka Khudaarta (Fasting)', description: 'Cuntooyin khudradeed oo aan lahayn hilib ama caano' },
  },
  'cat-mendi': {
    en: { name: 'Mendi & Roasts (መንዲ)', description: 'Fragrant spiced basmati rice topped with tender roasted lamb, chicken & goat' },
    am: { name: 'መንዲ እና የተጠበሱ ምግቦች', description: 'በቅመማ ቅመም የበለጸገ የባስማቲ ሩዝ ከተጠበሰ የበግ እና የዶሮ ስጋ ጋር' },
    so: { name: 'Mandi & Hilib Duban', description: 'Bariis basmati udgoon oo lagu daray hilib ari, wan ama digaag duban' },
  },
  'cat-fastfood': {
    en: { name: 'Burgers & Shawarma (በርገር)', description: 'Handcrafted beef patties, spiced club sandwiches and fresh wraps' },
    am: { name: 'በርገር እና ሻዋርማ', description: 'በጥንቃቄ የተዘጋጁ ጭማቂ ያላቸው በርገሮች እና ሳንድዊቾች' },
    so: { name: 'Burger & Shawarma', description: 'Burgero hilib lo’aad oo fariish ah iyo shawarma aad u macaan' },
  },
  'cat-shiro': {
    en: { name: 'Traditional Clay Shiro (ሽሮ)', description: 'Slow-simmered spiced chickpea stew bubbling in authentic clay tagamino pots' },
    am: { name: 'የሸክላ ሽሮ', description: 'በሸክላ ድስት የሚንተከተክ ተጋሚኖ እና ቦዘና ሽሮ' },
    so: { name: 'Shiro Dhaqan ah (Dheri)', description: 'Shiro xawaash leh oo lagu kariyay dheri dhoobo ah' },
  },
  'cat-pastries': {
    en: { name: 'Addis Bakery (መጋገሪያ)', description: 'Buttery croissants, specialty donuts, and European-style layered cakes' },
    am: { name: 'ኬኮች እና የዳቦ መጋገሪያ', description: 'በቅቤ የተዘጋጁ ክሩሳንቶች፣ ዶናት እና ልዩ ኬኮች' },
    so: { name: 'Keeg & Rooti Macaan', description: 'Croissants subag leh, doonad iyo keegag kala duwan' },
  },
  'cat-juices': {
    en: { name: 'Fresh Juices & Drinks (ትኩስ ጭማቂዎች)', description: 'Handcrafted multi-layered avocado, mango, papaya and strawberry juices' },
    am: { name: 'ትኩስ ጭማቂዎች እና ስፕሪስ', description: 'በጥበብ የተደረደሩ የአቮካዶ፣ ማንጎ፣ ፓፓያ እና እንጆሪ ስፕሪስ ጭማቂዎች' },
    so: { name: 'Sharaab Fariish ah & Spris', description: 'Sharaab dabiici ah oo iskugu jira afakaadho, cambe, babaay iyo farawle' },
  },
  'cat-drinks': {
    en: { name: 'Addis Cafe (ትኩስ መጠጦች)', description: 'Single-origin Ethiopian highland coffees, spiced teas and creamy macchiatos' },
    am: { name: 'ሙቅ መጠጦች እና የቡና ስነ-ስርዓት', description: 'የሀበሻ ጀበና ቡና፣ ማኪያቶ፣ ልዩ ቅመም ሻይ እና ትኩስ ወተት' },
    so: { name: 'Cabitaanno Kulul & Bun Dhaqan', description: 'Bun Itoobiyaan ah, shaah xawaash leh iyo macchiato caano leh' },
  },
  'cat-snacks': {
    en: { name: 'Snack Menu (ስናክ)', description: 'Crispy samosas, loaded seasoned french fries and shareable appetizers' },
    am: { name: 'መክሰስ እና ተጨማሪዎች', description: 'ተቆርሰው የሚበሉ ጥርት ያሉ ሳምቡሳዎች እና ቅመም የተነሰነሰባቸው ቺፕሶች' },
    so: { name: 'Cunto Fudud & Wehel', description: 'Sambuusi shiilan, baradho shiilan iyo cunto fudud' },
  },
  'cat-specialty': {
    en: { name: 'Half Half (ግማሽ በግማሽ)', description: 'Signature wood-fired artisan dishes and seasonal culinary features' },
    am: { name: 'ግማሽ በግማሽ ጥምረት', description: 'ሁለት አይነት የተመረጡ ምግቦች በአንድ ላይ የሚቀርቡበት' },
    so: { name: 'Isku-dhafka Gaarka ah (Half Half)', description: 'Laba cunto oo kala duwan oo hal saxan ku wada jira' },
  },
};
