import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Download, AlertCircle, FileCheck, FileText, Upload, DownloadCloud } from 'lucide-react';

export const InstructionsSection = () => {
  const [activeScenario, setActiveScenario] = useState(1);

  const scenarios = [
    { 
      id: 1, 
      title: 'Title & Survey Stamping (Before Maps)', 
      hasIssue: false, 
      message: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p><strong style={{ color: 'var(--text-primary)' }}>Purpose:</strong> Prepares your original Fiber and Coax blueprints for documentation before any construction or modification begins.</p>
          <p><strong style={{ color: 'var(--text-primary)' }}>How to use:</strong> Navigate to the "Before Maps" tab. Upload your PDF. The system will bypass heavy AI detection to save processing time.</p>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>What the engine does:</strong>
            <ul style={{ paddingLeft: '1.5rem', listStyleType: 'disc', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li>Automatically calculates the total number of pages in your multi-page PDF.</li>
              <li>Stamps the Prism Detail Screenshot exclusively on Page 1.</li>
              <li>Embeds the red Title Block (with map name and details) on <em>every</em> page with correct sequential page numbering.</li>
            </ul>
          </div>
        </div>
      )
    },
    { 
      id: 2, 
      title: 'Fiber Architecture AI (Fiber After)', 
      hasIssue: false, 
      message: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p><strong style={{ color: 'var(--text-primary)' }}>Purpose:</strong> Fully automated detection and labeling of Fiber infrastructure components without manual intervention.</p>
          <p><strong style={{ color: 'var(--text-primary)' }}>How to use:</strong> Upload your "After" Fiber map. Ensure that your map contains "FE1" text markers near the splice cans.</p>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>What the engine does:</strong>
            <ul style={{ paddingLeft: '1.5rem', listStyleType: 'disc', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li>Uses computer vision to identify Splice Cans and Nodes across the map.</li>
              <li>Applies a spatial distance algorithm to find the closest "FE1" map tag to each splice can.</li>
              <li>Automatically assigns the label <strong>#SPLICE1 / HUB</strong> to the closest can, and <strong>#SPLICE2 / MUX</strong> to the further one.</li>
              <li>Proceeds immediately to PDF generation without pausing, for maximum processing speed.</li>
            </ul>
          </div>
        </div>
      )
    },
    { 
      id: 3, 
      title: 'Interactive Validation (Coax After)', 
      hasIssue: true, 
      message: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p><strong style={{ color: 'var(--text-primary)' }}>Purpose:</strong> Precision AI detection for Coaxial networks, featuring a Human-in-the-Loop review system to guarantee 100% accuracy.</p>
          <p><strong style={{ color: 'var(--text-primary)' }}>How to use:</strong> Upload your Coax map. Input the node names in the frontend settings panel.</p>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>What the engine does:</strong>
            <ul style={{ paddingLeft: '1.5rem', listStyleType: 'disc', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li>Detects all coax equipment. If it sees a node upgrade, it automatically calculates counts and generates a custom callout: <em>"REPLACE EXISTING 3x3 WITH SEGMENTED 2x2"</em>.</li>
              <li><strong style={{ color: 'var(--error)' }}>ACTION REQUIRED:</strong> The engine will pause midway and open a Verification Modal.</li>
              <li>You can review every detection tile, rename text, or remove false positives. Once approved, the final vector report is generated with a mandatory "DESIGN NOTE" warning placed in empty space.</li>
            </ul>
          </div>
        </div>
      )
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } }
  };

  const activeScenarioData = scenarios.find(s => s.id === activeScenario);

  return (
    <motion.div 
      className="section-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}
        variants={itemVariants}
      >
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>Workflow Scenarios</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Interactive simulation of infrastructure validation outputs.</p>
        </div>
        <Button variant="secondary" style={{ gap: '0.5rem' }}>
          <DownloadCloud size={16} /> Export Report
        </Button>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '2rem' }}>
        {/* Left Side: Scenario List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {scenarios.map(scenario => {
            const isActive = activeScenario === scenario.id;
            return (
              <motion.div key={scenario.id} variants={itemVariants}>
                <Card 
                  onClick={() => setActiveScenario(scenario.id)}
                  style={{
                    cursor: 'pointer',
                    padding: '1.25rem',
                    border: isActive ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    backgroundColor: isActive ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                    boxShadow: isActive ? 'var(--shadow-md)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  whileHover={{ x: 5, backgroundColor: 'var(--bg-secondary)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeIndicator"
                      style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: 'var(--accent-primary)' }}
                    />
                  )}
                  <div style={{ 
                    padding: '0.5rem', borderRadius: '50%', 
                    backgroundColor: scenario.hasIssue ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    color: scenario.hasIssue ? 'var(--error)' : 'var(--success)'
                  }}>
                    {scenario.hasIssue ? <AlertCircle size={20} /> : <FileCheck size={20} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{scenario.title}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Click to view details</p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Right Side: Scenario Detail Panel */}
        <motion.div variants={itemVariants} style={{ height: '100%' }}>
          <Card style={{ backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '400px' }}>
            <AnimatePresence mode="wait">
              {activeScenarioData ? (
                <motion.div 
                  key={activeScenario}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  style={{ padding: '1rem' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <motion.div 
                      initial={{ rotate: -10, scale: 0.9 }}
                      animate={{ rotate: 0, scale: 1 }}
                      style={{ 
                        padding: '1rem', borderRadius: 'var(--radius-lg)', 
                        backgroundColor: activeScenarioData.hasIssue ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: activeScenarioData.hasIssue ? 'var(--error)' : 'var(--success)'
                      }}
                    >
                      {activeScenarioData.hasIssue ? <AlertCircle size={32} /> : <FileCheck size={32} />}
                    </motion.div>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {activeScenarioData.title}
                      </h3>
                      <div style={{ 
                        display: 'inline-block', marginTop: '0.5rem', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-pill)',
                        fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px',
                        backgroundColor: activeScenarioData.hasIssue ? 'var(--error)' : 'var(--success)', color: '#fff'
                      }}>
                        {activeScenarioData.hasIssue ? 'Action Required' : 'Validated'}
                      </div>
                    </div>
                  </div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', lineHeight: 1.6, color: 'var(--text-secondary)' }}
                  >
                    {activeScenarioData.message}
                  </motion.div>

                  {activeScenarioData.hasIssue && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}
                    >
                      <Button variant="primary">Resolve Issue Automatically</Button>
                      <Button variant="secondary">Ignore & Proceed</Button>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                  <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <p>Select a scenario to view detailed output</p>
                </div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};
