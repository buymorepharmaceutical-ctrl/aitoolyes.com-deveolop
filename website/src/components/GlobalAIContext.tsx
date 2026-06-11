'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AdModal from './AdModal';

interface AIContextType {
  currentPage: string;
  recentActions: string[];
  addAction: (action: string) => void;
  getAIContextString: () => string;
  incrementToolUsage: () => void;
}

const AIContext = createContext<AIContextType>({
  currentPage: '/',
  recentActions: [],
  addAction: () => {},
  getAIContextString: () => '',
  incrementToolUsage: () => {},
});

export const useAIContext = () => useContext(AIContext);

export function GlobalAIProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [recentActions, setRecentActions] = useState<string[]>([]);
  const [toolUsageCount, setToolUsageCount] = useState(0);
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);

  // Automatically track page views
  useEffect(() => {
    addAction(`Navigated to ${pathname}`);
  }, [pathname]);

  const addAction = (action: string) => {
    setRecentActions((prev) => {
      const newActions = [action, ...prev].slice(0, 5); // Keep last 5 actions
      return newActions;
    });
  };

  const getAIContextString = () => {
    return `[System Context: The user is currently on the path '${pathname}'. Their recent actions are: ${recentActions.join(' -> ')}]`;
  };

  const incrementToolUsage = () => {
    setToolUsageCount((prev) => {
      const newCount = prev + 1;
      if (newCount >= 3) {
        setIsAdModalOpen(true);
        return 0; // Reset count
      }
      return newCount;
    });
  };

  return (
    <AIContext.Provider value={{ currentPage: pathname || '/', recentActions, addAction, getAIContextString, incrementToolUsage }}>
      {children}
      <AdModal isOpen={isAdModalOpen} onClose={() => setIsAdModalOpen(false)} />
    </AIContext.Provider>
  );
}
