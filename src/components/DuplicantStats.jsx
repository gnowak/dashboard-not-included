import React, { useState, useMemo } from 'react';
import { DUPLICANT_STATS, CRITTER_DATA } from '../data/critters';
import { CROP_DATA } from '../data/crops';
import { Maximize2, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { getImageUrl, formatResourceName } from '../utils/images';

export function DuplicantStats({ 
  duplicants, 
  setDuplicants, 
  growthMode,
  setGrowthMode,
  caloriePreset,
  setCaloriePreset,
  customCalorieInput,
  setCustomCalorieInput,
  o2Preset,
  setO2Preset,
  customO2Input,
  setCustomO2Input,
  totalCalories, 
  ranches, 
  crops, 
  critterData = {},
  cropData = {}
}) {
  const [isDemandsExpanded, setIsDemandsExpanded] = useState(true);
  const [isAggregatesExpanded, setIsAggregatesExpanded] = useState(true);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  
  const o2PerDuplicant = o2Preset === 'custom' ? customO2Input : (parseInt(o2Preset) || 60);
  const o2Needed = duplicants * o2PerDuplicant;
  const caloriesPerDuplicant = caloriePreset === 'custom' ? customCalorieInput : (parseInt(caloriePreset) || 1000);
  const caloriesNeeded = duplicants * caloriesPerDuplicant;
  
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

    const activeCritterData = Object.keys(critterData).length > 0 ? critterData : CRITTER_DATA;

    // Process Ranches
    ranches.forEach(ranch => {
      const critter = activeCritterData[ranch.critterType];
      if (!critter || ranch.count <= 0) return;

      // Space
      if (ranch.critterType === 'pacu') {
        waterSpace += critter.spaceRequired * ranch.count;
      } else {
        landSpace += critter.spaceRequired * ranch.count;
      }

      // Stables (wild critters do not require domestic stables)
      if (ranch.ranchState !== 'wild') {
        totalStables += Math.ceil(ranch.count / (critter.maxSize || 8));
      }

      // Feed/metabolism multiplier based on happiness state
      const feedMult = ranch.ranchState === 'glum' ? 0.2 : ranch.ranchState === 'wild' ? 0.0 : 1.0;

      // Inputs
      if (critter.inputs && critter.inputs.length > 0) {
        const activeFeedName = ranch.activeFeed || critter.inputs[0].name;
        const activeInput = critter.inputs.find(input => input.name === activeFeedName) || critter.inputs[0];
        
        if (activeInput) {
          const totalAmt = activeInput.amount * ranch.count * feedMult;
          const key = `${activeInput.name}_${activeInput.unit}`;
          if (!inputs[key]) {
            inputs[key] = { name: activeInput.name, unit: activeInput.unit, amount: 0 };
          }
          inputs[key].amount += totalAmt;
        }
      }

      // Outputs
      if (critter.outputs && critter.outputs.length > 0) {
        const activeFeedName = ranch.activeFeed || (critter.inputs && critter.inputs[0]?.name) || '';
        const activeInputIdx = critter.inputs ? critter.inputs.findIndex(input => input.name === activeFeedName) : 0;
        
        const activeOutputs = critter.inputs && critter.inputs.length > 0
          ? (critter.outputs[activeInputIdx >= 0 ? activeInputIdx : 0] ? [critter.outputs[activeInputIdx >= 0 ? activeInputIdx : 0]] : [])
          : critter.outputs;

        activeOutputs.forEach(output => {
          const totalAmt = output.amount * ranch.count * feedMult;
          const key = `${output.name}_${output.unit}`;
          if (!outputs[key]) {
            outputs[key] = { name: output.name, unit: output.unit, amount: 0 };
          }
          outputs[key].amount += totalAmt;
        });
      }
    });

    // Process Crops
    const activeCropData = Object.keys(cropData).length > 0 ? cropData : CROP_DATA;

    crops.forEach(cropItem => {
      const crop = activeCropData[cropItem.cropType];
      if (!crop || cropItem.count <= 0) return;

      const roomSize = cropItem.roomSize || 96;
      let activePlanter = cropItem.planterType;
      if (!activePlanter) {
        const planters = crop.acceptedPlanters || [];
        const farmPlanters = planters.filter(p => 
          p === 'PlanterBox' || p === 'FarmTile' || p === 'HydroponicFarm' || p === 'LargeBackwallFarm' || p === 'WideFarmTile'
        );
        if (farmPlanters.length > 0) {
          activePlanter = farmPlanters[0];
        } else {
          const lowerId = crop.id?.toLowerCase() || '';
          if (lowerId.includes('dewpalm') || lowerId === 'clam') {
            activePlanter = 'WideFarmTile';
          } else if (lowerId.includes('planktoncoral') || lowerId.includes('urchinplant')) {
            activePlanter = 'LargeBackwallFarm';
          } else {
            activePlanter = 'HydroponicFarm';
          }
        }
      }
      const planterWidth = activePlanter === 'WideFarmTile' ? 3 : (activePlanter === 'LargeBackwallFarm' ? 2 : 1);
      const usableCropsPerRoom = Math.max(1, Math.floor((Math.floor(roomSize / 4) - 2) / planterWidth));
      const greenhousesNeeded = Math.ceil(cropItem.count / usableCropsPerRoom);
      totalGreenhouses += greenhousesNeeded;
      agricultureSpace += greenhousesNeeded * roomSize;

      const plantMult = cropItem.growthMode === 'wild' ? 0.25 : (cropItem.farmerTouch ? 2.0 : 1.0);
      const inputMult = cropItem.growthMode === 'wild' ? 0.0 : 1.0;

      // Inputs
      if (crop.inputs) {
        crop.inputs.forEach(input => {
          const totalAmt = input.amount * cropItem.count * inputMult;
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
          const totalAmt = output.amount * cropItem.count * plantMult;
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
  }, [ranches, crops, critterData, cropData]);

  const hasActiveProduction = ranches.some(r => r.count > 0) || crops.some(c => c.count > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Colony Demands Panel */}
      <div className="panel" style={{ padding: '1rem', fontSize: '0.9rem' }}>
        <h2 
          onClick={() => setIsDemandsExpanded(!isDemandsExpanded)}
          style={{ 
            color: 'var(--oni-accent-oxygen)', 
            marginBottom: isDemandsExpanded ? '1rem' : '0', 
            fontSize: '1.15rem', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            cursor: 'pointer', 
            userSelect: 'none',
            fontFamily: 'var(--oni-font-mono)',
            margin: 0
          }}
        >
          Colony Demands
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--oni-font-mono)', opacity: 0.7 }}>{isDemandsExpanded ? '▼' : '▲'}</span>
        </h2>
        
        {isDemandsExpanded && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.85rem' }}>
            <div className="stat-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.4rem', marginBottom: '0.4rem' }}>
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
                    width: '56px', 
                    fontSize: '0.9rem', 
                    padding: '0.15rem',
                    textAlign: 'center',
                    border: '1px solid var(--oni-panel-border)',
                    background: 'rgba(0, 0, 0, 0.4)',
                    color: 'var(--oni-text-primary)',
                    fontFamily: 'var(--oni-font-mono)'
                  }}
                />
              </div>
            </div>

            <div className="stat-row" style={{ marginBottom: '0.15rem' }}>
              <span className="stat-label">O2 Required</span>
              <span className="stat-value oxygen" style={{ fontSize: '1.1rem' }}>{o2Needed} kg/c</span>
            </div>
            
            <div className="stat-row" style={{ marginBottom: '0.15rem' }}>
              <span className="stat-label">Calories Required</span>
              <span className="stat-value calories" style={{ fontSize: '1.1rem' }}>{caloriesNeeded.toLocaleString()} kcal</span>
            </div>

            <div style={{ marginTop: '0.4rem', paddingTop: '0.6rem', borderTop: '1px solid var(--oni-grid-line-thick)' }}>
              <h3 style={{ color: 'var(--oni-text-muted)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Caloric Balance</h3>
              <div className="stat-row" style={{ marginBottom: '0.15rem' }}>
                <span className="stat-label">Harvest Total</span>
                <span className="stat-value calories" style={{ fontSize: '1.1rem' }}>{totalCalories.toFixed(0)} kcal</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Net Balance</span>
                <span className="stat-value" style={{ fontSize: '1.1rem', color: isDeficit ? 'var(--oni-accent-danger)' : 'var(--oni-accent-success)' }}>
                  {calorieDiff > 0 ? '+' : ''}{calorieDiff.toFixed(0)} kcal
                </span>
              </div>
            </div>

            {/* Colony Modifiers Collapsible Sub-panel */}
            <div style={{ marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '1px dashed var(--oni-panel-border)' }}>
              <div 
                onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  cursor: 'pointer', 
                  userSelect: 'none'
                }}
              >
                <h3 style={{ color: 'var(--oni-text-muted)', fontSize: '0.85rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  ⚙ Colony Modifiers
                </h3>
                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{isSettingsExpanded ? '▼' : '▲'}</span>
              </div>
              
              {isSettingsExpanded && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.6rem' }}>
                  {/* Calorie Intake Presets */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <label className="stat-label" style={{ fontSize: '0.75rem' }}>Calorie Preset</label>
                    <select 
                      value={caloriePreset} 
                      onChange={(e) => setCaloriePreset(e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '0.25rem', 
                        background: 'rgba(0, 0, 0, 0.4)', 
                        border: '1px solid var(--oni-panel-border)',
                        color: 'var(--oni-text-primary)',
                        borderRadius: '4px', 
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="1000">Standard Dupe (1000 kcal)</option>
                      <option value="500">Half Intake (500 kcal)</option>
                      <option value="1500">Glutton (1500 kcal)</option>
                      <option value="custom">Custom Target</option>
                    </select>
                  </div>
                  
                  {caloriePreset === 'custom' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', background: 'rgba(0,0,0,0.2)', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--oni-panel-border)' }}>
                      <label className="stat-label" style={{ fontSize: '0.7rem' }}>Custom kcal/cycle</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <input 
                          type="range" 
                          min="300" 
                          max="2500" 
                          step="50"
                          value={customCalorieInput} 
                          onChange={(e) => setCustomCalorieInput(parseInt(e.target.value) || 1000)}
                          style={{ flex: 1 }}
                        />
                        <span style={{ fontFamily: 'var(--oni-font-mono)', fontSize: '0.75rem', fontWeight: 'bold', minWidth: '32px', textAlign: 'right' }}>
                          {customCalorieInput}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Oxygen Consumption Presets */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', borderTop: '1px solid var(--oni-grid-line)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                    <label className="stat-label" style={{ fontSize: '0.75rem' }}>Oxygen Preset</label>
                    <select 
                      value={o2Preset} 
                      onChange={(e) => setO2Preset(e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '0.25rem', 
                        background: 'rgba(0, 0, 0, 0.4)', 
                        border: '1px solid var(--oni-panel-border)',
                        color: 'var(--oni-text-primary)',
                        borderRadius: '4px', 
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="60">Standard Dupe (60 kg/c)</option>
                      <option value="45">Diver's Lungs (45 kg/c)</option>
                      <option value="120">Mouth Breather (120 kg/c)</option>
                      <option value="custom">Custom Target</option>
                    </select>
                  </div>
                  
                  {o2Preset === 'custom' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', background: 'rgba(0,0,0,0.2)', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--oni-panel-border)' }}>
                      <label className="stat-label" style={{ fontSize: '0.7rem' }}>Custom kg/cycle</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <input 
                          type="range" 
                          min="15" 
                          max="180" 
                          step="5"
                          value={customO2Input} 
                          onChange={(e) => setCustomO2Input(parseInt(e.target.value) || 60)}
                          style={{ flex: 1 }}
                        />
                        <span style={{ fontFamily: 'var(--oni-font-mono)', fontSize: '0.75rem', fontWeight: 'bold', minWidth: '32px', textAlign: 'right' }}>
                          {customO2Input}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Colony-wide Resource Summary Panel */}
      {hasActiveProduction && (
        <div className="panel" style={{ borderTop: '4px solid var(--oni-accent-calorie)', padding: '1rem' }}>
          <h2 
            onClick={() => setIsAggregatesExpanded(!isAggregatesExpanded)}
            style={{ 
              color: 'var(--oni-accent-calorie)', 
              marginBottom: isAggregatesExpanded ? '1rem' : '0', 
              fontSize: '1.15rem', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              cursor: 'pointer', 
              userSelect: 'none',
              fontFamily: 'var(--oni-font-mono)',
              margin: 0
            }}
          >
            Colony Aggregates
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--oni-font-mono)', opacity: 0.7 }}>{isAggregatesExpanded ? '▼' : '▲'}</span>
          </h2>

          {isAggregatesExpanded && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.85rem' }}>
              {/* Space & Stable Totals */}
              {(aggregates.totalStables > 0 || aggregates.totalGreenhouses > 0) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
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
                display: 'flex', 
                flexDirection: 'column', 
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {aggregates.inputs.map((input, idx) => (
                        <div key={idx} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          background: 'rgba(239, 68, 68, 0.05)', 
                          padding: '0.3rem 0.5rem', 
                          borderRadius: '3px', 
                          border: '1px solid rgba(239, 68, 68, 0.15)' 
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <img 
                              src={getImageUrl(formatResourceName(input.name))} 
                              alt={formatResourceName(input.name)} 
                              style={{ width: '16px', height: '16px', objectFit: 'contain' }}
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <span style={{ color: 'var(--oni-text-primary)', fontSize: '0.8rem' }}>{formatResourceName(input.name)}</span>
                          </div>
                          <span style={{ fontFamily: 'var(--oni-font-mono)', fontWeight: 'bold', color: 'var(--oni-accent-danger)', fontSize: '0.85rem' }}>
                            {input.amount.toFixed(1)} {input.unit}/c
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Total Outputs */}
                <div style={{ borderTop: '1px solid var(--oni-grid-line)', paddingTop: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--oni-accent-success)', fontWeight: 'bold', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    <ArrowUpRight size={14} /> Total Outputs
                  </div>
                  {aggregates.outputs.length === 0 ? (
                    <div style={{ color: 'var(--oni-text-muted)', fontSize: '0.8rem' }}>None</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {aggregates.outputs.map((output, idx) => (
                        <div key={idx} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          background: 'rgba(168, 255, 140, 0.05)', 
                          padding: '0.3rem 0.5rem', 
                          borderRadius: '3px', 
                          border: '1px solid rgba(168, 255, 140, 0.15)' 
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <img 
                              src={getImageUrl(formatResourceName(output.name))} 
                              alt={formatResourceName(output.name)} 
                              style={{ width: '16px', height: '16px', objectFit: 'contain' }}
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <span style={{ color: 'var(--oni-text-primary)', fontSize: '0.8rem' }}>{formatResourceName(output.name)}</span>
                          </div>
                          <span style={{ fontFamily: 'var(--oni-font-mono)', fontWeight: 'bold', color: 'var(--oni-accent-success)', fontSize: '0.85rem' }}>
                            {output.amount.toFixed(1)} {output.unit}/c
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
