import React from 'react';
import { motion } from 'framer-motion';
import { Navigation, UploadCloud, Settings, Play, CheckCircle2, Download, FileText, Cpu, Layers, Zap } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

const ProcessStep = ({ number, title, description, icon: Icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    style={{ flex: 1, minWidth: '240px' }}
  >
    <Card style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      padding: '2rem',
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#38bdf8'
      }}>
        <Icon size={24} />
      </div>
      <div>
        <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>
          {number}. {title}
        </h4>
        <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.5)', lineHeight: 1.6 }}>
          {description}
        </p>
      </div>
    </Card>
  </motion.div>
);

export const HowItWorks = ({ onStart }) => {
  const steps = [
    { number: 1, title: 'Initialize Session', description: 'Enter your Map Name and upload the Prism Detail screenshot to embed across all reports.', icon: Settings },
    { number: 2, title: 'Before Maps', description: 'Process original Fiber and Coax Before maps with automated Title Box and Survey Image stamping.', icon: UploadCloud },
    { number: 3, title: 'Fiber Architecture', description: 'Stamp fiber overviews or run AI to map SPLICE/HUB/MUX nodes via proximity algorithms.', icon: Navigation },
    { number: 4, title: 'Coax Architecture', description: 'Interactive AI pipeline for Coax After maps with node upgrades and Human-in-the-Loop verification.', icon: Play },
  ];

  return (
    <section style={{ padding: '8rem 2rem', backgroundColor: '#050505', position: 'relative' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, color: '#fff', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}
          >
            How <span style={{ color: '#38bdf8' }}>SpectraMap</span> Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            style={{ fontSize: '1.2rem', color: 'rgba(255, 255, 255, 0.6)', maxWidth: '700px', margin: '0 auto' }}
          >
            A simplified breakdown of our professional network analysis ecosystem.
          </motion.p>
        </div>

        {/* 4-Step Grid */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginBottom: '6rem' }}>
          {steps.map((step, i) => (
            <ProcessStep key={i} {...step} delay={i * 0.15} />
          ))}
        </div>

        {/* Deep Analysis Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Card style={{
            padding: '3rem',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '2rem',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* Background Glow */}
            <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '40%', height: '60%', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '4rem', position: 'relative', zIndex: 1 }}>
              {/* Left Column: Autonomous Processing */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ec4899', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem' }}>5</div>
                  <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>Autonomous Stage <br /> Processing</h3>
                </div>
                <p style={{ fontSize: '1.1rem', color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.7, marginBottom: '2.5rem' }}>
                  The engine automatically cycles through three high-precision processing stages to ensure 100% data integrity.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  {[
                    { label: 'Alignment + Tiling', icon: Layers },
                    { label: 'AI Detection + OCR', icon: Cpu },
                    { label: 'Match Differences', icon: Zap }
                  ].map((pill, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>
                      <pill.icon size={16} className="text-accent" style={{ color: '#38bdf8' }} />
                      {pill.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Human-in-the-Loop */}
              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: '1.5rem', padding: '2.5rem', border: '1px solid rgba(255, 255, 255, 0.05)', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px' }}>
                    <CheckCircle2 size={14} /> Final Phase
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)', fontWeight: 600 }}>STEP 6-7</div>
                </div>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '2rem', lineHeight: 1.3 }}>
                  Human-in-the-Loop Approval & Final Export
                </h4>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Button style={{ backgroundColor: '#fff', color: '#000', padding: '0.75rem 1.5rem', fontSize: '0.9rem', fontWeight: 700, flex: 1 }}>
                    <Download size={16} /> DOWNLOAD
                  </Button>
                  <Button variant="secondary" style={{ flex: 1, fontSize: '0.9rem', fontWeight: 700 }}>
                    <FileText size={16} /> VIEW REPORT
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Final CTA */}
        <div style={{ textAlign: 'center', marginTop: '8rem' }}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ display: 'inline-block' }}
          >
            <button
              onClick={onStart}
              style={{
                backgroundColor: '#fff',
                color: '#000',
                padding: '1.5rem 4rem',
                fontSize: '1.25rem',
                fontWeight: 800,
                borderRadius: '99px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 25px 50px -12px rgba(255, 255, 255, 0.25)',
                transition: 'all 0.3s ease'
              }}
            >
              Start Your Analysis Now
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
