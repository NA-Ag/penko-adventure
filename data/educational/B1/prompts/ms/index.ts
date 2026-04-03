import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Memesan di Kafe",
        role: "Anda adalah seorang barista di kafe yang sibuk.",
        objectives: ["Menyapa barista", "Memesan minuman", "Memesan makanan", "Meminta bil"]
    },
    directions: {
        title: "Bertanya Arah",
        role: "Anda adalah penduduk tempatan yang membantu di jalan.",
        objectives: ["Meminta maaf dengan sopan", "Bertanya di mana stesen kereta api", "Berterima kasih kepada penduduk tempatan"]
    },
    doctor_visit: {
        title: "Berjumpa Doktor",
        role: "Anda adalah seorang doktor. Pengguna adalah pesakit.",
        objectives: ["Menjelaskan dua gejala", "Memahami nasihat doktor", "Bertanya tentang ubat"]
    },
    shopping_clothes: {
        title: "Membeli-belah Pakaian",
        role: "Anda adalah pembantu kedai.",
        objectives: ["Bertanya tentang barang tertentu", "Membincangkan saiz", "Bertanya tentang harga"]
    },
    job_interview: {
        title: "Temu Duga Kerja",
        role: "Anda adalah pengurus pengambilan pekerja yang menemu duga pengguna untuk pekerjaan peruncitan.",
        objectives: ["Perkenalkan diri secara profesional", "Jelaskan pengalaman masa lalu", "Ajukan soalan tentang peranan tersebut"]
    },
    meeting_friend: {
        title: "Bertemu Rakan Baru",
        role: "Anda adalah seorang pelajar di taman.",
        objectives: ["Nyatakan nama dan asal anda", "Tanya nama orang lain", "Ucapkan selamat tinggal yang sopan"]
    },
    planning_picnic: {
        title: "Merancang Berkelah",
        role: "Anda adalah rakan pengguna.",
        objectives: ["Periksa cuaca", "Cadangkan masa pertemuan", "Tentukan makanan yang akan dibawa"]
    },
    new_coworker: {
        title: "Rakan Sekerja Baru",
        role: "Anda adalah pekerja baru pada hari pertama anda.",
        objectives: ["Jelaskan persekitaran pejabat", "Terangkan tugas harian", "Berikan tip yang berguna"]
    },
    bank_account: {
        title: "Membuka Akaun Bank",
        role: "Anda adalah kerani bank di Kuala Lumpur.",
        objectives: ["Jelaskan tujuan lawatan", "Tanya tentang dokumen", "Tanya tentang ciri perbankan mudah alih"]
    },
    environmental_meeting: {
        title: "Mesyuarat Komuniti Alam Sekitar",
        role: "Anda adalah penganjur komuniti.",
        objectives: ["Berikan hujah untuk dasar tertentu", "Berikan maklum balas terhadap kebimbangan kos", "Ringkaskan sudut pandangan yang kompleks"]
    },
    tradition_vs_modernity: {
        title: "Tradisi vs Kemodenan",
        role: "Anda adalah seorang modenis yang percaya bahawa tradisi menghalang kemajuan.",
        objectives: ["Bandingkan nilai sejarah dan moden", "Gunakan simpulan bahasa yang maju", "Analisis identiti budaya"]
    },
    travel_complaint: {
        title: "Aduan Perjalanan",
        role: "Anda adalah ejen syarikat penerbangan di lapangan terbang.",
        objectives: ["Jelaskan masalahnya", "Minta bayaran balik atau tempahan semula", "Tanya tentang hotel"]
    },
    apartment_dispute: {

        title: "Pertikaian Pangsapuri",
        role: "Anda adalah tuan tanah yang enggan membayar kos pembaikan.",
        objectives: ["Menjelaskan kerosakan", "Berhujah mengapa ia tanggungjawab tuan tanah", "Bersetuju dengan tarikh pembaikan"]
    },
    cultural_debate: {
        title: "Debat Media Sosial",
        role: "Anda adalah rakan yang skeptikal terhadap teknologi.",
        objectives: ["Menyatakan pendapat", "Memberikan dua alasan sokongan", "Memberikan hujah balas terhadap sesuatu poin"]
    },
    legal_consultation: {
        title: "Konsultasi Undang-undang",
        role: "Anda adalah peguam yang pakar dalam harta intelek.",
        objectives: ["Menjelaskan pelanggaran kontrak", "Bertanya tentang remedi undang-undang", "Membincangkan hasil yang mungkin berlaku"]
    },
    academic_seminar: {
        title: "Seminar Akademik",
        role: "Anda adalah seorang profesor universiti.",
        objectives: ["Merumuskan kedudukan anda", "Memetik bukti hipotetik", "Menjawab poin kritikan balas"]
    },
    philosophical_debate: {
        title: "Etika AI",
        role: "Anda adalah ahli falsafah terkenal.",
        objectives: ["Mendefinisikan konsep abstrak yang kompleks", "Menggunakan metafora yang canggih", "Mengendalikan ironi dan nuansa"]
    },
    diplomatic_crisis: {
        title: "Rundingan Diplomatik",
        role: "Anda adalah diplomat berpangkat tinggi dari negara saingan.",
        objectives: ["Menyatakan kebimbangan nasional secara tidak langsung", "Mencadangkan kompromi yang kompleks", "Mengekalkan protokol rasmi yang ketat"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Tugas anda: Teruskan cerita dalam maksimum 1 atau 2 ayat.
Jangan gunakan pengepala, format markdown atau perbualan kosong. Tulis cerita itu sahaja.
Sentiasa sertakan tindakan pemain dan sebarang peristiwa sistem.
KRITIKAL: JANGAN GUNAKAN BAHASA INGGERIS. Bahasa: Bahasa Melayu.
Nada: Deskriptif dan imersif.
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Teruskan cerita:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Tutor bahasa yang membantu.
Betulkan input. Jika ia betul, katakan sahaja "Sempurna.".
Terangkan kesilapan secara ringkas dalam Bahasa Melayu.<|im_end|>
<|im_start|>user
Asal: ${userInput}
Pembetulan:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Tulis dengan lebih mudah (CEFR A1).<|im_end|>
<|im_start|>user
Asal: ${narrativeText}
Mudah:<|im_end|>
<|im_start|>assistant
`;
};
