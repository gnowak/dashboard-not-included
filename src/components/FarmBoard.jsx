import React from 'react';
import { CropCard } from './CropCard';
import { CROP_DATA } from '../data/crops';
import { cleanName } from './DatabaseExplorer';

export function FarmBoard({ crops, onCropCountChange, onCropRoomSizeChange, onCropRemove, onCropAdd, cropData = CROP_DATA }) {
  // Find which crops are not currently active in farms and are farmable
  const activeCropTypes = crops.map(c => c.cropType);
  const hasIsFarmable = Object.values(cropData).some(c => c.isFarmable !== undefined);
  
  const inactiveCrops = Object.values(cropData).filter(c => {
    const isStaged = !activeCropTypes.includes(c.id);
    if (!isStaged) return false;
    if (hasIsFarmable) {
      return c.isFarmable === true;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h2 style={{ color: 'var(--oni-text-primary)' }}>Agricultural Crops</h2>

        {inactiveCrops.length > 0 && (
          <select
            onChange={(e) => {
              if (e.target.value) {
                onCropAdd(e.target.value);
                e.target.value = ''; // Reset selection
              }
            }}
            defaultValue=""
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.85rem',
              border: '1px solid var(--oni-panel-border)',
              borderRadius: '4px',
              background: 'rgba(0, 0, 0, 0.4)',
              color: 'var(--oni-text-primary)',
              cursor: 'pointer',
              fontFamily: 'var(--oni-font-mono)'
            }}
          >
            <option value="" disabled>+ Add Crop</option>
            {inactiveCrops.map(c => (
              <option key={c.id} value={c.id}>{cleanName(c.name)}</option>
            ))}
          </select>
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
          No active crop farms. Use the dropdown above to add a crop planner!
        </div>
      ) : (
        <div className="card-grid">
          {crops.map((cropItem) => {
            const crop = cropData[cropItem.cropType];
            if (!crop) return null;
            return (
              <CropCard 
                key={cropItem.cropType} 
                crop={crop}
                count={cropItem.count}
                roomSize={cropItem.roomSize || 96}
                onChange={(newCount) => onCropCountChange(cropItem.cropType, newCount)}
                onRoomSizeChange={(newRoomSize) => onCropRoomSizeChange(cropItem.cropType, newRoomSize)}
                onRemove={() => onCropRemove(cropItem.cropType)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
