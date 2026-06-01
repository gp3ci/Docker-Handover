import React, { useState, useRef } from 'react';
import { Upload, Play, Settings2, FileImage, Info, FileText, CheckCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { submitJob } from '../../services/api';
import { useSession } from '../../context/SessionContext';
import { AnalysisProgressModal } from '../AnalysisProgressModal';

// ── Main CoaxSection ──────────────────────────────────────────────────────────
export const CoaxSection = () => {
  const { screenshotFile, mapName } = useSession();
  const [dpi, setDpi] = useState(300);
  const [beforeNodeType, setBeforeNodeType] = useState('none'); // 3x3 | 4x4 | none

  // Real Form States
  const [prismId, setPrismId] = useState('');
  const [nodeName, setNodeName] = useState('');
  const [instance, setInstance] = useState('');

  const [beforeNodes, setBeforeNodes] = useState(['', '', '', '']);
  const [afterNodes, setAfterNodes] = useState(['', '']);

  // Handle specifically when grid type button is clicked
  const handleGridTypeClick = (type) => {
    setBeforeNodeType(type);

    // Auto-fill logic (Triggered only on click)
    if (type === 'none' || !nodeName.trim()) return;

    const parts = nodeName.split('_').map(p => p.trim()).filter(Boolean);
    if (parts.length === 0) return;

    const beforeLimit = type === '3x3' ? 3 : 4;

    // Update Before Nodes (Source)
    setBeforeNodes(prev => {
      const next = ['', '', '', ''];
      for (let i = 0; i < beforeLimit; i++) {
        if (parts[i]) next[i] = parts[i];
      }
      return next;
    });

    // Update After Nodes (Destination) - First 2 names
    setAfterNodes(prev => {
      const next = ['', ''];
      for (let i = 0; i < 2; i++) {
        if (parts[i]) next[i] = parts[i];
      }
      return next;
    });
  };

  const [beforePdf, setBeforePdf] = useState(null);
  const [afterPdf, setAfterPdf] = useState(null);

  const beforeFileRef = useRef(null);
  const afterFileRef = useRef(null);

  // Job Tracking
  const [jobId, setJobId] = useState(null);
  const [jobToken, setJobToken] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const startAnalysisSequence = async () => {
    if (!beforePdf || !afterPdf) {
      alert("Please upload both Before and After maps.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('before_pdf', beforePdf);
      formData.append('after_pdf', afterPdf);
      formData.append('dpi', dpi);
      formData.append('prism_id', prismId);
      formData.append('node_name', nodeName);
      formData.append('instance', instance);
      formData.append('map_type', 'AFTER'); // Default mapping assumption
      if (screenshotFile) formData.append('survey_image', screenshotFile);

      if (beforeNodeType !== 'none') {
        formData.append('before_node_type', beforeNodeType);
        formData.append('after_node_type', '2x2');
        const filteredBeforeNodes = beforeNodes.slice(0, beforeNodeType === '3x3' ? 3 : 4).filter(n => n.trim());
        if (filteredBeforeNodes.length > 0) formData.append('before_node_names', filteredBeforeNodes.join(','));
        const filteredAfterNodes = afterNodes.filter(n => n.trim());
        if (filteredAfterNodes.length > 0) formData.append('after_node_names', filteredAfterNodes.join(','));
      }

      const res = await submitJob(formData);
      setJobId(res.job_id);
      setJobToken(res.job_token);
      setShowModal(true);
    } catch (err) {
      alert("Error starting sequence: " + err.message);
    }
  };

  const handleUpdateBeforeNode = (idx, val) => {
    const newArr = [...beforeNodes];
    newArr[idx] = val;
    setBeforeNodes(newArr);
  };

  const handleUpdateAfterNode = (idx, val) => {
    const newArr = [...afterNodes];
    newArr[idx] = val;
    setAfterNodes(newArr);
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } } };

  return (
    <motion.div className="section-container" variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>Coax Analysis Engine</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Configure tracking parameters, assign node hierarchies, and map your coax infrastructure.</p>
      </motion.div>

      {/* Global Configuration */}
      <motion.div variants={itemVariants}>
        <Card style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <Settings2 size={18} className="text-accent" />
            <h3 style={{ fontWeight: 600, margin: 0 }}>Global Configuration</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Multi-value hint */}
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
              padding: '0.55rem 0.85rem',
              backgroundColor: 'rgba(79,70,229,0.07)',
              border: '1px solid rgba(79,70,229,0.2)',
              borderRadius: 'var(--radius-sm)',
            }}>
              <Info size={13} style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.77rem', color: 'var(--accent-primary)', lineHeight: 1.5 }}>
                Multiple IDs or names can be entered in the same field, separated by an <strong>underscore ( _ )</strong>.
                &nbsp;e.g.&nbsp;<code style={{ backgroundColor: 'rgba(79,70,229,0.12)', padding: '0 4px', borderRadius: 3 }}>ID1_ID2</code>
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              <Input label="Prism ID" placeholder="Enter Prism ID" value={prismId} onChange={(e) => setPrismId(e.target.value)} />
              <Input label="Node Name" placeholder="Enter Node Name" value={nodeName} onChange={(e) => setNodeName(e.target.value)} />
              <Input label="Instance Identifier" placeholder="Enter Instance ID" value={instance} onChange={(e) => setInstance(e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              <div>
                <label className="ui-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Resolution (DPI)</label>
                <div style={{ display: 'flex', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '0.25rem', border: '1px solid var(--border-color)' }}>
                  {[300, 600, 800].map(val => (
                    <button key={val} onClick={() => setDpi(val)} style={{ flex: 1, padding: '0.5rem', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', backgroundColor: dpi === val ? 'var(--accent-primary)' : 'transparent', color: dpi === val ? '#ffffff' : 'var(--text-secondary)', boxShadow: dpi === val ? 'var(--shadow-md)' : 'none', transition: 'all 0.2s ease' }}>
                      {val}
                    </button>
                  ))}
                </div>
                <motion.div layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.3 }} style={{ marginTop: '0.65rem', padding: '0.6rem 0.875rem', backgroundColor: dpi === 300 ? 'rgba(16,185,129,0.08)' : dpi === 600 ? 'rgba(79,70,229,0.08)' : 'rgba(245,158,11,0.08)', border: `1px solid ${dpi === 300 ? 'rgba(16,185,129,0.25)' : dpi === 600 ? 'rgba(79,70,229,0.25)' : 'rgba(245,158,11,0.3)'}`, borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                  <motion.div key={dpi} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} style={{ fontSize: '0.8rem', lineHeight: 1.5, color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <Info size={14} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--accent-primary)' }} />
                    <span>
                      {dpi === 300 && <><strong style={{ color: '#059669' }}>Small map:</strong> 300 DPI is ideal for compact cable maps with fewer nodes and short spans.</>}
                      {dpi === 600 && <><strong style={{ color: 'var(--accent-primary)' }}>Medium map:</strong> 600 DPI balances detail and processing speed for moderately sized maps.</>}
                      {dpi === 800 && <><strong style={{ color: '#b45309' }}>Large map:</strong> 800 DPI is best for high-density maps with complex node structures and long cable runs.</>}
                    </span>
                  </motion.div>
                </motion.div>
              </div>
              <div>
                <label className="ui-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Base Node Grid</label>
                <div style={{ display: 'flex', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '0.25rem', border: '1px solid var(--border-color)' }}>
                  {['none', '3x3', '4x4'].map(type => (
                    <button key={type} onClick={() => handleGridTypeClick(type)} style={{ flex: 1, padding: '0.5rem', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', backgroundColor: beforeNodeType === type ? 'var(--accent-primary)' : 'transparent', color: beforeNodeType === type ? '#ffffff' : 'var(--text-secondary)', boxShadow: beforeNodeType === type ? 'var(--shadow-md)' : 'none', transition: 'all 0.2s ease', textTransform: 'capitalize' }}>
                      {type === 'none' ? 'None' : `${type} Nodes`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Before / After Split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '2rem' }}>
        {/* Before */}
        <motion.div variants={itemVariants}>
          <Card style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileImage size={18} className="text-secondary" />
                <h3 style={{ fontWeight: 600, margin: 0 }}>Before Map Layer</h3>
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Step 1</div>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', flexGrow: 1 }}>
              <input type="file" ref={beforeFileRef} accept=".pdf" style={{ display: 'none' }} onChange={e => setBeforePdf(e.target.files[0])} />
              <motion.div
                className="upload-card" onClick={() => beforeFileRef.current.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) setBeforePdf(e.dataTransfer.files[0]); }}
                whileHover={{ y: -2, borderColor: 'var(--accent-primary)', backgroundColor: 'var(--accent-light)' }} whileTap={{ scale: 0.99 }}
                style={{ height: '200px', cursor: 'pointer', border: '2px dashed var(--border-color)', backgroundColor: beforePdf ? 'var(--bg-secondary)' : 'var(--bg-primary)' }}
              >
                {!beforePdf ? (
                  <>
                    <div className="upload-icon" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}><Upload size={24} /></div>
                    <div>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Upload Before Map PDF</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Click to browse</div>
                    </div>
                  </>
                ) : (
                  <>
                    <FileText size={28} className="text-accent" style={{ marginBottom: '10px' }} />
                    <div style={{ fontWeight: 600 }}>{beforePdf.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}><CheckCircle size={14} /> Ready</div>
                  </>
                )}
              </motion.div>
              {beforeNodeType !== 'none' ? (
                <motion.div key="node-inputs" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.3 }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>Source Nodes ({beforeNodeType === '3x3' ? '3' : '4'} Required)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Input placeholder="Node Name 1" value={beforeNodes[0]} onChange={(e) => handleUpdateBeforeNode(0, e.target.value)} />
                    <Input placeholder="Node Name 2" value={beforeNodes[1]} onChange={(e) => handleUpdateBeforeNode(1, e.target.value)} />
                    <Input placeholder="Node Name 3" value={beforeNodes[2]} onChange={(e) => handleUpdateBeforeNode(2, e.target.value)} />
                    {beforeNodeType === '4x4' && <Input placeholder="Node Name 4" value={beforeNodes[3]} onChange={(e) => handleUpdateBeforeNode(3, e.target.value)} />}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="no-nodes" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                  <CheckCircle2 size={18} className="text-success" />
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>No node names required for this analysis.</span>
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* After */}
        <motion.div variants={itemVariants}>
          <Card style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid var(--border-focus)' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-focus)', backgroundColor: 'var(--accent-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileImage size={18} className="text-accent" />
                <h3 style={{ fontWeight: 600, margin: 0, color: 'var(--accent-primary)' }}>After Map Overlay</h3>
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Step 2</div>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', flexGrow: 1 }}>
              <input type="file" ref={afterFileRef} accept=".pdf" style={{ display: 'none' }} onChange={e => setAfterPdf(e.target.files[0])} />
              <motion.div
                className="upload-card" onClick={() => afterFileRef.current.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) setAfterPdf(e.dataTransfer.files[0]); }}
                whileHover={{ y: -2, borderColor: 'var(--accent-primary)', backgroundColor: 'var(--accent-light)' }} whileTap={{ scale: 0.99 }}
                style={{ height: '200px', cursor: 'pointer', border: '2px dashed var(--border-focus)', backgroundColor: afterPdf ? 'var(--accent-light)' : 'transparent' }}
              >
                {!afterPdf ? (
                  <>
                    <div className="upload-icon" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent-primary)' }}><Upload size={24} /></div>
                    <div>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Upload After Map PDF</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)' }}>Click to browse</div>
                    </div>
                  </>
                ) : (
                  <>
                    <FileText size={28} className="text-accent" style={{ marginBottom: '10px' }} />
                    <div style={{ fontWeight: 600 }}>{afterPdf.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}><CheckCircle size={14} /> Ready</div>
                  </>
                )}
              </motion.div>
              {beforeNodeType !== 'none' ? (
                <motion.div key="after-node-inputs" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.3 }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>Destination Nodes (2 Required)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Input placeholder="After Node 1" value={afterNodes[0]} onChange={(e) => handleUpdateAfterNode(0, e.target.value)} />
                    <Input placeholder="After Node 2" value={afterNodes[1]} onChange={(e) => handleUpdateAfterNode(1, e.target.value)} />
                  </div>
                </motion.div>
              ) : (
                <motion.div key="after-no-nodes" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                  <CheckCircle2 size={18} className="text-success" />
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>No destination nodes required.</span>
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
        <Button size="lg" style={{ gap: '0.5rem', padding: '0.85rem 3rem' }} onClick={startAnalysisSequence}>
          <Play size={18} /> Start Sequence
        </Button>
      </motion.div>

      {/* Analysis Modal */}
      {showModal && (
        <AnalysisProgressModal
          jobId={jobId}
          jobToken={jobToken}
          title="Processing Coax Analysis"
          filename={`${mapName ? mapName.toUpperCase() : (nodeName || 'MAP')}_AFTER_COAX.pdf`}
          onClose={() => setShowModal(false)}
          onComplete={() => setShowModal(false)}
        />
      )}
    </motion.div>
  );
};

