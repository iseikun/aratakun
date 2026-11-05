'use client';

import React from 'react';
import { Enemy } from '@/lib/gameTypes';
import { Shield, Swords, Sparkles, Bug, AlertTriangle, Cpu } from 'lucide-react';

interface EnemyDisplayProps {
  enemy: Enemy;
  isHit?: boolean;
  vulnerabilityHint?: string | null;
}

export const EnemyDisplay: React.FC<EnemyDisplayProps> = ({ enemy, isHit, vulnerabilityHint }) => {
  const hpPercent = Math.max(0, Math.min(100, (enemy.hp / enemy.maxHp) * 100));

  return (
    <div
      className={`bg-cyber-card/95 border-2 ${
        enemy.isBoss ? 'border-cyber-neonPink' : 'border-cyber-border'
      } rounded-xl p-5 shadow-2xl transition-all duration-200 relative overflow-hidden ${
        isHit ? 'animate-glitch border-red-500 scale-95' : ''
      }`}
    >
      {/* ボス発光背景 */}
      {enemy.isBoss && (
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-cyber-neonPink/20 rounded-full blur-3xl pointer-events-none" />
      )}

      {/* インテント（次の行動予告）バッジ */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs font-mono">
          <Bug className="w-3.5 h-3.5 text-cyber-neonPink" />
          <span className="text-slate-400 uppercase">{enemy.isBoss ? 'CORRUPT APEX' : 'ACTIVE EXCEPTION'}</span>
        </div>

        {/* 敵の予告行動 */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-red-950/60 border border-red-500/50 text-red-300 text-xs font-mono animate-pulse">
          {enemy.intent === 'attack' && <Swords className="w-3.5 h-3.5 text-red-400" />}
          {enemy.intent === 'defend' && <Shield className="w-3.5 h-3.5 text-cyan-400" />}
          {enemy.intent === 'special' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
          <span>
            {enemy.intentName}: <strong className="text-white">{enemy.intentValue}</strong>
          </span>
        </div>
      </div>

      {/* 敵のシンボル / ビジュアル */}
      <div className="my-4 text-center">
        <div className="inline-block p-4 rounded-2xl bg-slate-900/80 border border-cyber-border/80 relative">
          <Cpu className={`w-14 h-14 ${enemy.isBoss ? 'text-cyber-neonPink animate-pulse' : 'text-cyber-neonCyan'}`} />
          {enemy.shield > 0 && (
            <div className="absolute -top-2 -right-2 bg-blue-600 border border-cyan-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold font-mono">
              {enemy.shield}
            </div>
          )}
        </div>
        <h3 className="text-lg font-bold font-mono text-white mt-2 tracking-wide">
          {enemy.name}
        </h3>
        <p className="text-xs text-cyber-neonPink/80 font-mono mt-0.5 line-clamp-1">
          {enemy.title}
        </p>
      </div>

      {/* HP ゲージ */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs font-mono text-slate-300">
          <span>HP</span>
          <span>
            {enemy.hp} / {enemy.maxHp}
          </span>
        </div>
        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
          <div
            className="h-full bg-gradient-to-r from-red-600 to-pink-500 transition-all duration-300"
            style={{ width: `${hpPercent}%` }}
          />
        </div>
      </div>

      {/* サーバー側フォグ解除で判明した脆弱性ヒント */}
      {vulnerabilityHint && (
        <div className="mt-3 p-2 bg-cyan-950/40 border border-cyber-neonCyan/40 rounded text-[11px] font-mono text-cyan-200 flex items-start gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyber-neonCyan shrink-0 mt-0.5" />
          <span>{vulnerabilityHint}</span>
        </div>
      )}

      {/* フレーバーテキスト */}
      <p className="text-[11px] text-slate-400 italic mt-3 border-t border-slate-800/80 pt-2 font-mono">
        &ldquo;{enemy.flavorText}&rdquo;
      </p>
    </div>
  );
};
