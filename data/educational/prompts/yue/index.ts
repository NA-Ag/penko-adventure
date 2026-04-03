import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "咖啡店點餐",
        role: "你係一間好忙嘅咖啡店嘅咖啡師。",
        objectives: ["同咖啡師打招呼", "點一杯嘢飲", "點一份嘢食", "攞單"]
    },
    directions: {
        title: "問路",
        role: "你係一個喺街上好熱心嘅本地人。",
        objectives: ["有禮貌地打招呼", "問火車站喺邊度", "多謝本地人"]
    },
    doctor_visit: {
        title: "睇醫生",
        role: "你係醫生。用戶係病人。",
        objectives: ["描述兩種症狀", "理解醫生嘅建議", "查詢藥物"]
    },
    shopping_clothes: {
        title: "買衫",
        role: "你係店員。",
        objectives: ["詢問特定款式", "討論尺碼", "問價錢"]
    },
    job_interview: {
        title: "求職面試",
        role: "你係一個招聘經理，正在面試用戶應徵零售工作。",
        objectives: ["專業地介紹自己", "描述過往經驗", "問一個關於職位嘅問題"]
    },
    meeting_friend: {
        title: "結識新朋友",
        role: "你係公園入面嘅一個學生。",
        objectives: ["講出你嘅名同埋嚟自邊度", "問對方叫咩名", "有禮貌地講再見"]
    },
    planning_picnic: {
        title: "計劃野餐",
        role: "你係用戶嘅朋友。",
        objectives: ["檢查天氣", "建議見面時間", "決定帶咩嘢食"]
    },
    new_coworker: {
        title: "新同事",
        role: "你係第一日返工嘅新員工。",
        objectives: ["描述辦公室環境", "解釋日常工作", "提供一個有用嘅提示"]
    },
    bank_account: {
        title: "開銀行戶口",
        role: "你係香港嘅銀行職員。",
        objectives: ["解釋嚟嘅原因", "查詢有關文件", "問關於流動理財嘅功能"]
    },
    environmental_meeting: {
        title: "環保社區會議",
        role: "你係一個社區組織者。",
        objectives: ["為特定政策提出論點", "回應對成本嘅擔憂", "總結一個複雜嘅觀點"]
    },
    tradition_vs_modernity: {
        title: "傳統與現代",
        role: "你係一個相信傳統會阻礙進步嘅現代主義者。",
        objectives: ["比較歷史同現代價值觀", "使用高級成語", "分析文化認同"]
    },
    travel_complaint: {
        title: "旅遊投訴",
        role: "你係機場嘅航空公司職員。",
        objectives: ["解釋問題", "要求退款或者改簽", "查詢酒店資料"]
    },
    apartment_dispute: {
        title: "租房糾紛",
        role: "你係一個唔想支付維修費嘅房東。",
        objectives: ["描述損壞情況", "爭論點解係房東嘅責任", "商定維修日期"]
    },
    cultural_debate: {
        title: "社交媒體辯論",
        role: "你係一個對科技持懷疑態度嘅朋友。",
        objectives: ["表達觀點", "提供兩個支持理由", "回應反對觀點"]
    },
    legal_consultation: {
        title: "法律諮詢",
        role: "你係一個專長於知識產權嘅律師。",
        objectives: ["解釋合約違約", "諮詢法律補救措施", "討論可能嘅結果"]
    },
    academic_seminar: {
        title: "學術研討會",
        role: "你係大學教授。",
        objectives: ["總結你嘅立場", "引用假設性證據", "回應批評意見"]
    },
    philosophical_debate: {
        title: "人工智能倫理",
        role: "你係知名哲學家。",
        objectives: ["定義一個複雜嘅抽象概念", "使用高級比喻", "處理諷刺同細節"]
    },
    diplomatic_crisis: {
        title: "外交談判",
        role: "你係來自競爭國家嘅高級外交官。",
        objectives: ["含蓄表達國家憂慮", "提出一個複雜嘅折衷方案", "遵守嚴格官方禮儀"]
    }
};

/**
 * YUE Educational Narrative Prompt
 */
export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
AI 語言導師 (${levelName})。${local.role}
貝立茲規則：唔好直接糾正錯誤。自然噉用正確嘅語法嚟肯定諗法。
例子：用户：「我尋日食蛋糕。」 -> 你：「我都尋日**食咗蛋糕**噃，你鍾意乜嘢味？」

場景: ${local.title}
用户目標: ${local.objectives.join(', ')}

指令:
1. 準確噉回答 1 或者 2 句。
2. 語言: ${language}。唔好用英文。
3. 喺回答嘅尾末加上 [ROMANIZATION: 發音]。
4. 等級: ${levelName}。<|im_end|>
<|im_start|>user
目前嘅對話: ${history}
${systemEvent ? `系統事件: ${systemEvent}` : ''}
用户: ${action}
導師嘅回答:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * YUE Educational Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
${language} 語言導師。糾正用戶輸入入面嘅錯誤。如果正確嘅話，請講「完美（Perfect）」。<|im_end|>
<|im_start|>user
原文：${userInput}
糾正：<|im_end|>
<|im_start|>assistant
`;
};

/**
 * YUE Educational Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
將以下文本變得簡單啲（CEFR A1 等級）。<|im_end|>
<|im_start|>user
原文：${narrativeText}
簡化：<|im_end|>
<|im_start|>assistant
`;
};
