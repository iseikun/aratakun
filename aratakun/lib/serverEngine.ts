import { Employee, Project, PresidentActionCard, CompanyState, InternalChatLog } from './gameTypes';

// 社長の経営コマンド（React & Next.js 機能モチーフ）
export const PRESIDENT_CARDS: PresidentActionCard[] = [
  {
    id: 'use_state_fixed_salary',
    name: 'useState: みなし残業45時間固定',
    hookName: 'useState',
    cost: 1,
    costType: 'ap',
    description: '基本給に残業代を包含！社員の給与支払いをStateとして凍結し、資金消費を抑える。',
    effectType: 'yarigai_exploitation',
  },
  {
    id: 'use_effect_nomikai',
    name: 'useEffect: 業務後強制飲み会',
    hookName: 'useEffect',
    cost: 1,
    costType: 'ap',
    description: 'マウント（定時）後に副作用発動！社長の武勇伝を語り忠誠度UP（社員体力激減）。',
    effectType: 'nomikai_compulsory',
  },
  {
    id: 'use_memo_aircon_cut',
    name: 'useMemo: 経費削減キャッシュ (エアコン停止)',
    hookName: 'useMemo',
    cost: 1,
    costType: 'ap',
    description: '冷暖房の電力をメモ化（遮断）！月額経費を浮かせ、会社の現金を即時5万円節約。',
    effectType: 'aircon_off',
  },
  {
    id: 'use_reducer_strict_report',
    name: 'useReducer: 恐怖の30分刻み日報',
    hookName: 'useReducer',
    cost: 2,
    costType: 'ap',
    description: '厳格なReducerルール！サボりを完全根絶し全社員の生産性を一時的に2倍にする。',
    effectType: 'force_overtime',
  },
  {
    id: 'server_action_falsify',
    name: 'Server Action: タイムカード改ざん',
    hookName: 'Server Action',
    cost: 2,
    costType: 'ap',
    description: 'バンドルに残らないサーバー裏関数で打刻ログを書き換え！労基署の警戒度を30%減少。',
    effectType: 'server_falsify',
  },
  {
    id: 'suspense_allnighter',
    name: 'Suspense: 徹夜デスマ・ストリーミング',
    hookName: 'Suspense',
    cost: 2,
    costType: 'ap',
    description: '納期が間に合わない？朝までストリーミング作業！全案件の進捗を瞬時に+80進める。',
    effectType: 'suspense_allnighter',
  },
  {
    id: 'energy_drink_crate',
    name: 'Case: 激安エナジードリンク配給',
    hookName: 'Props Drilling',
    cost: 30000,
    costType: 'cash',
    description: '魔剤のケース買い！全社員の体力を即時全回復させるが、メンタルが壊れる。',
    effectType: 'energy_drink',
  },
  {
    id: 'portal_hire_intern',
    name: 'createPortal: 「学べる環境」無給インターン召喚',
    hookName: 'createPortal',
    cost: 1,
    costType: 'ap',
    description: '社外から新しい夢見る学生をワープ召喚！月給ゼロの使い捨て兵隊を補充。',
    effectType: 'hire_intern',
  },
];

// 初期社員データ
export function getInitialEmployees(): Employee[] {
  return [
    {
      id: 'emp_1',
      name: '佐藤 限界 (Sato)',
      role: 'Frontend (React)',
      stamina: 80,
      maxStamina: 100,
      mental: 70,
      maxMental: 100,
      productivity: 15,
      salary: 180000,
      loyalty: 60,
      isOvertime: false,
      status: 'working',
      avatarColor: 'from-blue-600 to-cyan-500',
    },
    {
      id: 'emp_2',
      name: '鈴木 魔剤 (Suzuki)',
      role: 'Backend (Node.js)',
      stamina: 90,
      maxStamina: 100,
      mental: 60,
      maxMental: 100,
      productivity: 18,
      salary: 200000,
      loyalty: 50,
      isOvertime: false,
      status: 'working',
      avatarColor: 'from-emerald-600 to-teal-500',
    },
    {
      id: 'emp_3',
      name: '田中 徹夜 (Tanaka)',
      role: 'Fullstack',
      stamina: 95,
      maxStamina: 100,
      mental: 50,
      maxMental: 100,
      productivity: 24,
      salary: 220000,
      loyalty: 40,
      isOvertime: false,
      status: 'working',
      avatarColor: 'from-purple-600 to-indigo-500',
    },
    {
      id: 'emp_4',
      name: '渡辺 ピュア (Watanabe)',
      role: 'Intern',
      stamina: 100,
      maxStamina: 100,
      mental: 90,
      maxMental: 100,
      productivity: 10,
      salary: 50000,
      loyalty: 85,
      isOvertime: false,
      status: 'working',
      avatarColor: 'from-amber-500 to-orange-500',
    },
  ];
}

// 炎上デスマーチ案件リスト
export function getInitialProjects(): Project[] {
  return [
    {
      id: 'proj_1',
      title: '予算10万の官公庁AI基幹システム全面刷新',
      client: '某省庁の下請けの孫請けSIer',
      reward: 800000,
      requiredProgress: 100,
      currentProgress: 25,
      daysRemaining: 4,
      isFlaming: true,
      difficulty: 'NORMAL',
    },
    {
      id: 'proj_2',
      title: '明日朝までに仕様が3回変わるECサイト',
      client: 'ワンマン社長アパレル',
      reward: 1200000,
      requiredProgress: 160,
      currentProgress: 0,
      daysRemaining: 3,
      isFlaming: true,
      difficulty: 'HARD',
    },
    {
      id: 'proj_3',
      title: 'バグだらけのWeb3マッチングアプリ緊急保守',
      client: '胡散臭いクリプト企業',
      reward: 600000,
      requiredProgress: 80,
      currentProgress: 40,
      daysRemaining: 2,
      isFlaming: false,
      difficulty: 'EASY',
    },
  ];
}

// 新規案件ジェネレーター
export function generateRandomProject(day: number): Project {
  const titles = [
    'ChatGPT風の社内SNSを3日で作ってくれ',
    '画面遷移のたびに紙吹雪が舞う社内受発注システム',
    '予算ゼロだが上場したらストックオプションをやる案件',
    'デザイン修正が無限ループする美容クリニックLP',
    '休日出勤前提で契約された海外金融API連携',
  ];
  const clients = [
    'パワハラ広告代理店',
    'ITリテラシー皆無の投資ファンド',
    '友達価格を要求してくる自称起業家',
    '責任逃れが得意な元請け大企業',
  ];

  const idx = Math.floor(Math.random() * titles.length);
  const isDeath = Math.random() < 0.35;

  return {
    id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
    title: titles[idx],
    client: clients[Math.floor(Math.random() * clients.length)],
    reward: Math.floor(Math.random() * 1500000) + 800000,
    requiredProgress: Math.floor(Math.random() * 140) + 90,
    currentProgress: 0,
    daysRemaining: isDeath ? 2 : Math.floor(Math.random() * 4) + 3,
    isFlaming: isDeath,
    difficulty: isDeath ? 'DEATH_MARCH' : 'NORMAL',
  };
}

// 新インターン/中途社員ジェネレーター
export function generateRandomEmployee(): Employee {
  const names = [
    '高橋 従順', '伊藤 絶望', '小林 逃亡予備軍', '加藤 夢見がち', '吉田 虚無'
  ];
  const roles: Employee['role'][] = ['Frontend (React)', 'Backend (Node.js)', 'Fullstack', 'Intern'];
  const name = names[Math.floor(Math.random() * names.length)];
  const role = roles[Math.floor(Math.random() * roles.length)];

  return {
    id: `emp_${Date.now()}`,
    name,
    role,
    stamina: 100,
    maxStamina: 100,
    mental: 80,
    maxMental: 100,
    productivity: role === 'Intern' ? 10 : 20,
    salary: role === 'Intern' ? 30000 : 180000,
    loyalty: 70,
    isOvertime: false,
    status: 'working',
    avatarColor: 'from-amber-600 to-rose-500',
  };
}

// 社内Slackの悲鳴メッセージジェネレーター
export const SLACK_SHOUTS = [
  '「終電なくなったのでオフィスでダンボール敷いて寝ます…」',
  '「仕様書が白紙なんですがどう実装すればいいですか？」',
  '「昨日から田中さんの姿が見えません…PCが開きっぱなしです」',
  '「エナジードリンク飲んだら心臓がバクバクして視界が青いです」',
  '「先方から『全部作り直して』って電話来ました…泣きそう」',
  '「労基署からアンケート届いたんですけど正直に書いていいですか？」',
  '「親から『頼むから実家に帰ってきて』とLINEが届きました」',
  '「社長の『家族みたいな会社』って言葉、今思うとゾッとします」',
];
