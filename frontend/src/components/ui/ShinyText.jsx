import React from 'react';

const ShinyText = ({ text, disabled = false, speed = 3, className = '', color = '#93c5fd', shineColor = '#ffffff' }) => {
  const animationDuration = `${speed}s`;
  
  return (
    <div
      className={`relative inline-block ${disabled ? '' : 'animate-shine'} ${className}`}
      style={{
        backgroundImage: `linear-gradient(120deg, ${color} 40%, ${shineColor} 50%, ${color} 60%)`,
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        display: 'inline-block',
        animation: disabled ? 'none' : `shine ${animationDuration} linear infinite`,
      }}
    >
      {text}
    </div>
  );
};

export default ShinyText;
