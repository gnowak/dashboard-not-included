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
    </div>
  );
}
