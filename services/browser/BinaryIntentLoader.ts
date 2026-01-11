/**
 * Binary Intent Loader
 *
 * TIER 15: Loads and parses msgpack-encoded binary universal intent vocabulary
 * - Uses msgpack for efficient binary serialization
 * - Applies gzip decompression
 * - Achieves 63.3% reduction for universal vocabulary (11.8 KB → 4.3 KB)
 * - Contains 726 phrases across 12 languages for 15 intents
 */

import pako from 'pako';
import { decode } from 'msgpack-lite';
import type { IntentPhraseMap } from '../../types/ContentPack';

/**
 * Parse a .pbu.gz binary universal vocabulary file
 * Format: msgpack + gzip
 */
export async function loadBinaryUniversalVocabulary(
  arrayBuffer: ArrayBuffer
): Promise<Record<string, IntentPhraseMap>> {
  const data = new Uint8Array(arrayBuffer);

  try {
    // Try decompressing as gzip first
    const decompressed = pako.ungzip(data);
    const vocabulary = decode(decompressed) as Record<string, IntentPhraseMap>;
    return vocabulary;
  } catch (error) {
    // If gzip fails, the data might already be decompressed (Vite auto-decompression)
    // Try decoding directly as msgpack
    try {
      const vocabulary = decode(data) as Record<string, IntentPhraseMap>;
      return vocabulary;
    } catch (msgpackError) {
      throw new Error(`Failed to load universal vocabulary: ${error}`);
    }
  }
}
