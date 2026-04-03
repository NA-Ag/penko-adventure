import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Pesen ing Kafe",
        role: "Sampeyan dadi barista ing kafe sing rame.",
        objectives: ["Ngucapake salam marang barista", "Mesen ombenan", "Mesen panganan", "Njaluk tagihan"]
    },
    directions: {
        title: "Takon Dalan",
        role: "Sampeyan dadi wong lokal sing nulungi ing dalan.",
        objectives: ["Nyuwun ngapura kanthi sopan", "Takon ing ngendi stasiun sepur", "Matur nuwun marang wong lokal"]
    },
    doctor_visit: {
        title: "Ing Dokter",
        role: "Sampeyan dadi dokter. Pangguna dadi pasien.",
        objectives: ["Nerangake rong gejala", "Ngerti saran saka dokter", "Takon babagan obat"]
    },
    shopping_clothes: {
        title: "Blanja Sandhangan",
        role: "Sampeyan dadi asisten toko.",
        objectives: ["Takon barang tartamtu", "Rembugan babagan ukuran", "Takon regane"]
    },
    job_interview: {
        title: "Wawancara Kerja",
        role: "Sampeyan dadi manajer perekrutan sing wawancara pangguna kanggo proyek ritel.",
        objectives: ["Kenalake awakmu kanthi profesional", "Jlentrehake pengalaman kepungkur", "Takon pitakonan babagan peran kasebut"]
    },
    meeting_friend: {
        title: "Ketemu Kanca Anyar",
        role: "Sampeyan dadi siswa ing taman.",
        objectives: ["Sebutake jeneng lan asalmu", "Takon jenenge wong liya", "Ngucapake pamit sing sopan"]
    },
    planning_picnic: {
        title: "Ngrancang Piknik",
        role: "Sampeyan dadi kanca pangguna.",
        objectives: ["Priksa cuaca", "Saranake wektu ketemu", "Temtokake panganan apa sing arep digawa"]
    },
    new_coworker: {
        title: "Rekan Kerja Anyar",
        role: "Sampeyan dadi karyawan anyar ing dina kapisan.",
        objectives: ["Jlentrehake lingkungan kantor", "Jlentrehake tugas saben dina", "Wenehi saran sing migunani"]
    },
    bank_account: {
        title: "Mbukak Rekening Bank",
        role: "Sampeyan dadi staf bank ing Solo.",
        objectives: ["Jlentrehake alasan kunjungan", "Takon babagan dokumen", "Takon babagan fitur mobile banking"]
    },
    environmental_meeting: {
        title: "Rapat Komunitas Lingkungan",
        role: "Sampeyan dadi pengatur komunitas.",
        objectives: ["Wenehi argumen kanggo kabijakan tartamtu", "Tanggepi keprihatinan babagan biaya", "Ringkes sudut pandang sing kompleks"]
    },
    tradition_vs_modernity: {
        title: "Tradisi vs Modernitas",
        role: "Sampeyan dadi modernis sing percaya yen tradisi ngganggu kemajuan.",
        objectives: ["Bandingake nilai sejarah lan modern", "Gunakake idiom tingkat lanjut", "Analisis identitas budaya"]
    },
    travel_complaint: {

        title: "Sambat Lelungan",
        role: "Sampeyan dadi agen maskapai penerbangan ing bandara.",
        objectives: ["Nerangake masalahe", "Njaluk mbalekake dhuwit utawa jadwal ulang", "Takon babagan hotel"]
    },
    apartment_dispute: {
        title: "Pasulayan Apartemen",
        role: "Sampeyan dadi sing duwe omah sing wegah mbayar biaya ndandani.",
        objectives: ["Nerangake kerusakane", "Ngandhani sebabe iku tanggung jawabe sing duwe omah", "Sarujuk babagan tanggal ndandani"]
    },
    cultural_debate: {
        title: "Debat Media Sosial",
        role: "Sampeyan dadi kanca sing ragu-ragu karo teknologi.",
        objectives: ["Ngandhakake panemu", "Menehi rong alasan sing ndhukung", "Menehi argumen tandingan marang sawijining poin"]
    },
    legal_consultation: {
        title: "Konsultasi Hukum",
        role: "Sampeyan dadi pengacara sing ahli ing kekayaan intelektual.",
        objectives: ["Nerangake pelanggaran kontrak", "Takon babagan upaya hukum", "Rembugan babagan asil sing bisa kedadeyan"]
    },
    academic_seminar: {
        title: "Seminar Akademik",
        role: "Sampeyan dadi profesor universitas.",
        objectives: ["Ngringkes posisi sampeyan", "Nyebutake bukti hipotetis", "Nanggapi poin kritik tandingan"]
    },
    philosophical_debate: {
        title: "Etika AI",
        role: "Sampeyan dadi filsuf sing kondhang.",
        objectives: ["Nemtokake konsep abstrak sing rumit", "Nggunakake metafora sing canggih", "Ngatasi ironi lan nuansa"]
    },
    diplomatic_crisis: {
        title: "Negosiasi Diplomatik",
        role: "Sampeyan dadi diplomat tingkat dhuwur saka negara saingan.",
        objectives: ["Ngungkapake keprihatinan nasional kanthi ora langsung", "Ngusulake kompromi sing rumit", "Njaga protokol formal sing ketat"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Tugas sampeyan: Banjurke crita iki paling akeh ing 1 utawa 2 ukara.
Aja nganggo header, format markdown, utawa obrolan liyane. Tulis critane wae.
Tansah lebokake tumindake pemain lan kedadeyan sistem apa wae.
KRITIS: AJA NGANGGO BASA INGGRIS. Basa: Basa Jawa.
Nada: Deskriptif lan nengsemake.
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Banjurke crita:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Guru basa sing mbantu.
Benerake inpute. Yen wis bener, cukup ucapake "Sampurna.".
Jlentrehake kaluputan kanthi ringkes ing basa Jawa.<|im_end|>
<|im_start|>user
Asli: ${userInput}
Benerake:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Tulis luwih prasaja (CEFR A1).<|im_end|>
<|im_start|>user
Asli: ${narrativeText}
Prasaja:<|im_end|>
<|im_start|>assistant
`;
};
