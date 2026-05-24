import React from 'react';
import { Egg, Maximize2, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export function RanchCard({ critter, count, onChange }) {
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

  return (
    <div 
      className="panel" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        borderTop: `4px solid ${critter.color || 'var(--oni-panel-border)'}`,
        height: '100%',
        padding: '1rem' // Condensed padding
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <h3 style={{ color: critter.color || 'var(--oni-text-primary)', fontSize: '1.3rem', fontWeight: 'bold' }}>
            {critter.name}
          </h3>
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
              max="40" // Represents colony-wide aggregation of this critter
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

        {/* Inputs & Outputs */}
        {count > 0 && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '0.5rem', 
            paddingTop: '0.5rem',
            borderTop: '1px solid var(--oni-grid-line)'
          }}>
            {/* Inputs */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--oni-accent-danger)', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.15rem' }}>
                <ArrowDownRight size={10} /> Inputs
              </div>
              {critter.inputs?.map((input, idx) => (
                <div key={idx} style={{ fontFamily: 'var(--oni-font-mono)', fontSize: '0.75rem', color: 'var(--oni-text-primary)', lineHeight: '1.2' }}>
                  {(input.amount * count).toFixed(0)} {input.unit} <span style={{ color: 'var(--oni-text-muted)', fontSize: '0.65rem', display: 'block' }}>{input.name}</span>
                </div>
              ))}
            </div>

            {/* Outputs */}
            <div style={{ borderLeft: '1px solid var(--oni-grid-line)', paddingLeft: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--oni-accent-success)', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.15rem' }}>
                <ArrowUpRight size={10} /> Outputs
              </div>
              {critter.outputs?.map((output, idx) => (
                <div key={idx} style={{ fontFamily: 'var(--oni-font-mono)', fontSize: '0.75rem', color: 'var(--oni-text-primary)', lineHeight: '1.2' }}>
                  {(output.amount * count).toFixed(0)} {output.unit} <span style={{ color: 'var(--oni-text-muted)', fontSize: '0.65rem', display: 'block' }}>{output.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
