import React from 'react';
import { RanchCard } from './RanchCard';
import { CRITTER_DATA } from '../data/critters';
import { cleanName } from './DatabaseExplorer';

export function RanchBoard({ ranches, onRanchCountChange, onRanchRemove, onRanchAdd, onRanchFeedChange, onRanchStateChange, critterData = CRITTER_DATA, isLiveConnected = false }) {
  // Find which critters are not active in ranches and can be tamed/groomed
  const activeCritterTypes = ranches.map(r => r.critterType);
  const displayedRanches = isLiveConnected ? ranches.filter(r => r.ranchState !== 'wild') : ranches;
  const wildCritterCount = isLiveConnected ? ranches.filter(r => r.ranchState === 'wild').reduce((acc, r) => acc + r.count, 0) : 0;
  
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
    'IceBelly',
    'WoodDeer',
    'Deer',
    'Squid',
    'SqueakyPuft'
  ]);

  const regularCritters = inactiveCritters.filter(c => REGULAR_CRITTER_IDS.has(c.id));
  const variantCritters = inactiveCritters.filter(c => !REGULAR_CRITTER_IDS.has(c.id));

  // Sort regular critters alphabetically by cleaned name
  regularCritters.sort((a, b) => cleanName(a.name).localeCompare(cleanName(b.name)));
  // Sort variants alphabetically by cleaned name
  variantCritters.sort((a, b) => cleanName(a.name).localeCompare(cleanName(b.name)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--oni-grid-line)', paddingBottom: '1rem' }}>
        <div>
          <h2 style={{ color: 'var(--oni-accent-oxygen)', fontSize: '1.5rem', margin: 0 }}>Colony Stables</h2>
          <p style={{ color: 'var(--oni-text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            {isLiveConnected ? "Monitoring live colony stable data in real-time." : "Plan stable space and calculate output capacities."}
          </p>
        </div>
        {!isLiveConnected && inactiveCritters.length > 0 && (
          <select 
            value="" 
            onChange={(e) => {
              if (e.target.value) {
                onRanchAdd(e.target.value);
              }
            }}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '4px',
              border: '1px solid var(--oni-panel-border)',
              background: 'rgba(0, 0, 0, 0.4)',
              color: 'var(--oni-accent-oxygen)',
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

      {isLiveConnected && wildCritterCount > 0 && (
        <div style={{
          background: 'rgba(0, 209, 255, 0.05)',
          border: '1px solid rgba(0, 209, 255, 0.15)',
          borderRadius: '4px',
          padding: '0.5rem 0.75rem',
          marginBottom: '1.2rem',
          fontSize: '0.8rem',
          color: 'var(--oni-text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontFamily: 'var(--oni-font-sans)'
        }}>
          <span style={{ color: 'var(--oni-accent-oxygen)', fontWeight: 'bold' }}>ℹ️ Live Sync Notice:</span>
          <span>{wildCritterCount} wild creatures are hidden to keep the panel clean, but their caloric and resource outputs are still fully active in your calculations.</span>
        </div>
      )}

      {displayedRanches.length === 0 ? (
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
          {isLiveConnected 
            ? (wildCritterCount > 0 
                ? "No tamed critters detected in the colony. (Wild critters are active in calculations but hidden here)" 
                : "No live critters detected in the colony.") 
            : "No active critter ranches. Use the dropdown above to add a critter planner!"}
        </div>
      ) : (
        <div className="card-grid">
          {displayedRanches.map((ranch) => {
            const critter = critterData[ranch.critterType];
            if (!critter) return null;
            return (
              <RanchCard 
                key={ranch.id || ranch.critterType} 
                critter={critter}
                count={ranch.count}
                activeFeed={ranch.activeFeed}
                ranchState={ranch.ranchState}
                onChange={(newCount) => onRanchCountChange(ranch.critterType, newCount)}
                onRemove={isLiveConnected ? null : () => onRanchRemove(ranch.critterType)}
                onFeedChange={(newFeed) => onRanchFeedChange(ranch.critterType, newFeed)}
                onStateChange={(newState) => onRanchStateChange(ranch.critterType, newState)}
                isLiveConnected={isLiveConnected}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
