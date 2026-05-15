import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, Baseline, Zap, FileText, CheckCircle, X, Loader2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { AnalysisProgressModal } from '../AnalysisProgressModal';
import { submitFiberBeforeJob, submitCoaxBeforeJob } from '../../services/api';
import { useSession } from '../../context/SessionContext';
import './sections.css';

export const BeforeSection = () => {
  const { mapName, screenshotFile } = useSession();

  // Metadata
  const [prismId,   setPrismId]   = useState('');
  const [nodeName,  setNodeName]  = useState('');
  const [instance,  setInstance]  = useState('');

  // Files
  const [fiberFile, setFiberFile] = useState(null);
  const [coaxFile,  setCoaxFile]  = useState(null);

  // Refs
  const fiberRef = useRef(null);
  const coaxRef  = useRef(null);

  // Per-card loading (while submitting)
  const [fiberLoading, setFiberLoading] = useState(false);
  const [coaxLoading,  setCoaxLoading]  = useState(false);

  // Progress modal state — shared slot (one at a time)
  const [modal, setModal] = useState(null);
  // modal = { jobId, jobToken, title, filename } | null

  const clearFile = (setter, ref, e) => {
    e.stopPropagation();
    setter(null);
    if (ref.current) ref.current.value = '';
  };

  // ── Submit fiber before job ─────────────────────────────────────────────────
  const handleFiberDownload = async () => {
    if (!fiberFile) { alert('Please upload a Fiber Map PDF first.'); return; }
    setFiberLoading(true);
    try {
      const fd = new FormData();
      fd.append('before_pdf', fiberFile);
      fd.append('prism_id',   prismId);
      fd.append('node_name',  nodeName);
      fd.append('instance',   instance);
      fd.append('map_type',   'BEFORE');
      fd.append('dpi',        300);
      if (screenshotFile) fd.append('survey_image', screenshotFile);

      const res = await submitFiberBeforeJob(fd);
      setModal({
        jobId:    res.job_id,
        jobToken: res.job_token,
        title:    'Processing Fiber Map',
        filename: `${mapName ? mapName.toUpperCase() : (nodeName || 'MAP')}_BEFORE_FIBER.pdf`,
      });
    } catch (err) {
      alert('Failed to submit Fiber job: ' + err.message);
    } finally {
      setFiberLoading(false);
    }
  };

  // ── Submit coax before job ──────────────────────────────────────────────────
  const handleCoaxDownload = async () => {
    if (!coaxFile) { alert('Please upload a Coax Map PDF first.'); return; }
    setCoaxLoading(true);
    try {
      const fd = new FormData();
      fd.append('before_pdf', coaxFile);
      fd.append('prism_id',   prismId);
      fd.append('node_name',  nodeName);
      fd.append('instance',   instance);
      fd.append('map_type',   'BEFORE');
      fd.append('dpi',        300);
      if (screenshotFile) fd.append('survey_image', screenshotFile);

      const res = await submitCoaxBeforeJob(fd);
      setModal({
        jobId:    res.job_id,
        jobToken: res.job_token,
        title:    'Processing Coax Map',
        filename: `${mapName ? mapName.toUpperCase() : (nodeName || 'MAP')}_BEFORE_COAX.pdf`,
      });
    } catch (err) {
      alert('Failed to submit Coax job: ' + err.message);
    } finally {
      setCoaxLoading(false);
    }
  };

  const containerVariants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
  };
  const itemVariants = {
    hidden:  { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
  };

  // ── Upload card helper ──────────────────────────────────────────────────────
  const UploadCard = ({ file, onClear, onClick, onDropFile, accentColor, label }) => (
    <motion.div
      className="upload-card"
      onClick={onClick}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          onDropFile(e.dataTransfer.files[0]);
        }
      }}
      whileHover={{ y: -2, borderColor: accentColor, backgroundColor: 'rgba(0,0,0,0.02)' }}
      whileTap={{ scale: 0.99 }}
      style={{
        cursor: 'pointer', position: 'relative',
        borderColor:     file ? 'var(--success)' : undefined,
        backgroundColor: file ? 'var(--bg-secondary)' : undefined,
      }}
    >
      {!file ? (
        <>
          <div className="upload-icon" style={{ color: accentColor }}><Upload size={24} /></div>
          <div className="upload-text">{label}</div>
        </>
      ) : (
        <>
          <FileText size={26} style={{ color: accentColor, marginBottom: 6 }} />
          <div style={{ fontWeight: 600, fontSize: '0.875rem', maxWidth: '85%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {file.name}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <CheckCircle size={13} /> Ready
          </div>
          <button
            onClick={onClear} title="Remove"
            style={{ position: 'absolute', top: 8, right: 8, background: 'var(--bg-tertiary)', border: 'none', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={12} />
          </button>
        </>
      )}
    </motion.div>
  );

  return (
    <>
      <motion.div
        className="section-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="section-header" variants={itemVariants}>
          <h2 className="section-title">Before Map Processing</h2>
          <p className="section-subtitle">Provide details and upload the base infrastructure map.</p>
        </motion.div>

        {/* Metadata row */}
        <motion.div variants={itemVariants}>
          <Card style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <Input label="Prism ID"  placeholder="Enter Prism ID"    value={prismId}  onChange={e => setPrismId(e.target.value)} />
              <Input label="Node Name" placeholder="Enter Node Name"   value={nodeName} onChange={e => setNodeName(e.target.value)} />
              <Input label="Instance"  placeholder="Enter Instance ID" value={instance} onChange={e => setInstance(e.target.value)} />
            </div>
            {screenshotFile && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={13} /> Prism screenshot from Intro will be attached: <strong>{screenshotFile.name}</strong>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Upload cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

          {/* ── Fiber ── */}
          <motion.div variants={itemVariants}>
            <Card>
              <div style={{ padding: '1rem' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Baseline size={20} style={{ color: 'var(--accent-primary)' }} />
                  Fiber Upload
                </h3>

                <input type="file" ref={fiberRef} accept=".pdf" style={{ display: 'none' }}
                  onChange={e => setFiberFile(e.target.files?.[0] || null)} />

                <UploadCard
                  file={fiberFile}
                  onClick={() => fiberRef.current.click()}
                  onDropFile={setFiberFile}
                  onClear={e => clearFile(setFiberFile, fiberRef, e)}
                  accentColor="var(--accent-primary)"
                  label="Upload your fiber before map"
                />

                <Button
                  onClick={handleFiberDownload}
                  disabled={fiberLoading || !fiberFile}
                  style={{ gap: '0.6rem', width: '100%', justifyContent: 'center', marginTop: '1.5rem', opacity: (!fiberFile) ? 0.5 : 1 }}
                >
                  {fiberLoading
                    ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting…</>
                    : <><Download size={18} /> Download Fiber Map Processed</>}
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* ── Coax ── */}
          <motion.div variants={itemVariants}>
            <Card>
              <div style={{ padding: '1rem' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Zap size={20} style={{ color: '#f59e0b' }} />
                  Coax Upload
                </h3>

                <input type="file" ref={coaxRef} accept=".pdf" style={{ display: 'none' }}
                  onChange={e => setCoaxFile(e.target.files?.[0] || null)} />

                <UploadCard
                  file={coaxFile}
                  onClick={() => coaxRef.current.click()}
                  onDropFile={setCoaxFile}
                  onClear={e => clearFile(setCoaxFile, coaxRef, e)}
                  accentColor="#f59e0b"
                  label="Upload your coax before map"
                />

                <Button
                  onClick={handleCoaxDownload}
                  disabled={coaxLoading || !coaxFile}
                  style={{ gap: '0.6rem', width: '100%', justifyContent: 'center', marginTop: '1.5rem', backgroundColor: '#f59e0b', borderColor: '#f59e0b', opacity: (!coaxFile) ? 0.5 : 1 }}
                >
                  {coaxLoading
                    ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting…</>
                    : <><Download size={18} /> Download Coax Map Processed</>}
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Progress modal — shared slot */}
      {modal && (
        <AnalysisProgressModal
          jobId={modal.jobId}
          jobToken={modal.jobToken}
          title={modal.title}
          filename={modal.filename}
          onClose={() => setModal(null)}
          onComplete={() => setModal(null)}
        />
      )}
    </>
  );
};
