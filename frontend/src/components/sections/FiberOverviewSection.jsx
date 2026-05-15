import React, { useState, useRef, useEffect } from 'react';
import { Upload, Focus, Network, Server, Play, FileText, CheckCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { AnalysisProgressModal } from '../AnalysisProgressModal';
import { submitFiberOverviewJob } from '../../services/api';
import { useSession } from '../../context/SessionContext';

export const FiberOverviewSection = ({ fields = {}, onFieldChange }) => {
  const { prismId = '', nodeName = '', instance = '' } = fields;
  const { mapName, screenshotFile } = useSession();
  const [isConnected, setIsConnected] = useState('yes');
  const [showProgress, setShowProgress] = useState(false);
  const [jobId,    setJobId]    = useState(null);
  const [jobToken, setJobToken] = useState(null);
  
  const [hubName,        setHubName]        = useState('');
  const [portName,       setPortName]       = useState('');
  const [spliceCanName,  setSpliceCanName]  = useState('');
  const [pdfFile,        setPdfFile]        = useState(null);
  
  const fileInputRef = useRef(null);

  const handleMetaChange = (key) => (e) => {
    if (onFieldChange) onFieldChange(key, e.target.value);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setPdfFile(e.target.files[0]);
    }
  };

  const startAnalysis = async () => {
    if (!pdfFile) {
      alert("Please upload a Fiber Map PDF first.");
      return;
    }

    console.log("--- Fiber Overview Analysis Submission ---");
    console.log("Metadata:", { prismId, nodeName, instance, isConnected });
    console.log("Connectivity details:", isConnected === 'yes' ? { hubName, portName } : { spliceCanName });
    console.log("Files:", { pdfFile: pdfFile?.name, screenshotFile: screenshotFile?.name });
    
    // Create form data
    const formData = new FormData();
    formData.append('file',         pdfFile);
    formData.append('prism_id',     prismId);
    formData.append('node_name',    nodeName);
    formData.append('instance',     instance);
    formData.append('is_connected', isConnected === 'yes');
    formData.append('dpi',          300);
    if (screenshotFile) formData.append('survey_image', screenshotFile);
    
    if (isConnected === 'yes') {
      formData.append('hub_name',   hubName);
      formData.append('port_name',  portName);
    } else {
      formData.append('splice_can_name', spliceCanName);
    }

    console.log("FormData Payload:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      setShowProgress(true);
      const res = await submitFiberOverviewJob(formData);
      console.log("Job Response:", res);
      setJobId(res.job_id);
      setJobToken(res.job_token);
    } catch (err) {
      console.error("Job Submission Error:", err);
      alert('Failed to submit job: ' + err.message);
      setShowProgress(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>Fiber Overview Map</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Upload the overview map and configure hub connectivity parameters.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
        {/* Left Col: Map Metadata & Upload */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <Focus size={18} className="text-accent" />
              <h3 style={{ fontWeight: 600, margin: 0 }}>Map Details</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <Input label="Prism ID" placeholder="Enter Prism ID" value={prismId} onChange={handleMetaChange('prismId')} />
              <Input label="Node Name" placeholder="Enter Node Name" value={nodeName} onChange={handleMetaChange('nodeName')} />
              <Input label="Instance" placeholder="Enter Instance ID" value={instance} onChange={handleMetaChange('instance')} />
            </div>

            <div style={{ marginTop: '2rem' }}>
              <label className="ui-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Upload Fiber Map</label>
              <input type="file" accept="application/pdf" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
              <div
                className="upload-card"
                onClick={() => fileInputRef.current.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    setPdfFile(e.dataTransfer.files[0]);
                  }
                }}
                style={{ border: '2px dashed var(--border-color)', backgroundColor: pdfFile ? 'var(--bg-secondary)' : 'var(--bg-primary)', padding: '2rem', height: 'auto', cursor: 'pointer' }}
              >
                {!pdfFile ? (
                  <>
                    <Upload size={24} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>Upload your fiber overview map</div>
                  </>
                ) : (
                  <>
                    <FileText size={24} style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }} />
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600 }}>{pdfFile.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center', marginTop: '4px' }}>
                      <CheckCircle size={12} /> Ready
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Col: Connectivity & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card style={{ flexGrow: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <Network size={18} className="text-accent" />
              <h3 style={{ fontWeight: 600, margin: 0 }}>Connectivity</h3>
            </div>
            
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Connected to Hub?</p>
            
            <div style={{ display: 'flex', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', padding: '0.35rem', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
              <button
                onClick={() => setIsConnected('yes')}
                style={{
                  flex: 1, padding: '0.75rem', border: 'none', borderRadius: 'var(--radius-sm)',
                  fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                  backgroundColor: isConnected === 'yes' ? 'var(--accent-primary)' : 'transparent',
                  color: isConnected === 'yes' ? '#ffffff' : 'var(--text-secondary)',
                  boxShadow: isConnected === 'yes' ? 'var(--shadow-md)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <Server size={16} /> Yes
                </div>
              </button>
              <button
                onClick={() => setIsConnected('no')}
                style={{
                  flex: 1, padding: '0.75rem', border: 'none', borderRadius: 'var(--radius-sm)',
                  fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                  backgroundColor: isConnected === 'no' ? 'var(--accent-primary)' : 'transparent',
                  color: isConnected === 'no' ? '#ffffff' : 'var(--text-secondary)',
                  boxShadow: isConnected === 'no' ? 'var(--shadow-md)' : 'none',
                }}
              >
                No
              </button>
            </div>

            {/* Conditional Inputs */}
            {isConnected === 'yes' ? (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', backgroundColor: 'var(--bg-primary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <Input label="Hub Name" placeholder="Enter Hub Name" value={hubName} onChange={(e) => setHubName(e.target.value)} />
                <Input label="Port / Panel Name" placeholder="Enter Port or Panel" value={portName} onChange={(e) => setPortName(e.target.value)} />
              </div>
            ) : (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', backgroundColor: 'var(--bg-primary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <Input label="Name of Splice Can" placeholder="Enter Splice Can Name" value={spliceCanName} onChange={(e) => setSpliceCanName(e.target.value)} />
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Footer Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
        <Button size="lg" style={{ gap: '0.5rem', padding: '0.85rem 3rem' }} onClick={startAnalysis}>
          <Play size={18} /> Start Analysing
        </Button>
      </div>

      {showProgress && (
        <AnalysisProgressModal
          jobId={jobId}
          jobToken={jobToken}
          title="Processing Fiber Overview Map"
          filename={`${mapName ? mapName.toUpperCase() : (nodeName || 'MAP')}_OVERVIEW_FIBER.pdf`}
          onClose={() => { setShowProgress(false); setJobId(null); setJobToken(null); }}
          onComplete={() => { setShowProgress(false); setJobId(null); setJobToken(null); }}
        />
      )}
    </div>
  );
};
