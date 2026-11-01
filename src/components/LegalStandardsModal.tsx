import React, { useState } from 'react';
import { ShieldCheck, HeartPulse, Lock, FileText, Code2, X, ExternalLink } from 'lucide-react';

interface LegalStandardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type LegalTab = 'safety' | 'privacy' | 'license' | 'terms';

export const LegalStandardsModal: React.FC<LegalStandardsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>('safety');

  if (!isOpen) return null;

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg max-h-[85vh] flex flex-col bg-[#FBF9F5] dark:bg-stone-950 border border-stone-200/80 dark:border-white/15 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden font-sans text-left animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-200/80 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/80 border border-orange-200 dark:border-orange-500/40 flex items-center justify-center text-terracotta dark:text-orange-400">
              <ShieldCheck className="w-4 h-4 stroke-[2.2]" aria-hidden="true" />
            </div>
            <div>
              <h2 id="legal-modal-title" className="text-base font-bold text-stone-900 dark:text-white tracking-tight font-heading">
                Legal Standards & Privacy
              </h2>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                100% Free Open-Source Architecture (MIT)
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close legal standards window"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-4 p-2 bg-stone-100/70 dark:bg-stone-900/80 border-b border-stone-200/80 dark:border-white/10 shrink-0 font-mono text-[11px] font-bold">
          <button
            onClick={() => setActiveTab('safety')}
            className={`min-h-[44px] flex flex-col items-center justify-center rounded-xl px-1 py-1 transition-all ${
              activeTab === 'safety'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <HeartPulse className="w-4 h-4 mb-0.5 text-rose-500" aria-hidden="true" />
            <span>Safety</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`min-h-[44px] flex flex-col items-center justify-center rounded-xl px-1 py-1 transition-all ${
              activeTab === 'privacy'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Lock className="w-4 h-4 mb-0.5 text-emerald-500" aria-hidden="true" />
            <span>Privacy</span>
          </button>

          <button
            onClick={() => setActiveTab('license')}
            className={`min-h-[44px] flex flex-col items-center justify-center rounded-xl px-1 py-1 transition-all ${
              activeTab === 'license'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Code2 className="w-4 h-4 mb-0.5 text-terracotta" aria-hidden="true" />
            <span>License</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`min-h-[44px] flex flex-col items-center justify-center rounded-xl px-1 py-1 transition-all ${
              activeTab === 'terms'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <FileText className="w-4 h-4 mb-0.5 text-purple-500" aria-hidden="true" />
            <span>Terms</span>
          </button>
        </div>

        {/* Tab Content (Scrollable) */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs leading-relaxed text-stone-700 dark:text-stone-300">
          {activeTab === 'safety' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-200">
                <strong className="block text-xs font-bold uppercase tracking-wider mb-1">
                  Medical & Exercise Safety Disclaimer
                </strong>
                ShiftFit is an informational wellness and resistance training utility designed for healthy adults. It does not provide medical diagnoses, physical therapy prescriptions, or personalized medical care. Always consult a physician before beginning any new training program.
              </div>

              <h4 className="font-bold text-stone-900 dark:text-white uppercase font-mono text-[11px] pt-1">
                Physical Activity Readiness Standards (PAR-Q)
              </h4>
              <p className="text-stone-600 dark:text-stone-400">
                Before engaging in physical training, confirm that you have no cardiovascular symptoms, unexplained chest pain, joint pathology, balance disorders, or prescription blood pressure conditions without prior physician approval.
              </p>

              <div className="p-3 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-white/10 space-y-1.5">
                <strong className="text-[10px] font-bold uppercase tracking-wider text-stone-900 dark:text-white block">
                  Immediate Cessation Rule:
                </strong>
                <p className="text-stone-600 dark:text-stone-400">
                  Halt your workout immediately if you feel acute dizziness, chest tightness, sharp joint pain, cold sweats, or nausea.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-200">
                <strong className="block text-xs font-bold uppercase tracking-wider mb-1">
                  100% Local-First & Zero Telemetry (GDPR Art. 25)
                </strong>
                ShiftFit adheres to Privacy-by-Design standards. All weight logs, custom shift rotas, and nutrition logs exist solely in your device's local browser memory (IndexedDB).
              </div>

              <ul className="space-y-2 text-stone-600 dark:text-stone-400">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                  <span><strong>Zero Cloud Servers:</strong> No personal or health metrics are ever transmitted to or stored on remote servers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                  <span><strong>Zero Third-Party Trackers:</strong> No advertising SDKs, no Google Analytics, no Meta Pixel, and no tracking cookies.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                  <span><strong>Full Data Sovereignty:</strong> You can export an unencrypted JSON backup of your records at any time using the <em>Offline DB</em> tool.</span>
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'license' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="p-3 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-white/10 font-mono text-[11px]">
                <strong className="block text-stone-900 dark:text-white font-bold mb-1">
                  The MIT License (Open Source)
                </strong>
                <p className="text-stone-600 dark:text-stone-400 text-[10px] leading-relaxed">
                  Copyright (c) 2026 Surya Sajith Jith & ShiftFit Contributors.<br /><br />
                  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files, to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software.
                </p>
              </div>

              <h4 className="font-bold text-stone-900 dark:text-white uppercase font-mono text-[11px] pt-1">
                Open Source & Asset Attributions
              </h4>
              <div className="space-y-1.5 text-[11px] font-mono text-stone-600 dark:text-stone-400">
                <p>• <strong>free-exercise-db:</strong> Public Domain / Unlicense (yuhonas)</p>
                <p>• <strong>Lucide Icons:</strong> ISC License</p>
                <p>• <strong>React & Vite:</strong> MIT License</p>
                <p>• <strong>Tailwind CSS:</strong> MIT License</p>
                <p>• <strong>Inter & Outfit:</strong> SIL Open Font License 1.1</p>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-500/30 text-purple-800 dark:text-purple-200">
                <strong className="block text-xs font-bold uppercase tracking-wider mb-1">
                  Terms of Service & Limitation of Liability
                </strong>
                ShiftFit is provided "AS IS" without warranty of any kind. Physical resistance exercise carries inherent physical risk; users assume full voluntary responsibility for their training decisions.
              </div>

              <p className="text-stone-600 dark:text-stone-400">
                Because ShiftFit is a 100% offline, client-side application with zero remote accounts, data preservation remains under your control. Please export regular JSON backups to prevent accidental loss when clearing browser cache.
              </p>

              <a
                href="https://github.com/suryasjith/shiftfitapp"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] inline-flex items-center gap-1.5 text-terracotta dark:text-orange-400 font-mono font-bold hover:underline"
              >
                <span>Inspect Open Source Repository on GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200/80 dark:border-white/10 shrink-0 bg-stone-50/50 dark:bg-stone-950/80">
          <button
            onClick={onClose}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-2xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md flex items-center justify-center"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
