
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveGame, loadGame, SaveData } from '../services/saveSystem';
import { UserProfile, Language } from '../types';

describe('SaveSystem', () => {
  const mockProfile: UserProfile = {
    targetLanguage: Language.SPANISH,
    nativeLanguage: Language.ENGLISH,
    theme: 'fantasy',
    ollamaModel: 'llama3.2',
    openaiBaseUrl: 'http://localhost:1234/v1',
    openaiModel: 'local-model'
  };

  const mockSaveData: SaveData = {
    version: '1.3.0',
    timestamp: 1234567890,
    profile: mockProfile,
    turnHistory: [],
    currentHealth: 100,
    inventory: [],
    location: 'TEST_LOC'
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should save game data to localStorage', () => {
    const success = saveGame(mockSaveData);
    expect(success).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith('penko_save_v1', JSON.stringify(mockSaveData));
  });

  it('should load game data from localStorage', () => {
    localStorage.setItem('penko_save_v1', JSON.stringify(mockSaveData));
    const loaded = loadGame();
    expect(loaded).toEqual(mockSaveData);
  });

  it('should return null if no save exists', () => {
    const loaded = loadGame();
    expect(loaded).toBeNull();
  });

  describe('Migration Logic', () => {
    it('should migrate v1.2.0 saves to v1.3.0 by adding missing config fields', () => {
      // Create a legacy save object (missing openai fields)
      const legacySave = {
        version: '1.2.0',
        timestamp: 11111,
        profile: {
          targetLanguage: 'Spanish',
          nativeLanguage: 'English',
          theme: 'fantasy'
          // Missing ollamaModel, openaiBaseUrl, etc.
        },
        turnHistory: [],
        currentHealth: 80,
        inventory: [],
        location: 'OLD_TOWN'
      };

      localStorage.setItem('penko_save_v1', JSON.stringify(legacySave));
      
      const loaded = loadGame();
      
      expect(loaded).not.toBeNull();
      expect(loaded?.version).toBe('1.3.0');
      expect(loaded?.profile.ollamaModel).toBe('llama3.2'); // Default applied
      expect(loaded?.profile.openaiBaseUrl).toBe('http://localhost:1234/v1'); // Default applied
    });
  });
});
