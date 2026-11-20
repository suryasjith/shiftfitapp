import React from 'react';
import { Bell, Droplets, Sun, Sparkles, X, ShieldCheck } from 'lucide-react';
import { NotificationService } from '../services/notificationService';
import { soundManager } from '../services/audioTimer';

interface NotificationPermissionModalProps {
  isOpen: boolean;
  onClose: (granted: boolean) => void;
}

export const NotificationPermissionModal: React.FC<NotificationPermissionModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleEnable = async () => {
    soundManager.playTap();
    const granted = await NotificationService.requestPermission();
    if (granted) {
      soundManager.playCompleteChime();
      // Send welcoming confirmation notification
      await NotificationService.sendNotification('ShiftFit Notifications Active', {
        body: '☀️ 8:00 AM Morning Quotes & 💧 Smart Hydration Reminders are now active on your device.',
        tag: 'welcome-notification',
      });
    }
    onClose(granted);
  };

  const handleSkip = () => {
    soundManager.playTap();
    onClose(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notif-modal-title"
    >
      <div className="w-full max-w-sm rounded-3xl bg-[#0A0A0A] border border-white/15 p-5 shadow-2xl text-white space-y-4 font-sans">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-950/80 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0">
              <Bell className="w-5 h-5 animate-pulse" aria-hidden="true" />
            </div>
            <div>
              <h3 id="notif-modal-title" className="text-sm font-bold tracking-tight">
                Mobile Push Alerts
              </h3>
              <p className="text-[11px] text-stone-400 font-mono">
                Discipline & Hydration Engine
              </p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            aria-label="Close notification prompt"
            className="w-8 h-8 rounded-full bg-stone-900 border border-white/10 flex items-center justify-center text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feature Cards */}
        <div className="space-y-2.5 text-xs">
          <div className="p-3 rounded-2xl bg-stone-900/90 border border-white/10 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-amber-950/80 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <Sun className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h4 className="font-bold text-amber-300 text-[11px] uppercase tracking-wide">
                Daily 8:00 AM Discipline Quote
              </h4>
              <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">
                Start your morning with high-impact athletic stoicism and shift-work resilience. Works 100% offline.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-stone-900/90 border border-white/10 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-sky-950/80 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
              <Droplets className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h4 className="font-bold text-sky-300 text-[11px] uppercase tracking-wide">
                Smart Hydration Prompts
              </h4>
              <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">
                Reminds you every 2–3 hours. Automatically silences once your daily water goal is achieved.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Assurance */}
        <div className="flex items-center gap-2 px-2 text-[10px] text-stone-400 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
          <span>Local device alerts only. No telemetry or spam.</span>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleEnable}
            className="w-full min-h-[44px] py-3 rounded-2xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-orange-950/50 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            <span>Enable Push Notifications</span>
          </button>
          <button
            type="button"
            onClick={handleSkip}
            className="w-full min-h-[44px] py-2 rounded-2xl text-stone-400 hover:text-stone-200 text-xs font-semibold transition-colors focus:outline-none"
          >
            Not Now (Skip)
          </button>
        </div>
      </div>
    </div>
  );
};
