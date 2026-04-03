import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Mesen di Kafé",
        role: "Anjeun barista di kafé anu sibuk.",
        objectives: ["Ngucapkeun salam ka barista", "Mesen inuman", "Mesen kadaharan", "Menta tagihan"]
    },
    directions: {
        title: "Nanya Jalan",
        role: "Anjeun urang lokal anu bageur di jalan.",
        objectives: ["Menta maap kalayan sopan", "Nanya dimana stasion kareta", "Nuhunkeun ka urang lokal"]
    },
    doctor_visit: {
        title: "Ka Dokter",
        role: "Anjeun dokter. Pamaké téh pasién.",
        objectives: ["Ngajelaskeun dua gejala", "Ngartos naséhat dokter", "Nanya ngeunaan ubar"]
    },
    shopping_clothes: {
        title: "Balanja Pakéan",
        role: "Anjeun asistén toko.",
        objectives: ["Nanya barang anu tangtu", "Ngabahas ukuran", "Nanya harga"]
    },
    job_interview: {
        title: "Wawancara Gawé",
        role: "Anjeun manajer SDM anu ngawawancara pamaké pikeun gawé ritél.",
        objectives: ["Nepakeun diri sacara profésional", "Ngajelaskeun pangalaman baheula", "Nanya hiji patarosan ngeunaan pagawéan"]
    },
    meeting_friend: {
        title: "Papanggih Babaturan Anyar",
        role: "Anjeun murid di taman.",
        objectives: ["Sebutkeun ngaran jeung asal anjeun", "Tanya ngaran jalma séjén", "Ucapkeun pamitan anu sopan"]
    },
    planning_picnic: {
        title: "Ngarancang Piknik",
        role: "Anjeun babaturan pamaké.",
        objectives: ["Pariksa cuaca", "Saran waktu pasamoan", "Mutuskeun naon dahareun mawa"]
    },
    new_coworker: {
        title: "Rekan Gawé Anyar",
        role: "Anjeun karyawan anyar dina dinten munggaran anjeun.",
        objectives: ["Jelaskeun lingkungan kantor", "Jelaskeun tugas sapopoé", "Masihan tip mantuan"]
    },
    bank_account: {
        title: "Muka Rekening Bank",
        role: "Anjeun staf bank di Bandung.",
        objectives: ["Jelaskeun alesan nganjang", "Tanya ngeunaan dokumén", "Naroskeun ngeunaan fitur mobile banking"]
    },
    environmental_meeting: {
        title: "Pasamoan Komunitas Lingkungan",
        role: "Anjeun pangatur komunitas.",
        objectives: ["Masihan argumen pikeun kawijakan husus", "Ngaréspon kana masalah biaya", "Ringkeskeun sudut pandang anu kompleks"]
    },
    tradition_vs_modernity: {
        title: "Tradisi vs Modernitas",
        role: "Anjeun saurang modernis anu percaya yén tradisi ngahambat kamajuan.",
        objectives: ["Bandingkeun nilai sajarah jeung modern", "Paké idiom canggih", "Nganalisis identitas budaya"]
    },
    travel_complaint: {
        title: "Keluhan Perjalanan",
        role: "Anjeun agén maskapai di bandara.",
        objectives: ["Ngajelaskeun masalahna", "Menta ngabalikeun duit atawa jadwal ulang", "Nanya ngeunaan hotél"]
    },
    apartment_dispute: {
        title: "Pasulayan Apartemén",
        role: "Anjeun nu boga apartemén anu horéam mayar biaya perbaikan.",
        objectives: ["Ngajelaskeun karuksakan", "Ngabantah naha éta tanggung jawab nu boga apartemén", "Satuju kana tanggal perbaikan"]
    },
    cultural_debate: {
        title: "Debat Média Sosial",
        role: "Anjeun babaturan anu skeptis kana téknologi.",
        objectives: ["Nyatakeun pendapat", "Méré dua alesan anu ngarojong", "Méré argumén tandingan kana hiji poin"]
    },
    legal_consultation: {
        title: "Konsultasi Hukum",
        role: "Anjeun pengacara anu ahli dina kekayaan intelektual.",
        objectives: ["Ngajelaskeun palanggaran kontrak", "Nanya ngeunaan upaya hukum", "Ngabahas hasil anu mungkin lumangsung"]
    },
    academic_seminar: {
        title: "Saminar Akadémik",
        role: "Anjeun profésor universitas.",
        objectives: ["Ngaringkes posisi anjeun", "Nyebutkeun bukti hipotétis", "Ngajawab poin kritik tandingan"]
    },
    philosophical_debate: {
        title: "Étika AI",
        role: "Anjeun filsuf anu kawentar.",
        objectives: ["Nangtukeun konsép abstrak anu rumit", "Ngagunakeun métafora anu canggih", "Nanganan ironi jeung nuansa"]
    },
    diplomatic_crisis: {
        title: "Négosiasi Diplomatik",
        role: "Anjeun diplomat tingkat luhur ti nagara saingan.",
        objectives: ["Nganyatakeun kahariwang nasional sacara teu langsung", "Ngusulkeun kompromi anu rumit", "Ngajaga protokol formal anu ketat"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Tugas anjeun: Nuluykeun carita dina PAS 1 kalimah pondok.
Tulis caritana wungkul. Teu aya lulugu atanapi guaran.
KRITIS: ULAH NGAGUNAKEUN BASA INGGRIS. Basa: Sunda.
Nada: Bingah sareng saderhana pisan (CEFR A1).
<|im_start|>user
Asli: ${userInput}
<|im_start|>user
Asli: ${narrativeText}
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
1 kalimah:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Tutor basa saderhana. Benerkeun inputna. Upami leres, ucapkeun "Sampurna."<|im_end|>
<|im_start|>user
Asli: ${userInput}
Benerake:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Jantenkeun langkung saderhana (3-5 kecap).<|im_end|>
<|im_start|>user
Asli: ${narrativeText}
Basajan:<|im_end|>
<|im_start|>assistant
`;
};
