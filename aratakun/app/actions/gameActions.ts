'use server';

import { CompanyState, Employee, Project } from '@/lib/gameTypes';

/**
 * Next.js Server Action: タイムカード改ざん＆労基署対策
 * クライアントのブラウザ履歴やログに残らないサーバー側で深夜残業記録を消去
 */
export async function executeServerActionFalsify(currentLaborRisk: number): Promise<{
  newLaborRisk: number;
  message: string;
  success: boolean;
}> {
  // サーバーサイドでの証拠隠滅シミュレーション
  const reduction = Math.floor(Math.random() * 20) + 25; // 25~45% 減少
  const newRisk = Math.max(0, currentLaborRisk - reduction);

  return {
    newLaborRisk: newRisk,
    message: `[RSC AUDIT-BYPASS] サーバー側のcronログと打刻DBを直接改ざん！全員『18:00定時退社』として記録偽装に成功（労基署警戒度 -${reduction}%）`,
    success: true,
  };
}

/**
 * Next.js Server Action: 労働基準監督署の抜き打ち査察判定
 * サーバー側でチート不可能な確率判定を実行
 */
export async function auditLaborInspection(
  company: CompanyState,
  employees: Employee[]
): Promise<{
  isRaided: boolean;
  fine: number;
  message: string;
}> {
  // リスクに応じたサーバー側確率計算
  const roll = Math.random() * 100;
  const isRaided = roll < company.laborRisk;

  if (isRaided) {
    const fine = Math.min(company.cash, 1500000); // 罰金
    return {
      isRaided: true,
      fine,
      message: `【緊急速報】労働基準監督署が抜き打ち家宅捜索！違法残業とタイムカード改ざんが発覚し、罰金 ¥${fine.toLocaleString()} が科されました！`,
    };
  } else {
    return {
      isRaided: false,
      fine: 0,
      message: `[査察回避] 抜き打ちの監査員が来訪しましたが、社員に『自主的な勉強会です』と言わせて事なきを得ました。`,
    };
  }
}

/**
 * Next.js Server Action: 案件納品・入金処理
 */
export async function deliverProjectServer(
  project: Project,
  currentCash: number
): Promise<{
  earnedCash: number;
  newTotalCash: number;
  message: string;
}> {
  const earnedCash = project.reward;
  const newTotalCash = currentCash + earnedCash;

  return {
    earnedCash,
    newTotalCash,
    message: `[入金確認] クライアント「${project.client}」から ¥${earnedCash.toLocaleString()} が着金しました！`,
  };
}
