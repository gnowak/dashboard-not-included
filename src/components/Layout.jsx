import React from 'react';
import { Trash2 } from 'lucide-react';

export function Layout({ children, onClearAll }) {
  return (
    <div className="app-container">
      <header className="header">
        <div>
          <h1>Dashboard Not Included</h1>
          <p style={{ color: 'var(--oni-text-muted)', fontFamily: 'var(--oni-font-mono)' }}>
            Colony Management Interface v1.0
          </p>
        </div>
        <button className="btn danger" onClick={onClearAll}>
          <Trash2 size={16} />
          Wipe Colony Data
        </button>
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
