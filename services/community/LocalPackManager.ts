/**
 * LocalPackManager - Manages locally loaded content packs
 *
 * Handles peer-to-peer shared content packs that users load from files.
 * Stores packs in localStorage for persistent access.
 *
 * This enables the "Memory Card" model where users can:
 * - Export packs from World Forge
 * - Share files via Reddit/Discord/etc
 * - Load packs from files shared by others
 * - No central server required!
 */

import { ContentPack, ContentPackIndexEntry } from '../../types/ContentPack';

const LOCAL_PACKS_KEY = 'penko_local_content_packs';
const LOCAL_INDEX_KEY = 'penko_local_content_index';

/**
 * Validation error types
 */
export class PackValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PackValidationError';
  }
}

/**
 * Validate a content pack structure
 */
export function validateContentPack(pack: any): asserts pack is ContentPack {
  // Check root structure
  if (!pack || typeof pack !== 'object') {
    throw new PackValidationError('Invalid pack: Must be a JSON object');
  }

  // Check metadata
  if (!pack.metadata) {
    throw new PackValidationError('Invalid pack: Missing metadata');
  }

  const meta = pack.metadata;
  if (!meta.id || typeof meta.id !== 'string') {
    throw new PackValidationError('Invalid pack: Missing or invalid metadata.id');
  }
  if (!meta.title || typeof meta.title !== 'object') {
    throw new PackValidationError('Invalid pack: Missing or invalid metadata.title');
  }
  if (!meta.author || typeof meta.author !== 'string') {
    throw new PackValidationError('Invalid pack: Missing or invalid metadata.author');
  }
  if (!meta.supportedLanguage || typeof meta.supportedLanguage !== 'string') {
    throw new PackValidationError('Invalid pack: Missing or invalid metadata.supportedLanguage');
  }

  // Check world
  if (!pack.world) {
    throw new PackValidationError('Invalid pack: Missing world definition');
  }

  const world = pack.world;
  if (!world.locations || !Array.isArray(world.locations)) {
    throw new PackValidationError('Invalid pack: Missing or invalid world.locations');
  }
  if (world.locations.length === 0) {
    throw new PackValidationError('Invalid pack: Must have at least one location');
  }
  if (!world.startingLocationId || typeof world.startingLocationId !== 'string') {
    throw new PackValidationError('Invalid pack: Missing or invalid world.startingLocationId');
  }

  // Verify starting location exists
  const startExists = world.locations.some((loc: any) => loc.id === world.startingLocationId);
  if (!startExists) {
    throw new PackValidationError(`Invalid pack: Starting location '${world.startingLocationId}' not found`);
  }
}

/**
 * Get all locally stored content packs
 */
export function getLocalPacks(): ContentPack[] {
  try {
    const stored = localStorage.getItem(LOCAL_PACKS_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as ContentPack[];
  } catch (err) {
    console.error('Error loading local packs:', err);
    return [];
  }
}

/**
 * Get local pack index (for browser display)
 */
export function getLocalPackIndex(): ContentPackIndexEntry[] {
  try {
    const stored = localStorage.getItem(LOCAL_INDEX_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as ContentPackIndexEntry[];
  } catch (err) {
    console.error('Error loading local pack index:', err);
    return [];
  }
}

/**
 * Add a content pack to local storage
 */
export function addLocalPack(pack: ContentPack): void {
  // Validate before adding
  validateContentPack(pack);

  // Get existing packs
  const packs = getLocalPacks();

  // Check for duplicate ID
  const existingIndex = packs.findIndex(p => p.metadata.id === pack.metadata.id);
  if (existingIndex >= 0) {
    // Replace existing pack (update)
    packs[existingIndex] = pack;
  } else {
    // Add new pack
    packs.push(pack);
  }

  // Save packs
  localStorage.setItem(LOCAL_PACKS_KEY, JSON.stringify(packs));

  // Update index
  updateLocalIndex();
}

/**
 * Remove a local pack by ID
 */
export function removeLocalPack(packId: string): boolean {
  const packs = getLocalPacks();
  const filtered = packs.filter(p => p.metadata.id !== packId);

  if (filtered.length === packs.length) {
    return false; // Pack not found
  }

  localStorage.setItem(LOCAL_PACKS_KEY, JSON.stringify(filtered));
  updateLocalIndex();
  return true;
}

/**
 * Get a specific local pack by ID
 */
export function getLocalPackById(packId: string): ContentPack | null {
  const packs = getLocalPacks();
  return packs.find(p => p.metadata.id === packId) || null;
}

/**
 * Update the local pack index (for ContentPackBrowser)
 */
function updateLocalIndex(): void {
  const packs = getLocalPacks();
  const index: ContentPackIndexEntry[] = packs.map(pack => ({
    id: pack.metadata.id,
    title: pack.metadata.title,
    author: pack.metadata.author,
    genre: pack.metadata.genre,
    difficulty: pack.metadata.difficulty,
    supportedLanguage: pack.metadata.supportedLanguage,
    description: pack.metadata.description,
    version: pack.metadata.version,
    filePath: 'local', // Special marker for local packs
    tags: pack.metadata.tags,
    submittedAt: pack.metadata.submittedAt,
  }));

  localStorage.setItem(LOCAL_INDEX_KEY, JSON.stringify(index));
}

/**
 * Load a pack from a File object (from file input)
 */
export async function loadPackFromFile(file: File): Promise<ContentPack> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const pack = JSON.parse(text);

        // Validate the pack
        validateContentPack(pack);

        resolve(pack as ContentPack);
      } catch (err) {
        if (err instanceof PackValidationError) {
          reject(err);
        } else if (err instanceof SyntaxError) {
          reject(new PackValidationError('Invalid JSON file'));
        } else {
          reject(new PackValidationError(`Failed to load pack: ${err}`));
        }
      }
    };

    reader.onerror = () => {
      reject(new PackValidationError('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Clear all local packs (for testing/debugging)
 */
export function clearAllLocalPacks(): void {
  localStorage.removeItem(LOCAL_PACKS_KEY);
  localStorage.removeItem(LOCAL_INDEX_KEY);
}

/**
 * Get statistics about local packs
 */
export function getLocalPackStats() {
  const packs = getLocalPacks();
  const languages = new Set(packs.map(p => p.metadata.supportedLanguage));
  const genres = new Set(packs.map(p => p.metadata.genre));

  return {
    totalPacks: packs.length,
    languages: Array.from(languages),
    genres: Array.from(genres),
    storageUsed: new Blob([JSON.stringify(packs)]).size, // bytes
  };
}
