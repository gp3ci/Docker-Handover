import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowRight, 
  Trash2, 
  Edit3, 
  ZoomIn,
  Eye
} from 'lucide-react';
import { postJobAction } from '../services/api';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';

// Helper to construct tile URLs and handle Localtunnel bypass
const getTileUrl = (jobId, type, idx) => `${API_BASE}/outputs/${jobId}/tiles/${type}/${type}_${idx}.png`;

export const AnalysisVerificationModal = ({
  jobId,
  jobToken,
  status,
  sampleTiles = [],
  flaggedTiles = [],
  allCallouts = [],
  onProceed,
  onAbort
}) => {
  const [loading, setLoading] = useState(false);
  const [overrides, setOverrides] = useState([]); // List of {tileIdx, action: 'REMOVE'|'RENAME', newText?: string}
  const [editingIdx, setEditingIdx] = useState(null);

  const handleProceed = async () => {
    setLoading(true);
    try {
      await postJobAction(jobId, jobToken, 'PROCEED', overrides.length > 0 ? overrides : null);
      onProceed();
    } catch (err) {
      alert(`Failed to proceed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCallout = (tileIdx) => {
    setOverrides(prev => [...prev.filter(o => o.tileIdx !== tileIdx), { tileIdx, action: 'REMOVE' }]);
  };

  const handleRenameCallout = (tileIdx, newText) => {
    if (!newText) return;
    setOverrides(prev => [...prev.filter(o => o.tileIdx !== tileIdx), { tileIdx, action: 'RENAME', newText }]);
  };

  const isRemoved = (tileIdx) => overrides.find(o => o.tileIdx === tileIdx && o.action === 'REMOVE');
  const getRename = (tileIdx) => overrides.find(o => o.tileIdx === tileIdx && o.action === 'RENAME')?.newText;
  const getOriginalCalloutText = (tileIdx) => {
    const callout = allCallouts.find(c => c.tile_idx === tileIdx && c.type === 'FLAGGED');
    return callout ? callout.text : "AI Identified Symbol";
  };

  const handleAbort = async () => {
    if (!window.confirm("Are you sure you want to abort? This will clear current tiles and let you change DPI.")) return;
    setLoading(true);
    try {
      await postJobAction(jobId, jobToken, 'ABORT');
      onAbort();
    } catch (err) {
      alert(`Failed to abort: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isDPIStage = status === 'AWAITING_DPI_CONFIRM';
  const isReviewStage = status === 'AWAITING_REVIEW';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-blue-500/10"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400">
              {isDPIStage ? <ZoomIn size={24} /> : <AlertTriangle size={24} />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {isDPIStage ? 'Confirm Map Zoom (DPI)' : 'Review Critical Callouts'}
              </h2>
              <p className="text-slate-400 text-sm">
                {isDPIStage 
                   ? 'Verify the resolution. If images are blank, open the API link in a new tab to bypass security.' 
                   : 'Verify flagged items. Use the "Open in New Tab" link if images don\'t load.'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleAbort}
            className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors"
          >
            <XCircle size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {isDPIStage && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {sampleTiles.map((idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Tile Sample #{idx}</span>
                    <div className="flex gap-2">
                       <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">Before</span>
                       <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30">After</span>
                    </div>
                  </div>
                  <div className="relative group aspect-square rounded-2xl overflow-hidden border border-slate-700 bg-black flex flex-col">
                    <div className="flex-1 overflow-hidden grid grid-cols-2 h-full">
                       <img 
                          src={getTileUrl(jobId, 'before', idx)} 
                          alt="Before" 
                          className="w-full h-full object-cover border-r border-slate-800"
                          onError={(e) => { e.target.style.display='none'; }}
                       />
                       <img 
                          src={getTileUrl(jobId, 'after', idx)} 
                          alt="After" 
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display='none'; }}
                       />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isReviewStage && (
            <div className="space-y-6">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-4 items-start">
                 <div className="p-2 bg-amber-500/20 rounded-lg text-amber-500">
                    <AlertTriangle size={20} />
                 </div>
                 <div className="text-sm">
                    <p className="text-amber-200 font-medium">Attention Required</p>
                    <p className="text-amber-200/60 leading-relaxed">
                       Our AI detected potential Grounding (G), Power Block, or Power Supply issues. 
                       Please verify the flagged tiles below. You can rename or remove these callouts if they are incorrect.
                    </p>
                 </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {flaggedTiles.map((tileIdx) => (
                  <div key={tileIdx} className={`bg-slate-800/50 border border-slate-700 rounded-2xl p-4 flex flex-col gap-6 transition-opacity ${isRemoved(tileIdx) ? 'opacity-40 grayscale' : ''}`}>
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-slate-600 bg-black flex-shrink-0">
                       <img 
                          src={getTileUrl(jobId, 'after', tileIdx)}
                          alt="Flagged Frame" 
                          className="w-full h-full object-cover"
                       />
                       <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 opacity-0 hover:opacity-100 transition-opacity">
                          <a href={getTileUrl(jobId, 'after', tileIdx)} target="_blank" rel="noreferrer" className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded">Open in New Tab</a>
                       </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center gap-4">
                       <div className="flex items-center justify-between">
                          <h4 className="text-white font-medium flex items-center gap-2">
                             <Eye size={16} className="text-blue-400" />
                             Tile Verification #{tileIdx}
                          </h4>
                          {isRemoved(tileIdx) && <span className="text-[10px] text-red-400 font-bold uppercase">Marked for Removal</span>}
                       </div>
                       
                        <div className="space-y-2 pb-4">
                          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700 flex items-center justify-between group">
                            <div className="flex flex-col flex-1">
                              <span className="text-[10px] text-slate-500 uppercase font-bold">Callout Detection</span>
                              {editingIdx === tileIdx ? (
                                <input
                                  autoFocus
                                  className="bg-transparent border-b border-blue-500 text-blue-400 outline-none text-sm py-1"
                                  defaultValue={getRename(tileIdx) || getOriginalCalloutText(tileIdx)}
                                  onBlur={(e) => {
                                    handleRenameCallout(tileIdx, e.target.value);
                                    setEditingIdx(null);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleRenameCallout(tileIdx, e.target.value);
                                      setEditingIdx(null);
                                    }
                                  }}
                                />
                              ) : (
                                isRemoved(tileIdx) ? (
                                  <span className="text-red-400 line-through text-sm">
                                    {getRename(tileIdx) || getOriginalCalloutText(tileIdx)}
                                  </span>
                                ) : (
                                  <span className="text-sky-400 text-sm font-medium">
                                    {getRename(tileIdx) || getOriginalCalloutText(tileIdx)}
                                  </span>
                                )
                              )}
                            </div>
                            {/* Edit / Remove controls (visible on hover) */}
                            {!isRemoved(tileIdx) && (
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => setEditingIdx(tileIdx)}
                                  className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button
                                  onClick={() => handleRemoveCallout(tileIdx)}
                                  className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            )}
                            {isRemoved(tileIdx) && (
                              <button
                                onClick={() => setOverrides(prev => prev.filter(o => o.tileIdx !== tileIdx))}
                                className="text-xs text-blue-400 hover:underline"
                              >
                                Undo
                              </button>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 px-1 italic">
                            {isRemoved(tileIdx) ? '* This callout will NOT appear in the final report.' : '* Click the edit icon to change the text.'}
                          </p>
                        </div>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-black/20 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <button
            onClick={handleAbort}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium border border-transparent hover:border-slate-700 disabled:opacity-50"
          >
            {isDPIStage ? 'Abort & Change DPI' : 'Cancel Analysis'}
          </button>
          
          <button
            onClick={handleProceed}
            disabled={loading}
            className="w-full sm:w-auto px-10 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isDPIStage ? 'Confirm Zoom' : 'Finalize & Export'}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
