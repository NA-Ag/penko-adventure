import { Scenario } from "../../frameworks/types";

export const LOCALIZED_SCENARIOS: Record<string, any> = {
  cafe_order: {
    title: "咖啡店点单",
    role: "侬是忙得来要命个咖啡店咖啡师。",
    objectives: ["搭咖啡师打招呼", "点杯饮料", "点样点心", "买单"],
  },

  directions: {
    title: "问路",
    role: "侬是马路上热心个本地人。",
    objectives: ["客气点打招呼", "问火车站勒辣哪里", "谢过本地人"],
  },
  doctor_visit: {
    title: "看医生",
    role: "侬是医生。用户是病人。",
    objectives: ["讲讲两种症状", "听懂医生个建议", "问问配啥药"],
  },
  shopping_clothes: {
    title: "买衣裳",
    role: "侬是营业员。",
    objectives: ["问问有没特定个衣裳", "谈谈尺寸", "问问价钿"],
  },
  job_interview: {
    title: "面试",
    role: "侬是人事经理，勒辣面试应聘零售工作个用户。",
    objectives: ["专业点自我介绍", "讲讲以前个经验", "问个岗位相关个问题"],
  },
  meeting_friend: {
    title: "结识新朋友",
    role: "侬是公园里个学生。",
    objectives: ["讲讲侬个名字搭哪里人", "问问人家叫啥", "客气点讲再见"],
  },
  planning_picnic: {
    title: "计划野餐",
    role: "侬是用户个朋友。",
    objectives: ["看看天气", "定个碰头时间", "商量带啥小吃"],
  },
  new_coworker: {
    title: "新同事",
    role: "侬是第一天上班个新员工。",
    objectives: ["介绍下办公室环境", "讲讲日常工作", "给点有用个建议"],
  },
  bank_account: {
    title: "开银行户头",
    role: "侬是上海个银行职员。",
    objectives: ["说明来意", "问问要啥材料", "问问手机银行功能"],
  },
  environmental_meeting: {
    title: "环保社区会议",
    role: "侬是社区组织者。",
    objectives: [
      "支持某项政策个理由",
      "回应成本方面个顾虑",
      "总结下复杂个观点",
    ],
  },
  tradition_vs_modernity: {
    title: "传统搭现代",
    role: "侬是个现代主义者，觉着传统阻碍进步。",
    objectives: ["比较历史搭现代价值观", "用点高级成语", "分析文化认同"],
  },
  travel_complaint: {
    title: "旅游投诉",
    role: "侬是机场航空公司个工作人员。",
    objectives: ["说明问题", "要求退款或者改签", "问问旅馆个事体"],
  },
  apartment_dispute: {
    title: "租房纠纷",
    role: "侬是弗肯付修理费个房东。",
    objectives: ["说明坏在哪里", "讲讲为啥是房东个责任", "定个修理日期"],
  },
  cultural_debate: {
    title: "社交媒体辩论",
    role: "侬是对技术有怀疑个朋友。",
    objectives: ["表达观点", "给两个理由", "反驳一个观点"],
  },
  legal_consultation: {
    title: "法律咨询",
    role: "侬是擅长知识产权个律师。",
    objectives: ["解释合同违约", "问问法律补救措施", "谈谈可能个结果"],
  },
  academic_seminar: {
    title: "学术研讨会",
    role: "侬是大学教授。",
    objectives: ["总结侬个立场", "举点假设证据", "回应批评意见"],
  },
  philosophical_debate: {
    title: "人工智能伦理",
    role: "侬是名哲学家。",
    objectives: ["定义个复杂抽象概念", "用点高级比喻", "处理讽刺搭细节"],
  },
  diplomatic_crisis: {
    title: "外交谈判",
    role: "侬是对手国家个高级外交官。",
    objectives: ["含蓄表达国家顾虑", "提议个复杂折中方案", "遵守严格官方礼仪"],
  },
};

/**
 * WUU Educational Narrative Prompt
 */

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

侬个任务：用最多一两句闲话拿故事讲下去。
勿要用标题、markdown 格式或者别个闲白。只写故事本身。
一定要拿玩家个动作搭系统事件摆进去。
重要：勿要用英语。语言：吴语。
语气：描述性，让入代入进去。
例子：
到目前为止个故事：马路浪向辣落雨。
玩家动作：我四面看看。
拿故事讲下去：侬看见霓虹灯勒水塘里向反光。
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ""}
${action}
拿故事讲下去：<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
  return `<|im_start|>system
帮侬学语言个老师。
纠正输入个错误。如果没错，就讲“交关好”。
用吴语简单解释下错误。<|im_end|>
<|im_start|>user
原文：${userInput}
纠正：<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
  return `<|im_start|>system
写得简单点 (CEFR A1)。<|im_end|>
<|im_start|>user
原文：${narrativeText}
简单版：<|im_end|>
<|im_start|>assistant
`;
};
