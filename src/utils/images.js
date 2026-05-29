/**
 * central utility to map Oxygen Not Included IDs/names to in-game PNG asset paths.
 */

export function getImageUrl(id) {
  if (!id) return '/data/images/Creature.png'; // default fallback

  // 1. Clean XML-style link tags like <link="SWAMPFRUIT">Bog Jelly</link> or <link="DIRT">Dirt</link>
  let cleanId = String(id).replace(/<link="[^"]+">/gi, '').replace(/<\/link>/gi, '').trim();

  // 2. Strip standard punctuation and prepare matching key
  const key = cleanId.toLowerCase().replace(/[^a-z0-9]/g, '');

  // 3. Centralized manual mappings
  const mappings = {
    // Crops & Plants (Prefab matches)
    'mealwood': 'BasicSingleHarvestPlant',
    'basicsingleharvestplant': 'BasicSingleHarvestPlant',
    'bristleblossom': 'PrickleFlower',
    'prickleflower': 'PrickleFlower',
    'duskcap': 'MushroomPlant',
    'mushroomplant': 'MushroomPlant',
    'sleetwheat': 'ColdWheat',
    'coldwheat': 'ColdWheat',
    'thimblereed': 'BasicFabricPlant',
    'basicfabricplant': 'BasicFabricPlant',
    'arborwood': 'ForestTree',
    'foresttree': 'ForestTree',
    'oxyfern': 'Oxyfern',
    'pinchapepper': 'SpiceVine',
    'spicevine': 'SpiceVine',

    // Critters
    'hatch': 'Hatch',
    'hatchbaby': 'HatchBaby',
    'stonehatch': 'HatchHard',
    'hatchhard': 'HatchHard',
    'smoothhatch': 'HatchMetal',
    'hatchmetal': 'HatchMetal',
    'sagehatch': 'HatchVeggie',
    'hatchveggie': 'HatchVeggie',
    'drecko': 'Drecko',
    'dreckobaby': 'DreckoBaby',
    'glossydrecko': 'DreckoPlastic',
    'dreckoplastic': 'DreckoPlastic',
    'pip': 'Squirrel',
    'squirrel': 'Squirrel',
    'cuddlepip': 'SquirrelHug',
    'squirrelhug': 'SquirrelHug',
    'shinebug': 'LightBug',
    'lightbug': 'LightBug',
    'pacu': 'Pacu',
    'pacubaby': 'PacuBaby',
    'tropicalpacu': 'PacuTropical',
    'pacutropical': 'PacuTropical',
    'gulperpacu': 'PacuCleaner',
    'pacucleaner': 'PacuCleaner',

    // Foods & Cooking
    'meallice': 'BasicPlantFood',
    'basicplantfood': 'BasicPlantFood',
    'pickledmeal': 'PickledMeal',
    'bristleberry': 'PrickleFruit',
    'pricklefruit': 'PrickleFruit',
    'gristleberry': 'GrilledPrickleFruit',
    'grilledpricklefruit': 'GrilledPrickleFruit',
    'mushroom': 'Mushroom',
    'friedmushroom': 'FriedMushroom',
    'sleetwheatgrain': 'ColdWheat', // fall back to Sleet Wheat plant icon
    'coldwheatseed': 'ColdWheat',
    'frostbun': 'ColdWheatBread',
    'coldwheatbread': 'ColdWheatBread',
    'barbecue': 'CookedMeat',
    'cookedmeat': 'CookedMeat',
    'rawmeat': 'Meat',
    'meat': 'Meat',
    'cookedseafood': 'CookedFish',
    'cookedfish': 'CookedFish',
    'pacufillet': 'FishMeat',
    'fishmeat': 'FishMeat',
    'rawegg': 'RawEgg',
    'omelette': 'CookedEgg',
    'cookedegg': 'CookedEgg',
    'tofu': 'Tofu',
    'spicytofu': 'SpicyTofu',
    'pepperbread': 'SpiceBread',
    'spicebread': 'SpiceBread',
    'mushbar': 'MushBar',
    'mushfry': 'FriedMushBar',
    'friedmushbar': 'FriedMushBar',
    'liceloaf': 'BasicPlantBar',
    'berrysludge': 'BerryPie',
    'bogjelly': 'SwampFruit',
    'swampfruit': 'SwampFruit',
    'swampydelights': 'SwampDelights',
    'swampdelights': 'SwampDelights',
    'surfturf': 'SurfAndTurf',
    'surfandturf': 'SurfAndTurf',
    'noshbean': 'BeanPlant',
    'toepush': 'ToePlant',
    'lettuce': 'Lettuce',
    'waterweed': 'SeaLettuce',
    'grubfruitplant': 'SuperWormPlant',
    'sweetle': 'DivergentBeetle',
    'icebelly': 'IceBelly',
    'squid': 'Squid',
    'smokedfish': 'SmokedFish',
    'veggiepoppers': 'SmokedVegetables',
    'tenderbrisket': 'SmokedDinosaurMeat',
    'deepfriedfish': 'DeepFriedFish',
    'deepfriedmeat': 'DeepFriedMeat',
    'deepfriedshellfish': 'DeepFriedShellfish',
    'makisushi': 'Maki',
    'nigirisushi': 'Nigiri',
    'stuffedberry': 'Salsa',
    'mushroomwrap': 'MushroomWrap',
    'frostburger': 'Burger',
    'grubfruitpreserves': 'WormSuperFood',

    // Elements & Resources
    'dirt': 'Dirt',
    'water': 'Water',
    'slime': 'Slime',
    'algae': 'Algae',
    'phosphorite': 'Phosphorite',
    'sulfur': 'Sulfur',
    'coal': 'Coal',
    'pollutedwater': 'DirtyWater',
    'dirtywater': 'DirtyWater',
    'polluteddirt': 'ToxicSand',
    'toxicsand': 'ToxicSand',
    'arborwoodbranches': 'WoodLog',
    'woodlog': 'WoodLog',
    'stone': 'SandStone',
    'minerals': 'SandStone',
    'sandstone': 'SandStone',
    'copperore': 'Cuprite',
    'cuprite': 'Cuprite',
    'ironore': 'IronOre',
    'goldamalgam': 'GoldAmalgam',
    'reedfiber': 'BasicFabricPlant', // falls back to Reed plant image
    'oxygen': 'Oxygen',
    'carbondioxide': 'CarbonDioxide',
    'chlorine': 'Chlorine',
    'liquidoxygen': 'LiquidOxygen',
    'liquidhydrogen': 'LiquidHydrogen',
    'stone & soil': 'SandStone',
    'stonesoil': 'SandStone'
  };

  const mapped = mappings[key];
  if (mapped) {
    return `/data/images/${mapped}.png`;
  }

  // 4. Smart fallbacks: Capitalize each word and append .png
  // Remove link tags, symbols, and capitalize
  const capitalized = cleanId
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');

  return `/data/images/${capitalized}.png`;
}

/**
 * Format long or messy resource names into a clean, concise label.
 */
export function formatResourceName(name) {
  if (!name) return '';
  const clean = String(name).replace(/<link="[^"]+">/gi, '').replace(/<\/link>/gi, '').trim();
  
  // Clean Hatch diet lists specifically
  if (clean.includes('Sandstone') && clean.includes('Sedimentary') && clean.includes('Coquina')) {
    return 'Stone & Soil';
  }
  
  // General long lists
  if (clean.length > 25 && clean.includes(',')) {
    const parts = clean.split(',');
    return `${parts[0].trim()} & ${parts[1].trim()}...`;
  }
  
  return clean;
}
