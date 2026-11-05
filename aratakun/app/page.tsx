'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Flame, Skull, DollarSign, ArrowRight, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';
import { sound } from '@/lib/audio';

export default function StartupPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState('株式会社アットホーム・デスマ');
  const [motto, setMotto] = useState('「ウチはアットホームで家族みたいな会社だから」');

  const presets = [
    { name: '株式会社アットホーム・デスマ', motto: '「ウチはアットホームで家族みたいな会社だから」' },
    { name: '合同会社やりがい搾取スタジオ', motto: '「給料よりも若いうちの経験が一番の資産」' },
    { name: 'ネクスト・ブラックホール株式会社', motto: '「定時退社は悪。深夜2時からが本番」' },
  ];

  const handleStart = () => {
    sound.playCashRegister();
    const encoded = encodeURIComponent(companyName);
    router.push(`/office/${encoded}`);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 max-w-4xl mx-auto w-full font-mono">
      {/* ヒーロータイトル */}
      <div className="text-center space-y-4 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-500 text-red-400 text-xs tracking-widest uppercase">
          <Flame className="w-4 h-4 text-red-500 animate-pulse" />
          BLACK CORP PRESIDENT SIMULATOR
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white">
          ブラック企業<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-yellow-500">
            社長シミュレーター
          </span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          ReactのHooksで社員を限界まで酷使し、Next.jsのServer Actionsでタイムカードを改ざん！
          労基署の抜き打ち監査をかわしながら、会社資産1,000万円でIPO（東証上場）を目指せ！
        </p>
      </div>

      {/* 設立フォーム */}
      <div className="w-full max-w-lg bg-slate-900/90 border-2 border-red-950 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md mb-8 space-y-5">
        <div>
          <label className="block text-xs text-slate-400 mb-2 font-bold">
            設立する会社名 (COMPANY NAME):
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-red-500 font-bold"
          />
        </div>

        {/* プリセット選択 */}
        <div>
          <label className="block text-xs text-slate-500 mb-2">おすすめプリセット:</label>
          <div className="space-y-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  sound.playTypingBurst();
                  setCompanyName(p.name);
                  setMotto(p.motto);
                }}
                className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                  companyName === p.name
                    ? 'border-red-500 bg-red-950/40 text-red-300'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>{p.name}</span>
                <span className="text-[10px] text-slate-500">{p.motto}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 起業ボタン */}
        <button
          onClick={handleStart}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-base tracking-wider transition-all shadow-[0_0_25px_rgba(239,68,68,0.5)] hover:shadow-[0_0_35px_rgba(239,68,68,0.8)] hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>代表取締役社長に就任（ゲーム開始）</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* ゲーム特徴の3大ブラック機能 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-xs">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-red-400 font-bold mb-1 flex items-center gap-1">
            <Flame className="w-4 h-4" /> React Hooks 経営
          </div>
          <p className="text-slate-400 leading-snug">
            useStateで残業代を固定、useEffectで業務後強制飲み会、useMemoで冷暖房費を削減！
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-emerald-400 font-bold mb-1 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> Server Actions 隠蔽
          </div>
          <p className="text-slate-400 leading-snug">
            労基署の抜き打ち査察を、サーバー側の打刻DB改ざんで完全隠滅！クライアントには見せない裏工作。
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-amber-400 font-bold mb-1 flex items-center gap-1">
            <DollarSign className="w-4 h-4" /> 目指せIPO上場
          </div>
          <p className="text-slate-400 leading-snug">
            社員が倒れる前に炎上案件を納品し、現金1,000万円を貯めて東証グロースへ上場逃げ切り！
          </p>
        </div>
      </div>
    </div>
  );
}
