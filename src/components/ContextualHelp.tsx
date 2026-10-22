import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface ContextualHelpProps {
  title: string;
  content: string;
  placement?: 'bottom' | 'top' | 'left' | 'right';
  className?: string;
}

export const ContextualHelp: React.FC<ContextualHelpProps> = ({
  title,
  content,
  placement = 'bottom',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`w-3.5 h-3.5 rounded-full border text-[9px] font-mono flex items-center justify-center transition-all ${
          isOpen
            ? 'border-white bg-white text-black font-bold'
            : 'border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-400 bg-neutral-900'
        }`}
        aria-label={`Help info for ${title}`}
        title={`What is ${title}?`}
      >
        ?
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 w-64 p-3 bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl text-left animate-fadeIn ${
            placement === 'top'
              ? 'bottom-full mb-1.5 left-1/2 -translate-x-1/2'
              : placement === 'left'
              ? 'right-full mr-1.5 top-1/2 -translate-y-1/2'
              : placement === 'right'
              ? 'left-full ml-1.5 top-1/2 -translate-y-1/2'
              : 'top-full mt-1.5 left-1/2 -translate-x-1/2'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-2 border-b border-neutral-800 pb-1.5 mb-1.5">
            <span className="text-[10px] font-bold text-white tracking-wide uppercase font-mono">
              {title}
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-neutral-500 hover:text-white p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <p className="text-[11px] text-neutral-300 leading-relaxed font-sans">
            {content}
          </p>
        </div>
      )}
    </div>
  );
};
