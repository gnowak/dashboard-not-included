import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { CropCard } from './CropCard';
import { CROP_DATA } from '../data/crops';
import { cleanName } from './DatabaseExplorer';

export function FarmBoard({ 
  crops, 
  onCropCountChange, 
  onCropRoomSizeChange, 
  onCropRemove, 
  onCropAdd, 
  cropData = CROP_DATA, 
  growthMode, 
  onCropModeChange,
  onCropFarmerTouchChange,
  onCropPlanterChange,
  isLiveConnected = false
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Find which crops are not currently active in farms and are farmable
  const hasIsFarmable = Object.values(cropData).some(c => c.isFarmable !== undefined);
  
  const inactiveCrops = useMemo(() => {
    return Object.values(cropData).filter(c => {
      // Filter out non-crop producing plants (like decorative plants with no output yield or calories)
      const isCropProducing = (c.caloriesPerCycle && c.caloriesPerCycle > 0) || (c.outputs && c.outputs.length > 0);
      if (!isCropProducing) return false;

      if (hasIsFarmable && c.isFarmable !== true) {
        return false;
      }
      
      // Allow adding a crop if at least one of its modes is not yet added
      const modes = ['domesticated', 'wild'];
      const activeModesForCrop = crops.filter(x => x.cropType === c.id).map(x => x.growthMode);
      return modes.some(m => !activeModesForCrop.includes(m));
    });
  }, [cropData, crops, hasIsFarmable]);

  const filteredInactiveCrops = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return inactiveCrops;
    return inactiveCrops.filter(c => cleanName(c.name).toLowerCase().includes(q));
  }, [inactiveCrops, searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem',
        zIndex: 1001 // ensure dropdown menu overlays cards correctly
      }}>
        <div>
          <h2 style={{ color: 'var(--oni-accent-oxygen)', fontSize: '1.5rem', margin: 0 }}>Agricultural Crops</h2>
          <p style={{ color: 'var(--oni-text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            {isLiveConnected ? "Monitoring live colony crop data in real-time." : "Plan crop layouts and calculate harvest calories."}
          </p>
        </div>

        {!isLiveConnected && inactiveCrops.length > 0 && (
          <div style={{ position: 'relative', width: '280px' }}>
            {/* Search Input Box */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              background: 'rgba(0, 0, 0, 0.4)', 
              border: '1px solid var(--oni-panel-border)', 
              borderRadius: '4px', 
              padding: '0.35rem 0.5rem' 
            }}>
              <Search size={14} style={{ color: 'var(--oni-accent-oxygen)', marginRight: '0.4rem' }} />
              <input 
                type="text" 
                placeholder="Search & Add Crop..." 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setIsOpen(true); }}
                onFocus={() => setIsOpen(true)}
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: '#fff', 
                  outline: 'none', 
                  fontSize: '0.8rem',
                  width: '100%',
                  fontFamily: 'var(--oni-font-mono)'
                }}
              />
              {searchQuery && (
                <button 
                  onClick={() => { setSearchQuery(''); setIsOpen(false); }}
                  style={{ background: 'none', border: 'none', color: 'var(--oni-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
            
            {/* Click-outside backdrop */}
            {isOpen && (
              <div 
                onClick={() => setIsOpen(false)} 
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999, background: 'transparent' }} 
              />
            )}

            {/* Viewport-locked results panel */}
            {isOpen && (
              <div style={{ 
                position: 'absolute', 
                top: '100%', 
                left: 0, 
                right: 0, 
                background: 'var(--oni-panel-bg)', 
                border: '1px solid var(--oni-panel-border)', 
                borderRadius: '0 0 6px 6px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                zIndex: 1000, 
                maxHeight: '280px', 
                overflowY: 'auto',
                marginTop: '3px'
              }}
              className="subtabs-scroll"
              >
                {filteredInactiveCrops.length === 0 ? (
                  <div style={{ padding: '0.75rem', color: 'var(--oni-text-muted)', fontSize: '0.8rem', fontStyle: 'italic', textAlign: 'center' }}>
                    No matching crops found
                  </div>
                ) : (
                  filteredInactiveCrops.map(c => {
                    const activeModesForCrop = crops.filter(x => x.cropType === c.id).map(x => x.growthMode);
                    return (
                      <div key={c.id} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '0.45rem 0.6rem', 
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        gap: '0.5rem'
                      }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--oni-text-primary)' }}>
                          {cleanName(c.name)}
                        </span>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          {!activeModesForCrop.includes('domesticated') && (
                            <button
                              onClick={() => {
                                onCropAdd(c.id, 'domesticated');
                                setSearchQuery('');
                                setIsOpen(false);
                              }}
                              style={{ 
                                background: 'rgba(59, 130, 246, 0.2)', 
                                border: '1px solid var(--oni-panel-border)', 
                                color: 'var(--oni-accent-oxygen)', 
                                fontSize: '0.7rem', 
                                padding: '0.15rem 0.4rem', 
                                borderRadius: '3px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                              }}
                            >
                              🏡 Dom
                            </button>
                          )}
                          {!activeModesForCrop.includes('wild') && (
                            <button
                              onClick={() => {
                                onCropAdd(c.id, 'wild');
                                setSearchQuery('');
                                setIsOpen(false);
                              }}
                              style={{ 
                                background: 'rgba(168, 255, 140, 0.1)', 
                                border: '1px solid var(--oni-panel-border)', 
                                color: 'var(--oni-accent-success)', 
                                fontSize: '0.7rem', 
                                padding: '0.15rem 0.4rem', 
                                borderRadius: '3px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                              }}
                            >
                              🌾 Wild
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {crops.length === 0 ? (
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          color: 'var(--oni-text-muted)',
          fontStyle: 'italic',
          border: '2px dashed var(--oni-grid-line)',
          borderRadius: '8px',
          padding: '3rem',
          textAlign: 'center',
          background: 'rgba(0, 0, 0, 0.15)'
        }}>
          {isLiveConnected ? "No live crops detected in the colony." : "No active crop farms. Use the search box above to search and add a crop!"}
        </div>
      ) : (
        <div className="card-grid">
          {crops.map((cropItem) => {
            const crop = cropData[cropItem.cropType];
            if (!crop) return null;
            return (
              <CropCard 
                key={cropItem.id} 
                crop={crop}
                count={cropItem.count}
                roomSize={cropItem.roomSize || 96}
                onChange={(newCount) => onCropCountChange(cropItem.id, newCount)}
                onRoomSizeChange={(newRoomSize) => onCropRoomSizeChange(cropItem.id, newRoomSize)}
                onRemove={isLiveConnected ? null : () => onCropRemove(cropItem.id)}
                growthMode={cropItem.growthMode}
                farmerTouch={cropItem.farmerTouch}
                onModeChange={(newMode) => onCropModeChange(cropItem.id, newMode)}
                onFarmerTouchChange={(checked) => onCropFarmerTouchChange(cropItem.id, checked)}
                planterType={cropItem.planterType}
                onPlanterChange={(newPlanter) => onCropPlanterChange(cropItem.id, newPlanter)}
                isLiveConnected={isLiveConnected}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
