import React from 'react';
import { Egg, Maximize2, ArrowDownRight, ArrowUpRight, Trash2 } from 'lucide-react';
import { getImageUrl, formatResourceName } from '../utils/images';

export function RanchCard({ critter, count, activeFeed, ranchState = 'happy', onChange, onRemove, onFeedChange, onStateChange, isLiveConnected = false }) {
  // Care state multipliers
  const calMult = ranchState === 'glum' ? 0.1 : ranchState === 'wild' ? 0.06 : 1.0;
  const eggMult = ranchState === 'glum' ? 0.1 : ranchState === 'wild' ? 0.06 : 1.0;
  const feedMult = ranchState === 'glum' ? 0.2 : ranchState === 'wild' ? 0.0 : 1.0;

  // Stable requirements: Wild critters do not need stables (stable count = 0, capacity = Infinity)
  const maxAllowed = ranchState === 'wild' ? Infinity : (critter.maxSize || 8);
  const currentOutput = critter.caloriesPerCycle * count * calMult;
  const eggsTotal = critter.eggsPerCycle * count * eggMult;
  const spaceTotal = critter.spaceRequired * count;
  
  // Calculate ranch count dynamically (Math.ceil since any fraction implies starting a new ranch)
  const currentRanchCount = maxAllowed === Infinity ? 0 : Math.ceil(count / maxAllowed);

  const handleRanchChange = (newRanchCount) => {
    if (maxAllowed !== Infinity) {
      // Default the critter count to full capacity for the selected ranches
      onChange(newRanchCount * maxAllowed);
    }
  };

  // Resolve the active input based on user preference or fallback
  const hasMultipleInputs = critter.inputs && critter.inputs.length > 1;
  const selectedFeedName = activeFeed || (critter.inputs && critter.inputs[0]?.name) || '';
  const activeInputIdx = critter.inputs ? critter.inputs.findIndex(input => input.name === selectedFeedName) : 0;
  const activeInput = critter.inputs?.[activeInputIdx >= 0 ? activeInputIdx : 0];

  const activeOutputs = critter.inputs && critter.inputs.length > 0
    ? (critter.outputs?.[activeInputIdx >= 0 ? activeInputIdx : 0] ? [critter.outputs[activeInputIdx >= 0 ? activeInputIdx : 0]] : [])
    : (critter.outputs || []);

  return (
    <div 
      className="panel" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        borderTop: `4px solid ${critter.color || 'var(--oni-panel-border)'}`,
        padding: '1rem' 
      }}
    >
      <div style={{ flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '6px',
            background: 'rgba(0, 0, 0, 0.4)',
            border: `1px solid ${critter.color || 'var(--oni-panel-border)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
            boxShadow: `0 0 8px ${critter.color}20`,
            flexShrink: 0
          }}>
            <img 
              src={getImageUrl(critter.id)} 
              alt={critter.name} 
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              onError={(e) => { e.currentTarget.src = '/data/images/Creature.png'; }}
            />
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ color: critter.color || 'var(--oni-text-primary)', fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>
              {critter.name}
            </h3>
            {onRemove && (
              <button 
                onClick={onRemove}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--oni-text-muted)',
                  cursor: 'pointer',
                  padding: '0.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--oni-accent-danger)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--oni-text-muted)'}
                title="Remove ranch card"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        <p style={{ color: 'var(--oni-text-muted)', fontSize: '0.8rem', marginBottom: '0.8rem', fontStyle: 'italic', lineHeight: '1.3', minHeight: '2.8rem' }}>
          {critter.description}
        </p>

        {/* Ranch Count Slider (defaults to full critters on change) - Hidden for wild critters */}
        {ranchState !== 'wild' && (
          <div style={{ marginBottom: '0.65rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
              <span className="stat-label" style={{ color: 'var(--oni-text-primary)', fontWeight: 'bold' }}>Ranches (96-Tile)</span>
              <span style={{ fontFamily: 'var(--oni-font-mono)', fontWeight: 'bold', color: critter.color }}>{currentRanchCount}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input 
                type="range" 
                min="0" 
                max="5" 
                value={currentRanchCount}
                onChange={(e) => handleRanchChange(parseInt(e.target.value) || 0)}
                disabled={isLiveConnected}
                style={{ accentColor: critter.color, flex: 1, opacity: isLiveConnected ? 0.5 : 1, cursor: isLiveConnected ? 'not-allowed' : 'default' }}
              />
              <input 
                type="number" 
                min="0" 
                max="5"
                value={currentRanchCount} 
                onChange={(e) => handleRanchChange(parseInt(e.target.value) || 0)}
                disabled={isLiveConnected}
                style={{ 
                  width: '45px', 
                  padding: '0.15rem', 
                  textAlign: 'center', 
                  fontSize: '0.85rem',
                  border: '1px solid var(--oni-panel-border)',
                  background: 'rgba(0, 0, 0, 0.4)',
                  color: 'var(--oni-text-primary)',
                  fontFamily: 'var(--oni-font-mono)',
                  opacity: isLiveConnected ? 0.5 : 1,
                  cursor: isLiveConnected ? 'not-allowed' : 'default'
                }}
              />
            </div>
          </div>
        )}

        {/* Critter Count Slider */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
            <span className="stat-label" style={{ color: 'var(--oni-text-primary)', fontWeight: 'bold' }}>Total Critters</span>
            <span style={{ fontFamily: 'var(--oni-font-mono)', fontWeight: 'bold', color: 'var(--oni-accent-oxygen)' }}>{count}</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input 
              type="range" 
              min="0" 
              max={maxAllowed === Infinity ? 40 : 5 * maxAllowed} 
              value={count}
              onChange={(e) => onChange(parseInt(e.target.value) || 0)}
              disabled={isLiveConnected}
              style={{ accentColor: critter.color, flex: 1, opacity: isLiveConnected ? 0.5 : 1, cursor: isLiveConnected ? 'not-allowed' : 'default' }}
            />
            <input 
              type="number" 
              min="0" 
              max={maxAllowed === Infinity ? 100 : 5 * maxAllowed}
              value={count} 
              onChange={(e) => onChange(parseInt(e.target.value) || 0)}
              disabled={isLiveConnected}
              style={{ 
                width: '45px', 
                padding: '0.15rem', 
                textAlign: 'center', 
                fontSize: '0.85rem',
                border: '1px solid var(--oni-panel-border)',
                background: 'rgba(0, 0, 0, 0.4)',
                color: 'var(--oni-text-primary)',
                fontFamily: 'var(--oni-font-mono)',
                opacity: isLiveConnected ? 0.5 : 1,
                cursor: isLiveConnected ? 'not-allowed' : 'default'
              }}
            />
          </div>
        </div>

        {/* Care & Happiness State Select */}
        {count > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
              <span className="stat-label" style={{ color: 'var(--oni-text-primary)', fontWeight: 'bold' }}>Critter Care State</span>
            </div>
            <select
              value={ranchState}
              onChange={(e) => onStateChange(e.target.value)}
              disabled={isLiveConnected}
              style={{
                width: '100%',
                padding: '0.35rem 0.5rem',
                fontSize: '0.8rem',
                border: '1px solid var(--oni-panel-border)',
                borderRadius: '4px',
                background: 'rgba(0, 0, 0, 0.4)',
                color: 'var(--oni-text-primary)',
                fontFamily: 'var(--oni-font-mono)',
                cursor: isLiveConnected ? 'not-allowed' : 'pointer',
                opacity: isLiveConnected ? 0.5 : 1
              }}
            >
              <option value="happy">Groomed & Happy (Tame)</option>
              <option value="glum">Tame & Unhappy (Glum)</option>
              <option value="wild">Wild (Natural)</option>
            </select>
          </div>
        )}

        {/* Active Feed Selection for Multi-diet Critters */}
        {count > 0 && hasMultipleInputs && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
              <span className="stat-label" style={{ color: 'var(--oni-text-primary)', fontWeight: 'bold' }}>Active Feed Selection</span>
            </div>
            <select
              value={selectedFeedName}
              onChange={(e) => onFeedChange(e.target.value)}
              disabled={isLiveConnected}
              style={{
                width: '100%',
                padding: '0.35rem 0.5rem',
                fontSize: '0.8rem',
                border: '1px solid var(--oni-panel-border)',
                borderRadius: '4px',
                background: 'rgba(0, 0, 0, 0.4)',
                color: 'var(--oni-text-primary)',
                fontFamily: 'var(--oni-font-mono)',
                cursor: isLiveConnected ? 'not-allowed' : 'pointer',
                opacity: isLiveConnected ? 0.5 : 1
              }}
            >
              {critter.inputs.map(input => (
                <option key={input.name} value={input.name}>{formatResourceName(input.name)}</option>
              ))}
            </select>
          </div>
        )}

        {/* Wild grazing description */}
        {count > 0 && ranchState === 'wild' && (
          <div style={{ color: 'var(--oni-text-muted)', fontSize: '0.75rem', fontStyle: 'italic', marginBottom: '0.75rem', lineHeight: '1.3' }}>
            🌾 Wild critters graze natural tiles, consuming 0 kg domestic feed.
          </div>
        )}
      </div>

      {/* Advanced Stats Section */}
      <div style={{ 
        marginTop: 'auto',
        paddingTop: '0.75rem', 
        borderTop: '1px dashed var(--oni-grid-line-thick)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        fontSize: '0.8rem'
      }}>
        {/* Caloric Output */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="stat-label" style={{ fontWeight: 'bold' }}>Daily Calorie Output</span>
          <span className="stat-value calories" style={{ fontSize: '1.15rem' }}>{currentOutput.toFixed(0)} kcal</span>
        </div>

        {/* Space & Eggs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Maximize2 size={12} style={{ color: 'var(--oni-accent-oxygen)' }} />
            <span className="stat-label">Space:</span>
            <span style={{ fontFamily: 'var(--oni-font-mono)', fontWeight: 'bold', color: 'var(--oni-text-primary)' }}>
              {spaceTotal} <span style={{ fontSize: '0.75rem', color: 'var(--oni-text-muted)' }}>tiles</span>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Egg size={12} style={{ color: 'var(--oni-accent-calorie)' }} />
            <span className="stat-label">Eggs:</span>
            <span style={{ fontFamily: 'var(--oni-font-mono)', fontWeight: 'bold', color: 'var(--oni-text-primary)' }}>
              {eggsTotal.toFixed(2)} <span style={{ fontSize: '0.75rem', color: 'var(--oni-text-muted)' }}>/c</span>
            </span>
          </div>
        </div>

        {count > 0 && (activeInput || activeOutputs.length > 0) && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '0.5rem', 
            paddingTop: '0.5rem',
            borderTop: '1px solid var(--oni-grid-line)',
            marginTop: '0.2rem'
          }}>
            {/* Active Input */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--oni-accent-danger)', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                <ArrowDownRight size={10} /> Active Input
              </div>
              {activeInput ? (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem', 
                  fontFamily: 'var(--oni-font-mono)', 
                  fontSize: '0.75rem', 
                  color: 'var(--oni-text-primary)', 
                  lineHeight: '1.2' 
                }}>
                  <img 
                    src={getImageUrl(formatResourceName(activeInput.name))} 
                    alt={formatResourceName(activeInput.name)} 
                    style={{ width: '16px', height: '16px', objectFit: 'contain' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <div>
                    {(activeInput.amount * count * feedMult).toFixed(0)} {activeInput.unit}
                    <span style={{ color: 'var(--oni-text-muted)', fontSize: '0.65rem', display: 'block' }}>{formatResourceName(activeInput.name)}</span>
                  </div>
                </div>
              ) : (
                <span style={{ fontSize: '0.7rem', color: 'var(--oni-text-muted)', fontStyle: 'italic' }}>None</span>
              )}
            </div>

            {/* Outputs */}
            <div style={{ borderLeft: '1px solid var(--oni-grid-line)', paddingLeft: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--oni-accent-success)', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                <ArrowUpRight size={10} /> Outputs
              </div>
              {activeOutputs?.map((output, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem', 
                  fontFamily: 'var(--oni-font-mono)', 
                  fontSize: '0.75rem', 
                  color: 'var(--oni-text-primary)', 
                  lineHeight: '1.2', 
                  marginBottom: '0.25rem' 
                }}>
                  <img 
                    src={getImageUrl(formatResourceName(output.name))} 
                    alt={formatResourceName(output.name)} 
                    style={{ width: '16px', height: '16px', objectFit: 'contain' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <div>
                    {(output.amount * count * feedMult).toFixed(0)} {output.unit}
                    <span style={{ color: 'var(--oni-text-muted)', fontSize: '0.65rem', display: 'block' }}>{formatResourceName(output.name)}</span>
                  </div>
                </div>
              ))}
              {(!activeOutputs || activeOutputs.length === 0) && (
                <span style={{ fontSize: '0.7rem', color: 'var(--oni-text-muted)', fontStyle: 'italic' }}>None</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
