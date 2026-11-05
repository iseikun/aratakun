'use client';

import React from 'react';
import { Project } from '@/lib/gameTypes';
import { Briefcase, AlertCircle, CheckCircle, Clock, Flame, Send } from 'lucide-react';

interface ProjectBoardProps {
  projects: Project[];
  onDeliver: (project: Project) => void;
  onWorkProject: (projectId: string) => void;
}

export const ProjectBoard: React.FC<ProjectBoardProps> = ({ projects, onDeliver, onWorkProject }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl font-mono">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-emerald-400" />
          デスマーチ案件ボード // ACTIVE CONTRACTS ({projects.length}件)
        </h2>
        <span className="text-xs text-slate-500">
          ※納期遅れは契約解除＆違約金
        </span>
      </div>

      <div className="space-y-3">
        {projects.map((proj) => {
          const progressPercent = Math.min(100, Math.floor((proj.currentProgress / proj.requiredProgress) * 100));
          const isCompleted = proj.currentProgress >= proj.requiredProgress;

          return (
            <div
              key={proj.id}
              className={`p-4 rounded-xl border transition-all ${
                isCompleted
                  ? 'bg-emerald-950/30 border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : proj.isFlaming
                  ? 'bg-slate-950 border-red-500/80'
                  : 'bg-slate-950/70 border-slate-800'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {proj.isFlaming ? (
                    <span className="px-2 py-0.5 rounded bg-red-900/60 border border-red-500 text-red-300 text-[10px] font-bold flex items-center gap-1 animate-pulse">
                      <Flame className="w-3 h-3 text-red-400" /> 炎上デスマ
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-blue-900/60 border border-blue-500 text-blue-300 text-[10px] font-bold">
                      {proj.difficulty}
                    </span>
                  )}
                  <h3 className="font-bold text-sm text-white">{proj.title}</h3>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-400">発注元: {proj.client}</span>
                  <span className="text-emerald-400 font-bold">
                    ¥{proj.reward.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 進捗バー & 納期 */}
              <div className="space-y-1.5 mb-3">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>進捗: {proj.currentProgress} / {proj.requiredProgress} ({progressPercent}%)</span>
                  <span className={`flex items-center gap-1 ${proj.daysRemaining <= 1 ? 'text-red-400 font-bold animate-pulse' : 'text-slate-300'}`}>
                    <Clock className="w-3.5 h-3.5" /> 残り納期: {proj.daysRemaining}日
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isCompleted
                        ? 'bg-emerald-500'
                        : 'bg-gradient-to-r from-blue-600 to-cyan-400'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* アクションボタン */}
              <div className="flex justify-end gap-2">
                {!isCompleted ? (
                  <button
                    onClick={() => onWorkProject(proj.id)}
                    className="py-1 px-3 rounded-lg border border-cyan-500/60 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/60 text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <span>全社リソース集中 (作業推進)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onDeliver(proj)}
                    className="py-1.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all flex items-center gap-1.5 cursor-pointer animate-pulse"
                  >
                    <Send className="w-3.5 h-3.5" /> 納品＆請求書即時送付 (着金: ¥{proj.reward.toLocaleString()})
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
