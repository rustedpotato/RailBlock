import React, { createContext, useContext, useMemo, useState } from 'react';
import { LineId, LINES, getLineForSection } from '../data/lines';
import {
  MOCK_TASKS,
  MOCK_TRAINS,
  MOCK_ASSETS,
  MOCK_BLOCK_WINDOWS,
  MOCK_CONFLICTS
} from '../data/mockData';

interface LineContextValue {
  selectedLine: LineId;
  setSelectedLine: (line: LineId) => void;
}

const LineContext = createContext<LineContextValue | undefined>(undefined);

export const LineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedLine, setSelectedLine] = useState<LineId>(
    () => (localStorage.getItem('railblock-line') as LineId) || 'all'
  );

  const update = (line: LineId) => {
    localStorage.setItem('railblock-line', line);
    setSelectedLine(line);
  };

  return (
    <LineContext.Provider value={{ selectedLine, setSelectedLine: update }}>
      {children}
    </LineContext.Provider>
  );
};

export const useLine = () => {
  const ctx = useContext(LineContext);
  if (!ctx) throw new Error('useLine must be used within LineProvider');
  return ctx;
};

/** True if a record's section belongs to the currently selected line. */
export const matchesLine = (line: LineId, section?: string) =>
  line === 'all' || getLineForSection(section)?.id === line;

/** All datasets, pre-filtered to the active line. */
export const useLineData = () => {
  const { selectedLine } = useLine();

  return useMemo(() => {
    const by = <T extends { section?: string }>(items: T[]) =>
      items.filter((i) => matchesLine(selectedLine, i.section));

    const SECTIONS =
      selectedLine === 'all'
        ? LINES.flatMap((l) => l.sections)
        : LINES.find((l) => l.id === selectedLine)!.sections;

    return {
      SECTIONS,
      MOCK_TASKS: by(MOCK_TASKS),
      MOCK_TRAINS: by(MOCK_TRAINS),
      MOCK_ASSETS: by(MOCK_ASSETS),
      MOCK_BLOCK_WINDOWS: by(MOCK_BLOCK_WINDOWS),
      MOCK_CONFLICTS: by(MOCK_CONFLICTS)
    };
  }, [selectedLine]);
};
