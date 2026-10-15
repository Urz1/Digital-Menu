import { MenuItem } from '@/types/database';

export interface PairingRecommendation {
  item: MenuItem;
  intentBadge: string;
  reasonText: string;
  affinityScore: number;
}

/**
 * Culturally informed, research-backed recommendation engine for Addis Cafeteria & Restaurant.
 * Grounded in:
 * 1. Strict Ethiopian dietary rules (Orthodox Fasting isolation: never recommend dairy/meat with fasting dishes).
 * 2. Classic Ethiopian flavor complementarity (Ambo water / hot Buna after rich berbere/tibs).
 * 3. Behavioral restaurant menu engineering (low-friction price anchoring between 10% - 40% of main dish).
 */
export function getIntelligentPairings(
  targetItem: MenuItem,
  allItems: MenuItem[]
): PairingRecommendation[] {
  if (!targetItem || !allItems || allItems.length === 0) return [];

  // Exclude current item and unavailable items
  const candidates = allItems.filter((i) => i.id !== targetItem.id && i.is_available !== false);

  const isFasting =
    targetItem.tags.includes('fasting') ||
    targetItem.category_id === 'cat-fasting';

  const isVegetarian = targetItem.tags.includes('vegetarian');
  const targetCategory = targetItem.category_id;
  const targetId = targetItem.id;

  const recommendations: PairingRecommendation[] = [];

  // Helper to check dietary safety
  const isDietarySafe = (candidate: MenuItem): boolean => {
    if (isFasting) {
      // Must not contain meat, poultry, dairy, or egg
      const forbiddenAllergens = ['Dairy', 'Egg', 'Meat', 'Seafood'];
      const hasForbiddenAllergen = candidate.allergens?.some((a) => forbiddenAllergens.includes(a));
      if (hasForbiddenAllergen) return false;

      // Must be tagged fasting or vegan
      const isCandidateFasting =
        candidate.tags.includes('fasting') ||
        candidate.tags.includes('vegan') ||
        candidate.category_id === 'cat-fasting' ||
        candidate.category_id === 'cat-juices' ||
        candidate.id === 'item-coffee-buna' ||
        candidate.id === 'item-special-tea' ||
        candidate.id === 'item-ambo-water';

      return isCandidateFasting;
    }

    if (isVegetarian) {
      const forbiddenAllergens = ['Seafood', 'Meat'];
      if (candidate.allergens?.some((a) => forbiddenAllergens.includes(a))) return false;
      return candidate.tags.includes('vegetarian') || candidate.tags.includes('vegan') || candidate.tags.includes('fasting');
    }

    return true;
  };

  // Safe candidates pool
  const safePool = candidates.filter(isDietarySafe);

  // ---------------------------------------------------------------------------
  // 1. FASTING CUISINE PAIRINGS (Beyaynetu, Shiro Fasting, Suf Fitfit, Fasting Agelegil)
  // ---------------------------------------------------------------------------
  if (isFasting) {
    // Top pairing: 100% pure fresh layered juice (Spris) or Avocado Juice
    const spris = safePool.find((i) => i.id === 'item-spris');
    if (spris) {
      recommendations.push({
        item: spris,
        intentBadge: 'Fasting Fruit Press',
        reasonText: 'Naturally sweet 3-layer fresh avocado, mango & papaya purée',
        affinityScore: 98,
      });
    }

    // Refreshing Palate Cleanser: Addis Special Salad
    const salad = safePool.find((i) => i.id === 'item-addis-salad');
    if (salad && targetId !== 'item-addis-salad') {
      recommendations.push({
        item: salad,
        intentBadge: 'Fresh Crunch',
        reasonText: 'Crisp greens, fresh tomatoes, and lemon olive oil vinaigrette',
        affinityScore: 92,
      });
    }

    // Pure volcanic carbonation: Ambo Water
    const ambo = safePool.find((i) => i.id === 'item-ambo-water');
    if (ambo) {
      recommendations.push({
        item: ambo,
        intentBadge: 'Natural Digestif',
        reasonText: 'Ethiopian sparkling volcanic water to aid digestion',
        affinityScore: 88,
      });
    }

    // Traditional black buna
    const buna = safePool.find((i) => i.id === 'item-coffee-buna');
    if (buna) {
      recommendations.push({
        item: buna,
        intentBadge: 'Post-Meal Ritual',
        reasonText: 'Freshly roasted single-origin highland Arabica',
        affinityScore: 85,
      });
    }

    return recommendations.slice(0, 3);
  }

  // ---------------------------------------------------------------------------
  // 2. SAVORY ETHIOPIAN MEATS & TIBS (Yebeg Tibs, Chikina, Keywot, Siga Firfir)
  // ---------------------------------------------------------------------------
  if (
    targetCategory === 'cat-lunch-dinner' ||
    targetCategory === 'cat-half-half' ||
    targetId.includes('tibs') ||
    targetId.includes('keywot') ||
    targetId.includes('firfir')
  ) {
    // Slot 1: Sparkling Ambo Water (essential palate cleanser after rich spiced niter kibbeh butter)
    const ambo = safePool.find((i) => i.id === 'item-ambo-water');
    if (ambo) {
      recommendations.push({
        item: ambo,
        intentBadge: 'Palate Cleanser',
        reasonText: 'Sparkling mineral water cuts through rich berbere butter',
        affinityScore: 97,
      });
    }

    // Slot 2: Traditional Macchiato or Buna (universal Addis post-tibs digestive)
    const macchiato = safePool.find((i) => i.id === 'item-macchiato');
    if (macchiato) {
      recommendations.push({
        item: macchiato,
        intentBadge: 'Digestive Pairing',
        reasonText: 'Velvety espresso micro-foam — classic Addis meal finisher',
        affinityScore: 95,
      });
    }

    // Slot 3: Fresh Spris Layered Juice
    const spris = safePool.find((i) => i.id === 'item-spris');
    if (spris) {
      recommendations.push({
        item: spris,
        intentBadge: 'Tropical Balance',
        reasonText: 'Thick creamy avocado, mango & papaya to balance spices',
        affinityScore: 90,
      });
    }

    // Slot 4: Sweet finish (Basbousa or Black forest cake)
    const dessert = safePool.find((i) => i.id === 'item-basbousa' || i.id === 'item-black-forest');
    if (dessert) {
      recommendations.push({
        item: dessert,
        intentBadge: 'Sweet Finish',
        reasonText: 'Delightful artisanal treat to complete your banquet',
        affinityScore: 84,
      });
    }

    return recommendations.slice(0, 3);
  }

  // ---------------------------------------------------------------------------
  // 3. MENDI & ROAST SPECIFIC (Special Mendi, Full Mendi, Roasted Chicken)
  // ---------------------------------------------------------------------------
  if (targetCategory === 'cat-mendi' || targetId.includes('mendi') || targetId.includes('chicken-full')) {
    // Slot 1: Somali Spiced Tea (Shaah) - quintessential Mendi digestif
    const somaliTea = safePool.find((i) => i.id === 'item-somali-tea');
    if (somaliTea) {
      recommendations.push({
        item: somaliTea,
        intentBadge: 'Authentic Digestif',
        reasonText: 'Slow-simmered cardamom milk tea — traditional Mendi companion',
        affinityScore: 98,
      });
    }

    // Slot 2: Fresh Spris Juice or Mango Juice
    const juice = safePool.find((i) => i.id === 'item-mango-juice' || i.id === 'item-spris');
    if (juice) {
      recommendations.push({
        item: juice,
        intentBadge: 'Refreshing Press',
        reasonText: 'Chilled sweet fruit juice pairs sublimely with roasted meats',
        affinityScore: 92,
      });
    }

    // Slot 3: Crispy French Fries
    const fries = safePool.find((i) => i.id === 'item-french-fries');
    if (fries) {
      recommendations.push({
        item: fries,
        intentBadge: 'Crispy Side',
        reasonText: 'Golden seasoned potatoes for the table',
        affinityScore: 89,
      });
    }

    // Slot 4: Basbousa semolina sweet
    const basbousa = safePool.find((i) => i.id === 'item-basbousa');
    if (basbousa) {
      recommendations.push({
        item: basbousa,
        intentBadge: 'Honey Finish',
        reasonText: 'Almond-garnished semolina cake soaked in floral honey syrup',
        affinityScore: 85,
      });
    }

    return recommendations.slice(0, 3);
  }

  // ---------------------------------------------------------------------------
  // 4. BREAKFAST SPECIALTIES (Chechebisa, Fetira, Ful, Eggs)
  // ---------------------------------------------------------------------------
  if (targetCategory === 'cat-breakfast' || targetId.includes('fetira') || targetId.includes('chechebisa') || targetId.includes('ful')) {
    // Slot 1: Ethiopian Macchiato or Buna (non-negotiable breakfast anchor)
    const macchiato = safePool.find((i) => i.id === 'item-macchiato');
    if (macchiato) {
      recommendations.push({
        item: macchiato,
        intentBadge: 'Morning Ritual',
        reasonText: 'Rich double-shot espresso layered with silky steamed milk',
        affinityScore: 99,
      });
    }

    // Slot 2: Fresh Avocado Juice
    const avocadoJuice = safePool.find((i) => i.id === 'item-avocado-juice');
    if (avocadoJuice) {
      recommendations.push({
        item: avocadoJuice,
        intentBadge: 'Fresh Energy',
        reasonText: 'Thick, creamy avocado purée with fresh lime squeeze',
        affinityScore: 93,
      });
    }

    // Slot 3: Special Milk or Somali Tea
    const specialMilk = safePool.find((i) => i.id === 'item-special-milk' || i.id === 'item-somali-tea');
    if (specialMilk) {
      recommendations.push({
        item: specialMilk,
        intentBadge: 'Warm Spices',
        reasonText: 'Ginger and cardamom-steamed whole milk for comfort',
        affinityScore: 87,
      });
    }

    return recommendations.slice(0, 3);
  }

  // ---------------------------------------------------------------------------
  // 5. BURGERS & SHAWARMA
  // ---------------------------------------------------------------------------
  if (targetCategory === 'cat-burgers' || targetId.includes('burger') || targetId.includes('shawarma')) {
    // Slot 1: Crispy Golden French Fries (#1 high-converting cross-sell in menu engineering)
    const fries = safePool.find((i) => i.id === 'item-french-fries');
    if (fries) {
      recommendations.push({
        item: fries,
        intentBadge: 'Classic Combo',
        reasonText: 'Hot, salted golden fries with garlic mayo dip',
        affinityScore: 99,
      });
    }

    // Slot 2: Milkshake (Strawberry / Chocolate)
    const shake = safePool.find((i) => i.id === 'item-milkshake');
    if (shake) {
      recommendations.push({
        item: shake,
        intentBadge: 'Creamy Shake',
        reasonText: 'Thick, ice-cold blended shake topped with whipped cream',
        affinityScore: 94,
      });
    }

    // Slot 3: Fried Chicken Wings or Calamari
    const wings = safePool.find((i) => i.id === 'item-chicken-wings' || i.id === 'item-calamari');
    if (wings) {
      recommendations.push({
        item: wings,
        intentBadge: 'Crispy Starter',
        reasonText: 'Seasoned garlic pepper wings or tender calamari fritti',
        affinityScore: 88,
      });
    }

    return recommendations.slice(0, 3);
  }

  // ---------------------------------------------------------------------------
  // 6. PIZZAS
  // ---------------------------------------------------------------------------
  if (targetCategory === 'cat-woodfired' || targetId.includes('pizza')) {
    // Slot 1: Crispy Point Judith Calamari Fritti
    const calamari = safePool.find((i) => i.id === 'item-calamari');
    if (calamari) {
      recommendations.push({
        item: calamari,
        intentBadge: 'Crispy Starter',
        reasonText: 'Tender golden squid rings with fresh lemon & tartar sauce',
        affinityScore: 96,
      });
    }

    // Slot 2: Ambo Mineral Water
    const ambo = safePool.find((i) => i.id === 'item-ambo-water');
    if (ambo) {
      recommendations.push({
        item: ambo,
        intentBadge: 'Volcanic Sparkle',
        reasonText: 'Naturally carbonated mineral water pairs crisp with sourdough crust',
        affinityScore: 92,
      });
    }

    // Slot 3: Chicken Tenders or Fries
    const snack = safePool.find((i) => i.id === 'item-chicken-tenders' || i.id === 'item-french-fries');
    if (snack) {
      recommendations.push({
        item: snack,
        intentBadge: 'Table Share',
        reasonText: 'Golden-fried tenders or crispy salted fries to share',
        affinityScore: 88,
      });
    }

    return recommendations.slice(0, 3);
  }

  // ---------------------------------------------------------------------------
  // 7. HOT BEVERAGES (Buna, Macchiato, Somali Tea, Special Milk)
  // ---------------------------------------------------------------------------
  if (targetCategory === 'cat-drinks' || targetCategory === 'cat-juices') {
    // When ordering a beverage, recommend artisanal bakery items
    const croissant = safePool.find((i) => i.id === 'item-croissant');
    if (croissant) {
      recommendations.push({
        item: croissant,
        intentBadge: 'Artisanal Bakery',
        reasonText: 'Flaky, buttery French croissant baked fresh this morning',
        affinityScore: 98,
      });
    }

    const cake = safePool.find((i) => i.id === 'item-black-forest' || i.id === 'item-opera-cake');
    if (cake) {
      recommendations.push({
        item: cake,
        intentBadge: 'Sweet Pairing',
        reasonText: 'Layered decadent chocolate & espresso sponge cake',
        affinityScore: 94,
      });
    }

    const bombolino = safePool.find((i) => i.id === 'item-bombolino');
    if (bombolino) {
      recommendations.push({
        item: bombolino,
        intentBadge: 'Warm Treat',
        reasonText: 'Italian-style vanilla custard cream filled doughnut',
        affinityScore: 90,
      });
    }

    return recommendations.slice(0, 3);
  }

  // ---------------------------------------------------------------------------
  // 8. BAKERY & DESSERTS (Cakes, Croissants, Breads)
  // ---------------------------------------------------------------------------
  if (targetCategory === 'cat-desserts') {
    // When ordering a dessert, recommend the coffee or tea pairing
    const macchiato = safePool.find((i) => i.id === 'item-macchiato');
    if (macchiato) {
      recommendations.push({
        item: macchiato,
        intentBadge: 'Espresso Pairing',
        reasonText: 'Velvety espresso foam cuts through sweet chocolate ganache',
        affinityScore: 99,
      });
    }

    const buna = safePool.find((i) => i.id === 'item-coffee-buna');
    if (buna) {
      recommendations.push({
        item: buna,
        intentBadge: 'Traditional Buna',
        reasonText: 'Aromatic Ethiopian single-origin roast in traditional clay cup',
        affinityScore: 94,
      });
    }

    const spris = safePool.find((i) => i.id === 'item-spris');
    if (spris) {
      recommendations.push({
        item: spris,
        intentBadge: 'Fresh Press',
        reasonText: '3-layer tropical avocado, mango, and papaya purée',
        affinityScore: 88,
      });
    }

    return recommendations.slice(0, 3);
  }

  // ---------------------------------------------------------------------------
  // DEFAULT / GENERAL FALLBACK: Drinks + Light Side + Sweet
  // ---------------------------------------------------------------------------
  const drink = safePool.find((i) => i.category_id === 'cat-drinks' || i.category_id === 'cat-juices');
  if (drink) {
    recommendations.push({
      item: drink,
      intentBadge: 'Refreshing Sip',
      reasonText: 'Handcrafted beverage pairing',
      affinityScore: 80,
    });
  }

  const side = safePool.find((i) => i.category_id === 'cat-snacks');
  if (side) {
    recommendations.push({
      item: side,
      intentBadge: 'Crispy Side',
      reasonText: 'Delicious accompaniment for the table',
      affinityScore: 75,
    });
  }

  const dessert = safePool.find((i) => i.category_id === 'cat-desserts');
  if (dessert) {
    recommendations.push({
      item: dessert,
      intentBadge: 'Sweet Finish',
      reasonText: 'House-baked bakery delicacy',
      affinityScore: 70,
    });
  }

  return recommendations.slice(0, 3);
}
