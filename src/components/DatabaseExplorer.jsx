import React, { useState, useMemo } from 'react';
import { 
  Search, Database, Flame, Shield, Map, HelpCircle, 
  Thermometer, Sun, Wind, Scale, Zap, Sparkles, Egg,
  ChevronDown, ChevronUp
} from 'lucide-react';

export function cleanName(name) {
  if (!name) return '';
  // Remove in-game rich text link tags
  let cleaned = name.replace(/<link="[^"]*">/gi, '').replace(/<\/link>/gi, '');
  // Remove any other markup tags (like font/color styling or game styles)
  cleaned = cleaned.replace(/<[^>]*>/gi, '');
  return cleaned;
}

export function DatabaseExplorer({ 
  foods = [], 
  geysers = [], 
  equipment = [], 
  spacePois = [], 
  critters = [], 
  plants = [], 
  elements = [],
  recipes = [],
  idToNameMap = {},
  loading = false, 
  error = null 
}) {
  const [subTab, setSubTab] = useState('foods');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCards, setExpandedCards] = useState({});
  const [foodSort, setFoodSort] = useState('quality_desc');
  const [foodFilter, setFoodFilter] = useState('all');

  const toggleExpand = (itemId) => {
    setExpandedCards(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleSubTabChange = (tabId) => {
    setSubTab(tabId);
    setSearchQuery('');
    setExpandedCards({});
  };

  const filteredCritters = useMemo(() => critters.filter(c => c.isRanchable !== false), [critters]);
  const filteredPlants = useMemo(() => plants.filter(p => p.isFarmable !== false), [plants]);

  const subTabs = [
    { id: 'foods', name: 'Foods', count: foods.length, icon: Flame },
    { id: 'critters', name: 'All Critters', count: filteredCritters.length, icon: HelpCircle },
    { id: 'plants', name: 'All Plants', count: filteredPlants.length, icon: HelpCircle },
    { id: 'elements', name: 'Resources', count: elements.length, icon: Scale },
  ];

  const activeList = useMemo(() => {
    switch (subTab) {
      case 'foods': return foods;
      case 'critters': return filteredCritters;
      case 'plants': return filteredPlants;
      case 'elements': return elements;
      default: return [];
    }
  }, [subTab, foods, filteredCritters, filteredPlants, elements]);

  const filteredList = useMemo(() => {
    let list = activeList;

    // Apply Food Filters
    if (subTab === 'foods') {
      if (foodFilter === 'prepared') {
        list = list.filter(item => recipes.some(r => r.outputs?.some(o => o.material === item.id)));
      } else if (foodFilter === 'raw') {
        list = list.filter(item => !recipes.some(r => r.outputs?.some(o => o.material === item.id)));
      }
    }

    const q = searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(item => {
        const name = cleanName(item.name).toLowerCase();
        const id = (item.id || '').toLowerCase();
        const prefab = (item.prefabId || '').toLowerCase();
        return name.includes(q) || id.includes(q) || prefab.includes(q);
      });
    }

    // Apply Food Sorting
    if (subTab === 'foods') {
      list = [...list].sort((a, b) => {
        if (foodSort === 'name_asc') return cleanName(a.name).localeCompare(cleanName(b.name));
        if (foodSort === 'quality_desc') return (b.quality ?? 0) - (a.quality ?? 0);
        if (foodSort === 'quality_asc') return (a.quality ?? 0) - (b.quality ?? 0);
        if (foodSort === 'cals_desc') return (b.caloriesPerUnit ?? 0) - (a.caloriesPerUnit ?? 0);
        if (foodSort === 'spoil_desc') return (b.spoilTimeCycles ?? 0) - (a.spoilTimeCycles ?? 0);
        return 0;
      });
    }

    return list;
  }, [activeList, searchQuery, subTab, foodFilter, foodSort, recipes]);

  // Utility to safely extract & format Kelvin/Celsius temperatures
  const formatTemp = (tempObj, keyPrefix) => {
    if (!tempObj) return null;
    
    // Check for direct Celsius properties
    const valC = tempObj[`${keyPrefix}Celsius`] ?? tempObj[`${keyPrefix}C`] ?? tempObj[keyPrefix];
    if (valC !== undefined && valC !== null && typeof valC === 'number') {
      return `${valC.toFixed(1)}°C`;
    }

    // Check for direct Kelvin properties and convert
    const valK = tempObj[`${keyPrefix}Kelvin`] ?? tempObj[`${keyPrefix}K`] ?? tempObj[`${keyPrefix}`];
    if (valK !== undefined && valK !== null && typeof valK === 'number') {
      return `${(valK - 273.15).toFixed(1)}°C`;
    }

    return null;
  };

  // Render color-coded Morale badges for Foods
  const renderMoraleBadge = (morale) => {
    if (morale === undefined || morale === null) return null;
    let color = 'var(--oni-accent-oxygen)'; // neutral
    let label = `+${morale} Morale`;
    if (morale > 8) {
      color = 'var(--oni-accent-success)'; // Excellent quality
    } else if (morale > 0) {
      color = '#FFFFA8'; // Good quality
    } else if (morale < 0) {
      color = 'var(--oni-accent-danger)'; // Poor quality
      label = `${morale} Morale`;
    } else {
      label = '0 Morale';
    }
    return (
      <span style={{ 
        color, 
        border: `1px solid ${color}`,
        borderRadius: '3px',
        padding: '0.15rem 0.4rem',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        fontFamily: 'var(--oni-font-mono)'
      }}>
        {label}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header and Search Tool Belt */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ color: 'var(--oni-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={22} style={{ color: 'var(--oni-accent-oxygen)' }} />
            Colony Database Databanks
          </h2>
          <p style={{ color: 'var(--oni-text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
            Live archives synchronized directly from your game DataDumps.
          </p>
        </div>

        {/* Search and Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {subTab === 'foods' && (
            <>
              <select 
                value={foodFilter} 
                onChange={e => setFoodFilter(e.target.value)}
                style={{
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.8rem',
                  border: '1px solid var(--oni-panel-border)',
                  borderRadius: '4px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  color: 'var(--oni-text-primary)',
                  fontFamily: 'var(--oni-font-mono)',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Foods</option>
                <option value="prepared">Prepared (Has Recipe)</option>
                <option value="raw">Raw / Foraged</option>
              </select>
              <select 
                value={foodSort} 
                onChange={e => setFoodSort(e.target.value)}
                style={{
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.8rem',
                  border: '1px solid var(--oni-panel-border)',
                  borderRadius: '4px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  color: 'var(--oni-text-primary)',
                  fontFamily: 'var(--oni-font-mono)',
                  cursor: 'pointer'
                }}
              >
                <option value="quality_desc">Sort: Quality (High to Low)</option>
                <option value="quality_asc">Sort: Quality (Low to High)</option>
                <option value="cals_desc">Sort: Calories (High to Low)</option>
                <option value="spoil_desc">Sort: Shelf Life (Long to Short)</option>
                <option value="name_asc">Sort: Name (A-Z)</option>
              </select>
            </>
          )}
          <div style={{ position: 'relative', minWidth: '260px' }}>
            <Search size={16} style={{ 
              position: 'absolute', 
              left: '0.75rem', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: 'var(--oni-text-muted)' 
            }} />
            <input 
              type="text" 
              placeholder={`Search ${subTabs.find(t => t.id === subTab)?.name}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.45rem 1rem 0.45rem 2.2rem', 
                fontSize: '0.85rem',
                border: '1px solid var(--oni-panel-border)',
                borderRadius: '4px',
                background: 'rgba(0, 0, 0, 0.4)',
                color: 'var(--oni-text-primary)',
                fontFamily: 'var(--oni-font-mono)'
              }}
            />
          </div>
        </div>
      </div>

      {/* Sub Tabs Bar */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '1rem', 
        borderBottom: '1px solid var(--oni-grid-line)',
        paddingBottom: '0.5rem',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }} className="subtabs-scroll">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleSubTabChange(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.8rem',
                fontSize: '0.8rem',
                background: isActive ? 'rgba(127, 191, 255, 0.15)' : 'rgba(0, 0, 0, 0.2)',
                border: `1px solid ${isActive ? 'var(--oni-accent-oxygen)' : 'var(--oni-panel-border)'}`,
                color: isActive ? 'var(--oni-text-primary)' : 'var(--oni-text-muted)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: isActive ? 'bold' : 'normal',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={12} style={{ color: isActive ? 'var(--oni-accent-oxygen)' : 'inherit' }} />
              {tab.name}
              <span style={{ 
                fontSize: '0.7rem', 
                background: 'rgba(0, 0, 0, 0.5)',
                color: 'var(--oni-text-muted)',
                padding: '0.05rem 0.3rem',
                borderRadius: '10px',
                fontFamily: 'var(--oni-font-mono)'
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '200px', 
            color: 'var(--oni-text-muted)',
            gap: '1rem'
          }}>
            <div className="loader" style={{ 
              border: '4px solid rgba(127, 191, 255, 0.1)', 
              borderTop: '4px solid var(--oni-accent-oxygen)', 
              borderRadius: '50%', 
              width: '40px', 
              height: '40px',
              animation: 'spin 1s linear infinite'
            }} />
            <span style={{ fontFamily: 'var(--oni-font-mono)', fontSize: '0.9rem' }}>Accessing Colony Databanks...</span>
          </div>
        ) : error ? (
          <div className="panel" style={{ 
            padding: '2rem', 
            textAlign: 'center', 
            borderTop: '4px solid var(--oni-accent-danger)',
            maxWidth: '500px',
            margin: '2rem auto'
          }}>
            <h3 style={{ color: 'var(--oni-accent-danger)', fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: 'bold' }}>
              Colony Sync Interrupted
            </h3>
            <p style={{ color: 'var(--oni-text-primary)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: '1.4' }}>
              The local database files in <code style={{ color: 'var(--oni-accent-calorie)', background: 'rgba(0,0,0,0.4)', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>./public/data/</code> could not be loaded.
            </p>
            <div style={{ 
              background: 'rgba(0, 0, 0, 0.4)', 
              padding: '1rem', 
              borderRadius: '4px', 
              fontSize: '0.75rem', 
              color: 'var(--oni-text-muted)',
              textAlign: 'left',
              fontFamily: 'var(--oni-font-mono)',
              border: '1px solid var(--oni-panel-border)',
              lineHeight: '1.4'
            }}>
              <div style={{ color: 'var(--oni-accent-oxygen)', fontWeight: 'bold', marginBottom: '0.4rem' }}>How to synchronize:</div>
              1. Open a PowerShell terminal.<br />
              2. Run the sync command in the root folder:<br />
              <code style={{ color: 'var(--oni-accent-calorie)', display: 'block', margin: '0.3rem 0', background: 'rgba(0,0,0,0.6)', padding: '0.2rem 0.4rem', borderRadius: '3px' }}>.\sync_data.ps1</code>
              3. Refresh this page to import the game data dumps.
            </div>
          </div>
        ) : filteredList.length === 0 ? (
          <div style={{ 
            padding: '3rem', 
            textAlign: 'center', 
            color: 'var(--oni-text-muted)',
            fontStyle: 'italic',
            fontSize: '0.9rem'
          }}>
            No database entries matched "{searchQuery}"
          </div>
        ) : (
          <div key={subTab} className="card-grid" style={{ flex: 1, overflowY: 'auto' }}>
            {filteredList.map((item) => {
              const cleaned = cleanName(item.name);
              const isExpanded = true;
              
              return (
                <div 
                  key={item.id} 
                  className="panel" 
                  style={{ 
                    padding: '1rem 1rem 1.25rem 1rem', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'flex-start',
                    borderTop: '3px solid var(--oni-panel-border)',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', flexShrink: 0 }}>
                    {/* Header: Name and specific Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem', gap: '0.5rem' }}>
                      <h4 style={{ 
                        color: 'var(--oni-text-primary)', 
                        fontWeight: 'bold', 
                        fontSize: '1.1rem',
                        lineHeight: '1.2' 
                      }}>
                        {cleaned}
                      </h4>
                      {subTab === 'foods' && renderMoraleBadge(item.moraleBonus)}
                      {subTab === 'critters' && item.lifespanCycles && (
                        <span style={{ 
                          fontSize: '0.75rem', 
                          background: 'rgba(0, 0, 0, 0.4)', 
                          padding: '0.1rem 0.35rem', 
                          borderRadius: '3px',
                          border: '1px solid var(--oni-grid-line)',
                          color: 'var(--oni-text-muted)',
                          fontFamily: 'var(--oni-font-mono)'
                        }}>
                          {item.lifespanCycles} cycles
                        </span>
                      )}
                      {subTab === 'plants' && item.growthCycles && (
                        <span style={{ 
                          fontSize: '0.75rem', 
                          background: 'rgba(0, 0, 0, 0.4)', 
                          padding: '0.1rem 0.35rem', 
                          borderRadius: '3px',
                          border: '1px solid var(--oni-grid-line)',
                          color: 'var(--oni-accent-success)',
                          fontFamily: 'var(--oni-font-mono)'
                        }}>
                          {item.growthCycles} cycles
                        </span>
                      )}
                    </div>

                    {/* DYNAMIC CARD CONTENT BASED ON TABS */}
                    
                    {/* CRITTERS TAB */}
                    {subTab === 'critters' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.75rem' }}>
                        {/* Ranchable / Wild Only Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '3px',
                            border: item.isRanchable !== false 
                              ? '1px solid rgba(168, 255, 140, 0.4)' 
                              : '1px solid rgba(255, 235, 120, 0.4)',
                            background: item.isRanchable !== false 
                              ? 'rgba(168, 255, 140, 0.15)' 
                              : 'rgba(255, 235, 120, 0.15)',
                            color: item.isRanchable !== false 
                              ? 'var(--oni-accent-success)' 
                              : '#FFFFA8',
                            fontFamily: 'var(--oni-font-mono)',
                            letterSpacing: '0.05em'
                          }}>
                            {item.isRanchable !== false ? 'Ranchable' : 'Wild Only'}
                          </span>
                        </div>
                        {/* Temperature Comfort */}
                        {item.temperatures && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Thermometer size={12} style={{ color: 'var(--oni-accent-oxygen)' }} />
                            <span style={{ color: 'var(--oni-text-muted)' }}>Comfort Temp:</span>
                            <span style={{ fontFamily: 'var(--oni-font-mono)', fontWeight: 'bold' }}>
                              {formatTemp(item.temperatures, 'comfortMin')} to {formatTemp(item.temperatures, 'comfortMax')}
                            </span>
                          </div>
                        )}
                        {/* Decor */}
                        {item.decor && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Sparkles size={12} style={{ color: '#FFFFA8' }} />
                            <span style={{ color: 'var(--oni-text-muted)' }}>Decor Value:</span>
                            <span style={{ fontFamily: 'var(--oni-font-mono)', fontWeight: 'bold' }}>
                              {item.decor.value > 0 ? `+${item.decor.value}` : item.decor.value} <span style={{ fontSize: '0.7rem', color: 'var(--oni-text-muted)' }}>(radius {item.decor.radius}t)</span>
                            </span>
                          </div>
                        )}
                        {/* Diet Summary (Collapsible) */}
                        {isExpanded && (
                          <>
                            {item.diet && item.diet.length > 0 ? (
                              <div style={{ marginTop: '0.3rem', borderTop: '1px dashed var(--oni-grid-line)', paddingTop: '0.4rem' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--oni-accent-oxygen)', marginBottom: '0.4rem' }}>Diet Parameters</div>
                                {item.diet.map((dietItem, idx) => (
                                  <div key={idx} style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    background: 'rgba(0,0,0,0.2)', 
                                    padding: '0.3rem 0.5rem', 
                                    borderRadius: '3px',
                                    marginBottom: '0.35rem',
                                    border: '1px solid var(--oni-grid-line)'
                                  }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--oni-font-mono)', gap: '0.5rem', flexWrap: 'wrap' }}>
                                      <span style={{ flex: 1, minWidth: '120px' }}>Eats: {dietItem.consumedTags 
                                        ? dietItem.consumedTags.map(t => idToNameMap[t] || cleanName(t)).join(', ') 
                                        : (idToNameMap[dietItem.consumedTag] || cleanName(dietItem.consumedTag || 'Minerals'))}</span>
                                      <span style={{ color: 'var(--oni-text-primary)', whiteSpace: 'nowrap' }}>{dietItem.dailyConsumptionKg?.toFixed(1) ?? '140'} kg/c</span>
                                    </div>
                                    {dietItem.producedElement && (
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--oni-text-muted)', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '0.2rem', paddingTop: '0.2rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <span style={{ flex: 1, minWidth: '120px' }}>Excretes: {idToNameMap[dietItem.producedElement] || cleanName(dietItem.producedElement)}</span>
                                        <span style={{ whiteSpace: 'nowrap' }}>{dietItem.dailyExcrementKg?.toFixed(1) ?? '70'} kg/c</span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div style={{ fontSize: '0.75rem', color: 'var(--oni-text-muted)', fontStyle: 'italic', marginTop: '0.3rem', borderTop: '1px dashed var(--oni-grid-line)', paddingTop: '0.4rem' }}>
                                Non-feeding variant or specialized diet.
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* PLANTS TAB */}
                    {subTab === 'plants' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.75rem' }}>
                        {/* Farmable / Wild Only Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '3px',
                            border: item.isFarmable !== false 
                              ? '1px solid rgba(168, 255, 140, 0.4)' 
                              : '1px solid rgba(255, 235, 120, 0.4)',
                            background: item.isFarmable !== false 
                              ? 'rgba(168, 255, 140, 0.15)' 
                              : 'rgba(255, 235, 120, 0.15)',
                            color: item.isFarmable !== false 
                              ? 'var(--oni-accent-success)' 
                              : '#FFFFA8',
                            fontFamily: 'var(--oni-font-mono)',
                            letterSpacing: '0.05em'
                          }}>
                            {item.isFarmable !== false ? 'Farmable' : 'Wild Only'}
                          </span>
                        </div>
                        {/* Comfort Temperature */}
                        {item.temperatures && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Thermometer size={12} style={{ color: 'var(--oni-accent-oxygen)' }} />
                            <span style={{ color: 'var(--oni-text-muted)' }}>Safe Temp:</span>
                            <span style={{ fontFamily: 'var(--oni-font-mono)', fontWeight: 'bold' }}>
                              {formatTemp(item.temperatures, 'comfortMin') ?? formatTemp(item.temperatures, 'min')} to {formatTemp(item.temperatures, 'comfortMax') ?? formatTemp(item.temperatures, 'max')}
                            </span>
                          </div>
                        )}
                        {/* Atmosphere */}
                        {item.safeAtmospheres && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Wind size={12} style={{ color: 'var(--oni-accent-success)' }} />
                            <span style={{ color: 'var(--oni-text-muted)' }}>Atmosphere:</span>
                            <span style={{ fontWeight: 'bold', color: 'var(--oni-text-primary)' }}>
                              {item.safeAtmospheres.map(cleanName).join(', ') || 'Any'}
                            </span>
                          </div>
                        )}
                        {/* Light Requirement */}
                        {item.light && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Sun size={12} style={{ color: '#FFFFA8' }} />
                            <span style={{ color: 'var(--oni-text-muted)' }}>Light:</span>
                            <span style={{ fontWeight: 'bold' }}>
                              {item.light.prefersDarkness ? 'Requires Darkness' : `${item.light.lightThresholdLux ?? 0} Lux Required`}
                            </span>
                          </div>
                        )}
                        {/* Fertilizers & Irrigation (Collapsible) */}
                        {isExpanded && (
                          <>
                            {((item.fertilizerRequirements && item.fertilizerRequirements.length > 0) || 
                              (item.irrigationRequirements && item.irrigationRequirements.length > 0)) ? (
                              <div style={{ marginTop: '0.3rem', borderTop: '1px dashed var(--oni-grid-line)', paddingTop: '0.4rem' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--oni-accent-oxygen)', marginBottom: '0.2rem' }}>Resource Demands</div>
                                {/* Fertilizers */}
                                {item.fertilizerRequirements?.map((f, idx) => (
                                  <div key={`f-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'var(--oni-font-mono)', color: 'var(--oni-text-primary)' }}>
                                    <span>Solid: {idToNameMap[f.tag] || cleanName(f.tag)}</span>
                                    <span>{f.kgPerCycle?.toFixed(1) ?? (f.massConsumptionRateKgPerSec * 600).toFixed(1)} kg/c</span>
                                  </div>
                                ))}
                                {/* Irrigation */}
                                {item.irrigationRequirements?.map((ir, idx) => (
                                  <div key={`i-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'var(--oni-font-mono)', color: 'var(--oni-text-primary)' }}>
                                    <span>Liquid: {idToNameMap[ir.tag] || cleanName(ir.tag)}</span>
                                    <span>{ir.kgPerCycle?.toFixed(1) ?? (ir.massConsumptionRateKgPerSec * 600).toFixed(1)} kg/c</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div style={{ fontSize: '0.75rem', color: 'var(--oni-text-muted)', fontStyle: 'italic', marginTop: '0.3rem', borderTop: '1px dashed var(--oni-grid-line)', paddingTop: '0.4rem' }}>
                                Requires no additional irrigation or fertilization.
                              </div>
                            )}
                            {/* Yield */}
                            {item.yield && (
                              <div style={{ 
                                marginTop: '0.3rem', 
                                paddingTop: '0.3rem', 
                                borderTop: '1px solid var(--oni-grid-line)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '0.75rem'
                              }}>
                                <span style={{ color: 'var(--oni-text-muted)' }}>Harvest Yield:</span>
                                <span style={{ fontWeight: 'bold', color: 'var(--oni-accent-oxygen)' }}>
                                  {item.yield.amount}x {idToNameMap[item.yield.itemId || item.yield.id] || cleanName(item.yield.itemId || item.yield.id)}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* FOODS TAB */}
                    {subTab === 'foods' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.75rem' }}>
                        {/* Calorie Density */}
                        {item.caloriesPerUnit !== undefined && (
                          <div style={{ 
                            marginBottom: '0.2rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            fontSize: '0.85rem',
                            background: 'rgba(0,0,0,0.2)',
                            padding: '0.3rem 0.5rem',
                            borderRadius: '3px',
                            border: '1px solid var(--oni-grid-line)'
                          }}>
                            <span style={{ color: 'var(--oni-text-muted)' }}>Calorie Output:</span>
                            <span style={{ 
                              fontFamily: 'var(--oni-font-mono)', 
                              fontWeight: 'bold', 
                              color: 'var(--oni-accent-calorie)' 
                            }}>
                              {(item.caloriesPerUnit / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })} kcal
                            </span>
                          </div>
                        )}
                        {/* Spoil & Freeze Stats (Collapsible) */}
                        {isExpanded && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', borderTop: '1px dashed var(--oni-grid-line)', paddingTop: '0.4rem', marginTop: '0.2rem' }}>
                            {/* Spoil Time */}
                            {item.spoilTimeCycles !== undefined && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <span style={{ color: 'var(--oni-text-muted)' }}>Spoilage Period:</span>
                                <span style={{ fontFamily: 'var(--oni-font-mono)', fontWeight: 'bold' }}>
                                  {item.spoilTimeCycles} cycles
                                </span>
                              </div>
                            )}
                            {/* Deep Freeze Comfort */}
                            {item.deepFreezeTemp && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <Thermometer size={12} style={{ color: 'var(--oni-accent-oxygen)' }} />
                                <span style={{ color: 'var(--oni-text-muted)' }}>Deep Freeze Below:</span>
                                <span style={{ fontFamily: 'var(--oni-font-mono)', fontWeight: 'bold', color: 'var(--oni-accent-danger)' }}>
                                  {formatTemp(item, 'deepFreezeTemp') ?? '-18.0°C'}
                                </span>
                              </div>
                            )}
                            {/* Rot Comfort */}
                            {item.rotTemp && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <Thermometer size={12} style={{ color: 'var(--oni-text-muted)' }} />
                                <span style={{ color: 'var(--oni-text-muted)' }}>Accelerated Rotting:</span>
                                <span style={{ fontFamily: 'var(--oni-font-mono)', fontWeight: 'bold' }}>
                                  {formatTemp(item, 'rotTemp') ?? '20.0°C'}
                                </span>
                              </div>
                            )}

                            {/* Recipe Information */}
                            {recipes.filter(r => r.outputs?.some(o => o.material === item.id)).map((recipe, idx) => (
                              <div key={recipe.id || idx} style={{ marginTop: '0.3rem', borderTop: '1px dashed var(--oni-grid-line)', paddingTop: '0.4rem' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--oni-accent-oxygen)', marginBottom: '0.2rem' }}>
                                  Recipe ({cleanName(recipe.fabricators?.[0] || 'Cooking Station')})
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                                  {recipe.inputs?.map((ing, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'var(--oni-font-mono)', color: 'var(--oni-text-primary)' }}>
                                      <span>Input: {idToNameMap[ing.material] || idToNameMap[ing.material?.toLowerCase()] || cleanName(ing.material)}</span>
                                      <span>{ing.amount} units</span>
                                    </div>
                                  ))}
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'var(--oni-font-mono)', color: 'var(--oni-text-muted)', marginTop: '0.1rem' }}>
                                    <span>Production Time:</span>
                                    <span>{recipe.time}s</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* GEYSERS TAB */}
                    {subTab === 'geysers' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.75rem' }}>
                        {/* Element Erupted */}
                        {item.element && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Wind size={12} style={{ color: 'var(--oni-accent-oxygen)' }} />
                            <span style={{ color: 'var(--oni-text-muted)' }}>Output Substance:</span>
                            <span style={{ fontWeight: 'bold', color: 'var(--oni-text-primary)' }}>
                              {cleanName(item.element)}
                            </span>
                          </div>
                        )}
                        {/* Eruption Temperature */}
                        {item.temperature && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Thermometer size={12} style={{ color: 'var(--oni-accent-oxygen)' }} />
                            <span style={{ color: 'var(--oni-text-muted)' }}>Erupt Temp:</span>
                            <span style={{ fontFamily: 'var(--oni-font-mono)', fontWeight: 'bold', color: 'var(--oni-accent-danger)' }}>
                              {formatTemp(item, 'temperature') ?? '?°C'}
                            </span>
                          </div>
                        )}
                        {/* Overpressure Cap */}
                        {item.maxPressure && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Scale size={12} style={{ color: 'var(--oni-accent-oxygen)' }} />
                            <span style={{ color: 'var(--oni-text-muted)' }}>Overpressures At:</span>
                            <span style={{ fontFamily: 'var(--oni-font-mono)', fontWeight: 'bold' }}>
                              {item.maxPressure} kg
                            </span>
                          </div>
                        )}
                        {/* Flow Rate */}
                        {item.flowRateKgPerCycle && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Zap size={12} style={{ color: 'var(--oni-accent-calorie)' }} />
                            <span style={{ color: 'var(--oni-text-muted)' }}>Eruption Rate:</span>
                            <span style={{ fontFamily: 'var(--oni-font-mono)', fontWeight: 'bold' }}>
                              {item.flowRateKgPerCycle.min ?? '0'} - {item.flowRateKgPerCycle.max ?? '5'} kg/c
                            </span>
                          </div>
                        )}
                        {/* Eruption & Activity Details (Collapsible) */}
                        {isExpanded && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', borderTop: '1px dashed var(--oni-grid-line)', paddingTop: '0.4rem', marginTop: '0.2rem' }}>
                            {item.eruptionPeriod && (
                              <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--oni-font-mono)' }}>
                                  <span>Eruption Period:</span>
                                  <span>{item.eruptionPeriod.duration ?? '?'}s</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--oni-text-muted)' }}>
                                  <span>Erupt Duty Cycle:</span>
                                  <span>{((item.eruptionPeriod.dutyCycle ?? 0) * 100).toFixed(0)}%</span>
                                </div>
                              </>
                            )}
                            {item.activityPeriod && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--oni-text-muted)' }}>
                                <span>Active Duty Cycle:</span>
                                <span>{((item.activityPeriod.dutyCycle ?? 0) * 100).toFixed(0)}%</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* EQUIPMENT TAB */}
                    {subTab === 'equipment' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.75rem' }}>
                        {/* Slot */}
                        {item.slot && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <span style={{ color: 'var(--oni-text-muted)' }}>Equippable Slot:</span>
                            <span style={{ fontWeight: 'bold', color: 'var(--oni-text-primary)' }}>
                              {cleanName(item.slot)}
                            </span>
                          </div>
                        )}
                        {/* Gas Tank Storage */}
                        {item.tank && (
                          <div style={{ 
                            background: 'rgba(0,0,0,0.2)', 
                            padding: '0.3rem 0.5rem', 
                            borderRadius: '3px',
                            border: '1px solid var(--oni-grid-line)',
                            marginTop: '0.3rem'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                              <span style={{ color: 'var(--oni-accent-oxygen)' }}>Storage Gas:</span>
                              <span style={{ fontFamily: 'var(--oni-font-mono)' }}>{cleanName(item.tank.element)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--oni-text-muted)', marginTop: '0.15rem' }}>
                              <span>Tank Capacity:</span>
                              <span style={{ fontFamily: 'var(--oni-font-mono)' }}>{item.tank.capacityKg} kg</span>
                            </div>
                          </div>
                        )}
                        {/* Suit Modifiers (Collapsible) */}
                        {isExpanded && (
                          <div style={{ marginTop: '0.3rem', borderTop: '1px dashed var(--oni-grid-line)', paddingTop: '0.4rem' }}>
                            {item.attributes && item.attributes.length > 0 ? (
                              <>
                                <div style={{ fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--oni-accent-oxygen)', marginBottom: '0.2rem' }}>Stat Adjustments</div>
                                {item.attributes.map((attr, idx) => (
                                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--oni-font-mono)' }}>
                                    <span>{attr.name ?? attr.attributeId ?? 'Stat'}:</span>
                                    <span style={{ color: attr.value < 0 ? 'var(--oni-accent-danger)' : 'var(--oni-accent-success)' }}>
                                      {attr.value > 0 ? `+${attr.value}` : attr.value}
                                    </span>
                                  </div>
                                ))}
                              </>
                            ) : (
                              <div style={{ fontSize: '0.75rem', color: 'var(--oni-text-muted)', fontStyle: 'italic' }}>
                                No external attributes or movement penalties.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ELEMENTS/RESOURCES TAB */}
                    {subTab === 'elements' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.75rem' }}>
                        {/* State */}
                        {item.state && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <span style={{ color: 'var(--oni-text-muted)' }}>Physical State:</span>
                            <span style={{ 
                              fontWeight: 'bold', 
                              color: item.state === 'Solid' ? 'var(--oni-accent-success)' : item.state === 'Liquid' ? 'var(--oni-accent-oxygen)' : '#FFFFA8' 
                            }}>
                              {item.state}
                            </span>
                          </div>
                        )}
                        {/* Specific Heat Capacity */}
                        {item.specificHeatCapacity !== undefined && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <span style={{ color: 'var(--oni-text-muted)' }}>Specific Heat:</span>
                            <span style={{ fontFamily: 'var(--oni-font-mono)', fontWeight: 'bold' }}>
                              {item.specificHeatCapacity} (DTU/g)/°C
                            </span>
                          </div>
                        )}
                        {/* Thermal Conductivity */}
                        {item.thermalConductivity !== undefined && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <span style={{ color: 'var(--oni-text-muted)' }}>Thermal Cond:</span>
                            <span style={{ fontFamily: 'var(--oni-font-mono)', fontWeight: 'bold' }}>
                              {item.thermalConductivity} W/(m·K)
                            </span>
                          </div>
                        )}
                        {/* Molar Mass */}
                        {item.molarMass !== undefined && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <span style={{ color: 'var(--oni-text-muted)' }}>Molar Mass:</span>
                            <span style={{ fontFamily: 'var(--oni-font-mono)', fontWeight: 'bold' }}>
                              {item.molarMass.toFixed(2)} g/mol
                            </span>
                          </div>
                        )}
                        {/* Hardness */}
                        {item.hardness !== undefined && item.hardness > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <span style={{ color: 'var(--oni-text-muted)' }}>Hardness:</span>
                            <span style={{ fontFamily: 'var(--oni-font-mono)', fontWeight: 'bold' }}>
                              {item.hardness}
                            </span>
                          </div>
                        )}
                        {/* Transition targets (Collapsible) */}
                        {isExpanded && (
                          <>
                            {(item.highTemp !== undefined || item.lowTemp !== undefined) && (
                              <div style={{ marginTop: '0.3rem', borderTop: '1px dashed var(--oni-grid-line)', paddingTop: '0.4rem' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--oni-accent-oxygen)', marginBottom: '0.2rem' }}>Phase Transitions</div>
                                {item.highTemp !== undefined && item.highTemp > 0 && item.highTempTransitionTarget && item.highTempTransitionTarget !== '0' && (
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--oni-font-mono)', fontSize: '0.7rem' }}>
                                    <span>Melts/Gas at:</span>
                                    <span style={{ color: 'var(--oni-accent-danger)' }}>{item.highTemp.toFixed(1)} K / {cleanName(item.highTempTransitionTarget)}</span>
                                  </div>
                                )}
                                {item.lowTemp !== undefined && item.lowTemp > 0 && item.lowTempTransitionTarget && item.lowTempTransitionTarget !== '0' && (
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--oni-font-mono)', fontSize: '0.7rem' }}>
                                    <span>Freezes at:</span>
                                    <span style={{ color: 'var(--oni-accent-oxygen)' }}>{item.lowTemp.toFixed(1)} K / {cleanName(item.lowTempTransitionTarget)}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
