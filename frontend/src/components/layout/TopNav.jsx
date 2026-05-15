import React, { useState } from 'react';
import { Calculator, Bell, Sun, Moon } from 'lucide-react';
import { BomCalculator } from '../BomCalculator';

export const TopNav = ({ theme, toggleTheme }) => {
  const [isCalcOpen, setIsCalcOpen] = useState(false);

  return (
    <>
      <header className="topnav">
        {/* Brand */}
        <div className="topnav-brand">
        </div>

        {/* Actions */}
        <div className="topnav-actions">

          <button className="icon-button" title="Notifications">
            <Bell size={19} />
          </button>

          <button
            className="icon-button"
            title="BOM Calculator"
            onClick={() => setIsCalcOpen(true)}
            style={isCalcOpen ? { color: 'var(--accent-primary)', backgroundColor: 'var(--accent-light)' } : {}}
          >
            <Calculator size={19} />
          </button>

          {/* Divider */}
          <div style={{ width: '1px', height: '22px', backgroundColor: 'var(--border-color)', margin: '0 0.35rem' }} />

          <button className="icon-button" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
          </button>

          {/* User pill — static until login is introduced */}
          <div className="topnav-user">
            <div className="topnav-user-avatar">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Matt"
                alt="User Avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.1) translateY(4px)' }}
              />
            </div>
            <span>Hi User</span>
          </div>

        </div>
      </header>

      {isCalcOpen && <BomCalculator onClose={() => setIsCalcOpen(false)} />}
    </>
  );
};
