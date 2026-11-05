'use client';

import React from 'react';
import { PlayerState } from '@/lib/gameTypes';
import { Shield, Zap, Heart, RotateCcw, Box } from 'lucide-react';

interface PlayerStatusProps {
  player: PlayerState;
  onUndo?: () => void;
  canUndo?: boolean;
}

export const PlayerStatus: React.FC<PlayerStatusProps> = ({ player, onUndo, canUndo }) => {
  const hpPercent = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));
  const apPercent = Math.max(0, Math.min(100, (player.ap / player.maxAp) * 100));

  return (
    <div className="bg-cyber-card/90 border border-cyber-border rounded-xl p-4 shadow-xl backdrop-blur-md">
      {/* 上部ヘッダー */}
      <div className="flex items-center justify-between mb-3 border-b border-cyber-border/60 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyber-neonCyan animate-ping" />
          <span className="text-xs font-bold tracking-widest text-cyber-neonCyan uppercase">
            React.Operator // Node #01
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-cyber-neonAmber">
            <Box className="w-3.5 h-3.5" />
            <span>{player.gold} Pkg</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyber-neonPink">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Chrono Undo: {player.rewindCharges}</span>
          </div>
        </div>
      </div>

      {/* ゲージエリア */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* HP ゲージ */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="flex items-center gap-1 text-cyber-neonPink font-semibold">
              <Heart className="w-3.5 h-3.5" /> MEMORY HP
            </span>
            <span className="text-slate-300">
              {player.hp} / {player.maxHp}
              {player.shield > 0 && (
                <span className="text-cyber-neonCyan ml-1.5 font-bold">
                  (+{player.shield} Shield)
                </span>
              )}
            </span>
          </div>
          <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700 relative">
            {/* シールドレイヤー */}
            {player.shield > 0 && (
              <div
                className="absolute top-0 left-0 h-full bg-cyber-neonCyan/40 z-10 transition-all duration-300"
                style={{ width: `${Math.min(100, hpPercent + (player.shield / player.maxHp) * 100)}%` }}
              />
            )}
            {/* HPレイヤー */}
            <div
              className={`h-full transition-all duration-300 ${
                hpPercent > 50
                  ? 'bg-gradient-to-r from-emerald-500 to-cyber-neonGreen'
                  : hpPercent > 20
                  ? 'bg-gradient-to-r from-amber-500 to-cyber-neonAmber'
                  : 'bg-gradient-to-r from-red-600 to-cyber-neonPink animate-pulse'
              }`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>

        {/* AP ゲージ */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="flex items-center gap-1 text-cyber-neonCyan font-semibold">
              <Zap className="w-3.5 h-3.5" /> CPU CYCLE (AP)
            </span>
            <span className="text-slate-300">
              {player.ap} / {player.maxAp} AP
            </span>
          </div>
          <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-cyber-neonCyan transition-all duration-300"
              style={{ width: `${apPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* バフ／デバフ表示 */}
      {player.statusEffects.length > 0 && (
        <div className="mt-3 pt-2 border-t border-cyber-border/40 flex flex-wrap gap-2">
          {player.statusEffects.map((eff, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded text-[10px] font-mono border bg-slate-800/80 border-cyber-neonCyan text-cyber-neonCyan"
              title={eff.description}
            >
              ◈ {eff.name} ({eff.duration}T)
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
