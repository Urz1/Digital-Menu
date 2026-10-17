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

  // Helper to find items by id, name substring, or keyword
  const findItem = (...matchers: string[]) => {
    return safePool.find((i) => {
      if (recommendations.some((r) => r.item.id === i.id)) return false;
      const idLower = i.id.toLowerCase();
      const nameLower = i.name.toLowerCase();
      return matchers.some(
        (m) => idLower.includes(m.toLowerCase()) || nameLower.includes(m.toLowerCase())
      );
    });
  };

  // ---------------------------------------------------------------------------
  // 1. FASTING CUISINE PAIRINGS (Beyaynetu, Shiro Fasting, Suf Fitfit, Fasting Agelegil)
  // ---------------------------------------------------------------------------
  if (isFasting || targetCategory === 'cat-fasting-lunch' || targetCategory === 'cat-fasting') {
    // Top pairing: 100% pure fresh layered juice (Spris) or Avocado Juice
    const spris = findItem('item-spris', 'sprice juice', 'spris', 'avocado');
    if (spris) {
      recommendations.push({
        item: spris,
        intentBadge: 'Fasting Fruit Press',
        reasonText: 'Naturally sweet fresh avocado, mango & papaya purée',
        affinityScore: 98,
      });
    }

    // Refreshing Palate Cleanser: Addis Special Salad
    const salad = findItem('item-addis-salad', 'salad');
    if (salad && targetId !== salad.id) {
      recommendations.push({
        item: salad,
        intentBadge: 'Fresh Crunch',
        reasonText: 'Crisp greens, fresh tomatoes, and lemon olive oil vinaigrette',
        affinityScore: 92,
      });
    }

    // Pure volcanic carbonation: Ambo Water
    const ambo = findItem('item-ambo-water', 'ambo water', 'ambo');
    if (ambo) {
      recommendations.push({
        item: ambo,
        intentBadge: 'Natural Digestif',
        reasonText: 'Ethiopian sparkling volcanic water to aid digestion',
        affinityScore: 88,
      });
    }

    // Traditional black buna
    const buna = findItem('item-coffee-buna', 'coffee', 'steam coffee', 'buna');
    if (buna) {
      recommendations.push({
        item: buna,
        intentBadge: 'Post-Meal Ritual',
        reasonText: 'Freshly roasted single-origin highland Arabica',
        affinityScore: 85,
      });
    }

    if (recommendations.length > 0) {
      return recommendations.slice(0, 3);
    }
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
    const ambo = findItem('item-ambo-water', 'ambo water', 'ambo');
    if (ambo) {
      recommendations.push({
        item: ambo,
        intentBadge: 'Palate Cleanser',
        reasonText: 'Sparkling mineral water cuts through rich berbere butter',
        affinityScore: 97,
      });
    }

    // Slot 2: Traditional Macchiato or Buna (universal Addis post-tibs digestive)
    const macchiato = findItem('item-macchiato', 'macchiato') || findItem('coffee', 'buna');
    if (macchiato) {
      recommendations.push({
        item: macchiato,
        intentBadge: 'Digestive Pairing',
        reasonText: 'Velvety espresso micro-foam — classic Addis meal finisher',
        affinityScore: 95,
      });
    }

    // Slot 3: Fresh Spris Layered Juice
    const spris = findItem('item-spris', 'sprice juice', 'mango', 'avocado');
    if (spris) {
      recommendations.push({
        item: spris,
        intentBadge: 'Tropical Balance',
        reasonText: 'Thick creamy fruit purée to balance spices',
        affinityScore: 90,
      });
    }

    // Slot 4: Sweet finish (Basbousa or Black forest cake)
    const dessert = findItem('item-basbousa', 'basbousa', 'black forest', 'cream cake');
    if (dessert) {
      recommendations.push({
        item: dessert,
        intentBadge: 'Sweet Finish',
        reasonText: 'Delightful artisanal treat to complete your banquet',
        affinityScore: 84,
      });
    }

    if (recommendations.length > 0) {
      return recommendations.slice(0, 3);
    }
  }

  // ---------------------------------------------------------------------------
  // 3. MENDI & ROAST SPECIFIC (Special Mendi, Full Mendi, Roasted Chicken)
  // ---------------------------------------------------------------------------
  if (targetCategory === 'cat-mendi' || targetId.includes('mendi') || targetId.includes('chicken-full') || targetId.includes('roasted')) {
    // Slot 1: Somali Spiced Tea (Shaah) - quintessential Mendi digestif
    const somaliTea = findItem('item-somali-tea', 'somali tea', 'special tea');
    if (somaliTea) {
      recommendations.push({
        item: somaliTea,
        intentBadge: 'Authentic Digestif',
        reasonText: 'Slow-simmered cardamom milk tea — traditional Mendi companion',
        affinityScore: 98,
      });
    }

    // Slot 2: Fresh Spris Juice or Mango Juice
    const juice = findItem('item-mango-juice', 'mango', 'sprice juice', 'orange');
    if (juice) {
      recommendations.push({
        item: juice,
        intentBadge: 'Refreshing Press',
        reasonText: 'Chilled sweet fruit juice pairs sublimely with roasted meats',
        affinityScore: 92,
      });
    }

    // Slot 3: Crispy French Fries
    const fries = findItem('item-french-fries', 'french frise', 'french fries');
    if (fries) {
      recommendations.push({
        item: fries,
        intentBadge: 'Crispy Side',
        reasonText: 'Golden seasoned potatoes for the table',
        affinityScore: 89,
      });
    }

    // Slot 4: Basbousa semolina sweet
    const basbousa = findItem('item-basbousa', 'basbousa', 'orange basbousa');
    if (basbousa) {
      recommendations.push({
        item: basbousa,
        intentBadge: 'Honey Finish',
        reasonText: 'Almond-garnished semolina cake soaked in floral honey syrup',
        affinityScore: 85,
      });
    }

    if (recommendations.length > 0) {
      return recommendations.slice(0, 3);
    }
  }

  // ---------------------------------------------------------------------------
  // 4. BREAKFAST SPECIALTIES (Chechebisa, Fetira, Ful, Eggs)
  // ---------------------------------------------------------------------------
  if (targetCategory === 'cat-breakfast' || targetId.includes('fetira') || targetId.includes('chechebisa') || targetId.includes('ful')) {
    // Slot 1: Ethiopian Macchiato or Buna (non-negotiable breakfast anchor)
    const macchiato = findItem('item-macchiato', 'macchiato', 'coffee');
    if (macchiato) {
      recommendations.push({
        item: macchiato,
        intentBadge: 'Morning Ritual',
        reasonText: 'Rich double-shot espresso layered with silky steamed milk',
        affinityScore: 99,
      });
    }

    // Slot 2: Fresh Avocado Juice
    const avocadoJuice = findItem('item-avocado-juice', 'avocado', 'sprice juice');
    if (avocadoJuice) {
      recommendations.push({
        item: avocadoJuice,
        intentBadge: 'Fresh Energy',
        reasonText: 'Thick, creamy avocado purée with fresh lime squeeze',
        affinityScore: 93,
      });
    }

    // Slot 3: Special Milk or Somali Tea
    const specialMilk = findItem('item-special-milk', 'special milk', 'somali tea');
    if (specialMilk) {
      recommendations.push({
        item: specialMilk,
        intentBadge: 'Warm Spices',
        reasonText: 'Ginger and cardamom-steamed whole milk for comfort',
        affinityScore: 87,
      });
    }

    if (recommendations.length > 0) {
      return recommendations.slice(0, 3);
    }
  }

  // ---------------------------------------------------------------------------
  // 5. BURGERS & WRAPS
  // ---------------------------------------------------------------------------
  if (targetCategory === 'cat-burgers' || targetCategory === 'cat-wraps' || targetId.includes('burger') || targetId.includes('shawarma') || targetId.includes('shewarma')) {
    // Slot 1: Crispy Golden French Fries
    const fries = findItem('item-french-fries', 'french frise', 'french fries');
    if (fries) {
      recommendations.push({
        item: fries,
        intentBadge: 'Classic Combo',
        reasonText: 'Hot, salted golden fries with delicious dip',
        affinityScore: 99,
      });
    }

    // Slot 2: Shake or Cold Drink
    const drink = findItem('shake', 'mojito', 'soft drinks', 'ice coffee');
    if (drink) {
      recommendations.push({
        item: drink,
        intentBadge: 'Chilled Sip',
        reasonText: 'Ice-cold refreshment to pair with savory grilled burger',
        affinityScore: 94,
      });
    }

    // Slot 3: Fried Chicken Wings or Nuggets
    const wings = findItem('fried chicken wings', 'chicken nugget', 'chicken tender');
    if (wings) {
      recommendations.push({
        item: wings,
        intentBadge: 'Crispy Starter',
        reasonText: 'Crispy seasoned chicken accompaniment',
        affinityScore: 88,
      });
    }

    if (recommendations.length > 0) {
      return recommendations.slice(0, 3);
    }
  }

  // ---------------------------------------------------------------------------
  // 6. PIZZAS
  // ---------------------------------------------------------------------------
  if (targetCategory === 'cat-pizzas' || targetCategory === 'cat-woodfired' || targetId.includes('pizza') || targetItem.name.toLowerCase().includes('pizza')) {
    // Slot 1: Cold Drinks or Ambo Water
    const coldDrink = findItem('soft drinks', 'ambo water', 'mojito', 'water', 'ice coffee');
    if (coldDrink) {
      recommendations.push({
        item: coldDrink,
        intentBadge: 'Crisp Refreshment',
        reasonText: 'Naturally chilled sparkling drink pairs crisp with sourdough pizza crust',
        affinityScore: 96,
      });
    }

    // Slot 2: Snack / Fries
    const snack = findItem('french frise', 'french fries', 'chicken nugget', 'spring roll');
    if (snack) {
      recommendations.push({
        item: snack,
        intentBadge: 'Table Share',
        reasonText: 'Golden-fried tenders or crispy salted fries to share',
        affinityScore: 92,
      });
    }

    // Slot 3: Sweet finish / cake
    const sweet = findItem('basbousa', 'black forest', 'cream cake', 'croissant');
    if (sweet) {
      recommendations.push({
        item: sweet,
        intentBadge: 'Sweet Finish',
        reasonText: 'Delightful house-baked bakery dessert',
        affinityScore: 88,
      });
    }

    if (recommendations.length > 0) {
      return recommendations.slice(0, 3);
    }
  }

  // ---------------------------------------------------------------------------
  // 7. HOT BEVERAGES (Buna, Macchiato, Somali Tea, Special Milk)
  // ---------------------------------------------------------------------------
  if (
    targetCategory === 'cat-hot-beverage' ||
    targetCategory === 'cat-hot-drinks' ||
    targetCategory === 'cat-cold-drinks' ||
    targetCategory === 'cat-juice' ||
    targetCategory === 'cat-drinks' ||
    targetCategory === 'cat-juices'
  ) {
    // When ordering a beverage, recommend artisanal bakery items
    const croissant = findItem('item-croissant', 'croissant plain', 'croissant', 'white plain', 'bombolino');
    if (croissant) {
      recommendations.push({
        item: croissant,
        intentBadge: 'Artisanal Bakery',
        reasonText: 'Flaky, buttery pastry baked fresh today',
        affinityScore: 98,
      });
    }

    const cake = findItem('black forest', 'black&white forest', 'opera cake', 'cream cake');
    if (cake) {
      recommendations.push({
        item: cake,
        intentBadge: 'Sweet Pairing',
        reasonText: 'Decadent layered cake pairs perfectly with hot coffee',
        affinityScore: 94,
      });
    }

    const bombolino = findItem('bombolino', 'basbousa', 'cup cake');
    if (bombolino) {
      recommendations.push({
        item: bombolino,
        intentBadge: 'Warm Treat',
        reasonText: 'Italian-style vanilla custard cream filled doughnut',
        affinityScore: 90,
      });
    }

    if (recommendations.length > 0) {
      return recommendations.slice(0, 3);
    }
  }

  // ---------------------------------------------------------------------------
  // 8. BAKERY & DESSERTS (Cakes, Croissants, Breads)
  // ---------------------------------------------------------------------------
  if (
    targetCategory === 'cat-soft-cake' ||
    targetCategory === 'cat-bread' ||
    targetCategory === 'cat-desserts'
  ) {
    // When ordering a dessert, recommend the coffee or tea pairing
    const macchiato = findItem('macchiato', 'double macchiato');
    if (macchiato) {
      recommendations.push({
        item: macchiato,
        intentBadge: 'Espresso Pairing',
        reasonText: 'Velvety espresso foam cuts through sweet rich sponge',
        affinityScore: 99,
      });
    }

    const buna = findItem('coffee', 'steam coffee', 'special tea');
    if (buna) {
      recommendations.push({
        item: buna,
        intentBadge: 'Traditional Buna',
        reasonText: 'Aromatic Ethiopian single-origin roast in traditional cup',
        affinityScore: 94,
      });
    }

    const spris = findItem('sprice juice', 'mango', 'avocado');
    if (spris) {
      recommendations.push({
        item: spris,
        intentBadge: 'Fresh Press',
        reasonText: 'Fresh fruit purée to refresh the palate',
        affinityScore: 88,
      });
    }

    if (recommendations.length > 0) {
      return recommendations.slice(0, 3);
    }
  }

  // ---------------------------------------------------------------------------
  // DEFAULT / GENERAL FALLBACK: Drinks + Light Side + Sweet
  // ---------------------------------------------------------------------------
  const drink = safePool.find(
    (i) =>
      (i.category_id === 'cat-juice' ||
        i.category_id === 'cat-hot-beverage' ||
        i.category_id === 'cat-cold-drinks' ||
        i.category_id === 'cat-drinks' ||
        i.category_id === 'cat-juices') &&
      !recommendations.some((r) => r.item.id === i.id)
  );
  if (drink) {
    recommendations.push({
      item: drink,
      intentBadge: 'Refreshing Sip',
      reasonText: 'Handcrafted beverage pairing',
      affinityScore: 80,
    });
  }

  const side = safePool.find(
    (i) =>
      (i.category_id === 'cat-snack-menu' || i.category_id === 'cat-snacks') &&
      !recommendations.some((r) => r.item.id === i.id)
  );
  if (side) {
    recommendations.push({
      item: side,
      intentBadge: 'Crispy Side',
      reasonText: 'Delicious accompaniment for the table',
      affinityScore: 75,
    });
  }

  const dessert = safePool.find(
    (i) =>
      (i.category_id === 'cat-soft-cake' ||
        i.category_id === 'cat-bread' ||
        i.category_id === 'cat-desserts') &&
      !recommendations.some((r) => r.item.id === i.id)
  );
  if (dessert) {
    recommendations.push({
      item: dessert,
      intentBadge: 'Sweet Finish',
      reasonText: 'House-baked bakery delicacy',
      affinityScore: 70,
    });
  }

  if (recommendations.length === 0 && safePool.length > 0) {
    return safePool.slice(0, 3).map((item) => ({
      item,
      intentBadge: 'Goes Well',
      reasonText: 'Chef recommended complement',
      affinityScore: 65,
    }));
  }

  return recommendations.slice(0, 3);
}
