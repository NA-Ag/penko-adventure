/**
 * Content Pack Loader
 *
 * Handles loading, validating, and managing content packs.
 * Enables the Community Engine to switch between different genres dynamically.
 *
 * Design Philosophy:
 * - Content packs are loaded on-demand
 * - Validation ensures pack integrity before loading
 * - Caching prevents redundant fetches
 * - Supports both local and remote packs
 */

import {
  ContentPack,
  ContentPackIndex,
  ContentPackIndexEntry,
  ContentPackGenre,
  DifficultyLevel,
} from '../../types/ContentPack';
import { Language } from '../../types';

/**
 * Content Pack Loader Configuration
 */
export interface ContentPackLoaderConfig {
  packDirectory?: string;        // Base path for content packs (default: '/content-packs/')
  enableCaching?: boolean;       // Cache loaded packs (default: true)
  validateOnLoad?: boolean;      // Validate pack structure (default: true)
}

/**
 * Content Pack Loader
 *
 * Responsible for:
 * - Loading content packs from JSON files
 * - Validating pack structure and content
 * - Caching loaded packs for performance
 * - Providing pack discovery/browsing
 */
export class ContentPackLoader {
  private config: Required<ContentPackLoaderConfig>;
  private cache: Map<string, ContentPack> = new Map();
  private index: ContentPackIndex | null = null;

  constructor(config?: ContentPackLoaderConfig) {
    this.config = {
      packDirectory: '/content-packs/',
      enableCaching: true,
      validateOnLoad: true,
      ...config,
    };
  }

  /**
   * Load the content pack index
   * Lists all available packs
   */
  async loadIndex(): Promise<ContentPackIndex> {
    // Return cached index if available
    if (this.index) {
      return this.index;
    }

    try {
      // Load both official and community indices
      const officialIndexPath = `${this.config.packDirectory}official/index.json`;
      const communityIndexPath = `${this.config.packDirectory}community/index.json`;

      const [officialResponse, communityResponse] = await Promise.allSettled([
        fetch(officialIndexPath),
        fetch(communityIndexPath)
      ]);

      const allPacks: ContentPackIndexEntry[] = [];

      // Add official packs
      if (officialResponse.status === 'fulfilled' && officialResponse.value.ok) {
        const officialIndex = await officialResponse.value.json() as ContentPackIndex;
        allPacks.push(...officialIndex.contentPacks);
      }

      // Add community packs
      if (communityResponse.status === 'fulfilled' && communityResponse.value.ok) {
        const communityIndex = await communityResponse.value.json() as ContentPackIndex;
        allPacks.push(...communityIndex.contentPacks);
      }

      // Create combined index
      this.index = {
        lastUpdated: new Date().toISOString(),
        totalPacks: allPacks.length,
        contentPacks: allPacks,
      };

      return this.index;
    } catch (error) {
      console.warn('Failed to load content pack index:', error);

      // Return empty index on error
      this.index = {
        lastUpdated: new Date().toISOString(),
        totalPacks: 0,
        contentPacks: [],
      };

      return this.index;
    }
  }

  /**
   * Load a specific content pack by ID
   */
  async loadPack(packId: string): Promise<ContentPack> {
    // Check cache first
    if (this.config.enableCaching && this.cache.has(packId)) {
      return this.cache.get(packId)!;
    }

    // Load index to find pack location
    const index = await this.loadIndex();
    const packEntry = index.contentPacks.find(p => p.id === packId);

    if (!packEntry) {
      throw new Error(`Content pack not found: ${packId}`);
    }

    // Fetch the pack
    const packPath = packEntry.filePath.startsWith('/')
      ? packEntry.filePath
      : `${this.config.packDirectory}${packEntry.filePath}`;

    const response = await fetch(packPath);

    if (!response.ok) {
      throw new Error(`Failed to load content pack: ${response.statusText}`);
    }

    const pack = await response.json() as ContentPack;

    // Validate if enabled
    if (this.config.validateOnLoad) {
      this.validatePack(pack);
    }

    // Cache the pack
    if (this.config.enableCaching) {
      this.cache.set(packId, pack);
    }

    return pack;
  }

  /**
   * Browse content packs by filters
   */
  async browsePacks(filters?: {
    genre?: ContentPackGenre;
    difficulty?: DifficultyLevel;
    language?: Language;
    tags?: string[];
  }): Promise<ContentPackIndexEntry[]> {
    const index = await this.loadIndex();
    let packs = index.contentPacks;

    // Apply filters
    if (filters) {
      if (filters.genre) {
        packs = packs.filter(p => p.genre === filters.genre);
      }

      if (filters.difficulty) {
        packs = packs.filter(p => p.difficulty === filters.difficulty);
      }

      if (filters.language) {
        packs = packs.filter(p => p.supportedLanguage === filters.language);
      }

      if (filters.tags && filters.tags.length > 0) {
        packs = packs.filter(p =>
          filters.tags!.some(tag => p.tags.includes(tag))
        );
      }
    }

    return packs;
  }

  /**
   * Get pack metadata without loading the full pack
   */
  async getPackMetadata(packId: string): Promise<ContentPackIndexEntry | null> {
    const index = await this.loadIndex();
    return index.contentPacks.find(p => p.id === packId) || null;
  }

  /**
   * Validate content pack structure
   */
  private validatePack(pack: ContentPack): void {
    // Validate metadata
    if (!pack.metadata) {
      throw new Error('Content pack missing metadata');
    }

    const requiredMetadataFields = [
      'id', 'version', 'title', 'description', 'author',
      'genre', 'supportedLanguage', 'difficulty'
    ];

    for (const field of requiredMetadataFields) {
      if (!(field in pack.metadata)) {
        throw new Error(`Content pack metadata missing required field: ${field}`);
      }
    }

    // Validate world
    if (!pack.world) {
      throw new Error('Content pack missing world definition');
    }

    if (!pack.world.startingLocationId) {
      throw new Error('Content pack world missing startingLocationId');
    }

    if (!pack.world.locations || pack.world.locations.length === 0) {
      throw new Error('Content pack must have at least one location');
    }

    // Validate starting location exists
    const startingLocation = pack.world.locations.find(
      loc => loc.id === pack.world.startingLocationId
    );

    if (!startingLocation) {
      throw new Error(
        `Starting location "${pack.world.startingLocationId}" not found in locations array`
      );
    }

    // Validate location structure
    for (const location of pack.world.locations) {
      if (!location.id) {
        throw new Error('Location missing id field');
      }

      // Accept either text (legacy) or description (new format)
      if (!location.text && !location.description) {
        throw new Error(`Location "${location.id}" missing text or description field`);
      }

      // Validate exit references
      if (location.exits) {
        for (const exit of location.exits) {
          const targetLocation = pack.world.locations.find(
            loc => loc.id === exit.locationId
          );

          if (!targetLocation) {
            console.warn(
              `Location "${location.id}" has exit to non-existent location "${exit.locationId}"`
            );
          }
        }
      }
    }

    // Validate object references (if objects are used)
    if (pack.world.objects && pack.world.objects.length > 0) {
      const objectIds = new Set(pack.world.objects.map(obj => obj.id));

      for (const location of pack.world.locations) {
        if (location.objects) {
          for (const objectId of location.objects) {
            if (!objectIds.has(objectId)) {
              console.warn(
                `Location "${location.id}" references non-existent object "${objectId}"`
              );
            }
          }
        }
      }
    }

    // Validation passed
    console.log(`✅ Content pack "${pack.metadata.id}" validated successfully`);
  }

  /**
   * Clear the pack cache
   */
  clearCache(): void {
    this.cache.clear();
    this.index = null;
  }

  /**
   * Preload multiple packs (for performance)
   */
  async preloadPacks(packIds: string[]): Promise<void> {
    const loadPromises = packIds.map(id => this.loadPack(id).catch(err => {
      console.warn(`Failed to preload pack "${id}":`, err);
    }));

    await Promise.all(loadPromises);
  }

  /**
   * Get all packs for a specific genre
   */
  async getPacksByGenre(genre: ContentPackGenre): Promise<ContentPackIndexEntry[]> {
    return this.browsePacks({ genre });
  }

  /**
   * Get all packs for a specific difficulty
   */
  async getPacksByDifficulty(difficulty: DifficultyLevel): Promise<ContentPackIndexEntry[]> {
    return this.browsePacks({ difficulty });
  }

  /**
   * Get all packs for a specific language
   */
  async getPacksByLanguage(language: Language): Promise<ContentPackIndexEntry[]> {
    return this.browsePacks({ language });
  }

  /**
   * Search packs by text query (title or description)
   */
  async searchPacks(query: string, language: Language = Language.ENGLISH): Promise<ContentPackIndexEntry[]> {
    const index = await this.loadIndex();
    const lowerQuery = query.toLowerCase();

    return index.contentPacks.filter(pack => {
      const title = pack.title[language]?.toLowerCase() || '';
      const description = pack.description[language]?.toLowerCase() || '';
      const author = pack.author.toLowerCase();
      const tags = pack.tags.join(' ').toLowerCase();

      return (
        title.includes(lowerQuery) ||
        description.includes(lowerQuery) ||
        author.includes(lowerQuery) ||
        tags.includes(lowerQuery)
      );
    });
  }

  /**
   * Get cache statistics (for debugging)
   */
  getCacheStats(): {
    cachedPacks: number;
    cachedPackIds: string[];
    indexLoaded: boolean;
  } {
    return {
      cachedPacks: this.cache.size,
      cachedPackIds: Array.from(this.cache.keys()),
      indexLoaded: this.index !== null,
    };
  }
}

/**
 * Create a default content pack loader instance
 */
export function createContentPackLoader(config?: ContentPackLoaderConfig): ContentPackLoader {
  return new ContentPackLoader(config);
}

/**
 * Global singleton instance (optional - can create multiple loaders)
 */
let globalLoader: ContentPackLoader | null = null;

export function getGlobalContentPackLoader(): ContentPackLoader {
  if (!globalLoader) {
    globalLoader = createContentPackLoader();
  }
  return globalLoader;
}
