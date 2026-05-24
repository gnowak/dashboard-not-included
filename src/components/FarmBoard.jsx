import React from 'react';
import { CropCard } from './CropCard';
import { CROP_DATA } from '../data/crops';

export function FarmBoard({ crops, onCropCountChange, onCropRoomSizeChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: 'var(--oni-text-primary)' }}>Agricultural Crops</h2>
      </div>

      <div className="card-grid">
        {crops.map((cropItem) => {
          const crop = CROP_DATA[cropItem.cropType];
          if (!crop) return null;
          return (
            <CropCard 
              key={cropItem.cropType} 
              crop={crop}
              count={cropItem.count}
              roomSize={cropItem.roomSize || 96}
              onChange={(newCount) => onCropCountChange(cropItem.cropType, newCount)}
              onRoomSizeChange={(newRoomSize) => onCropRoomSizeChange(cropItem.cropType, newRoomSize)}
            />
          );
        })}
      </div>
    </div>
  );
}
