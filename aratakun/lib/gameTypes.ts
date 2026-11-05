export type EmployeeRole = 
  | 'Frontend (React)' 
  | 'Backend (Node.js)' 
  | 'Fullstack' 
  | 'Designer' 
  | 'Sales' 
  | 'Intern';

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  stamina: number;      // 体力 (0になると倒れて救急搬送)
  maxStamina: number;
  mental: number;       // メンタル (0になると退職代行で辞める)
  maxMental: number;
  productivity: number; // 1ターンあたりの作業量
  salary: number;       // 月給（安く買い叩くか）
  loyalty: number;      // 社長への洗脳度/忠誠度 (高いと辞めにくい)
  isOvertime: boolean;  // 深夜残業中か
  status: 'working' | 'overtime' | 'collapsed' | 'escaped' | 'rebellious';
  avatarColor: string;
}

export interface Project {
  id: string;
  title: string;
  client: string;
  reward: number;           // 報酬金（円）
  requiredProgress: number; // 必要工数
  currentProgress: number;
  daysRemaining: number;    // 納期（日）
  isFlaming: boolean;       // 炎上案件（仕様変更など）
  difficulty: 'EASY' | 'NORMAL' | 'HARD' | 'DEATH_MARCH';
}

export interface PresidentActionCard {
  id: string;
  name: string;
  hookName: string;         // モチーフとなったReact Hook / Next.js機能
  cost: number;             // 社長の気力(AP) または 資金(円)
  costType: 'ap' | 'cash';
  description: string;
  effectType: 
    | 'force_overtime'       // 全員深夜残業（進捗倍増・体力減少）
    | 'yarigai_exploitation' // やりがい搾取（忠誠UP・メンタル現状維持・給与凍結）
    | 'energy_drink'         // エナジードリンク配給（体力全快・メンタル削れ）
    | 'server_falsify'       // Server Action: タイムカード改ざん（労基リスク低下）
    | 'aircon_off'           // 経費削減：エアコン停止（資金節約・不満増）
    | 'suspense_allnighter'  // Suspense: 徹夜デスマ（一気に進捗＋倒れるリスク）
    | 'nomikai_compulsory'   // 強制飲み会（社長の満足度UP・社員疲弊）
    | 'hire_intern';         // インターン無給召喚（即戦力使い捨て）
}

export interface CompanyState {
  name: string;
  cash: number;             // 資金
  monthlyCost: number;      // 固定費・給与
  day: number;              // 経過日数
  ap: number;               // 社長の気力 / 叱責力 (Action Points)
  maxAp: number;
  laborRisk: number;        // 労働基準監督署の警戒度 (0 - 100%) 100%で家宅捜索・ゲームオーバー
  blackLevel: number;       // ブラック企業度 (Lv.1 〜 Lv.999)
  ipoTarget: number;        // IPO(上場)に必要な目標資産（1,000万円）
  isIpoAchieved: boolean;
  isBankrupt: boolean;
  isRaidedByLaborBureau: boolean;
}

export interface InternalChatLog {
  id: string;
  sender: string;
  role: string;
  message: string;
  timestamp: string;
  type: 'slack' | 'alert' | 'system' | 'client';
}
