import React from 'react';
import { Trash2 } from 'lucide-react';

export function Layout({ children, onClearAll, liveSync, setLiveSync, wsStatus }) {
  return (
    <div className="app-container">
      <header className="header">
        <div>
          <h1>Dashboard Not Included</h1>
          <p style={{ color: 'var(--oni-text-muted)', fontFamily: 'var(--oni-font-mono)' }}>
            Colony Management Interface v1.0
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {/* Live Sync Toggle & Status Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(0, 0, 0, 0.25)', padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid var(--oni-panel-border)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none', fontFamily: 'var(--oni-font-mono)', fontSize: '0.85rem' }}>
              <input 
                type="checkbox" 
                checked={liveSync} 
                onChange={(e) => setLiveSync(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <span>Live Sync</span>
            </label>
            <span style={{ height: '14px', width: '1px', background: 'var(--oni-panel-border)' }}></span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: wsStatus === 'Connected' ? 'var(--oni-accent-success)' : wsStatus === 'Connecting' ? '#ffaa00' : '#888888',
                boxShadow: wsStatus === 'Connected' ? '0 0 6px var(--oni-accent-success)' : wsStatus === 'Connecting' ? '0 0 6px #ffaa00' : 'none',
                display: 'inline-block'
              }}></span>
              <span style={{ 
                fontFamily: 'var(--oni-font-mono)', 
                fontSize: '0.75rem', 
                fontWeight: 'bold',
                color: wsStatus === 'Connected' ? 'var(--oni-accent-success)' : wsStatus === 'Connecting' ? '#ffaa00' : 'var(--oni-text-muted)',
                textTransform: 'uppercase'
              }}>
                {wsStatus}
              </span>
            </div>
          </div>

          <button className="btn danger" onClick={onClearAll}>
            <Trash2 size={16} />
            Wipe Colony Data
          </button>
        </div>
      </header>
      <main>
        {children}
      </main>
      <footer>
        <p style={{ 
          textAlign: 'center', 
          fontSize: '8.5px', 
          color: 'var(--oni-text-muted)', 
          marginTop: '16px', 
          padding: '8px 10px 0 10px',
          opacity: 0.35,
          fontFamily: 'var(--oni-font-mono)',
          lineHeight: '1.2',
          letterSpacing: '0.02em'
        }}>
          Disclaimer: Dashboard Not Included is an unofficial fan utility. Oxygen Not Included and all associated assets are trademarks and copyrights of Klei Entertainment.
        </p>
      </footer>
    </div>
  );
}
