import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout';
import { DuplicantStats } from './components/DuplicantStats';
import { RanchBoard } from './components/RanchBoard';
import { FarmBoard } from './components/FarmBoard';
import { DatabaseExplorer, cleanName } from './components/DatabaseExplorer';
import { FoodCalculator } from './components/FoodCalculator';
import { CRITTER_DATA } from './data/critters';
import { CROP_DATA } from './data/crops';

const STORAGE_KEY = 'oni-dashboard-state';

const DEFAULT_RANCHES = [];

const DEFAULT_CROPS = [];

const CRITTER_API_MAP = {
  hatch: 'Hatch',
  drecko: 'Drecko',
  shineBug: 'LightBug',
  pip: 'Squirrel',
  pacu: 'Pacu',
  sweetle: 'DivergentBeetle',
  iceBelly: 'IceBelly',
  squid: 'Squid'
};

const CROP_API_MAP = {
  mealwood: 'BasicSingleHarvestPlant',
  bristleBlossom: 'PrickleFlower',
  duskCap: 'MushroomPlant',
  sleetWheat: 'ColdWheat',
  thimbleReed: 'BasicFabricPlant',
  pinchaPepper: 'SpiceVine',
  waterweed: 'SeaLettuce',
  grubfruitPlant: 'SuperWormPlant'
};

function App() {
  const [activeTab, setActiveTab] = useState('tools');

  // API dynamic databank states
  const [apiCritters, setApiCritters] = useState([]);
  const [apiPlants, setApiPlants] = useState([]);
  const [apiFoods, setApiFoods] = useState([]);
  const [apiGeysers, setApiGeysers] = useState([]);
  const [apiEquipment, setApiEquipment] = useState([]);
  const [apiSpacePois, setApiSpacePois] = useState([]);
  const [apiElements, setApiElements] = useState([]);
  const [apiRecipes, setApiRecipes] = useState([]);
  const [apiBuildings, setApiBuildings] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Fetch all endpoints on load
  useEffect(() => {
    let active = true;
    const endpoints = [
      { name: 'critters', set: setApiCritters },
      { name: 'plants', set: setApiPlants },
      { name: 'foods', set: setApiFoods },
      { name: 'geysers', set: setApiGeysers },
      { name: 'equipment', set: setApiEquipment },
      { name: 'space_pois', set: setApiSpacePois },
      { name: 'elements', set: setApiElements },
      { name: 'recipes', set: setApiRecipes },
      { name: 'buildings', set: setApiBuildings }
    ];

    async function fetchAll() {
      try {
        setApiLoading(true);
        setApiError(null);
        await Promise.all(
          endpoints.map(async (endpoint) => {
            const res = await fetch(`/data/${endpoint.name}.json`);
            if (!res.ok) throw new Error(`Failed to load ${endpoint.name}.json`);
            const data = await res.json();
            if (active) {
              endpoint.set(data);
            }
          })
        );
      } catch (err) {
        if (active) {
          setApiError(err.message);
        }
      } finally {
        if (active) {
          setApiLoading(false);
        }
      }
    }

    fetchAll();
    return () => { active = false; };
  }, []);

  // Consolidate all loaded items to map IDs to their user-facing clean names
  const idToNameMap = useMemo(() => {
    const mapping = {};
    
    // Add default fallbacks for common tags that might not be in other files
    mapping['Minerals'] = 'Minerals';
    mapping['Stone'] = 'Stone';
    mapping['Metal'] = 'Metal';
    
    // Helper to recursively scan any data structure for <link="ID">Name</link> tags
    const scanForLinks = (obj) => {
      if (!obj) return;
      if (typeof obj === 'string') {
        const linkRegex = /<link="([^"]+)">([^<]+)<\/link>/gi;
        let match;
        while ((match = linkRegex.exec(obj)) !== null) {
          const id = match[1];
          const name = match[2];
          if (id && name) {
            const cleaned = cleanName(name);
            mapping[id] = cleaned;
            mapping[id.toLowerCase()] = cleaned;
          }
        }
      } else if (Array.isArray(obj)) {
        obj.forEach(scanForLinks);
      } else if (typeof obj === 'object') {
        Object.values(obj).forEach(scanForLinks);
      }
    };

    // Scan all loaded databanks including recipes
    const allLists = [apiCritters, apiPlants, apiFoods, apiGeysers, apiEquipment, apiSpacePois, apiElements, apiRecipes, apiBuildings];
    allLists.forEach(list => scanForLinks(list));

    // Merge direct item IDs from all API lists (priority to item.id if item.name exists)
    allLists.forEach(list => {
      if (Array.isArray(list)) {
        list.forEach(item => {
          if (item.id && item.name) {
            const cleaned = cleanName(item.name);
            mapping[item.id] = cleaned;
            mapping[item.id.toLowerCase()] = cleaned;
          }
        });
      }
    });

    // Provide explicit manual overrides for common food/recipe inputs to ensure accuracy
    const manualOverrides = {
      'coldwheatseed': 'Sleet Wheat Grain',
      'spicenut': 'Pincha Peppernut',
      'lettuce': 'Lettuce',
      'mushroom': 'Dusk Cap Mushroom',
      'meat': 'Raw Meat',
      'fishmeat': 'Pacu Fillet',
      'squidmeat': 'Calamari',
      'shellfishmeat': 'Raw Shellfish',
      'basicplantfood': 'Meal Lice',
      'mushbar': 'Mush Bar',
      'rawegg': 'Raw Egg',
      'fernfood': 'Nosh Bean',
      'sucrose': 'Sucrose',
      'wormbasicfruit': 'Spindle Grub Fruit',
      'wormsuperfruit': 'Grubfruit',
      'hardskinberry': 'Pikeapple',
      'butterflyplantseed': 'Blossom Seed',
      'gingerconfig': 'Tonic Root',
      'beanplantseed': 'Nosh Bean',
      'tofu': 'Tofu',
      'dinosaurmeat': 'Tough Meat',
      'dinosaurcarcass': 'Dinosaur Carcass',
      'katairite': 'Abyssalite',
      'milk': 'Brackene',
      'milkice': 'Frozen Brackene',
      'milkfat': 'Brackwax',
      'moltencarbon': 'Liquid Carbon',
      'moltenzinc': 'Liquid Zinc',
      'liquidphosphorus': 'Liquid Phosphorus',
      'moltenniobium': 'Liquid Niobium',
      'moltennickel': 'Liquid Nickel',
      'moltencopper': 'Liquid Copper',
      'moltentungsten': 'Liquid Tungsten',
      'moltensucrose': 'Liquid Sucrose',
      
      // Elements & Feedings
      'dewdrip': 'Nectar',
      'icebellypoop': 'Bammoth Patty',
      'fieldration': 'Muckroot',
      'basicforageplant': 'Muckroot',
      'forestforageplant': 'Hexalent Fruit',
      'swampforageplant': 'Swamp Chard',
      'icecavesforageplant': 'Sherberry',
      'prehistoricpacufillet': 'Jawbo Fillet',
      'deepfriedmeat': 'Deep Fried Steak',
      'gammamush': 'Gamma Mush',
      'musseltongue': 'Mussel Tongue',
      'rotpile': 'Rot Pile',
      'fishfood': 'Fish Food',
      'kelp': 'Nori',
      'kelpplant': 'Seakomb',
      'gardenforageplant': 'Snactus',
      
      // Seeds
      'flytrapplantseed': 'Lura Plant Seed',
      'dewpalmseed': 'Gum Palm Seed',
      'dewdripperplantseed': 'Dew Dripper Seed',
      'gardenfoodplantseed': 'Sweatcorn Seed',
      'hardskinberryplantseed': 'Pikeapple Seed',
      'bluegrassseed': 'Alveo Vera Seed',
      'gasgrassseed': 'Gas Grass Seed',
      'mushroomseed': 'Fungal Spore',
      'clamseed': 'Clampum Seed',
      'carrotplantseed': 'Plume Squash Seed',
      'basicsingleharvestplantseed': 'Mealwood Seed',
      'basicfabricmaterialplantseed': 'Thimble Reed Seed',
      'saltplantseed': 'Dasha Saltvine Seed',
      'swamplilyseed': 'Balm Lily Seed',
      'swampharvestplantseed': 'Bog Jelly Spore',
      'saltysticksplantseed': 'Sodicane Seed',
      'spicevineseed': 'Pincha Pepper Nut',
      'spacetreeseed': 'Bonbon Sprout',
      'sealettuceseed': 'Waterweed Seed',
      'prickleflowerseed': 'Blossom Seed',
      'urchinplantseed': 'Pinpoket Seed',
      'wormplantseed': 'Grubfruit Seed',
      'tubewormseed': 'Tublia Seed',
      'planktoncoralseed': 'Starnacle Seed',
      'planktoncoral': 'Starnacle'
    };

    Object.entries(manualOverrides).forEach(([id, name]) => {
      mapping[id] = name;
      mapping[id.toUpperCase()] = name;
    });
    
    return mapping;
  }, [apiCritters, apiPlants, apiFoods, apiGeysers, apiEquipment, apiSpacePois, apiElements, apiRecipes, apiBuildings]);

  // Merge dynamic API names into static data and build a dynamic catalog of all critters
  const mergedCritters = useMemo(() => {
    const data = {};
    
    // 1. Pre-populate with our base CRITTER_DATA as a robust fallback
    Object.keys(CRITTER_DATA).forEach(key => {
      data[key] = { ...CRITTER_DATA[key], isRanchable: true };
    });

    // 2. If apiCritters is loaded, dynamically merge or add them
    if (apiCritters.length > 0) {
      apiCritters.forEach(apiItem => {
        const coreKey = Object.keys(CRITTER_API_MAP).find(k => CRITTER_API_MAP[k] === apiItem.id);
        
        // Extract inputs/outputs dynamically from diet
        let inputs = [];
        let outputs = [];
        if (apiItem.diet && apiItem.diet.length > 0) {
          inputs = apiItem.diet.map(d => {
            const mappedTags = d.consumedTags 
              ? d.consumedTags.map(tag => idToNameMap[tag.toLowerCase()] || idToNameMap[tag] || cleanName(tag)).join(', ')
              : (idToNameMap[d.consumedTag?.toLowerCase()] || idToNameMap[d.consumedTag] || cleanName(d.consumedTag || 'Minerals'));
            return {
              name: mappedTags,
              amount: d.dailyConsumptionKg ?? 140,
              unit: 'kg'
            };
          });
          outputs = apiItem.diet.map(d => ({
            name: idToNameMap[d.producedElement?.toLowerCase()] || idToNameMap[d.producedElement] || cleanName(d.producedElement || 'Coal'),
            amount: d.dailyExcrementKg ?? 70,
            unit: 'kg'
          }));
        }

        if (coreKey) {
          // Merge stats and update name
          data[coreKey].name = cleanName(apiItem.name);
          data[coreKey].description = apiItem.description || data[coreKey].description;
          if (inputs.length > 0) data[coreKey].inputs = inputs;
          if (outputs.length > 0) data[coreKey].outputs = outputs;
          data[coreKey].isRanchable = apiItem.isRanchable !== undefined ? apiItem.isRanchable : true;
          
          if (apiItem.spaceRequired !== undefined && apiItem.spaceRequired !== null && apiItem.spaceRequired > 0) {
            data[coreKey].spaceRequired = apiItem.spaceRequired;
            if (!coreKey.toLowerCase().includes('pacu') && !coreKey.toLowerCase().includes('fish')) {
              data[coreKey].maxSize = Math.floor(96 / apiItem.spaceRequired);
            }
          }
        } else {
          // Add brand new critter dynamically
          const cleanedName = cleanName(apiItem.name);
          const cleanedId = apiItem.id;
          
          const lowerId = cleanedId.toLowerCase();
          const lowerName = cleanedName.toLowerCase();
          
          let spaceRequired = 12;
          if (apiItem.spaceRequired !== undefined && apiItem.spaceRequired !== null && apiItem.spaceRequired > 0) {
            spaceRequired = apiItem.spaceRequired;
          } else {
            // Fallback logic
            if (lowerId.includes('pacu') || lowerId.includes('fish') || lowerName.includes('pacu') || lowerName.includes('fish')) {
              spaceRequired = 8;
            } else if (
              lowerId.includes('belly') || lowerName.includes('bammoth') ||
              lowerId.includes('worm') || lowerName.includes('grub') ||
              lowerId.includes('moo') || lowerName.includes('moo') ||
              lowerId.includes('seal') || lowerName.includes('seal')
            ) {
              spaceRequired = 16;
            }
          }

          let maxSize = 8;
          const isPacuOrFish = (lowerId.includes('pacu') || lowerId.includes('fish') || lowerName.includes('pacu') || lowerName.includes('fish')) 
            && !lowerId.includes('puffer') && !lowerName.includes('blowter');
          if (isPacuOrFish) {
            maxSize = 8;
          } else {
            maxSize = Math.floor(96 / spaceRequired);
          }
          
          data[cleanedId] = {
            id: cleanedId,
            name: cleanedName,
            description: apiItem.description || 'Synced from in-game DataDump.',
            maxSize: maxSize,
            caloriesPerCycle: apiItem.caloriesPerCycle ?? 0,
            spaceRequired: spaceRequired,
            eggsPerCycle: apiItem.eggsPerCycle ?? 0.12,
            inputs: inputs.length > 0 ? inputs : [{ name: 'Minerals', amount: 140, unit: 'kg' }],
            outputs: outputs,
            isRanchable: apiItem.isRanchable !== undefined ? apiItem.isRanchable : true,
            color: '#7FBFFF' // blueprint pastel blue
          };
        }
      });
    }
    return data;
  }, [apiCritters, idToNameMap]);

  // Merge dynamic API names into static data and build a dynamic catalog of all crops
  const mergedCrops = useMemo(() => {
    const data = {};
    
    // 1. Pre-populate with our base CROP_DATA
    Object.keys(CROP_DATA).forEach(key => {
      data[key] = { ...CROP_DATA[key], isFarmable: true };
    });

    if (apiPlants.length > 0) {
      apiPlants.forEach(apiItem => {
        const coreKey = Object.keys(CROP_API_MAP).find(k => CROP_API_MAP[k] === apiItem.id);
        
        // Calculate dynamic calorie density if yield exists
        let calPerCycle = 0;
        if (apiItem.yield) {
          const yieldFoodId = apiItem.yield.itemId || apiItem.yield.id;
          const foodMatch = apiFoods.find(f => f.id === yieldFoodId);
          if (foodMatch && foodMatch.caloriesPerUnit) {
            const yieldKcal = foodMatch.caloriesPerUnit / 1000;
            const growth = apiItem.growthCycles ?? 3;
            const amount = apiItem.yield.amount ?? 1;
            calPerCycle = (amount * yieldKcal) / growth;
          }
        }

        // Parse dynamic fertilizer/irrigation requirements
        let inputs = [];
        if (apiItem.fertilizerRequirements) {
          apiItem.fertilizerRequirements.forEach(f => {
            inputs.push({
              name: idToNameMap[f.tag?.toLowerCase()] || idToNameMap[f.tag] || cleanName(f.tag),
              amount: f.kgPerCycle ?? (f.massConsumptionRateKgPerSec * 600),
              unit: 'kg'
            });
          });
        }
        if (apiItem.irrigationRequirements) {
          apiItem.irrigationRequirements.forEach(i => {
            inputs.push({
              name: idToNameMap[i.tag?.toLowerCase()] || idToNameMap[i.tag] || cleanName(i.tag),
              amount: i.kgPerCycle ?? (i.massConsumptionRateKgPerSec * 600),
              unit: 'kg'
            });
          });
        }

        if (coreKey) {
          data[coreKey].name = cleanName(apiItem.name);
          data[coreKey].description = apiItem.description || data[coreKey].description;
          if (inputs.length > 0) data[coreKey].inputs = inputs;
          if (calPerCycle > 0) data[coreKey].caloriesPerCycle = calPerCycle;
          data[coreKey].isFarmable = apiItem.isFarmable !== undefined ? apiItem.isFarmable : true;
          if (apiItem.acceptedPlanters) {
            data[coreKey].acceptedPlanters = apiItem.acceptedPlanters;
          }
        } else {
          // Create new dynamic crop
          const cleanedName = cleanName(apiItem.name);
          const cleanedId = apiItem.id;
          
          data[cleanedId] = {
            id: cleanedId,
            name: cleanedName,
            description: apiItem.description || 'Synced from in-game DataDump.',
            caloriesPerCycle: calPerCycle,
            inputs: inputs.length > 0 ? inputs : [{ name: 'Water', amount: 20, unit: 'kg' }],
            outputs: apiItem.yield ? [{ name: idToNameMap[(apiItem.yield.itemId || apiItem.yield.id)?.toLowerCase()] || idToNameMap[apiItem.yield.itemId || apiItem.yield.id] || cleanName(apiItem.yield.itemId || apiItem.yield.id), amount: apiItem.yield.amount, unit: 'unit' }] : [],
            isFarmable: apiItem.isFarmable !== undefined ? apiItem.isFarmable : true,
            acceptedPlanters: apiItem.acceptedPlanters || [],
            color: '#A8FF8C' // blueprint green
          };
        }
      });
    }
    return data;
  }, [apiPlants, apiFoods, idToNameMap]);

  // Initialize state from LocalStorage or defaults
  const [duplicants, setDuplicants] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.duplicants === 'number') {
          return parsed.duplicants;
        }
      } catch (e) {}
    }
    return 3;
  });

  const [growthMode, setGrowthMode] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.growthMode) return parsed.growthMode;
      } catch (e) {}
    }
    return 'domesticated';
  });

  const [caloriePreset, setCaloriePreset] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.caloriePreset) return parsed.caloriePreset;
      } catch (e) {}
    }
    return '1000';
  });

  const [customCalorieInput, setCustomCalorieInput] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.customCalorieInput !== undefined) return parsed.customCalorieInput;
      } catch (e) {}
    }
    return 1000;
  });

  const [o2Preset, setO2Preset] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.o2Preset) return parsed.o2Preset;
      } catch (e) {}
    }
    return '60';
  });

  const [customO2Input, setCustomO2Input] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.customO2Input !== undefined) return parsed.customO2Input;
      } catch (e) {}
    }
    return 60;
  });

  const [ranches, setRanches] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved).ranches;
        if (Array.isArray(parsed) && parsed.every(item => item.critterType)) {
          return parsed;
        }
      } catch (e) {}
    }
    return DEFAULT_RANCHES;
  });

  const [crops, setCrops] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved).crops;
        if (Array.isArray(parsed) && parsed.every(item => item.cropType)) {
          return parsed.map(c => {
            const mode = c.growthMode === 'farmerTouch' ? 'domesticated' : (c.growthMode || 'domesticated');
            const ft = c.farmerTouch || c.growthMode === 'farmerTouch' || false;
            
            // Resolve default planterType if missing
            let pType = c.planterType;
            if (!pType) {
              const lowerId = c.cropType?.toLowerCase() || '';
              if (lowerId.includes('dewpalm') || lowerId === 'clam') {
                pType = 'WideFarmTile';
              } else if (lowerId.includes('planktoncoral') || lowerId.includes('urchinplant')) {
                pType = 'LargeBackwallFarm';
              } else {
                pType = 'HydroponicFarm';
              }
            }

            return {
              roomSize: 96,
              growthMode: mode,
              farmerTouch: ft,
              id: c.id || `${c.cropType}_${mode}`,
              planterType: pType,
              ...c
            };
          });
        }
      } catch (e) {}
    }
    return DEFAULT_CROPS;
  });

  const [addedToDiet, setAddedToDiet] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.addedToDiet) return parsed.addedToDiet;
      } catch (e) {}
    }
    // Default fallback bootstrapping
    const initial = {
      mealwood: false,
      bristleBlossom: false,
      gristleBerry: false,
      duskCap: false,
      friedMushroom: false,
      sleetWheat: false,
      frostBun: false,
      barbecue: false,
      pacuSeafood: false,
      mushBar: false,
      mushFry: false,
      liceLoaf: false,
      berrySludge: false,
      surfAndTurf: false,
      pickledMeal: false,
      omelette: false,
      pepperBread: false,
      stuffedBerry: false,
      mushroomWrap: false,
      frostBurger: false,
      grubfruitPreserves: false,
      smokedFish: false,
      veggiePoppers: false,
      tenderBrisket: false,
      deepFriedFish: false,
      deepFriedMeat: false,
      deepFriedShellfish: false,
      makiSushi: false,
      nigiriSushi: false
    };
    const savedState = localStorage.getItem(STORAGE_KEY);
    let parsedCrops = [];
    let parsedRanches = [];
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        parsedCrops = parsed.crops || [];
        parsedRanches = parsed.ranches || [];
      } catch (e) {}
    }
    const hasColonyActivity = parsedCrops.some(c => c.count > 0) || parsedRanches.some(r => r.count > 0);
    if (hasColonyActivity) {
      initial.mealwood = parsedCrops.some(c => c.cropType === 'mealwood' && c.count > 0);
      initial.gristleBerry = parsedCrops.some(c => c.cropType === 'bristleBlossom' && c.count > 0);
      initial.barbecue = parsedRanches.some(r => r.critterType === 'hatch' && r.count > 0);
      initial.pacuSeafood = parsedRanches.some(r => r.critterType === 'pacu' && r.count > 0);
      initial.duskCap = parsedCrops.some(c => c.cropType === 'duskCap' && c.count > 0);
      initial.sleetWheat = parsedCrops.some(c => c.cropType === 'sleetWheat' && c.count > 0);
    }
    return initial;
  });

  const [mixPercentages, setMixPercentages] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.mixPercentages) return parsed.mixPercentages;
      } catch (e) {}
    }
    const savedState = localStorage.getItem(STORAGE_KEY);
    let parsedCrops = [];
    let parsedRanches = [];
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        parsedCrops = parsed.crops || [];
        parsedRanches = parsed.ranches || [];
      } catch (e) {}
    }
    const hasColonyActivity = parsedCrops.some(c => c.count > 0) || parsedRanches.some(r => r.count > 0);
    if (hasColonyActivity) {
      return {
        mealwood: parsedCrops.some(c => c.cropType === 'mealwood' && c.count > 0) ? 30 : 0,
        bristleBlossom: 0,
        gristleBerry: parsedCrops.some(c => c.cropType === 'bristleBlossom' && c.count > 0) ? 20 : 0,
        duskCap: 0,
        friedMushroom: 0,
        sleetWheat: 0,
        frostBun: 0,
        barbecue: parsedRanches.some(r => r.critterType === 'hatch' && r.count > 0) ? 50 : 0,
        pacuSeafood: 0,
        mushBar: 0,
        mushFry: 0,
        liceLoaf: 0,
        berrySludge: 0,
        surfAndTurf: 0,
        pickledMeal: 0,
        omelette: 0,
        pepperBread: 0,
        stuffedBerry: 0,
        mushroomWrap: 0,
        frostBurger: 0,
        grubfruitPreserves: 0,
        smokedFish: 0,
        veggiePoppers: 0,
        tenderBrisket: 0,
        deepFriedFish: 0,
        deepFriedMeat: 0,
        deepFriedShellfish: 0,
        makiSushi: 0,
        nigiriSushi: 0
      };
    }
    return {
      mealwood: 0,
      bristleBlossom: 0,
      gristleBerry: 0,
      duskCap: 0,
      friedMushroom: 0,
      sleetWheat: 0,
      frostBun: 0,
      barbecue: 0,
      pacuSeafood: 0,
      mushBar: 0,
      mushFry: 0,
      liceLoaf: 0,
      berrySludge: 0,
      surfAndTurf: 0,
      pickledMeal: 0,
      omelette: 0,
      pepperBread: 0,
      stuffedBerry: 0,
      mushroomWrap: 0,
      frostBurger: 0,
      grubfruitPreserves: 0,
      smokedFish: 0,
      veggiePoppers: 0,
      tenderBrisket: 0,
      deepFriedFish: 0,
      deepFriedMeat: 0,
      deepFriedShellfish: 0,
      makiSushi: 0,
      nigiriSushi: 0
    };
  });

  const [lockedPercentages, setLockedPercentages] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.lockedPercentages) return parsed.lockedPercentages;
      } catch (e) {}
    }
    return {};
  });

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
      duplicants, 
      ranches, 
      crops, 
      growthMode, 
      caloriePreset, 
      customCalorieInput,
      o2Preset,
      customO2Input,
      addedToDiet,
      mixPercentages,
      lockedPercentages
    }));
  }, [duplicants, ranches, crops, growthMode, caloriePreset, customCalorieInput, o2Preset, customO2Input, addedToDiet, mixPercentages, lockedPercentages]);

  const [liveSync, setLiveSync] = useState(() => {
    return localStorage.getItem('oni-dashboard-livesync') === 'true';
  });

  const [wsStatus, setWsStatus] = useState('Disconnected');
  const [liveData, setLiveData] = useState(null);

  useEffect(() => {
    localStorage.setItem('oni-dashboard-livesync', liveSync);
  }, [liveSync]);

  useEffect(() => {
    if (!liveSync) {
      setWsStatus('Disconnected');
      setLiveData(null);
      return;
    }

    let socket = null;
    let reconnectTimeout = null;
    let isComponentMounted = true;

    function connect() {
      if (!isComponentMounted) return;
      setWsStatus('Connecting');
      socket = new WebSocket('ws://localhost:8080');

      socket.onopen = () => {
        if (!isComponentMounted) return;
        setWsStatus('Connected');
      };

      socket.onmessage = (event) => {
        if (!isComponentMounted) return;
        try {
          const data = JSON.parse(event.data);
          setLiveData(data);
        } catch (e) {
          console.error("Failed to parse WebSocket message:", e);
        }
      };

      socket.onclose = () => {
        if (!isComponentMounted) return;
        setWsStatus('Connecting');
        reconnectTimeout = setTimeout(connect, 5000);
      };

      socket.onerror = () => {
        if (!isComponentMounted) return;
        socket.close();
      };
    }

    connect();

    return () => {
      isComponentMounted = false;
      if (socket) {
        socket.onopen = null;
        socket.onmessage = null;
        socket.onclose = null;
        socket.onerror = null;
        socket.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [liveSync]);

  const isLiveConnected = liveSync && wsStatus === 'Connected';

  const liveCritterRanches = useMemo(() => {
    if (!isLiveConnected || !liveData || !Array.isArray(liveData.critters)) return null;
    const mapped = [];
    const getCritterKey = (apiId) => {
      if (!apiId) return '';
      const match = Object.keys(CRITTER_API_MAP).find(key => CRITTER_API_MAP[key].toLowerCase() === String(apiId).toLowerCase());
      return match || apiId;
    };

    liveData.critters.forEach(apiItem => {
      if (!apiItem || typeof apiItem !== 'object') return;
      const critterType = getCritterKey(apiItem.id);
      if (!critterType) return;
      const activeFeed = apiItem.activeFeed
        ? (idToNameMap[String(apiItem.activeFeed).toLowerCase()] || idToNameMap[String(apiItem.activeFeed)] || cleanName(String(apiItem.activeFeed)))
        : '';

      const wildCount = Number(apiItem.wildCount) || 0;
      const domesticHappyCount = Number(apiItem.domesticHappyCount) || 0;
      const domesticGlumCount = Number(apiItem.domesticGlumCount) || 0;

      if (wildCount > 0) {
        mapped.push({
          id: `${critterType}_wild`,
          critterType,
          count: wildCount,
          ranchState: 'wild',
          activeFeed
        });
      }
      if (domesticHappyCount > 0) {
        mapped.push({
          id: `${critterType}_happy`,
          critterType,
          count: domesticHappyCount,
          ranchState: 'happy',
          activeFeed
        });
      }
      if (domesticGlumCount > 0) {
        mapped.push({
          id: `${critterType}_glum`,
          critterType,
          count: domesticGlumCount,
          ranchState: 'glum',
          activeFeed
        });
      }
    });
    return mapped;
  }, [isLiveConnected, liveData, idToNameMap]);

  const liveFarmCrops = useMemo(() => {
    if (!isLiveConnected || !liveData || !Array.isArray(liveData.crops)) return null;
    const mapped = [];
    const getCropKey = (apiId) => {
      if (!apiId) return '';
      const match = Object.keys(CROP_API_MAP).find(key => CROP_API_MAP[key].toLowerCase() === String(apiId).toLowerCase());
      return match || apiId;
    };

    liveData.crops.forEach(apiItem => {
      if (!apiItem || typeof apiItem !== 'object') return;
      const cropType = getCropKey(apiItem.id);
      if (!cropType) return;
      let planterType = 'HydroponicFarm';
      if (apiItem.planterTypes && typeof apiItem.planterTypes === 'object' && apiItem.planterTypes !== null && !Array.isArray(apiItem.planterTypes)) {
        const keys = Object.keys(apiItem.planterTypes);
        if (keys.length > 0) {
          planterType = keys.reduce((a, b) => apiItem.planterTypes[a] > apiItem.planterTypes[b] ? a : b);
        }
      }

      const wildCount = Number(apiItem.wildCount) || 0;
      const touchCount = Number(apiItem.farmersTouchCount) || 0;
      const domCount = Number(apiItem.domesticatedCount) || 0;

      if (wildCount > 0) {
        mapped.push({
          id: `${cropType}_wild`,
          cropType,
          count: wildCount,
          roomSize: 96,
          growthMode: 'wild',
          farmerTouch: false,
          planterType
        });
      }
      
      if (touchCount > 0) {
        mapped.push({
          id: `${cropType}_domesticated_boosted`,
          cropType,
          count: touchCount,
          roomSize: 96,
          growthMode: 'domesticated',
          farmerTouch: true,
          planterType
        });
      }
      
      if (domCount - touchCount > 0) {
        mapped.push({
          id: `${cropType}_domesticated`,
          cropType,
          count: domCount - touchCount,
          roomSize: 96,
          growthMode: 'domesticated',
          farmerTouch: false,
          planterType
        });
      }
    });
    return mapped;
  }, [isLiveConnected, liveData]);

  const activeDuplicants = isLiveConnected
    ? (typeof liveData?.duplicants === 'number'
        ? liveData.duplicants
        : (Number(liveData?.duplicants?.count) || duplicants))
    : duplicants;
  const activeRanches = isLiveConnected ? (liveCritterRanches ?? ranches) : ranches;
  const activeCrops = isLiveConnected ? (liveFarmCrops ?? crops) : crops;

  const handleRanchCountChange = (critterType, newCount) => {
    const r = ranches.find(x => x.critterType === critterType);
    if (!r) return;
    const critter = mergedCritters[critterType];
    const maxAllowed = r.ranchState === 'wild' ? Infinity : (critter?.maxSize || 8);
    const maxCritters = maxAllowed === Infinity ? 40 : 5 * maxAllowed;
    const clampedCount = Math.min(newCount, maxCritters);
    setRanches(ranches.map(item => item.critterType === critterType ? { ...item, count: clampedCount } : item));
  };

  const handleRanchFeedChange = (critterType, newFeed) => {
    setRanches(ranches.map(r => r.critterType === critterType ? { ...r, activeFeed: newFeed } : r));
  };

  const handleRanchStateChange = (critterType, newState) => {
    setRanches(ranches.map(r => {
      if (r.critterType === critterType) {
        const critter = mergedCritters[critterType];
        const maxAllowed = newState === 'wild' ? Infinity : (critter?.maxSize || 8);
        const maxCritters = maxAllowed === Infinity ? 40 : 5 * maxAllowed;
        const clampedCount = Math.min(r.count, maxCritters);
        return { ...r, count: clampedCount, ranchState: newState };
      }
      return r;
    }));
  };

  const handleCropCountChange = (cropId, newCount) => {
    setCrops(crops.map(c => c.id === cropId ? { ...c, count: newCount } : c));
  };

  const handleCropRoomSizeChange = (cropId, newRoomSize) => {
    setCrops(crops.map(c => c.id === cropId ? { ...c, roomSize: newRoomSize } : c));
  };

  const handleCropModeChange = (cropId, newMode) => {
    setCrops(crops.map(c => {
      if (c.id === cropId) {
        const nextId = `${c.cropType}_${newMode}`;
        if (crops.some(other => other.id === nextId && other.id !== cropId)) {
          alert(`A card for this crop in ${newMode} mode already exists.`);
          return c;
        }
        // If switching to wild, make sure farmerTouch is unchecked since wild cannot use it
        const ft = newMode === 'wild' ? false : c.farmerTouch;
        return { ...c, id: nextId, growthMode: newMode, farmerTouch: ft };
      }
      return c;
    }));
  };

  const handleCropFarmerTouchChange = (cropId, checked) => {
    setCrops(crops.map(c => c.id === cropId ? { ...c, farmerTouch: checked } : c));
  };

  const handleCropPlanterChange = (cropId, newPlanter) => {
    setCrops(crops.map(c => c.id === cropId ? { ...c, planterType: newPlanter } : c));
  };

  const handleRanchAdd = (critterType) => {
    if (!ranches.some(r => r.critterType === critterType)) {
      setRanches([...ranches, { critterType, count: 0, ranchState: 'happy' }]);
    }
  };

  const handleRanchRemove = (critterType) => {
    setRanches(ranches.filter(r => r.critterType !== critterType));
  };

  const handleCropAdd = (cropType, mode = 'domesticated') => {
    const uniqueId = `${cropType}_${mode}`;
    if (!crops.some(c => c.id === uniqueId)) {
      const cropData = mergedCrops[cropType];
      const planters = cropData?.acceptedPlanters || [];
      let defaultPlanter = 'HydroponicFarm';
      if (planters.includes('WideFarmTile')) {
        defaultPlanter = 'WideFarmTile';
      } else if (planters.includes('LargeBackwallFarm')) {
        defaultPlanter = 'LargeBackwallFarm';
      }
      setCrops([...crops, { 
        id: uniqueId, 
        cropType, 
        count: 0, 
        roomSize: 96, 
        growthMode: mode, 
        farmerTouch: false,
        planterType: defaultPlanter 
      }]);
    }
  };

  const handleCropRemove = (cropId) => {
    setCrops(crops.filter(c => c.id !== cropId));
  };

  const clearAll = () => {
    if (confirm('Are you sure you want to reset all colony data?')) {
      setDuplicants(3);
      setRanches(DEFAULT_RANCHES);
      setCrops(DEFAULT_CROPS);
      
      const defaultDiet = {
        mealwood: false,
        bristleBlossom: false,
        gristleBerry: false,
        duskCap: false,
        friedMushroom: false,
        sleetWheat: false,
        frostBun: false,
        barbecue: false,
        pacuSeafood: false,
        mushBar: false,
        mushFry: false,
        liceLoaf: false,
        berrySludge: false,
        surfAndTurf: false,
        pickledMeal: false,
        omelette: false,
        pepperBread: false,
        stuffedBerry: false,
        mushroomWrap: false,
        frostBurger: false,
        grubfruitPreserves: false,
        smokedFish: false,
        veggiePoppers: false,
        tenderBrisket: false,
        deepFriedFish: false,
        deepFriedMeat: false,
        deepFriedShellfish: false,
        makiSushi: false,
        nigiriSushi: false
      };
      setAddedToDiet(defaultDiet);
      
      const defaultMix = {};
      Object.keys(defaultDiet).forEach(k => {
        defaultMix[k] = 0;
      });
      setMixPercentages(defaultMix);
      
      setGrowthMode('domesticated');
      setCaloriePreset('1000');
      setCustomCalorieInput(1000);
      setO2Preset('60');
      setCustomO2Input(60);
      setLockedPercentages({});
      
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Calculate total calories generated across both ranches and crops
  const totalCalories = useMemo(() => {
    const ranchCals = activeRanches.reduce((total, ranch) => {
      const critter = mergedCritters[ranch.critterType];
      if (!critter) return total;
      
      let calMult = 1.0;
      if (ranch.ranchState === 'glum') calMult = 0.1;
      else if (ranch.ranchState === 'wild') calMult = 0.06;
      
      return total + (critter.caloriesPerCycle * ranch.count * calMult);
    }, 0);

    const cropCals = activeCrops.reduce((total, cropItem) => {
      const crop = mergedCrops[cropItem.cropType];
      if (!crop) return total;
      const plantMult = cropItem.growthMode === 'wild' ? 0.25 : (cropItem.farmerTouch ? 2.0 : 1.0);
      return total + (crop.caloriesPerCycle * cropItem.count * plantMult);
    }, 0);

    return ranchCals + cropCals;
  }, [activeRanches, activeCrops, mergedCritters, mergedCrops]);

  return (
    <Layout 
      onClearAll={clearAll}
      liveSync={liveSync}
      setLiveSync={setLiveSync}
      wsStatus={wsStatus}
    >
      <div className="main-grid">
        <aside>
          <DuplicantStats 
            duplicants={activeDuplicants} 
            setDuplicants={setDuplicants} 
            growthMode={growthMode}
            setGrowthMode={setGrowthMode}
            caloriePreset={caloriePreset}
            setCaloriePreset={setCaloriePreset}
            customCalorieInput={customCalorieInput}
            setCustomCalorieInput={setCustomCalorieInput}
            o2Preset={o2Preset}
            setO2Preset={setO2Preset}
            customO2Input={customO2Input}
            setCustomO2Input={setCustomO2Input}
            totalCalories={totalCalories}
            ranches={activeRanches}
            crops={activeCrops}
            critterData={mergedCritters}
            cropData={mergedCrops}
            isLiveConnected={isLiveConnected}
            liveData={liveData}
          />
        </aside>
        <section>
          {/* Blueprint Navigation Tabs */}
          <div className="tabs-container">
            <button 
              className={`tab-btn ${activeTab === 'tools' ? 'active' : ''}`}
              onClick={() => setActiveTab('tools')}
            >
              Food Calculator
            </button>
            <button 
              className={`tab-btn ${activeTab === 'ranches' ? 'active' : ''}`}
              onClick={() => setActiveTab('ranches')}
            >
              Ranches
            </button>
            <button 
              className={`tab-btn ${activeTab === 'farms' ? 'active' : ''}`}
              onClick={() => setActiveTab('farms')}
            >
              Farms
            </button>
            <button 
              className={`tab-btn ${activeTab === 'database' ? 'active' : ''}`}
              onClick={() => setActiveTab('database')}
            >
              Database
            </button>
          </div>

          {activeTab === 'ranches' ? (
            <RanchBoard 
              ranches={activeRanches}
              onRanchCountChange={handleRanchCountChange}
              onRanchAdd={handleRanchAdd}
              onRanchRemove={handleRanchRemove}
              onRanchFeedChange={handleRanchFeedChange}
              onRanchStateChange={handleRanchStateChange}
              critterData={mergedCritters}
              isLiveConnected={isLiveConnected}
            />
          ) : activeTab === 'farms' ? (
            <FarmBoard 
              crops={activeCrops}
              onCropCountChange={handleCropCountChange}
              onCropRoomSizeChange={handleCropRoomSizeChange}
              onCropAdd={handleCropAdd}
              onCropRemove={handleCropRemove}
              cropData={mergedCrops}
              growthMode={growthMode}
              onCropModeChange={handleCropModeChange}
              onCropFarmerTouchChange={handleCropFarmerTouchChange}
              onCropPlanterChange={handleCropPlanterChange}
              isLiveConnected={isLiveConnected}
            />
          ) : activeTab === 'tools' ? (
            <FoodCalculator 
              duplicants={activeDuplicants}
              setDuplicants={setDuplicants}
              growthMode={growthMode}
              setGrowthMode={setGrowthMode}
              caloriePreset={caloriePreset}
              setCaloriePreset={setCaloriePreset}
              customCalorieInput={customCalorieInput}
              setCustomCalorieInput={setCustomCalorieInput}
              cropData={mergedCrops}
              critterData={mergedCritters}
              crops={activeCrops}
              setCrops={setCrops}
              ranches={activeRanches}
              setRanches={setRanches}
              addedToDiet={addedToDiet}
              setAddedToDiet={setAddedToDiet}
              mixPercentages={mixPercentages}
              setMixPercentages={setMixPercentages}
              lockedPercentages={lockedPercentages}
              setLockedPercentages={setLockedPercentages}
              isLiveConnected={isLiveConnected}
            />
          ) : (
            <DatabaseExplorer 
              foods={apiFoods}
              geysers={apiGeysers}
              equipment={apiEquipment}
              spacePois={apiSpacePois}
              critters={apiCritters}
              plants={apiPlants}
              elements={apiElements}
              recipes={apiRecipes}
              buildings={apiBuildings}
              idToNameMap={idToNameMap}
              loading={apiLoading}
              error={apiError}
            />
          )}
        </section>
      </div>
    </Layout>
  );
}

export default App;
