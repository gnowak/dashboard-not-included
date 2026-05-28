import React from 'react';
import { Egg, Maximize2, ArrowDownRight, ArrowUpRight, Trash2 } from 'lucide-react';

export function RanchCard({ critter, count, activeFeed, onChange, onRemove, onFeedChange }) {
  const maxAllowed = critter.maxSize || 8;
  const currentOutput = critter.caloriesPerCycle * count;
  const eggsTotal = critter.eggsPerCycle * count;
  const spaceTotal = critter.spaceRequired * count;
  
  // Calculate ranch count dynamically (Math.ceil since any fraction implies starting a new ranch)
  const currentRanchCount = Math.ceil(count / maxAllowed);

  const handleRanchChange = (newRanchCount) => {
    // Default the critter count to full capacity for the selected ranches
    onChange(newRanchCount * maxAllowed);
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <h3 style={{ color: critter.color || 'var(--oni-text-primary)', fontSize: '1.3rem', fontWeight: 'bold' }}>
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

        <p style={{ color: 'var(--oni-text-muted)', fontSize: '0.8rem', marginBottom: '0.8rem', fontStyle: 'italic', lineHeight: '1.3', minHeight: '2.8rem' }}>
          {critter.description}
        </p>

        {/* Ranch Count Slider (defaults to full critters on change) */}
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
              style={{ accentColor: critter.color, flex: 1 }}
            />
            <input 
              type="number" 
              min="0" 
              max="5"
              value={currentRanchCount} 
              onChange={(e) => handleRanchChange(parseInt(e.target.value) || 0)}
              style={{ 
                width: '45px', 
                padding: '0.15rem', 
                textAlign: 'center', 
                fontSize: '0.85rem',
                border: '1px solid var(--oni-panel-border)',
                background: 'rgba(0, 0, 0, 0.4)',
                color: 'var(--oni-text-primary)',
                fontFamily: 'var(--oni-font-mono)'
              }}
            />
          </div>
        </div>

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
              max="40" 
              value={count}
              onChange={(e) => onChange(parseInt(e.target.value) || 0)}
              style={{ accentColor: critter.color, flex: 1 }}
            />
            <input 
              type="number" 
              min="0" 
              value={count} 
              onChange={(e) => onChange(parseInt(e.target.value) || 0)}
              style={{ 
                width: '45px', 
                padding: '0.15rem', 
                textAlign: 'center', 
                fontSize: '0.85rem',
                border: '1px solid var(--oni-panel-border)',
                background: 'rgba(0, 0, 0, 0.4)',
                color: 'var(--oni-text-primary)',
                fontFamily: 'var(--oni-font-mono)'
              }}
            />
          </div>
        </div>

        {/* Active Feed Selection for Multi-diet Critters */}
        {count > 0 && hasMultipleInputs && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
              <span className="stat-label" style={{ color: 'var(--oni-text-primary)', fontWeight: 'bold' }}>Active Feed Selection</span>
            </div>
            <select
              value={selectedFeedName}
              onChange={(e) => onFeedChange(e.target.value)}
              style={{
                width: '100%',
                padding: '0.35rem 0.5rem',
                fontSize: '0.8rem',
                border: '1px solid var(--oni-panel-border)',
                borderRadius: '4px',
                background: 'rgba(0, 0, 0, 0.4)',
                color: 'var(--oni-text-primary)',
                fontFamily: 'var(--oni-font-mono)',
                cursor: 'pointer'
              }}
            >
              {critter.inputs.map(input => (
                <option key={input.name} value={input.name}>{input.name}</option>
              ))}
            </select>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--oni-accent-danger)', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                <ArrowDownRight size={10} /> Active Input
              </div>
              {activeInput ? (
                <div style={{ fontFamily: 'var(--oni-font-mono)', fontSize: '0.75rem', color: 'var(--oni-text-primary)', lineHeight: '1.2' }}>
                  {(activeInput.amount * count).toFixed(0)} {activeInput.unit} <span style={{ color: 'var(--oni-text-muted)', fontSize: '0.65rem', display: 'block' }}>{activeInput.name}</span>
                </div>
              ) : (
                <span style={{ fontSize: '0.7rem', color: 'var(--oni-text-muted)', fontStyle: 'italic' }}>None</span>
              )}
            </div>

            {/* Outputs */}
            <div style={{ borderLeft: '1px solid var(--oni-grid-line)', paddingLeft: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--oni-accent-success)', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                <ArrowUpRight size={10} /> Outputs
              </div>
              {activeOutputs?.map((output, idx) => (
                <div key={idx} style={{ fontFamily: 'var(--oni-font-mono)', fontSize: '0.75rem', color: 'var(--oni-text-primary)', lineHeight: '1.2', marginBottom: '0.2rem' }}>
                  {(output.amount * count).toFixed(0)} {output.unit} <span style={{ color: 'var(--oni-text-muted)', fontSize: '0.65rem', display: 'block' }}>{output.name}</span>
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
