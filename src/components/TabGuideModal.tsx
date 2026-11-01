import React from 'react';
import { NavTab } from './Navbar';
import { Info, X, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface TabGuideModalProps {
  isOpen: boolean;
  currentTab: NavTab;
  onClose: () => void;
  onOpenLegal?: () => void;
}

const TAB_GUIDE_DATA: Record<NavTab, {
  title: string;
  badge: string;
  description: string;
  primaryAction: string;
  quickTips: string[];
}> = {
  today: {
    title: 'Today at a Glance',
    badge: 'Focus Dashboard',
    description: 'This screen is designed to answer one question: "What do I need to do right now?" It strips away clutter so you can focus on today\'s targets.',
    primaryAction: 'Check your morning fatigue slider, tap "Start Workout" when ready to train, and monitor remaining calories and water.',
    quickTips: [
      'Adjust the 1–10 Fatigue slider upon waking to auto-scale workout intensity.',
      'Tap "Start Workout" to jump straight into your prescribed exercises.',
      'Tap "+250ml" or "+500ml" whenever you drink water.',
    ],
  },
  workout: {
    title: 'Workout & Shift Rota',
    badge: 'Active Training',
    description: 'Your workout is automatically tailored for aesthetic recomposition and scaled to match your 12-hour shift schedule and nervous system fatigue.',
    primaryAction: 'Tap an exercise to enter your weight and reps, then tap "Complete Set" to trigger the rest timer. If gym gear is busy, tap "Swap Exercise".',
    quickTips: [
      'Tap "Complete Set" on each set to log it and start your countdown rest timer.',
      'Tap "Swap Exercise" if a machine is taken to swap to an identical muscle alternative.',
      'Tap "Manage Shift Rota" to inspect or amend your 14-day shift schedule.',
    ],
  },
  fuel: {
    title: 'Fuel & Hydration',
    badge: 'Nutrition Intake',
    description: 'Log what you eat and drink to hit your target calories and protein (~185g) for muscle recovery between long shifts.',
    primaryAction: 'Tap "Search Food" to query any food or brand, or tap "Quick Shift Meal" to log pre-calculated shift meals with one tap.',
    quickTips: [
      'Type any food (e.g. "Oats", "Chicken breast") in the search bar to auto-calculate macros.',
      'Tap "View Macro Breakdown" to see your remaining protein, carbohydrates, and fats.',
      'Cardio activities and extra steps automatically increase your daily calorie allowance.',
    ],
  },
  progress: {
    title: 'Progress & Cardio',
    badge: 'Analytics & Steps',
    description: 'Track your aesthetic body recomposition, 7-day moving weight average, cardio exercise, and pedometer steps.',
    primaryAction: 'Log your cardio sessions (swimming, incline walks, running) to calculate calories, enter your daily steps, and export offline backups.',
    quickTips: [
      'Log morning weight daily: the 7-day moving average filters fluid retention.',
      'Input daily steps manually to calculate your active caloric burn.',
      'All data is aggressively saved to your local device memory for 100% offline access.',
    ],
  },
};

export const TabGuideModal: React.FC<TabGuideModalProps> = ({
  isOpen,
  currentTab,
  onClose,
  onOpenLegal,
}) => {
  if (!isOpen) return null;

  const data = TAB_GUIDE_DATA[currentTab] || TAB_GUIDE_DATA.today;

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="tab-guide-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-[#FBF9F5] dark:bg-stone-950 border border-stone-200/80 dark:border-white/15 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl text-left animate-slideUp font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3 border-b border-stone-200/80 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-stone-900 border border-orange-200 dark:border-orange-500/30 flex items-center justify-center text-terracotta dark:text-orange-400 shrink-0">
              <Info className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
                {data.badge} Guide
              </span>
              <h3 id="tab-guide-title" className="text-base font-bold text-stone-900 dark:text-white tracking-tight font-heading">
                {data.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close guide"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-4 space-y-3.5">
          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
            {data.description}
          </p>

          {/* Primary Action Callout */}
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-stone-900/80 border border-stone-200/80 dark:border-white/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-stone-900 dark:text-white tracking-wider block font-mono">
              What to do on this screen:
            </span>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
              {data.primaryAction}
            </p>
          </div>

          {/* Quick Tips */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 tracking-wider block font-mono">
              Quick Tips:
            </span>
            {data.quickTips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-stone-600 dark:text-stone-300">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span className="leading-snug">{tip}</span>
              </div>
            ))}
          </div>

          {/* Legal Standards & Disclaimers Link */}
          {onOpenLegal && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLegal();
                }}
                className="w-full min-h-[44px] p-2.5 rounded-xl border border-stone-200/80 dark:border-white/15 bg-white/60 dark:bg-stone-900/70 hover:bg-white dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-mono font-bold flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-terracotta dark:text-orange-400" aria-hidden="true" />
                  <span>Legal, Medical & Privacy Standards</span>
                </div>
                <span className="text-[10px] text-stone-400 dark:text-stone-500 uppercase">View &rarr;</span>
              </button>
            </div>
          )}
        </div>

        {/* Got It Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-2xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-1.5"
          >
            <span>Got It, Let's Go</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};
