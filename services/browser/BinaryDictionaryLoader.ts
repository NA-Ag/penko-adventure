/**
 * Binary Dictionary Loader
 *
 * TIER 12: Loads and parses msgpack-encoded binary dictionaries
 * - Uses msgpack for efficient binary serialization
 * - Applies gzip decompression
 * - Achieves 67% reduction for dictionaries, 83% for morphology
 */

import pako from 'pako';
import { decode } from 'msgpack-lite';

/**
 * Parse a .pbd.gz binary dictionary file
 * Format: msgpack + gzip
 */
export async function loadBinaryDictionary(arrayBuffer: ArrayBuffer): Promise<Record<string, string>> {
  const data = new Uint8Array(arrayBuffer);

  try {
    // Try decompressing as gzip first
    const decompressed = pako.ungzip(data);
    const dictionary = decode(decompressed) as Record<string, string>;
    return dictionary;
  } catch (error) {
    // If gzip fails, the data might already be decompressed (Vite auto-decompression)
    // Try decoding directly as msgpack
    try {
      const dictionary = decode(data) as Record<string, string>;
      return dictionary;
    } catch (msgpackError) {
      throw new Error(`Failed to load dictionary: ${error}`);
    }
  }
}

/**
 * Parse a .pbm.gz binary morphology file
 * Format: msgpack + gzip
 */
export async function loadBinaryMorphology(arrayBuffer: ArrayBuffer): Promise<any> {
  const data = new Uint8Array(arrayBuffer);

  try {
    // Try decompressing as gzip first
    const decompressed = pako.ungzip(data);
    const morphology = decode(decompressed);
    return morphology;
  } catch (error) {
    // If gzip fails, the data might already be decompressed (Vite auto-decompression)
    // Try decoding directly as msgpack
    try {
      const morphology = decode(data);
      return morphology;
    } catch (msgpackError) {
      throw new Error(`Failed to load morphology: ${error}`);
    }
  }
}
