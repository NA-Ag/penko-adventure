import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Kêu món tại Quán Cà phê",
        role: "Bạn là một nhân viên pha chế (barista) tại một quán cà phê đông đúc.",
        objectives: ["Chào nhân viên pha chế", "Gọi một món đồ uống", "Gọi món ăn", "Yêu cầu hóa đơn"]
    },
    directions: {
        title: "Hỏi đường",
        role: "Bạn là một người dân địa phương nhiệt tình trên đường phố.",
        objectives: ["Xin lỗi lịch sự", "Hỏi ga tàu ở đâu", "Cảm ơn người dân địa phương"]
    },
    doctor_visit: {
        title: "Tại phòng khám",
        role: "Bạn là bác sĩ. Người dùng là bệnh nhân.",
        objectives: ["Mô tả hai triệu chứng", "Hiểu lời khuyên của bác sĩ", "Hỏi về thuốc"]
    },
    shopping_clothes: {
        title: "Mua sắm quần áo",
        role: "Bạn là nhân viên bán hàng.",
        objectives: ["Hỏi về một món đồ cụ thể", "Thảo luận về kích cỡ", "Hỏi về giá cả"]
    },
    job_interview: {
        title: "Phỏng vấn xin việc",
        role: "Bạn là một quản lý tuyển dụng đang phỏng vấn người dùng cho một công việc bán lẻ.",
        objectives: ["Giới thiệu bản thân một cách chuyên nghiệp", "Mô tả kinh nghiệm trong quá khứ", "Đặt một câu hỏi về vai trò"]
    },
    meeting_friend: {
        title: "Gặp gỡ một người bạn mới",
        role: "Bạn là một sinh viên trong công viên.",
        objectives: ["Nêu tên và nguồn gốc của bạn", "Hỏi tên người kia", "Chào tạm biệt một cách lịch sự"]
    },
    planning_picnic: {
        title: "Lập kế hoạch đi dã ngoại",
        role: "Bạn là bạn của người dùng.",
        objectives: ["Kiểm tra thời tiết", "Gợi ý thời gian gặp mặt", "Quyết định mang theo đồ ăn gì"]
    },
    new_coworker: {
        title: "Đồng nghiệp mới",
        role: "Bạn là một nhân viên mới trong ngày đầu tiên đi làm.",
        objectives: ["Mô tả môi trường văn phòng", "Giải thích các nhiệm vụ hàng ngày", "Đưa ra một mẹo hữu ích"]
    },
    bank_account: {
        title: "Mở tài khoản ngân hàng",
        role: "Bạn là một nhân viên ngân hàng ở Hà Nội.",
        objectives: ["Giải thích lý do đến thăm", "Hỏi về các giấy tờ", "Hỏi về các tính năng ngân hàng di động"]
    },
    environmental_meeting: {
        title: "Cuộc họp cộng đồng về môi trường",
        role: "Bạn là một người tổ chức cộng đồng.",
        objectives: ["Đưa ra lập luận cho một chính sách cụ thể", "Phản hồi các lo ngại về chi phí", "Tóm tắt một quan điểm phức tạp"]
    },
    tradition_vs_modernity: {
        title: "Truyền thống vs Hiện đại",
        role: "Bạn là một người theo chủ nghĩa hiện đại tin rằng truyền thống cản trở sự tiến bộ.",
        objectives: ["So sánh các giá trị lịch sử và hiện đại", "Sử dụng các thành ngữ nâng cao", "Phân tích bản sắc văn hóa"]
    },
    travel_complaint: {
        title: "Khiếu nại về chuyến đi",
        role: "Bạn là một đại lý hàng không tại sân bay.",
        objectives: ["Giải thích vấn đề", "Yêu cầu hoàn tiền hoặc đặt lại vé", "Hỏi về khách sạn"]
    },
    apartment_dispute: {
        title: "Tranh chấp căn hộ",
        role: "Bạn là một chủ nhà đang do dự trong việc thanh toán phí sửa chữa.",
        objectives: ["Mô tả thiệt hại", "Lập luận tại sao đó là trách nhiệm của chủ nhà", "Thống nhất ngày sửa chữa"]
    },
    cultural_debate: {

        title: "Tranh luận về mạng xã hội",
        role: "Bạn là một người bạn hoài nghi về công nghệ.",
        objectives: ["Nêu ý kiến", "Đưa ra hai lý do hỗ trợ", "Phản biện một quan điểm"]
    },
    legal_consultation: {
        title: "Tư vấn pháp lý",
        role: "Bạn là luật sư chuyên về sở hữu trí tuệ.",
        objectives: ["Giải thích việc vi phạm hợp đồng", "Hỏi về các biện pháp khắc phục pháp lý", "Thảo luận về các kết quả có thể xảy ra"]
    },
    academic_seminar: {
        title: "Hội thảo học thuật",
        role: "Bạn là giáo sư đại học.",
        objectives: ["Tóm tắt lập trường của bạn", "Trích dẫn bằng chứng giả thuyết", "Trả lời một ý kiến phản biện"]
    },
    philosophical_debate: {
        title: "Đạo đức của AI",
        role: "Bạn là một triết gia nổi tiếng.",
        objectives: ["Định nghĩa một khái niệm trừu tượng phức tạp", "Sử dụng các phép ẩn dụ tinh tế", "Xử lý sự mỉa mai và sắc thái"]
    },
    diplomatic_crisis: {
        title: "Đàm phán ngoại giao",
        role: "Bạn là một nhà ngoại giao cấp cao từ một quốc gia đối địch.",
        objectives: ["Bày tỏ các mối quan ngại quốc gia một cách gián tiếp", "Đề xuất một thỏa hiệp phức tạp", "Duy trì nghi thức ngoại giao nghiêm ngặt"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Nhiệm vụ của bạn: Tiếp tục câu chuyện trong ĐÚNG 1 câu ngắn.
Chỉ viết câu chuyện. Không có tiêu đề hay giải thích.
KRITIKAL: KHÔNG SỬ DỤNG TIẾNG ANH. Ngôn ngữ: Tiếng Việt.
Tông giọng: Vui vẻ và rất đơn giản (CEFR A1).
Ví dụ:
Câu chuyện cho đến nay: Mưa rơi trên phố.
Hành động của người chơi: Tôi nhìn quanh.
<|im_start|>user
Bản gốc: ${userInput}
<|im_start|>user
Bản gốc: ${narrativeText}
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Gia sư ngôn ngữ đơn giản. Sửa lỗi đầu vào. Nếu nó đúng, hãy nói "Hoàn hảo."<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Gia sư ngôn ngữ đơn giản. Sửa lỗi đầu vào. Nếu nó đúng, hãy nói "Hoàn hảo."<|im_end|>
<|im_start|>user
Bản gốc: ${userInput}
Sửa lỗi:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Làm cho nó đơn giản hơn (3-5 từ).<|im_end|>
<|im_start|>user
Bản gốc: ${narrativeText}
Đơn giản hóa:<|im_end|>
<|im_start|>assistant
`;
};
