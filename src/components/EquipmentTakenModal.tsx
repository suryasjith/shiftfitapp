import React from 'react';
import { ExerciseDefinition, ExerciseAlternative } from '../types';
import { X, ArrowRightLeft, Sparkles, Check } from 'lucide-react';
import { soundManager } from '../services/audioTimer';

interface EquipmentTakenModalProps {
  exerciseDef: ExerciseDefinition;
  currentSelectedAlternative?: string;
  onSelectAlternative: (altName: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const EquipmentTakenModal: React.FC<EquipmentTakenModalProps> = ({
  exerciseDef,
  currentSelectedAlternative,
  onSelectAlternative,
  onClose,
  isOpen,
}) => {
  if (!isOpen) return null;

  const handleSelect = (alt: ExerciseAlternative) => {
    soundManager.playTap();
    onSelectAlternative(alt.name);
    onClose();
  };

  const handleResetToPrimary = () => {
    soundManager.playTap();
    onSelectAlternative('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl bg-dark-900 border border-dark-700 shadow-2xl p-5 text-left relative overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-dark-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Equipment Taken?</h3>
              <p className="text-xs text-amber-400 font-medium">Instant Biomechanical Swaps</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-dark-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Target Muscle Badge */}
        <div className="mt-3 p-3 rounded-xl bg-dark-800/80 border border-dark-700 shrink-0">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Target Muscle Group
          </div>
          <div className="text-sm font-bold text-cyan-300 mt-0.5">
            {exerciseDef.targetMuscle}
          </div>
          <div className="text-xs text-slate-300 mt-1 flex items-center gap-1">
            <span>Original:</span>
            <span className="font-semibold text-white">{exerciseDef.name}</span>
          </div>
        </div>

        {/* Alternatives List */}
        <div className="mt-3 overflow-y-auto space-y-2.5 pr-1 flex-1 py-1">
          {/* Option to revert to primary */}
          {currentSelectedAlternative && (
            <button
              onClick={handleResetToPrimary}
              className="w-full p-3 rounded-xl border border-dashed border-cyan-500/50 bg-cyan-500/5 hover:bg-cyan-500/10 text-left transition-all active:scale-[0.99] flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-cyan-400">Revert to Original Movement</div>
                <div className="text-xs text-slate-300">{exerciseDef.name} ({exerciseDef.primaryEquipment})</div>
              </div>
              <Check className="w-4 h-4 text-cyan-400" />
            </button>
          )}

          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider pt-1">
            Matching Resistance Curve Alternatives
          </div>

          {exerciseDef.alternatives.map((alt, idx) => {
            const isSelected = currentSelectedAlternative === alt.name;
            return (
              <button
                key={idx}
                onClick={() => handleSelect(alt)}
                className={`w-full p-3.5 rounded-xl border text-left transition-all active:scale-[0.99] relative ${
                  isSelected
                    ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-glow-cyan'
                    : 'bg-dark-800/90 border-dark-700/80 hover:border-dark-600 text-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>{alt.name}</span>
                      {isSelected && <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500 text-black font-bold">ACTIVE</span>}
                    </div>
                    <div className="text-xs text-amber-400 font-medium mt-0.5">
                      Required Equipment: {alt.equipment}
                    </div>
                  </div>
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                </div>
                <div className="mt-2 text-xs text-slate-300 bg-dark-900/60 p-2 rounded-lg border border-dark-800">
                  <span className="text-slate-400 font-semibold">Biomechanical Cue:</span> {alt.cue}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-dark-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-200 text-xs font-semibold transition-all active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
