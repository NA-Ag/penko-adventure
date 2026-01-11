/**
 * PackMetrics - Manages ratings and download counts for content packs
 *
 * This is a client-side system using localStorage.
 * For Phase 7B, this provides basic functionality.
 * In the future, this could be backed by a serverless database.
 */

const RATINGS_KEY = 'penko_pack_ratings';
const DOWNLOADS_KEY = 'penko_pack_downloads';
const USER_RATINGS_KEY = 'penko_user_ratings'; // Track what user has rated

interface PackRating {
  packId: string;
  totalRating: number;  // Sum of all ratings
  count: number;        // Number of ratings
  average: number;      // Average rating (0-5)
}

interface PackDownloads {
  packId: string;
  count: number;
}

interface UserRating {
  packId: string;
  rating: number;       // 1-5
  timestamp: string;
}

/**
 * Get all pack ratings
 */
function getAllRatings(): Record<string, PackRating> {
  try {
    const stored = localStorage.getItem(RATINGS_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch (err) {
    console.error('Error loading ratings:', err);
    return {};
  }
}

/**
 * Get all download counts
 */
function getAllDownloads(): Record<string, PackDownloads> {
  try {
    const stored = localStorage.getItem(DOWNLOADS_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch (err) {
    console.error('Error loading downloads:', err);
    return {};
  }
}

/**
 * Get user's ratings
 */
function getUserRatings(): Record<string, UserRating> {
  try {
    const stored = localStorage.getItem(USER_RATINGS_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch (err) {
    console.error('Error loading user ratings:', err);
    return {};
  }
}

/**
 * Save ratings
 */
function saveRatings(ratings: Record<string, PackRating>): void {
  localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
}

/**
 * Save downloads
 */
function saveDownloads(downloads: Record<string, PackDownloads>): void {
  localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(downloads));
}

/**
 * Save user ratings
 */
function saveUserRatings(userRatings: Record<string, UserRating>): void {
  localStorage.setItem(USER_RATINGS_KEY, JSON.stringify(userRatings));
}

/**
 * Get rating for a specific pack
 */
export function getPackRating(packId: string): PackRating | null {
  const ratings = getAllRatings();
  return ratings[packId] || null;
}

/**
 * Get download count for a specific pack
 */
export function getPackDownloadCount(packId: string): number {
  const downloads = getAllDownloads();
  return downloads[packId]?.count || 0;
}

/**
 * Get user's rating for a specific pack
 */
export function getUserPackRating(packId: string): number | null {
  const userRatings = getUserRatings();
  return userRatings[packId]?.rating || null;
}

/**
 * Rate a pack (1-5 stars)
 */
export function ratePack(packId: string, rating: number): void {
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  const ratings = getAllRatings();
  const userRatings = getUserRatings();

  // Check if user has already rated
  const existingUserRating = userRatings[packId];

  if (!ratings[packId]) {
    // First rating for this pack
    ratings[packId] = {
      packId,
      totalRating: rating,
      count: 1,
      average: rating,
    };
  } else if (existingUserRating) {
    // User is changing their rating
    const oldRating = existingUserRating.rating;
    ratings[packId].totalRating = ratings[packId].totalRating - oldRating + rating;
    ratings[packId].average = ratings[packId].totalRating / ratings[packId].count;
  } else {
    // New rating from this user
    ratings[packId].totalRating += rating;
    ratings[packId].count += 1;
    ratings[packId].average = ratings[packId].totalRating / ratings[packId].count;
  }

  // Save user's rating
  userRatings[packId] = {
    packId,
    rating,
    timestamp: new Date().toISOString(),
  };

  saveRatings(ratings);
  saveUserRatings(userRatings);
}

/**
 * Increment download count for a pack
 */
export function incrementDownloadCount(packId: string): void {
  const downloads = getAllDownloads();

  if (!downloads[packId]) {
    downloads[packId] = {
      packId,
      count: 1,
    };
  } else {
    downloads[packId].count += 1;
  }

  saveDownloads(downloads);
}

/**
 * Get all ratings and downloads for enriching pack index
 */
export function enrichPacksWithMetrics<T extends { id: string }>(
  packs: T[]
): (T & { rating?: number; ratingCount?: number; downloadCount?: number })[] {
  const ratings = getAllRatings();
  const downloads = getAllDownloads();

  return packs.map(pack => ({
    ...pack,
    rating: ratings[pack.id]?.average,
    ratingCount: ratings[pack.id]?.count,
    downloadCount: downloads[pack.id]?.count || 0,
  }));
}

/**
 * Clear all metrics (for testing/debugging)
 */
export function clearAllMetrics(): void {
  localStorage.removeItem(RATINGS_KEY);
  localStorage.removeItem(DOWNLOADS_KEY);
  localStorage.removeItem(USER_RATINGS_KEY);
}

/**
 * Get metrics summary
 */
export function getMetricsSummary() {
  const ratings = getAllRatings();
  const downloads = getAllDownloads();
  const userRatings = getUserRatings();

  return {
    totalRatings: Object.values(ratings).reduce((sum, r) => sum + r.count, 0),
    totalDownloads: Object.values(downloads).reduce((sum, d) => sum + d.count, 0),
    userRatingsCount: Object.keys(userRatings).length,
    packsRated: Object.keys(ratings).length,
    packsDownloaded: Object.keys(downloads).length,
  };
}
