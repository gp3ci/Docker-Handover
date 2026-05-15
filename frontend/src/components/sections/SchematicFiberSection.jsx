import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, MapPin, Play, FileText, CheckCircle, X, Loader2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { AnalysisProgressModal } from '../AnalysisProgressModal';
import { submitFiberBeforeJob } from '../../services/api';
import { useSession } from '../../context/SessionContext';

/**
 * SchematicFiberSection
 * Uploads up to 2 schematic PDFs and processes them sequentially.
 * Each map gets its own real polling → authenticated download flow.
 */
export const SchematicFiberSection = ({ fields = {}, onFieldChange }) => {
  const { prismId = '', nodeName = '', instance = '' } = fields;
  const { mapName, screenshotFile } = useSession();

  const handleMetaChange = (key) => (e) => {
    if (onFieldChange) onFieldChange(key, e.target.value);
  };

  // PDFs
  const [map1Pdf, setMap1Pdf] = useState(null);
  const [map2Pdf, setMap2Pdf] = useState(null);
  const map1Ref = useRef(null);
  const map2Ref = useRef(null);

  // Submission loading guard
  const [submitting, setSubmitting] = useState(false);

  // Active job modal: { jobId, jobToken, title, filename, remaining: [] }
  const [activeJob, setActiveJob] = useState(null);

  // ─── Helper: submit one PDF, open modal ─────────────────────────────────────
  const processMap = useCallback(async (pdfFile, mapLabel, remaining) => {
    const fd = new FormData();
    fd.append('before_pdf', pdfFile);
    fd.append('prism_id',   prismId);
    fd.append('node_name',  nodeName);
    fd.append('instance',   instance);
    fd.append('map_type',   'SCHEMATIC');
    fd.append('dpi',        300);
    if (screenshotFile) fd.append('survey_image', screenshotFile);

    const res = await submitFiberBeforeJob(fd);
    setActiveJob({
      jobId:     res.job_id,
      jobToken:  res.job_token,
      title:     `Processing Schematic ${mapLabel}`,
      filename:  `${mapName ? mapName.toUpperCase() : (nodeName || 'MAP')}_SCHEMATIC_FIBER_${mapLabel.replace(' ','')}.pdf`,
      remaining, // array of { pdf, label } still to process
    });
  }, [prismId, nodeName, instance, screenshotFile]);

  // ─── Start: build queue and process first item ────────────────────────────
  const startAnalysis = async () => {
    const queue = [];
    if (map1Pdf) queue.push({ pdf: map1Pdf, label: 'Map 1' });
    if (map2Pdf) queue.push({ pdf: map2Pdf, label: 'Map 2' });

    if (queue.length === 0) {
      alert('Please upload at least one schematic map.');
      return;
    }

    setSubmitting(true);
    try {
      const [first, ...rest] = queue;
      await processMap(first.pdf, first.label, rest);
    } catch (err) {
      alert('Failed to submit job: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── After each job completes & downloads, process next if any ────────────
  const handleJobComplete = useCallback(async () => {
    const remaining = activeJob?.remaining ?? [];
    setActiveJob(null);               // close current modal

    if (remaining.length === 0) return; // all done

    // Small delay so modal closes cleanly before next one opens
    setTimeout(async () => {
      try {
        const [next, ...rest] = remaining;
        await processMap(next.pdf, next.label, rest);
      } catch (err) {
        alert('Failed to submit next job: ' + err.message);
      }
    }, 400);
  }, [activeJob, processMap]);

  // ─── Mini upload card ──────────────────────────────────────────────────────
  const SmallUploadCard = ({ pdf, setPdf, fileRef, label }) => (
    <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1rem' }}>
      <h3 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem', textAlign: 'center', fontSize: '0.95rem' }}>
        {label}
      </h3>
      <input
        type="file" accept=".pdf"
        ref={fileRef} style={{ display: 'none' }}
        onChange={e => setPdf(e.target.files?.[0] || null)}
      />
      <div
        className="upload-card"
        onClick={() => fileRef.current.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setPdf(e.dataTransfer.files[0]);
          }
        }}
        style={{
          flex: 1, minHeight: '120px', cursor: 'pointer',
          border: `2px dashed ${pdf ? 'var(--success)' : 'var(--border-focus)'}`,
          backgroundColor: pdf ? 'var(--bg-secondary)' : 'var(--accent-light)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          position: 'relative',
        }}
      >
        {!pdf ? (
          <>
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '50%', boxShadow: 'var(--shadow-sm)' }}>
              <Upload size={24} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>Click to browse</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)' }}>PDF file</div>
          </>
        ) : (
          <>
            <FileText size={28} style={{ color: 'var(--accent-primary)', marginBottom: 5 }} />
            <div style={{ fontWeight: 600, fontSize: '0.85rem', maxWidth: '90%', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {pdf.name}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle size={13} /> Ready
            </div>
            <button
              onClick={e => { e.stopPropagation(); setPdf(null); if (fileRef.current) fileRef.current.value = ''; }}
              title="Remove"
              style={{ position: 'absolute', top: 6, right: 6, background: 'var(--bg-tertiary)', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={11} />
            </button>
          </>
        )}
      </div>
    </Card>
  );

  return (
    <>
      <div style={{ animation: 'fadeIn 0.5s ease', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>Schematic Fiber Processing</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Provide metadata and upload up to 2 schematic maps — they'll be processed and downloaded sequentially.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

          {/* Metadata */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Card style={{ height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <MapPin size={18} style={{ color: 'var(--accent-primary)' }} />
                <h3 style={{ fontWeight: 600, margin: 0 }}>Map Details</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <Input label="Prism ID" placeholder="Enter Prism ID" value={prismId} onChange={handleMetaChange('prismId')} />
                <Input label="Node Name" placeholder="Enter Node Name" value={nodeName} onChange={handleMetaChange('nodeName')} />
                <Input label="Instance Identifier" placeholder="Enter Instance ID" value={instance} onChange={handleMetaChange('instance')} />
              </div>
              {screenshotFile && (
                <div style={{ marginTop: '1rem', fontSize: '0.78rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle size={12} /> Prism screenshot will be attached.
                </div>
              )}
              {(map1Pdf || map2Pdf) && (
                <div style={{ marginTop: '1rem', padding: '0.6rem 0.875rem', backgroundColor: 'rgba(79,70,229,0.07)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-focus)', fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 500 }}>
                  ✨ Fields auto-copied from Fiber Map tab. Edit to override.
                </div>
              )}
            </Card>
          </div>

          {/* Upload cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <SmallUploadCard pdf={map1Pdf} setPdf={setMap1Pdf} fileRef={map1Ref} label="Upload your fiber schematic map 1" />
            <SmallUploadCard pdf={map2Pdf} setPdf={setMap2Pdf} fileRef={map2Ref} label="Upload your fiber schematic map 2" />
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
          <Button
            size="lg"
            style={{ gap: '0.5rem', padding: '0.85rem 3rem', opacity: (!map1Pdf && !map2Pdf) ? 0.5 : 1 }}
            disabled={submitting || (!map1Pdf && !map2Pdf)}
            onClick={startAnalysis}
          >
            {submitting
              ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Submitting…</>
              : <><Play size={18} /> Start Analysing</>}
          </Button>
        </div>
      </div>

      {/* Progress modal — one at a time */}
      {activeJob && (
        <AnalysisProgressModal
          jobId={activeJob.jobId}
          jobToken={activeJob.jobToken}
          title={activeJob.title}
          filename={activeJob.filename}
          onClose={() => setActiveJob(null)}
          onComplete={handleJobComplete}
        />
      )}
    </>
  );
};
