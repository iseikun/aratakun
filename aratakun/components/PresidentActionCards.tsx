'use client';

import React from 'react';
import { PresidentActionCard } from '@/lib/gameTypes';
import { Zap, Server, ShieldAlert, Coffee, DollarSign, Award, Sparkles, UserPlus } from 'lucide-react';

interface PresidentActionCardsProps {
  cards: PresidentActionCard[];
  currentAp: number;
  currentCash: number;
  onExecuteCard: (card: PresidentActionCard) => void;
  disabled?: boolean;
}

export const PresidentActionCards: React.FC<PresidentActionCardsProps> = ({
  cards,
  currentAp,
  currentCash,
  onExecuteCard,
  disabled = false,
}) => {
  const getIcon = (hook: string) => {
    switch (hook) {
      case 'Server Action':
        return <Server className="w-4 h-4 text-emerald-400" />;
      case 'Suspense':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'createPortal':
        return <UserPlus className="w-4 h-4 text-amber-400" />;
      case 'Props Drilling':
        return <Coffee className="w-4 h-4 text-cyan-400" />;
      default:
        return <Zap className="w-4 h-4 text-red-400" />;
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl font-mono">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          社長のReact Hooks経営コマンド // PRESIDENT ACTIONS
        </h2>
        <span className="text-xs text-slate-500">
          ※APや資金を消費してブラック経営施策を発動
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card) => {
          const canAfford =
            card.costType === 'ap'
              ? currentAp >= card.cost
              : currentCash >= card.cost;
          const isUsable = canAfford && !disabled;

          return (
            <button
              key={card.id}
              onClick={() => isUsable && onExecuteCard(card)}
              disabled={!isUsable}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isUsable
                  ? 'bg-slate-950/80 border-slate-700 hover:border-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:-translate-y-1 cursor-pointer'
                  : 'bg-slate-950/40 border-slate-800/60 opacity-40 cursor-not-allowed'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                    {getIcon(card.hookName)}
                    <span>{card.hookName}</span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      card.costType === 'ap'
                        ? 'border-amber-500/60 bg-amber-950/40 text-amber-300'
                        : 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300'
                    }`}
                  >
                    {card.costType === 'ap'
                      ? `${card.cost} AP`
                      : `¥${card.cost.toLocaleString()}`}
                  </span>
                </div>

                <h4 className="font-bold text-xs text-white mb-1.5 line-clamp-1">
                  {card.name}
                </h4>

                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  {card.description}
                </p>
              </div>

              <div className="text-[9px] text-slate-500 text-right uppercase tracking-wider">
                EXECUTE // 執行
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
