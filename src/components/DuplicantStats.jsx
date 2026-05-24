import React, { useMemo } from 'react';
import { DUPLICANT_STATS, CRITTER_DATA } from '../data/critters';
import { CROP_DATA } from '../data/crops';
import { Maximize2, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export function DuplicantStats({ duplicants, setDuplicants, totalCalories, ranches, crops }) {
  const o2Needed = duplicants * DUPLICANT_STATS.o2PerCycle;
  const caloriesNeeded = duplicants * DUPLICANT_STATS.caloriesPerCycle;
  
  // Calculate surplus/deficit
  const calorieDiff = totalCalories - caloriesNeeded;
  const isDeficit = calorieDiff < 0;

  // Aggregate colony-wide ranch and crop stats
  const aggregates = useMemo(() => {
    let landSpace = 0;
    let waterSpace = 0;
    let totalStables = 0;
    let totalGreenhouses = 0;
    let agricultureSpace = 0;
    const inputs = {};
    const outputs = {};

    // Process Ranches
    ranches.forEach(ranch => {
      const critter = CRITTER_DATA[ranch.critterType];
      if (!critter || ranch.count <= 0) return;

      // Space
      if (ranch.critterType === 'pacu') {
        waterSpace += critter.spaceRequired * ranch.count;
      } else {
        landSpace += critter.spaceRequired * ranch.count;
      }

      // Stables
      totalStables += Math.ceil(ranch.count / critter.maxSize);

      // Inputs
      if (critter.inputs) {
        critter.inputs.forEach(input => {
          const totalAmt = input.amount * ranch.count;
          const key = `${input.name}_${input.unit}`;
          if (!inputs[key]) {
            inputs[key] = { name: input.name, unit: input.unit, amount: 0 };
          }
          inputs[key].amount += totalAmt;
        });
      }

      // Outputs
      if (critter.outputs) {
        critter.outputs.forEach(output => {
          const totalAmt = output.amount * ranch.count;
          const key = `${output.name}_${output.unit}`;
          if (!outputs[key]) {
            outputs[key] = { name: output.name, unit: output.unit, amount: 0 };
          }
          outputs[key].amount += totalAmt;
        });
      }
    });

    // Process Crops
    crops.forEach(cropItem => {
      const crop = CROP_DATA[cropItem.cropType];
      if (!crop || cropItem.count <= 0) return;

      const roomSize = cropItem.roomSize || 96;
      const usableCropsPerRoom = Math.max(1, roomSize - 2);
      const greenhousesNeeded = Math.ceil(cropItem.count / usableCropsPerRoom);
      totalGreenhouses += greenhousesNeeded;
      agricultureSpace += greenhousesNeeded * roomSize;

      // Inputs
      if (crop.inputs) {
        crop.inputs.forEach(input => {
          const totalAmt = input.amount * cropItem.count;
          const key = `${input.name}_${input.unit}`;
          if (!inputs[key]) {
            inputs[key] = { name: input.name, unit: input.unit, amount: 0 };
          }
          inputs[key].amount += totalAmt;
        });
      }

      // Outputs
      if (crop.outputs) {
        crop.outputs.forEach(output => {
          const totalAmt = output.amount * cropItem.count;
          const key = `${output.name}_${output.unit}`;
          if (!outputs[key]) {
            outputs[key] = { name: output.name, unit: output.unit, amount: 0 };
          }
          outputs[key].amount += totalAmt;
        });
      }
    });

    return { 
      landSpace, 
      waterSpace, 
      totalStables,
      totalGreenhouses,
      agricultureSpace,
      inputs: Object.values(inputs), 
      outputs: Object.values(outputs) 
    };
  }, [ranches, crops]);

  const hasActiveProduction = ranches.some(r => r.count > 0) || crops.some(c => c.count > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Colony Demands Panel */}
      <div className="panel" style={{ padding: '1.25rem', fontSize: '0.9rem' }}>
        <h2 style={{ color: 'var(--oni-accent-oxygen)', marginBottom: '1.25rem', fontSize: '1.2rem' }}>
          Colony Demands
        </h2>
        
        <div className="stat-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.4rem', marginBottom: '1.25rem' }}>
          <label className="stat-label" style={{ fontSize: '0.8rem' }}>Active Duplicants</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
            <input 
              type="range" 
              min="1" 
              max="100" 
              value={duplicants} 
              onChange={(e) => setDuplicants(parseInt(e.target.value) || 1)}
            />
            <input 
              type="number" 
              min="1" 
              value={duplicants} 
              onChange={(e) => setDuplicants(parseInt(e.target.value) || 1)}
              style={{ 
                width: '65px', 
                fontSize: '1rem', 
                padding: '0.2rem',
                textAlign: 'center',
                border: '1px solid var(--oni-panel-border)',
                background: 'rgba(0, 0, 0, 0.4)',
                color: 'var(--oni-text-primary)',
                fontFamily: 'var(--oni-font-mono)'
              }}
            />
          </div>
        </div>

        <div className="stat-row" style={{ marginBottom: '0.5rem' }}>
          <span className="stat-label">O2 Required</span>
          <span className="stat-value oxygen" style={{ fontSize: '1.2rem' }}>{o2Needed} kg/c</span>
        </div>
        
        <div className="stat-row" style={{ marginBottom: '0.5rem' }}>
          <span className="stat-label">Calories Required</span>
          <span className="stat-value calories" style={{ fontSize: '1.2rem' }}>{caloriesNeeded} kcal/c</span>
        </div>

        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--oni-grid-line-thick)' }}>
          <h3 style={{ color: 'var(--oni-text-muted)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>Caloric Balance</h3>
          <div className="stat-row" style={{ marginBottom: '0.5rem' }}>
            <span className="stat-label">Ranch/Farm Harvest</span>
            <span className="stat-value calories" style={{ fontSize: '1.2rem' }}>{totalCalories.toFixed(0)} kcal/c</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Net Balance</span>
            <span className="stat-value" style={{ fontSize: '1.2rem', color: isDeficit ? 'var(--oni-accent-danger)' : 'var(--oni-accent-success)' }}>
              {calorieDiff > 0 ? '+' : ''}{calorieDiff.toFixed(0)} kcal/c
            </span>
          </div>
        </div>
      </div>

      {/* Colony-wide Resource Summary Panel */}
      {hasActiveProduction && (
        <div className="panel" style={{ borderTop: '4px solid var(--oni-accent-calorie)' }}>
          <h2 style={{ color: 'var(--oni-accent-calorie)', marginBottom: '1rem', fontSize: '1.2rem' }}>
            Colony Aggregates
          </h2>

          {/* Space & Stable Totals */}
          {(aggregates.totalStables > 0 || aggregates.totalGreenhouses > 0) && (
            <div style={{ marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {/* Land Space (Ranches) */}
              {aggregates.landSpace > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <Maximize2 size={14} style={{ color: 'var(--oni-accent-oxygen)' }} />
                  <span className="stat-label">Ranch Land Space:</span>
                  <span style={{ fontFamily: 'var(--oni-font-mono)', fontWeight: 'bold' }}>
                    {aggregates.landSpace} <span style={{ fontSize: '0.85rem', color: 'var(--oni-text-muted)' }}>tiles</span>
                  </span>
                </div>
              )}
              {/* Liquid Space (Ranches - Pacu) */}
              {aggregates.waterSpace > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <Maximize2 size={14} style={{ color: 'var(--oni-accent-oxygen)' }} />
                  <span className="stat-label">Ranch Liquid Space:</span>
                  <span style={{ fontFamily: 'var(--oni-font-mono)', fontWeight: 'bold' }}>
                    {aggregates.waterSpace} <span style={{ fontSize: '0.85rem', color: 'var(--oni-text-muted)' }}>tiles</span>
                  </span>
                </div>
              )}
              {/* Agriculture Space (Greenhouses) */}
              {aggregates.agricultureSpace > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <Maximize2 size={14} style={{ color: 'var(--oni-accent-oxygen)' }} />
                  <span className="stat-label">Greenhouse Space:</span>
                  <span style={{ fontFamily: 'var(--oni-font-mono)', fontWeight: 'bold' }}>
                    {aggregates.agricultureSpace} <span style={{ fontSize: '0.85rem', color: 'var(--oni-text-muted)' }}>tiles</span>
                  </span>
                </div>
              )}
              {/* Stables Required */}
              {aggregates.totalStables > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', borderTop: '1px solid var(--oni-grid-line)', paddingTop: '0.4rem', marginTop: '0.2rem' }}>
                  <span className="stat-label">96-Tile Stables:</span>
                  <span style={{ fontFamily: 'var(--oni-font-mono)', fontWeight: 'bold', color: 'var(--oni-accent-oxygen)' }}>
                    {aggregates.totalStables} <span style={{ fontSize: '0.75rem', color: 'var(--oni-text-muted)', fontWeight: 'normal' }}>required</span>
                  </span>
                </div>
              )}
              {/* Greenhouses Required */}
              {aggregates.totalGreenhouses > 0 && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  fontSize: '0.9rem', 
                  borderTop: aggregates.totalStables > 0 ? 'none' : '1px solid var(--oni-grid-line)', 
                  paddingTop: aggregates.totalStables > 0 ? '0' : '0.4rem', 
                  marginTop: aggregates.totalStables > 0 ? '0' : '0.2rem' 
                }}>
                  <span className="stat-label">Greenhouses:</span>
                  <span style={{ fontFamily: 'var(--oni-font-mono)', fontWeight: 'bold', color: 'var(--oni-accent-oxygen)' }}>
                    {aggregates.totalGreenhouses} <span style={{ fontSize: '0.75rem', color: 'var(--oni-text-muted)', fontWeight: 'normal' }}>required</span>
                  </span>
                </div>
              )}
            </div>
          )}

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '1rem', 
            fontSize: '0.9rem', 
            borderTop: (aggregates.totalStables > 0 || aggregates.totalGreenhouses > 0) ? '1px dashed var(--oni-grid-line-thick)' : 'none', 
            paddingTop: (aggregates.totalStables > 0 || aggregates.totalGreenhouses > 0) ? '1rem' : '0' 
          }}>
            {/* Total Inputs */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--oni-accent-danger)', fontWeight: 'bold', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                <ArrowDownRight size={14} /> Total Inputs
              </div>
              {aggregates.inputs.length === 0 ? (
                <div style={{ color: 'var(--oni-text-muted)', fontSize: '0.8rem' }}>None</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {aggregates.inputs.map((input, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontFamily: 'var(--oni-font-mono)', fontWeight: 'bold' }}>
                        {input.amount.toFixed(1)} {input.unit}/c
                      </span>
                      <span style={{ color: 'var(--oni-text-muted)', fontSize: '0.8rem' }}>{input.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total Outputs */}
            <div style={{ borderLeft: '1px solid var(--oni-grid-line)', paddingLeft: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--oni-accent-success)', fontWeight: 'bold', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                <ArrowUpRight size={14} /> Total Outputs
              </div>
              {aggregates.outputs.length === 0 ? (
                <div style={{ color: 'var(--oni-text-muted)', fontSize: '0.8rem' }}>None</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {aggregates.outputs.map((output, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontFamily: 'var(--oni-font-mono)', fontWeight: 'bold' }}>
                        {output.amount.toFixed(1)} {output.unit}/c
                      </span>
                      <span style={{ color: 'var(--oni-text-muted)', fontSize: '0.8rem' }}>{output.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
