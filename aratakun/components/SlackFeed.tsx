'use client';

import React, { useEffect, useRef } from 'react';
import { InternalChatLog } from '@/lib/gameTypes';
import { MessageSquare, AlertCircle, User, Bot } from 'lucide-react';

interface SlackFeedProps {
  logs: InternalChatLog[];
}

export const SlackFeed: React.FC<SlackFeedProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl font-mono flex flex-col h-64">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-white">#general-全社悲鳴チャンネル</span>
        </div>
        <span className="text-[10px] text-slate-500">Slack / 監視中</span>
      </div>

      <div ref={scrollRef} className="overflow-y-auto space-y-2 flex-1 pr-1 text-xs">
        {logs.map((log) => {
          let badgeColor = 'bg-slate-800 text-slate-300';
          if (log.type === 'alert') badgeColor = 'bg-red-950 border border-red-500 text-red-300 font-bold';
          if (log.type === 'client') badgeColor = 'bg-amber-950 border border-amber-500 text-amber-300';
          if (log.type === 'system') badgeColor = 'bg-cyan-950 border border-cyan-500 text-cyan-300';

          return (
            <div key={log.id} className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center justify-between mb-1 text-[10px] text-slate-400">
                <span className="font-bold text-white flex items-center gap-1">
                  {log.type === 'alert' && <AlertCircle className="w-3 h-3 text-red-400" />}
                  {log.sender} <span className="text-slate-500 font-normal">({log.role})</span>
                </span>
                <span>{log.timestamp}</span>
              </div>
              <p className={`text-[11px] leading-relaxed ${log.type === 'alert' ? 'text-red-400 font-bold' : 'text-slate-300'}`}>
                {log.message}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
