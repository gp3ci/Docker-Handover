import React from 'react';
import { motion } from 'framer-motion';
import { Map, MapPinned, Zap, BarChart2, BookOpen, User, Settings, Bell, HelpCircle } from 'lucide-react';
import './layout.css';

export const Sidebar = ({ activeView, setActiveView }) => {
  const menuItems = [
    { id: 'intro', label: 'Intro', icon: <User size={20} /> },
    { id: 'before', label: 'Before', icon: <Map size={20} /> },
    { id: 'after', label: 'Fiber', icon: <MapPinned size={20} /> },
    { id: 'coax', label: 'Coax', icon: <Zap size={20} /> },
    { id: 'instructions', label: 'Instructions', icon: <BookOpen size={20} /> },
    { id: 'help', label: 'How to Use', icon: <HelpCircle size={20} /> },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <MapPinned size={28} className="text-accent" style={{ color: 'var(--accent-primary)' }} />
        <h1>NetMapper</h1>
      </div>

      <motion.nav
        className="sidebar-nav"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {menuItems.map((item, index) => {
          const isActive = activeView === item.id;

          return (
            <React.Fragment key={item.id}>
              {item.id === 'instructions' && <div className="sidebar-divider"></div>}
              <motion.button
                variants={itemVariants}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`sidebar-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveView(item.id)}
              >
                {item.icon}
                <span>{item.label}</span>
              </motion.button>
            </React.Fragment>
          );
        })}
      </motion.nav>
    </aside>
  );
};
