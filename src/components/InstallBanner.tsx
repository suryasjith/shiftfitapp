import React, { useState, useEffect } from 'react';
import { Share, PlusSquare, X, Smartphone } from 'lucide-react';

export const InstallBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    // Check if running in standalone PWA mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    
    // Check if dismissed before
    const dismissed = localStorage.getItem('shiftfit_install_banner_dismissed');

    if (!isStandalone && !dismissed) {
      // Show banner after brief delay
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('shiftfit_install_banner_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="mx-4 mb-4 rounded-2xl bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 border border-cyan-500/40 p-3.5 shadow-xl shadow-cyan-950/40 text-left relative animate-slideUp">
      <button 
        onClick={handleDismiss}
        className="absolute top-2.5 right-2.5 text-slate-400 hover:text-white p-1"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
            <span>Install ShiftFit as iOS Safari PWA</span>
          </h4>
          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
            For fullscreen gym mode without URL bars: Tap <Share className="w-3.5 h-3.5 inline mx-0.5 text-cyan-400" /> in Safari, then select <span className="font-semibold text-white">"Add to Home Screen"</span> <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-cyan-400" />.
          </p>
        </div>
      </div>
    </div>
  );
};
