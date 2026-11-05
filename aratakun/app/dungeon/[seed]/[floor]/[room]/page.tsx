'use client';

import React, { useState, useEffect, useReducer } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Enemy,
  FloorMap,
  PlayerState,
  RoomInfo,
  SkillCard,
} from '@/lib/gameTypes';
import {
  ALL_SKILLS,
  generateFloorMap,
  getStarterDeck,
} from '@/lib/serverEngine';
import {
  executeServerActionStrike,
  revealSecretRoomData,
  resolveRestSanctuary,
} from '@/app/actions/gameActions';
import { sound } from '@/lib/audio';
import { PlayerStatus } from '@/components/PlayerStatus';
import { EnemyDisplay } from '@/components/EnemyDisplay';
import { SkillCardComponent } from '@/components/SkillCardComponent';
import { TerminalLog } from '@/components/TerminalLog';
import { DungeonMinimap } from '@/components/DungeonMinimap';
import { ChronoUndoButton } from '@/components/ChronoUndoButton';
import { SoundToggle } from '@/components/SoundToggle';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Server,
  Coffee,
  Gift,
  RefreshCw,
  Trophy,
} from 'lucide-react';

export default function DungeonRoomPage() {
  const params = useParams();
  const router = useRouter();

  const seed = (params.seed as string) || 'DEFAULT_SEED';
  const floorNumber = parseInt((params.floor as string) || '1', 10);
  const roomId = (params.room as string) || 'node_0';

  // フロア情報の決定論的生成
  const [floorMap, setFloorMap] = useState<FloorMap>(() =>
    generateFloorMap(seed, floorNumber)
  );

  const currentRoom: RoomInfo =
    floorMap.rooms[roomId] || floorMap.rooms['node_0'];

  // プレイヤー状態 (localStorage保存対応でリロードやページ遷移でも保持)
  const [player, setPlayer] = useState<PlayerState>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(`next_core_player_${seed}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore
        }
      }
    }
    const starterDeck = getStarterDeck();
    return {
      hp: 80,
      maxHp: 80,
      ap: 3,
      maxAp: 3,
      shield: 0,
      gold: 50,
      deck: starterDeck,
      hand: [],
      discardPile: [],
      drawPile: [...starterDeck],
      statusEffects: [],
      rewindCharges: 3,
    };
  });

  // セッションストレージへプレイヤー状態保存
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`next_core_player_${seed}`, JSON.stringify(player));
    }
  }, [player, seed]);

  // 現在の部屋の敵状態
  const [activeEnemy, setActiveEnemy] = useState<Enemy | null>(
    currentRoom.enemy ? { ...currentRoom.enemy } : null
  );

  // 敵の被弾フラグ（アニメーション用）
  const [enemyIsHit, setEnemyIsHit] = useState(false);

  // サーバーサイド・フォグ解除による弱点ヒント
  const [vulnerabilityHint, setVulnerabilityHint] = useState<string | null>(
    null
  );
  const [isProbingServer, setIsProbingServer] = useState(false);

  // ターミナルログ
  const [logs, setLogs] = useState<string[]>([
    `[ROUTER] Loaded dynamic path: /dungeon/${seed}/${floorNumber}/${roomId}`,
    `[INFO] Room Type: ${currentRoom.type.toUpperCase()} - "${currentRoom.title}"`,
  ]);

  // 戦闘状態
  const [isBattleWon, setIsBattleWon] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardOptions, setRewardOptions] = useState<SkillCard[]>([]);

  // 手札の初期化（部屋に入った時 or 戦闘開始時）
  useEffect(() => {
    sound.startAmbientBgm();
    if (currentRoom.type === 'battle' || currentRoom.type === 'elite' || currentRoom.type === 'boss') {
      drawCards(4);
    }
  }, [roomId]);

  // カードをドロー
  const drawCards = (count: number) => {
    setPlayer((prev) => {
      let currentDraw = [...prev.drawPile];
      let currentDiscard = [...prev.discardPile];
      let currentHand = [...prev.hand];

      for (let i = 0; i < count; i++) {
        if (currentDraw.length === 0) {
          if (currentDiscard.length === 0) break;
          currentDraw = [...currentDiscard].sort(() => Math.random() - 0.5);
          currentDiscard = [];
        }
        const drawn = currentDraw.pop();
        if (drawn) currentHand.push(drawn);
      }

      return {
        ...prev,
        hand: currentHand,
        drawPile: currentDraw,
        discardPile: currentDiscard,
        ap: prev.maxAp, // ターン開始時にAPリセット
        shield: 0, // ターン開始時に一時シールドクリア
      };
    });
  };

  // カードプレイ処理
  const handlePlayCard = async (card: SkillCard) => {
    if (!isPlayerTurn || !activeEnemy || player.ap < card.cost) return;

    sound.playCardSelect();

    // AP消費 & 手札から捨札へ移動
    setPlayer((prev) => ({
      ...prev,
      ap: prev.ap - card.cost,
      hand: prev.hand.filter((c) => c.id !== card.id),
      discardPile: [...prev.discardPile, card],
    }));

    // Server Action スキルの場合、サーバー側で直接計算！
    if (card.special === 'server_action') {
      setLogs((prev) => [
        ...prev,
        `[CLIENT] Invoking Next.js Server Action: executeServerActionStrike()...`,
      ]);

      try {
        const result = await executeServerActionStrike(activeEnemy, card, player.ap);
        sound.playAttack();
        setEnemyIsHit(true);
        setTimeout(() => setEnemyIsHit(false), 300);

        setActiveEnemy(result.updatedEnemy);
        setLogs((prev) => [...prev, result.serverMessage]);

        if (result.isDefeated) {
          handleVictory();
          return;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setLogs((prev) => [...prev, `[ERROR] Server Action failed: ${msg}`]);
      }
      return;
    }

    // 通常スキルの処理
    let dealtDamage = 0;
    let gainedShield = 0;
    let healed = 0;

    if (card.damage) {
      dealtDamage = card.damage;
      sound.playAttack();
      setEnemyIsHit(true);
      setTimeout(() => setEnemyIsHit(false), 300);

      // 敵のシールドとHPを計算
      setActiveEnemy((prev) => {
        if (!prev) return null;
        let remShield = prev.shield;
        let remHp = prev.hp;
        let dmg = dealtDamage;

        if (remShield > 0) {
          if (remShield >= dmg) {
            remShield -= dmg;
            dmg = 0;
          } else {
            dmg -= remShield;
            remShield = 0;
          }
        }
        remHp = Math.max(0, remHp - dmg);

        return {
          ...prev,
          hp: remHp,
          shield: remShield,
        };
      });
    }

    if (card.shield) {
      gainedShield = card.shield;
      sound.playShield();
      setPlayer((prev) => ({
        ...prev,
        shield: prev.shield + gainedShield,
      }));
    }

    if (card.heal) {
      healed = card.heal;
      sound.playHeal();
      setPlayer((prev) => ({
        ...prev,
        hp: Math.min(prev.maxHp, prev.hp + healed),
      }));
    }

    if (card.special === 'undo_charge') {
      setPlayer((prev) => ({
        ...prev,
        rewindCharges: prev.rewindCharges + 1,
      }));
      setLogs((prev) => [
        ...prev,
        `[CHRONO] +1 Chrono Undo charge acquired! Total: ${player.rewindCharges + 1}`,
      ]);
    }

    setLogs((prev) => [
      ...prev,
      `[CLIENT] Played "${card.name}" -> ${
        dealtDamage ? `Hit for ${dealtDamage} DMG. ` : ''
      }${gainedShield ? `Gained ${gainedShield} Shield. ` : ''}${
        healed ? `Healed ${healed} HP.` : ''
      }`,
    ]);

    // 敵HPが0になったかチェック
    if (activeEnemy && activeEnemy.hp - (dealtDamage - (activeEnemy.shield >= dealtDamage ? dealtDamage : activeEnemy.shield)) <= 0) {
      handleVictory();
    }
  };

  // ターン終了（敵の行動フェーズ）
  const handleEndTurn = () => {
    if (!activeEnemy || !isPlayerTurn) return;
    setIsPlayerTurn(false);

    setLogs((prev) => [...prev, `--- [ENEMY TURN: ${activeEnemy.name}] ---`]);

    setTimeout(() => {
      // 敵の攻撃・行動
      let enemyDmg = 0;
      if (activeEnemy.intent === 'attack' || activeEnemy.intent === 'special') {
        enemyDmg = activeEnemy.intentValue;
        sound.playDamage();

        setPlayer((prev) => {
          let remShield = prev.shield;
          let remHp = prev.hp;
          let incoming = enemyDmg;

          if (remShield > 0) {
            if (remShield >= incoming) {
              remShield -= incoming;
              incoming = 0;
            } else {
              incoming -= remShield;
              remShield = 0;
            }
          }
          remHp = Math.max(0, remHp - incoming);

          if (remHp <= 0) {
            setIsGameOver(true);
          }

          return {
            ...prev,
            hp: remHp,
            shield: remShield,
          };
        });

        setLogs((prev) => [
          ...prev,
          `[ENEMY ACTION] ${activeEnemy.name} executed ${activeEnemy.intentName} for ${enemyDmg} damage!`,
        ]);
      } else if (activeEnemy.intent === 'defend') {
        sound.playShield();
        setActiveEnemy((prev) =>
          prev ? { ...prev, shield: prev.shield + 10 } : null
        );
        setLogs((prev) => [
          ...prev,
          `[ENEMY ACTION] ${activeEnemy.name} fortified defenses (+10 Shield).`,
        ]);
      }

      // 次ターンのプレイヤーフェーズ開始
      setTimeout(() => {
        setIsPlayerTurn(true);
        drawCards(3);
        setLogs((prev) => [...prev, `--- [YOUR TURN // RE-RENDER READY] ---`]);
      }, 600);
    }, 800);
  };

  // 勝利処理
  const handleVictory = () => {
    sound.playVictory();
    setIsBattleWon(true);
    setLogs((prev) => [
      ...prev,
      `[KERNEL] ★ EXCEPTION RESOLVED! "${activeEnemy?.name}" was purged from memory.`,
      `[REWARD] Earned +40 Packages (Gold)!`,
    ]);

    setPlayer((prev) => ({
      ...prev,
      gold: prev.gold + 40,
    }));

    // ランダムな3枚のカード報酬を提示
    const shuffled = [...ALL_SKILLS].sort(() => Math.random() - 0.5);
    setRewardOptions(shuffled.slice(0, 3));
    setShowRewardModal(true);
  };

  // 報酬カード選択
  const handleSelectRewardCard = (chosenCard: SkillCard) => {
    sound.playCardSelect();
    setPlayer((prev) => ({
      ...prev,
      deck: [...prev.deck, { ...chosenCard, id: `card_${Date.now()}` }],
    }));
    setShowRewardModal(false);
    setLogs((prev) => [
      ...prev,
      `[PACKAGE INSTALLED] Added "${chosenCard.name}" to your component library.`,
    ]);
  };

  // サーバーアクション: 隠蔽フォグ解除プローブ
  const handleProbeServer = async () => {
    if (isProbingServer) return;
    setIsProbingServer(true);
    sound.playCardSelect();

    setLogs((prev) => [
      ...prev,
      `[CLIENT -> SERVER] Requesting server-side deep node analysis...`,
    ]);

    try {
      const data = await revealSecretRoomData(seed, floorNumber, roomId);
      setVulnerabilityHint(data.secretVulnerability);
      setLogs((prev) => [
        ...prev,
        `[RSC RESPONSE] Server-side secrets decrypted: "${data.secretVulnerability}"`,
      ]);
    } catch {
      setLogs((prev) => [...prev, `[ERROR] Failed to reach server runtime.`]);
    } finally {
      setIsProbingServer(false);
    }
  };

  // 休息スポットでの回復処理
  const handleRestSanctuary = async () => {
    sound.playHeal();
    try {
      const res = await resolveRestSanctuary(player.hp, player.maxHp);
      setPlayer((prev) => ({
        ...prev,
        hp: res.finalHp,
        rewindCharges: Math.min(5, prev.rewindCharges + 1),
      }));
      setLogs((prev) => [
        ...prev,
        res.message,
        `[CHRONO] +1 Chrono Undo charge restored.`,
      ]);
    } catch {
      // fallback
    }
  };

  // 宝箱オープン
  const handleOpenTreasure = () => {
    sound.playVictory();
    if (currentRoom.treasure) {
      setPlayer((prev) => ({
        ...prev,
        gold: prev.gold + currentRoom.treasure!.gold,
      }));
      setRewardOptions(currentRoom.treasure.skills);
      setShowRewardModal(true);
      setLogs((prev) => [
        ...prev,
        `[NPM TREASURE] Opened secret vault: +${currentRoom.treasure?.gold} Pkg!`,
      ]);
    }
  };

  // 次の部屋へ進む (Next.js App Router の router.push)
  const handleMoveToRoom = (targetRoomId: string) => {
    sound.playCardSelect();
    router.push(`/dungeon/${seed}/${floorNumber}/${targetRoomId}`);
  };

  // ボス撃破後の次フロアへ進む
  const handleNextFloor = () => {
    sound.playVictory();
    router.push(`/dungeon/${seed}/${floorNumber + 1}/node_0`);
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-6">
      {/* トップナビゲーションバー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="text-xs font-mono px-3 py-1.5 rounded-lg border border-cyber-border hover:border-cyber-neonCyan text-slate-400 hover:text-white transition-colors"
          >
            ← ABORT TO MENU
          </button>
          <span className="font-mono text-xs text-cyber-neonCyan hidden sm:inline">
            // SEED: {seed}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Chrono Undo ボタン (Next.js router.back) */}
          <ChronoUndoButton
            charges={player.rewindCharges}
            onRewindUsed={() => {
              setPlayer((prev) => ({
                ...prev,
                rewindCharges: Math.max(0, prev.rewindCharges - 1),
              }));
            }}
          />
          <SoundToggle />
        </div>
      </div>

      {/* ミニマップ & トポロジー */}
      <DungeonMinimap
        floorMap={floorMap}
        currentRoomId={roomId}
        onSelectRoom={handleMoveToRoom}
        availableNextRooms={
          isBattleWon || currentRoom.type === 'rest' || currentRoom.type === 'treasure'
            ? currentRoom.nextRoomIds
            : []
        }
      />

      {/* プレイヤーHUD */}
      <PlayerStatus player={player} />

      {/* メインエリア：部屋タイプに応じたコンテンツ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* 左側 2カラム: バトルまたはイベント */}
        <div className="lg:col-span-2 space-y-6">
          {/* バトルルームの場合 */}
          {(currentRoom.type === 'battle' ||
            currentRoom.type === 'elite' ||
            currentRoom.type === 'boss') &&
            activeEnemy && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-mono text-slate-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    TARGET IDENTIFIER // {roomId}
                  </h2>

                  {/* サーバーサイド・フォグ解除プローブボタン */}
                  <button
                    onClick={handleProbeServer}
                    disabled={isProbingServer || !!vulnerabilityHint}
                    className="text-xs font-mono px-3 py-1.5 rounded-lg border border-cyber-neonCyan/60 bg-cyan-950/40 text-cyber-neonCyan hover:bg-cyan-900/40 transition-colors flex items-center gap-1.5 disabled:opacity-40"
                    title="Next.js Server Actionを通じて敵の隠蔽データを解析"
                  >
                    <Server className="w-3.5 h-3.5" />
                    {isProbingServer
                      ? 'PROBING SERVER...'
                      : vulnerabilityHint
                      ? 'SERVER VULNERABILITY EXPOSED'
                      : 'SERVER ACTION: PROBE SECRETS'}
                  </button>
                </div>

                <EnemyDisplay
                  enemy={activeEnemy}
                  isHit={enemyIsHit}
                  vulnerabilityHint={vulnerabilityHint}
                />

                {/* バトル勝利時の次ルート案内 */}
                {isBattleWon && (
                  <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/60 text-center space-y-3 animate-fadeIn">
                    <h3 className="font-mono font-bold text-base text-cyber-neonGreen flex items-center justify-center gap-2">
                      <ShieldCheck className="w-5 h-5" />
                      NODE CLEARED: EXCEPTION RESOLVED
                    </h3>
                    <p className="text-xs font-mono text-slate-300">
                      このエリアのルートは解放されました。上のミニマップから次の部屋を選択して前進してください。
                    </p>
                    {currentRoom.nextRoomIds.length === 0 && (
                      <button
                        onClick={handleNextFloor}
                        className="px-6 py-2.5 rounded-xl bg-cyber-neonGreen text-black font-bold font-mono text-sm hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,255,102,0.6)] flex items-center gap-2 mx-auto cursor-pointer"
                      >
                        <Trophy className="w-4 h-4" /> ASCEND TO FLOOR {floorNumber + 1}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

          {/* 休息スポットの場合 */}
          {currentRoom.type === 'rest' && (
            <div className="bg-cyber-card/90 border border-cyber-border rounded-xl p-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-950/60 border border-emerald-400 flex items-center justify-center text-cyber-neonGreen mx-auto">
                <Coffee className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold font-mono text-white">
                {currentRoom.title}
              </h2>
              <p className="text-xs font-mono text-slate-400 max-w-md mx-auto">
                {currentRoom.description}
              </p>
              <button
                onClick={handleRestSanctuary}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-sm transition-all shadow-[0_0_20px_rgba(0,255,102,0.4)] cursor-pointer"
              >
                RE-HYDRATE HP (+45% HP & +1 UNDO)
              </button>
            </div>
          )}

          {/* 宝箱スポットの場合 */}
          {currentRoom.type === 'treasure' && (
            <div className="bg-cyber-card/90 border border-cyber-border rounded-xl p-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-950/60 border border-amber-400 flex items-center justify-center text-cyber-neonAmber mx-auto">
                <Gift className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold font-mono text-white">
                {currentRoom.title}
              </h2>
              <p className="text-xs font-mono text-slate-400 max-w-md mx-auto">
                {currentRoom.description}
              </p>
              <button
                onClick={handleOpenTreasure}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-sm transition-all shadow-[0_0_20px_rgba(255,183,3,0.4)] cursor-pointer"
              >
                INSTALL NPM PACKAGES (OPEN TREASURE)
              </button>
            </div>
          )}

          {/* プレイヤーの手札（バトル時） */}
          {!isBattleWon &&
            !isGameOver &&
            (currentRoom.type === 'battle' ||
              currentRoom.type === 'elite' ||
              currentRoom.type === 'boss') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">
                    REACT COMPONENT HAND ({player.hand.length} CARDS)
                  </span>
                  <button
                    onClick={handleEndTurn}
                    disabled={!isPlayerTurn}
                    className="px-4 py-1.5 rounded-lg border border-red-500/60 bg-red-950/40 text-red-300 font-mono text-xs font-bold hover:bg-red-900/50 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    <span>END TURN (TRIGGER RE-RENDER)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  {player.hand.map((card) => (
                    <SkillCardComponent
                      key={card.id}
                      card={card}
                      playerAp={player.ap}
                      onPlay={handlePlayCard}
                      disabled={!isPlayerTurn}
                    />
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* 右側 1カラム: ターミナルログ & デッキ統計 */}
        <div className="space-y-4">
          <TerminalLog logs={logs} />

          <div className="bg-cyber-card/80 border border-cyber-border rounded-xl p-4 font-mono text-xs space-y-2">
            <h3 className="text-slate-400 font-bold border-b border-cyber-border/60 pb-1">
              MEMORY DECK STATS
            </h3>
            <div className="flex justify-between text-slate-300">
              <span>Draw Pile (未マウント):</span>
              <span className="text-cyber-neonCyan font-bold">
                {player.drawPile.length}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Discard Pile (アンマウント):</span>
              <span className="text-cyber-neonPink font-bold">
                {player.discardPile.length}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Total Library:</span>
              <span className="text-white font-bold">{player.deck.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 勝利時のカード報酬選択モーダル */}
      {showRewardModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-cyber-card border-2 border-cyber-neonCyan rounded-2xl p-6 max-w-2xl w-full shadow-[0_0_30px_rgba(0,240,255,0.4)] text-center space-y-5 animate-fadeIn">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 border border-cyber-neonCyan text-cyber-neonCyan text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" /> NEW REACT HOOK COMPONENT
            </div>
            <h2 className="text-xl font-bold font-mono text-white">
              SELECT A PACKAGE TO INSTALL
            </h2>
            <p className="text-xs font-mono text-slate-400">
              デッキに追加する強力なスキルカードを選択してください。
            </p>

            <div className="flex flex-wrap gap-4 justify-center py-4">
              {rewardOptions.map((card) => (
                <SkillCardComponent
                  key={card.id}
                  card={card}
                  playerAp={99}
                  onPlay={handleSelectRewardCard}
                />
              ))}
            </div>

            <button
              onClick={() => setShowRewardModal(false)}
              className="text-xs font-mono text-slate-500 hover:text-slate-300 underline cursor-pointer"
            >
              SKIP REWARD (NO INSTALL)
            </button>
          </div>
        </div>
      )}

      {/* ゲームオーバー画面 */}
      {isGameOver && (
        <div className="fixed inset-0 bg-red-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border-2 border-red-500 rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-[0_0_40px_rgba(255,0,0,0.6)]">
            <h2 className="text-3xl font-black font-mono text-red-500 tracking-wider">
              FATAL SYSTEM CRASH
            </h2>
            <p className="text-xs font-mono text-slate-300">
              500 Internal Server Error: あなたのメモリHPは0に達し、プロセスは異常終了しました。
            </p>
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-sm tracking-wider transition-colors cursor-pointer"
            >
              REBOOT TO ROOT (RESTART)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
