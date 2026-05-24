import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout';
import { DuplicantStats } from './components/DuplicantStats';
import { RanchBoard } from './components/RanchBoard';
import { FarmBoard } from './components/FarmBoard';
import { CRITTER_DATA } from './data/critters';
import { CROP_DATA } from './data/crops';

const STORAGE_KEY = 'oni-dashboard-state';

const DEFAULT_RANCHES = [
  { critterType: 'hatch', count: 8 },
  { critterType: 'drecko', count: 4 },
  { critterType: 'shineBug', count: 0 },
  { critterType: 'pip', count: 0 },
  { critterType: 'pacu', count: 0 }
];

const DEFAULT_CROPS = [
  { cropType: 'mealwood', count: 8, roomSize: 96 },
  { cropType: 'bristleBlossom', count: 4, roomSize: 96 },
  { cropType: 'duskCap', count: 0, roomSize: 96 },
  { cropType: 'sleetWheat', count: 0, roomSize: 96 },
  { cropType: 'thimbleReed', count: 0, roomSize: 96 }
];

function App() {
  const [activeTab, setActiveTab] = useState('ranches');
  
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
        if (Array.isArray(parsed) && parsed.length === 5 && parsed.every(item => item.critterType)) {
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
        if (Array.isArray(parsed) && parsed.length === 5 && parsed.every(item => item.cropType)) {
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
      const critter = CRITTER_DATA[ranch.critterType];
      if (!critter) return total;
      return total + (critter.caloriesPerCycle * ranch.count);
    }, 0);

    const cropCals = crops.reduce((total, cropItem) => {
      const crop = CROP_DATA[cropItem.cropType];
      if (!crop) return total;
      return total + (crop.caloriesPerCycle * cropItem.count);
    }, 0);

    return ranchCals + cropCals;
  }, [ranches, crops]);

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
          </div>

          {activeTab === 'ranches' ? (
            <RanchBoard 
              ranches={ranches}
              onRanchCountChange={handleRanchCountChange}
            />
          ) : (
            <FarmBoard 
              crops={crops}
              onCropCountChange={handleCropCountChange}
              onCropRoomSizeChange={handleCropRoomSizeChange}
            />
          )}
        </section>
      </div>
    </Layout>
  );
}

export default App;
