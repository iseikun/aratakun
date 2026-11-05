'use client';

import React from 'react';
import { Employee } from '@/lib/gameTypes';
import { Heart, Brain, Moon, Coffee, Flame, AlertTriangle, UserX, Zap } from 'lucide-react';
import { sound } from '@/lib/audio';

interface EmployeeDeskProps {
  employees: Employee[];
  onToggleOvertime: (id: string) => void;
  onScold: (id: string) => void;
  onGiveEnergyDrink: (id: string) => void;
  onFire: (id: string) => void;
  companyCash: number;
}

export const EmployeeDesk: React.FC<EmployeeDeskProps> = ({
  employees,
  onToggleOvertime,
  onScold,
  onGiveEnergyDrink,
  onFire,
  companyCash,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <h2 className="text-sm font-mono font-bold text-white flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          社員フロア監視カメラ // EMPLOYEE SURVEILLANCE ({employees.length}名)
        </h2>
        <span className="text-xs font-mono text-slate-500">
          ※メンタル0で退職代行 / 体力0で救急搬送
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {employees.map((emp) => {
          const staminaPercent = Math.max(0, Math.min(100, (emp.stamina / emp.maxStamina) * 100));
          const mentalPercent = Math.max(0, Math.min(100, (emp.mental / emp.maxMental) * 100));

          return (
            <div
              key={emp.id}
              className={`p-4 rounded-xl border-2 transition-all relative overflow-hidden font-mono ${
                emp.status === 'collapsed'
                  ? 'bg-red-950/40 border-red-800 opacity-60'
                  : emp.isOvertime
                  ? 'bg-slate-950 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'bg-slate-950/80 border-slate-800'
              }`}
            >
              {/* 深夜残業バッジ */}
              {emp.isOvertime && (
                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500 text-amber-300 text-[10px] animate-pulse">
                  <Moon className="w-3 h-3" /> 深夜残業中 (生産力+80%)
                </div>
              )}

              {/* 社員ヘッダー */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${emp.avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-md`}
                >
                  {emp.name.substring(0, 1)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    {emp.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="text-cyan-400">{emp.role}</span>
                    <span>•</span>
                    <span>月給: ¥{emp.salary.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* 体力 & メンタルバー */}
              <div className="space-y-2 mb-4">
                {/* 体力 */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                    <span className="flex items-center gap-1 text-red-400">
                      <Heart className="w-3 h-3" /> 体力 (HP)
                    </span>
                    <span>{emp.stamina} / {emp.maxStamina}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-300 ${
                        staminaPercent > 50
                          ? 'bg-emerald-500'
                          : staminaPercent > 20
                          ? 'bg-amber-500'
                          : 'bg-red-600 animate-pulse'
                      }`}
                      style={{ width: `${staminaPercent}%` }}
                    />
                  </div>
                </div>

                {/* メンタル */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                    <span className="flex items-center gap-1 text-purple-400">
                      <Brain className="w-3 h-3" /> メンタル (精神)
                    </span>
                    <span>{emp.mental} / {emp.maxMental}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-300 ${
                        mentalPercent > 40
                          ? 'bg-purple-500'
                          : 'bg-red-500 animate-pulse'
                      }`}
                      style={{ width: `${mentalPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 社長のアクションボタン群 */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                {/* 残業トグル */}
                <button
                  onClick={() => onToggleOvertime(emp.id)}
                  className={`py-1.5 px-2 rounded-lg border font-bold flex items-center justify-center gap-1 transition-all ${
                    emp.isOvertime
                      ? 'border-amber-500 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                      : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-amber-400'
                  }`}
                >
                  <Moon className="w-3 h-3" />
                  {emp.isOvertime ? '定時帰宅' : '残業命令'}
                </button>

                {/* 激詰め */}
                <button
                  onClick={() => onScold(emp.id)}
                  className="py-1.5 px-2 rounded-lg border border-red-500/60 bg-red-950/40 text-red-300 hover:bg-red-900/60 font-bold flex items-center justify-center gap-1 transition-all"
                  title="社長の怒号で一瞬作業させる（メンタル削れ）"
                >
                  <Flame className="w-3 h-3" /> 激詰め！
                </button>

                {/* エナジードリンク投与 */}
                <button
                  onClick={() => onGiveEnergyDrink(emp.id)}
                  disabled={companyCash < 3000}
                  className="py-1.5 px-2 rounded-lg border border-cyan-500/60 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/60 font-bold flex items-center justify-center gap-1 transition-all disabled:opacity-40"
                  title="3,000円で魔剤投与（体力+40・メンタル-10）"
                >
                  <Coffee className="w-3 h-3" /> 魔剤(¥3K)
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
