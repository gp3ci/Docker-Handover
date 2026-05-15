import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Info, FileImage, CheckCircle, X, AlertTriangle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useSession } from '../../context/SessionContext';
import './sections.css';

export const IntroSection = ({ onStart }) => {
  const { mapName, setMapName, screenshotFile, setScreenshotFile, setFiberFields } = useSession();
  const screenshotRef = useRef(null);

  const handleMapNameChange = (e) => {
    const newName = e.target.value;
    setMapName(newName);
    // Only clear data from other tabs when map name is completely cleared
    if (newName.trim() === '') {
      setFiberFields({ prismId: '', nodeName: '', instance: '' });
    }
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setScreenshotFile(file);
  };

  const clearScreenshot = (e) => {
    e.stopPropagation();
    setScreenshotFile(null);
    if (screenshotRef.current) screenshotRef.current.value = '';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } }
  };

  return (
    <motion.div
      className="section-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="section-header" variants={itemVariants}>
        <h2 className="section-title" style={{ fontSize: '2rem' }}>
          {mapName.trim() ? `Map: ${mapName.trim()}` : 'Welcome'}
        </h2>
        <p className="section-subtitle">Start by initializing a new map analysis session.</p>
      </motion.div>

      {/* ⚠️ Map Quality Warning Banner */}
      <motion.div
        variants={itemVariants}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
          padding: '1rem 1.25rem',
          backgroundColor: 'rgba(245,158,11,0.09)',
          border: '1.5px solid rgba(245,158,11,0.45)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '0.5rem',
        }}
      >
        <AlertTriangle size={22} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <div style={{ fontWeight: 700, color: '#92400e', fontSize: '0.95rem', marginBottom: '0.35rem' }}>
            Map Quality Reminder
          </div>
          <div style={{ fontSize: '0.85rem', color: '#b45309', lineHeight: 1.6 }}>
            For best detection results, please ensure that <strong>equipment name labels and text callouts
              do not cover or overlap the symbols</strong> (nodes, splice cans, amplifiers, taps) in your map PDF.
            Symbols that are partially hidden by overlapping text may be missed or misclassified by the AI engine.
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-6" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <motion.div className="flex-col gap-4" style={{ display: 'flex' }} variants={itemVariants}>
          <Card>
            <h3 className="mb-4" style={{ marginBottom: '1rem', fontWeight: 600 }}>Session Details</h3>

            {/* Map Name — saved to global session */}
            <Input
              label="Map Name"
              placeholder="e.g., OJAI4135678"
              value={mapName}
              onChange={handleMapNameChange}
            />

            {/* Screenshot upload — real file input */}
            <div className="mt-4" style={{ marginTop: '1.5rem' }}>
              <label className="ui-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                Prism Detail Screenshot
              </label>

              {/* Hidden actual file input */}
              <input
                type="file"
                ref={screenshotRef}
                accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
                style={{ display: 'none' }}
                onChange={handleScreenshotChange}
              />

              <motion.div
                className="upload-card"
                onClick={() => screenshotRef.current.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    setScreenshotFile(e.dataTransfer.files[0]);
                  }
                }}
                whileHover={{ borderColor: 'var(--accent-primary)', backgroundColor: 'var(--accent-light)', y: -2 }}
                whileTap={{ scale: 0.99 }}
                style={{
                  cursor: 'pointer',
                  position: 'relative',
                  backgroundColor: screenshotFile ? 'var(--bg-secondary)' : undefined,
                  borderColor: screenshotFile ? 'var(--success)' : undefined,
                }}
              >
                {!screenshotFile ? (
                  <>
                    <div className="upload-icon">
                      <FileImage size={28} />
                    </div>
                    <div>
                      <div className="upload-text">Click to upload or drag &amp; drop</div>
                      <div className="upload-subtext">PNG, JPG, PDF up to 10MB</div>
                    </div>
                  </>
                ) : (
                  <>
                    <CheckCircle size={28} style={{ color: 'var(--success)', marginBottom: '6px' }} />
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem', maxWidth: '90%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {screenshotFile.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--success)', marginTop: '2px' }}>
                      Ready · {(screenshotFile.size / 1024).toFixed(0)} KB
                    </div>
                    {/* Clear button */}
                    <button
                      onClick={clearScreenshot}
                      title="Remove file"
                      style={{
                        position: 'absolute', top: 8, right: 8,
                        background: 'var(--bg-tertiary)', border: 'none',
                        borderRadius: '50%', width: 24, height: 24,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: 'var(--text-muted)',
                      }}
                    >
                      <X size={13} />
                    </button>
                  </>
                )}
              </motion.div>
            </div>

            <div className="mt-4" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={onStart} style={{ gap: '0.5rem' }}>Start Session →</Button>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="h-full bg-accent-light" style={{ height: '100%', borderLeft: '4px solid var(--accent-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Info size={24} style={{ color: 'var(--accent-primary)' }} />
              <h3 style={{ fontWeight: 600 }}>Map Upload Instructions</h3>
            </div>
            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem', lineHeight: '1.6' }}>
              {[
                "Enter a Map Name — it will appear in the top bar throughout your session and be embedded in all downloaded reports.",
                "Upload the Prism Detail Screenshot (PNG/JPG/PDF) that corresponds to this map session for reference.",
                "Ensure the map is clearly visible and within the supported resolution boundaries.",
                "Before and After maps must correspond to the exact same geographical boundaries for accurate analysis.",
                "Use the specific Fiber/Coax tabs depending on the network infrastructure type.",
                "Review generated alerts carefully before exporting the final approved analytical map.",
                "⚠️ Keep equipment name labels away from symbols — text overlapping a node, splice can, or amplifier may block accurate AI detection."
              ].map((text, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (i * 0.1) }}
                >
                  {text}
                </motion.li>
              ))}
            </ul>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};
