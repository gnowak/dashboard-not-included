import React from 'react';
import { ArrowDownRight, ArrowUpRight, Maximize2 } from 'lucide-react';

export function CropCard({ crop, count, roomSize = 96, onChange, onRoomSizeChange }) {
  const currentOutput = crop.caloriesPerCycle * count;
  
  // Usable slots per greenhouse: roomSize minus 2 tiles for Farm Station
  const usableCropsPerRoom = Math.max(1, roomSize - 2);
  
  // Calculate greenhouse room counts dynamically
  const currentGreenhouseCount = Math.ceil(count / usableCropsPerRoom);

  const handleGreenhouseChange = (newRoomCount) => {
    // Default the crop count to full capacity for the selected rooms
    onChange(newRoomCount * usableCropsPerRoom);
  };

  return (
    <div 
      className="panel" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        borderTop: `4px solid ${crop.color || 'var(--oni-panel-border)'}`,
        height: '100%',
        padding: '1rem'
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <h3 style={{ color: crop.color || 'var(--oni-text-primary)', fontSize: '1.3rem', fontWeight: 'bold' }}>
            {crop.name}
          </h3>
        </div>

        <p style={{ color: 'var(--oni-text-muted)', fontSize: '0.8rem', marginBottom: '0.8rem', fontStyle: 'italic', lineHeight: '1.3', minHeight: '2.8rem' }}>
          {crop.description}
        </p>

        {/* Farm Size Slider */}
        <div style={{ marginBottom: '0.65rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
            <span className="stat-label" style={{ color: 'var(--oni-text-primary)', fontWeight: 'bold' }}>Farm Size (Room Size)</span>
            <span style={{ fontFamily: 'var(--oni-font-mono)', fontWeight: 'bold', color: crop.color }}>{roomSize} tiles</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input 
              type="range" 
              min="12" 
              max="96" 
              value={roomSize}
              onChange={(e) => {
                const newSize = parseInt(e.target.value) || 96;
                onRoomSizeChange(newSize);
                const newUsable = Math.max(1, newSize - 2);
                if (count > 5 * newUsable) {
                  onChange(5 * newUsable);
                }
              }}
              style={{ accentColor: crop.color, flex: 1 }}
            />
            <input 
              type="number" 
              min="12" 
              max="96"
              value={roomSize} 
              onChange={(e) => {
                const newSize = parseInt(e.target.value) || 96;
                onRoomSizeChange(newSize);
                const newUsable = Math.max(1, newSize - 2);
                if (count > 5 * newUsable) {
                  onChange(5 * newUsable);
                }
              }}
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
          <div style={{ fontSize: '0.7rem', color: 'var(--oni-text-muted)', marginTop: '0.15rem', fontStyle: 'italic' }}>
            Usable slots: <span style={{ color: 'var(--oni-text-primary)', fontWeight: 'bold' }}>{usableCropsPerRoom} plants</span> (room size minus 2 for Farm Station)
          </div>
        </div>

        {/* Greenhouse Rooms Slider */}
        <div style={{ marginBottom: '0.65rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
            <span className="stat-label" style={{ color: 'var(--oni-text-primary)', fontWeight: 'bold' }}>Greenhouses (Rooms)</span>
            <span style={{ fontFamily: 'var(--oni-font-mono)', fontWeight: 'bold', color: crop.color }}>{currentGreenhouseCount}</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input 
              type="range" 
              min="0" 
              max="5" 
              value={currentGreenhouseCount}
              onChange={(e) => handleGreenhouseChange(parseInt(e.target.value) || 0)}
              style={{ accentColor: crop.color, flex: 1 }}
            />
            <input 
              type="number" 
              min="0" 
              max="5"
              value={currentGreenhouseCount} 
              onChange={(e) => handleGreenhouseChange(parseInt(e.target.value) || 0)}
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

        {/* Plant Count Slider */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
            <span className="stat-label" style={{ color: 'var(--oni-text-primary)', fontWeight: 'bold' }}>Active Crops</span>
            <span style={{ fontFamily: 'var(--oni-font-mono)', fontWeight: 'bold', color: 'var(--oni-accent-oxygen)' }}>{count}</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input 
              type="range" 
              min="0" 
              max={5 * usableCropsPerRoom} 
              value={count}
              onChange={(e) => onChange(parseInt(e.target.value) || 0)}
              style={{ accentColor: crop.color, flex: 1 }}
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

        {/* Space & Greenhouses */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Maximize2 size={12} style={{ color: 'var(--oni-accent-oxygen)' }} />
            <span className="stat-label">Space:</span>
            <span style={{ fontFamily: 'var(--oni-font-mono)', fontWeight: 'bold', color: 'var(--oni-text-primary)' }}>
              {currentGreenhouseCount * roomSize} <span style={{ fontSize: '0.75rem', color: 'var(--oni-text-muted)' }}>tiles</span>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className="stat-label">Rooms:</span>
            <span style={{ fontFamily: 'var(--oni-font-mono)', fontWeight: 'bold', color: 'var(--oni-text-primary)' }}>
              {currentGreenhouseCount} <span style={{ fontSize: '0.75rem', color: 'var(--oni-text-muted)' }}>({(count / usableCropsPerRoom).toFixed(1)} ex)</span>
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
              {crop.inputs?.map((input, idx) => (
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
              {crop.outputs && crop.outputs.length > 0 ? (
                crop.outputs.map((output, idx) => (
                  <div key={idx} style={{ fontFamily: 'var(--oni-font-mono)', fontSize: '0.75rem', color: 'var(--oni-text-primary)', lineHeight: '1.2' }}>
                    {(output.amount * count).toFixed(1)} {output.unit} <span style={{ color: 'var(--oni-text-muted)', fontSize: '0.65rem', display: 'block' }}>{output.name}</span>
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--oni-text-muted)', fontSize: '0.75rem', fontStyle: 'italic' }}>None</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
