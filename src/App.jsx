import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout';
import { DuplicantStats } from './components/DuplicantStats';
import { RanchBoard } from './components/RanchBoard';
import { FarmBoard } from './components/FarmBoard';
import { DatabaseExplorer, cleanName } from './components/DatabaseExplorer';
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
  pacu: 'Pacu'
};

const CROP_API_MAP = {
  mealwood: 'BasicSingleHarvestPlant',
  bristleBlossom: 'PrickleFlower',
  duskCap: 'MushroomPlant',
  sleetWheat: 'ColdWheat',
  thimbleReed: 'BasicFabricPlant'
};

function App() {
  const [activeTab, setActiveTab] = useState('ranches');

  // API dynamic databank states
  const [apiCritters, setApiCritters] = useState([]);
  const [apiPlants, setApiPlants] = useState([]);
  const [apiFoods, setApiFoods] = useState([]);
  const [apiGeysers, setApiGeysers] = useState([]);
  const [apiEquipment, setApiEquipment] = useState([]);
  const [apiSpacePois, setApiSpacePois] = useState([]);
  const [apiElements, setApiElements] = useState([]);
  const [apiRecipes, setApiRecipes] = useState([]);
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
      { name: 'recipes', set: setApiRecipes }
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
    const allLists = [apiCritters, apiPlants, apiFoods, apiGeysers, apiEquipment, apiSpacePois, apiElements, apiRecipes];
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
      'tofu': 'Tofu'
    };

    Object.entries(manualOverrides).forEach(([id, name]) => {
      mapping[id] = name;
      mapping[id.toUpperCase()] = name;
    });
    
    return mapping;
  }, [apiCritters, apiPlants, apiFoods, apiGeysers, apiEquipment, apiSpacePois, apiElements, apiRecipes]);

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
              ? d.consumedTags.map(tag => idToNameMap[tag] || cleanName(tag)).join(', ')
              : (idToNameMap[d.consumedTag] || cleanName(d.consumedTag || 'Minerals'));
            return {
              name: mappedTags,
              amount: d.dailyConsumptionKg ?? 140,
              unit: 'kg'
            };
          });
          outputs = apiItem.diet.map(d => ({
            name: idToNameMap[d.producedElement] || cleanName(d.producedElement || 'Coal'),
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
        } else {
          // Add brand new critter dynamically
          const cleanedName = cleanName(apiItem.name);
          const cleanedId = apiItem.id;
          
          data[cleanedId] = {
            id: cleanedId,
            name: cleanedName,
            description: apiItem.description || 'Synced from in-game DataDump.',
            maxSize: 8,
            caloriesPerCycle: apiItem.caloriesPerCycle ?? 0,
            spaceRequired: apiItem.spaceRequired ?? 12,
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
          const yieldFoodId = apiItem.yield.id;
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
              name: idToNameMap[f.tag] || cleanName(f.tag),
              amount: f.kgPerCycle ?? (f.massConsumptionRateKgPerSec * 600),
              unit: 'kg'
            });
          });
        }
        if (apiItem.irrigationRequirements) {
          apiItem.irrigationRequirements.forEach(i => {
            inputs.push({
              name: idToNameMap[i.tag] || cleanName(i.tag),
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
            outputs: apiItem.yield ? [{ name: idToNameMap[apiItem.yield.id] || cleanName(apiItem.yield.id), amount: apiItem.yield.amount, unit: 'unit' }] : [],
            isFarmable: apiItem.isFarmable !== undefined ? apiItem.isFarmable : true,
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
    if (saved) return JSON.parse(saved).duplicants;
    return 3;
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
          return parsed.map(c => ({ roomSize: 96, ...c }));
        }
      } catch (e) {}
    }
    return DEFAULT_CROPS;
  });

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ duplicants, ranches, crops }));
  }, [duplicants, ranches, crops]);

  const handleRanchCountChange = (critterType, newCount) => {
    setRanches(ranches.map(r => r.critterType === critterType ? { ...r, count: newCount } : r));
  };

  const handleCropCountChange = (cropType, newCount) => {
    setCrops(crops.map(c => c.cropType === cropType ? { ...c, count: newCount } : c));
  };

  const handleCropRoomSizeChange = (cropType, newRoomSize) => {
    setCrops(crops.map(c => c.cropType === cropType ? { ...c, roomSize: newRoomSize } : c));
  };

  const handleRanchAdd = (critterType) => {
    if (!ranches.some(r => r.critterType === critterType)) {
      setRanches([...ranches, { critterType, count: 0 }]);
    }
  };

  const handleRanchRemove = (critterType) => {
    setRanches(ranches.filter(r => r.critterType !== critterType));
  };

  const handleCropAdd = (cropType) => {
    if (!crops.some(c => c.cropType === cropType)) {
      setCrops([...crops, { cropType, count: 0, roomSize: 96 }]);
    }
  };

  const handleCropRemove = (cropType) => {
    setCrops(crops.filter(c => c.cropType !== cropType));
  };

  const clearAll = () => {
    if (confirm('Are you sure you want to reset all colony data?')) {
      setDuplicants(3);
      setRanches(DEFAULT_RANCHES);
      setCrops(DEFAULT_CROPS);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Calculate total calories generated across both ranches and crops
  const totalCalories = useMemo(() => {
    const ranchCals = ranches.reduce((total, ranch) => {
      const critter = mergedCritters[ranch.critterType];
      if (!critter) return total;
      return total + (critter.caloriesPerCycle * ranch.count);
    }, 0);

    const cropCals = crops.reduce((total, cropItem) => {
      const crop = mergedCrops[cropItem.cropType];
      if (!crop) return total;
      return total + (crop.caloriesPerCycle * cropItem.count);
    }, 0);

    return ranchCals + cropCals;
  }, [ranches, crops, mergedCritters, mergedCrops]);

  return (
    <Layout onClearAll={clearAll}>
      <div className="main-grid">
        <aside>
          <DuplicantStats 
            duplicants={duplicants} 
            setDuplicants={setDuplicants} 
            totalCalories={totalCalories}
            ranches={ranches}
            crops={crops}
          />
        </aside>
        <section>
          {/* Blueprint Navigation Tabs */}
          <div className="tabs-container">
            <button 
              className={`tab-btn ${activeTab === 'ranches' ? 'active' : ''}`}
              onClick={() => setActiveTab('ranches')}
            >
              Husbandry (Ranches)
            </button>
            <button 
              className={`tab-btn ${activeTab === 'farms' ? 'active' : ''}`}
              onClick={() => setActiveTab('farms')}
            >
              Agriculture (Farms)
            </button>
            <button 
              className={`tab-btn ${activeTab === 'database' ? 'active' : ''}`}
              onClick={() => setActiveTab('database')}
            >
              Colony Database
            </button>
          </div>

          {activeTab === 'ranches' ? (
            <RanchBoard 
              ranches={ranches}
              onRanchCountChange={handleRanchCountChange}
              onRanchAdd={handleRanchAdd}
              onRanchRemove={handleRanchRemove}
              critterData={mergedCritters}
            />
          ) : activeTab === 'farms' ? (
            <FarmBoard 
              crops={crops}
              onCropCountChange={handleCropCountChange}
              onCropRoomSizeChange={handleCropRoomSizeChange}
              onCropAdd={handleCropAdd}
              onCropRemove={handleCropRemove}
              cropData={mergedCrops}
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
