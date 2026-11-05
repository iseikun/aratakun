'use client';

import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { sound } from '@/lib/audio';

export const SoundToggle: React.FC = () => {
  const [isMuted, setIsMuted] = useState(false);

  const handleToggle = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      sound.playCardSelect();
      sound.startAmbientBgm();
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-lg border border-cyber-border bg-cyber-card/80 text-slate-300 hover:text-cyber-neonCyan hover:border-cyber-neonCyan transition-all shadow-md"
      title={isMuted ? 'サウンドをONにする' : 'サウンドをミュートする'}
    >
      {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyber-neonCyan" />}
    </button>
  );
};
