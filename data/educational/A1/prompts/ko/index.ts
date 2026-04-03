import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "카페에서 주문하기",
        role: "당신은 바쁜 카페의 바리스타입니다.",
        objectives: ["바리스타에게 인사하기", "음료 주문하기", "음식 주문하기", "계산서 요청하기"]
    },
    directions: {
        title: "길 묻기",
        role: "당신은 거리에서 도와주는 현지인입니다.",
        objectives: ["정중하게 실례를 구하기", "기차역 위치 묻기", "현지인에게 감사 인사하기"]
    },
    doctor_visit: {
        title: "병원에서",
        role: "당신은 의사입니다. 사용자는 환자입니다.",
        objectives: ["두 가지 증상 설명하기", "의사의 조언 이해하기", "약에 대해 문의하기"]
    },
    shopping_clothes: {
        title: "옷 쇼핑",
        role: "당신은 점원입니다.",
        objectives: ["특정 아이템 찾기", "사이즈 상의하기", "가격 묻기"]
    },
    job_interview: {
        title: "채용 면접",
        role: "당신은 소매업 직무를 위해 사용자를 면접하는 채용 담당자입니다.",
        objectives: ["전문적으로 자기소개하기", "과거 경험 설명하기", "직무에 대해 질문하기"]
    },
    meeting_friend: {
        title: "새로운 친구 만나기",
        role: "당신은 공원에 있는 학생입니다.",
        objectives: ["이름과 출신지 말하기", "상대방의 이름 묻기", "정중하게 작별 인사하기"]
    },
    planning_picnic: {
        title: "피크닉 계획하기",
        role: "당신은 사용자의 친구입니다.",
        objectives: ["날씨 확인하기", "만날 시간 제안하기", "가져갈 음식 결정하기"]
    },
    new_coworker: {
        title: "새로운 동료",
        role: "당신은 첫 출근한 신입 사원입니다.",
        objectives: ["사무실 환경 설명하기", "일과 업무 설명하기", "도움이 되는 팁 제공하기"]
    },
    bank_account: {
        title: "은행 계좌 개설",
        role: "당신은 서울의 은행원입니다.",
        objectives: ["방문 이유 설명하기", "필요 서류 문의하기", "모바일 뱅킹 기능 묻기"]
    },
    environmental_meeting: {
        title: "환경 커뮤니티 회의",
        role: "당신은 커뮤니티 주최자입니다.",
        objectives: ["특정 정책에 대해 주장하기", "비용 문제에 대응하기", "복잡한 관점 요약하기"]
    },
    tradition_vs_modernity: {
        title: "전통 vs 현대성",
        role: "당신은 전통이 발전을 저해한다고 믿는 현대주의자입니다.",
        objectives: ["역사적 가치와 현대적 가치 비교하기", "고급 관용구 사용하기", "문화적 정체성 분석하기"]
    },
    travel_complaint: {
        title: "여행 관련 불만",
        role: "당신은 공항의 항공사 직원입니다.",
        objectives: ["문제 설명하기", "환불 또는 재예약 요청하기", "호텔에 대해 문의하기"]
    },
    apartment_dispute: {
        title: "아파트 분쟁",
        role: "당신은 수리비 지불을 꺼리는 집주인입니다.",
        objectives: ["손상 부위 설명하기", "집주인의 책임인 이유 주장하기", "수리 날짜 합의하기"]
    },

    cultural_debate: {
        title: "소셜 미디어 토론",
        role: "당신은 기술에 회의적인 친구입니다.",
        objectives: ["의견 표현하기", "두 가지 근거 제시하기", "반대 의견에 반박하기"]
    },
    legal_consultation: {
        title: "법률 상담",
        role: "당신은 지적 재산권 전문 변호사입니다.",
        objectives: ["계약 위반 설명하기", "법적 구제 수단 문의하기", "가능한 결과 논의하기"]
    },
    academic_seminar: {
        title: "학술 세미나",
        role: "당신은 대학교수입니다.",
        objectives: ["입장 요약하기", "가설적 증거 인용하기", "비판적 질문에 답변하기"]
    },
    philosophical_debate: {
        title: "AI 윤리",
        role: "당신은 유명한 철학자입니다.",
        objectives: ["복잡한 추상적 개념 정의하기", "정교한 비유 사용하기", "반어법과 뉘앙스 다루기"]
    },
    diplomatic_crisis: {
        title: "외교 협상",
        role: "당신은 경쟁 국가의 고위 외교관입니다.",
        objectives: ["국가적 우려를 간접적으로 표현하기", "복잡한 타협안 제안하기", "엄격한 공식 의전 준수하기"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

당신의 임무: 이야기를 정확히 1개의 짧은 문장으로 이어가세요.
이야기 본문만 작성하세요. 헤더나 설명은 생략하세요.
마지막에 [ROMANIZATION: phonetic sounds]를 포함하세요.
중요: 영어를 사용하지 마세요. 언어: 한국어.
톤: 밝고 매우 단순함 (CEFR A1).
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
1문장:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
단순한 언어 튜터. 입력 내용을 수정하세요. 올바른 경우 "완벽합니다."라고 말하세요.<|im_end|>
<|im_start|>user
원본: ${userInput}
수정:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
더 단순하게 만드세요 (3~5개 단어).<|im_end|>
<|im_start|>user
원본: ${narrativeText}
단순화:<|im_end|>
<|im_start|>assistant
`;
};
