const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DATA_PROVIDER_PATH = path.join(__dirname, '../src/lib/data-provider.ts');
const OFFICIAL_DATA_PATH = path.join(__dirname, 'official-menu-data.ts');
const OUTPUT_DIR = path.join(__dirname, '../public/images/dishes');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Dedicated authentic Ethiopian images already in repo:
const AUTHENTIC_LOCAL_MAP = {
  'item-special-fetira-42': '/images/dishes/special-fetira.jpg',
  'item-fetira-41': '/images/dishes/fetira.jpeg',
  'item-chechebisa-48': '/images/dishes/chechebisa.jpg',
  'item-quanta-firfir-123': '/images/dishes/quanta-firfir.jpg',
  'item-full-special-44': '/images/dishes/ful-special.jpg',
  'item-yebeg-tibs-120': '/images/dishes/yebeg-tibs.jpg',
  'item-yebeg-keywot-133': '/images/dishes/yebeg-keywot.jpg',
  'item-shiro-with-butter-124': '/images/dishes/shiro.jpg',
  'item-shiro-149': '/images/dishes/shiro-149.jpg',
  'item-beyaynetu-150': '/images/dishes/beyaynetu.jpg',
  'item-special-mendi-138': '/images/dishes/special-mendi.jpg',
  'item-sprice-juice-100': '/images/dishes/spris-juice.jpg',
  'item-coffee-75': '/images/dishes/ethiopian-buna.jpg',
};

// Curated search terms tailored specifically for each dish to get plate/dish ONLY (no people):
const DISH_SEARCH_TERMS = {
  // 1. Soft Cake
  'item-cream-cake-1': 'cream-cake-slice-white',
  'item-black-forest-2': 'black-forest-cake-cherry',
  'item-black-white-forest-3': 'chocolate-vanilla-layered-cake',
  'item-strawberry-cake-4': 'strawberry-shortcake-fraisier',
  'item-opera-cake-5': 'french-opera-cake-chocolate',
  'item-torta-cake-6': 'celebration-torta-cake',
  'item-cup-cake-7': 'vanilla-cupcake-frosting',
  'item-english-cake-8': 'pound-cake-loaf-sliced',
  'item-basbousa-9': 'basbousa-semolina-pastry',
  'item-orange-basbousa-10': 'orange-semolina-cake',
  'item-croissant-plain-11': 'butter-croissant-pastry',
  'item-white-plain-12': 'vanilla-sponge-cake-powdered',
  'item-orange-fasting-13': 'vegan-orange-cake',
  'item-orange-cake-14': 'orange-chiffon-cake',
  'item-venus-plain-big-15': 'brioche-sweet-bun',
  'item-venus-plane-short-16': 'choux-pastry-cream',
  'item-beckewhe-17': 'pistachio-baklava-diamond',
  'item-cookise-18': 'chocolate-chip-cookies-plate',

  // 2. Bread
  'item-calvine-bread-19': 'sourdough-boule-bread',
  'item-otes-bread-20': 'oat-seeded-bread-loaf',
  'item-fewast-bread-21': 'braided-challah-bread',
  'item-ragest-brade-22': 'dark-rye-country-bread',
  'item-aja-bread-23': 'rustic-flatbread-oat',
  'item-aja-ragkeste-24': 'whole-grain-crispbread',
  'item-gebis-bread-25': 'barley-bread-loaf',
  'item-gebis-baget-26': 'french-baguette-bread',
  'item-gebis-mini-27': 'dinner-bread-rolls-basket',
  'item-min-bread-rog-28': 'crusty-bread-rolls',
  'item-normal-bread-180g-29': 'sliced-white-bread-loaf',
  'item-normal-bread-110g-30': 'artisan-bread-roll',
  'item-care-bread-31': 'brioche-toast-bread',
  'item-crizil-bread-32': 'pretzel-bread-loaf',
  'item-gebic-cake-33': 'tea-cake-bread-sliced',
  'item-aja-bageste-long-34': 'long-baguette-bread',
  'item-babesfi-bread-35': 'japanese-milk-bread-rolls',
  'item-bombolino-36': 'bomboloni-italian-doughnut',
  'item-boksenya-37': 'sweet-spiced-bread-rolls',

  // 3. Breakfast
  'item-feta-with-honey-38': 'feta-cheese-honey-drizzle',
  'item-feta-with-tamer-39': 'feta-cheese-medjool-dates',
  'item-feta-with-honey-tamer-and-banana-40': 'feta-dates-banana-honey-bowl',
  'item-fetira-41': 'layered-flatbread-pastry',
  'item-special-fetira-42': 'sweet-crepe-banana-honey',
  'item-full-normal-43': 'foul-mudammas-fava-beans',
  'item-full-special-44': 'fava-beans-stew-egg-tomato',
  'item-addis-combo-break-fast-45': 'breakfast-platter-eggs-bread',
  'item-scramble-egg-46': 'scrambled-eggs-chives-plate',
  'item-egg-sandwich-47': 'breakfast-egg-sandwich-brioche',
  'item-omelet-48': 'french-herb-omelette-plate',
  'item-avocado-toast-49': 'avocado-toast-sourdough-microgreens',
  'item-chechebisa-fasting-50': 'ethiopian-flatbread-spices',
  'item-chechebisa-51': 'torn-flatbread-honey-butter',
  'item-chechebisa-teff-52': 'teff-grain-pancake-flatbread',
  'item-oats-53': 'oatmeal-porridge-berries-almonds',
  'item-siga-firfir-54': 'beef-stew-bread-pieces',
  'item-injera-firfir-55': 'tomato-spiced-firfir',

  // 4. Burgers
  'item-special-burger-56': 'gourmet-bacon-cheeseburger',
  'item-chicken-burger-57': 'crispy-chicken-burger-brioche',
  'item-cheese-burger-58': 'classic-cheeseburger-pickles',
  'item-beef-burger-59': 'flame-grilled-beef-burger',

  // 5. Pizzas
  'item-speacial-pizza-60': 'supreme-pizza-meat-peppers',
  'item-margarita-pizza-61': 'margherita-pizza-basil-mozzarella',
  'item-chicken-pizza-62': 'bbq-chicken-pizza-onions',
  'item-tuna-pizza-63': 'tuna-onion-pizza',
  'item-vegetable-pizza-64': 'vegetarian-pizza-bell-peppers',

  // 6. Snack Menu
  'item-french-frise-65': 'french-fries-wire-basket',
  'item-spring-roll-vegetable-66': 'vegetable-spring-rolls-sweet-chili',
  'item-spring-roll-meat-67': 'crispy-meat-spring-rolls',
  'item-addis-snack-68': 'fried-sambusa-samosa-platter',
  'item-fish-chips-69': 'fish-and-chips-tartar-sauce',
  'item-fried-chicken-wings-70': 'crispy-fried-chicken-wings-sauce',
  'item-chicken-nugget-71': 'crispy-golden-chicken-nuggets',
  'item-a-chicken-tender-4pcs-72': 'crispy-chicken-tenders-dip',
  'item-a-chicken-tender-6pcs-73': 'buttermilk-chicken-strips-platter',

  // 7. Hot Beverage
  'item-special-milk-74': 'steamed-hot-milk-cinnamon',
  'item-coffee-75': 'traditional-black-coffee-cup',
  'item-tea-76': 'black-tea-glass-cup',
  'item-macchiato-77': 'layered-espresso-macchiato-glass',
  'item-double-macchiato-78': 'double-shot-macchiato-foam',
  'item-steam-coffee-79': 'long-black-espresso-crema',
  'item-special-tea-80': 'spiced-masala-tea-cloves',
  'item-safi-milk-81': 'pure-warm-milk-glass',
  'item-cafe-late-82': 'caffe-latte-art-glass',
  'item-cappuccino-83': 'cappuccino-cocoa-dusting-cup',
  'item-ginger-tea-84': 'ginger-lemon-honey-tea',
  'item-lewoze-tea-85': 'roasted-peanut-tea',
  'item-milk-tea-86': 'creamy-karak-milk-tea',
  'item-somali-tea-87': 'cardamom-spiced-chai-tea',
  'item-green-tea-88': 'green-tea-glass-leaves',
  'item-orange-tea-89': 'citrus-orange-infused-tea',
  'item-americano-coffee-90': 'hot-americano-coffee-mug',
  'item-lemon-tea-91': 'lemon-slice-black-tea',
  'item-sprice-tea-92': 'layered-coffee-and-tea-drink',
  'item-hot-chocolate-93': 'hot-chocolate-marshmallows-cup',
  'item-nana-tea-94': 'moroccan-mint-nana-tea',
  'item-lipton-tea-95': 'black-tea-mug-teabag',

  // 8. Juice
  'item-avocado-96': 'avocado-smoothie-tall-glass',
  'item-papaya-juice-97': 'fresh-papaya-juice-glass',
  'item-watermelon-juice-98': 'watermelon-juice-ice-glass',
  'item-mango-99': 'pure-mango-juice-glass',
  'item-sprice-juice-100': 'layered-fruit-smoothie-tri-color',
  'item-gishita-juice-101': 'soursop-guanabana-juice',
  'item-ananas-102': 'fresh-pineapple-juice-glass',
  'item-orange-103': 'fresh-squeezed-orange-juice-glass',
  'item-ginger-juice-104': 'ginger-lemon-juice-shot',
  'item-stroberry-shake-105': 'strawberry-milkshake-whipped-cream',
  'item-banana-shake-106': 'banana-milkshake-glass',
  'item-avocado-shake-107': 'avocado-milk-honey-smoothie',
  'item-mango-shake-108': 'mango-lassi-shake-glass',
  'item-chocolate-shake-109': 'chocolate-milkshake-fudge',
  'item-special-juice-110': 'tropical-mixed-fruit-punch',

  // 9. Cold Drinks
  'item-ice-coffee-111': 'cold-brew-iced-coffee-glass',
  'item-ice-late-americano-112': 'iced-latte-milk-swirl-glass',
  'item-mojito-113': 'lime-mint-virgin-mojito-glass',
  'item-soft-drinks-114': 'cola-soda-glass-ice-lemon',
  'item-ambo-water-115': 'sparkling-mineral-water-lemon',
  'item-water-300ml-116': 'mineral-water-bottle-clear',
  'item-water-600ml-117': 'spring-water-bottle-cold',
  'item-water-1000ml-118': 'water-pitcher-ice-lemon',
  'item-caramel-iced-coffee-119': 'caramel-iced-latte-drizzle',

  // 10. Lunch and Dinner
  'item-yebeg-tibs-120': 'lamb-meat-skillet-rosemary',
  'item-rice-with-meat-121': 'spiced-yellow-rice-braised-beef',
  'item-rice-with-vegetable-122': 'vegetable-fried-rice-bowl',
  'item-quanta-firfir-123': 'beef-jerky-stew-flatbread',
  'item-shiro-with-butter-124': 'chickpea-curry-stew-claypot',
  'item-smart-shiro-125': 'smooth-chickpea-curry-peppers',
  'item-pasta-with-vegetable-126': 'penne-pasta-roasted-vegetables',
  'item-pasta-with-meat-127': 'spaghetti-bolognese-meat-sauce',
  'item-pasta-with-tomato-128': 'spaghetti-pomodoro-fresh-basil',
  'item-doro-tibs-129': 'chicken-tibs-pan-fried-onions',
  'item-vigitable-sup-130': 'hearty-vegetable-soup-bowl',
  'item-chikina-tibs-131': 'beef-fillet-tips-onions',
  'item-tibs-tefersho-132': 'sauteed-beef-tibs-platter',
  'item-yebeg-keywot-133': 'spicy-lamb-curry-stew',
  'item-agelegil-134': 'ethiopian-food-feast-platter',
  'item-gomen-besiga-135': 'braised-collard-greens-beef',
  'item-grilled-fish-136': 'whole-grilled-tilapia-fish-lemon',

  // 11. Mendi
  'item-mofo-137': 'spiced-meat-rice-platter',
  'item-special-mendi-138': 'lamb-mendi-saffron-rice-nuts',
  'item-mend-1-2-139': 'arabic-spiced-rice-roast-meat',
  'item-mend-full-140': 'fragrant-mendi-rice-lamb-shanks',
  'item-1-2-roasted-chicken-141': 'half-roasted-chicken-rice',
  'item-roasted-chicken-full-142': 'whole-rotisserie-chicken-platter',

  // 12. Half Half
  'item-keywot-and-fitfit-143': 'beef-curry-stew-firfir-plate',
  'item-tibs-and-fitfit-144': 'beef-tibs-firfir-combo',
  'item-cooked-vegs-and-aja-145': 'steamed-vegetables-oat-porridge',

  // 13. Wraps
  'item-tuna-sandwich-146': 'tuna-salad-sandwich-triangles',
  'item-beef-shewarema-147': 'beef-shawarma-wrap-tahini',
  'item-chicken-shewarma-148': 'chicken-shawarma-wrap-garlic',

  // 14. Fasting Lunch
  'item-shiro-149': 'vegan-chickpea-stew-bowl',
  'item-beyaynetu-150': 'ethiopian-vegetarian-combo-platter',
  'item-fasting-agelegil-151': 'vegan-ethiopian-feast-injera',
  'item-suf-fitfit-152': 'sunflower-seed-injera-firfir',
  'item-addis-special-salad-153': 'fresh-mediterranean-salad-bowl',
  'item-aja-with-spinach-154': 'cooked-oats-sauteed-spinach',

  // 15. Takeaway & Extras
  'item-takeaway-155': 'kraft-paper-takeaway-food-box',
  'item-pizza-takeaway-156': 'pizza-delivery-box-open',
  'item-extra-cheese-157': 'shredded-mozzarella-cheese-bowl',
};

// Verified high quality food photos pool for reliable zero-person results
const VERIFIED_FOOD_PHOTOS = [
  'photo-1595272568891-123402d0fb3b', // cream cake
  'photo-1606890737304-57a1ca8a5b62', // black forest
  'photo-1578985545062-69928b1d9587', // chocolate layer cake
  'photo-1611293388250-580b08c4a145', // strawberry fraisier
  'photo-1571115177098-24ec42ed204d', // opera cake
  'photo-1535141192574-5d4897c13136', // celebration torta
  'photo-1614707267537-b85aaf00c4b7', // cupcake
  'photo-1586985289688-ca3cf47d3e6e', // pound cake
  'photo-1587314168485-3236d6710814', // basbousa
  'photo-1509440159596-0249088772ff', // bread loaf
  'photo-1555507036-ab1f4038808a', // croissant
  'photo-1505976378723-9726b54e9bb9', // vanilla slice
  'photo-1563729784474-d77dbb933a9e', // orange cake
  'photo-1519869325930-281384150729', // citrus chiffon
  'photo-1509365465985-25d11c17e812', // brioche
  'photo-1621303837174-89787a7d4729', // pastry
  'photo-1519676867240-f03562e64548', // baklava
  'photo-1499636136210-6f4ee915583e', // cookies
  'photo-1549931319-a545dcf3bc73', // bread
  'photo-1589367920969-ab8e050bbb04', // challah
  'photo-1586444248902-2f64eddc13df', // rye
  'photo-1598373182133-52452f7691ef', // flatbread
  'photo-1527515862127-a4fc05baf7a5', // doughnut
  'photo-1568901346375-23c9450c58cd', // burger
  'photo-1550547660-d9450f859349', // burger 2
  'photo-1565299585323-38d6b0865b47', // burger 3
  'photo-1513104890138-7c749659a591', // pizza margherita
  'photo-1534308983496-4fabb1a015ee', // pizza supreme
  'photo-1574071318508-1cdbab80d002', // pizza
  'photo-1576107232684-1279f3908594', // fries
  'photo-1562967914-608f82629710', // tenders
  'photo-1527477378378-fb57e844df0e', // wings
  'photo-1514432324607-a09d9b4aefdd', // espresso
  'photo-1541167760496-1628856ab772', // latte art
  'photo-1485808191679-5f86510681a2', // black coffee
  'photo-1556881286-fc6915169721', // watermelon juice
  'photo-1546173159-315724a31696', // orange juice
  'photo-1572490122747-3968b75cc699', // strawberry shake
  'photo-1517256064527-09c73fc73e38', // iced coffee
  'photo-1551024709-8f23befc6f87', // mojito
  'photo-1551183053-bf91a1d81141', // dessert
  'photo-1540420773420-3366772f4999', // fresh salad
  'photo-1555396273-367ea4eb4db5', // pasta bolognese
  'photo-1551183053-bf91a1d81141', // dish
  'photo-1546069901-ba9599a7e63c', // healthy bowl
];

async function main() {
  const code = fs.readFileSync(DATA_PROVIDER_PATH, 'utf8');
  const match = code.match(/export const MOCK_ITEMS_ADDIS: MenuItem\[\] = (\[[\s\S]*?\]);/);
  if (!match) {
    console.error('Could not find MOCK_ITEMS_ADDIS in data-provider.ts');
    process.exit(1);
  }

  const items = JSON.parse(match[1]);
  console.log(`Processing ${items.length} dishes...`);

  const usedIds = new Set();
  // Mark local authentic images as used
  for (const localUrl of Object.values(AUTHENTIC_LOCAL_MAP)) {
    usedIds.add(localUrl);
  }

  let downloadedCount = 0;
  let authenticCount = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const itemId = item.id;
    const itemName = item.name;
    const itemSlug = itemId.replace(/^item-/, '');

    // Check if this item has an authentic local photo that hasn't been claimed yet
    if (AUTHENTIC_LOCAL_MAP[itemId] && fs.existsSync(path.join(__dirname, '../public', AUTHENTIC_LOCAL_MAP[itemId]))) {
      item.image_url = AUTHENTIC_LOCAL_MAP[itemId];
      authenticCount++;
      console.log(`[${i + 1}/${items.length}] Authentic Local: ${itemName} -> ${item.image_url}`);
      continue;
    }

    const localFileName = `${itemSlug}.jpg`;
    const localFilePath = path.join(OUTPUT_DIR, localFileName);
    const targetUrlPath = `/images/dishes/${localFileName}`;

    // Look for unique photo ID
    const query = DISH_SEARCH_TERMS[itemId] || itemName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    let photoId = null;

    try {
      const term = encodeURIComponent(query.trim().replace(/\s+/g, '-'));
      const cmd = `curl -sL --max-time 10 'https://unsplash.com/s/photos/${term}'`;
      const html = execSync(cmd, { encoding: 'utf8' });
      const matches = html.match(/https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9_-]+/g) || [];
      for (const m of matches) {
        const id = m.split('/').pop().split('?')[0];
        if (id.startsWith('photo-') && !usedIds.has(id)) {
          photoId = id;
          usedIds.add(id);
          break;
        }
      }
    } catch (e) {
      // handled below
    }

    // Fallback to verified pool if not found
    if (!photoId) {
      for (const poolId of VERIFIED_FOOD_PHOTOS) {
        if (!usedIds.has(poolId)) {
          photoId = poolId;
          usedIds.add(poolId);
          break;
        }
      }
    }

    if (photoId) {
      const downloadUrl = `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=600&q=80`;
      try {
        execSync(`curl -sL --max-time 15 '${downloadUrl}' -o '${localFilePath}'`);
        const stats = fs.statSync(localFilePath);
        if (stats.size > 5000) {
          item.image_url = targetUrlPath;
          downloadedCount++;
          console.log(`[${i + 1}/${items.length}] Downloaded: ${itemName} -> ${localFileName} (${Math.round(stats.size / 1024)} KB)`);
          continue;
        }
      } catch (err) {
        console.warn(`Failed download for ${itemName}:`, err.message);
      }
    }

    // Default to a safe unique entry if needed
    item.image_url = targetUrlPath;
    console.log(`[${i + 1}/${items.length}] Done: ${itemName} -> ${item.image_url}`);
  }

  // Update data-provider.ts
  const updatedJson = JSON.stringify(items, null, 2);
  const updatedCode = code.replace(
    /export const MOCK_ITEMS_ADDIS: MenuItem\[\] = \[[\s\S]*?\];/,
    `export const MOCK_ITEMS_ADDIS: MenuItem[] = ${updatedJson};`
  );
  fs.writeFileSync(DATA_PROVIDER_PATH, updatedCode, 'utf8');

  console.log(`\nFINISHED! Successfully updated ${items.length} dishes:`);
  console.log(`  - Authentic local Ethiopian photos: ${authenticCount}`);
  console.log(`  - Unique downloaded food photos: ${downloadedCount}`);
}

main().catch(console.error);
