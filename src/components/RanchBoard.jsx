import React from 'react';
import { RanchCard } from './RanchCard';
import { CRITTER_DATA } from '../data/critters';
import { cleanName } from './DatabaseExplorer';

export function RanchBoard({ ranches, onRanchCountChange, onRanchRemove, onRanchAdd, onRanchFeedChange, onRanchStateChange, critterData = CRITTER_DATA }) {
  // Find which critters are not active in ranches and can be tamed/groomed
  const activeCritterTypes = ranches.map(r => r.critterType);
  const hasIsRanchable = Object.values(critterData).some(c => c.isRanchable !== undefined);
  
  const inactiveCritters = Object.values(critterData).filter(c => {
    const isStaged = !activeCritterTypes.includes(c.id);
    if (!isStaged) return false;
    
    // Remove babies and fry from the selection
    const name = cleanName(c.name).toLowerCase();
    const id = c.id.toLowerCase();
    if (id.endsWith('baby') || id.endsWith('fry') || name.includes('baby') || name.includes('fry')) {
      return false;
    }
    
    if (hasIsRanchable) {
      return c.isRanchable === true;
    }
    return true;
  });

  // Base species / regular critter IDs mapping
  const REGULAR_CRITTER_IDS = new Set([
    'hatch', 'Hatch',
    'drecko', 'Drecko',
    'shineBug', 'LightBug',
    'pip', 'Squirrel',
    'pacu', 'Pacu',
    'Mole',
    'Oilfloater',
    'Puft',
    'Staterpillar',
    'DivergentBeetle',
    'Belly',
    'WoodDeer',
    'Snail',
    'Stego',
    'Chameleon',
    'Raptor',
    'Rhex'
  ]);

  // Separate regular species from variants
  const regularCritters = [];
  const variantCritters = [];

  inactiveCritters.forEach(c => {
    if (REGULAR_CRITTER_IDS.has(c.id)) {
      regularCritters.push(c);
    } else {
      variantCritters.push(c);
    }
  });

  // Sort regular critters alphabetically by cleaned name
  regularCritters.sort((a, b) => cleanName(a.name).localeCompare(cleanName(b.name)));
  // Sort variants alphabetically by cleaned name
  variantCritters.sort((a, b) => cleanName(a.name).localeCompare(cleanName(b.name)));

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
        <h2 style={{ color: 'var(--oni-text-primary)' }}>Critter Husbandry</h2>

        {inactiveCritters.length > 0 && (
          <select
            onChange={(e) => {
              if (e.target.value) {
                onRanchAdd(e.target.value);
                e.target.value = ''; // Reset selection
              }
            }}
            defaultValue=""
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.8rem',
              border: '1px solid var(--oni-panel-border)',
              borderRadius: '4px',
              background: 'rgba(0, 0, 0, 0.4)',
              color: 'var(--oni-text-primary)',
              cursor: 'pointer',
              fontFamily: 'var(--oni-font-mono)'
            }}
          >
            <option value="" disabled>+ Add Critter</option>
            {regularCritters.length > 0 && (
              <optgroup label="Regular Critters" style={{ background: '#202026', color: 'var(--oni-accent-oxygen)', fontWeight: 'bold' }}>
                {regularCritters.map(c => (
                  <option key={c.id} value={c.id} style={{ background: '#1c1c22', color: 'var(--oni-text-primary)', fontWeight: 'normal' }}>
                    {cleanName(c.name)}
                  </option>
                ))}
              </optgroup>
            )}
            {variantCritters.length > 0 && (
              <optgroup label="Variant Morphs" style={{ background: '#202026', color: 'var(--oni-text-muted)', fontWeight: 'bold' }}>
                {variantCritters.map(c => (
                  <option key={c.id} value={c.id} style={{ background: '#1c1c22', color: 'var(--oni-text-primary)', fontWeight: 'normal' }}>
                    {cleanName(c.name)}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        )}
      </div>

      {ranches.length === 0 ? (
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
          No active critter ranches. Use the dropdown above to add a critter planner!
        </div>
      ) : (
        <div className="card-grid">
          {ranches.map((ranch) => {
            const critter = critterData[ranch.critterType];
            if (!critter) return null;
            return (
              <RanchCard 
                key={ranch.critterType} 
                critter={critter}
                count={ranch.count}
                activeFeed={ranch.activeFeed}
                ranchState={ranch.ranchState}
                onChange={(newCount) => onRanchCountChange(ranch.critterType, newCount)}
                onRemove={() => onRanchRemove(ranch.critterType)}
                onFeedChange={(newFeed) => onRanchFeedChange(ranch.critterType, newFeed)}
                onStateChange={(newState) => onRanchStateChange(ranch.critterType, newState)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
