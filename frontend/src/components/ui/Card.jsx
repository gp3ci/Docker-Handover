import React from 'react';
import { motion } from 'framer-motion';
import './ui.css';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={`ui-card ${className}`} 
      {...props}
    >
      {children}
    </motion.div>
  );
};
