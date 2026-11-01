import React, { useState, useEffect } from 'react';
import { Share, PlusSquare, X, Smartphone } from 'lucide-react';

export const InstallBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    
    const dismissed = localStorage.getItem('shiftfit_install_banner_dismissed');

    if (!isStandalone && !dismissed) {
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
    <div className="mx-1 mb-4 rounded-2xl bg-stone-50 dark:bg-stone-900/90 border border-stone-200 dark:border-white/15 p-3.5 text-left relative animate-slideUp">
      <button 
        onClick={handleDismiss}
        className="absolute top-2.5 right-2.5 text-stone-400 hover:text-stone-900 dark:hover:text-white p-1"
        aria-label="Dismiss banner"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <div className="w-8 h-8 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-white/10 text-stone-900 dark:text-white flex items-center justify-center shrink-0">
          <Smartphone className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-stone-900 dark:text-white font-mono uppercase tracking-wide">
            iOS Safari Fullscreen PWA
          </h4>
          <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
            For distraction-free gym training without URL bars: Tap <Share className="w-3.5 h-3.5 inline mx-0.5 text-stone-900 dark:text-white" /> in Safari, then select <span className="font-semibold text-stone-900 dark:text-white">"Add to Home Screen"</span> <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-stone-900 dark:text-white" />.
          </p>
        </div>
      </div>
    </div>
  );
};
