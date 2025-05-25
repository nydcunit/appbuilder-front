import React, { createContext, useContext, useState, useCallback } from 'react';

const ZIndexContext = createContext();

export const useZIndex = () => {
  const context = useContext(ZIndexContext);
  if (!context) {
    throw new Error('useZIndex must be used within a ZIndexProvider');
  }
  return context;
};

export const ZIndexProvider = ({ children }) => {
  const [currentZIndex, setCurrentZIndex] = useState(1000);

  const getNextZIndex = useCallback(() => {
    const nextIndex = currentZIndex + 10;
    setCurrentZIndex(nextIndex);
    return nextIndex;
  }, [currentZIndex]);

  const releaseZIndex = useCallback(() => {
    setCurrentZIndex(prev => Math.max(1000, prev - 10));
  }, []);

  const value = {
    getNextZIndex,
    releaseZIndex,
    currentZIndex
  };

  return (
    <ZIndexContext.Provider value={value}>
      {children}
    </ZIndexContext.Provider>
  );
};