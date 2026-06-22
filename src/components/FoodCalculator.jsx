import React, { useState, useMemo } from 'react';
import { Sliders, Droplet, Flame, Compass, Info, ShieldAlert, Sparkles, HelpCircle, Lock, Unlock } from 'lucide-react';
import { CROP_DATA } from '../data/crops';
import { CRITTER_DATA } from '../data/critters';
import { cleanName } from './DatabaseExplorer';
import { getImageUrl, formatResourceName } from '../utils/images';

const RECIPE_INGREDIENTS = {
  mealwood: [{ name: 'Mealwood Seed', amount: 1, unit: 'seed' }],
  bristleBlossom: [{ name: 'Bristle Blossom Seed', amount: 1, unit: 'seed' }],
  gristleBerry: [{ name: 'Bristle Berry', amount: 1, unit: 'berry' }],
  duskCap: [{ name: 'Fungal Spore', amount: 1, unit: 'spore' }],
  friedMushroom: [{ name: 'Mushroom', amount: 1, unit: 'item' }],
  sleetWheat: [{ name: 'Sleet Wheat Grain', amount: 1, unit: 'grain' }],
  frostBun: [{ name: 'Sleet Wheat Grain', amount: 3, unit: 'grains' }],
  barbecue: [{ name: 'Meat', amount: 1, unit: 'item' }],
  pacuSeafood: [{ name: 'Pacu Fillet', amount: 1, unit: 'item' }],
  mushBar: [{ name: 'Dirt', amount: 75, unit: 'kg' }, { name: 'Water', amount: 75, unit: 'kg' }],
  mushFry: [{ name: 'Mush Bar', amount: 1, unit: 'item' }],
  liceLoaf: [{ name: 'Meal Lice', amount: 2, unit: 'items' }, { name: 'Water', amount: 50, unit: 'kg' }],
  berrySludge: [{ name: 'Bristle Berry', amount: 5, unit: 'items' }, { name: 'Sleet Wheat Grain', amount: 5, unit: 'grains' }],
  surfAndTurf: [{ name: 'Barbecue', amount: 1, unit: 'item' }, { name: 'Cooked Seafood', amount: 1, unit: 'item' }],
  pickledMeal: [{ name: 'Meal Lice', amount: 1, unit: 'item' }],
  omelette: [{ name: 'Critter Egg', amount: 1, unit: 'egg' }],
  pepperBread: [{ name: 'Sleet Wheat Grain', amount: 10, unit: 'grains' }, { name: 'Pincha Peppernut', amount: 1, unit: 'item' }],
  stuffedBerry: [{ name: 'Bristle Berry', amount: 2, unit: 'items' }, { name: 'Pincha Peppernut', amount: 1, unit: 'item' }],
  mushroomWrap: [{ name: 'Fried Mushroom', amount: 1, unit: 'item' }, { name: 'Lettuce', amount: 4, unit: 'item' }],
  frostBurger: [{ name: 'Frost Bun', amount: 1, unit: 'item' }, { name: 'Lettuce', amount: 1, unit: 'item' }, { name: 'Barbecue', amount: 1, unit: 'item' }],
  grubfruitPreserves: [{ name: 'Grubfruit', amount: 1, unit: 'item' }, { name: 'Sucrose', amount: 5, unit: 'kg' }],
  smokedFish: [{ name: 'Pacu Fillet', amount: 1, unit: 'item' }, { name: 'Wood Log', amount: 25, unit: 'kg' }],
  veggiePoppers: [{ name: 'Bristle Berry', amount: 1, unit: 'item' }, { name: 'Wood Log', amount: 25, unit: 'kg' }],
  tenderBrisket: [{ name: 'Meat', amount: 1, unit: 'item' }, { name: 'Wood Log', amount: 25, unit: 'kg' }],
  deepFriedFish: [{ name: 'Pacu Fillet', amount: 1, unit: 'item' }, { name: 'Tallow', amount: 2.4, unit: 'kg' }],
  deepFriedShellfish: [{ name: 'Pacu Fillet', amount: 1, unit: 'item' }, { name: 'Tallow', amount: 2.4, unit: 'kg' }],
  makiSushi: [{ name: 'Liceloaf', amount: 1, unit: 'item' }, { name: 'Pacu Fillet', amount: 1, unit: 'item' }, { name: 'Nori', amount: 1, unit: 'kg' }],
  nigiriSushi: [{ name: 'Liceloaf', amount: 1, unit: 'item' }, { name: 'Calamari', amount: 1, unit: 'item' }, { name: 'Nori', amount: 1, unit: 'kg' }]
};

// Helper function to adjust percentages when a slider is changed manually
const adjustPercentages = (current, activeKeys, locked, changedKey, newValue) => {
  const updated = { ...current };
  
  // Set all inactive keys to 0
  Object.keys(updated).forEach(k => {
    if (!activeKeys.includes(k)) {
      updated[k] = 0;
    }
  });

  if (activeKeys.length === 0) return updated;
  if (activeKeys.length === 1) {
    updated[activeKeys[0]] = 100;
    return updated;
  }

  if (changedKey) {
    const val = Math.max(0, Math.min(100, newValue));
    updated[changedKey] = val;

    const delta = val - (current[changedKey] || 0);
    if (delta === 0) return updated;

    // Adjust other active keys to absorb -delta.
    const adjustKeys = activeKeys.filter(k => k !== changedKey && !locked[k]);

    if (adjustKeys.length > 0) {
      let remainingToAbsorb = -delta;
      const sumCurrent = adjustKeys.reduce((sum, k) => sum + (current[k] || 0), 0);
      
      if (sumCurrent > 0) {
        let applied = 0;
        adjustKeys.forEach((k, idx) => {
          let share;
          if (idx === adjustKeys.length - 1) {
            share = remainingToAbsorb - applied;
          } else {
            share = Math.round((current[k] / sumCurrent) * remainingToAbsorb);
          }
          const oldVal = updated[k] || 0;
          let newVal = oldVal + share;
          if (newVal < 0) newVal = 0;
          if (newVal > 100) newVal = 100;
          const actualChange = newVal - oldVal;
          updated[k] = newVal;
          applied += actualChange;
        });
        
        let leftover = remainingToAbsorb - applied;
        if (leftover !== 0) {
          let passes = 0;
          while (leftover !== 0 && passes < 5) {
            passes++;
            let candidateKeys = adjustKeys.filter(k => {
              if (leftover < 0) {
                return updated[k] > 0;
              } else {
                return updated[k] < 100;
              }
            });
            if (candidateKeys.length === 0) break;
            
            let appliedInPass = 0;
            const len = candidateKeys.length;
            candidateKeys.forEach((k, idx) => {
              let share;
              if (idx === len - 1) {
                share = leftover - appliedInPass;
              } else {
                share = leftover > 0 ? Math.ceil(leftover / len) : Math.floor(leftover / len);
              }
              const oldVal = updated[k];
              let newVal = Math.max(0, Math.min(100, oldVal + share));
              updated[k] = newVal;
              appliedInPass += (newVal - oldVal);
            });
            leftover -= appliedInPass;
          }
        }
      } else {
        let remainingToAbsorb = -delta;
        const len = adjustKeys.length;
        adjustKeys.forEach((k, idx) => {
          let share;
          if (idx === len - 1) {
            share = remainingToAbsorb;
          } else {
            share = remainingToAbsorb > 0 ? Math.ceil(remainingToAbsorb / len) : Math.floor(remainingToAbsorb / len);
          }
          updated[k] = Math.max(0, Math.min(100, share));
          remainingToAbsorb -= updated[k];
        });
      }
    } else {
      // Revert the change to changedKey if we can't adjust other items
      updated[changedKey] = current[changedKey] || 0;
    }
  }

  // Ensure total sum is exactly 100
  const total = activeKeys.reduce((sum, k) => sum + (updated[k] || 0), 0);
  if (total !== 100) {
    const diff = 100 - total;
    const targetKeys = activeKeys.filter(k => !locked[k]);
    const keysToAdjust = targetKeys.length > 0 ? targetKeys : activeKeys;
    const sorted = [...keysToAdjust].sort((a, b) => {
      return diff > 0 ? (updated[b] - updated[a]) : (updated[a] - updated[b]);
    });
    if (sorted.length > 0) {
      updated[sorted[0]] = Math.max(0, Math.min(100, (updated[sorted[0]] || 0) + diff));
    }
  }

  return updated;
};

// Helper function to redistribute percentages when a new food item is added to the diet
const redistributeOnAddition = (addedId, current, activeKeys, locked) => {
  const updated = { ...current };
  const N = activeKeys.length;
  const target = Math.floor(100 / N);

  updated[addedId] = target;

  const others = activeKeys.filter(k => k !== addedId);
  if (others.length === 0) {
    updated[addedId] = 100;
    return updated;
  }

  const unlockedOthers = others.filter(k => !locked[k]);
  const sumUnlockedOthers = unlockedOthers.reduce((sum, k) => sum + (current[k] || 0), 0);

  if (sumUnlockedOthers >= target) {
    let remainingToDeduct = target;
    let applied = 0;
    unlockedOthers.forEach((k, idx) => {
      let share;
      if (idx === unlockedOthers.length - 1) {
        share = remainingToDeduct - applied;
      } else {
        share = Math.round((current[k] / sumUnlockedOthers) * target);
      }
      const oldVal = current[k] || 0;
      const newVal = Math.max(0, oldVal - share);
      updated[k] = newVal;
      applied += (oldVal - newVal);
    });

    let leftover = target - applied;
    if (leftover > 0) {
      unlockedOthers.filter(k => updated[k] > 0).forEach(k => {
        if (leftover <= 0) return;
        const oldVal = updated[k];
        const newVal = Math.max(0, oldVal - leftover);
        updated[k] = newVal;
        leftover -= (oldVal - newVal);
      });
    }
  } else {
    unlockedOthers.forEach(k => {
      updated[k] = 0;
    });

    const remainingToDeduct = target - sumUnlockedOthers;
    const lockedOthers = others.filter(k => locked[k]);
    const sumLockedOthers = lockedOthers.reduce((sum, k) => sum + (current[k] || 0), 0);

    if (sumLockedOthers > 0) {
      let applied = 0;
      lockedOthers.forEach((k, idx) => {
        let share;
        if (idx === lockedOthers.length - 1) {
          share = remainingToDeduct - applied;
        } else {
          share = Math.round((current[k] / sumLockedOthers) * remainingToDeduct);
        }
        const oldVal = current[k] || 0;
        const newVal = Math.max(0, oldVal - share);
        updated[k] = newVal;
        applied += (oldVal - newVal);
      });
    }
  }

  const total = activeKeys.reduce((sum, k) => sum + (updated[k] || 0), 0);
  if (total !== 100) {
    const diff = 100 - total;
    const sorted = [...activeKeys].sort((a, b) => updated[b] - updated[a]);
    if (sorted.length > 0) {
      updated[sorted[0]] = Math.max(0, Math.min(100, (updated[sorted[0]] || 0) + diff));
    }
  }

  return updated;
};

// Helper function to redistribute percentages when a food item is removed from the diet
const redistributeOnRemoval = (removedId, current, activeKeys, locked) => {
  const updated = { ...current };
  updated[removedId] = 0;

  if (activeKeys.length === 0) return updated;
  if (activeKeys.length === 1) {
    updated[activeKeys[0]] = 100;
    return updated;
  }

  const freed = current[removedId] || 0;
  if (freed === 0) return updated;

  const unlocked = activeKeys.filter(k => !locked[k]);
  if (unlocked.length > 0) {
    const sumUnlocked = unlocked.reduce((sum, k) => sum + (current[k] || 0), 0);
    if (sumUnlocked > 0) {
      let applied = 0;
      unlocked.forEach((k, idx) => {
        let share;
        if (idx === unlocked.length - 1) {
          share = freed - applied;
        } else {
          share = Math.round((current[k] / sumUnlocked) * freed);
        }
        updated[k] = (current[k] || 0) + share;
        applied += share;
      });
    } else {
      let remaining = freed;
      const len = unlocked.length;
      unlocked.forEach((k, idx) => {
        let share;
        if (idx === len - 1) {
          share = remaining;
        } else {
          share = Math.round(freed / len);
        }
        updated[k] = share;
        remaining -= share;
      });
    }
  } else {
    const sumLocked = activeKeys.reduce((sum, k) => sum + (current[k] || 0), 0);
    if (sumLocked > 0) {
      let applied = 0;
      activeKeys.forEach((k, idx) => {
        let share;
        if (idx === activeKeys.length - 1) {
          share = freed - applied;
        } else {
          share = Math.round((current[k] / sumLocked) * freed);
        }
        updated[k] = (current[k] || 0) + share;
        applied += share;
      });
    } else {
      let remaining = freed;
      const len = activeKeys.length;
      activeKeys.forEach((k, idx) => {
        let share;
        if (idx === len - 1) {
          share = remaining;
        } else {
          share = Math.round(freed / len);
        }
        updated[k] = share;
        remaining -= share;
      });
    }
  }

  const total = activeKeys.reduce((sum, k) => sum + (updated[k] || 0), 0);
  if (total !== 100) {
    const diff = 100 - total;
    const sorted = [...activeKeys].sort((a, b) => updated[b] - updated[a]);
    if (sorted.length > 0) {
      updated[sorted[0]] = Math.max(0, Math.min(100, (updated[sorted[0]] || 0) + diff));
    }
  }

  return updated;
};

export function FoodCalculator({ 
  duplicants, 
  setDuplicants, 
  growthMode,
  setGrowthMode,
  caloriePreset,
  setCaloriePreset,
  customCalorieInput,
  setCustomCalorieInput,
  cropData = CROP_DATA, 
  critterData = CRITTER_DATA,
  crops = [],
  setCrops = () => {},
  ranches = [],
  setRanches = () => {},
  addedToDiet,
  setAddedToDiet,
  mixPercentages,
  setMixPercentages,
  lockedPercentages = {},
}) {
  const createCropObject = (cropType, count) => {
    const crop = cropData[cropType] || CROP_DATA[cropType];
    const planters = crop?.acceptedPlanters || [];
    let defaultPlanter = 'HydroponicFarm';
    if (planters.includes('WideFarmTile')) {
      defaultPlanter = 'WideFarmTile';
    } else if (planters.includes('LargeBackwallFarm')) {
      defaultPlanter = 'LargeBackwallFarm';
    }
    return {
      id: `${cropType}_domesticated`,
      cropType,
      count,
      roomSize: 96,
      growthMode: 'domesticated',
      farmerTouch: false,
      planterType: defaultPlanter
    };
  };

  // Hovered tab state
  const [hoveredTabId, setHoveredTabId] = useState(null);

  // Preservation and Enhancement toggle states
  const [dehydratedFoods, setDehydratedFoods] = useState({});
  const [spicedFoods, setSpicedFoods] = useState({});
  const [rehydratedFoods, setRehydratedFoods] = useState({});

  // Map of defined calorie sources with their mathematical models
  const calorieSources = useMemo(() => {
    // Safely extract from dynamic data, falling back to static
    const mealwoodRaw = cropData.mealwood || CROP_DATA.mealwood;
    const bristleRaw = cropData.bristleBlossom || CROP_DATA.bristleBlossom;
    const duskRaw = cropData.duskCap || CROP_DATA.duskCap;
    const sleetRaw = cropData.sleetWheat || CROP_DATA.sleetWheat;
    const hatchRaw = critterData.hatch || CRITTER_DATA.hatch;
    const pacuRaw = critterData.pacu || CRITTER_DATA.pacu;
    const sweetleRaw = critterData.sweetle || CRITTER_DATA.sweetle;
    const bammothRaw = critterData.iceBelly || CRITTER_DATA.iceBelly;
    const squidRaw = critterData.squid || CRITTER_DATA.squid;

    return {
      mealwood: {
        id: 'mealwood',
        name: 'Meal Lice',
        type: 'crop',
        sourceName: 'Mealwood',
        station: 'Farms',
        rawCalCycle: mealwoodRaw?.caloriesPerCycle || 200,
        calCycle: mealwoodRaw?.caloriesPerCycle || 200,
        inputs: mealwoodRaw?.inputs || [{ name: 'Dirt', amount: 10, unit: 'kg' }],
        color: '#DAA520',
        tier: 'Early Game',
        efficiency: 'High',
        complexity: 'Very Low',
        description: 'Cheap, easy crop requiring only Dirt. Negative morale fallback.',
        isCooked: false,
        dlc: null
      },
      bristleBlossom: {
        id: 'bristleBlossom',
        name: 'Bristle Berry',
        type: 'crop',
        sourceName: 'Bristle Blossom',
        station: 'Farms',
        rawCalCycle: bristleRaw?.caloriesPerCycle || 266.7,
        calCycle: bristleRaw?.caloriesPerCycle || 266.7,
        inputs: bristleRaw?.inputs || [{ name: 'Water', amount: 20, unit: 'kg' }],
        color: '#7FBFFF',
        tier: 'Early to Mid',
        efficiency: 'Medium',
        complexity: 'Low',
        description: 'Produces raw Bristle Berries. Requires Light and direct Water irrigation.',
        isCooked: false,
        dlc: null
      },
      gristleBerry: {
        id: 'gristleBerry',
        name: 'Gristle Berry (Cooked)',
        type: 'crop',
        sourceName: 'Bristle Blossom',
        station: 'Electric Grill',
        rawCalCycle: bristleRaw?.caloriesPerCycle || 266.7,
        calCycle: (bristleRaw?.caloriesPerCycle || 266.7) * 1.25,
        inputs: bristleRaw?.inputs || [{ name: 'Water', amount: 20, unit: 'kg' }],
        color: '#ffbe82',
        tier: 'Early to Mid',
        efficiency: 'High',
        complexity: 'Medium',
        description: 'Grilled Bristle Berry caps. Saves 20% crop footprint.',
        isCooked: true,
        dlc: null
      },
      duskCap: {
        id: 'duskCap',
        name: 'Mushroom',
        type: 'crop',
        sourceName: 'Dusk Cap',
        station: 'Farms',
        rawCalCycle: duskRaw?.caloriesPerCycle || 320,
        calCycle: duskRaw?.caloriesPerCycle || 320,
        inputs: duskRaw?.inputs || [{ name: 'Slime', amount: 4, unit: 'kg' }],
        color: '#9C59D1',
        tier: 'Mid Game',
        efficiency: 'High',
        complexity: 'Medium',
        description: 'Grows in Carbon Dioxide atmospheres. Requires solid Slime fertilization.',
        isCooked: false,
        dlc: null
      },
      friedMushroom: {
        id: 'friedMushroom',
        name: 'Fried Mushroom (Cooked)',
        type: 'crop',
        sourceName: 'Dusk Cap',
        station: 'Electric Grill',
        rawCalCycle: duskRaw?.caloriesPerCycle || 320,
        calCycle: (duskRaw?.caloriesPerCycle || 320) * 1.167,
        inputs: duskRaw?.inputs || [{ name: 'Slime', amount: 4, unit: 'kg' }],
        color: '#c48bff',
        tier: 'Mid Game',
        efficiency: 'Very High',
        complexity: 'Medium',
        description: 'Delicious fried mushroom caps. Excellent morale boost and extended spoil time.',
        isCooked: true,
        dlc: null
      },
      sleetWheat: {
        id: 'sleetWheat',
        name: 'Sleet Wheat Grain',
        type: 'crop',
        sourceName: 'Sleet Wheat',
        station: 'Farms',
        rawCalCycle: sleetRaw?.caloriesPerCycle || 200,
        calCycle: sleetRaw?.caloriesPerCycle || 200,
        inputs: sleetRaw?.inputs || [{ name: 'Dirt', amount: 5, unit: 'kg' }, { name: 'Water', amount: 20, unit: 'kg' }],
        color: '#FFFFA8',
        tier: 'Late Game',
        efficiency: 'Medium',
        complexity: 'High',
        description: 'Requires cold environment and dual inputs (water + dirt). Standard premium base.',
        isCooked: false,
        dlc: null
      },
      frostBun: {
        id: 'frostBun',
        name: 'Frost Bun (Cooked)',
        type: 'crop',
        sourceName: 'Sleet Wheat',
        station: 'Electric Grill',
        rawCalCycle: sleetRaw?.caloriesPerCycle || 200,
        calCycle: (sleetRaw?.caloriesPerCycle || 200) * 2.0,
        inputs: sleetRaw?.inputs || [{ name: 'Dirt', amount: 5, unit: 'kg' }, { name: 'Water', amount: 20, unit: 'kg' }],
        color: '#ffe596',
        tier: 'Late Game',
        efficiency: 'Very High',
        complexity: 'High',
        description: 'Bake grains into Frost Buns. Halves your farming footprint compared to eating raw grains.',
        isCooked: true,
        dlc: null
      },
      barbecue: {
        id: 'barbecue',
        name: 'Barbecue (BBQ)',
        type: 'critter',
        sourceName: 'Hatch',
        station: 'Electric Grill',
        rawCalCycle: hatchRaw?.caloriesPerCycle || 87.5,
        calCycle: hatchRaw?.caloriesPerCycle || 87.5,
        inputs: [{ name: 'Igneous Rock', amount: 140, unit: 'kg' }],
        color: '#FFA268',
        tier: 'Early to Late',
        efficiency: 'High',
        complexity: 'High',
        description: 'Ranching Hatches for meat and cooking it. Generates helpful Coal outputs.',
        isCooked: true,
        dlc: null
      },
      pacuSeafood: {
        id: 'pacuSeafood',
        name: 'Cooked Seafood',
        type: 'critter',
        sourceName: 'Pacu',
        station: 'Electric Grill',
        rawCalCycle: pacuRaw?.caloriesPerCycle || 200,
        calCycle: pacuRaw?.caloriesPerCycle || 200,
        inputs: [{ name: 'Algae', amount: 140, unit: 'kg' }],
        color: '#7FBFFF',
        tier: 'Mid to Late',
        efficiency: 'Extreme',
        complexity: 'High',
        description: 'Pacu fish reproduce rapidly. Extreme calorie yield, but consumes Algae heavily.',
        isCooked: true,
        dlc: null
      },
      mushBar: {
        id: 'mushBar',
        name: 'Mush Bar',
        type: 'prepared',
        sourceName: 'Microbe Musher',
        station: 'Microbe Musher',
        rawCalCycle: 800,
        calCycle: 800,
        inputs: [
          { name: 'Dirt', amount: 75, unit: 'kg' },
          { name: 'Water', amount: 75, unit: 'kg' }
        ],
        color: '#8B5A2B',
        tier: 'Early Game',
        efficiency: 'Very Low',
        complexity: 'Low',
        description: 'Emergency food processed from Dirt and Water. Extremely heavy resource footprint and negative morale.',
        isCooked: false,
        dlc: null
      },
      mushFry: {
        id: 'mushFry',
        name: 'Mush Fry (Cooked)',
        type: 'prepared',
        sourceName: 'Electric Grill',
        station: 'Electric Grill',
        rawCalCycle: 800,
        calCycle: 1050,
        inputs: [
          { name: 'Dirt', amount: 75, unit: 'kg' },
          { name: 'Water', amount: 75, unit: 'kg' }
        ],
        color: '#CD853F',
        tier: 'Early Game',
        efficiency: 'Low',
        complexity: 'Medium',
        description: 'Baked Mush Bar. Eliminates food poisoning germs and gives a minor morale boost.',
        isCooked: true,
        dlc: null
      },
      liceLoaf: {
        id: 'liceLoaf',
        name: 'Lice Loaf (Prepared)',
        type: 'crop',
        sourceName: 'Mealwood',
        station: 'Microbe Musher',
        rawCalCycle: 200,
        calCycle: 283.3,
        inputs: [
          { name: 'Dirt', amount: 10, unit: 'kg' },
          { name: 'Water', amount: 8.3, unit: 'kg' }
        ],
        color: '#b8a97a',
        tier: 'Early Game',
        efficiency: 'High',
        complexity: 'Medium',
        description: 'Meal Lice blended with clean Water. Increases calorie yield by 41% and boosts morale.',
        isCooked: true,
        dlc: null
      },
      berrySludge: {
        id: 'berrySludge',
        name: 'Berry Sludge (Space)',
        type: 'crop',
        sourceName: 'Bristle & Wheat',
        station: 'Microbe Musher',
        rawCalCycle: 266.7,
        calCycle: 410,
        inputs: [
          { name: 'Water', amount: 32.5, unit: 'kg' },
          { name: 'Dirt', amount: 3.1, unit: 'kg' }
        ],
        color: '#00FF7F',
        tier: 'Mid to Late',
        efficiency: 'Very High',
        complexity: 'High',
        description: 'An unspoilable space food made from Bristle Berries and Sleet Wheat Grains. Perfect for rocket missions.',
        isCooked: true,
        dlc: null
      },
      surfAndTurf: {
        id: 'surfAndTurf',
        name: "Surf 'n' Turf (BBQ & Fish)",
        type: 'critter',
        sourceName: 'Hatch & Pacu',
        station: 'Gas Range',
        rawCalCycle: 87.5,
        calCycle: 164,
        inputs: [
          { name: 'Igneous Rock', amount: 140, unit: 'kg' },
          { name: 'Algae', amount: 140, unit: 'kg' }
        ],
        color: '#FF4500',
        tier: 'Late Game',
        efficiency: 'Extreme',
        complexity: 'High',
        description: 'Ultra-premium prepared meal combining Barbecue and Cooked Seafood. Outstanding morale boost (+12).',
        isCooked: true,
        dlc: null
      },
      pickledMeal: {
        id: 'pickledMeal',
        name: 'Pickled Meal',
        type: 'crop',
        sourceName: 'Mealwood',
        station: 'Electric Grill',
        rawCalCycle: 200,
        calCycle: 200,
        inputs: [{ name: 'Dirt', amount: 10, unit: 'kg' }],
        color: '#e2d3b2',
        tier: 'Early Game',
        efficiency: 'Medium',
        complexity: 'Low',
        description: 'Meal Lice fermented in vinegar. Preserves standard calories, increases spoil time dramatically.',
        isCooked: true,
        dlc: null
      },
      omelette: {
        id: 'omelette',
        name: 'Omelette',
        type: 'critter',
        sourceName: 'Hatch',
        station: 'Electric Grill',
        rawCalCycle: 87.5,
        calCycle: 140,
        inputs: [{ name: 'Igneous Rock', amount: 140, unit: 'kg' }],
        color: '#FFFFA8',
        tier: 'Early to Mid',
        efficiency: 'High',
        complexity: 'Medium',
        description: 'Fluffy scrambled eggs cooked from raw critter eggs. Excellent early morale fallback.',
        isCooked: true,
        dlc: null
      },
      pepperBread: {
        id: 'pepperBread',
        name: 'Pepper Bread',
        type: 'crop',
        sourceName: 'Sleet Wheat & Pincha Pepper',
        station: 'Gas Range',
        rawCalCycle: 200,
        calCycle: 450,
        inputs: [
          { name: 'Dirt', amount: 5, unit: 'kg' },
          { name: 'Water', amount: 20, unit: 'kg' },
          { name: 'Polluted Water', amount: 7, unit: 'kg' },
          { name: 'Phosphorite', amount: 4, unit: 'kg' }
        ],
        color: '#FF8C00',
        tier: 'Late Game',
        efficiency: 'Extreme',
        complexity: 'High',
        description: 'Warm, delicious bread made with Sleet Wheat and spiced with Pincha Peppernuts. Superb morale boost (+16).',
        isCooked: true,
        dlc: null
      },
      stuffedBerry: {
        id: 'stuffedBerry',
        name: 'Stuffed Berry',
        type: 'crop',
        sourceName: 'Bristle Blossom & Pincha Pepper',
        station: 'Gas Range',
        rawCalCycle: 266.7,
        calCycle: 366.7,
        inputs: [
          { name: 'Water', amount: 20, unit: 'kg' },
          { name: 'Polluted Water', amount: 11.5, unit: 'kg' },
          { name: 'Phosphorite', amount: 6.6, unit: 'kg' }
        ],
        color: '#FF69B4',
        tier: 'Late Game',
        efficiency: 'Very High',
        complexity: 'High',
        description: 'Bristle Berries stuffed with Pincha Peppernuts. Gourmet baked dessert that Duplicants adore.',
        isCooked: true,
        dlc: null
      },
      mushroomWrap: {
        id: 'mushroomWrap',
        name: 'Mushroom Wrap',
        type: 'crop',
        sourceName: 'Dusk Cap & Waterweed',
        station: 'Gas Range',
        rawCalCycle: 320,
        calCycle: 400,
        inputs: [
          { name: 'Slime', amount: 4, unit: 'kg' },
          { name: 'Salt Water', amount: 20, unit: 'kg' }
        ],
        color: '#2E8B57',
        tier: 'Late Game',
        efficiency: 'Very High',
        complexity: 'High',
        description: 'Fried mushrooms wrapped in aquatic Lettuce. Healthy, savory, and extremely popular.',
        isCooked: true,
        dlc: null
      },
      frostBurger: {
        id: 'frostBurger',
        name: 'Frost Burger',
        type: 'prepared',
        sourceName: 'Wheat, Hatch & Waterweed',
        station: 'Gas Range',
        rawCalCycle: 200,
        calCycle: 500,
        inputs: [
          { name: 'Dirt', amount: 5, unit: 'kg' },
          { name: 'Water', amount: 20, unit: 'kg' },
          { name: 'Igneous Rock', amount: 140, unit: 'kg' },
          { name: 'Salt Water', amount: 20, unit: 'kg' }
        ],
        color: '#00FFFF',
        tier: 'Late Game',
        efficiency: 'Extreme',
        complexity: 'Extreme',
        description: 'Astronaut grade luxury meal stacking a Frost Bun, Lettuce, and BBQ steak. Grants +16 Morale at the cost of Athletics (-2).',
        isCooked: true,
        dlc: null
      },
      grubfruitPreserves: {
        id: 'grubfruitPreserves',
        name: 'Grubfruit Preserves',
        type: 'crop',
        sourceName: 'Grubfruit Plant & Sweetle',
        station: 'Electric Grill',
        rawCalCycle: 200,
        calCycle: 320,
        inputs: [
          { name: 'Sulfur', amount: 10, unit: 'kg' },
          { name: 'Sucrose', amount: 5, unit: 'kg' }
        ],
        color: '#DAA520',
        tier: 'Mid Game',
        efficiency: 'Very High',
        complexity: 'Medium',
        description: 'Grubfruit cooked in a thick sucrose glaze. Highly stable shelf-life and a sweet morale booster.',
        isCooked: true,
        dlc: 'EXPANSION1'
      },
      smokedFish: {
        id: 'smokedFish',
        name: 'Smoked Fish',
        type: 'critter',
        sourceName: 'Pacu & Smoker',
        station: 'Smoker',
        rawCalCycle: 200,
        calCycle: 280,
        inputs: [
          { name: 'Algae', amount: 140, unit: 'kg' },
          { name: 'Wood Log', amount: 25, unit: 'kg' }
        ],
        color: '#87CEEB',
        tier: 'Mid to Late',
        efficiency: 'High',
        complexity: 'Medium',
        description: 'Buttery fish fillets slow-smoked over a fragrant wood fire. Imbued with a rich woodsy flavor.',
        isCooked: true,
        dlc: 'DLC4'
      },
      veggiePoppers: {
        id: 'veggiePoppers',
        name: 'Veggie Poppers',
        type: 'crop',
        sourceName: 'Bristle Blossom & Smoker',
        station: 'Smoker',
        rawCalCycle: 266.7,
        calCycle: 350,
        inputs: [
          { name: 'Water', amount: 20, unit: 'kg' },
          { name: 'Wood Log', amount: 25, unit: 'kg' }
        ],
        color: '#E67E22',
        tier: 'Mid to Late',
        efficiency: 'High',
        complexity: 'Medium',
        description: 'Spicy stuffed berries slow-smoked over dry logs. Extra crunchy with a bold hickory aroma.',
        isCooked: true,
        dlc: 'DLC4'
      },
      tenderBrisket: {
        id: 'tenderBrisket',
        name: 'Tender Brisket',
        type: 'critter',
        sourceName: 'Hatch & Smoker',
        station: 'Smoker',
        rawCalCycle: 87.5,
        calCycle: 130,
        inputs: [
          { name: 'Igneous Rock', amount: 140, unit: 'kg' },
          { name: 'Wood Log', amount: 25, unit: 'kg' }
        ],
        color: '#A0522D',
        tier: 'Mid to Late',
        efficiency: 'Very High',
        complexity: 'Medium',
        description: 'Tender critter steaks slow-smoked for half a cycle. Deeply savory and tender.',
        isCooked: true,
        dlc: 'DLC4'
      },
      deepFriedFish: {
        id: 'deepFriedFish',
        name: 'Fish Taco (Fried)',
        type: 'critter',
        sourceName: 'Pacu & Deep Fryer',
        station: 'Deep Fryer',
        rawCalCycle: 200,
        calCycle: 350,
        inputs: [
          { name: 'Algae', amount: 140, unit: 'kg' },
          { name: 'Tallow', amount: 2.4, unit: 'kg' },
          { name: 'Dirt', amount: 5, unit: 'kg' },
          { name: 'Water', amount: 20, unit: 'kg' }
        ],
        color: '#FFD700',
        tier: 'Late Game',
        efficiency: 'Extreme',
        complexity: 'High',
        description: 'Crisp, golden-battered Pacu fish tacos deep-fried in Bammoth Tallow. Unbelievable calorie density.',
        isCooked: true,
        dlc: 'DLC2'
      },

      deepFriedShellfish: {
        id: 'deepFriedShellfish',
        name: 'Shellfish Tempura',
        type: 'critter',
        sourceName: 'Pacu & Deep Fryer',
        station: 'Deep Fryer',
        rawCalCycle: 200,
        calCycle: 380,
        inputs: [
          { name: 'Algae', amount: 140, unit: 'kg' },
          { name: 'Tallow', amount: 2.4, unit: 'kg' }
        ],
        color: '#F4A460',
        tier: 'Late Game',
        efficiency: 'Extreme',
        complexity: 'High',
        description: 'Delicate aquatic fish fillets lightly tempura-fried in warm, rich Tallow.',
        isCooked: true,
        dlc: 'DLC2'
      },
      makiSushi: {
        id: 'makiSushi',
        name: 'Sushi Roll',
        type: 'prepared',
        sourceName: 'Pacu & Mealwood',
        station: 'Sushi Bar',
        rawCalCycle: 200,
        calCycle: 436,
        inputs: [
          { name: 'Algae', amount: 140, unit: 'kg' },
          { name: 'Dirt', amount: 10, unit: 'kg' },
          { name: 'Water', amount: 50, unit: 'kg' },
          { name: 'Nori', amount: 1.0, unit: 'kg' }
        ],
        color: '#006400',
        tier: 'Mid to Late',
        efficiency: 'Very High',
        complexity: 'Medium',
        description: 'Rice rolled in thin sheets of toasted Nori and stuffed with fresh Pacu sashimi and Liceloaf.',
        isCooked: true,
        dlc: 'DLC5'
      },
      nigiriSushi: {
        id: 'nigiriSushi',
        name: 'Nigiri',
        type: 'prepared',
        sourceName: 'Squid & Mealwood',
        station: 'Sushi Bar',
        rawCalCycle: 60,
        calCycle: 416,
        inputs: [
          { name: 'Nori', amount: 3.4, unit: 'kg' },
          { name: 'Dirt', amount: 10, unit: 'kg' },
          { name: 'Water', amount: 50, unit: 'kg' }
        ],
        color: '#FFC0CB',
        tier: 'Late Game',
        efficiency: 'Extreme',
        complexity: 'High',
        description: 'A thin slice of Glo Squid sashimi laid over a small hand-pressed block of seasoned rice.',
        isCooked: true,
        dlc: 'DLC5'
      }
    };
  }, [cropData, critterData]);

  // Add-sources panel filter/sort state
  const [addSearchText, setAddSearchText] = useState('');
  const [addFilterDlc, setAddFilterDlc] = useState('all'); // 'all' | 'base' | 'dlc'
  const [addSortBy, setAddSortBy] = useState('type'); // 'type' | 'name' | 'kcal' | 'efficiency'
  const [addSortDirection, setAddSortDirection] = useState('desc'); // 'asc' | 'desc'

  // Accordion toggle actions
  const handleScaleToggle = () => {
    setIsScaleExpanded(!isScaleExpanded);
    if (!isScaleExpanded) {
      setIsModeExpanded(false);
      setIsDemandsExpanded(false);
    }
  };

  const handleModeToggle = () => {
    setIsModeExpanded(!isModeExpanded);
    if (!isModeExpanded) {
      setIsScaleExpanded(false);
      setIsDemandsExpanded(false);
    }
  };

  const handleDemandsToggle = () => {
    setIsDemandsExpanded(!isDemandsExpanded);
    if (!isDemandsExpanded) {
      setIsScaleExpanded(false);
      setIsModeExpanded(false);
    }
  };

  // Unfold sidebar and expand a specific panel when collapsed dock items are clicked
  const handleIconClick = (section) => {
    setIsSidebarCollapsed(false);
    if (section === 'scale') {
      setIsScaleExpanded(true);
      setIsModeExpanded(false);
      setIsDemandsExpanded(false);
    } else if (section === 'mode') {
      setIsScaleExpanded(false);
      setIsModeExpanded(true);
      setIsDemandsExpanded(false);
    } else if (section === 'demands') {
      setIsScaleExpanded(false);
      setIsModeExpanded(false);
      setIsDemandsExpanded(true);
    }
  };

  // Helper check to see if a food source has active domestic/wild buildings in the colony
  // Helper check to see if a food source has active domestic/wild buildings in the colony
  const isSourceActiveInFarms = (srcId) => {
    switch (srcId) {
      case 'mealwood':
      case 'liceLoaf':
      case 'pickledMeal':
        return crops.some(c => c.cropType === 'mealwood' && c.count > 0);
      case 'bristleBlossom':
      case 'gristleBerry':
      case 'veggiePoppers':
        return crops.some(c => c.cropType === 'bristleBlossom' && c.count > 0);
      case 'duskCap':
      case 'friedMushroom':
        return crops.some(c => c.cropType === 'duskCap' && c.count > 0);
      case 'sleetWheat':
      case 'frostBun':
        return crops.some(c => c.cropType === 'sleetWheat' && c.count > 0);
      case 'barbecue':
      case 'omelette':
      case 'tenderBrisket':
        return ranches.some(r => r.critterType === 'hatch' && r.count > 0);
      case 'pacuSeafood':
      case 'smokedFish':
      case 'deepFriedFish':
      case 'deepFriedShellfish':
        return ranches.some(r => r.critterType === 'pacu' && r.count > 0);
      case 'makiSushi':
        return ranches.some(r => r.critterType === 'pacu' && r.count > 0) && crops.some(c => c.cropType === 'mealwood' && c.count > 0);
      case 'nigiriSushi':
        return ranches.some(r => r.critterType === 'squid' && r.count > 0) && crops.some(c => c.cropType === 'mealwood' && c.count > 0);
      case 'berrySludge':
        return crops.some(c => c.cropType === 'bristleBlossom' && c.count > 0) && crops.some(c => c.cropType === 'sleetWheat' && c.count > 0);
      case 'surfAndTurf':
        return ranches.some(r => r.critterType === 'hatch' && r.count > 0) && ranches.some(r => r.critterType === 'pacu' && r.count > 0);
      case 'pepperBread':
        return crops.some(c => c.cropType === 'sleetWheat' && c.count > 0) && crops.some(c => c.cropType === 'pinchaPepper' && c.count > 0);
      case 'stuffedBerry':
        return crops.some(c => c.cropType === 'bristleBlossom' && c.count > 0) && crops.some(c => c.cropType === 'pinchaPepper' && c.count > 0);
      case 'mushroomWrap':
        return crops.some(c => c.cropType === 'duskCap' && c.count > 0) && crops.some(c => c.cropType === 'waterweed' && c.count > 0);
      case 'grubfruitPreserves':
        return crops.some(c => c.cropType === 'grubfruitPlant' && c.count > 0) && ranches.some(r => r.critterType === 'sweetle' && r.count > 0);
      case 'frostBurger':
        return crops.some(c => c.cropType === 'sleetWheat' && c.count > 0) && crops.some(c => c.cropType === 'waterweed' && c.count > 0) && ranches.some(r => r.critterType === 'hatch' && r.count > 0);
      default:
        return false;
    }
  };

  // Mapping from calorie source to global card type and key
  const getSourceMapping = (srcId) => {
    switch (srcId) {
      case 'mealwood':
      case 'liceLoaf':
      case 'pickledMeal':
        return { type: 'crop', key: 'mealwood' };
      case 'bristleBlossom':
      case 'gristleBerry':
      case 'veggiePoppers':
        return { type: 'crop', key: 'bristleBlossom' };
      case 'duskCap':
      case 'friedMushroom':
        return { type: 'crop', key: 'duskCap' };
      case 'sleetWheat':
      case 'frostBun':
        return { type: 'crop', key: 'sleetWheat' };
      case 'barbecue':
      case 'omelette':
      case 'tenderBrisket':
        return { type: 'critter', key: 'hatch' };
      case 'pacuSeafood':
      case 'smokedFish':
      case 'deepFriedFish':
      case 'deepFriedShellfish':
        return { type: 'critter', key: 'pacu' };
      case 'makiSushi':
        return { type: 'mixed-source', cropKeys: ['mealwood'], critterKeys: ['pacu'] };
      case 'nigiriSushi':
        return { type: 'mixed-source', cropKeys: ['mealwood'], critterKeys: ['squid'] };
      case 'berrySludge':
        return { type: 'multi-crop', keys: ['bristleBlossom', 'sleetWheat'] };
      case 'surfAndTurf':
        return { type: 'multi-critter', keys: ['hatch', 'pacu'] };
      case 'pepperBread':
        return { type: 'multi-crop', keys: ['sleetWheat', 'pinchaPepper'] };
      case 'stuffedBerry':
        return { type: 'multi-crop', keys: ['bristleBlossom', 'pinchaPepper'] };
      case 'mushroomWrap':
        return { type: 'multi-crop', keys: ['duskCap', 'waterweed'] };
      case 'grubfruitPreserves':
        return { type: 'mixed-source', cropKeys: ['grubfruitPlant'], critterKeys: ['sweetle'] };
      case 'frostBurger':
        return { type: 'mixed-source', cropKeys: ['sleetWheat', 'waterweed'], critterKeys: ['hatch'] };
      default:
        return null;
    }
  };

  // Slide selector: which food source is being analyzed (defaults to 'mixed' / Summary)
  const [activeSlide, setActiveSlide] = useState('mixed');

  // Calorie requirement calculations
  const perDuplicantCalories = caloriePreset === 'custom' ? customCalorieInput : parseInt(caloriePreset);
  const totalCaloriesNeeded = duplicants * perDuplicantCalories;

  // List of active tabs: represents the duplicants' active diet (added to diet planner)
  const activeTabsList = useMemo(() => {
    return Object.values(calorieSources).filter(src => addedToDiet[src.id]);
  }, [calorieSources, addedToDiet]);

  // Ensure activeSlide is always in a valid state (or falls back to summary/mixed)
  React.useEffect(() => {
    if (activeSlide !== 'mixed' && activeSlide !== 'add' && !activeTabsList.some(tab => tab.id === activeSlide)) {
      setActiveSlide('mixed');
    }
  }, [activeTabsList, activeSlide]);

  // Live action handlers to add/remove crops or critter ranches dynamically
  const handleRemoveFromFarms = (srcId) => {
    const mapping = getSourceMapping(srcId);
    if (!mapping) return;

    if (mapping.type === 'crop') {
      setCrops(crops.filter(c => c.cropType !== mapping.key));
    } else if (mapping.type === 'critter') {
      setRanches(ranches.filter(r => r.critterType !== mapping.key));
    } else if (mapping.type === 'multi-crop') {
      setCrops(crops.filter(c => !mapping.keys.includes(c.cropType)));
    } else if (mapping.type === 'multi-critter') {
      setRanches(ranches.filter(r => !mapping.keys.includes(r.critterType)));
    } else if (mapping.type === 'mixed-source') {
      if (mapping.cropKeys) {
        setCrops(crops.filter(c => !mapping.cropKeys.includes(c.cropType)));
      }
      if (mapping.critterKeys) {
        setRanches(ranches.filter(r => !mapping.critterKeys.includes(r.critterType)));
      }
    }
  };

  const handleSendToFarms = (srcId) => {
    const mapping = getSourceMapping(srcId);
    if (!mapping) return;

    const src = calorieSources[srcId];
    if (!src) return;

    const plantSpeed = growthModifiers.plantSpeed;

    if (srcId === 'berrySludge') {
      // Berry Sludge sends both Bristle Blossom and Sleet Wheat
      const bristleKcalNeeded = (1600 / 2600) * totalCaloriesNeeded;
      const wheatKcalNeeded = (1000 / 2600) * totalCaloriesNeeded;

      const bristleCount = Math.ceil(bristleKcalNeeded / (266.7 * plantSpeed)) || 4;
      const wheatCount = Math.ceil(wheatKcalNeeded / (200 * plantSpeed)) || 4;

      let newCrops = [...crops];
      if (newCrops.some(c => c.cropType === 'bristleBlossom')) {
        newCrops = newCrops.map(c => c.cropType === 'bristleBlossom' ? { ...c, count: bristleCount } : c);
      } else {
        newCrops.push(createCropObject('bristleBlossom', bristleCount));
      }
      if (newCrops.some(c => c.cropType === 'sleetWheat')) {
        newCrops = newCrops.map(c => c.cropType === 'sleetWheat' ? { ...c, count: wheatCount } : c);
      } else {
        newCrops.push(createCropObject('sleetWheat', wheatCount));
      }
      setCrops(newCrops);

    } else if (srcId === 'surfAndTurf') {
      // Surf 'n' Turf sends both Hatch and Pacu ranches
      const hatchKcalNeeded = 0.5 * totalCaloriesNeeded;
      const pacuKcalNeeded = 0.5 * totalCaloriesNeeded;

      const hatchCount = Math.ceil(hatchKcalNeeded / 87.5) || 8;
      const pacuCount = Math.ceil(pacuKcalNeeded / 200) || 4;

      let newRanches = [...ranches];
      if (newRanches.some(r => r.critterType === 'hatch')) {
        newRanches = newRanches.map(r => r.critterType === 'hatch' ? { ...r, count: hatchCount } : r);
      } else {
        newRanches.push({ critterType: 'hatch', count: hatchCount, ranchState: 'happy' });
      }
      if (newRanches.some(r => r.critterType === 'pacu')) {
        newRanches = newRanches.map(r => r.critterType === 'pacu' ? { ...r, count: pacuCount } : r);
      } else {
        newRanches.push({ critterType: 'pacu', count: pacuCount, ranchState: 'happy' });
      }
      setRanches(newRanches);

    } else if (srcId === 'pepperBread') {
      const wheatCount = Math.ceil((10 / 11) * totalCaloriesNeeded / (200 * plantSpeed)) || 6;
      const pepperCount = Math.ceil((1 / 11) * totalCaloriesNeeded / (200 * plantSpeed)) || 2;
      let newCrops = [...crops];
      if (newCrops.some(c => c.cropType === 'sleetWheat')) {
        newCrops = newCrops.map(c => c.cropType === 'sleetWheat' ? { ...c, count: wheatCount } : c);
      } else {
        newCrops.push(createCropObject('sleetWheat', wheatCount));
      }
      if (newCrops.some(c => c.cropType === 'pinchaPepper')) {
        newCrops = newCrops.map(c => c.cropType === 'pinchaPepper' ? { ...c, count: pepperCount } : c);
      } else {
        newCrops.push(createCropObject('pinchaPepper', pepperCount));
      }
      setCrops(newCrops);

    } else if (srcId === 'stuffedBerry') {
      const bristleCount = Math.ceil((6 / 7) * totalCaloriesNeeded / (266.7 * plantSpeed)) || 6;
      const pepperCount = Math.ceil((1 / 7) * totalCaloriesNeeded / (266.7 * plantSpeed)) || 2;
      let newCrops = [...crops];
      if (newCrops.some(c => c.cropType === 'bristleBlossom')) {
        newCrops = newCrops.map(c => c.cropType === 'bristleBlossom' ? { ...c, count: bristleCount } : c);
      } else {
        newCrops.push(createCropObject('bristleBlossom', bristleCount));
      }
      if (newCrops.some(c => c.cropType === 'pinchaPepper')) {
        newCrops = newCrops.map(c => c.cropType === 'pinchaPepper' ? { ...c, count: pepperCount } : c);
      } else {
        newCrops.push(createCropObject('pinchaPepper', pepperCount));
      }
      setCrops(newCrops);

    } else if (srcId === 'mushroomWrap') {
      const duskCount = Math.ceil((2 / 3) * totalCaloriesNeeded / (320 * plantSpeed)) || 6;
      const weedCount = Math.ceil((1 / 3) * totalCaloriesNeeded / (300 * plantSpeed)) || 3;
      let newCrops = [...crops];
      if (newCrops.some(c => c.cropType === 'duskCap')) {
        newCrops = newCrops.map(c => c.cropType === 'duskCap' ? { ...c, count: duskCount } : c);
      } else {
        newCrops.push(createCropObject('duskCap', duskCount));
      }
      if (newCrops.some(c => c.cropType === 'waterweed')) {
        newCrops = newCrops.map(c => c.cropType === 'waterweed' ? { ...c, count: weedCount } : c);
      } else {
        newCrops.push(createCropObject('waterweed', weedCount));
      }
      setCrops(newCrops);

    } else if (srcId === 'grubfruitPreserves') {
      const plantCount = Math.ceil(0.7 * totalCaloriesNeeded / (200 * plantSpeed)) || 4;
      const sweetleCount = Math.ceil(0.3 * totalCaloriesNeeded / 40) || 4;
      
      let newCrops = [...crops];
      if (newCrops.some(c => c.cropType === 'grubfruitPlant')) {
        newCrops = newCrops.map(c => c.cropType === 'grubfruitPlant' ? { ...c, count: plantCount } : c);
      } else {
        newCrops.push(createCropObject('grubfruitPlant', plantCount));
      }
      setCrops(newCrops);

      let newRanches = [...ranches];
      if (newRanches.some(r => r.critterType === 'sweetle')) {
        newRanches = newRanches.map(r => r.critterType === 'sweetle' ? { ...r, count: sweetleCount } : r);
      } else {
        newRanches.push({ critterType: 'sweetle', count: sweetleCount, ranchState: 'happy' });
      }
      setRanches(newRanches);

    } else if (srcId === 'frostBurger') {
      const wheatCount = Math.ceil(0.25 * totalCaloriesNeeded / (200 * plantSpeed)) || 4;
      const weedCount = Math.ceil(0.15 * totalCaloriesNeeded / (300 * plantSpeed)) || 3;
      const hatchCount = Math.ceil(0.60 * totalCaloriesNeeded / 87.5) || 8;

      let newCrops = [...crops];
      if (newCrops.some(c => c.cropType === 'sleetWheat')) {
        newCrops = newCrops.map(c => c.cropType === 'sleetWheat' ? { ...c, count: wheatCount } : c);
      } else {
        newCrops.push(createCropObject('sleetWheat', wheatCount));
      }
      if (newCrops.some(c => c.cropType === 'waterweed')) {
        newCrops = newCrops.map(c => c.cropType === 'waterweed' ? { ...c, count: weedCount } : c);
      } else {
        newCrops.push(createCropObject('waterweed', weedCount));
      }
      setCrops(newCrops);

      let newRanches = [...ranches];
      if (newRanches.some(r => r.critterType === 'hatch')) {
        newRanches = newRanches.map(r => r.critterType === 'hatch' ? { ...r, count: hatchCount } : r);
      } else {
        newRanches.push({ critterType: 'hatch', count: hatchCount, ranchState: 'happy' });
      }
      setRanches(newRanches);

    } else if (srcId === 'makiSushi') {
      const pacuKcalNeeded = 0.485 * totalCaloriesNeeded;
      const mealwoodKcalNeeded = 0.515 * totalCaloriesNeeded;

      const pacuCount = Math.ceil(pacuKcalNeeded / 200) || 4;
      const mealwoodCount = Math.ceil(mealwoodKcalNeeded / (200 * plantSpeed)) || 6;

      let newCrops = [...crops];
      if (newCrops.some(c => c.cropType === 'mealwood')) {
        newCrops = newCrops.map(c => c.cropType === 'mealwood' ? { ...c, count: mealwoodCount } : c);
      } else {
        newCrops.push(createCropObject('mealwood', mealwoodCount));
      }
      setCrops(newCrops);

      let newRanches = [...ranches];
      if (newRanches.some(r => r.critterType === 'pacu')) {
        newRanches = newRanches.map(r => r.critterType === 'pacu' ? { ...r, count: pacuCount } : r);
      } else {
        newRanches.push({ critterType: 'pacu', count: pacuCount, ranchState: 'happy' });
      }
      setRanches(newRanches);

    } else if (srcId === 'nigiriSushi') {
      const squidKcalNeeded = 0.32 * totalCaloriesNeeded;
      const mealwoodKcalNeeded = 0.68 * totalCaloriesNeeded;

      const squidCount = Math.ceil(squidKcalNeeded / 60) || 6;
      const mealwoodCount = Math.ceil(mealwoodKcalNeeded / (200 * plantSpeed)) || 8;

      let newCrops = [...crops];
      if (newCrops.some(c => c.cropType === 'mealwood')) {
        newCrops = newCrops.map(c => c.cropType === 'mealwood' ? { ...c, count: mealwoodCount } : c);
      } else {
        newCrops.push(createCropObject('mealwood', mealwoodCount));
      }
      setCrops(newCrops);

      let newRanches = [...ranches];
      if (newRanches.some(r => r.critterType === 'squid')) {
        newRanches = newRanches.map(r => r.critterType === 'squid' ? { ...r, count: squidCount } : r);
      } else {
        newRanches.push({ critterType: 'squid', count: squidCount, ranchState: 'happy' });
      }
      setRanches(newRanches);

    } else if (mapping.type === 'crop') {
      const actualCal = src.calCycle * plantSpeed;
      const countRequired = Math.ceil(totalCaloriesNeeded / actualCal) || 8;
      const exists = crops.some(c => c.cropType === mapping.key);
      if (exists) {
        setCrops(crops.map(c => c.cropType === mapping.key ? { ...c, count: countRequired } : c));
      } else {
        setCrops([...crops, createCropObject(mapping.key, countRequired)]);
      }
    } else if (mapping.type === 'critter') {
      const actualCal = src.calCycle;
      const countRequired = Math.ceil(totalCaloriesNeeded / actualCal) || 8;
      const exists = ranches.some(r => r.critterType === mapping.key);
      if (exists) {
        setRanches(ranches.map(r => r.critterType === mapping.key ? { ...r, count: countRequired } : r));
      } else {
        setRanches([...ranches, { critterType: mapping.key, count: countRequired, ranchState: 'happy' }]);
      }
    }
  };

  // Presets mapping
  const presets = [
    { label: 'Easy Mode (500 kcal)', value: '500', description: 'Duplicants consume half the standard calories.' },
    { label: 'Standard (1000 kcal)', value: '1000', description: 'Default consumption for standard Duplicants.' },
    { label: 'Glutton / Hard (1500 kcal)', value: '1500', description: 'Bottomless Stomach trait or harder difficulty settings.' },
    { label: 'Custom Intake', value: 'custom', description: 'Set a custom calorie intake target.' }
  ];



  // Adjust crop math based on Growth Mode
  const growthModifiers = useMemo(() => {
    switch (growthMode) {
      case 'farmerTouch':
        return { plantSpeed: 2.0, inputCost: 1.0 }; // Farmer's Touch doubles speed, input per plant remains standard per cycle
      case 'wild':
        return { plantSpeed: 0.25, inputCost: 0.0 }; // Wild crops grow 4x slower but require absolutely zero inputs
      case 'domesticated':
      default:
        return { plantSpeed: 1.0, inputCost: 1.0 };
    }
  }, [growthMode]);

  // Handle Percentage Changes inside the Diet Mixer
  const handleMixPercentageChange = (key, newVal) => {
    setMixPercentages(current => {
      const activeKeys = Object.keys(addedToDiet).filter(k => addedToDiet[k]);
      return adjustPercentages(current, activeKeys, lockedPercentages, key, newVal);
    });
  };

  const handleAddFoodToDiet = (srcId) => {
    setAddedToDiet(prev => {
      const nextAdded = { ...prev, [srcId]: true };
      const activeKeys = Object.keys(nextAdded).filter(k => nextAdded[k]);
      setMixPercentages(current => {
        return redistributeOnAddition(srcId, current, activeKeys, lockedPercentages);
      });
      return nextAdded;
    });
  };

  const handleRemoveFoodFromDiet = (srcId) => {
    setAddedToDiet(prev => {
      const nextAdded = { ...prev, [srcId]: false };
      const activeKeys = Object.keys(nextAdded).filter(k => nextAdded[k]);
      setMixPercentages(current => {
        return redistributeOnRemoval(srcId, current, activeKeys, lockedPercentages);
      });
      return nextAdded;
    });
    setLockedPercentages(prev => {
      const nextLocked = { ...prev };
      delete nextLocked[srcId];
      return nextLocked;
    });
    handleRemoveFromFarms(srcId);
  };

  const toggleLock = (srcId) => {
    setLockedPercentages(prev => ({
      ...prev,
      [srcId]: !prev[srcId]
    }));
  };

  const handleEqualizeDiet = () => {
    const activeKeys = Object.keys(addedToDiet).filter(k => addedToDiet[k]);
    if (activeKeys.length === 0) return;

    setMixPercentages(current => {
      const updated = { ...current };
      const unlocked = activeKeys.filter(k => !lockedPercentages[k]);

      if (unlocked.length > 0) {
        const sumLocked = activeKeys.filter(k => lockedPercentages[k]).reduce((sum, k) => sum + (current[k] || 0), 0);
        const remaining = Math.max(0, 100 - sumLocked);
        const share = Math.floor(remaining / unlocked.length);
        
        unlocked.forEach(k => {
          updated[k] = share;
        });

        // Distribute remainder
        let diff = remaining - (share * unlocked.length);
        if (diff > 0) {
          const sorted = [...unlocked].sort((a, b) => (current[b] || 0) - (current[a] || 0));
          if (sorted.length > 0) {
            updated[sorted[0]] += diff;
          }
        }
      } else {
        // All are locked: unlock everything and balance equally
        setLockedPercentages({});
        const share = Math.floor(100 / activeKeys.length);
        activeKeys.forEach(k => {
          updated[k] = share;
        });
        let diff = 100 - (share * activeKeys.length);
        if (diff > 0 && activeKeys.length > 0) {
          updated[activeKeys[0]] += diff;
        }
      }
      return updated;
    });
  };

  const mixTotalPercentage = Object.values(mixPercentages).reduce((sum, v) => sum + v, 0);

  // Core Calculations for Single Source Diet Slide
  const singleSourceAnalysis = useMemo(() => {
    if (activeSlide === 'mixed') return null;

    const src = calorieSources[activeSlide];
    if (!src) return null;

    const isDehydrated = !!dehydratedFoods[activeSlide];
    const isSpiced = !!spicedFoods[activeSlide];
    const isRehydrated = isDehydrated && !!rehydratedFoods[activeSlide];

    const spiceCalBoost = isSpiced ? 1.10 : 1.0;

    // Apply growth mode modifiers for crops (critters are always 1.0)
    const plantMult = src.type === 'crop' ? growthModifiers.plantSpeed : 1.0;
    const inputMult = src.type === 'crop' ? growthModifiers.inputCost : 1.0;

    const actualCalPerUnitPerCycle = src.calCycle * plantMult * spiceCalBoost;
    const unitsRequired = Math.ceil(totalCaloriesNeeded / actualCalPerUnitPerCycle);

    // Calculate detailed inputs
    const requiredInputs = src.inputs.map(input => ({
      name: input.name,
      amount: input.amount * unitsRequired * inputMult,
      unit: input.unit
    }));

    // Food Dehydration & Rehydration inputs / outputs
    const productionOutputs = [];
    if (isDehydrated) {
      const recipeCycles = totalCaloriesNeeded / src.calCycle;
      requiredInputs.push({
        name: 'Plastic',
        amount: 0.1 * recipeCycles,
        unit: 'kg'
      });
      requiredInputs.push({
        name: 'Natural Gas',
        amount: 0.02 * recipeCycles,
        unit: 'kg'
      });
      productionOutputs.push({
        name: 'Water',
        amount: 0.05 * recipeCycles,
        unit: 'kg'
      });
    }

    if (isRehydrated) {
      const recipeCycles = totalCaloriesNeeded / src.calCycle;
      requiredInputs.push({
        name: 'Water',
        amount: 0.05 * recipeCycles,
        unit: 'kg'
      });
    }

    if (isSpiced) {
      const recipeCycles = totalCaloriesNeeded / src.calCycle;
      requiredInputs.push({
        name: 'Salt',
        amount: 0.05 * recipeCycles,
        unit: 'kg'
      });
    }

    // Special critter stables count
    let stableDetails = null;
    if (src.type === 'critter') {
      const origCritter = critterData[src.sourceName.toLowerCase()] || CRITTER_DATA[src.sourceName.toLowerCase()];
      const maxSize = origCritter?.maxSize || 8;
      const stablesRequired = Math.ceil(unitsRequired / maxSize);
      stableDetails = {
        maxSize,
        stablesRequired,
        spaceRequired: origCritter?.spaceRequired || 12
      };
    }

    return {
      unitsRequired,
      requiredInputs,
      productionOutputs,
      stableDetails,
      actualCalPerUnitPerCycle
    };
  }, [activeSlide, totalCaloriesNeeded, calorieSources, growthModifiers, critterData, dehydratedFoods, spicedFoods, rehydratedFoods]);

  // Core Calculations for Custom Mixed Diet Slide
  const mixedDietAnalysis = useMemo(() => {
    if (activeSlide !== 'mixed') return null;

    let totalUnits = 0;
    const rawRequirements = {};
    const inputAggregates = {};
    let stablesAggregate = 0;
    let plantsAggregate = 0;

    Object.entries(mixPercentages).forEach(([key, percentage]) => {
      if (percentage <= 0) return;

      const src = calorieSources[key];
      if (!src) return;

      const portionCalories = (percentage / 100) * totalCaloriesNeeded;

      // Crop specific modifier
      const plantMult = src.type === 'crop' ? growthModifiers.plantSpeed : 1.0;
      const inputMult = src.type === 'crop' ? growthModifiers.inputCost : 1.0;

      const actualCalPerUnit = src.calCycle * plantMult;
      const units = Math.ceil(portionCalories / actualCalPerUnit);

      if (units <= 0) return;

      totalUnits += units;
      if (src.type === 'crop') {
        plantsAggregate += units;
      } else {
        const origCritter = critterData[src.sourceName.toLowerCase()] || CRITTER_DATA[src.sourceName.toLowerCase()];
        const maxSize = origCritter?.maxSize || 8;
        stablesAggregate += Math.ceil(units / maxSize);
      }

      rawRequirements[key] = {
        name: src.name,
        unitsRequired: units,
        color: src.color,
        caloriesProvided: units * actualCalPerUnit
      };

      // Aggregates inputs
      src.inputs.forEach(input => {
        const costKey = input.name;
        const totalCost = input.amount * units * inputMult;
        if (!inputAggregates[costKey]) {
          inputAggregates[costKey] = { name: input.name, amount: 0, unit: input.unit };
        }
        inputAggregates[costKey].amount += totalCost;
      });
    });

    return {
      rawRequirements,
      requiredInputs: Object.values(inputAggregates),
      plantsAggregate,
      stablesAggregate,
      totalUnits
    };
  }, [activeSlide, mixPercentages, totalCaloriesNeeded, calorieSources, growthModifiers, critterData]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', height: '100%', overflow: 'hidden' }}>
      
      {/* LEFT COLUMN: DIET DISTRIBUTION OVERVIEW */}
      <div className="panel" style={{ 
        width: '280px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1rem', 
        overflowX: 'hidden', 
        overflowY: 'auto', 
        padding: '0.8rem', 
        flexShrink: 0,
        background: 'var(--oni-panel-bg)',
        borderRight: '1px solid var(--oni-panel-border)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--oni-grid-line-thick)', paddingBottom: '0.5rem' }}>
          <h2 style={{ color: 'var(--oni-accent-oxygen)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0, fontWeight: 'bold', fontFamily: 'var(--oni-font-mono)' }}>
            <Sliders size={16} />
            Diet Distribution
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {Object.values(calorieSources).filter(src => addedToDiet[src.id]).length > 1 && (
              <button
                onClick={handleEqualizeDiet}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  color: 'var(--oni-accent-oxygen)',
                  fontSize: '0.7rem',
                  padding: '0.15rem 0.4rem',
                  cursor: 'pointer',
                  fontFamily: 'var(--oni-font-mono)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                title="Balance all unlocked diet items equally"
              >
                Balance
              </button>
            )}
            <span style={{ 
              fontSize: '0.75rem', 
              background: mixTotalPercentage === 100 ? 'rgba(168, 255, 140, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
              color: mixTotalPercentage === 100 ? 'var(--oni-accent-success)' : 'var(--oni-accent-danger)', 
              padding: '0.15rem 0.4rem', 
              borderRadius: '4px',
              fontFamily: 'var(--oni-font-mono)',
              fontWeight: 'bold'
            }}>
              {mixTotalPercentage}%
            </span>
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {Object.values(calorieSources).filter(src => addedToDiet[src.id]).length === 0 ? (
            <div style={{ 
              color: 'var(--oni-text-muted)', 
              fontSize: '0.8rem', 
              textAlign: 'center', 
              padding: '2.5rem 1rem', 
              fontStyle: 'italic',
              border: '1px dashed var(--oni-panel-border)',
              borderRadius: '6px',
              background: 'rgba(0,0,0,0.1)',
              lineHeight: '1.4'
            }}>
              Your planner is empty.<br /><br />
              Click the <span style={{ color: 'var(--oni-accent-success)', fontWeight: 'bold' }}>+ Add</span> tab on the right to select crop/critter calorie sources.
            </div>
          ) : (
            Object.values(calorieSources).filter(src => addedToDiet[src.id]).map(src => {
              const active = isSourceActiveInFarms(src.id);
              return (
                <div 
                  key={src.id} 
                  style={{ 
                    padding: '0.55rem 0.6rem', 
                    background: 'rgba(0, 0, 0, 0.25)', 
                    borderRadius: '6px', 
                    borderLeft: `4px solid ${src.color}`,
                    borderTop: '1px solid rgba(255, 255, 255, 0.03)',
                    borderRight: '1px solid rgba(255, 255, 255, 0.03)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    transition: 'background 0.2s ease'
                  }}
                >
                  {/* Top Row: Icon + Name + Percentage Badge + Remove Cross */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <img 
                        src={getImageUrl(src.id)} 
                        alt={src.name} 
                        style={{ width: '18px', height: '18px', objectFit: 'contain' }}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--oni-text-primary)' }}>{src.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <button
                        onClick={() => toggleLock(src.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: lockedPercentages[src.id] ? 'var(--oni-accent-oxygen)' : 'var(--oni-text-muted)',
                          cursor: 'pointer',
                          padding: '0.1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: lockedPercentages[src.id] ? 1 : 0.4,
                          transition: 'opacity 0.15s ease, color 0.15s ease'
                        }}
                        title={lockedPercentages[src.id] ? "Unlock diet percentage" : "Lock diet percentage"}
                        onMouseEnter={(e) => { if (!lockedPercentages[src.id]) e.currentTarget.style.opacity = 0.8; }}
                        onMouseLeave={(e) => { if (!lockedPercentages[src.id]) e.currentTarget.style.opacity = 0.4; }}
                      >
                        {lockedPercentages[src.id] ? <Lock size={12} /> : <Unlock size={12} />}
                      </button>
                      <span style={{ fontFamily: 'var(--oni-font-mono)', fontWeight: 'bold', color: src.color, fontSize: '0.8rem' }}>
                        {mixPercentages[src.id]}%
                      </span>
                      <button 
                        onClick={() => handleRemoveFoodFromDiet(src.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--oni-accent-danger)',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          padding: '0 0.15rem',
                          opacity: 0.6,
                          transition: 'opacity 0.15s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Remove from diet planner"
                        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = 0.6}
                      >
                        ✖
                      </button>
                    </div>
                  </div>

                  {/* Slider Row */}
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    step="1"
                    value={mixPercentages[src.id]} 
                    onChange={(e) => handleMixPercentageChange(src.id, parseInt(e.target.value) || 0)}
                    style={{ cursor: 'pointer', height: '6px', margin: '0.2rem 0' }}
                  />

                  {/* Stats & Add/Remove Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '0.3rem', marginTop: '0.1rem' }}>
                    {/* Target kcal stats */}
                    <div style={{ fontSize: '0.65rem', color: 'var(--oni-text-muted)', lineHeight: '1.2' }}>
                      {mixPercentages[src.id] > 0 && mixedDietAnalysis?.rawRequirements[src.id] ? (
                        <div>
                          <span style={{ fontWeight: 'bold', color: 'var(--oni-text-primary)' }}>{(mixPercentages[src.id] / 100 * totalCaloriesNeeded / 1000).toFixed(0)}k kcal </span>
                          <span>({mixedDietAnalysis.rawRequirements[src.id].unitsRequired} {src.type === 'crop' ? 'pl' : 'cr'})</span>
                        </div>
                      ) : (
                        <span style={{ fontStyle: 'italic', opacity: 0.5 }}>0 kcal</span>
                      )}
                    </div>

                    {/* Send / Remove Button */}
                    <button
                      onClick={() => active ? handleRemoveFromFarms(src.id) : handleSendToFarms(src.id)}
                      style={{
                        padding: '0.15rem 0.4rem',
                        fontSize: '0.65rem',
                        borderRadius: '3px',
                        border: '1px solid var(--oni-panel-border)',
                        background: active ? 'rgba(239, 68, 68, 0.12)' : 'rgba(168, 255, 140, 0.12)',
                        color: active ? 'var(--oni-accent-danger)' : 'var(--oni-accent-success)',
                        cursor: 'pointer',
                        fontFamily: 'var(--oni-font-mono)',
                        transition: 'all 0.15s ease',
                        height: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.15rem'
                      }}
                    >
                      {active ? '✖ Remove' : '✚ Send'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: CALORIE SOURCE VIEW & CAROUSEL */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
        
        {/* Slides Selector / Navigation Bar */}
        <div className="tabs-container" style={{ margin: '0', display: 'flex', overflowX: 'auto', overflowY: 'visible', borderBottom: '2px solid var(--oni-panel-border)', paddingBottom: '0.4rem', gap: '0.6rem', alignItems: 'center' }}>
          
          {/* Diet Summary Tab (Far Left) */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
              onMouseEnter={() => setHoveredTabId('mixed')}
              onMouseLeave={() => setHoveredTabId(null)}
              onClick={() => setActiveSlide('mixed')}
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.45)',
                backdropFilter: 'blur(8px)',
                border: `2px solid ${activeSlide === 'mixed' ? 'var(--oni-accent-oxygen)' : 'rgba(255,255,255,0.2)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: activeSlide === 'mixed' ? '0 0 12px var(--oni-accent-oxygen)66, inset 0 0 8px rgba(255,255,255,0.05)' : 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                padding: '6px',
                flexShrink: 0,
                transform: hoveredTabId === 'mixed' ? 'scale(1.08)' : 'scale(1)'
              }}
            >
              <Compass size={22} style={{ color: 'var(--oni-accent-oxygen)' }} />
            </button>
            
            {/* Customize Hover Modal Card */}
            {hoveredTabId === 'mixed' && (
              <div style={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginBottom: '12px',
                background: 'rgba(20, 24, 33, 0.96)',
                backdropFilter: 'blur(12px)',
                border: '1.5px solid var(--oni-accent-oxygen)',
                color: 'var(--oni-text-primary)',
                padding: '0.6rem 0.8rem',
                borderRadius: '8px',
                width: '200px',
                zIndex: 100,
                boxShadow: '0 8px 24px rgba(0,0,0,0.6), inset 0 0 10px rgba(255,255,255,0.05)',
                pointerEvents: 'none',
                fontFamily: 'var(--oni-font-mono)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                animation: 'fadeIn 0.15s ease-out'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '0',
                  height: '0',
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderTop: '6px solid var(--oni-accent-oxygen)'
                }} />
                
                <div style={{ fontWeight: 'bold', color: 'var(--oni-accent-oxygen)', fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.2rem' }}>Diet Summary</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--oni-text-muted)', lineHeight: '1.25', fontStyle: 'italic', fontWeight: 'normal', fontFamily: 'sans-serif' }}>
                  View complete structural aggregates and colony demands.
                </div>
              </div>
            )}
          </div>

          {/* Diet Crop Tabs (Center) */}
          {activeTabsList.map(src => (
            <div 
              key={src.id} 
              style={{ position: 'relative', display: 'inline-block' }}
              onMouseEnter={() => setHoveredTabId(src.id)}
              onMouseLeave={() => setHoveredTabId(null)}
            >
              <button
                onClick={() => setActiveSlide(src.id)}
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.45)',
                  backdropFilter: 'blur(8px)',
                  border: `2px solid ${activeSlide === src.id ? src.color : 'rgba(255,255,255,0.2)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: activeSlide === src.id ? `0 0 12px ${src.color}66, inset 0 0 8px rgba(255,255,255,0.05)` : 'none',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  padding: '6px',
                  flexShrink: 0,
                  transform: hoveredTabId === src.id ? 'scale(1.08)' : 'scale(1)'
                }}
              >
                <img 
                  src={getImageUrl(src.id)} 
                  alt={src.name} 
                  style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                  onError={(e) => { e.currentTarget.src = '/data/images/Creature.png'; }}
                />
              </button>

              {/* Close Button overlay */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFoodFromDiet(src.id);
                }}
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: '#EF4444',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#FFFFFF',
                  fontSize: '9px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                  opacity: hoveredTabId === src.id ? 1 : 0,
                  transition: 'opacity 0.15s ease',
                  zIndex: 10
                }}
                title="Remove from diet planner"
              >
                ✖
              </button>
              
              {/* Rich Hover Modal Card */}
              {hoveredTabId === src.id && (
                <div style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginBottom: '12px',
                  background: 'rgba(20, 24, 33, 0.96)',
                  backdropFilter: 'blur(12px)',
                  border: `1.5px solid ${src.color}`,
                  color: 'var(--oni-text-primary)',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '8px',
                  width: '200px',
                  zIndex: 100,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.6), inset 0 0 10px rgba(255,255,255,0.05)',
                  pointerEvents: 'none',
                  fontFamily: 'var(--oni-font-mono)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  animation: 'fadeIn 0.15s ease-out'
                }}>
                  {/* Small downward pointing chevron */}
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '0',
                    height: '0',
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: `6px solid ${src.color}`
                  }} />
                  
                  <div style={{ fontWeight: 'bold', color: src.color, fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.2rem' }}>{src.name}</div>
                  
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', color: 'var(--oni-text-muted)' }}>{src.tier}</span>
                    <span style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem', borderRadius: '3px', background: `${src.color}20`, color: src.color }}>{src.efficiency} Eff.</span>
                  </div>
                  
                  <div style={{ fontSize: '0.65rem', color: 'var(--oni-text-muted)', lineHeight: '1.25', fontStyle: 'italic', fontWeight: 'normal', fontFamily: 'sans-serif' }}>
                    {src.description}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* Add Tab (Far Right) */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
              onMouseEnter={() => setHoveredTabId('add')}
              onMouseLeave={() => setHoveredTabId(null)}
              onClick={() => setActiveSlide('add')}
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.45)',
                backdropFilter: 'blur(8px)',
                border: `2px solid ${activeSlide === 'add' ? 'var(--oni-accent-success)' : 'rgba(255,255,255,0.2)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: activeSlide === 'add' ? '0 0 12px var(--oni-accent-success)66, inset 0 0 8px rgba(255,255,255,0.05)' : 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                padding: '6px',
                flexShrink: 0,
                transform: hoveredTabId === 'add' ? 'scale(1.08)' : 'scale(1)'
              }}
            >
              <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--oni-accent-success)', lineHeight: '1' }}>+</span>
            </button>
            
            {/* Add Tab Hover Modal Card */}
            {hoveredTabId === 'add' && (
              <div style={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginBottom: '12px',
                background: 'rgba(20, 24, 33, 0.96)',
                backdropFilter: 'blur(12px)',
                border: '1.5px solid var(--oni-accent-success)',
                color: 'var(--oni-text-primary)',
                padding: '0.6rem 0.8rem',
                borderRadius: '8px',
                width: '200px',
                zIndex: 100,
                boxShadow: '0 8px 24px rgba(0,0,0,0.6), inset 0 0 10px rgba(255,255,255,0.05)',
                pointerEvents: 'none',
                fontFamily: 'var(--oni-font-mono)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                animation: 'fadeIn 0.15s ease-out'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '0',
                  height: '0',
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderTop: '6px solid var(--oni-accent-success)'
                }} />
                
                <div style={{ fontWeight: 'bold', color: 'var(--oni-accent-success)', fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.2rem' }}>Add Calorie Source</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--oni-text-muted)', lineHeight: '1.25', fontStyle: 'italic', fontWeight: 'normal', fontFamily: 'sans-serif' }}>
                  Select additional crops and critters to add to your plan.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MAIN SLIDE CONTAINER */}
        <div className="panel" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* SLIDE A: INDIVIDUAL CALORIE SOURCE DETAIL */}
          {activeSlide !== 'mixed' && activeSlide !== 'add' && singleSourceAnalysis && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
              
              {/* Header Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', borderBottom: '1px solid var(--oni-grid-line-thick)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: `2px solid ${calorieSources[activeSlide].color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6px',
                    boxShadow: `0 0 12px ${calorieSources[activeSlide].color}30`,
                    flexShrink: 0
                  }}>
                    <img 
                      src={getImageUrl(calorieSources[activeSlide].id)} 
                      alt={calorieSources[activeSlide].name} 
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      onError={(e) => { e.currentTarget.src = '/data/images/Creature.png'; }}
                    />
                  </div>
                  <div>
                    <h3 style={{ color: calorieSources[activeSlide].color, fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', margin: 0 }}>
                      {calorieSources[activeSlide].name} 
                      <span style={{ 
                        fontSize: '0.75rem', 
                        background: 'rgba(255, 255, 255, 0.1)', 
                        color: 'var(--oni-text-primary)', 
                        padding: '0.15rem 0.5rem', 
                        borderRadius: '4px',
                        textTransform: 'capitalize',
                        fontFamily: 'var(--oni-font-mono)'
                      }}>
                        {calorieSources[activeSlide].type}
                      </span>
                    </h3>
                    <p style={{ color: 'var(--oni-text-muted)', fontSize: '0.85rem', maxWidth: '650px', margin: 0 }}>
                      {calorieSources[activeSlide].description}
                    </p>
                  </div>
                </div>

                {/* KPI stats */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--oni-panel-border)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--oni-text-muted)', textTransform: 'uppercase' }}>Structure Name</div>
                    <div style={{ fontFamily: 'var(--oni-font-mono)', fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--oni-accent-oxygen)' }}>
                      {calorieSources[activeSlide].sourceName}
                    </div>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--oni-panel-border)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--oni-text-muted)', textTransform: 'uppercase' }}>Efficiency Class</div>
                    <div style={{ fontFamily: 'var(--oni-font-mono)', fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--oni-accent-success)' }}>
                      {calorieSources[activeSlide].efficiency}
                    </div>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--oni-panel-border)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--oni-text-muted)', textTransform: 'uppercase' }}>Base Cal Density</div>
                    <div style={{ fontFamily: 'var(--oni-font-mono)', fontSize: '0.95rem', fontWeight: 'bold' }}>
                      {singleSourceAnalysis.actualCalPerUnitPerCycle.toFixed(0)} <span style={{ fontSize: '0.75rem', color: 'var(--oni-text-muted)' }}>kcal/c</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Central Details Card Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                
                {/* Structure Requirements Panel */}
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--oni-panel-border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--oni-accent-oxygen)', display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px dashed var(--oni-grid-line-thick)', paddingBottom: '0.4rem', margin: '0' }}>
                    <Compass size={16} /> Required Structures
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span className="stat-label">Structure Required:</span>
                      <span style={{ fontSize: '1.3rem', fontWeight: 'bold', fontFamily: 'var(--oni-font-mono)', color: calorieSources[activeSlide].color }}>
                        {singleSourceAnalysis.unitsRequired} <span style={{ fontSize: '0.8rem', color: 'var(--oni-text-muted)', fontWeight: 'normal' }}>{calorieSources[activeSlide].type === 'crop' ? 'plants' : 'critters'}</span>
                      </span>
                    </div>

                    {/* Stables Breakdown for Critters */}
                    {singleSourceAnalysis.stableDetails && (
                      <div style={{ background: 'rgba(127,191,255,0.05)', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(127,191,255,0.15)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.4rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Max critters per stable:</span>
                          <span style={{ fontWeight: 'bold', fontFamily: 'var(--oni-font-mono)' }}>{singleSourceAnalysis.stableDetails.maxSize}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--oni-accent-oxygen)' }}>
                          <span>Est. 96-tile Stables needed:</span>
                          <span style={{ fontWeight: 'bold', fontFamily: 'var(--oni-font-mono)' }}>{singleSourceAnalysis.stableDetails.stablesRequired} stables</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Total stable room size:</span>
                          <span style={{ fontWeight: 'bold', fontFamily: 'var(--oni-font-mono)' }}>{singleSourceAnalysis.stableDetails.stablesRequired * 96} tiles</span>
                        </div>
                      </div>
                    )}

                    {/* Greenhouse Details for Crops */}
                    {calorieSources[activeSlide].type === 'crop' && (
                      <div style={{ background: 'rgba(168,255,140,0.05)', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(168,255,140,0.15)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.4rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Farming Style:</span>
                          <span style={{ fontWeight: 'bold', textTransform: 'capitalize', color: 'var(--oni-accent-success)' }}>
                            {growthMode === 'farmerTouch' ? "Farmer's Touch (2x Speed)" : growthMode === 'wild' ? 'Wild (0.25x Speed)' : 'Domesticated (Standard)'}
                          </span>
                        </div>
                        {growthMode !== 'wild' && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Greenhouses Required:</span>
                            <span style={{ fontWeight: 'bold', fontFamily: 'var(--oni-font-mono)' }}>
                              {Math.ceil(singleSourceAnalysis.unitsRequired / 22)} <span style={{ fontSize: '0.7rem', color: 'var(--oni-text-muted)' }}>(assuming 96-tile room)</span>
                            </span>
                          </div>
                        )}
                        {growthMode === 'wild' && (
                          <div style={{ display: 'flex', justifyItems: 'center', gap: '0.25rem', color: 'var(--oni-accent-calorie)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                            <Info size={12} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>Wild crops take 4x longer to grow but consume absolutely 0 resources. Excellent for hands-off colonies!</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Recipe Ingredients Panel */}
                {RECIPE_INGREDIENTS[calorieSources[activeSlide].id] && (
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--oni-panel-border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--oni-accent-success)', display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px dashed var(--oni-grid-line-thick)', paddingBottom: '0.4rem', margin: '0' }}>
                      <Sparkles size={16} /> Recipe Ingredients
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                      {RECIPE_INGREDIENTS[calorieSources[activeSlide].id].map((ing, idx) => (
                        <div key={idx} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          background: 'rgba(255, 255, 255, 0.03)', 
                          padding: '0.5rem 0.75rem', 
                          borderRadius: '4px', 
                          border: '1px solid var(--oni-panel-border)' 
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <img 
                              src={getImageUrl(formatResourceName(ing.name))} 
                              alt={formatResourceName(ing.name)} 
                              style={{ width: '18px', height: '18px', objectFit: 'contain' }}
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <span style={{ fontSize: '0.85rem' }}>{formatResourceName(ing.name)}</span>
                          </div>
                          <span style={{ fontFamily: 'var(--oni-font-mono)', fontWeight: 'bold', color: 'var(--oni-accent-success)', fontSize: '0.9rem' }}>
                            {ing.amount} {ing.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Overall Required Resources */}
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--oni-panel-border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--oni-accent-calorie)', display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px dashed var(--oni-grid-line-thick)', paddingBottom: '0.4rem', margin: '0' }}>
                    <Droplet size={16} /> Daily Resource Inputs
                  </h4>
                  {singleSourceAnalysis.requiredInputs.length === 0 || growthMode === 'wild' ? (
                    <div style={{ 
                      flex: 1, 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      color: 'var(--oni-accent-success)', 
                      fontSize: '0.85rem',
                      fontStyle: 'italic',
                      fontWeight: 'bold',
                      background: 'rgba(168, 255, 140, 0.05)',
                      border: '1px dashed rgba(168, 255, 140, 0.25)',
                      borderRadius: '6px',
                      padding: '1rem',
                      textAlign: 'center'
                    }}>
                      ✔ Zero ongoing resources required! Free calories.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                      {singleSourceAnalysis.requiredInputs.map((input, idx) => (
                        <div key={idx} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          background: 'rgba(255, 255, 255, 0.03)', 
                          padding: '0.5rem 0.75rem', 
                          borderRadius: '4px', 
                          border: '1px solid var(--oni-panel-border)' 
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <img 
                              src={getImageUrl(formatResourceName(input.name))} 
                              alt={formatResourceName(input.name)} 
                              style={{ width: '18px', height: '18px', objectFit: 'contain' }}
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <span style={{ fontSize: '0.85rem' }}>{formatResourceName(input.name)}</span>
                          </div>
                          <span style={{ fontFamily: 'var(--oni-font-mono)', fontWeight: 'bold', color: 'var(--oni-accent-danger)', fontSize: '0.9rem' }}>
                            {input.amount.toLocaleString(undefined, { maximumFractionDigits: 1 })} {input.unit}/c
                          </span>
                        </div>
                      ))}

                      {/* Dehydration / Preservation Outputs */}
                      {singleSourceAnalysis.productionOutputs && singleSourceAnalysis.productionOutputs.length > 0 && (
                        <div style={{ marginTop: '0.4rem', borderTop: '1px dashed var(--oni-grid-line)', paddingTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--oni-accent-success)', letterSpacing: '0.5px', fontWeight: 'bold', fontFamily: 'var(--oni-font-mono)' }}>Production Outputs</span>
                          {singleSourceAnalysis.productionOutputs.map((out, idx) => (
                            <div key={idx} style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center', 
                              background: 'rgba(168, 255, 140, 0.05)', 
                              padding: '0.4rem 0.6rem', 
                              borderRadius: '4px', 
                              border: '1px solid rgba(168, 255, 140, 0.2)' 
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <img 
                                  src={getImageUrl(formatResourceName(out.name))} 
                                  alt={formatResourceName(out.name)} 
                                  style={{ width: '16px', height: '16px', objectFit: 'contain' }}
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                                <span style={{ fontSize: '0.8rem', color: 'var(--oni-text-primary)' }}>{formatResourceName(out.name)}</span>
                              </div>
                              <span style={{ fontFamily: 'var(--oni-font-mono)', fontWeight: 'bold', color: 'var(--oni-accent-success)', fontSize: '0.85rem' }}>
                                +{out.amount.toLocaleString(undefined, { maximumFractionDigits: 1 })} {out.unit}/c
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Dynamic cooking station warning card */}
                      {calorieSources[activeSlide].isCooked && (
                        <div style={{ display: 'flex', gap: '0.4rem', color: 'var(--oni-text-muted)', fontSize: '0.75rem', background: 'rgba(0,0,0,0.15)', padding: '0.4rem', borderRadius: '4px', marginTop: 'auto' }}>
                          <Flame size={12} style={{ flexShrink: 0, color: 'var(--oni-accent-calorie)' }} />
                          <span>Requires {calorieSources[activeSlide].station || 'Electric Grill'} and a skilled Duplicant to cook/process this supply.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Food Processing & Preservation panel */}
                {calorieSources[activeSlide].isCooked && (
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--oni-panel-border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--oni-accent-success)', display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px dashed var(--oni-grid-line-thick)', paddingBottom: '0.4rem', margin: '0' }}>
                      <Sparkles size={16} /> Preservation & Enhancements
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8rem', flex: 1, justifyContent: 'center' }}>
                      {/* Spice Grinder Toggle */}
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--oni-text-primary)' }}>
                        <input 
                          type="checkbox" 
                          checked={!!spicedFoods[activeSlide]} 
                          onChange={(e) => setSpicedFoods(prev => ({ ...prev, [activeSlide]: e.target.checked }))}
                          style={{ cursor: 'pointer' }}
                        />
                        <span>🌶️ Apply Spice Grinder (+10% calorie savings, consumes Salt)</span>
                      </label>

                      {/* Dehydrator Toggle */}
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--oni-text-primary)' }}>
                        <input 
                          type="checkbox" 
                          checked={!!dehydratedFoods[activeSlide]} 
                          onChange={(e) => {
                            const val = e.target.checked;
                            setDehydratedFoods(prev => ({ ...prev, [activeSlide]: val }));
                            if (!val) {
                              setRehydratedFoods(prev => ({ ...prev, [activeSlide]: false }));
                            }
                          }}
                          style={{ cursor: 'pointer' }}
                        />
                        <span>📦 Dehydrate for Space Travel (consumes Plastic & Gas)</span>
                      </label>

                      {/* Rehydrator Toggle */}
                      {dehydratedFoods[activeSlide] && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', paddingLeft: '1.2rem', color: 'var(--oni-text-primary)' }}>
                          <input 
                            type="checkbox" 
                            checked={!!rehydratedFoods[activeSlide]} 
                            onChange={(e) => setRehydratedFoods(prev => ({ ...prev, [activeSlide]: e.target.checked }))}
                            style={{ cursor: 'pointer' }}
                          />
                          <span>💧 Rehydrate for Eating (consumes Water, -1 Morale)</span>
                        </label>
                      )}
                    </div>

                    {/* Dynamic Preservation Badges */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px dashed rgba(255,255,255,0.06)' }}>
                      {spicedFoods[activeSlide] && (
                        <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(255, 162, 104, 0.12)', color: 'var(--oni-accent-calorie)', border: '1px solid rgba(255, 162, 104, 0.25)', fontWeight: 'bold', fontFamily: 'var(--oni-font-mono)' }}>
                          Buff: +2 Athletics
                        </span>
                      )}
                      {dehydratedFoods[activeSlide] && !rehydratedFoods[activeSlide] && (
                        <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(168, 255, 140, 0.12)', color: 'var(--oni-accent-success)', border: '1px solid rgba(168, 255, 140, 0.25)', fontWeight: 'bold', fontFamily: 'var(--oni-font-mono)' }}>
                          Status: Shelf-Stable
                        </span>
                      )}
                      {dehydratedFoods[activeSlide] && rehydratedFoods[activeSlide] && (
                        <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.12)', color: 'var(--oni-accent-danger)', border: '1px solid rgba(239, 68, 68, 0.25)', fontWeight: 'bold', fontFamily: 'var(--oni-font-mono)' }}>
                          Morale: -1 Penalty
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* BLUEPRINT GRID VISUALIZER */}
              <div style={{ flex: 1, minHeight: '160px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--oni-text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: '0' }}>
                  <Sparkles size={16} style={{ color: 'var(--oni-accent-oxygen)' }} />
                  Colony Farm Blueprint Visualizer ({singleSourceAnalysis.unitsRequired} {calorieSources[activeSlide].type === 'crop' ? 'Plants' : 'Critters'})
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--oni-text-muted)', margin: '0 0 0.25rem 0' }}>
                  A visual representation of the footprint of the layout. Each square represents a single farming tile or stable critter slot.
                </p>

                <div style={{ 
                  flex: 1, 
                  background: 'rgba(0, 0, 0, 0.4)', 
                  border: '2px dashed var(--oni-grid-line-thick)', 
                  borderRadius: '8px', 
                  padding: '1.25rem',
                  display: 'flex',
                  alignContent: 'flex-start',
                  justifyContent: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '0.35rem',
                  overflowY: 'auto',
                  maxHeight: '260px'
                }}>
                  {Array.from({ length: Math.min(180, singleSourceAnalysis.unitsRequired) }).map((_, idx) => (
                    <div 
                      key={idx}
                      title={`Structure #${idx + 1}`}
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '4px',
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: `1px solid ${calorieSources[activeSlide].color}40`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2px',
                        transition: 'transform 0.15s ease, border-color 0.15s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => { 
                        e.currentTarget.style.transform = 'scale(1.25)';
                        e.currentTarget.style.borderColor = calorieSources[activeSlide].color;
                      }}
                      onMouseLeave={(e) => { 
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.borderColor = `${calorieSources[activeSlide].color}40`;
                      }}
                    >
                      <img 
                        src={getImageUrl(calorieSources[activeSlide].type === 'crop' ? calorieSources[activeSlide].sourceName : calorieSources[activeSlide].id)} 
                        alt="" 
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                  ))}
                  {singleSourceAnalysis.unitsRequired > 180 && (
                    <div style={{ 
                      fontSize: '0.8rem', 
                      color: 'var(--oni-text-muted)', 
                      padding: '0.1rem 0.5rem', 
                      background: 'rgba(0,0,0,0.5)',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      fontFamily: 'var(--oni-font-mono)'
                    }}>
                      + {singleSourceAnalysis.unitsRequired - 180} more units (scale exceeds container)
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* SLIDE B: CUSTOM DIET MIXER PANEL */}
          {activeSlide === 'mixed' && mixedDietAnalysis && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
              
              {/* Header Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ color: 'var(--oni-accent-oxygen)', fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    Custom Diet Plan Summary
                    <span style={{ 
                      fontSize: '0.75rem', 
                      background: mixTotalPercentage === 100 ? 'rgba(168, 255, 140, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
                      color: mixTotalPercentage === 100 ? 'var(--oni-accent-success)' : 'var(--oni-accent-danger)', 
                      padding: '0.15rem 0.5rem', 
                      borderRadius: '4px',
                      fontFamily: 'var(--oni-font-mono)',
                      fontWeight: 'bold'
                    }}>
                      {mixTotalPercentage}% / 100%
                    </span>
                  </h3>
                  <p style={{ color: 'var(--oni-text-muted)', fontSize: '0.9rem', maxWidth: '650px', margin: 0 }}>
                    Overview of the colony-wide aggregates and resource demands required to support your current custom diet distribution.
                  </p>
                </div>

                {/* Indicator Alerts */}
                {mixTotalPercentage < 100 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--oni-accent-calorie)', background: 'rgba(255,162,104,0.1)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(255,162,104,0.25)', fontSize: '0.8rem' }}>
                    <ShieldAlert size={16} />
                    <span>Diet is incomplete. Total percentage is {mixTotalPercentage}%. Use sliders on the left to fill to 100%.</span>
                  </div>
                )}
              </div>

              {/* Mixed Diet Outputs Aggregates */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', flex: 1 }}>
                
                {/* Structural Summary */}
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--oni-panel-border)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <h4 style={{ fontSize: '0.95rem', color: 'var(--oni-accent-oxygen)', display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px dashed var(--oni-grid-line-thick)', paddingBottom: '0.4rem', margin: '0' }}>
                    <Compass size={16} /> Aggregate Structures
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, justifyContent: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--oni-text-primary)' }}>Total Active Plants:</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'var(--oni-font-mono)', color: 'var(--oni-accent-success)' }}>
                        {mixedDietAnalysis.plantsAggregate} <span style={{ fontSize: '0.75rem', color: 'var(--oni-text-muted)', fontWeight: 'normal' }}>plants</span>
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid var(--oni-grid-line)', paddingTop: '0.75rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--oni-text-primary)' }}>Total Ranches (Stables):</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'var(--oni-font-mono)', color: 'var(--oni-accent-calorie)' }}>
                        {mixedDietAnalysis.stablesAggregate} <span style={{ fontSize: '0.75rem', color: 'var(--oni-text-muted)', fontWeight: 'normal' }}>stables</span>
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid var(--oni-grid-line)', paddingTop: '0.75rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--oni-text-primary)' }}>Total Structures Required:</span>
                      <span style={{ fontSize: '1.3rem', fontWeight: 'bold', fontFamily: 'var(--oni-font-mono)', color: 'var(--oni-accent-oxygen)' }}>
                        {mixedDietAnalysis.totalUnits} <span style={{ fontSize: '0.75rem', color: 'var(--oni-text-muted)', fontWeight: 'normal' }}>active slots</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Planned Diet Breakdown */}
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--oni-panel-border)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <h4 style={{ fontSize: '0.95rem', color: 'var(--oni-accent-success)', display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px dashed var(--oni-grid-line-thick)', paddingBottom: '0.4rem', margin: '0' }}>
                    <Flame size={16} style={{ color: 'var(--oni-accent-success)' }} /> Diet Breakdown
                  </h4>
                  {Object.keys(mixedDietAnalysis.rawRequirements).length === 0 ? (
                    <div style={{ 
                      flex: 1, 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      color: 'var(--oni-text-muted)', 
                      fontSize: '0.8rem',
                      fontStyle: 'italic',
                      textAlign: 'center'
                    }}>
                      No food items added to the planner yet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', overflowY: 'auto', maxHeight: '200px', flex: 1 }}>
                      {Object.entries(mixedDietAnalysis.rawRequirements).map(([key, req]) => (
                        <div key={key} style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.15rem',
                          background: 'rgba(255, 255, 255, 0.02)',
                          padding: '0.4rem 0.6rem',
                          borderRadius: '4px',
                          border: `1px solid ${req.color}25`
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <img 
                                src={getImageUrl(key)} 
                                alt="" 
                                style={{ width: '14px', height: '14px', objectFit: 'contain' }}
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--oni-text-primary)' }}>{req.name}</span>
                            </div>
                            <span style={{ fontFamily: 'var(--oni-font-mono)', fontWeight: 'bold', color: req.color, fontSize: '0.8rem' }}>
                              {mixPercentages[key]}%
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--oni-text-muted)' }}>
                            <span>{(req.caloriesProvided / 1000).toFixed(0)}k kcal/c</span>
                            <span>{req.unitsRequired} {calorieSources[key].type === 'crop' ? 'plants' : 'critters'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Resource Summary */}
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--oni-panel-border)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <h4 style={{ fontSize: '0.95rem', color: 'var(--oni-accent-calorie)', display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px dashed var(--oni-grid-line-thick)', paddingBottom: '0.4rem', margin: '0' }}>
                    <Droplet size={16} /> Colony Resources Required
                  </h4>
                  {mixedDietAnalysis.requiredInputs.length === 0 ? (
                    <div style={{ 
                      flex: 1, 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      color: 'var(--oni-text-muted)', 
                      fontSize: '0.8rem',
                      fontStyle: 'italic',
                      textAlign: 'center'
                    }}>
                      Sliders on the left are currently set to 0% or all active crops are wild.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', overflowY: 'auto', maxHeight: '200px', flex: 1 }}>
                      {mixedDietAnalysis.requiredInputs.map((input, idx) => (
                        <div key={idx} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          background: 'rgba(255, 255, 255, 0.03)', 
                          padding: '0.4rem 0.6rem', 
                          borderRadius: '4px', 
                          border: '1px solid var(--oni-panel-border)' 
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <img 
                              src={getImageUrl(formatResourceName(input.name))} 
                              alt={formatResourceName(input.name)} 
                              style={{ width: '16px', height: '16px', objectFit: 'contain' }}
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <span style={{ fontSize: '0.8rem', color: 'var(--oni-text-primary)' }}>{formatResourceName(input.name)}</span>
                          </div>
                          <span style={{ fontFamily: 'var(--oni-font-mono)', fontWeight: 'bold', color: 'var(--oni-accent-danger)', fontSize: '0.85rem' }}>
                            {input.amount.toLocaleString(undefined, { maximumFractionDigits: 1 })} {input.unit}/c
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* SLIDE C: ADD FOOD TO DIET OVERVIEW PANEL */}
          {activeSlide === 'add' && (() => {
            const FOOD_ITEM_CALORIES = {
              mealwood: 600,
              bristleBlossom: 1600,
              gristleBerry: 2000,
              duskCap: 2400,
              friedMushroom: 2800,
              sleetWheat: 360,
              frostBun: 1200,
              barbecue: 4000,
              pacuSeafood: 1600,
              mushBar: 800,
              mushFry: 1050,
              liceLoaf: 1700,
              berrySludge: 4000,
              surfAndTurf: 6000,
              pickledMeal: 1800,
              omelette: 2800,
              pepperBread: 4000,
              stuffedBerry: 4000,
              mushroomWrap: 3000,
              frostBurger: 6000,
              grubfruitPreserves: 3200,
              smokedFish: 1600,
              veggiePoppers: 2000,
              tenderBrisket: 4000,
              deepFriedFish: 2000,
              deepFriedShellfish: 2400,
              makiSushi: 3600,
              nigiriSushi: 4000
            };

            const dlcLabels = {
              'EXPANSION1': 'Spaced Out!',
              'DLC2': 'Bionic',
              'DLC4': 'Smoker',
              'DLC5': 'Aquatic'
            };

            const dlcColors = {
              'EXPANSION1': 'var(--oni-accent-oxygen)',
              'DLC2': '#FFAE19',
              'DLC4': '#D475FF',
              'DLC5': '#3BE8B0'
            };

            const efficiencyOrder = { 'Very Low': 0, 'Low': 1, 'Medium': 2, 'High': 3, 'Very High': 4, 'Extreme': 5 };

            const handleToggleDietSource = (srcId) => {
              const added = addedToDiet[srcId];
              if (!added) {
                handleAddFoodToDiet(srcId);
              } else {
                handleRemoveFoodFromDiet(srcId);
              }
            };

            const filteredSources = Object.values(calorieSources).filter(src => {
              const matchesSearch = !addSearchText || 
                src.name.toLowerCase().includes(addSearchText.toLowerCase()) || 
                src.station.toLowerCase().includes(addSearchText.toLowerCase());

              const matchesDlc = addFilterDlc === 'all' || 
                (addFilterDlc === 'base' ? src.dlc === null : src.dlc !== null);

              return matchesSearch && matchesDlc;
            });

            const sortedSources = [...filteredSources].sort((a, b) => {
              let comparison = 0;
              
              if (addSortBy === 'name') {
                comparison = a.name.localeCompare(b.name);
              } else if (addSortBy === 'kcal') {
                const kcalA = FOOD_ITEM_CALORIES[a.id] || a.calCycle;
                const kcalB = FOOD_ITEM_CALORIES[b.id] || b.calCycle;
                comparison = kcalA - kcalB;
              } else if (addSortBy === 'efficiency') {
                const effA = efficiencyOrder[a.efficiency] ?? 0;
                const effB = efficiencyOrder[b.efficiency] ?? 0;
                comparison = effA - effB;
              } else {
                // type sorting: sort by type first, then by name
                const typeOrder = { 'crop': 0, 'critter': 1, 'prepared': 2 };
                const typeA = typeOrder[a.type] ?? 99;
                const typeB = typeOrder[b.type] ?? 99;
                if (typeA !== typeB) {
                  comparison = typeA - typeB;
                } else {
                  comparison = a.name.localeCompare(b.name);
                }
              }

              return addSortDirection === 'asc' ? comparison : -comparison;
            });

            const renderFoodRow = (src) => {
              const added = addedToDiet[src.id];
              const itemKcal = FOOD_ITEM_CALORIES[src.id] || src.calCycle;

              return (
                <div
                  key={src.id}
                  onClick={() => handleToggleDietSource(src.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.35rem 0.5rem',
                    background: added ? `${src.color}12` : 'rgba(0,0,0,0.2)',
                    borderRadius: '5px',
                    border: added ? `1px solid ${src.color}50` : '1px solid rgba(255,255,255,0.05)',
                    transition: 'all 0.15s ease',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = added ? `${src.color}22` : 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.borderColor = added ? `${src.color}80` : 'rgba(255,255,255,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = added ? `${src.color}12` : 'rgba(0,0,0,0.2)';
                    e.currentTarget.style.borderColor = added ? `${src.color}50` : '1px solid rgba(255,255,255,0.05)';
                  }}
                >
                  {/* Icon */}
                  <img
                    src={getImageUrl(src.id)}
                    alt={src.name}
                    style={{ width: '22px', height: '22px', objectFit: 'contain', flexShrink: 0 }}
                    onError={(e) => { e.currentTarget.src = '/data/images/Creature.png'; }}
                  />

                  {/* Name + badges */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: added ? src.color : 'var(--oni-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {src.name}
                    </div>
                    <div style={{ display: 'flex', gap: '0.2rem', marginTop: '0.1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.55rem', padding: '0.05rem 0.2rem', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', color: 'var(--oni-text-muted)', fontFamily: 'var(--oni-font-mono)' }}>{src.station}</span>
                      <span style={{ fontSize: '0.55rem', padding: '0.05rem 0.2rem', borderRadius: '2px', background: `${src.color}18`, color: src.color, fontFamily: 'var(--oni-font-mono)' }}>{src.efficiency}</span>
                      {src.dlc && (
                        <span style={{
                          fontSize: '0.55rem',
                          padding: '0.05rem 0.2rem',
                          borderRadius: '2px',
                          background: `${dlcColors[src.dlc] || '#888888'}18`,
                          color: dlcColors[src.dlc] || '#888888',
                          border: `1px solid ${dlcColors[src.dlc] || '#888888'}33`,
                          fontFamily: 'var(--oni-font-mono)',
                          fontWeight: 'bold'
                        }}>
                          {dlcLabels[src.dlc] || src.dlc}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* kcal and kcal/c */}
                  <div style={{ textAlign: 'right', flexShrink: 0, fontFamily: 'var(--oni-font-mono)', fontSize: '0.7rem', marginRight: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.05rem' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--oni-accent-calorie)' }}>
                      {itemKcal.toLocaleString()} <span style={{ fontSize: '0.55rem', fontWeight: 'normal', color: 'var(--oni-text-muted)' }}>kcal</span>
                    </div>
                    <div style={{ fontSize: '0.55rem', color: 'var(--oni-text-muted)' }}>
                      {src.calCycle.toFixed(0)} kcal/c
                    </div>
                  </div>

                  {/* Add / Added button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleDietSource(src.id);
                    }}
                    style={{
                      padding: '0.2rem 0.45rem',
                      fontSize: '0.65rem',
                      borderRadius: '3px',
                      border: added ? `1px solid ${src.color}50` : '1px solid rgba(168,255,140,0.3)',
                      background: added ? `${src.color}18` : 'rgba(168, 255, 140, 0.1)',
                      color: added ? src.color : 'var(--oni-accent-success)',
                      cursor: 'pointer',
                      fontFamily: 'var(--oni-font-mono)',
                      fontWeight: 'bold',
                      transition: 'all 0.15s ease',
                      flexShrink: 0,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {added ? '✓ Added' : '+ Add'}
                  </button>
                </div>
              );
            };

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', height: '100%' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--oni-grid-line-thick)', paddingBottom: '0.5rem' }}>
                  <h3 style={{ color: 'var(--oni-accent-oxygen)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0, fontFamily: 'var(--oni-font-mono)', fontWeight: 'bold' }}>
                    Add Calorie Sources
                  </h3>
                  <span style={{ fontSize: '0.7rem', color: 'var(--oni-text-muted)', fontFamily: 'var(--oni-font-mono)' }}>
                    {Object.values(calorieSources).filter(s => addedToDiet[s.id]).length} / {Object.values(calorieSources).length} added
                  </span>
                </div>

                {/* Filter and Search Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(0, 0, 0, 0.25)', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--oni-panel-border)' }}>
                  {/* Search Text */}
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={addSearchText}
                      onChange={(e) => setAddSearchText(e.target.value)}
                      placeholder="Filter foods..."
                      style={{
                        width: '100%',
                        background: 'rgba(0, 0, 0, 0.5)',
                        border: '1px solid var(--oni-panel-border)',
                        color: 'var(--oni-text-primary)',
                        padding: '0.35rem 0.5rem',
                        paddingRight: '1.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--oni-font-main)',
                        outline: 'none',
                        transition: 'all 0.15s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--oni-accent-oxygen)';
                        e.target.style.boxShadow = '0 0 8px rgba(127, 191, 255, 0.4)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--oni-panel-border)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    {addSearchText && (
                      <button
                        onClick={() => setAddSearchText('')}
                        style={{
                          position: 'absolute',
                          right: '0.4rem',
                          background: 'none',
                          border: 'none',
                          color: 'var(--oni-text-muted)',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          padding: 0
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Filter & Sort selectors */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* DLC Filter buttons */}
                    <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', padding: '0.15rem', border: '1px solid rgba(255,255,255,0.05)', flex: 1, minWidth: '120px' }}>
                      {[
                        { id: 'all', label: 'All' },
                        { id: 'base', label: 'Base' },
                        { id: 'dlc', label: 'DLCs' }
                      ].map(opt => {
                        const isActive = addFilterDlc === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => setAddFilterDlc(opt.id)}
                            style={{
                              flex: 1,
                              background: isActive ? 'rgba(127, 191, 255, 0.15)' : 'transparent',
                              border: 'none',
                              borderRadius: '3px',
                              color: isActive ? 'var(--oni-accent-oxygen)' : 'var(--oni-text-muted)',
                              padding: '0.25rem 0.4rem',
                              fontSize: '0.65rem',
                              fontWeight: isActive ? 'bold' : 'normal',
                              fontFamily: 'var(--oni-font-mono)',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Sort Dropdown + Direction */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.6rem', color: 'var(--oni-text-muted)', fontFamily: 'var(--oni-font-mono)' }}>Sort:</span>
                      <select
                        value={addSortBy}
                        onChange={(e) => setAddSortBy(e.target.value)}
                        style={{
                          background: 'rgba(0,0,0,0.4)',
                          border: '1px solid var(--oni-panel-border)',
                          color: 'var(--oni-text-primary)',
                          padding: '0.2rem 0.4rem',
                          borderRadius: '4px',
                          fontSize: '0.65rem',
                          fontFamily: 'var(--oni-font-mono)',
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="type">Type Group</option>
                        <option value="name">Name</option>
                        <option value="kcal">Kcal Value</option>
                        <option value="efficiency">Efficiency</option>
                      </select>

                      <button
                        onClick={() => setAddSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                        style={{
                          background: 'rgba(0,0,0,0.4)',
                          border: '1px solid var(--oni-panel-border)',
                          color: 'var(--oni-accent-oxygen)',
                          padding: '0.2rem 0.45rem',
                          borderRadius: '4px',
                          fontSize: '0.65rem',
                          fontFamily: 'var(--oni-font-mono)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease',
                          outline: 'none'
                        }}
                        title={addSortDirection === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
                      >
                        {addSortDirection === 'asc' ? '▲' : '▼'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Calorie sources list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', overflowY: 'auto', flex: 1, paddingRight: '0.2rem' }}>
                  {sortedSources.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--oni-text-muted)', fontSize: '0.75rem', fontStyle: 'italic', background: 'rgba(0,0,0,0.15)', borderRadius: '6px', border: '1px dashed var(--oni-panel-border)' }}>
                      No food sources match the filter criteria.
                    </div>
                  ) : addSortBy === 'type' ? (
                    // Grouped display
                    ['crop', 'critter', 'prepared'].map(groupType => {
                      const groupSources = sortedSources.filter(s => s.type === groupType);
                      if (groupSources.length === 0) return null;
                      const groupLabel = groupType === 'crop' ? '🌾 Crops & Processed' : groupType === 'critter' ? '🐾 Critter Ranching' : '⚗️ Prepared Foods';
                      return (
                        <div key={groupType} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--oni-text-muted)', fontFamily: 'var(--oni-font-mono)', fontWeight: 'bold', padding: '0.1rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            {groupLabel}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                            {groupSources.map(src => renderFoodRow(src))}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    // Flat sorted list display
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      {sortedSources.map(src => renderFoodRow(src))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

        </div>

      </div>

    </div>
  );
}
