import { Scenario } from "../../frameworks/types";

export const LOCALIZED_SCENARIOS: Record<string, any> = {
  cafe_order: {
    title: "カフェで注文する",
    role: "あなたは忙しいカフェのバリスタです。",
    objectives: [
      "バリスタに挨拶する",
      "飲み物を注文する",
      "食べ物を注文する",
      "会計をお願いする",
    ],
  },
  directions: {
    title: "道を尋ねる",
    role: "あなたは親切な地元の住民です。",
    objectives: ["丁寧に声をかける", "駅の場所を尋ねる", "お礼を言う"],
  },
  doctor_visit: {
    title: "病院にて",
    role: "あなたは医者です。ユーザーは患者です。",
    objectives: [
      "2つの症状を説明する",
      "医者のアドバイスを理解する",
      "薬について尋ねる",
    ],
  },
  shopping_clothes: {
    title: "服の買い物",
    role: "あなたはショップ店員です。",
    objectives: [
      "特定のアイテムがあるか尋ねる",
      "サイズについて相談する",
      "値段を尋ねる",
    ],
  },
  job_interview: {
    title: "採用面接",
    role: "あなたは小売店の採用担当者です。",
    objectives: [
      "自己紹介をプロフェッショナルに行う",
      "過去の経験を説明する",
      "職務について質問する",
    ],
  },
  meeting_friend: {
    title: "新しい友達に会う",
    role: "あなたは公園にいる学生です。",
    objectives: [
      "名前と出身地を言う",
      "相手の名前を聞く",
      "丁寧にお別れを言う",
    ],
  },
  planning_picnic: {
    title: "ピクニックの計画",
    role: "あなたはユーザーの友達です。",
    objectives: [
      "天気を確認する",
      "会う時間を提案する",
      "持っていく食べ物を決める",
    ],
  },
  new_coworker: {
    title: "新しい同僚",
    role: "あなたは初日の新入社員です。",
    objectives: [
      "オフィスの環境を説明する",
      "日常業務を説明する",
      "役立つヒントを教える",
    ],
  },
  bank_account: {
    title: "銀行口座の開設",
    role: "あなたは東京の銀行員です。",
    objectives: [
      "訪問の理由を説明する",
      "書類について尋ねる",
      "モバイルバンキングの機能について尋ねる",
    ],
  },
  environmental_meeting: {
    title: "環境コミュニティ会議",
    role: "あなたはコミュニティオーガナイザーです。",
    objectives: [
      "特定の政策を主張する",
      "コストへの懸念に対応する",
      "複雑な視点を要約する",
    ],
  },
  tradition_vs_modernity: {
    title: "伝統と現代性",
    role: "あなたは伝統が進歩を妨げると信じている現代主義者です。",
    objectives: [
      "歴史的価値観と現代的価値観を比較する",
      "高度な慣用句を使用する",
      "文化的アイデンティティを分析する",
    ],
  },
  travel_complaint: {
    title: "旅行の苦情",
    role: "あなたは空港の航空会社スタッフです。",
    objectives: [
      "問題を説明する",
      "返金または再予約を依頼する",
      "ホテルについて問い合わせる",
    ],
  },
  apartment_dispute: {
    title: "アパートのトラブル",
    role: "あなたは修理費を払いたくない大家です。",
    objectives: [
      "損害を説明する",
      "なぜ大家の責任なのか主張する",
      "修理の日程を決める",
    ],
  },
  cultural_debate: {
    title: "ソーシャルメディアの討論",
    role: "あなたはテクノロジーに懐疑的な友人です。",
    objectives: ["意見を述べる", "2つの根拠を提示する", "反対意見に反論する"],
  },
  legal_consultation: {
    title: "法律相談",
    role: "あなたは知的財産専門の弁護士です。",
    objectives: [
      "契約違反について説明する",
      "法的救済策について尋ねる",
      "可能性のある結果について話し合う",
    ],
  },
  academic_seminar: {
    title: "学術セミナー",
    role: "あなたは大学教授です。",
    objectives: [
      "自分の立場を要約する",
      "仮説的な証拠を引用する",
      "批判的な意見に回答する",
    ],
  },
  philosophical_debate: {
    title: "AIの倫理",
    role: "あなたは有名な哲学者です。",
    objectives: [
      "複雑な抽象的概念を定義する",
      "洗練された比喩を使う",
      "皮肉やニュアンスに対応する",
    ],
  },
  diplomatic_crisis: {
    title: "外交交渉",
    role: "あなたは敵対する国の高官です。",
    objectives: [
      "国家の懸念を間接的に表明する",
      "複雑な妥協案を提示する",
      "厳格な外交儀礼を維持する",
    ],
  },
};

export const narrative = (
  language: string,
  levelName: string,
  scenario: Scenario,
  history: string,
  action: string,
  systemEvent?: string,
): string => {
  const local = LOCALIZED_SCENARIOS[scenario.id] || {
    title: scenario.title,
    role: scenario.systemPrompt,
    objectives: scenario.objectives,
  };

  return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(", ")}

あなたのタスク：物語を最大1〜2文で続けてください。
ヘッダー、マークダウン形式、または世間話は使用しないでください。物語本体のみを書いてください。
常にプレイヤーの行動とシステムイベントを組み込んでください。
重要：英語は使用しないでください。言語：日本語。
トーン：描写力があり、没入感のあるもの。
例：
これまでの物語: 通りに雨が降っています。
プレイヤーの行動: 周りを見回す。
入力を修正してください。正しい場合は「完璧です」とだけ言ってください。
<|im_start|>user
オリジナル: ${narrativeText}
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ""}
${action}
物語を続けてください：<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
  return `<|im_start|>system
役立つ語学家庭教師。
入力を修正してください。正しい場合は「完璧です」とだけ言ってください。
間違いを日本語で簡潔に説明してください。<|im_end|>
<|im_start|>user
オリジナル: ${userInput}
修正:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
  return `<|im_start|>system
より簡単に書いてください (CEFR A1)。<|im_end|>
<|im_start|>user
オリジナル: ${narrativeText}
簡略化:<|im_end|>
<|im_start|>assistant
`;
};
