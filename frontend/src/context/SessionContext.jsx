/**
 * SessionContext — global state shared across all tabs/sections.
 *
 * Stores:
 *  • mapName        — entered in Intro, shown in TopNav & everywhere
 *  • screenshotFile — uploaded in Intro (prism detail screenshot)
 *  • fiberFields    — { prismId, nodeName, instance } typed in FiberMapSection
 *                     auto-copied to FiberOverviewSection & SchematicFiberSection
 */
import React, { createContext, useContext, useState } from 'react';

const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
  // ── Intro ──────────────────────────────────────────────────────
  const [mapName, setMapName] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);

  // ── Shared fiber fields (After → Fiber tab → propagates) ───────
  const [fiberFields, setFiberFields] = useState({
    prismId: '',
    nodeName: '',
    instance: '',
  });

  const updateFiberField = (key, value) => {
    setFiberFields(prev => ({ ...prev, [key]: value }));
  };

  return (
    <SessionContext.Provider
      value={{
        mapName, setMapName,
        screenshotFile, setScreenshotFile,
        fiberFields, updateFiberField, setFiberFields,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

/** Convenience hook */
export const useSession = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>');
  return ctx;
};
