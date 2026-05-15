import React from 'react';
import './ui.css';

export const Input = ({ label, className = '', ...props }) => {
  return (
    <div className="ui-input-group">
      {label && <label className="ui-label">{label}</label>}
      <input className={`ui-input ${className}`} {...props} />
    </div>
  );
};
