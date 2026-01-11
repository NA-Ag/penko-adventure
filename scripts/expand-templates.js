#!/usr/bin/env node

/**
 * Template Expansion Helper
 * Generates translations for the 8 missing languages
 * 
 * Usage: node scripts/expand-templates.js
 */

const translations = {
  // Italian translations
  ITALIAN: {
    examine: [
      'Osservi [object] da vicino. Antiche rune brillano sulla sua superficie.',
      'Esaminando più attentamente, [object] rivela i suoi segreti.'
    ],
    take: [
      'Afferri [object]. Un potere antico vibra nelle tue mani.',
      '[object] è tuo ora, che brilla di energia mistica.'
    ],
    open: [
      'Apri [object] con cura. Il passato si rivela.',
      '[object] si apre, rivelando i suoi misteri.'
    ],
    drop: [
      'Lasci cadere [object]. Scompare nelle ombre.',
      '[object] cade e si perde dall\'essere.'
    ],
    talk: [
      'Parli con [object]. La loro voce echeggia con saggezza antica.',
      '[object] risponde, le parole risuonano con significato.'
    ],
    use: [
      'Usi [object]. La magia si scatena.',
      '[object] si anima al tuo tocco.'
    ]
  },
  
  // Japanese translations
  JAPANESE: {
    examine: [
      '[object]を仔細に見つめる。古い符文が表面でキラめく。',
      'より詳しく調べると、[object]は秘密を明かす。'
    ],
    take: [
      '[object]を掴む。古い魔法があなたの手に鼓動する。',
      '[object]はあなたのもの、神秘的なエネルギーで輝く。'
    ],
    open: [
      '[object]を慎重に開く。過去が明かされる。',
      '[object]は開き、その謎を明らかにする。'
    ],
    drop: [
      '[object]を落とす。それは影に消える。',
      '[object]は落ち、存在から失われる。'
    ],
    talk: [
      '[object]と話す。彼らの声は古い知恵と響く。',
      '[object]が応答する、言葉は意味で鳴り響く。'
    ],
    use: [
      '[object]を使う。魔法が解放される。',
      '[object]があなたの触れで命を吹き込まれる。'
    ]
  },

  // Mandarin Chinese translations
  MANDARIN: {
    examine: [
      '你仔细凝视[object]。古老的符文闪烁在它的表面。',
      '更仔细地检查，[object]向你透露了秘密。'
    ],
    take: [
      '你抓住[object]。古老的魔法在你手中跳动。',
      '[object]现在是你的，闪烁着神秘的能量。'
    ],
    open: [
      '你小心地打开[object]。过去被揭示。',
      '[object]打开了，揭露了它的秘密。'
    ],
    drop: [
      '你放下[object]。它消失在阴影中。',
      '[object]掉落，从存在中消失。'
    ],
    talk: [
      '你与[object]交谈。他们的声音带着古老的智慧回响。',
      '[object]回应，话语充满了意义。'
    ],
    use: [
      '你使用[object]。魔法被释放。',
      '[object]在你的触碰下活了过来。'
    ]
  },

  // Russian translations
  RUSSIAN: {
    examine: [
      'Вы внимательно рассматриваете [object]. На его поверхности мерцают древние руны.',
      'При более близком осмотре [object] раскрывает свои секреты.'
    ],
    take: [
      'Вы хватаете [object]. Древняя магия пульсирует в ваших руках.',
      '[object] теперь ваш, светящийся мистической энергией.'
    ],
    open: [
      'Вы осторожно открываете [object]. Прошлое раскрывается.',
      '[object] открывается, раскрывая свои тайны.'
    ],
    drop: [
      'Вы бросаете [object]. Оно исчезает в тени.',
      '[object] падает, теряясь в бытии.'
    ],
    talk: [
      'Вы разговариваете с [object]. Их голос звучит древней мудростью.',
      '[object] отвечает, слова резонируют смыслом.'
    ],
    use: [
      'Вы используете [object]. Магия высвобождается.',
      '[object] оживает при вашем прикосновении.'
    ]
  },

  // Portuguese translations
  PORTUGUESE: {
    examine: [
      'Você examina [object] de perto. Runas antigas cintilam em sua superfície.',
      'Ao inspecionar mais de perto, [object] revela seus segredos.'
    ],
    take: [
      'Você agarra [object]. Magia antiga pulsa em suas mãos.',
      '[object] é seu agora, brilhando com energia mística.'
    ],
    open: [
      'Você abre [object] com cuidado. O passado é revelado.',
      '[object] se abre, revelando seus mistérios.'
    ],
    drop: [
      'Você solta [object]. Ele desaparece nas sombras.',
      '[object] cai, perdendo-se na existência.'
    ],
    talk: [
      'Você fala com [object]. Sua voz ecoa com sabedoria antiga.',
      '[object] responde, as palavras ressoam com significado.'
    ],
    use: [
      'Você usa [object]. A magia é liberada.',
      '[object] ganha vida ao seu toque.'
    ]
  },

  // Ukrainian translations
  UKRAINIAN: {
    examine: [
      'Ви уважно розглядаєте [object]. На його поверхні мерехтять давні руни.',
      'При ближчому огляді [object] розкриває свої таємниці.'
    ],
    take: [
      'Ви хапаєте [object]. Давня магія тріпоче у ваших руках.',
      '[object] тепер ваш, що світиться містичною енергією.'
    ],
    open: [
      'Ви обережно відкриваєте [object]. Минуле розкривається.',
      '[object] відкривається, розкриваючи свої таємниці.'
    ],
    drop: [
      'Ви кидаєте [object]. Він зникає в тіні.',
      '[object] падає, втрачаючись у бутті.'
    ],
    talk: [
      'Ви говорите з [object]. Їхній голос лунає давньою мудрістю.',
      '[object] відповідає, слова резонують сенсом.'
    ],
    use: [
      'Ви використовуєте [object]. Магія звільняється.',
      '[object] пробуджується при вашому дотику.'
    ]
  },

  // Polish translations
  POLISH: {
    examine: [
      'Przyglądasz się [object] uważnie. Na jego powierzchni błyszczą starożytne runy.',
      'Przy bliższym zbadaniu [object] ujawnia swoje tajemnice.'
    ],
    take: [
      'Chwytasz [object]. W twoich rękach tętnią starożytne czary.',
      '[object] jest teraz twój, świecący mistyczną energią.'
    ],
    open: [
      'Otwierasz [object] ostrożnie. Przeszłość ujawnia się.',
      '[object] się otwiera, ujawniając swoje tajemnice.'
    ],
    drop: [
      'Upuszczasz [object]. Znika w cieniu.',
      '[object] spada, gubi się w bycie.'
    ],
    talk: [
      'Rozmawiasz z [object]. Ich głos brzmi starożytną mądrością.',
      '[object] odpowiada, słowa brzmią sensem.'
    ],
    use: [
      'Używasz [object]. Czary się uwalniają.',
      '[object] ożywa na twoim dotyku.'
    ]
  },

  // Czech translations
  CZECH: {
    examine: [
      'Pozorně se díváš na [object]. Na jeho povrchu třpytí se starobylé runy.',
      'Při bližším zkoumání [object] odhaluje svá tajemství.'
    ],
    take: [
      'Zchopíš se [object]. Ve tvých rukou pulzuje starobylá kouzla.',
      '[object] je nyní tvůj, zářící mystickou energií.'
    ],
    open: [
      'Opatrně otevřeš [object]. Minulost se odhaluje.',
      '[object] se otevře, odhalujíc svá tajemství.'
    ],
    drop: [
      'Pustíš [object]. Zmizí ve stínu.',
      '[object] padá, ztrácí se v bytí.'
    ],
    talk: [
      'Mluví s [object]. Jejich hlas zní starobylou moudrostí.',
      '[object] odpovídá, slova znějí smyslem.'
    ],
    use: [
      'Používáš [object]. Kouzla se uvolňují.',
      '[object] ožije na tvůj dotek.'
    ]
  }
};

console.log('Translation Templates Ready');
console.log('');
console.log('Total new translations: 8 languages × 6 actions × 2 variants = 96 translations');
console.log('');
console.log('Languages:');
console.log('1. Italian (IT)');
console.log('2. Japanese (JA)');
console.log('3. Mandarin (ZH)');
console.log('4. Russian (RU)');
console.log('5. Portuguese (PT)');
console.log('6. Ukrainian (UK)');
console.log('7. Polish (PL)');
console.log('8. Czech (CS)');

module.exports = translations;
