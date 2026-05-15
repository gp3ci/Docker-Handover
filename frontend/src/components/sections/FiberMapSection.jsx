import React, { useState, useRef } from 'react';
import { Upload, MapPin, Play, FileText, CheckCircle, Info, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { AnalysisProgressModal } from '../AnalysisProgressModal';
import { submitFiberAfterJob, triggerDownload } from '../../services/api';
import { useSession } from '../../context/SessionContext';

/**
 * FiberMapSection — "Fiber Map Processing" tab inside AfterSection.
 */
export const FiberMapSection = ({ fields = {}, onFieldChange }) => {
  const { prismId = '', nodeName = '', instance = '', hub = '', portPanel = '' } = fields;
  const { mapName, screenshotFile } = useSession();
  const [showProgress, setShowProgress] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [dpi, setDpi] = useState(50);
  const [includeMux, setIncludeMux] = useState(true);
  const [jobId, setJobId] = useState(null);
  const [jobToken, setJobToken] = useState(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  
  const fileRef = useRef(null);

  const handleChange = (key) => (e) => {
    if (onFieldChange) onFieldChange(key, e.target.value);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setPdfFile(file);
  };

  const handleStartAnalysis = async () => {
    if (!pdfFile) {
      alert('Please upload a PDF map file first!');
      return;
    }
    
    setIsAnalysing(true);
    setShowProgress(true);
    
    try {
      const formData = new FormData();
      formData.append('file', pdfFile);
      if (screenshotFile) {
        formData.append('survey_image', screenshotFile);
      }
      formData.append('prism_id', prismId);
      formData.append('node_name', nodeName);
      formData.append('instance', instance);
      formData.append('hub', hub);
      formData.append('port_panel', portPanel);
      formData.append('dpi', dpi);
      formData.append('include_mux', includeMux);
      
      const result = await submitFiberAfterJob(formData);
      setJobId(result.job_id);
      setJobToken(result.job_token);
    } catch (err) {
      console.error('Failed to start fiber analysis:', err);
      alert(err.message || 'Failed to start analysis');
      setShowProgress(false);
      setIsAnalysing(false);
    }
  };

  const handleDownload = async () => {
    if (!jobId || !jobToken) return;
    try {
      const filename = `${mapName || prismId || 'Map'}_FIBER_AFTER.pdf`;
      await triggerDownload(jobId, jobToken, filename);
    } catch (err) {
      alert('Download failed: ' + err.message);
    }
  };

  // Variants for consistent feel
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" animate="visible"
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
    >
      <motion.div variants={itemVariants}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>Detail Fiber Map Analysis</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
           Interactive AI analysis with human-in-the-loop verification. <strong>Editable callouts supported.</strong>
        </p>
      </motion.div>

      {/* Main Grid — align-items: stretch ensures containers match height */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem', alignItems: 'stretch' }}>

        {/* Left Side: Metadata Panel */}
        <motion.div variants={itemVariants} style={{ display: 'flex' }}>
          <Card style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <MapPin size={18} className="text-accent" />
              <h3 style={{ fontWeight: 600, margin: 0 }}>Map Details</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>

              {/* Multi-value hint */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                padding: '0.6rem 0.85rem',
                backgroundColor: 'rgba(79,70,229,0.07)',
                border: '1px solid rgba(79,70,229,0.2)',
                borderRadius: 'var(--radius-sm)',
              }}>
                <Info size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', lineHeight: 1.5 }}>
                  Multiple IDs or names can be entered in the same field,
                  separated by an <strong>underscore ( _ )</strong>.
                  &nbsp;e.g. <code style={{ backgroundColor: 'rgba(79,70,229,0.12)', padding: '0 4px', borderRadius: 3 }}>ID1_ID2</code>
                </span>
              </div>

              <Input
                label="Prism ID"
                placeholder="Enter Prism ID"
                value={prismId}
                onChange={handleChange('prismId')}
              />
              <Input
                label="Node Name"
                placeholder="Enter Node Name"
                value={nodeName}
                onChange={handleChange('nodeName')}
              />
              <Input
                label="Instance"
                placeholder="Enter Instance ID"
                value={instance}
                onChange={handleChange('instance')}
              />

              <Input
                label="Hub Name"
                placeholder="Enter Hub details"
                value={hub}
                onChange={handleChange('hub')}
              />
              <Input
                label="Port/Panel"
                placeholder="Enter Port details"
                value={portPanel}
                onChange={handleChange('portPanel')}
              />

              {/* Sync hint */}
              {(prismId || nodeName || instance) && (
                <div style={{
                  marginTop: 'auto', padding: '0.6rem 0.875rem',
                  backgroundColor: 'rgba(79,70,229,0.07)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-focus)',
                  fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 500,
                }}>
                  ✨ These fields auto-copy to Overview &amp; Schematic tabs.
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Right Side: DPI & Map Upload */}
        <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
           {/* DPI Selection — Redesigned to match Coax Section style */}
           <Card style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <CheckCircle size={18} className="text-accent" />
                <h3 style={{ fontWeight: 600, margin: 0, fontSize: '0.95rem' }}>Analysis Precision (DPI)</h3>
              </div>
              
              {/* Coax-style Toggle Bar */}
              <div style={{ 
                display: 'flex', 
                backgroundColor: 'var(--bg-secondary)', 
                borderRadius: 'var(--radius-md)', 
                padding: '0.25rem', 
                border: '1px solid var(--border-color)',
                marginBottom: '1rem' 
              }}>
                {[50, 70, 90].map((val) => (
                  <button
                    key={val}
                    onClick={() => setDpi(val)}
                    style={{
                      flex: 1, padding: '0.6rem', border: 'none', borderRadius: 'var(--radius-sm)',
                      fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                      backgroundColor: dpi === val ? 'var(--accent-primary)' : 'transparent',
                      color: dpi === val ? '#ffffff' : 'var(--text-secondary)',
                      boxShadow: dpi === val ? 'var(--shadow-md)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {val} DPI
                  </button>
                ))}
              </div>

              {/* Dynamic Description Box (Coax Style) */}
              <motion.div 
                layout 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                transition={{ duration: 0.3 }}
                style={{ 
                  padding: '0.75rem 1rem', 
                  backgroundColor: dpi === 50 ? 'rgba(16,185,129,0.08)' : dpi === 70 ? 'rgba(79,70,229,0.08)' : 'rgba(245,158,11,0.08)',
                  border: `1px solid ${dpi === 50 ? 'rgba(16,185,129,0.25)' : dpi === 70 ? 'rgba(79,70,229,0.25)' : 'rgba(245,158,11,0.3)'}`,
                  borderRadius: 'var(--radius-sm)', 
                  overflow: 'hidden' 
                }}
              >
                 <AnimatePresence mode="wait">
                    <motion.div 
                      key={dpi} 
                      initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 5 }} transition={{ duration: 0.2 }}
                      style={{ fontSize: '0.82rem', lineHeight: 1.5, color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}
                    >
                      <Info size={15} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--accent-primary)' }} />
                      <span>
                        {dpi === 50 && <><strong style={{ color: '#059669' }}>Small map:</strong> 50 DPI is ideal for standard fiber maps. It is highly recommended for optimal distance calculations between splice cans.</>}
                        {dpi === 70 && <><strong style={{ color: 'var(--accent-primary)' }}>Medium map:</strong> 70 DPI provides higher resolution for maps with denser symbol clusters or overlapping callouts.</>}
                        {dpi === 90 && <><strong style={{ color: '#b45309' }}>Large map:</strong> 90 DPI is best for complex, high-density maps requiring maximum precision for distinct symbol separation.</>}
                      </span>
                    </motion.div>
                 </AnimatePresence>
              </motion.div>

              {/* MUX Location Callout Toggle */}
              <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontWeight: 600, margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Include MUX Location Callout?</h4>
                </div>
                <div style={{
                  display: 'flex',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.25rem',
                  border: '1px solid var(--border-color)',
                }}>
                  {[{ label: 'Yes', val: true }, { label: 'No', val: false }].map(({ label, val }) => (
                    <button
                      key={label}
                      onClick={() => setIncludeMux(val)}
                      style={{
                        flex: 1, padding: '0.55rem', border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                        backgroundColor: includeMux === val
                          ? (val ? 'var(--accent-primary)' : '#ef4444')
                          : 'transparent',
                        color: includeMux === val ? '#ffffff' : 'var(--text-secondary)',
                        boxShadow: includeMux === val ? 'var(--shadow-md)' : 'none',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div style={{
                  marginTop: '0.6rem',
                  fontSize: '0.78rem',
                  color: includeMux ? 'var(--accent-primary)' : '#ef4444',
                  fontWeight: 500,
                  padding: '0.5rem 0.75rem',
                  backgroundColor: includeMux ? 'rgba(79,70,229,0.07)' : 'rgba(239,68,68,0.07)',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${includeMux ? 'rgba(79,70,229,0.2)' : 'rgba(239,68,68,0.2)'}`,
                }}>
                  {includeMux
                    ? '✅ MUX LOCATION callout will appear on the annotated PDF.'
                    : '🚫 MUX LOCATION callout will be excluded from the final PDF.'}
                </div>
              </div>
            </Card>

          {/* Map PDF Upload */}
          <Card style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>Upload Target Map</h3>
            <input type="file" ref={fileRef} accept=".pdf" style={{ display: 'none' }} onChange={handleFileChange} />
            <div
              className="upload-card"
              onClick={() => fileRef.current.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  setPdfFile(e.dataTransfer.files[0]);
                }
              }}
              style={{
                flex: 1, minHeight: '180px',
                border: `2px dashed ${pdfFile ? 'var(--success)' : 'var(--border-focus)'}`,
                backgroundColor: pdfFile ? 'var(--bg-secondary)' : 'var(--accent-light)',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'
              }}
            >
              {pdfFile ? (
                <>
                  <FileText size={42} style={{ color: 'var(--accent-primary)' }} />
                  <div style={{ fontWeight: 600, fontSize: '1rem' }}>{pdfFile.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                     <CheckCircle size={14} /> Ready for analysis
                  </div>
                </>
              ) : (
                <>
                  <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '50%', marginBottom: '0.5rem' }}>
                    <Upload size={32} style={{ color: 'var(--accent-primary)' }} />
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '1rem' }}>Upload your fiber after map</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Click to browse or drag &amp; drop PDF</div>
                </>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Footer Actions */}
      <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
        <Button 
          size="lg" 
          style={{ gap: '0.5rem', padding: '0.85rem 3rem' }} 
          disabled={!pdfFile || isAnalysing}
          onClick={handleStartAnalysis}
        >
          <Play size={18} /> {isAnalysing ? 'Analysing...' : 'Start Analysing'}
        </Button>
      </motion.div>

      {showProgress && (
        <AnalysisProgressModal
          jobId={jobId}
          jobToken={jobToken}
          title="Analysing Fiber Map"
          filename={`${mapName ? mapName.toUpperCase() : (nodeName || 'MAP')}_AFTER_FIBER.pdf`}
          onClose={() => {
            setShowProgress(false);
            setIsAnalysing(false);
          }}
          onComplete={() => {
            setShowProgress(false);
            setIsAnalysing(false);
          }}
        />
      )}
    </motion.div>
  );
};
