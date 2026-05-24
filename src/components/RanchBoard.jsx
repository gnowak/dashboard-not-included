import React from 'react';
import { RanchCard } from './RanchCard';
import { CRITTER_DATA } from '../data/critters';

export function RanchBoard({ ranches, onRanchCountChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: 'var(--oni-text-primary)' }}>Critter Husbandry</h2>
      </div>

      <div className="card-grid">
        {ranches.map((ranch) => {
          const critter = CRITTER_DATA[ranch.critterType];
          if (!critter) return null;
          return (
            <RanchCard 
              key={ranch.critterType} 
              critter={critter}
              count={ranch.count}
              onChange={(newCount) => onRanchCountChange(ranch.critterType, newCount)}
            />
          );
        })}
      </div>
    </div>
  );
}
