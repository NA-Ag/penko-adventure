import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Kafede Sipariş Vermek",
        role: "Kalabalık bir kafede baristasınız.",
        objectives: ["Baristayı selamlayın", "Bir içecek sipariş edin", "Yemek sipariş edin", "Hesabı isteyin"]
    },
    directions: {
        title: "Adres Sormak",
        role: "Sokakta yardımsever bir yerlisiniz.",
        objectives: ["Nazikçe özür dileyin", "Tren istasyonunun nerede olduğunu sorun", "Yerliye teşekkür edin"]
    },
    doctor_visit: {
        title: "Doktorda",
        role: "Doktorsunuz. Kullanıcı bir hastadır.",
        objectives: ["İki belirtiyi açıklayın", "Doktorun tavsiyesini anlayın", "İlaç hakkında soru sorun"]
    },
    shopping_clothes: {
        title: "Kıyafet Alışverişi",
        role: "Mağaza asistanısınız.",
        objectives: ["Belirli bir ürün isteyin", "Bedenleri tartışın", "Fiyatı sorun"]
    },
    job_interview: {
        title: "İş Mülakatı",
        role: "Perakende bir iş için kullanıcıyla mülakat yapan bir işe alım müdürüsünüz.",
        objectives: ["Kendinizi profesyonelce tanıtın", "Geçmiş deneyimlerinizi anlatın", "Pozisyon hakkında bir soru sorun"]
    },
    meeting_friend: {
        title: "Yeni Bir Arkadaşla Tanışma",
        role: "Parkta bir öğrencisiniz.",
        objectives: ["Adınızı ve nereli olduğunuzu söyleyin", "Diğer kişinin adını sorun", "Nazikçe veda edin"]
    },
    planning_picnic: {
        title: "Piknik Planlama",
        role: "Kullanıcının bir arkadaşısınız.",
        objectives: ["Hava durumunu kontrol edin", "Buluşma zamanı önerin", "Hangi yiyecekleri getireceğinize karar verin"]
    },
    new_coworker: {
        title: "Yeni İş Arkadaşı",
        role: "İlk gününüzde yeni bir çalışansınız.",
        objectives: ["Ofis ortamını anlatın", "Günlük görevleri açıklayın", "Faydalı bir ipucu verin"]
    },
    bank_account: {
        title: "Banka Hesabı Açma",
        role: "İstanbul'da bir banka memurusunuz.",
        objectives: ["Ziyaret nedenini açıklayın", "Belgeler hakkında bilgi alın", "Mobil bankacılık özellikleri hakkında soru sorun"]
    },
    environmental_meeting: {
        title: "Çevre Topluluğu Toplantısı",
        role: "Bir topluluk organizatörüsünüz.",
        objectives: ["Belirli bir politika için argüman sunun", "Maliyetle ilgili endişelere yanıt verin", "Karmaşık bir bakış açısını özetleyin"]
    },
    tradition_vs_modernity: {
        title: "Gelenek vs Modernite",
        role: "Geleneklerin ilerlemeyi engellediğine inanan bir modernistsiniz.",
        objectives: ["Tarihi ve modern değerleri karşılaştırın", "İleri düzey deyimler kullanın", "Kültürel kimliği analiz edin"]
    },
    travel_complaint: {
        title: "Seyahat Şikayeti",
        role: "Havaalanında bir havayolu acentesisiniz.",
        objectives: ["Sorunu açıklayın", "Geri ödeme veya yeniden rezervasyon talep edin", "Bir otel hakkında bilgi alın"]
    },
    apartment_dispute: {
        title: "Apartman Anlaşmazlığı",
        role: "Tamir masraflarını ödemeye isteksiz bir ev sahibisiniz.",
        objectives: ["Hasarı anlatın", "Neden ev sahibinin sorumluluğu olduğunu savunun", "Tamir tarihi üzerinde anlaşın"]
    },
    cultural_debate: {

        title: "Sosyal Medya Tartışması",
        role: "Teknolojiye şüpheyle yaklaşan bir arkadaşsınız.",
        objectives: ["Görüş bildirin", "İki destekleyici neden sunun", "Bir karşı argümana yanıt verin"]
    },
    legal_consultation: {
        title: "Hukuki Danışmanlık",
        role: "Fikri mülkiyet konusunda uzmanlaşmış bir avukatsınız.",
        objectives: ["Sözleşme ihlalini açıklayın", "Hukuki yollar hakkında bilgi alın", "Olası sonuçları tartışın"]
    },
    academic_seminar: {
        title: "Akademik Seminer",
        role: "Üniversite profesörüsünüz.",
        objectives: ["Konumunuzu özetleyin", "Varsayımsal kanıtlardan alıntı yapın", "Eleştirel bir noktaya yanıt verin"]
    },
    philosophical_debate: {
        title: "Yapay Zeka Etiği",
        role: "Ünlü bir filozofsunuz.",
        objectives: ["Karmaşık bir soyut kavramı tanımlayın", "Gelişmiş metaforlar kullanın", "İroni ve nüanslarla başa çıkın"]
    },
    diplomatic_crisis: {
        title: "Diplomatik Müzakere",
        role: "Rakip bir ulustan üst düzey bir diplomatsınız.",
        objectives: ["Ulusal kaygıları dolaylı yoldan ifade edin", "Karmaşık bir uzlaşma önerin", "Sıkı resmi protokole uyun"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Göreviniz: Hikayeyi TAM OLARAK 1 kısa cümleyle devam ettirin.
Sadece hikayeyi yazın. Başlık veya açıklama yok.
KRİTİK: İNGİLİZCE KULLANMAYIN. Dil: Türkçe.
Ton: Neşeli ve çok basit (CEFR A1).
Örnek:
Şimdiye kadarki hikaye: Sokakta yağmur yağıyor.
Oyuncu eylemi: Etrafıma bakıyorum.
<|im_start|>user
Orijinal: ${userInput}
<|im_start|>user
Orijinal: ${narrativeText}
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Basit dil öğretmeni. Girişi düzeltin. Eğer doğruysa, "Mükemmel" deyin.<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Basit dil öğretmeni. Girişi düzeltin. Eğer doğruysa, "Mükemmel" deyin.<|im_end|>
<|im_start|>user
Orijinal: ${userInput}
Düzeltme:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Daha basit hale getirin (3-5 kelime).<|im_end|>
<|im_start|>user
Orijinal: ${narrativeText}
Basitleştirilmiş:<|im_end|>
<|im_start|>assistant
`;
};
