'use client';

import React from 'react';
import { FloorMap } from '@/lib/gameTypes';
import { Compass, Skull, Gift, ShieldAlert, Coffee } from 'lucide-react';

interface DungeonMinimapProps {
  floorMap: FloorMap;
  currentRoomId: string;
  onSelectRoom: (roomId: string) => void;
  availableNextRooms: string[];
}

export const DungeonMinimap: React.FC<DungeonMinimapProps> = ({
  floorMap,
  currentRoomId,
  onSelectRoom,
  availableNextRooms,
}) => {
  const getRoomIcon = (type: string) => {
    switch (type) {
      case 'boss':
        return <Skull className="w-3.5 h-3.5 text-cyber-neonPink" />;
      case 'treasure':
        return <Gift className="w-3.5 h-3.5 text-cyber-neonAmber" />;
      case 'rest':
        return <Coffee className="w-3.5 h-3.5 text-cyber-neonGreen" />;
      case 'elite':
        return <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Compass className="w-3.5 h-3.5 text-cyber-neonCyan" />;
    }
  };

  const roomOrder = [
    ['node_0'],
    ['node_1', 'node_2'],
    ['node_3', 'node_4'],
    ['node_boss'],
  ];

  return (
    <div className="bg-cyber-card/90 border border-cyber-border rounded-xl p-4 font-mono shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-3 border-b border-cyber-border/60 pb-2">
        <span className="text-xs font-bold text-cyber-neonCyan flex items-center gap-1.5">
          <Compass className="w-4 h-4" />
          ROUTER TOPOLOGY // FLOOR {floorMap.floorNumber}
        </span>
        <span className="text-[10px] text-slate-400">
          Path: /dungeon/[seed]/{floorMap.floorNumber}/[{currentRoomId}]
        </span>
      </div>

      {/* ノードフロー表示 */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
        {roomOrder.map((layer, layerIdx) => (
          <div key={layerIdx} className="flex sm:flex-col gap-2.5 items-center justify-center">
            {layer.map((rId) => {
              const room = floorMap.rooms[rId];
              if (!room) return null;

              const isCurrent = rId === currentRoomId;
              const isAvailable = availableNextRooms.includes(rId);

              return (
                <button
                  key={rId}
                  onClick={() => isAvailable && onSelectRoom(rId)}
                  disabled={!isAvailable && !isCurrent}
                  className={`relative p-2.5 rounded-lg border text-xs flex flex-col items-center justify-center transition-all min-w-[70px] ${
                    isCurrent
                      ? 'border-cyber-neonCyan bg-cyan-950/60 shadow-[0_0_12px_rgba(0,240,255,0.6)] scale-105'
                      : isAvailable
                      ? 'border-emerald-500 bg-emerald-950/40 hover:border-emerald-400 hover:scale-105 cursor-pointer animate-pulse'
                      : 'border-slate-800 bg-slate-900/40 opacity-40 cursor-not-allowed'
                  }`}
                  title={`${room.title} (${room.type})`}
                >
                  {getRoomIcon(room.type)}
                  <span className="text-[10px] mt-1 font-bold text-slate-200">
                    {rId.replace('node_', 'N#')}
                  </span>
                  {isCurrent && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyber-neonCyan animate-ping" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
