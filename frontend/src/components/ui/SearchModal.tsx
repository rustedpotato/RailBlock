import React, { useEffect, useState } from 'react';
import { Search, Train, CheckSquare, Layers } from 'lucide-react';
import { useLineData } from '../../context/LineContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTask: (taskId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectTask }) => {
  const [query, setQuery] = useState('');
  const { tasks, assets, trains } = useLineData();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredTasks = tasks.filter(
    (t) => t.id.toLowerCase().includes(q) || t.title.toLowerCase().includes(q) || t.section.toLowerCase().includes(q)
  );

  const filteredAssets = assets.filter(
    (a) => a.id.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || a.section.toLowerCase().includes(q)
  );

  const filteredTrains = trains.filter(
    (tr) => tr.train_number.includes(q) || tr.name.toLowerCase().includes(q)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[620px] bg-[var(--surface)] border border-[var(--border-strong)] rounded-[12px] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[520px]">
        {/* Search Input */}
        <div className="flex items-center px-4 border-b border-[var(--border)] h-[48px]">
          <Search size={18} className="text-[var(--fg-subtle)] shrink-0 mr-3" />
          <input
            autoFocus
            type="text"
            placeholder="Search tasks, assets, train paths, sections..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-[var(--fg)] placeholder:text-[var(--fg-subtle)] text-[14px] outline-none"
          />
          <kbd className="text-[11px] font-mono px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--fg-subtle)]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="p-2 overflow-y-auto space-y-4">
          {filteredTasks.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-[var(--fg-subtle)]">
                Tasks ({filteredTasks.length})
              </div>
              {filteredTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  onClick={() => {
                    onSelectTask(task.id);
                    onClose();
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-[6px] hover:bg-[var(--surface-hover)] cursor-pointer text-[13px]"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <CheckSquare size={14} className="text-[#0070F3] shrink-0" />
                    <span className="font-mono text-xs text-[var(--fg-muted)]">{task.id}</span>
                    <span className="truncate text-[var(--fg)] font-medium">{task.title}</span>
                  </div>
                  <span className="text-[11px] font-mono text-[var(--fg-subtle)] shrink-0 ml-2">
                    {task.section}
                  </span>
                </div>
              ))}
            </div>
          )}

          {filteredAssets.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-[var(--fg-subtle)]">
                Assets ({filteredAssets.length})
              </div>
              {filteredAssets.slice(0, 3).map((asset) => (
                <div
                  key={asset.id}
                  onClick={onClose}
                  className="flex items-center justify-between px-3 py-2 rounded-[6px] hover:bg-[var(--surface-hover)] cursor-pointer text-[13px]"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Layers size={14} className="text-[#F5A623] shrink-0" />
                    <span className="font-mono text-xs text-[var(--fg-muted)]">{asset.id}</span>
                    <span className="truncate text-[var(--fg)]">{asset.name}</span>
                  </div>
                  <span className="text-[11px] font-mono text-[var(--fg-subtle)] shrink-0 ml-2">
                    {asset.km_marker}
                  </span>
                </div>
              ))}
            </div>
          )}

          {filteredTrains.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-[var(--fg-subtle)]">
                Trains ({filteredTrains.length})
              </div>
              {filteredTrains.slice(0, 3).map((tr) => (
                <div
                  key={tr.train_number}
                  onClick={onClose}
                  className="flex items-center justify-between px-3 py-2 rounded-[6px] hover:bg-[var(--surface-hover)] cursor-pointer text-[13px]"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Train size={14} className="text-[#8E4EC6] shrink-0" />
                    <span className="font-mono text-xs text-[var(--fg-muted)]">{tr.train_number}</span>
                    <span className="truncate text-[var(--fg)]">{tr.name}</span>
                  </div>
                  <span className="text-[11px] font-mono text-[var(--fg-subtle)] shrink-0 ml-2">
                    {tr.scheduled_passing} IST
                  </span>
                </div>
              ))}
            </div>
          )}

          {filteredTasks.length === 0 && filteredAssets.length === 0 && filteredTrains.length === 0 && (
            <div className="p-8 text-center text-sm text-[var(--fg-subtle)]">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
