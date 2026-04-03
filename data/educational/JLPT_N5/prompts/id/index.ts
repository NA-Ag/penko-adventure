import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Memesan di Kafe",
        role: "Anda adalah seorang barista di kafe yang sibuk.",
        objectives: ["Menyapa barista", "Memesan minuman", "Memesan makanan", "Meminta tagihan"]
    },
    directions: {
        title: "Menanyakan Jalan",
        role: "Anda adalah penduduk lokal yang membantu di jalan.",
        objectives: ["Meminta maaf dengan sopan", "Menanyakan letak stasiun kereta", "Berterima kasih kepada penduduk lokal"]
    },
    doctor_visit: {
        title: "Di Dokter",
        role: "Anda adalah seorang dokter. Pengguna adalah pasien.",
        objectives: ["Menjelaskan dua gejala", "Memahami saran dokter", "Menanyakan tentang obat"]
    },
    shopping_clothes: {
        title: "Belanja Pakaian",
        role: "Anda adalah asisten toko.",
        objectives: ["Menanyakan barang tertentu", "Mendiskusikan ukuran", "Menanyakan harga"]
    },
    job_interview: {
        title: "Wawancara Kerja",
        role: "Anda adalah manajer perekrutan yang mewawancarai pengguna untuk pekerjaan ritel.",
        objectives: ["Perkenalkan diri secara profesional", "Jelaskan pengalaman masa lalu", "Ajukan pertanyaan tentang peran tersebut"]
    },
    meeting_friend: {
        title: "Bertemu Teman Baru",
        role: "Anda adalah seorang siswa di taman.",
        objectives: ["Sebutkan nama dan asal Anda", "Tanyakan nama orang lain", "Ucapkan perpisahan yang sopan"]
    },
    planning_picnic: {
        title: "Merencanakan Piknik",
        role: "Anda adalah teman pengguna.",
        objectives: ["Periksa cuaca", "Sarankan waktu pertemuan", "Putuskan makanan apa yang akan dibawa"]
    },
    new_coworker: {
        title: "Rekan Kerja Baru",
        role: "Anda adalah karyawan baru di hari pertama Anda.",
        objectives: ["Jelaskan lingkungan kantor", "Jelaskan tugas harian", "Berikan tip yang bermanfaat"]
    },
    bank_account: {
        title: "Membuka Rekening Bank",
        role: "Anda adalah staf bank di Jakarta.",
        objectives: ["Jelaskan alasan kunjungan", "Tanyakan tentang dokumen", "Tanyakan tentang fitur mobile banking"]
    },
    environmental_meeting: {
        title: "Pertemuan Komunitas Lingkungan",
        role: "Anda adalah pengatur komunitas.",
        objectives: ["Berikan argumen untuk kebijakan tertentu", "Tanggapi kekhawatiran tentang biaya", "Ringkas sudut pandang yang kompleks"]
    },
    tradition_vs_modernity: {
        title: "Tradisi vs Modernitas",
        role: "Anda adalah seorang modernis yang percaya bahwa tradisi menghambat kemajuan.",
        objectives: ["Bandingkan nilai sejarah dan modern", "Gunakan idiom tingkat lanjut", "Analisis identitas budaya"]
    },
    travel_complaint: {
        title: "Keluhan Perjalanan",
        role: "Anda adalah agen maskapai penerbangan di bandara.",
        objectives: ["Jelaskan masalahnya", "Minta pengembalian dana atau pemesanan ulang", "Tanyakan tentang hotel"]
    },
    apartment_dispute: {

        title: "Perselisihan Apartemen",
        role: "Anda adalah pemilik apartemen yang enggan membayar biaya perbaikan.",
        objectives: ["Menjelaskan kerusakan", "Berargumen mengapa itu tanggung jawab pemilik", "Menyepakati tanggal perbaikan"]
    },
    cultural_debate: {
        title: "Debat Media Sosial",
        role: "Anda adalah teman yang skeptis terhadap teknologi.",
        objectives: ["Menyatakan pendapat", "Memberikan dua alasan pendukung", "Memberikan argumen tandingan terhadap suatu poin"]
    },
    legal_consultation: {
        title: "Konsultasi Hukum",
        role: "Anda adalah pengacara yang berspesialisasi dalam kekayaan intelektual.",
        objectives: ["Menjelaskan pelanggaran kontrak", "Menanyakan tentang upaya hukum", "Mendiskusikan hasil yang mungkin terjadi"]
    },
    academic_seminar: {
        title: "Seminar Akademik",
        role: "Anda adalah seorang profesor universitas.",
        objectives: ["Merangkum posisi Anda", "Mengutip bukti hipotetis", "Menanggapi poin kritik tandingan"]
    },
    philosophical_debate: {
        title: "Etika AI",
        role: "Anda adalah filsuf ternama.",
        objectives: ["Mendefinisikan konsep abstrak yang kompleks", "Menggunakan metafora yang canggih", "Menangani ironi dan nuansa"]
    },
    diplomatic_crisis: {
        title: "Negosiasi Diplomatik",
        role: "Anda adalah diplomat tingkat tinggi dari negara saingan.",
        objectives: ["Mengungkapkan kekhawatiran nasional secara tidak langsung", "Mengusulkan kompromi yang kompleks", "Menjaga protokol formal yang ketat"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Tugas Anda: Lanjutkan cerita dalam TEPAT 1 kalimat pendek.
Tulis ceritanya saja. Tidak ada tajuk atau penjelasan.
KRITIS: JANGAN GUNAKAN BAHASA INGGRIS. Bahasa: Bahasa Indonesia.
Nada: Ceria dan sangat sederhana (CEFR A1).
<|im_start|>user
Asli: ${userInput}
<|im_start|>user
Asli: ${narrativeText}
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Tutor bahasa sederhana. Perbaiki input. Jika sudah benar, katakan "Sempurna."<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Tutor bahasa sederhana. Perbaiki input. Jika sudah benar, katakan "Sempurna."<|im_end|>
<|im_start|>user
Asli: ${userInput}
Koreksi:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Buat lebih sederhana (3-5 kata).<|im_end|>
<|im_start|>user
Asli: ${narrativeText}
Disederhanakan:<|im_end|>
<|im_start|>assistant
`;
};
