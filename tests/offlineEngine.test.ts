import { describe, it, expect, beforeEach } from 'vitest';
import { OfflineEngine } from '../services/offlineEngine';
import { UserProfile, Language } from '../types';

describe('OfflineEngine', () => {
  let engine: OfflineEngine;
  
  const mockProfile: UserProfile = {
    targetLanguage: Language.SPANISH,
    nativeLanguage: Language.ENGLISH,
    theme: 'fantasy'
  };

  beforeEach(() => {
    engine = new OfflineEngine(mockProfile);
  });

  it('should initialize with a quest and scene', async () => {
    const turn = await engine.initGame();
    expect(turn).toHaveProperty('narrative');
    expect(turn.narrative).toContain('MISIÓN'); // Quest text in Spanish
    expect(turn.sceneData).toBeDefined();
    expect(turn.health).toBe(100);
  });

  it('should translate narrative correctly', async () => {
    // Test dual generation
    const turn = await engine.initGame();
    expect(turn.nativeTranslation).toBeDefined();
    expect(turn.nativeTranslation).toContain('QUEST'); // English Translation
  });

  describe('Parser Logic', () => {
    it('should detect ATTACK intent in target language', async () => {
        // Mock scene with monster
        (engine as any).sceneState.hasMonster = true;
        (engine as any).sceneState.monsterType = 'wolf';
        (engine as any).sceneState.featureType = 'rock';

        const turn = await engine.processTurn('atacar lobo');
        // ATTACK_HIT template usually starts with "Atacas al..."
        expect(turn.narrative).toMatch(/Atacas al|Golpeas al/);
    });

    it('should detect MOVE intent with natural language', async () => {
        const turn = await engine.processTurn('voy al norte');
        // ENTER template usually starts with "Llegas a..." or "Viajas a..."
        expect(turn.narrative).toMatch(/Llegas a|Viajas a/);
    });

    it('should handle unknown inputs gracefully', async () => {
        const turn = await engine.processTurn('xyz123 random text');
        expect(turn.feedback).toContain('didn\'t understand');
    });

    it('should support pronouns (Context Awareness)', async () => {
        // Set context
        (engine as any).parser.updateContext('wolf', 'rock');
        
        // "Atacalo" -> Attack it (Spanish)
        const turn = await engine.processTurn('atacalo');
        expect(turn.narrative).toMatch(/Atacas al|Golpeas al/);
    });
  });

  describe('RPG Mechanics', () => {
      it('should reduce enemy HP on attack', async () => {
          (engine as any).sceneState.hasMonster = true;
          (engine as any).currentEnemy = { type: 'wolf', hp: 50, maxHp: 50, damage: 5 };

          await engine.processTurn('atacar');
          const enemy = (engine as any).currentEnemy;
          
          expect(enemy.hp).toBeLessThan(50);
      });

      it('should loot items', async () => {
          (engine as any).sceneState.hasLoot = true;
          (engine as any).sceneState.featureType = 'chest';

          const turn = await engine.processTurn('abrir cofre');
          expect(turn.inventory.length).toBeGreaterThan(0);
          expect(turn.narrative).toContain('Moneda de Oro');
      });
  });
});
