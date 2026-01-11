
import { Language } from '../../../types';

export const NARRATIVE_TEMPLATES: Record<string, Record<Language, string[]>> = {
    ENTER_LOCATION: {
        [Language.ENGLISH]: [
            // RICH (SMART THESAURUS)
            "You step into a {ADJ:ATMOSPHERE} {LOCATION}. The air smells of {NOUN:SCENT}.",
            "The {LOCATION} is {ADJ:ATMOSPHERE}. A {NOUN:LIGHT} casts long shadows.",
            "You arrive at the {LOCATION}. It feels {ADJ:ATMOSPHERE}. Nearby, a {NOUN:FEATURE} stands silently.",
            "The surroundings are {ADJ:ATMOSPHERE}. You notice a {ADJ:CONDITION} {NOUN:FEATURE} resting here."
        ],
        [Language.SPANISH]: [
            "Entras en un {LOCATION} {ADJ:ATMOSPHERE}. El aire huele a {NOUN:SCENT}.",
            "El {LOCATION} es {ADJ:ATMOSPHERE}. Una {NOUN:LIGHT} proyecta largas sombras.",
            "Llegas al {LOCATION}. Se siente {ADJ:ATMOSPHERE}. Cerca, un {NOUN:FEATURE} descansa en silencio."
        ],
        [Language.FRENCH]: [
            "Vous entrez dans un {LOCATION} {ADJ:ATMOSPHERE}. L'air sent {NOUN:SCENT}.",
            "Le {LOCATION} est {ADJ:ATMOSPHERE}. Une {NOUN:LIGHT} projette de longues ombres."
        ],
        [Language.GERMAN]: [
            "Du betrittst ein {ADJ:ATMOSPHERE}es {LOCATION}. Die Luft riecht nach {NOUN:SCENT}.",
            "Der {LOCATION} ist {ADJ:ATMOSPHERE}. Ein {NOUN:LIGHT} wirft lange Schatten."
        ],
        [Language.ITALIAN]: ["Entri in un {LOCATION} {ADJ:ATMOSPHERE}. L'aria profuma di {NOUN:SCENT}."],
        [Language.JAPANESE]: ["{ADJ:ATMOSPHERE}{LOCATION}に入ります。{NOUN:SCENT}の香りがします。"],
        [Language.MANDARIN]: ["你进入了一个{ADJ:ATMOSPHERE}的{LOCATION}。空气中弥漫着{NOUN:SCENT}的味道。"],
        [Language.RUSSIAN]: ["Вы входите в {ADJ:ATMOSPHERE} {LOCATION}. Пахнет {NOUN:SCENT}."],
        [Language.PORTUGUESE]: ["Você entra em um {LOCATION} {ADJ:ATMOSPHERE}. O ar cheira a {NOUN:SCENT}."],
        [Language.UKRAINIAN]: ["Ви входите в {ADJ:ATMOSPHERE} {LOCATION}. Пахне {NOUN:SCENT}."],
        [Language.POLISH]: ["Wchodzisz do {ADJ:ATMOSPHERE}ego {LOCATION}. Pachnie {NOUN:SCENT}."],
        [Language.CZECH]: ["Vstupujete do {ADJ:ATMOSPHERE} {LOCATION}. Voní to po {NOUN:SCENT}."]
    },
    NPC_INTERACTION: {
        [Language.ENGLISH]: [
            "The {ENEMY} {VERB:INTRANS}. It seems {ADJ:PERSONALITY}.",
            "You approach the {ENEMY}. It {VERB:TRANS} you cautiously.",
            "A {ADJ:PERSONALITY} {ENEMY} stands nearby. It {VERB:INTRANS}."
        ],
        [Language.SPANISH]: [
            "El {ENEMY} {VERB:INTRANS}. Parece {ADJ:PERSONALITY}.",
            "Te acercas al {ENEMY}. Te {VERB:TRANS}.",
            "Un {ENEMY} {ADJ:PERSONALITY} está cerca. {VERB:INTRANS}."
        ],
        [Language.FRENCH]: ["L'{ENEMY} {VERB:INTRANS}. Il semble {ADJ:PERSONALITY}."],
        [Language.GERMAN]: ["Der {ENEMY} {VERB:INTRANS}. Er wirkt {ADJ:PERSONALITY}."],
        [Language.ITALIAN]: ["Il {ENEMY} {VERB:INTRANS}. Sembra {ADJ:PERSONALITY}."],
        [Language.JAPANESE]: ["{ENEMY}が{VERB:INTRANS}。{ADJ:PERSONALITY}に見えます。"],
        [Language.MANDARIN]: ["{ENEMY}{VERB:INTRANS}。它看起来{ADJ:PERSONALITY}。"],
        [Language.RUSSIAN]: ["{ENEMY} {VERB:INTRANS}. Он кажется {ADJ:PERSONALITY}."],
        [Language.PORTUGUESE]: ["O {ENEMY} {VERB:INTRANS}. Parece {ADJ:PERSONALITY}."],
        [Language.UKRAINIAN]: ["{ENEMY} {VERB:INTRANS}. Він здається {ADJ:PERSONALITY}."],
        [Language.POLISH]: ["{ENEMY} {VERB:INTRANS}. Wydaje się {ADJ:PERSONALITY}."],
        [Language.CZECH]: ["{ENEMY} {VERB:INTRANS}. Vypadá {ADJ:PERSONALITY}."]
    },
    QUEST_START: {
        [Language.ENGLISH]: [
            "A desperate messenger pushes a note into your hands. '{QUEST_DESCRIPTION}'",
            "You find an ancient inscription on a wall. It prophecies that one must {QUEST_OBJECTIVE} the {TARGET}.",
            "Rumors in the tavern speak of a great reward for anyone who can {QUEST_OBJECTIVE} the {TARGET}."
        ],
        [Language.SPANISH]: [
            "Un mensajero desesperado pone una nota en tus manos. '{QUEST_DESCRIPTION}'",
            "Encuentras una inscripción antigua. Profetiza que alguien debe {QUEST_OBJECTIVE} al {TARGET}.",
            "Los rumores hablan de una gran recompensa para quien pueda {QUEST_OBJECTIVE} al {TARGET}."
        ],
        [Language.FRENCH]: ["Un messager désespéré vous donne une note. '{QUEST_DESCRIPTION}'"],
        [Language.GERMAN]: ["Ein verzweifelter Bote drückt dir eine Notiz in die Hand. '{QUEST_DESCRIPTION}'"],
        [Language.ITALIAN]: ["Un messaggero disperato ti dà una nota. '{QUEST_DESCRIPTION}'"],
        [Language.JAPANESE]: ["必死の使者があなたにメモを渡します。「{QUEST_DESCRIPTION}」"],
        [Language.MANDARIN]: ["一个绝望的信使把一张纸条塞进你手里。'{QUEST_DESCRIPTION}'"],
        [Language.RUSSIAN]: ["Отчаявшийся гонец сует вам записку. '{QUEST_DESCRIPTION}'"],
        [Language.PORTUGUESE]: ["Um mensageiro desesperado coloca uma nota em suas mãos. '{QUEST_DESCRIPTION}'"],
        [Language.UKRAINIAN]: ["Відчайдушний гонець дає вам записку. '{QUEST_DESCRIPTION}'"],
        [Language.POLISH]: ["Zdesperowany posłaniec wręcza ci notatkę. '{QUEST_DESCRIPTION}'"],
        [Language.CZECH]: ["Zoufalý posel vám vtiskne do ruky vzkaz. '{QUEST_DESCRIPTION}'"]
    },
    COMBAT_START: {
        [Language.ENGLISH]: [
            "Suddenly, a {ADJ:PERSONALITY} {ENEMY} {VERB:INTRANS} toward you!",
            "You face a {ADJ:SIZE} {ENEMY}. It {VERB:TRANS} you menacingly.",
            "A {ENEMY} emerges from the shadows! It looks {ADJ:ATMOSPHERE}."
        ],
        [Language.SPANISH]: [
            "¡De repente, un {ENEMY} {ADJ:PERSONALITY} {VERB:INTRANS} hacia ti!",
            "Te enfrentas a un {ENEMY} {ADJ:SIZE}. Te {VERB:TRANS} amenazadoramente.",
            "¡Un {ENEMY} emerge de las sombras! Parece {ADJ:ATMOSPHERE}."
        ],
        // Fallbacks for other langs use generic keys
        [Language.FRENCH]: ["Soudain, un {ENEMY} {ADJ:PERSONALITY} apparaît !"],
        [Language.GERMAN]: ["Plötzlich erscheint ein {ADJ:PERSONALITY}er {ENEMY}!"],
        [Language.ITALIAN]: ["Improvvisamente, appare un {ENEMY} {ADJ:PERSONALITY}!"],
        [Language.JAPANESE]: ["突然、{ADJ:PERSONALITY}{ENEMY}が現れた！"],
        [Language.MANDARIN]: ["突然，出现了一个{ADJ:PERSONALITY}的{ENEMY}！"],
        [Language.RUSSIAN]: ["Внезапно появляется {ADJ:PERSONALITY} {ENEMY}!"],
        [Language.PORTUGUESE]: ["De repente, um {ENEMY} {ADJ:PERSONALITY} aparece!"],
        [Language.UKRAINIAN]: ["Раптом з'являється {ADJ:PERSONALITY} {ENEMY}!"],
        [Language.POLISH]: ["Nagle pojawia się {ADJ:PERSONALITY} {ENEMY}!"],
        [Language.CZECH]: ["Najednou se objeví {ADJ:PERSONALITY} {ENEMY}!"]
    },
    // Other templates remain similar but can be expanded later
    LOOT_SUCCESS: {
        [Language.ENGLISH]: ["You search and find a {ITEM}. A {ADJ:ATMOSPHERE} discovery!"],
        [Language.SPANISH]: ["Buscas y encuentras un {ITEM}. ¡Un descubrimiento {ADJ:ATMOSPHERE}!"],
        [Language.FRENCH]: ["Vous trouvez un {ITEM}. Découverte {ADJ:ATMOSPHERE} !"],
        [Language.GERMAN]: ["Du findest ein {ITEM}. {ADJ:ATMOSPHERE}e Entdeckung!"],
        [Language.ITALIAN]: ["Trovi un {ITEM}. Scoperta {ADJ:ATMOSPHERE}!"],
        [Language.JAPANESE]: ["{ITEM}を見つけました。{ADJ:ATMOSPHERE}発見！"],
        [Language.MANDARIN]: ["你发现了一个{ITEM}。{ADJ:ATMOSPHERE}的发现！"],
        [Language.RUSSIAN]: ["Вы находите {ITEM}. {ADJ:ATMOSPHERE} открытие!"],
        [Language.PORTUGUESE]: ["Você encontra um {ITEM}. Descoberta {ADJ:ATMOSPHERE}!"],
        [Language.UKRAINIAN]: ["Ви знаходите {ITEM}. {ADJ:ATMOSPHERE} відкриття!"],
        [Language.POLISH]: ["Znajdujesz {ITEM}. {ADJ:ATMOSPHERE} odkrycie!"],
        [Language.CZECH]: ["Najdete {ITEM}. {ADJ:ATMOSPHERE} objev!"]
    },
    QUEST_COMPLETE: {
        [Language.ENGLISH]: ["Success! You have {QUEST_OBJECTIVE} the {TARGET}. As a reward, you obtain: {REWARD}."],
        [Language.SPANISH]: ["¡Éxito! Has {QUEST_OBJECTIVE} al {TARGET}. Como recompensa, obtienes: {REWARD}."],
        [Language.FRENCH]: ["Succès ! Vous avez {QUEST_OBJECTIVE} le {TARGET}. Récompense : {REWARD}."],
        [Language.GERMAN]: ["Erfolg! Du hast {QUEST_OBJECTIVE}. Belohnung: {REWARD}."],
        [Language.ITALIAN]: ["Successo! Hai {QUEST_OBJECTIVE}. Ricompensa: {REWARD}."],
        [Language.JAPANESE]: ["成功！あなたは{TARGET}を{QUEST_OBJECTIVE}。報酬: {REWARD}。"],
        [Language.MANDARIN]: ["成功！你已经{QUEST_OBJECTIVE}了{TARGET}。奖励：{REWARD}。"],
        [Language.RUSSIAN]: ["Успех! Вы {QUEST_OBJECTIVE} {TARGET}. Награда: {REWARD}."],
        [Language.PORTUGUESE]: ["Sucesso! Você {QUEST_OBJECTIVE} o {TARGET}. Recompensa: {REWARD}."],
        [Language.UKRAINIAN]: ["Успіх! Ви {QUEST_OBJECTIVE}. Нагорода: {REWARD}."],
        [Language.POLISH]: ["Sukces! {QUEST_OBJECTIVE}. Nagroda: {REWARD}."],
        [Language.CZECH]: ["Úspěch! {QUEST_OBJECTIVE}. Odměna: {REWARD}."]
    },
    COMBAT_VICTORY: {
        [Language.ENGLISH]: ["The enemy falls! Catching your breath, you find a potion among its belongings."],
        [Language.SPANISH]: ["¡El enemigo cae! Recuperando el aliento, encuentras una poción entre sus pertenencias."],
        [Language.FRENCH]: ["L'ennemi tombe ! Vous trouvez une potion."],
        [Language.GERMAN]: ["Der Feind fällt! Du findest einen Trank."],
        [Language.ITALIAN]: ["Il nemico cade! Trovi una pozione."],
        [Language.JAPANESE]: ["敵が倒れた！持ち物の中からポーションを見つけました。"],
        [Language.MANDARIN]: ["敌人倒下了！你在它的物品中发现了一瓶药水。"],
        [Language.RUSSIAN]: ["Враг падает! Вы находите зелье."],
        [Language.PORTUGUESE]: ["O inimigo cai! Você encontra uma poção."],
        [Language.UKRAINIAN]: ["Ворог падає! Ви знаходите зілля."],
        [Language.POLISH]: ["Wróg pada! Znajdujesz miksturę."],
        [Language.CZECH]: ["Nepřítel padá! Nacházíte lektvar."]
    },
    INTERACT: {
        [Language.ENGLISH]: ["You examine the {NOUN:FEATURE}. It looks {ADJ:CONDITION}."],
        [Language.SPANISH]: ["Examinas el {NOUN:FEATURE}. Parece {ADJ:CONDITION}."],
        [Language.FRENCH]: ["Vous examinez le {NOUN:FEATURE}. Il semble {ADJ:CONDITION}."],
        [Language.GERMAN]: ["Du untersuchst das {NOUN:FEATURE}. Es sieht {ADJ:CONDITION} aus."],
        [Language.ITALIAN]: ["Esamini il {NOUN:FEATURE}. Sembra {ADJ:CONDITION}."],
        [Language.JAPANESE]: ["{NOUN:FEATURE}を調べます。{ADJ:CONDITION}に見えます。"],
        [Language.MANDARIN]: ["你检查了{NOUN:FEATURE}。它看起来{ADJ:CONDITION}。"],
        [Language.RUSSIAN]: ["Вы осматриваете {NOUN:FEATURE}. Он выглядит {ADJ:CONDITION}."],
        [Language.PORTUGUESE]: ["Você examina o {NOUN:FEATURE}. Parece {ADJ:CONDITION}."],
        [Language.UKRAINIAN]: ["Ви оглядаєте {NOUN:FEATURE}. Він виглядає {ADJ:CONDITION}."],
        [Language.POLISH]: ["Badacz {NOUN:FEATURE}. Wygląda na {ADJ:CONDITION}."],
        [Language.CZECH]: ["Prohlížíte {NOUN:FEATURE}. Vypadá {ADJ:CONDITION}."]
    },
    COMBAT_HIT: {
        [Language.ENGLISH]: ["You hit the {ENEMY} for {DAMAGE} damage. It counters with {ENEMY_DMG}."],
        [Language.SPANISH]: ["Golpeas al {ENEMY} por {DAMAGE} de daño. Te golpea de vuelta por {ENEMY_DMG}."],
        [Language.FRENCH]: ["Vous frappez l'{ENEMY} pour {DAMAGE} dégâts."],
        [Language.GERMAN]: ["Du triffst den {ENEMY} für {DAMAGE} Schaden."],
        [Language.ITALIAN]: ["Colpisci il {ENEMY} per {DAMAGE} danni."],
        [Language.JAPANESE]: ["{ENEMY}に{DAMAGE}のダメージを与えました。"],
        [Language.MANDARIN]: ["你对{ENEMY}造成了{DAMAGE}点伤害。"],
        [Language.RUSSIAN]: ["Вы наносите {ENEMY} {DAMAGE} урона."],
        [Language.PORTUGUESE]: ["Você acerta o {ENEMY} com {DAMAGE} de dano."],
        [Language.UKRAINIAN]: ["Ви наносите {ENEMY} {DAMAGE} шкоди."],
        [Language.POLISH]: ["Zadajesz {ENEMY} {DAMAGE} obrażeń."],
        [Language.CZECH]: ["Zasáhnete {ENEMY} za {DAMAGE} poškození."]
    },
    LOOT_FAIL: {
        [Language.ENGLISH]: ["You find nothing."],
        [Language.SPANISH]: ["No encuentras nada."],
        [Language.FRENCH]: ["Vous ne trouvez rien."],
        [Language.GERMAN]: ["Du findest nichts."],
        [Language.ITALIAN]: ["Non trovi nulla."],
        [Language.JAPANESE]: ["何も見つかりません。"],
        [Language.MANDARIN]: ["你什么也没找到。"],
        [Language.RUSSIAN]: ["Вы ничего не находите."],
        [Language.PORTUGUESE]: ["Você não encontra nada."],
        [Language.UKRAINIAN]: ["Ви нічого не знаходите."],
        [Language.POLISH]: ["Nic nie znajdujesz."],
        [Language.CZECH]: ["Nic nenajdete."]
    },
    PLAYER_DEATH: {
        [Language.ENGLISH]: ["You have died."],
        [Language.SPANISH]: ["Has muerto."],
        [Language.FRENCH]: ["Vous êtes mort."],
        [Language.GERMAN]: ["Du bist gestorben."],
        [Language.ITALIAN]: ["Sei morto."],
        [Language.JAPANESE]: ["あなたは死にました。"],
        [Language.MANDARIN]: ["你死了。"],
        [Language.RUSSIAN]: ["Вы умерли."],
        [Language.PORTUGUESE]: ["Você morreu."],
        [Language.UKRAINIAN]: ["Ви померли."],
        [Language.POLISH]: ["Zginąłeś."],
        [Language.CZECH]: ["Zemřeli jste."]
    }
};
