import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { ContentPack, ContentPackIndexEntry, ContentPackGenre } from '../types/ContentPack';
import { Language } from '../types';
import { getGlobalContentPackLoader } from '../services/community/ContentPackLoader';
import {
  getLocalPackIndex,
  addLocalPack,
  removeLocalPack,
  loadPackFromFile,
  PackValidationError,
  getLocalPackById,
} from '../services/community/LocalPackManager';
import {
  enrichPacksWithMetrics,
  incrementDownloadCount,
  ratePack,
  getUserPackRating,
} from '../services/community/PackMetrics';

interface ContentPackBrowserProps {
  onSelectPack: (pack: ContentPack) => void;
  onBack?: () => void;
  nativeLanguage?: string; // UI language (e.g., 'en', 'es')
}

type TabType = 'all' | 'official' | 'community' | 'local';

const genreColors: Partial<Record<ContentPackGenre, string>> = {
  fantasy: 'from-purple-600 to-pink-600',
  scifi: 'from-blue-600 to-cyan-600',
  mystery: 'from-gray-600 to-slate-600',
  horror: 'from-red-900 to-black',
  cyberpunk: 'from-pink-600 to-purple-900',
  contemporary: 'from-green-600 to-blue-600',
  adventure: 'from-yellow-600 to-orange-600',
  historical: 'from-amber-700 to-brown-700',
  comedy: 'from-pink-500 to-yellow-500',
  educational: 'from-indigo-600 to-purple-600',
  custom: 'from-gray-600 to-slate-600',
};

const genreEmojis: Partial<Record<ContentPackGenre, string>> = {
  fantasy: '🏰',
  scifi: '🚀',
  mystery: '🔍',
  horror: '👻',
  cyberpunk: '🌃',
  contemporary: '🏙️',
  adventure: '🗺️',
  historical: '📜',
  comedy: '😄',
  educational: '📚',
  custom: '🎨',
};

export const ContentPackBrowser: React.FC<ContentPackBrowserProps> = ({
  onSelectPack,
  onBack,
  nativeLanguage = 'en',
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [packs, setPacks] = useState<ContentPackIndexEntry[]>([]);
  const [filteredPacks, setFilteredPacks] = useState<ContentPackIndexEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingPackId, setLoadingPackId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<ContentPackGenre | 'all'>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'alphabetical' | 'rating'>('newest');

  const loader = getGlobalContentPackLoader();

  // Helper to get localized text with fallback
  const getLocalizedText = (translations: Record<string, string>): string => {
    // Try native language first
    if (translations[nativeLanguage]) return translations[nativeLanguage];
    // Fallback to English
    if (translations.en) return translations.en;
    // Fallback to first available
    return translations[Object.keys(translations)[0]] || 'Untitled';
  };

  useEffect(() => {
    loadPacks();
  }, [activeTab]);

  // Apply search, filter, and sort whenever they change
  useEffect(() => {
    let result = [...packs];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(pack => {
        const title = getLocalizedText(pack.title).toLowerCase();
        const author = pack.author.toLowerCase();
        const tags = pack.tags.join(' ').toLowerCase();
        return title.includes(query) || author.includes(query) || tags.includes(query);
      });
    }

    // Genre filter
    if (selectedGenre !== 'all') {
      result = result.filter(pack => pack.genre === selectedGenre);
    }

    // Language filter
    if (selectedLanguage !== 'all') {
      result = result.filter(pack => pack.supportedLanguage === selectedLanguage);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      result = result.filter(pack => pack.difficulty === selectedDifficulty);
    }

    // Sort
    if (sortBy === 'newest') {
      result.sort((a, b) => {
        const dateA = new Date(a.submittedAt || 0).getTime();
        const dateB = new Date(b.submittedAt || 0).getTime();
        return dateB - dateA; // Newest first
      });
    } else if (sortBy === 'alphabetical') {
      result.sort((a, b) => {
        const titleA = getLocalizedText(a.title).toLowerCase();
        const titleB = getLocalizedText(b.title).toLowerCase();
        return titleA.localeCompare(titleB);
      });
    } else if (sortBy === 'rating') {
      result.sort((a, b) => {
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        return ratingB - ratingA; // Highest rated first
      });
    }

    setFilteredPacks(result);
  }, [packs, searchQuery, selectedGenre, selectedLanguage, selectedDifficulty, sortBy]);

  const loadPacks = async () => {
    setLoading(true);
    setError(null);

    try {
      let loadedPacks: ContentPackIndexEntry[];

      if (activeTab === 'local') {
        // Load local packs from localStorage
        loadedPacks = getLocalPackIndex();
      } else {
        // Load remote packs from index
        const index = await loader.loadIndex();
        let filteredPacks = index.contentPacks;

        // Filter by tab
        if (activeTab === 'official') {
          filteredPacks = filteredPacks.filter(p => p.id.startsWith('official_'));
        } else if (activeTab === 'community') {
          filteredPacks = filteredPacks.filter(p => p.id.startsWith('community_'));
        }

        loadedPacks = filteredPacks;
      }

      // Enrich with ratings and download counts
      const enrichedPacks = enrichPacksWithMetrics(loadedPacks);
      setPacks(enrichedPacks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load packs');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPack = async (pack: ContentPackIndexEntry) => {
    setLoadingPackId(pack.id);
    setError(null);

    try {
      let loadedPack: ContentPack;

      // Check if this is a local pack
      if (pack.filePath === 'local') {
        const localPack = getLocalPackById(pack.id);
        if (!localPack) {
          throw new Error('Local pack not found');
        }
        loadedPack = localPack;
      } else {
        // Load from remote
        loadedPack = await loader.loadPack(pack.id);
      }

      // Increment download/play counter
      incrementDownloadCount(pack.id);

      onSelectPack(loadedPack);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pack');
      setLoadingPackId(null);
    }
  };

  /**
   * Handle file input for loading local packs
   */
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      toast.loading('Loading pack from file...', { id: 'load-pack' });

      // Load and validate the pack
      const pack = await loadPackFromFile(file);

      // Add to local storage
      addLocalPack(pack);

      toast.success(`✅ Pack loaded: ${pack.metadata.title[Language.ENGLISH] || 'Untitled'}`, { id: 'load-pack' });

      // Refresh the local packs list if we're on the local tab
      if (activeTab === 'local') {
        loadPacks();
      }

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      if (err instanceof PackValidationError) {
        toast.error(`❌ Invalid pack: ${err.message}`, { id: 'load-pack' });
      } else {
        toast.error(`❌ Failed to load pack: ${err}`, { id: 'load-pack' });
      }
      console.error('Pack load error:', err);
    }
  };

  /**
   * Trigger file input click
   */
  const handleLoadFromFile = () => {
    fileInputRef.current?.click();
  };

  /**
   * Delete a local pack
   */
  const handleDeleteLocalPack = (packId: string) => {
    if (confirm('Delete this pack from your local collection?')) {
      const success = removeLocalPack(packId);
      if (success) {
        toast.success('Pack deleted');
        loadPacks(); // Refresh list
      } else {
        toast.error('Failed to delete pack');
      }
    }
  };

  return (
    <div className="min-h-screen h-screen overflow-y-auto bg-gray-900 text-white p-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Choose Your Adventure</h1>
            <p className="text-gray-400">
              Select a content pack to start your language learning journey
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleLoadFromFile}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              📁 Load Pack from File
            </button>
            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
              >
                ← Back
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'all'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            All Packs
            {activeTab === 'all' && packs.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-600 rounded-full text-xs">
                {packs.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('official')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'official'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Official
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'community'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Community
          </button>
          <button
            onClick={() => setActiveTab('local')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'local'
                ? 'text-white border-b-2 border-purple-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            📁 Local Files
            {activeTab === 'local' && packs.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-purple-600 rounded-full text-xs">
                {packs.length}
              </span>
            )}
          </button>
        </div>

        {/* Search and Filters */}
        {packs.length > 0 && !loading && (
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="🔍 Search by title, author, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Filters and Sort */}
            <div className="flex flex-wrap gap-3">
              {/* Genre Filter */}
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value as ContentPackGenre | 'all')}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All Genres</option>
                <option value="fantasy">🏰 Fantasy</option>
                <option value="scifi">🚀 Sci-Fi</option>
                <option value="cyberpunk">🌃 Cyberpunk</option>
                <option value="mystery">🔍 Mystery</option>
                <option value="horror">👻 Horror</option>
                <option value="adventure">🗺️ Adventure</option>
                <option value="historical">📜 Historical</option>
                <option value="contemporary">🏙️ Contemporary</option>
                <option value="comedy">😄 Comedy</option>
                <option value="educational">📚 Educational</option>
                <option value="custom">🎨 Custom</option>
              </select>

              {/* Language Filter */}
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All Languages</option>
                <option value="es">Spanish (ES)</option>
                <option value="fr">French (FR)</option>
                <option value="de">German (DE)</option>
                <option value="it">Italian (IT)</option>
                <option value="pt">Portuguese (PT)</option>
                <option value="ru">Russian (RU)</option>
                <option value="ja">Japanese (JA)</option>
                <option value="zh">Chinese (ZH)</option>
                <option value="ko">Korean (KO)</option>
                <option value="ar">Arabic (AR)</option>
                <option value="hi">Hindi (HI)</option>
                <option value="en">English (EN)</option>
              </select>

              {/* Difficulty Filter */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner (A1-A2)</option>
                <option value="intermediate">Intermediate (B1-B2)</option>
                <option value="advanced">Advanced (C1-C2)</option>
              </select>

              {/* Sort Options */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'alphabetical' | 'rating')}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="newest">⏰ Newest First</option>
                <option value="alphabetical">🔤 A-Z</option>
                <option value="rating">⭐ Highest Rated</option>
              </select>

              {/* Results Count */}
              <div className="flex items-center px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 text-gray-400">
                {filteredPacks.length} {filteredPacks.length === 1 ? 'pack' : 'packs'}
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-600 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-red-400 text-xl">⚠️</span>
              <div>
                <h3 className="font-bold text-red-400">Error</h3>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="text-4xl mb-4 animate-pulse">⏳</div>
              <p className="text-gray-400">Loading content packs...</p>
            </div>
          </div>
        ) : packs.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="text-6xl mb-4">
              {activeTab === 'local' ? '📁' : '📦'}
            </div>
            <h3 className="text-xl font-bold text-gray-400 mb-2">
              {activeTab === 'local' ? 'No local packs yet' : 'No packs found'}
            </h3>
            <p className="text-gray-500 mb-6">
              {activeTab === 'local'
                ? 'Load content packs shared by the community'
                : activeTab === 'community'
                ? 'No community packs available yet'
                : 'No content packs available'}
            </p>
            {activeTab === 'local' && (
              <button
                onClick={handleLoadFromFile}
                className="px-6 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
              >
                📁 Load Pack from File
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Featured Packs Section */}
            {activeTab === 'all' && filteredPacks.filter(p => p.featured).length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    ✨ Featured Packs
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPacks
                    .filter(p => p.featured)
                    .slice(0, 3)
                    .map((pack) => (
                      <PackCard
                        key={pack.id}
                        pack={pack}
                        onPlay={() => handlePlayPack(pack)}
                        onDelete={pack.filePath === 'local' ? handleDeleteLocalPack : undefined}
                        isLoading={loadingPackId === pack.id}
                        getLocalizedText={getLocalizedText}
                      />
                    ))}
                </div>
                <div className="mt-6 border-t border-gray-700 pt-6">
                  <h2 className="text-xl font-bold text-gray-300 mb-4">All Packs</h2>
                </div>
              </div>
            )}

            {filteredPacks.length === 0 ? (
              /* No Results */
              <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-400 mb-2">
              No packs match your filters
            </h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search or filters
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGenre('all');
                setSelectedLanguage('all');
                setSelectedDifficulty('all');
              }}
              className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          /* Pack Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPacks.map((pack) => (
              <PackCard
                key={pack.id}
                pack={pack}
                onPlay={() => handlePlayPack(pack)}
                onDelete={pack.filePath === 'local' ? handleDeleteLocalPack : undefined}
                isLoading={loadingPackId === pack.id}
                getLocalizedText={getLocalizedText}
              />
            ))}
          </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Pack Card Component
const PackCard: React.FC<{
  pack: ContentPackIndexEntry;
  onPlay: () => void;
  onDelete?: (packId: string) => void;
  isLoading: boolean;
  getLocalizedText: (translations: Record<string, string>) => string;
}> = ({ pack, onPlay, onDelete, isLoading, getLocalizedText }) => {
  const gradient = genreColors[pack.genre] || 'from-gray-600 to-gray-800';
  const emoji = genreEmojis[pack.genre] || '🎮';
  const isLocal = pack.filePath === 'local';

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition-all hover:shadow-xl hover:scale-105">
      {/* Genre Banner */}
      <div className={`h-32 bg-gradient-to-br ${gradient} flex items-center justify-center relative`}>
        <div className="text-6xl filter drop-shadow-lg">{emoji}</div>
        {/* Local Pack Badge */}
        {isLocal && (
          <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
            📁 Local
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-2 truncate">
          {getLocalizedText(pack.title)}
        </h3>

        {/* Metadata */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="px-2 py-1 bg-gray-900 rounded text-xs text-gray-300 capitalize">
            {pack.genre}
          </span>
          <span className="px-2 py-1 bg-gray-900 rounded text-xs text-gray-300 uppercase">
            {pack.supportedLanguage}
          </span>
        </div>

        {/* Description */}
        {pack.description && (
          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
            {getLocalizedText(pack.description)}
          </p>
        )}

        {/* Tags */}
        {pack.tags && pack.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {pack.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-blue-900/30 text-blue-300 rounded text-xs">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Author */}
        <div className="text-xs text-gray-500 mb-3">
          by {pack.author}
        </div>

        {/* Ratings and Downloads */}
        <div className="flex items-center gap-3 mb-4 text-sm">
          {/* Rating */}
          {pack.rating !== undefined && pack.ratingCount !== undefined && pack.ratingCount > 0 ? (
            <div className="flex items-center gap-1 text-yellow-400">
              <span>⭐</span>
              <span className="font-medium">{pack.rating.toFixed(1)}</span>
              <span className="text-gray-500 text-xs">({pack.ratingCount})</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-gray-500">
              <span>⭐</span>
              <span className="text-xs">No ratings yet</span>
            </div>
          )}

          {/* Downloads */}
          {pack.downloadCount !== undefined && pack.downloadCount > 0 && (
            <div className="flex items-center gap-1 text-gray-400">
              <span>📥</span>
              <span className="text-xs">{pack.downloadCount} plays</span>
            </div>
          )}

          {/* Featured Badge */}
          {pack.featured && (
            <div className="ml-auto bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-0.5 rounded text-xs font-bold">
              ✨ Featured
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onPlay}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Loading...</span>
              </>
            ) : (
              <>
                <span>▶</span>
                <span>Play Now</span>
              </>
            )}
          </button>
          {/* Delete button for local packs */}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(pack.id);
              }}
              className="px-3 py-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
              title="Delete local pack"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
