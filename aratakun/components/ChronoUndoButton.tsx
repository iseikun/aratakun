'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw, Sparkles } from 'lucide-react';
import { sound } from '@/lib/audio';

interface ChronoUndoButtonProps {
  charges: number;
  onRewindUsed: () => void;
}

export const ChronoUndoButton: React.FC<ChronoUndoButtonProps> = ({ charges, onRewindUsed }) => {
  const router = useRouter();

  const handleRewind = () => {
    if (charges <= 0) return;
    sound.playTimeTravel();
    onRewindUsed();
    // Next.js App Router の history.back() をゲームスキルとして実行！
    router.back();
  };

  return (
    <button
      onClick={handleRewind}
      disabled={charges <= 0}
      className={`px-3 py-1.5 rounded-lg border font-mono text-xs flex items-center gap-2 transition-all ${
        charges > 0
          ? 'border-cyber-neonPink bg-pink-950/40 text-pink-300 hover:bg-pink-900/50 hover:shadow-[0_0_15px_rgba(255,0,127,0.5)] cursor-pointer'
          : 'border-slate-800 bg-slate-900/40 text-slate-600 opacity-50 cursor-not-allowed'
      }`}
      title="ブラウザ履歴(history.back())をハックして直前のURL空間へ時空逆行します"
    >
      <RotateCcw className={`w-3.5 h-3.5 ${charges > 0 ? 'animate-spin-slow' : ''}`} />
      <span className="font-bold">CHRONO UNDO (useRouter)</span>
      <span className="px-1.5 py-0.2 rounded bg-pink-900/60 text-white text-[10px]">
        {charges} left
      </span>
      {charges > 0 && <Sparkles className="w-3 h-3 text-cyber-neonPink" />}
    </button>
  );
};
