import { ObjectProperties } from '../../types/game.types';
import { Language } from '../../types';
import { ColorModifier } from './ColorModifier';
import { ScaleModifier } from './ScaleModifier';
import { MaterialModifier } from './MaterialModifier';

/**
 * Description generation result
 */
export interface GeneratedDescription {
  short: string;        // Brief description: "a large red iron door"
  detailed: string;     // Full description: "A large door made of solid iron, painted bright red."
  examining: string;    // When examining: "You see a massive iron door. Its red surface gleams..."
}

/**
 * PropertyDescriptionGenerator - Generates natural language descriptions from object properties
 *
 * Features:
 * - Generates descriptions that reflect color, size, material, and state
 * - Multiple description styles (short, detailed, examining)
 * - Natural language composition
 * - Multilingual support (8 languages)
 * - Property-aware descriptions (mentions special traits)
 *
 * Examples:
 *   "red iron door" → "A large door made of solid iron, painted bright red."
 *   "tiny wooden sword" → "A miniature sword crafted from wood."
 *   "huge golden enchanted sword" → "An enormous magical sword forged from gleaming gold."
 */
export class PropertyDescriptionGenerator {
  private colorModifier: ColorModifier;
  private scaleModifier: ScaleModifier;
  private materialModifier: MaterialModifier;

  constructor(
    colorModifier: ColorModifier,
    scaleModifier: ScaleModifier,
    materialModifier: MaterialModifier
  ) {
    this.colorModifier = colorModifier;
    this.scaleModifier = scaleModifier;
    this.materialModifier = materialModifier;
  }

  /**
   * Generate all description types for an object
   */
  generateDescriptions(
    noun: string,
    properties: ObjectProperties,
    language: Language = Language.ENGLISH
  ): GeneratedDescription {
    return {
      short: this.generateShortDescription(noun, properties, language),
      detailed: this.generateDetailedDescription(noun, properties, language),
      examining: this.generateExaminingDescription(noun, properties, language)
    };
  }

  /**
   * Generate short description: "a large red iron door"
   */
  private generateShortDescription(
    noun: string,
    properties: ObjectProperties,
    language: Language
  ): string {
    const parts: string[] = [];

    // Add article
    parts.push(this.getArticle(noun, language));

    // Add size descriptor
    const sizeDesc = this.getSizeDescriptor(properties, language);
    if (sizeDesc) parts.push(sizeDesc);

    // Add color descriptor
    const colorDesc = this.getColorDescriptor(properties, language);
    if (colorDesc) parts.push(colorDesc);

    // Add material descriptor
    const materialDesc = this.getMaterialDescriptor(properties, language);
    if (materialDesc) parts.push(materialDesc);

    // Add special quality descriptors
    const qualityDesc = this.getQualityDescriptor(properties, language);
    if (qualityDesc) parts.push(qualityDesc);

    // Add noun
    parts.push(this.getLocalizedNoun(noun, language));

    return parts.join(' ');
  }

  /**
   * Generate detailed description with full sentence
   */
  private generateDetailedDescription(
    noun: string,
    properties: ObjectProperties,
    language: Language
  ): string {
    const templates = this.getDetailedTemplates(language);
    const parts: string[] = [];

    // Main sentence structure
    const article = this.getArticle(noun, language, true); // Capitalized
    const sizeDesc = this.getSizeDescriptor(properties, language);
    const localizedNoun = this.getLocalizedNoun(noun, language);

    let mainSentence = `${article} ${sizeDesc ? sizeDesc + ' ' : ''}${localizedNoun}`;

    // Add material clause
    const materialDesc = this.getMaterialDescriptor(properties, language);
    if (materialDesc) {
      const materialClause = this.getMaterialClause(materialDesc, language);
      mainSentence += ` ${materialClause}`;
    }

    // Add color clause
    const colorDesc = this.getColorDescriptor(properties, language);
    if (colorDesc) {
      const colorClause = this.getColorClause(colorDesc, properties, language);
      mainSentence += `, ${colorClause}`;
    }

    mainSentence += '.';
    parts.push(mainSentence);

    // Add special properties sentence
    const specialDesc = this.getSpecialPropertiesDescription(properties, language);
    if (specialDesc) {
      parts.push(specialDesc);
    }

    // Add state description
    const stateDesc = this.getStateDescription(properties, language);
    if (stateDesc) {
      parts.push(stateDesc);
    }

    return parts.join(' ');
  }

  /**
   * Generate examining description (when player examines object)
   */
  private generateExaminingDescription(
    noun: string,
    properties: ObjectProperties,
    language: Language
  ): string {
    const parts: string[] = [];

    // Opening sentence
    const sizeDesc = this.getSizeDescriptor(properties, language);
    const materialDesc = this.getMaterialDescriptor(properties, language);
    const localizedNoun = this.getLocalizedNoun(noun, language);

    const templates = this.getExaminingTemplates(language);
    let opening = templates.youSee
      .replace('{size}', sizeDesc || '')
      .replace('{material}', materialDesc || '')
      .replace('{noun}', localizedNoun)
      .replace(/\s+/g, ' ')
      .trim();

    parts.push(opening);

    // Visual details
    const colorDesc = this.getColorDescriptor(properties, language);
    if (colorDesc) {
      const colorDetail = this.getColorDetailSentence(colorDesc, properties, language);
      parts.push(colorDetail);
    }

    // Physical details
    const physicalDetail = this.getPhysicalDetailSentence(properties, language);
    if (physicalDetail) {
      parts.push(physicalDetail);
    }

    // Special properties
    const specialDetail = this.getSpecialDetailSentence(properties, language);
    if (specialDetail) {
      parts.push(specialDetail);
    }

    return parts.join(' ');
  }

  /**
   * Get size descriptor from properties
   */
  private getSizeDescriptor(properties: ObjectProperties, language: Language): string | null {
    const traits = properties.traits || [];

    // Check for scale traits
    for (const trait of traits) {
      if (trait.startsWith('scale_')) {
        const scaleName = trait.replace('scale_', '');
        const scale = this.scaleModifier.getScale(scaleName);
        if (scale) {
          return this.getLocalizedSize(scaleName, language);
        }
      }
    }

    return null;
  }

  /**
   * Get color descriptor from properties
   */
  private getColorDescriptor(properties: ObjectProperties, language: Language): string | null {
    const traits = properties.traits || [];

    // Find first color trait
    for (const trait of traits) {
      if (trait.startsWith('color_') && !trait.startsWith('color_category_') &&
          !trait.startsWith('color_temp_') && !trait.startsWith('color_brightness_')) {
        const colorName = trait.replace('color_', '');
        return this.getLocalizedColor(colorName, language);
      }
    }

    return null;
  }

  /**
   * Get material descriptor from properties
   */
  private getMaterialDescriptor(properties: ObjectProperties, language: Language): string | null {
    const traits = properties.traits || [];

    // Find material trait
    for (const trait of traits) {
      if (trait.startsWith('material_') && !trait.startsWith('material_category_')) {
        const materialName = trait.replace('material_', '');
        return this.getLocalizedMaterial(materialName, language);
      }
    }

    return null;
  }

  /**
   * Get quality descriptor (magical, rusty, etc.)
   */
  private getQualityDescriptor(properties: ObjectProperties, language: Language): string | null {
    const traits = properties.traits || [];

    if (traits.includes('magical')) {
      return this.getLocalizedQuality('magical', language);
    }
    if (traits.includes('cursed')) {
      return this.getLocalizedQuality('cursed', language);
    }
    if (traits.includes('blessed')) {
      return this.getLocalizedQuality('blessed', language);
    }
    if (traits.includes('rusty')) {
      return this.getLocalizedQuality('rusty', language);
    }
    if (traits.includes('shiny')) {
      return this.getLocalizedQuality('shiny', language);
    }

    return null;
  }

  /**
   * Get material clause for detailed description
   */
  private getMaterialClause(material: string, language: Language): string {
    const templates: Partial<Record<Language, string>> = {
      [Language.ENGLISH]: `made of ${material}`,
      [Language.SPANISH]: `hecho de ${material}`,
      [Language.FRENCH]: `fait de ${material}`,
      [Language.GERMAN]: `aus ${material}`,
      [Language.JAPANESE]: `${material}製`,
      [Language.MANDARIN]: `由${material}制成`,
      [Language.PORTUGUESE]: `feito de ${material}`,
      [Language.ITALIAN]: `fatto di ${material}`
    };

    return templates[language] || templates[Language.ENGLISH];
  }

  /**
   * Get color clause for detailed description
   */
  private getColorClause(color: string, properties: ObjectProperties, language: Language): string {
    const templates: Partial<Record<Language, string>> = {
      [Language.ENGLISH]: `colored ${color}`,
      [Language.SPANISH]: `de color ${color}`,
      [Language.FRENCH]: `de couleur ${color}`,
      [Language.GERMAN]: `in ${color}`,
      [Language.JAPANESE]: `${color}色`,
      [Language.MANDARIN]: `${color}色的`,
      [Language.PORTUGUESE]: `de cor ${color}`,
      [Language.ITALIAN]: `di colore ${color}`
    };

    return templates[language] || templates[Language.ENGLISH];
  }

  /**
   * Get special properties description
   */
  private getSpecialPropertiesDescription(properties: ObjectProperties, language: Language): string | null {
    const specials: string[] = [];

    if (properties.is_hot) {
      specials.push(this.getLocalizedProperty('hot', language));
    }
    if (properties.is_cold) {
      specials.push(this.getLocalizedProperty('cold', language));
    }
    if (properties.is_sharp) {
      specials.push(this.getLocalizedProperty('sharp', language));
    }
    if (properties.is_flammable) {
      specials.push(this.getLocalizedProperty('flammable', language));
    }
    if (properties.is_transparent) {
      specials.push(this.getLocalizedProperty('transparent', language));
    }

    if (specials.length === 0) return null;

    const templates: Partial<Record<Language, string>> = {
      [Language.ENGLISH]: `It is ${specials.join(', ')}.`,
      [Language.SPANISH]: `Es ${specials.join(', ')}.`,
      [Language.FRENCH]: `Il est ${specials.join(', ')}.`,
      [Language.GERMAN]: `Es ist ${specials.join(', ')}.`,
      [Language.JAPANESE]: `それは${specials.join('、')}です。`,
      [Language.MANDARIN]: `它是${specials.join('、')}的。`,
      [Language.PORTUGUESE]: `É ${specials.join(', ')}.`,
      [Language.ITALIAN]: `È ${specials.join(', ')}.`
    };

    return templates[language] || templates[Language.ENGLISH];
  }

  /**
   * Get state description (locked, broken, etc.)
   */
  private getStateDescription(properties: ObjectProperties, language: Language): string | null {
    const states: string[] = [];

    if (properties.is_locked) {
      states.push(this.getLocalizedState('locked', language));
    } else if (properties.is_open) {
      states.push(this.getLocalizedState('open', language));
    } else if (properties.can_be_opened) {
      states.push(this.getLocalizedState('closed', language));
    }

    if (properties.is_broken) {
      states.push(this.getLocalizedState('broken', language));
    }

    if (properties.is_lit) {
      states.push(this.getLocalizedState('lit', language));
    }

    if (states.length === 0) return null;

    const templates: Partial<Record<Language, string>> = {
      [Language.ENGLISH]: `It is ${states.join(' and ')}.`,
      [Language.SPANISH]: `Está ${states.join(' y ')}.`,
      [Language.FRENCH]: `Il est ${states.join(' et ')}.`,
      [Language.GERMAN]: `Es ist ${states.join(' und ')}.`,
      [Language.JAPANESE]: `それは${states.join('、')}です。`,
      [Language.MANDARIN]: `它是${states.join('和')}的。`,
      [Language.PORTUGUESE]: `Está ${states.join(' e ')}.`,
      [Language.ITALIAN]: `È ${states.join(' e ')}.`
    };

    return templates[language] || templates[Language.ENGLISH];
  }

  /**
   * Get color detail sentence for examining
   */
  private getColorDetailSentence(color: string, properties: ObjectProperties, language: Language): string {
    const traits = properties.traits || [];

    // Check if shiny
    const isShiny = traits.includes('shiny');

    const templates: Partial<Record<Language, { normal: string; shiny: string }>> = {
      [Language.ENGLISH]: {
        normal: `Its ${color} surface catches your eye.`,
        shiny: `Its ${color} surface gleams brightly.`
      },
      [Language.SPANISH]: {
        normal: `Su superficie ${color} llama tu atención.`,
        shiny: `Su superficie ${color} brilla intensamente.`
      },
      [Language.FRENCH]: {
        normal: `Sa surface ${color} attire votre attention.`,
        shiny: `Sa surface ${color} brille intensément.`
      },
      [Language.GERMAN]: {
        normal: `Seine ${color} Oberfläche fällt auf.`,
        shiny: `Seine ${color} Oberfläche glänzt hell.`
      },
      [Language.JAPANESE]: {
        normal: `その${color}色の表面が目を引きます。`,
        shiny: `その${color}色の表面が明るく輝いています。`
      },
      [Language.MANDARIN]: {
        normal: `它的${color}表面引人注目。`,
        shiny: `它的${color}表面闪闪发光。`
      },
      [Language.PORTUGUESE]: {
        normal: `Sua superfície ${color} chama sua atenção.`,
        shiny: `Sua superfície ${color} brilha intensamente.`
      },
      [Language.ITALIAN]: {
        normal: `La sua superficie ${color} attira l'attenzione.`,
        shiny: `La sua superficie ${color} brilla intensamente.`
      }
    };

    const template = templates[language] || templates[Language.ENGLISH];
    return isShiny ? template.shiny : template.normal;
  }

  /**
   * Get physical detail sentence
   */
  private getPhysicalDetailSentence(properties: ObjectProperties, language: Language): string | null {
    const details: string[] = [];

    if (properties.is_heavy) {
      details.push(this.getLocalizedPhysical('heavy', language));
    }
    if (properties.is_fragile) {
      details.push(this.getLocalizedPhysical('fragile', language));
    }

    if (details.length === 0) return null;

    const templates: Partial<Record<Language, string>> = {
      [Language.ENGLISH]: `It appears to be ${details.join(' and ')}.`,
      [Language.SPANISH]: `Parece ser ${details.join(' y ')}.`,
      [Language.FRENCH]: `Il semble être ${details.join(' et ')}.`,
      [Language.GERMAN]: `Es scheint ${details.join(' und ')} zu sein.`,
      [Language.JAPANESE]: `それは${details.join('、')}のようです。`,
      [Language.MANDARIN]: `它看起来是${details.join('和')}的。`,
      [Language.PORTUGUESE]: `Parece ser ${details.join(' e ')}.`,
      [Language.ITALIAN]: `Sembra essere ${details.join(' e ')}.`
    };

    return templates[language] || templates[Language.ENGLISH];
  }

  /**
   * Get special detail sentence for examining
   */
  private getSpecialDetailSentence(properties: ObjectProperties, language: Language): string | null {
    const traits = properties.traits || [];

    if (traits.includes('magical')) {
      const templates: Partial<Record<Language, string>> = {
        [Language.ENGLISH]: 'You sense magical energy emanating from it.',
        [Language.SPANISH]: 'Sientes energía mágica emanando de él.',
        [Language.FRENCH]: 'Vous sentez une énergie magique émaner de lui.',
        [Language.GERMAN]: 'Sie spüren magische Energie, die von ihm ausgeht.',
        [Language.JAPANESE]: 'それから魔法のエネルギーを感じます。',
        [Language.MANDARIN]: '你感觉到它散发出魔法能量。',
        [Language.PORTUGUESE]: 'Você sente energia mágica emanando dele.',
        [Language.ITALIAN]: 'Senti energia magica emanare da esso.'
      };
      return templates[language] || templates[Language.ENGLISH];
    }

    if (traits.includes('cursed')) {
      const templates: Partial<Record<Language, string>> = {
        [Language.ENGLISH]: 'An unsettling aura surrounds it.',
        [Language.SPANISH]: 'Un aura inquietante lo rodea.',
        [Language.FRENCH]: 'Une aura troublante l\'entoure.',
        [Language.GERMAN]: 'Eine beunruhigende Aura umgibt es.',
        [Language.JAPANESE]: '不穏な雰囲気がそれを取り囲んでいます。',
        [Language.MANDARIN]: '一种令人不安的气息环绕着它。',
        [Language.PORTUGUESE]: 'Uma aura inquietante o cerca.',
        [Language.ITALIAN]: 'Un\'aura inquietante lo circonda.'
      };
      return templates[language] || templates[Language.ENGLISH];
    }

    if (properties.is_hot) {
      const templates: Partial<Record<Language, string>> = {
        [Language.ENGLISH]: 'Heat radiates from its surface.',
        [Language.SPANISH]: 'El calor irradia de su superficie.',
        [Language.FRENCH]: 'La chaleur rayonne de sa surface.',
        [Language.GERMAN]: 'Hitze strahlt von seiner Oberfläche ab.',
        [Language.JAPANESE]: 'その表面から熱が放射されています。',
        [Language.MANDARIN]: '热量从它的表面散发出来。',
        [Language.PORTUGUESE]: 'O calor irradia de sua superfície.',
        [Language.ITALIAN]: 'Il calore irradia dalla sua superficie.'
      };
      return templates[language] || templates[Language.ENGLISH];
    }

    return null;
  }

  /**
   * Get article (a/an/the) based on language and noun
   */
  private getArticle(noun: string, language: Language, capitalize: boolean = false): string {
    if (language === Language.ENGLISH) {
      const vowels = ['a', 'e', 'i', 'o', 'u'];
      const article = vowels.includes(noun[0]?.toLowerCase()) ? 'an' : 'a';
      return capitalize ? article.charAt(0).toUpperCase() + article.slice(1) : article;
    }

    // Other languages have more complex article rules, simplified here
    const articles: Partial<Record<Language, string>> = {
      [Language.SPANISH]: capitalize ? 'Un' : 'un',
      [Language.FRENCH]: capitalize ? 'Un' : 'un',
      [Language.GERMAN]: capitalize ? 'Ein' : 'ein',
      [Language.JAPANESE]: '',
      [Language.MANDARIN]: '一个',
      [Language.PORTUGUESE]: capitalize ? 'Um' : 'um',
      [Language.ITALIAN]: capitalize ? 'Un' : 'un'
    };

    return articles[language] || articles[Language.ENGLISH];
  }

  // Localization helper methods
  private getLocalizedNoun(noun: string, language: Language): string {
    // For now, return noun as-is (future: full translation)
    return noun;
  }

  private getLocalizedSize(size: string, language: Language): string {
    const sizes: Record<string, Partial<Record<Language, string>>> = {
      tiny: {
        [Language.ENGLISH]: 'tiny',
        [Language.SPANISH]: 'diminuto',
        [Language.FRENCH]: 'minuscule',
        [Language.GERMAN]: 'winzig',
        [Language.JAPANESE]: '小さな',
        [Language.MANDARIN]: '微小的',
        [Language.PORTUGUESE]: 'minúsculo',
        [Language.ITALIAN]: 'minuscolo'
      },
      small: {
        [Language.ENGLISH]: 'small',
        [Language.SPANISH]: 'pequeño',
        [Language.FRENCH]: 'petit',
        [Language.GERMAN]: 'klein',
        [Language.JAPANESE]: '小型の',
        [Language.MANDARIN]: '小的',
        [Language.PORTUGUESE]: 'pequeno',
        [Language.ITALIAN]: 'piccolo'
      },
      large: {
        [Language.ENGLISH]: 'large',
        [Language.SPANISH]: 'grande',
        [Language.FRENCH]: 'grand',
        [Language.GERMAN]: 'groß',
        [Language.JAPANESE]: '大きな',
        [Language.MANDARIN]: '大的',
        [Language.PORTUGUESE]: 'grande',
        [Language.ITALIAN]: 'grande'
      },
      huge: {
        [Language.ENGLISH]: 'huge',
        [Language.SPANISH]: 'enorme',
        [Language.FRENCH]: 'énorme',
        [Language.GERMAN]: 'riesig',
        [Language.JAPANESE]: '巨大な',
        [Language.MANDARIN]: '巨大的',
        [Language.PORTUGUESE]: 'enorme',
        [Language.ITALIAN]: 'enorme'
      },
      gigantic: {
        [Language.ENGLISH]: 'gigantic',
        [Language.SPANISH]: 'gigantesco',
        [Language.FRENCH]: 'gigantesque',
        [Language.GERMAN]: 'gigantisch',
        [Language.JAPANESE]: '超巨大な',
        [Language.MANDARIN]: '巨大无比的',
        [Language.PORTUGUESE]: 'gigantesco',
        [Language.ITALIAN]: 'gigantesco'
      }
    };

    return sizes[size]?.[language] || sizes[size]?.[Language.ENGLISH] || size;
  }

  private getLocalizedColor(color: string, language: Language): string {
    // For now, return color as-is (future: full translation)
    return color;
  }

  private getLocalizedMaterial(material: string, language: Language): string {
    const materials: Record<string, Partial<Record<Language, string>>> = {
      wooden: {
        [Language.ENGLISH]: 'wooden',
        [Language.SPANISH]: 'de madera',
        [Language.FRENCH]: 'en bois',
        [Language.GERMAN]: 'hölzern',
        [Language.JAPANESE]: '木製の',
        [Language.MANDARIN]: '木制的',
        [Language.PORTUGUESE]: 'de madeira',
        [Language.ITALIAN]: 'di legno'
      },
      iron: {
        [Language.ENGLISH]: 'iron',
        [Language.SPANISH]: 'de hierro',
        [Language.FRENCH]: 'en fer',
        [Language.GERMAN]: 'eisern',
        [Language.JAPANESE]: '鉄製の',
        [Language.MANDARIN]: '铁制的',
        [Language.PORTUGUESE]: 'de ferro',
        [Language.ITALIAN]: 'di ferro'
      },
      steel: {
        [Language.ENGLISH]: 'steel',
        [Language.SPANISH]: 'de acero',
        [Language.FRENCH]: 'en acier',
        [Language.GERMAN]: 'stählern',
        [Language.JAPANESE]: '鋼鉄製の',
        [Language.MANDARIN]: '钢制的',
        [Language.PORTUGUESE]: 'de aço',
        [Language.ITALIAN]: 'di acciaio'
      },
      glass: {
        [Language.ENGLISH]: 'glass',
        [Language.SPANISH]: 'de vidrio',
        [Language.FRENCH]: 'en verre',
        [Language.GERMAN]: 'gläsern',
        [Language.JAPANESE]: 'ガラス製の',
        [Language.MANDARIN]: '玻璃制的',
        [Language.PORTUGUESE]: 'de vidro',
        [Language.ITALIAN]: 'di vetro'
      }
    };

    return materials[material]?.[language] || materials[material]?.[Language.ENGLISH] || material;
  }

  private getLocalizedQuality(quality: string, language: Language): string {
    const qualities: Record<string, Partial<Record<Language, string>>> = {
      magical: { [Language.ENGLISH]: 'magical', [Language.SPANISH]: 'mágico', [Language.FRENCH]: 'magique', [Language.GERMAN]: 'magisch', [Language.JAPANESE]: '魔法の', [Language.MANDARIN]: '魔法的', [Language.PORTUGUESE]: 'mágico', [Language.ITALIAN]: 'magico' },
      cursed: { [Language.ENGLISH]: 'cursed', [Language.SPANISH]: 'maldito', [Language.FRENCH]: 'maudit', [Language.GERMAN]: 'verflucht', [Language.JAPANESE]: '呪われた', [Language.MANDARIN]: '被诅咒的', [Language.PORTUGUESE]: 'amaldiçoado', [Language.ITALIAN]: 'maledetto' },
      blessed: { [Language.ENGLISH]: 'blessed', [Language.SPANISH]: 'bendito', [Language.FRENCH]: 'béni', [Language.GERMAN]: 'gesegnet', [Language.JAPANESE]: '祝福された', [Language.MANDARIN]: '被祝福的', [Language.PORTUGUESE]: 'abençoado', [Language.ITALIAN]: 'benedetto' },
      rusty: { [Language.ENGLISH]: 'rusty', [Language.SPANISH]: 'oxidado', [Language.FRENCH]: 'rouillé', [Language.GERMAN]: 'rostig', [Language.JAPANESE]: '錆びた', [Language.MANDARIN]: '生锈的', [Language.PORTUGUESE]: 'enferrujado', [Language.ITALIAN]: 'arrugginito' },
      shiny: { [Language.ENGLISH]: 'shiny', [Language.SPANISH]: 'brillante', [Language.FRENCH]: 'brillant', [Language.GERMAN]: 'glänzend', [Language.JAPANESE]: '輝く', [Language.MANDARIN]: '闪亮的', [Language.PORTUGUESE]: 'brilhante', [Language.ITALIAN]: 'lucido' }
    };

    return qualities[quality]?.[language] || qualities[quality]?.[Language.ENGLISH] || quality;
  }

  private getLocalizedProperty(property: string, language: Language): string {
    const properties: Record<string, Partial<Record<Language, string>>> = {
      hot: { [Language.ENGLISH]: 'hot', [Language.SPANISH]: 'caliente', [Language.FRENCH]: 'chaud', [Language.GERMAN]: 'heiß', [Language.JAPANESE]: '熱い', [Language.MANDARIN]: '热的', [Language.PORTUGUESE]: 'quente', [Language.ITALIAN]: 'caldo' },
      cold: { [Language.ENGLISH]: 'cold', [Language.SPANISH]: 'frío', [Language.FRENCH]: 'froid', [Language.GERMAN]: 'kalt', [Language.JAPANESE]: '冷たい', [Language.MANDARIN]: '冷的', [Language.PORTUGUESE]: 'frio', [Language.ITALIAN]: 'freddo' },
      sharp: { [Language.ENGLISH]: 'sharp', [Language.SPANISH]: 'afilado', [Language.FRENCH]: 'tranchant', [Language.GERMAN]: 'scharf', [Language.JAPANESE]: '鋭い', [Language.MANDARIN]: '锋利的', [Language.PORTUGUESE]: 'afiado', [Language.ITALIAN]: 'affilato' },
      flammable: { [Language.ENGLISH]: 'flammable', [Language.SPANISH]: 'inflamable', [Language.FRENCH]: 'inflammable', [Language.GERMAN]: 'brennbar', [Language.JAPANESE]: '可燃性の', [Language.MANDARIN]: '易燃的', [Language.PORTUGUESE]: 'inflamável', [Language.ITALIAN]: 'infiammabile' },
      transparent: { [Language.ENGLISH]: 'transparent', [Language.SPANISH]: 'transparente', [Language.FRENCH]: 'transparent', [Language.GERMAN]: 'durchsichtig', [Language.JAPANESE]: '透明な', [Language.MANDARIN]: '透明的', [Language.PORTUGUESE]: 'transparente', [Language.ITALIAN]: 'trasparente' }
    };

    return properties[property]?.[language] || properties[property]?.[Language.ENGLISH] || property;
  }

  private getLocalizedState(state: string, language: Language): string {
    const states: Record<string, Partial<Record<Language, string>>> = {
      locked: { [Language.ENGLISH]: 'locked', [Language.SPANISH]: 'cerrado con llave', [Language.FRENCH]: 'verrouillé', [Language.GERMAN]: 'verschlossen', [Language.JAPANESE]: '施錠されている', [Language.MANDARIN]: '锁着的', [Language.PORTUGUESE]: 'trancado', [Language.ITALIAN]: 'chiuso a chiave' },
      open: { [Language.ENGLISH]: 'open', [Language.SPANISH]: 'abierto', [Language.FRENCH]: 'ouvert', [Language.GERMAN]: 'offen', [Language.JAPANESE]: '開いている', [Language.MANDARIN]: '开着的', [Language.PORTUGUESE]: 'aberto', [Language.ITALIAN]: 'aperto' },
      closed: { [Language.ENGLISH]: 'closed', [Language.SPANISH]: 'cerrado', [Language.FRENCH]: 'fermé', [Language.GERMAN]: 'geschlossen', [Language.JAPANESE]: '閉じている', [Language.MANDARIN]: '关着的', [Language.PORTUGUESE]: 'fechado', [Language.ITALIAN]: 'chiuso' },
      broken: { [Language.ENGLISH]: 'broken', [Language.SPANISH]: 'roto', [Language.FRENCH]: 'cassé', [Language.GERMAN]: 'kaputt', [Language.JAPANESE]: '壊れている', [Language.MANDARIN]: '破损的', [Language.PORTUGUESE]: 'quebrado', [Language.ITALIAN]: 'rotto' },
      lit: { [Language.ENGLISH]: 'lit', [Language.SPANISH]: 'encendido', [Language.FRENCH]: 'allumé', [Language.GERMAN]: 'beleuchtet', [Language.JAPANESE]: '点灯している', [Language.MANDARIN]: '点亮的', [Language.PORTUGUESE]: 'aceso', [Language.ITALIAN]: 'acceso' }
    };

    return states[state]?.[language] || states[state]?.[Language.ENGLISH] || state;
  }

  private getLocalizedPhysical(physical: string, language: Language): string {
    const physicals: Record<string, Partial<Record<Language, string>>> = {
      heavy: { [Language.ENGLISH]: 'heavy', [Language.SPANISH]: 'pesado', [Language.FRENCH]: 'lourd', [Language.GERMAN]: 'schwer', [Language.JAPANESE]: '重い', [Language.MANDARIN]: '沉重的', [Language.PORTUGUESE]: 'pesado', [Language.ITALIAN]: 'pesante' },
      fragile: { [Language.ENGLISH]: 'fragile', [Language.SPANISH]: 'frágil', [Language.FRENCH]: 'fragile', [Language.GERMAN]: 'zerbrechlich', [Language.JAPANESE]: '壊れやすい', [Language.MANDARIN]: '易碎的', [Language.PORTUGUESE]: 'frágil', [Language.ITALIAN]: 'fragile' }
    };

    return physicals[physical]?.[language] || physicals[physical]?.[Language.ENGLISH] || physical;
  }

  private getDetailedTemplates(language: Language) {
    // Placeholder for future expansion
    return {};
  }

  private getExaminingTemplates(language: Language) {
    const templates: Partial<Record<Language, { youSee: string }>> = {
      [Language.ENGLISH]: { youSee: 'You see {size} {material} {noun}.' },
      [Language.SPANISH]: { youSee: 'Ves {size} {noun} {material}.' },
      [Language.FRENCH]: { youSee: 'Vous voyez {size} {noun} {material}.' },
      [Language.GERMAN]: { youSee: 'Sie sehen {size} {material} {noun}.' },
      [Language.JAPANESE]: { youSee: '{size}{material}{noun}が見えます。' },
      [Language.MANDARIN]: { youSee: '你看到一个{size}{material}{noun}。' },
      [Language.PORTUGUESE]: { youSee: 'Você vê {size} {noun} {material}.' },
      [Language.ITALIAN]: { youSee: 'Vedi {size} {noun} {material}.' }
    };

    return templates[language] || templates[Language.ENGLISH];
  }
}
