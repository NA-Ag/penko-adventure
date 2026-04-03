import type { NarrativeGenre } from '../types';
import type { ContentPack } from '../types/ContentPack';

/**
 * Content Pack Loader Service (Phase 9)
 *
 * Loads and validates content packs from various sources:
 * - Official packs from /public/content-packs/official/
 * - Workshop packs from localStorage
 * - Custom uploaded packs (future)
 */

export interface PackMetadata {
  id: string;
  title: Record<string, string>;
  description?: Record<string, string>;
  author: string;
  genre: NarrativeGenre;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  duration: string;
  locationCount?: number;
  questCount?: number;
  eventCount?: number;
  vocabularyCount?: number;
  source: 'official' | 'workshop' | 'custom';
}

export class ContentPackLoader {
  /**
   * List all available official packs
   */
  static async listOfficialPacks(): Promise<PackMetadata[]> {
    // Hardcoded list of official packs from Phase 7
    // TODO: Could load from manifest.json in future
    return [
      {
        id: 'enchanted-forest',
        title: {
          es: 'El Bosque Encantado',
          en: 'The Enchanted Forest',
        },
        description: {
          es: 'Una aventura mágica en un bosque encantado',
          en: 'A magical adventure in an enchanted forest',
        },
        author: 'Penko Official',
        genre: 'fantasy',
        difficulty: 'beginner',
        language: 'es',
        duration: '30-45 minutes',
        locationCount: 3,
        questCount: 2,
        eventCount: 3,
        vocabularyCount: 30,
        source: 'official',
      },
      {
        id: 'space-station-omega',
        title: {
          es: 'Estación Espacial Omega',
          en: 'Space Station Omega',
        },
        description: {
          es: 'Una aventura futurista en una estación espacial dañada',
          en: 'A futuristic adventure on a damaged space station',
        },
        author: 'Penko Official',
        genre: 'scifi',
        difficulty: 'beginner',
        language: 'es',
        duration: '30-45 minutes',
        locationCount: 3,
        questCount: 2,
        eventCount: 3,
        vocabularyCount: 30,
        source: 'official',
      },
      {
        id: 'detective-case',
        title: {
          es: 'El Caso del Detective',
          en: "The Detective's Case",
        },
        description: {
          es: 'Un misterio intrigante que requiere investigación',
          en: 'An intriguing mystery that requires investigation',
        },
        author: 'Penko Official',
        genre: 'mystery',
        difficulty: 'beginner',
        language: 'es',
        duration: '30-45 minutes',
        locationCount: 3,
        questCount: 2,
        eventCount: 3,
        vocabularyCount: 30,
        source: 'official',
      },
      {
        id: 'haunted-manor',
        title: {
          es: 'La Mansión Embrujada',
          en: 'The Haunted Manor',
        },
        description: {
          es: 'Una aventura de terror en una mansión abandonada',
          en: 'A horror adventure in an abandoned manor',
        },
        author: 'Penko Official',
        genre: 'horror',
        difficulty: 'beginner',
        language: 'es',
        duration: '30-45 minutes',
        locationCount: 3,
        questCount: 2,
        eventCount: 4,
        vocabularyCount: 30,
        source: 'official',
      },
      {
        id: 'canyon-showdown',
        title: {
          es: 'Duelo en el Cañón',
          en: 'Canyon Showdown',
        },
        description: {
          es: 'Una aventura del viejo oeste en el desierto árido',
          en: 'An old west adventure in the arid desert',
        },
        author: 'Penko Official',
        genre: 'western',
        difficulty: 'beginner',
        language: 'es',
        duration: '30-45 minutes',
        locationCount: 3,
        questCount: 2,
        eventCount: 3,
        vocabularyCount: 30,
        source: 'official',
      },
      {
        id: 'neon-nights',
        title: {
          es: 'Noches de Neón',
          en: 'Neon Nights',
        },
        description: {
          es: 'Una aventura cyberpunk en una ciudad futurista',
          en: 'A cyberpunk adventure in a futuristic city',
        },
        author: 'Penko Official',
        genre: 'cyberpunk',
        difficulty: 'beginner',
        language: 'es',
        duration: '30-45 minutes',
        locationCount: 3,
        questCount: 2,
        eventCount: 3,
        vocabularyCount: 30,
        source: 'official',
      },
    ];
  }

  /**
   * Load an official pack by ID
   */
  static async loadOfficialPack(packId: string): Promise<ContentPack> {
    try {
      const response = await fetch(`/content-packs/official/${packId}.json`);

      if (!response.ok) {
        throw new Error(
          `Failed to load pack: ${response.status} ${response.statusText}`
        );
      }

      const pack = await response.json();
      this.validatePack(pack);

      return pack;
    } catch (error) {
      console.error(`Error loading pack ${packId}:`, error);
      throw new Error(
        `Could not load pack "${packId}". ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * List workshop packs from localStorage
   */
  static listWorkshopPacks(): PackMetadata[] {
    const packs: PackMetadata[] = [];

    // Iterate through localStorage to find content packs
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('contentpack_')) {
        try {
          const stored = localStorage.getItem(key);
          if (!stored) continue;

          const pack = JSON.parse(stored);
          const packId = key.replace('contentpack_', '');

          // Create metadata from pack
          const metadata: PackMetadata = {
            id: packId,
            title: pack.metadata?.title || { en: 'Untitled Pack' },
            description: pack.metadata?.description,
            author: pack.metadata?.author || 'Unknown',
            genre: pack.metadata?.genre || 'fantasy',
            difficulty: pack.metadata?.difficulty || 'beginner',
            language: pack.metadata?.supportedLanguage || 'en',
            duration: pack.metadata?.estimatedDuration || 'Unknown',
            locationCount: pack.world?.locations?.length || 0,
            questCount: pack.world?.quests?.length || 0,
            eventCount: pack.events?.length || 0,
            vocabularyCount:
              (Object.keys(pack.vocabulary?.verbs || {}).length || 0) +
              (Object.keys(pack.vocabulary?.nouns || {}).length || 0) +
              (Object.keys(pack.vocabulary?.adjectives || {}).length || 0),
            source: 'workshop',
          };

          packs.push(metadata);
        } catch (error) {
          console.error(`Error parsing workshop pack ${key}:`, error);
        }
      }
    }

    return packs;
  }

  /**
   * Load a workshop pack from localStorage
   */
  static loadWorkshopPack(packId: string): ContentPack {
    const stored = localStorage.getItem(`contentpack_${packId}`);

    if (!stored) {
      throw new Error(`Workshop pack "${packId}" not found in localStorage`);
    }

    try {
      const pack = JSON.parse(stored);
      this.validatePack(pack);
      return pack;
    } catch (error) {
      console.error(`Error loading workshop pack ${packId}:`, error);
      throw new Error(
        `Could not load workshop pack "${packId}". ${
          error instanceof Error ? error.message : 'Invalid pack format'
        }`
      );
    }
  }

  /**
   * Validate pack structure
   */
  private static validatePack(pack: any): void {
    const errors: string[] = [];

    // Validate metadata
    if (!pack.metadata) {
      errors.push('Missing metadata section');
    } else {
      if (!pack.metadata.title || Object.keys(pack.metadata.title).length === 0) {
        errors.push('Pack must have at least one title translation');
      }
      if (!pack.metadata.supportedLanguage) {
        errors.push('Pack must specify a supported language');
      }
    }

    // Validate world
    if (!pack.world) {
      errors.push('Missing world section');
    } else {
      if (!pack.world.locations || pack.world.locations.length === 0) {
        errors.push('Pack must have at least one location');
      }
      if (!pack.world.startingLocationId) {
        errors.push('Pack must specify a starting location');
      }
      if (pack.world.startingLocationId && pack.world.locations) {
        const startingLocation = pack.world.locations.find(
          (l: any) => l.id === pack.world.startingLocationId
        );
        if (!startingLocation) {
          errors.push(
            `Starting location "${pack.world.startingLocationId}" not found in locations`
          );
        }
      }
    }

    // Validate events array exists (can be empty)
    if (!Array.isArray(pack.events)) {
      errors.push('Pack must have an events array (can be empty)');
    }

    // Validate vocabulary exists (can be empty)
    if (!pack.vocabulary) {
      errors.push('Pack must have a vocabulary object (can be empty)');
    } else {
      if (!pack.vocabulary.verbs) errors.push('Missing vocabulary.verbs');
      if (!pack.vocabulary.nouns) errors.push('Missing vocabulary.nouns');
      if (!pack.vocabulary.adjectives) errors.push('Missing vocabulary.adjectives');
    }

    if (errors.length > 0) {
      throw new Error(
        `Pack validation failed:\n${errors.map((e) => `  - ${e}`).join('\n')}`
      );
    }
  }

  /**
   * Get pack statistics
   */
  static getPackStats(pack: any): {
    locations: number;
    npcs: number;
    items: number;
    quests: number;
    events: number;
    vocabularyWords: number;
  } {
    return {
      locations: pack.world.locations?.length || 0,
      npcs: pack.world.npcs?.length || 0,
      items: pack.world.items?.length || 0,
      quests: pack.world.quests?.length || 0,
      events: pack.events?.length || 0,
      vocabularyWords:
        Object.keys(pack.vocabulary?.verbs || {}).length +
        Object.keys(pack.vocabulary?.nouns || {}).length +
        Object.keys(pack.vocabulary?.adjectives || {}).length,
    };
  }

  /**
   * Delete a workshop pack from localStorage
   */
  static deleteWorkshopPack(packId: string): void {
    localStorage.removeItem(`contentpack_${packId}`);
  }

  /**
   * Import a custom pack from JSON string
   */
  static importCustomPack(jsonString: string, packId?: string): ContentPack {
    try {
      const pack = JSON.parse(jsonString);
      this.validatePack(pack);

      // Save to localStorage if ID provided
      if (packId) {
        localStorage.setItem(`contentpack_${packId}`, jsonString);
      }

      return pack;
    } catch (error) {
      console.error('Error importing custom pack:', error);
      throw new Error(
        `Could not import custom pack. ${
          error instanceof Error ? error.message : 'Invalid JSON'
        }`
      );
    }
  }

  /**
   * Export a pack to JSON string
   */
  static exportPack(pack: ContentPack): string {
    return JSON.stringify(pack, null, 2);
  }

  /**
   * Download pack as JSON file
   */
  static downloadPack(pack: ContentPack, filename?: string): void {
    const json = this.exportPack(pack);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download =
      filename ||
      `${(pack.metadata.title as any).en || 'content-pack'}.json`.replace(/\s+/g, '-').toLowerCase();
    a.click();

    URL.revokeObjectURL(url);
  }
}
