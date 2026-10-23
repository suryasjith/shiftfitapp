import React from 'react';
import { ExerciseDefinition, ExerciseAlternative } from '../types';
import { X, ArrowRightLeft, Check } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-xl bg-black border border-neutral-700 shadow-2xl p-5 text-left relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-750 text-white">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-tight">Swap Exercise</h3>
              <p className="text-[11px] text-neutral-400 font-sans">Equipment taken? Pick an identical alternative</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-neutral-500 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Target Muscle Badge */}
        <div className="mt-3 p-3 rounded-lg bg-neutral-950 border border-neutral-800 shrink-0">
          <div className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider">
            Target Muscle Group
          </div>
          <div className="text-xs font-bold text-white font-mono mt-0.5">
            {exerciseDef.targetMuscle}
          </div>
          <div className="text-xs text-neutral-400 mt-1 flex items-center gap-1 font-mono">
            <span>Original:</span>
            <span className="text-white font-semibold">{exerciseDef.name}</span>
          </div>
        </div>

        {/* Alternatives List */}
        <div className="mt-3 overflow-y-auto space-y-2 pr-1 flex-1 py-1">
          {currentSelectedAlternative && (
            <button
              onClick={handleResetToPrimary}
              className="w-full p-2.5 rounded-lg border border-neutral-700 bg-neutral-900 hover:bg-neutral-850 text-left transition-all active:scale-[0.99] flex items-center justify-between text-xs font-mono"
            >
              <div>
                <div className="font-bold text-white">Revert to Original Movement</div>
                <div className="text-[11px] text-neutral-400">{exerciseDef.name} ({exerciseDef.primaryEquipment})</div>
              </div>
              <Check className="w-4 h-4 text-white" />
            </button>
          )}

          <div className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider pt-1">
            Matching Resistance Curve Swaps
          </div>

          {exerciseDef.alternatives.map((alt, idx) => {
            const isSelected = currentSelectedAlternative === alt.name;
            return (
              <button
                key={idx}
                onClick={() => handleSelect(alt)}
                className={`w-full p-3 rounded-lg border text-left transition-all active:scale-[0.99] ${
                  isSelected
                    ? 'bg-white text-black border-white'
                    : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 text-neutral-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1.5 font-mono">
                      <span>{alt.name}</span>
                      {isSelected && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-black text-white font-bold font-mono">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div className={`text-[11px] font-mono mt-0.5 ${isSelected ? 'text-neutral-700' : 'text-neutral-400'}`}>
                      Equipment: {alt.equipment}
                    </div>
                  </div>
                </div>
                <div className={`mt-2 text-[11px] p-2 rounded border leading-relaxed font-sans ${
                  isSelected 
                    ? 'bg-neutral-100 border-neutral-300 text-neutral-800' 
                    : 'bg-neutral-900 border-neutral-850 text-neutral-300'
                }`}>
                  <span className="font-bold font-mono text-[10px] uppercase">Form Cue:</span> {alt.cue}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-neutral-850 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-lg border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white text-xs font-mono transition-all active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
