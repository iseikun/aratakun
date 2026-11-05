'use client';

import React from 'react';
import { SkillCard } from '@/lib/gameTypes';
import { Zap, Shield, Swords, Sparkles, RefreshCw, Server, ArrowDownToLine } from 'lucide-react';

interface SkillCardComponentProps {
  card: SkillCard;
  playerAp: number;
  onPlay: (card: SkillCard) => void;
  disabled?: boolean;
}

export const SkillCardComponent: React.FC<SkillCardComponentProps> = ({
  card,
  playerAp,
  onPlay,
  disabled = false,
}) => {
  const canAfford = playerAp >= card.cost && !disabled;

  const getRarityBadge = () => {
    switch (card.rarity) {
      case 'Legendary':
        return 'border-amber-400 text-amber-300 bg-amber-950/40';
      case 'Epic':
        return 'border-purple-400 text-purple-300 bg-purple-950/40';
      case 'Rare':
        return 'border-cyan-400 text-cyan-300 bg-cyan-950/40';
      default:
        return 'border-slate-500 text-slate-300 bg-slate-800/40';
    }
  };

  const getHookIcon = () => {
    if (card.special === 'server_action') return <Server className="w-4 h-4 text-emerald-400" />;
    if (card.special === 'streaming') return <ArrowDownToLine className="w-4 h-4 text-purple-400" />;
    if (card.damage && card.shield) return <Sparkles className="w-4 h-4 text-amber-400" />;
    if (card.damage) return <Swords className="w-4 h-4 text-red-400" />;
    if (card.shield) return <Shield className="w-4 h-4 text-cyan-400" />;
    return <RefreshCw className="w-4 h-4 text-emerald-400" />;
  };

  return (
    <button
      onClick={() => canAfford && onPlay(card)}
      disabled={!canAfford}
      className={`group relative text-left w-48 sm:w-52 h-64 p-3.5 rounded-xl border-2 transition-all duration-200 flex flex-col justify-between select-none ${
        canAfford
          ? 'bg-cyber-card/90 border-cyber-border hover:border-cyber-neonCyan hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] cursor-pointer'
          : 'bg-slate-950/60 border-slate-800 opacity-50 cursor-not-allowed'
      }`}
    >
      {/* 上部ヘッダー（コスト ＆ レア度） */}
      <div>
        <div className="flex items-center justify-between mb-2">
          {/* APコスト バッジ */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-950/80 border border-cyber-neonCyan text-cyber-neonCyan font-mono font-bold text-xs">
            <Zap className="w-3 h-3 fill-cyber-neonCyan" />
            <span>{card.cost} AP</span>
          </div>

          {/* レア度 バッジ */}
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${getRarityBadge()}`}>
            {card.rarity}
          </span>
        </div>

        {/* フック識別アイコン & カード名 */}
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400 mb-1">
          {getHookIcon()}
          <span>{card.hookName}</span>
        </div>
        <h4 className="font-mono font-bold text-sm text-white group-hover:text-cyber-neonCyan transition-colors line-clamp-2">
          {card.name}
        </h4>
      </div>

      {/* カードビジュアル枠 */}
      <div className="my-2 p-2 rounded-lg bg-slate-900/90 border border-cyber-border/60 flex items-center justify-around text-xs font-mono">
        {card.damage !== undefined && (
          <span className="text-red-400 font-bold flex items-center gap-1">
            <Swords className="w-3.5 h-3.5" /> {card.damage} DMG
          </span>
        )}
        {card.shield !== undefined && (
          <span className="text-cyan-400 font-bold flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> +{card.shield} DEF
          </span>
        )}
        {card.heal !== undefined && (
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            ♥ +{card.heal} HP
          </span>
        )}
      </div>

      {/* カード効果説明 */}
      <div className="text-[11px] font-mono text-slate-300 leading-snug">
        {card.description}
      </div>

      {/* フッタータグ */}
      <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest text-right">
        React.Component
      </div>
    </button>
  );
};
