/**
 * AnalysisProgressModal
 * ---------------------
 * Two modes:
 *  REAL — when `jobId` + `jobToken` are provided: polls the backend every 2 s,
 *         drives a real progress bar, and triggers an authenticated blob download.
 *  DEMO — when no jobId: fake timer animation (used by sections with no backend yet).
 *
 * Props
 *  jobId       string | null   — job ID returned from the API
 *  jobToken    string | null   — secret token returned from the API
 *  title       string          — header label (e.g. "Processing Fiber Map")
 *  filename    string          — suggested download filename
 *  onClose     () => void      — close without downloading
 *  onComplete  () => void      — called AFTER the download is triggered
 */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, Download, X, AlertTriangle } from 'lucide-react';
import { getJobStatus, triggerDownload } from '../services/api';
import { AnalysisVerificationModal } from './AnalysisVerificationModal';

const STAGES = [
  { id: 'validate', label: 'Validating Inputs', detail: 'Checking metadata and file integrity…' },
  { id: 'extract', label: 'Extracting Symbols', detail: 'Running AI symbol detection on map tiles…' },
  { id: 'analyse', label: 'Analysing Network', detail: 'Building node topology and connectivity graph…' },
  { id: 'render', label: 'Rendering Output', detail: 'Compositing final annotated map…' },
];

export const AnalysisProgressModal = ({
  jobId = null,
  jobToken = null,
  title = 'Analysis in Progress',
  filename,
  onClose,
  onComplete,
}) => {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [downloading, setDownloading] = useState(false);

  // Verification states
  const [waitStatus, setWaitStatus] = useState(null); // 'AWAITING_DPI_CONFIRM' or 'AWAITING_REVIEW'
  const [sampleTiles, setSampleTiles] = useState([]);
  const [flaggedTiles, setFlaggedTiles] = useState([]);
  const [allCallouts, setAllCallouts] = useState([]);

  const pollerRef = useRef(null);

  // ─── Real polling mode ──────────────────────────────────────────────────────
  useEffect(() => {
    console.log("In Pct UseEffect()");
    console.log("jobId: ", jobId);
    console.log("jobToken: ", jobToken);
    console.log("waitStatus: ", waitStatus);
    if (!jobId || !jobToken || waitStatus) {
      console.error("Error: Job ID or Job Token is missing or waitStatus is not null");
      return;
    };

    let errCount = 0;
    const MAX_ERR = 5;

    console.log("above try");
    pollerRef.current = setInterval(async () => {
      try {
        const res = await getJobStatus(jobId, jobToken);
        console.log("Backend Polling Update:", res);
        console.log("Job Id", res.job_id);
        errCount = 0;

        const pct = Math.round(res.progress_pct ?? 0);
        console.log("pct", pct);
        setProgress(pct);

        // Drive visual stage from real progress %
        if (pct >= 100) setCurrentStage(4);
        else if (pct >= 85) setCurrentStage(3);
        else if (pct >= 50) setCurrentStage(2);
        else if (pct >= 15) setCurrentStage(1);
        else setCurrentStage(0);

        if (res.status === 'AWAITING_DPI_CONFIRM') {
          clearInterval(pollerRef.current);
          setSampleTiles(res.sample_tiles || []);
          setWaitStatus('AWAITING_DPI_CONFIRM');
        } else if (res.status === 'AWAITING_REVIEW') {
          clearInterval(pollerRef.current);
          setFlaggedTiles(res.flagged_tiles || []);
          setAllCallouts(res.all_callouts || []);
          setWaitStatus('AWAITING_REVIEW');
        } else if (res.status === 'COMPLETED') {
          clearInterval(pollerRef.current);
          setProgress(100);
          setCurrentStage(4);
          setIsDone(true);
        } else if (res.status === 'FAILED') {
          clearInterval(pollerRef.current);
          setIsFailed(true);
          setErrorMsg(res.error || res.message || 'Processing failed.');
        }
      } catch (err) {
        errCount++;
        if (errCount >= MAX_ERR) {
          clearInterval(pollerRef.current);
          setIsFailed(true);
          setErrorMsg('Lost connection to server.');
        }
      }
    }, 2000);

    return () => clearInterval(pollerRef.current);
  }, [jobId, jobToken, waitStatus]);

  // ─── Demo / fake-timer mode (no backend) ────────────────────────────────────
  useEffect(() => {
    if (jobId) return; // real mode handles it

    if (currentStage < STAGES.length && !isDone) {
      const t = setTimeout(() => {
        console.log("in useEffect");
        if (currentStage < STAGES.length - 1) {
          setCurrentStage(s => s + 1);
          setProgress(Math.round(((currentStage + 1) / STAGES.length) * 100));
        } else {
          setProgress(100);
          setCurrentStage(4);
          setIsDone(true);
        }
      }, 1400);
      return () => clearTimeout(t);
    }
  }, [currentStage, isDone, jobId]);

  // const displayProgress = isDone ? 100 : Math.round((currentStage / STAGES.length) * 100);
  const displayProgress = Math.min(100, isDone ? 100 : progress);

  const [objectUrl, setObjectUrl] = useState(null);

  // Pre-fetch blob with retry logic to handle backend write lag
  useEffect(() => {
    let retryTimer = null;
    let isMounted = true;

    if (isDone && jobId && jobToken && !objectUrl) {
      const prep = async () => {
        try {
          const { downloadJobFile } = await import('../services/api');
          const res = await downloadJobFile(jobId, jobToken);

          if (!res.ok) {
            console.warn('Report not ready yet, retrying in 2s...');
            if (isMounted) retryTimer = setTimeout(prep, 2000);
            return;
          }

          const blob = await res.blob();
          if (isMounted) setObjectUrl(URL.createObjectURL(blob));
        } catch (e) {
          console.error('Failed to prefetch blob, retrying...', e);
          if (isMounted) retryTimer = setTimeout(prep, 2000);
        }
      };
      prep();
    }

    return () => {
      isMounted = false;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [isDone, jobId, jobToken, objectUrl]);

  useEffect(() => {
    // No unmount cleanup here since clicking the link closes the modal and would kill the download!
  }, [objectUrl]);

  return (
    <AnimatePresence>
      <motion.div
        key="progress-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000,
        }}
        onClick={isDone || isFailed ? undefined : e => e.stopPropagation()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          style={{
            width: '100%', maxWidth: '520px',
            backgroundColor: 'var(--bg-primary)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 32px 64px -16px rgba(0,0,0,0.5)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <h3 style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
                {isFailed ? '❌ Processing Failed' : isDone ? '✅ Analysis Complete' : `⚙️ ${title}`}
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {isFailed
                  ? errorMsg
                  : isDone
                    ? (jobId ? 'Your annotated map is ready — click Download.' : 'Processing simulation complete.')
                    : 'Please wait while your map is being processed…'}
              </p>
            </div>
            {(isDone || isFailed) && (
              <button
                onClick={onClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Body */}
          <div style={{ padding: '2rem' }}>

            {/* Progress bar */}
            {!isFailed && (
              <div style={{
                height: '8px', backgroundColor: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-pill)', overflow: 'hidden', marginBottom: '1.75rem',
              }}>
                <motion.div
                  animate={{ width: `${displayProgress}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    borderRadius: 'var(--radius-pill)',
                    background: isDone
                      ? 'linear-gradient(90deg,#10b981,#34d399)'
                      : 'linear-gradient(90deg,var(--accent-primary),var(--accent-hover))',
                    boxShadow: isDone ? '0 0 12px rgba(16,185,129,0.4)' : '0 0 12px rgba(79,70,229,0.4)',
                  }}
                />
              </div>
            )}

            {/* Error state */}
            {isFailed && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '1rem', marginBottom: '1.5rem',
                backgroundColor: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 'var(--radius-md)',
              }}>
                <AlertTriangle size={20} color="#ef4444" />
                <span style={{ fontSize: '0.875rem', color: '#b91c1c', fontWeight: 500 }}>
                  {errorMsg}
                </span>
              </div>
            )}

            {/* Stages */}
            {!isFailed && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {STAGES.map((stage, idx) => {
                  const isCompleted = isDone || idx < currentStage;
                  const isActive = !isDone && idx === currentStage;
                  const isPending = !isDone && idx > currentStage;

                  return (
                    <motion.div
                      key={stage.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        padding: '0.85rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isActive ? 'var(--accent-light)' : isCompleted ? 'transparent' : 'var(--bg-secondary)',
                        border: `1px solid ${isActive ? 'var(--border-focus)' : 'var(--border-color)'}`,
                        transition: 'all 0.3s ease',
                        opacity: isPending ? 0.4 : 1,
                      }}
                    >
                      <div style={{ flexShrink: 0 }}>
                        {isCompleted
                          ? <CheckCircle2 size={20} color="var(--success)" />
                          : isActive
                            ? <Loader2 size={20} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
                            : <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--border-color)' }} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontWeight: 600, fontSize: '0.9rem',
                          color: isActive ? 'var(--accent-primary)' : isCompleted ? 'var(--text-primary)' : 'var(--text-muted)',
                        }}>
                          {stage.label}
                        </div>
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}
                          >
                            {stage.detail}
                          </motion.div>
                        )}
                      </div>
                      {isActive && (
                        <div style={{
                          fontSize: '0.75rem', fontWeight: 700,
                          color: 'var(--accent-primary)',
                          backgroundColor: 'var(--bg-secondary)',
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-pill)',
                          border: '1px solid var(--border-focus)',
                        }}>
                          {displayProgress}%
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Action buttons */}
            <AnimatePresence>
              {(isDone || isFailed) && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  style={{ marginTop: '1.75rem', display: 'flex', gap: '1rem' }}
                >
                  {isDone && (
                    <>
                      {objectUrl ? (
                        <a
                          href={objectUrl}
                          download={filename || `telecom_report_${jobId?.slice(0, 8)}.pdf`}
                          onClick={() => {
                            setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
                            if (onComplete) onComplete();
                          }}
                          style={{
                            flex: 1, padding: '0.9rem',
                            background: 'linear-gradient(135deg,var(--accent-primary),var(--accent-hover))',
                            color: '#fff', textDecoration: 'none',
                            border: 'none', borderRadius: 'var(--radius-md)',
                            fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            boxShadow: '0 4px 16px rgba(79,70,229,0.35)',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <Download size={18} /> Download Map
                        </a>
                      ) : (
                        <button
                          disabled
                          style={{
                            flex: 1, padding: '0.9rem',
                            background: 'var(--bg-tertiary)',
                            color: 'var(--text-muted)',
                            border: 'none', borderRadius: 'var(--radius-md)',
                            fontWeight: 700, fontSize: '0.95rem', cursor: 'not-allowed',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                          }}
                        >
                          <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Preparing Download…
                        </button>
                      )}
                    </>
                  )}
                  <button
                    onClick={onClose}
                    style={{
                      padding: '0.9rem 1.5rem',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 600, cursor: 'pointer',
                      flex: isDone ? undefined : 1,
                    }}
                  >
                    {isFailed ? 'Close' : 'Cancel'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Always-visible Cancel button while job is running */}
            {!isDone && !isFailed && (
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={() => {
                    if (window.confirm('Close this window? The job will continue running in the background. You can reopen this page without losing your data.')) {
                      if (pollerRef.current) clearInterval(pollerRef.current);
                      onClose();
                    }
                  }}
                  style={{
                    padding: '0.65rem 2rem',
                    backgroundColor: 'transparent',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600, cursor: 'pointer',
                    fontSize: '0.85rem',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => { e.target.style.borderColor = 'var(--text-muted)'; e.target.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={e => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.color = 'var(--text-muted)'; }}
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Interactive Verification Overlay */}
      <AnimatePresence>
        {waitStatus && (
          <AnalysisVerificationModal
            key="verification-modal"
            jobId={jobId}
            jobToken={jobToken}
            status={waitStatus}
            sampleTiles={sampleTiles}
            flaggedTiles={flaggedTiles}
            allCallouts={allCallouts}
            onProceed={() => setWaitStatus(null)}
            onAbort={onClose}
          />
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};
