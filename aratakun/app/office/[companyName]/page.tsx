'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  CompanyState,
  Employee,
  InternalChatLog,
  PresidentActionCard,
  Project,
} from '@/lib/gameTypes';
import {
  generateRandomEmployee,
  generateRandomProject,
  getInitialEmployees,
  getInitialProjects,
  PRESIDENT_CARDS,
  SLACK_SHOUTS,
} from '@/lib/serverEngine';
import {
  auditLaborInspection,
  deliverProjectServer,
  executeServerActionFalsify,
} from '@/app/actions/gameActions';
import { sound } from '@/lib/audio';
import { CompanyHUD } from '@/components/CompanyHUD';
import { EmployeeDesk } from '@/components/EmployeeDesk';
import { ProjectBoard } from '@/components/ProjectBoard';
import { PresidentActionCards } from '@/components/PresidentActionCards';
import { SlackFeed } from '@/components/SlackFeed';
import {
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Flame,
} from 'lucide-react';

export default function OfficePage() {
  const params = useParams();
  const router = useRouter();
  const rawName = (params.companyName as string) || 'ブラック企業';
  const companyName = decodeURIComponent(rawName);

  // 会社状態
  const [company, setCompany] = useState<CompanyState>({
    name: companyName,
    cash: 2500000, // 初期資金 250万円
    monthlyCost: 650000,
    day: 1,
    ap: 4,
    maxAp: 4,
    laborRisk: 15,
    blackLevel: 1,
    ipoTarget: 10000000, // 1,000万円でIPO上場！
    isIpoAchieved: false,
    isBankrupt: false,
    isRaidedByLaborBureau: false,
  });

  // 社員一覧
  const [employees, setEmployees] = useState<Employee[]>(getInitialEmployees());

  // 受注案件一覧
  const [projects, setProjects] = useState<Project[]>(getInitialProjects());

  // 社内Slackログ
  const [logs, setLogs] = useState<InternalChatLog[]>([
    {
      id: 'log_1',
      sender: '代表取締役社長',
      role: 'CEO',
      message: `全社員へ。本日より『${companyName}』の新経営方針として、全員の限界突破とIPO(上場)を義務付けます。残業代は夢の代金です。`,
      timestamp: '09:00',
      type: 'system',
    },
  ]);

  // モーダル・ダイアログ
  const [eventAlert, setEventAlert] = useState<string | null>(null);

  // ログ追加ヘルパー
  const addSlackLog = (
    sender: string,
    role: string,
    message: string,
    type: InternalChatLog['type'] = 'slack'
  ) => {
    const time = `${String(Math.floor(Math.random() * 12) + 12).padStart(2, '0')}:${String(
      Math.floor(Math.random() * 60)
    ).padStart(2, '0')}`;
    setLogs((prev) => [
      ...prev,
      {
        id: `log_${Date.now()}_${Math.random()}`,
        sender,
        role,
        message,
        timestamp: time,
        type,
      },
    ]);
  };

  // 社員のアクション：残業ON/OFF
  const handleToggleOvertime = (empId: string) => {
    sound.playTypingBurst();
    setEmployees((prev) =>
      prev.map((e) => {
        if (e.id === empId) {
          const nextOvertime = !e.isOvertime;
          if (nextOvertime) {
            addSlackLog(e.name, e.role, '「残業命令が出ました…今夜も終電無理そうです」');
          } else {
            addSlackLog(e.name, e.role, '「定時退社許可出た…！？罠じゃないよね？」');
          }
          return { ...e, isOvertime: nextOvertime };
        }
        return e;
      })
    );
  };

  // 社員のアクション：激詰め
  const handleScold = (empId: string) => {
    sound.playShout();
    setEmployees((prev) =>
      prev.map((e) => {
        if (e.id === empId) {
          const nextMental = Math.max(0, e.mental - 15);
          return {
            ...e,
            mental: nextMental,
          };
        }
        return e;
      })
    );

    // 最も進捗が少ない案件を無理やり進める
    if (projects.length > 0) {
      setProjects((prev) => {
        const next = [...prev];
        next[0].currentProgress += 18;
        return next;
      });
    }

    const emp = employees.find((e) => e.id === empId);
    addSlackLog(
      '社長',
      'CEO',
      `「おい${emp?.name || ''}！手が止まってるぞ！死ぬ気でキーボード叩け！！」`,
      'alert'
    );

    setCompany((prev) => ({
      ...prev,
      blackLevel: prev.blackLevel + 1,
    }));
  };

  // 社員のアクション：エナジードリンク投与
  const handleGiveEnergyDrink = (empId: string) => {
    if (company.cash < 3000) return;
    sound.playEnergyDrink();

    setCompany((prev) => ({ ...prev, cash: prev.cash - 3000 }));
    setEmployees((prev) =>
      prev.map((e) => {
        if (e.id === empId) {
          return {
            ...e,
            stamina: Math.min(e.maxStamina, e.stamina + 45),
            mental: Math.max(0, e.mental - 10),
          };
        }
        return e;
      })
    );

    const emp = employees.find((e) => e.id === empId);
    addSlackLog(emp?.name || '', emp?.role || '', '「エナドリ2本一気飲みしました…心臓が痛いですが動けます！」');
  };

  // 社長コマンドカードの執行
  const handleExecuteCard = async (card: PresidentActionCard) => {
    if (card.costType === 'ap' && company.ap < card.cost) return;
    if (card.costType === 'cash' && company.cash < card.cost) return;

    sound.playCashRegister();

    // コスト消費
    setCompany((prev) => ({
      ...prev,
      ap: card.costType === 'ap' ? prev.ap - card.cost : prev.ap,
      cash: card.costType === 'cash' ? prev.cash - card.cost : prev.cash,
      blackLevel: prev.blackLevel + 2,
    }));

    // Server Action: タイムカード改ざん
    if (card.effectType === 'server_falsify') {
      try {
        const res = await executeServerActionFalsify(company.laborRisk);
        setCompany((prev) => ({ ...prev, laborRisk: res.newLaborRisk }));
        addSlackLog('総務（裏アカウント）', 'Admin', res.message, 'system');
      } catch {
        addSlackLog('システム', 'Error', 'サーバー改ざんに失敗しました', 'alert');
      }
      return;
    }

    // Suspense: 徹夜デスマ・ストリーミング
    if (card.effectType === 'suspense_allnighter') {
      sound.playTypingBurst();
      setProjects((prev) =>
        prev.map((p) => ({
          ...p,
          currentProgress: p.currentProgress + 75,
        }))
      );
      setEmployees((prev) =>
        prev.map((e) => ({
          ...e,
          stamina: Math.max(10, e.stamina - 30),
          mental: Math.max(10, e.mental - 25),
        }))
      );
      addSlackLog(
        '社長',
        'CEO',
        '「全員朝までストリーミング作業！納品まで寝ることは許可しない！」',
        'alert'
      );
      return;
    }

    // エアコン停止
    if (card.effectType === 'aircon_off') {
      setCompany((prev) => ({ ...prev, cash: prev.cash + 80000 }));
      setEmployees((prev) =>
        prev.map((e) => ({ ...e, mental: Math.max(0, e.mental - 15) }))
      );
      addSlackLog(
        '総務',
        'Notice',
        '【経費削減】本日よりオフィスの冷暖房は全停止します。各自うちわを持参してください。',
        'system'
      );
      return;
    }

    // やりがい搾取（みなし残業）
    if (card.effectType === 'yarigai_exploitation') {
      setCompany((prev) => ({
        ...prev,
        monthlyCost: Math.max(200000, prev.monthlyCost - 100000),
      }));
      setEmployees((prev) =>
        prev.map((e) => ({ ...e, loyalty: Math.min(100, e.loyalty + 15) }))
      );
      addSlackLog(
        '社長',
        'CEO',
        '「ウチの給料には月45時間のみなし残業が含まれてるから。成長のチャンスだよ」',
        'alert'
      );
      return;
    }

    // 強制飲み会
    if (card.effectType === 'nomikai_compulsory') {
      setEmployees((prev) =>
        prev.map((e) => ({
          ...e,
          stamina: Math.max(10, e.stamina - 25),
          loyalty: Math.min(100, e.loyalty + 10),
        }))
      );
      addSlackLog(
        '社長',
        'CEO',
        '「今日は社長のおごりで居酒屋行くぞ！（※割り勘）全員参加な！」',
        'alert'
      );
      return;
    }

    // インターン召喚
    if (card.effectType === 'hire_intern') {
      const newIntern = generateRandomEmployee();
      setEmployees((prev) => [...prev, newIntern]);
      addSlackLog(
        '新入社員',
        'Intern',
        `「初めまして！${newIntern.name}です！業界を学びたくて無給で参りました！」`,
        'slack'
      );
      return;
    }

    // エナドリケース買い
    if (card.effectType === 'energy_drink') {
      sound.playEnergyDrink();
      setEmployees((prev) =>
        prev.map((e) => ({
          ...e,
          stamina: e.maxStamina,
          mental: Math.max(10, e.mental - 20),
        }))
      );
      addSlackLog('総務', 'Notice', '「社長からエナジードリンク3箱の差し入れです！」');
      return;
    }
  };

  // 納品処理 (Server Action)
  const handleDeliverProject = async (project: Project) => {
    sound.playCashRegister();
    try {
      const res = await deliverProjectServer(project, company.cash);
      setCompany((prev) => {
        const nextCash = res.newTotalCash;
        const isIpo = nextCash >= prev.ipoTarget;
        return {
          ...prev,
          cash: nextCash,
          isIpoAchieved: isIpo,
        };
      });

      // 案件をリストから削除し、新規案件を追加
      setProjects((prev) => [
        ...prev.filter((p) => p.id !== project.id),
        generateRandomProject(company.day),
      ]);

      addSlackLog('経理', 'Finance', res.message, 'system');
    } catch {
      // error
    }
  };

  // 単独案件の作業推進
  const handleWorkProject = (projId: string) => {
    sound.playTypingBurst();
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projId) {
          return {
            ...p,
            currentProgress: p.currentProgress + 20,
          };
        }
        return p;
      })
    );
  };

  // 翌日へ進む（メインターン進行）
  const handleNextDay = async () => {
    sound.playTypingBurst();

    let newLaborRisk = company.laborRisk;
    let newCash = company.cash;

    // 1. 社員たちの労働計算
    let activeWorkers = 0;
    const updatedEmployees = employees
      .map((emp) => {
        // 退職・ダウン判定
        if (emp.mental <= 0) {
          sound.playResignation();
          addSlackLog(
            '退職代行モームリ',
            'Legal',
            `【通知】${emp.name}様より退職代行の委任通知書が届きました。本日付で退職となります。`,
            'alert'
          );
          return null; // 退職
        }

        if (emp.stamina <= 0) {
          addSlackLog(
            '救急隊',
            '119',
            `【緊急搬送】${emp.name}様が過労で倒れました。点滴のため本日は稼働できません。`,
            'alert'
          );
          return {
            ...emp,
            status: 'collapsed' as const,
            stamina: 30,
            mental: Math.max(0, emp.mental - 20),
          };
        }

        activeWorkers++;

        // 残業か定時か
        const isOt = emp.isOvertime;
        const workOutput = isOt
          ? Math.floor(emp.productivity * 1.8)
          : emp.productivity;
        const staminaLoss = isOt ? 25 : 12;
        const mentalLoss = isOt ? 20 : 8;

        if (isOt) {
          newLaborRisk += 6; // 残業させると労基署リスク増加
        }

        return {
          ...emp,
          stamina: Math.max(0, emp.stamina - staminaLoss),
          mental: Math.max(0, emp.mental - mentalLoss),
        };
      })
      .filter(Boolean) as Employee[];

    setEmployees(updatedEmployees);

    // 2. 案件の自動進捗 & 納期減少
    setProjects((prev) =>
      prev.map((proj) => {
        const addedProgress = activeWorkers * 12;
        const nextProgress = proj.currentProgress + addedProgress;
        const nextDays = proj.daysRemaining - 1;

        if (nextDays < 0 && nextProgress < proj.requiredProgress) {
          // 納期遅れ炎上ペナルティ
          newCash -= 300000;
          addSlackLog(
            'クライアント',
            'Client',
            `『${proj.title}』の納期が過ぎています！違約金30万円を請求します！！`,
            'alert'
          );
        }

        return {
          ...proj,
          currentProgress: nextProgress,
          daysRemaining: Math.max(0, nextDays),
        };
      })
    );

    // 3. 労基署の抜き打ち査察判定 (Server Action)
    if (newLaborRisk >= 50) {
      try {
        const audit = await auditLaborInspection(
          { ...company, laborRisk: newLaborRisk },
          updatedEmployees
        );
        if (audit.isRaided) {
          sound.playSiren();
          newCash -= audit.fine;
          newLaborRisk = 10; // 家宅捜索後は書類押収で一旦リセット
          setEventAlert(audit.message);
          addSlackLog('労働基準監督署', '労基Gメン', audit.message, 'alert');
        } else {
          addSlackLog('社内防犯カメラ', 'Security', audit.message, 'system');
        }
      } catch {
        // error
      }
    }

    // 4. ランダムSlack悲鳴
    const randomShout =
      SLACK_SHOUTS[Math.floor(Math.random() * SLACK_SHOUTS.length)];
    const randomEmp =
      updatedEmployees[Math.floor(Math.random() * updatedEmployees.length)];
    if (randomEmp) {
      addSlackLog(randomEmp.name, randomEmp.role, randomShout);
    }

    // 5. 会社ステータス更新
    setCompany((prev) => {
      const nextDay = prev.day + 1;
      const isBankrupt = newCash < -500000;
      const isIpo = newCash >= prev.ipoTarget;

      return {
        ...prev,
        day: nextDay,
        cash: newCash,
        laborRisk: Math.min(100, Math.max(0, newLaborRisk)),
        ap: prev.maxAp, // 翌朝AP全快
        isBankrupt,
        isIpoAchieved: isIpo,
      };
    });
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6 font-mono">
      {/* ナビバー */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 hover:border-red-500 text-slate-400 hover:text-white transition-colors"
        >
          ← 社長辞任（タイトルへ）
        </button>

        <button
          onClick={handleNextDay}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-sm tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
        >
          <span>翌朝へ進む (DAY {company.day + 1})</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 会社HUD (資金・労基署リスク・IPO進捗) */}
      <CompanyHUD company={company} />

      {/* メインレイアウト */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* 左側2カラム: 社員フロア & デスマーチ案件 */}
        <div className="lg:col-span-2 space-y-6">
          <EmployeeDesk
            employees={employees}
            onToggleOvertime={handleToggleOvertime}
            onScold={handleScold}
            onGiveEnergyDrink={handleGiveEnergyDrink}
            onFire={() => {}}
            companyCash={company.cash}
          />

          <ProjectBoard
            projects={projects}
            onDeliver={handleDeliverProject}
            onWorkProject={handleWorkProject}
          />
        </div>

        {/* 右側1カラム: 社長Hooksカード & 社内Slack */}
        <div className="space-y-6">
          <SlackFeed logs={logs} />
          <PresidentActionCards
            cards={PRESIDENT_CARDS}
            currentAp={company.ap}
            currentCash={company.cash}
            onExecuteCard={handleExecuteCard}
          />
        </div>
      </div>

      {/* 労基署アラートモーダル */}
      {eventAlert && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border-2 border-red-600 rounded-2xl p-6 max-w-md w-full shadow-[0_0_40px_rgba(255,0,0,0.7)] text-center space-y-4 animate-glitch">
            <div className="w-14 h-14 rounded-full bg-red-950 border border-red-500 flex items-center justify-center text-red-500 mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-red-500 tracking-wider">
              緊急家宅捜索通知
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              {eventAlert}
            </p>
            <button
              onClick={() => setEventAlert(null)}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer"
            >
              違約金を払って業務再開
            </button>
          </div>
        </div>
      )}

      {/* 勝利モーダル (IPO上場達成！) */}
      {company.isIpoAchieved && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border-2 border-emerald-400 rounded-2xl p-8 max-w-lg w-full text-center space-y-6 shadow-[0_0_50px_rgba(16,185,129,0.7)]">
            <div className="w-20 h-20 rounded-full bg-emerald-950 border border-emerald-400 flex items-center justify-center text-cyber-neonGreen mx-auto animate-bounce">
              <Trophy className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-emerald-400 tracking-wider">
              祝・東証グロース上場 (IPO)！
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              社畜たちの血と汗と涙の結晶により、会社の資金は1,000万円を突破！
              あなたは創業者株式を売却し、10億円の資産を手に入れて南の島へ高飛びしました。
              残された社員たちは今日も元気にデスマを続けています。
            </p>
            <button
              onClick={() => router.push('/')}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm tracking-wider cursor-pointer"
            >
              次の会社を立ち上げる（新ゲーム）
            </button>
          </div>
        </div>
      )}

      {/* 倒産・逮捕ゲームオーバー */}
      {company.isBankrupt && (
        <div className="fixed inset-0 bg-red-950/95 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border-2 border-red-600 rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-[0_0_50px_rgba(255,0,0,0.8)]">
            <h2 className="text-3xl font-black text-red-500 tracking-wider">
              破産倒産 // BANKRUPTCY
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              資金が底をつき、不渡りを出して会社は倒産しました。
              社員たちには未払い給与の山が残り、あなたは夜逃げすることになりました。
            </p>
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm cursor-pointer"
            >
              もう一度やり直す
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
