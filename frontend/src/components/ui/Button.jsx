import React from 'react';
import { motion } from 'framer-motion';
import './ui.css';

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  return (
    <motion.button 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`ui-btn ui-btn-${variant} ${className}`} 
      {...props}
    >
      {children}
    </motion.button>
  );
};
