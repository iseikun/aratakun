'use client';

import React from 'react';
import { CompanyState } from '@/lib/gameTypes';
import { Building2, DollarSign, AlertOctagon, Flame, Zap, Award, Calendar } from 'lucide-react';

interface CompanyHUDProps {
  company: CompanyState;
}

export const CompanyHUD: React.FC<CompanyHUDProps> = ({ company }) => {
  const ipoPercent = Math.min(100, Math.max(0, (company.cash / company.ipoTarget) * 100));

  return (
    <div className="bg-slate-900/95 border-2 border-red-950/80 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md">
      {/* 上部ヘッダー */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-950/80 border border-red-500/60 text-red-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-mono font-black text-lg sm:text-xl text-white tracking-wider flex items-center gap-2">
              {company.name}
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-900/60 border border-red-500 text-red-300">
                ブラック度 Lv.{company.blackLevel}
              </span>
            </h1>
            <p className="text-xs font-mono text-slate-400">
              代表取締役社長 執務室 // 目標：IPO(東証グロース上場)で創業者利得10億円
            </p>
          </div>
        </div>

        {/* 経過日数 & AP */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>DAY {company.day}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-500/60 text-amber-300">
            <Zap className="w-4 h-4 fill-amber-400" />
            <span>社長気力: {company.ap} / {company.maxAp} AP</span>
          </div>
        </div>
      </div>

      {/* メインステータスグリッド */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono">
        {/* 資金 & IPO進捗 */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <DollarSign className="w-4 h-4" /> 会社資金 (CASH)
            </span>
            <span className="text-[10px] text-slate-500">
              目標: ¥{(company.ipoTarget / 10000).toLocaleString()}万円
            </span>
          </div>

          <div className="text-xl sm:text-2xl font-black text-emerald-400">
            ¥{company.cash.toLocaleString()}
          </div>

          {/* IPOプログレスバー */}
          <div>
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>IPO (上場) 達成率</span>
              <span className="font-bold text-white">{ipoPercent.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-cyber-neonGreen transition-all duration-500"
                style={{ width: `${ipoPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* 労働基準監督署 警戒度メーター */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span className="flex items-center gap-1 text-red-400 font-bold">
              <AlertOctagon className="w-4 h-4" /> 労基署 警戒度 (AUDIT RISK)
            </span>
            <span className={`text-[11px] font-bold ${company.laborRisk >= 70 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>
              {company.laborRisk}%
            </span>
          </div>

          <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 relative mt-3">
            <div
              className={`h-full transition-all duration-300 ${
                company.laborRisk >= 75
                  ? 'bg-red-600 animate-pulse'
                  : company.laborRisk >= 40
                  ? 'bg-gradient-to-r from-amber-500 to-red-500'
                  : 'bg-gradient-to-r from-emerald-500 to-amber-500'
              }`}
              style={{ width: `${company.laborRisk}%` }}
            />
          </div>

          <p className="text-[10px] text-slate-500">
            {company.laborRisk >= 80
              ? '⚠️ 危険！労基署の抜き打ち家宅捜索が秒読みです！タイムカードを改ざんしてください！'
              : company.laborRisk >= 50
              ? 'タレコミ情報が労基署に集まっています。隠蔽工作を検討してください。'
              : '監査の目はまだ届いていません。もっと残業させられます。'}
          </p>
        </div>

        {/* 月額固定費 & 社畜稼働率 */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2 sm:col-span-2 lg:col-span-1">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span className="flex items-center gap-1 text-amber-400 font-bold">
              <Flame className="w-4 h-4" /> 経営リスク指数
            </span>
            <span className="text-[10px] text-slate-500">毎月1日給与支払</span>
          </div>

          <div className="text-sm text-slate-300 space-y-1 pt-1">
            <div className="flex justify-between">
              <span className="text-slate-400">月間固定人件費:</span>
              <span className="text-red-400 font-bold">¥{company.monthlyCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">社内空気:</span>
              <span className="text-amber-300 font-bold">
                {company.blackLevel > 20 ? '「洗脳完了・誰も逆らわない」' : '「まだ転職サイトを見てる奴がいる」'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
