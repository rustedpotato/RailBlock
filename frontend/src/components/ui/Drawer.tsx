import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 'w-full sm:w-[480px]'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div
        className={`relative z-10 ${width} h-full bg-[var(--surface)] border-l border-[var(--border)] shadow-[var(--shadow-drawer)] flex flex-col transform transition-transform duration-200 ease-out`}
      >
        {/* Header */}
        <div className="h-[56px] px-6 border-b border-[var(--border)] flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-[15px] font-semibold tracking-tight text-[var(--fg)]">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[12px] text-[var(--fg-muted)] font-mono">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[6px] flex items-center justify-center text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
};
