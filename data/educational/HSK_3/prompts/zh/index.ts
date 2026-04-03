import { Scenario } from "../../frameworks/types";

export const LOCALIZED_SCENARIOS: Record<string, any> = {
  cafe_order: {
    title: "在咖啡馆点餐",
    role: "您是繁忙咖啡馆的咖啡师。",
    objectives: ["向咖啡师问好", "点一杯饮料", "点食物", "买单"],
  },
  directions: {
    title: "问路",
    role: "您是街上一位热心的当地人。",
    objectives: ["礼貌地打招呼", "询问火车站的位置", "感谢当地人"],
  },
  doctor_visit: {
    title: "看医生",
    role: "您是医生。用户是病人。",
    objectives: ["描述两个症状", "理解医生的建议", "询问药物情况"],
  },
  shopping_clothes: {
    title: "买衣服",
    role: "您是店员。",
    objectives: ["询问特定的商品", "讨论尺寸", "询问价格"],
  },
  job_interview: {
    title: "求职面试",
    role: "您是招聘经理，正在面试用户的一份零售工作。",
    objectives: ["专业的自我介绍", "描述过去的经验", "询问一个关于岗位的问题"],
  },
  meeting_friend: {
    title: "结识新朋友",
    role: "您是公园里的一名学生。",
    objectives: ["介绍自己的姓名和背景", "询问对方的名字", "有礼貌地告别"],
  },
  planning_picnic: {
    title: "计划野餐",
    role: "您是用户的朋友。",
    objectives: ["查看天气", "建议见面时间", "决定带什么食物"],
  },
  new_coworker: {
    title: "新同事",
    role: "您是第一天入职的新员工。",
    objectives: ["描述办公环境", "解释日常任务", "提供一个有用的建议"],
  },
  bank_account: {
    title: "开立银行账户",
    role: "您是北京的一名银行职员。",
    objectives: ["说明访问原因", "查询所需文件", "询问手机银行功能"],
  },
  environmental_meeting: {
    title: "环境社区会议",
    role: "您是社区组织者。",
    objectives: ["支持某项特定政策", "回应成本担忧", "总结复杂的观点"],
  },
  tradition_vs_modernity: {
    title: "传统与现代",
    role: "您是一位认为传统阻碍进步的现代主义者。",
    objectives: ["比较历史和现代价值观", "使用高级成语", "分析文化身份"],
  },
  travel_complaint: {
    title: "旅行投诉",
    role: "您是机场的航空公司代理。",
    objectives: ["解释问题", "要求退款或重新预订", "询问酒店情况"],
  },
  apartment_dispute: {
    title: "公寓纠纷",
    role: "您是一位不愿支付维修费用的房东。",
    objectives: ["描述损坏情况", "争论为什么这是房东的责任", "商定维修日期"],
  },
  cultural_debate: {
    title: "社交媒体辩论",
    role: "您是一位对技术持怀疑态度的朋友。",
    objectives: ["发表观点", "提供两个支持理由", "反驳一个观点"],
  },
  legal_consultation: {
    title: "法律咨询",
    role: "您是专门从事知识产权的律师。",
    objectives: ["解释违反合同的情况", "询问法律补救措施", "讨论可能的结果"],
  },
  academic_seminar: {
    title: "学术研讨会",
    role: "您是大学教授。",
    objectives: ["总结你的立场", "引用假设证据", "回应批评意见"],
  },
  philosophical_debate: {
    title: "人工智能伦理",
    role: "您是著名哲学家。",
    objectives: [
      "定义一个复杂的抽象概念",
      "使用高深的隐喻",
      "处理讽刺和细微差别",
    ],
  },
  diplomatic_crisis: {
    title: "外交谈判",
    role: "您是来自竞争对手国家的高级外交官。",
    objectives: [
      "间接表达国家关切",
      "提出复杂的妥协方案",
      "维持严格的正式礼节",
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

你是“Penko”，${theme}的游戏主持人。
任务：继续故事，最多1到2个句子。
结合玩家动作和系统事件。
极度重要：不要使用英文。只能用中文回复。
语气：描述性且身临其境。
例子：
到目前为止的故事: 雨落在街道上。
玩家动作: 我四处看看。
继续故事: 你看到霓虹灯映在水洼里。
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ""}
${action}
继续故事:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
  return `<|im_start|>system
语言导师。改正错误。如果没有错误，说“完美”。<|im_end|>
<|im_start|>user
原文: ${userInput}
改正:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
  return `<|im_start|>system
使其更简单（CEFR A1级别）。<|im_end|>
<|im_start|>user
原文: ${narrativeText}
简化后:<|im_end|>
<|im_start|>assistant
`;
};
