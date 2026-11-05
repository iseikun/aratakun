'use client';

import React, { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';

interface TerminalLogProps {
  logs: string[];
}

export const TerminalLog: React.FC<TerminalLogProps> = ({ logs }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-slate-950/90 border border-cyber-border rounded-xl p-3 font-mono text-xs shadow-inner h-40 flex flex-col">
      {/* ターミナルヘッダー */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyber-border/60 text-slate-400 select-none">
        <div className="flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-cyber-neonCyan" />
          <span className="font-bold text-[11px] text-cyber-neonCyan">NEXT_RUNTIME::HYPER_LOG</span>
        </div>
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
        </div>
      </div>

      {/* ログ本文リスト */}
      <div ref={containerRef} className="overflow-y-auto space-y-1.5 flex-1 pr-1">
        {logs.map((log, index) => {
          let color = 'text-slate-300';
          if (log.includes('[RSC]') || log.includes('Server Action')) color = 'text-cyber-neonCyan font-semibold';
          else if (log.includes('CRITICAL') || log.includes('Defeat') || log.includes('Damage')) color = 'text-red-400';
          else if (log.includes('Victory') || log.includes('Heal') || log.includes('Hydrated')) color = 'text-cyber-neonGreen';
          else if (log.includes('CHRONO') || log.includes('Undo')) color = 'text-cyber-neonPink font-bold';

          return (
            <div key={index} className={`leading-relaxed ${color} animate-fadeIn`}>
              <span className="text-slate-600 mr-1.5 select-none">&gt;</span>
              {log}
            </div>
          );
        })}
      </div>
    </div>
  );
};
