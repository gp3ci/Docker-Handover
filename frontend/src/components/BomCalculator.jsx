import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { X, UploadCloud, RefreshCw, Loader2, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

export const BomCalculator = ({ onClose }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [fileName, setFileName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const processFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    setIsAnalyzing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetNames = workbook.SheetNames;

        const results = {
          coaxTapsCount: 0,
          coaxTapsUpgrade: 0,
          coaxActivesUpgrade: 0,
          coaxActivesUpgradeDesign: 0,
          coaxAerialFootage: 0,
          coaxUndergroundFootage: 0,
        };

        const findSheet = (name) =>
          sheetNames.find(
            (s) => s.toLowerCase().replace(/\s/g, '') === name.toLowerCase()
          );

        const processSheetData = (name, isActives = false) => {
          const sheetName = findSheet(name);
          if (!sheetName) return;
          const sheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(sheet);
          rows.forEach((row) => {
            const count = parseFloat(row['COUNT']) || 0;
            const upgrade = parseFloat(row['UPGRADE']) || 0;
            const design = parseFloat(row['DESIGN']) || 0;
            if (!isActives) {
              results.coaxTapsCount += count;
              results.coaxTapsUpgrade += upgrade;
            } else {
              results.coaxActivesUpgrade += upgrade;
              results.coaxActivesUpgradeDesign += upgrade + design;
            }
          });
        };

        const processFootageData = () => {
          const sheetName = findSheet('CoaxQuickDetails');
          if (!sheetName) return;
          const sheet = workbook.Sheets[sheetName];
          // Use { header: 1 } to get raw arrays for more robust parsing
          const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          if (!data || data.length === 0) return;

          // Find column indices
          const headerRow = data[0] || [];
          const typeColIndex = headerRow.findIndex(h => h?.toString().toLowerCase().includes('type') || h?.toString().toLowerCase().includes('description'));
          const feetColIndex = headerRow.findIndex(h => h?.toString().toLowerCase() === 'feet' || h?.toString().toLowerCase().includes('foot'));

          // Fallback: if headers not identified, search row by row
          data.slice(1).forEach((row) => {
            let rowType = '';
            let rowFeet = 0;

            if (typeColIndex !== -1 && feetColIndex !== -1) {
              rowType = row[typeColIndex]?.toString().toLowerCase().trim();
              rowFeet = parseFloat(row[feetColIndex]) || 0;
            } else {
              // Brute force search in the row
              rowType = row.find(cell => ['aerial', 'riser', 'underground'].includes(cell?.toString().toLowerCase().trim()))?.toString().toLowerCase().trim() || '';
              // For feet, we check if there's a number and we didn't use it for type
              const possibleFeet = row.find(cell => !isNaN(parseFloat(cell)) && typeof cell !== 'string');
              rowFeet = parseFloat(possibleFeet) || 0;
              // If no explicit feet column, this is risky. Let's try to find a column with 'FEET' in header again.
            }

            if (rowType === 'aerial') {
              results.coaxAerialFootage += rowFeet;
            } else if (rowType === 'riser' || rowType === 'underground') {
              results.coaxUndergroundFootage += rowFeet;
            }
          });
        };

        processSheetData('CoaxTaps');
        processSheetData('CoaxActives', true);
        processFootageData();

        setResults(results);
      } catch (err) {
        console.error('BOM parse error:', err);
        alert('Could not read file. Please ensure it is a valid .xlsx / .xlsm / .csv BOM file.');
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (e) => processFile(e.target.files[0]);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleReset = () => {
    setResults(null);
    setFileName('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const ResultCard = ({ label, value, accent }) => (
    <div style={{
      padding: '1.25rem 1.5rem',
      borderRadius: 'var(--radius-md)',
      backgroundColor: accent ? 'var(--accent-light)' : 'var(--bg-secondary)',
      border: `1px solid ${accent ? 'var(--border-focus)' : 'var(--border-color)'}`,
      display: 'flex', flexDirection: 'column', gap: '0.35rem'
    }}>
      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: accent ? 'var(--accent-primary)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: accent ? 'var(--accent-primary)' : 'var(--text-primary)', lineHeight: 1 }}>
        {value.toLocaleString()}
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000,
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          style={{
            width: '100%', maxWidth: '560px',
            backgroundColor: 'var(--bg-primary)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 32px 64px -20px rgba(0,0,0,0.45)',
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FileSpreadsheet size={22} color="var(--accent-primary)" />
              <div>
                <h3 style={{ fontWeight: 700, margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  BOM Calculator
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  Upload a .xlsx / .xlsm / .csv Bill of Materials
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', borderRadius: 'var(--radius-sm)', padding: '4px' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Body */}
          <div style={{ padding: '2rem' }}>
            <AnimatePresence mode="wait">
              {!results ? (
                <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {/* Drop Zone */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    style={{
                      border: `2px dashed ${dragOver ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                      borderRadius: 'var(--radius-lg)',
                      padding: '3rem 2rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: dragOver ? 'var(--accent-light)' : 'var(--bg-secondary)',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                    }}
                  >
                    {isAnalyzing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <Loader2 size={36} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
                        <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>Analysing BOM…</p>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{fileName}</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <UploadCloud size={28} color="var(--accent-primary)" />
                        </div>
                        <div>
                          <p style={{ margin: '0 0 0.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            Drop your BOM file here
                          </p>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            or <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>click to browse</span> &nbsp;·&nbsp; .xlsx, .xlsm, .csv
                          </p>
                        </div>
                      </div>
                    )}
                    <input
                      ref={inputRef}
                      type="file"
                      accept=".csv,.xlsx,.xlsm"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {/* Success Banner */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', color: 'var(--success)' }}>
                    <CheckCircle2 size={18} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Analysis Complete — {fileName}</span>
                  </div>

                  {/* Coax Taps Results */}
                  <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
                    Coax Taps
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <ResultCard label="Total Count" value={results.coaxTapsCount} />
                    <ResultCard label="Upgrade" value={results.coaxTapsUpgrade} />
                  </div>

                  {/* Coax Actives Results */}
                  <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
                    Coax Actives
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <ResultCard label="Upgrade" value={results.coaxActivesUpgrade} accent />
                    <ResultCard label="Upgrade + Design" value={results.coaxActivesUpgradeDesign} accent />
                  </div>

                  {/* Coax Footage Results */}
                  <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
                    Coax FTG
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                    <ResultCard label="Aerial Footage" value={results.coaxAerialFootage} />
                    <ResultCard label="Underground Footage" value={results.coaxUndergroundFootage} />
                  </div>

                  {/* Reset */}
                  <button
                    onClick={handleReset}
                    style={{
                      width: '100%', padding: '0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-secondary)',
                      fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <RefreshCw size={16} /> Reset and Scan New BOM
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
