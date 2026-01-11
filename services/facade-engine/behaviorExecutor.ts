/**
 * Behavior Executor Service
 *
 * Executes character actions and behaviors.
 * Corresponds to Facade's ABL runtime behavior execution system.
 *
 * This is a simplified TypeScript reimplementation that handles:
 * - Character dialogue
 * - Movement between locations
 * - Gestures and animations
 * - Object interactions
 */

import {
  CharacterBehavior,
  AnimationCue,
  BeatStep,
} from '../../types/facade';
import { WorldMemory } from './worldMemory';

export class BehaviorExecutor {
  private worldMemory: WorldMemory;
  private animationQueue: AnimationCue[] = [];

  constructor(worldMemory: WorldMemory) {
    this.worldMemory = worldMemory;
    console.log('[BehaviorExecutor] Initialized');
  }

  // ============================================================================
  // BEAT STEP EXECUTION
  // ============================================================================

  /**
   * Execute a beat step
   */
  async executeBeatStep(step: BeatStep): Promise<AnimationCue[]> {
    console.log(`[BehaviorExecutor] Executing step: ${step.character} ${step.action}`);

    const cues: AnimationCue[] = [];

    switch (step.action) {
      case 'speak':
        cues.push(...this.executeSpeakAction(step));
        break;

      case 'moveTo':
        cues.push(...this.executeMoveAction(step));
        break;

      case 'gesture':
        cues.push(...this.executeGestureAction(step));
        break;

      case 'pickUp':
        cues.push(...this.executePickUpAction(step));
        break;

      case 'putDown':
        cues.push(...this.executePutDownAction(step));
        break;

      case 'gaze':
        cues.push(...this.executeGazeAction(step));
        break;

      case 'animation':
        cues.push(...this.executeAnimationAction(step));
        break;

      case 'waitForPlayer':
        cues.push(...this.executeWaitAction(step));
        break;

      default:
        console.warn(`[BehaviorExecutor] Unknown action: ${step.action}`);
    }

    // Add to animation queue
    this.animationQueue.push(...cues);

    return cues;
  }

  // ============================================================================
  // SPECIFIC BEHAVIOR IMPLEMENTATIONS
  // ============================================================================

  /**
   * Execute a speak action
   */
  private executeSpeakAction(step: BeatStep): AnimationCue[] {
    const character = step.character as 'grace' | 'trip' | 'player';
    const dialogue = step.dialogue ?? step.args[0] ?? '';

    console.log(`[BehaviorExecutor] ${character} speaks: "${dialogue}"`);

    return [
      {
        character,
        cueType: 'speak',
        data: {
          dialogue,
          audioFile: step.dialogueAudio,
        },
        timestamp: Date.now(),
        duration: this.estimateDialogueDuration(dialogue),
      },
    ];
  }

  /**
   * Execute a move action
   */
  private executeMoveAction(step: BeatStep): AnimationCue[] {
    const character = step.character as 'grace' | 'trip' | 'player';
    const targetLocation = step.args[0] as string;

    // Update character position in world memory
    if (character === 'grace' || character === 'trip') {
      const charState = this.worldMemory.getCharacterState(character);
      const fromPosition = charState.position;
      charState.position = targetLocation;

      console.log(`[BehaviorExecutor] ${character} moves: ${fromPosition} → ${targetLocation}`);

      return [
        {
          character,
          cueType: 'move',
          data: {
            fromPosition,
            toPosition: targetLocation,
          },
          timestamp: Date.now(),
          duration: 2000, // 2 seconds for movement
        },
      ];
    }

    return [];
  }

  /**
   * Execute a gesture action
   */
  private executeGestureAction(step: BeatStep): AnimationCue[] {
    const character = step.character as 'grace' | 'trip';
    const gestureType = step.args[0] as string;

    console.log(`[BehaviorExecutor] ${character} gestures: ${gestureType}`);

    return [
      {
        character,
        cueType: 'gesture',
        data: {
          gesture: gestureType,
        },
        timestamp: Date.now(),
        duration: 1500, // 1.5 seconds for gesture
      },
    ];
  }

  /**
   * Execute a pick up action
   */
  private executePickUpAction(step: BeatStep): AnimationCue[] {
    const character = step.character as 'grace' | 'trip';
    const objectId = step.args[0] as string;

    // Update character state
    const charState = this.worldMemory.getCharacterState(character);
    charState.heldObject = objectId;

    console.log(`[BehaviorExecutor] ${character} picks up: ${objectId}`);

    return [
      {
        character,
        cueType: 'gesture',
        data: {
          gesture: 'pickUp',
          animationFile: `pickup_${objectId}`,
        },
        timestamp: Date.now(),
        duration: 1000,
      },
    ];
  }

  /**
   * Execute a put down action
   */
  private executePutDownAction(step: BeatStep): AnimationCue[] {
    const character = step.character as 'grace' | 'trip';
    const objectId = step.args[0] as string;

    // Update character state
    const charState = this.worldMemory.getCharacterState(character);
    charState.heldObject = undefined;

    console.log(`[BehaviorExecutor] ${character} puts down: ${objectId}`);

    return [
      {
        character,
        cueType: 'gesture',
        data: {
          gesture: 'putDown',
          animationFile: `putdown_${objectId}`,
        },
        timestamp: Date.now(),
        duration: 1000,
      },
    ];
  }

  /**
   * Execute a gaze action (look at target)
   */
  private executeGazeAction(step: BeatStep): AnimationCue[] {
    const character = step.character as 'grace' | 'trip';
    const target = step.args[0] as string;

    console.log(`[BehaviorExecutor] ${character} gazes at: ${target}`);

    return [
      {
        character,
        cueType: 'gesture',
        data: {
          gesture: 'gaze',
          animationFile: `gaze_${target}`,
        },
        timestamp: Date.now(),
        duration: 500,
      },
    ];
  }

  /**
   * Execute an animation action
   */
  private executeAnimationAction(step: BeatStep): AnimationCue[] {
    const character = step.character as 'grace' | 'trip' | 'environment';
    const animationName = step.args[0] as string;

    console.log(`[BehaviorExecutor] ${character} animation: ${animationName}`);

    return [
      {
        character,
        cueType: 'gesture',
        data: {
          animationFile: animationName,
        },
        timestamp: Date.now(),
        duration: step.waitDuration ?? 1500,
      },
    ];
  }

  /**
   * Execute a wait action
   */
  private executeWaitAction(step: BeatStep): AnimationCue[] {
    console.log(`[BehaviorExecutor] Waiting for: ${step.waitFor}`);

    // Return empty cues - waiting is handled by drama manager
    return [];
  }

  // ============================================================================
  // CHARACTER BEHAVIORS (High-level)
  // ============================================================================

  /**
   * Make a character speak dialogue
   */
  speak(character: 'grace' | 'trip', dialogue: string, audioFile?: string): AnimationCue {
    console.log(`[BehaviorExecutor] ${character}: "${dialogue}"`);

    return {
      character,
      cueType: 'speak',
      data: {
        dialogue,
        audioFile,
      },
      timestamp: Date.now(),
      duration: this.estimateDialogueDuration(dialogue),
    };
  }

  /**
   * Make a character move to a location
   */
  moveTo(character: 'grace' | 'trip', targetLocation: string): AnimationCue {
    const charState = this.worldMemory.getCharacterState(character);
    const fromPosition = charState.position;
    charState.position = targetLocation;

    console.log(`[BehaviorExecutor] ${character} moves to: ${targetLocation}`);

    return {
      character,
      cueType: 'move',
      data: {
        fromPosition,
        toPosition: targetLocation,
      },
      timestamp: Date.now(),
      duration: 2000,
    };
  }

  /**
   * Make a character perform a gesture
   */
  gesture(character: 'grace' | 'trip', gestureType: string): AnimationCue {
    console.log(`[BehaviorExecutor] ${character} gestures: ${gestureType}`);

    return {
      character,
      cueType: 'gesture',
      data: {
        gesture: gestureType,
      },
      timestamp: Date.now(),
      duration: 1500,
    };
  }

  // ============================================================================
  // ENVIRONMENT ACTIONS
  // ============================================================================

  /**
   * Play a sound effect
   */
  playSFX(sfxFile: string): AnimationCue {
    console.log(`[BehaviorExecutor] Playing SFX: ${sfxFile}`);

    return {
      character: 'environment',
      cueType: 'sfx',
      data: {
        sfxFile,
      },
      timestamp: Date.now(),
    };
  }

  /**
   * Change music
   */
  changeMusic(musicFile: string): AnimationCue {
    console.log(`[BehaviorExecutor] Changing music: ${musicFile}`);

    return {
      character: 'environment',
      cueType: 'music',
      data: {
        musicFile,
      },
      timestamp: Date.now(),
    };
  }

  /**
   * Change lighting preset
   */
  changeLighting(preset: string): AnimationCue {
    console.log(`[BehaviorExecutor] Changing lighting: ${preset}`);

    return {
      character: 'environment',
      cueType: 'lighting',
      data: {
        lightingPreset: preset,
      },
      timestamp: Date.now(),
      duration: 1000,
    };
  }

  // ============================================================================
  // ANIMATION QUEUE MANAGEMENT
  // ============================================================================

  /**
   * Get all queued animation cues
   */
  getAnimationQueue(): AnimationCue[] {
    return [...this.animationQueue];
  }

  /**
   * Clear animation queue
   */
  clearAnimationQueue(): void {
    const count = this.animationQueue.length;
    this.animationQueue = [];
    console.log(`[BehaviorExecutor] Cleared ${count} animation cues`);
  }

  /**
   * Get next animation cue (FIFO)
   */
  popNextCue(): AnimationCue | undefined {
    return this.animationQueue.shift();
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  /**
   * Estimate dialogue duration based on text length
   * Rough estimate: ~200ms per word
   */
  private estimateDialogueDuration(text: string): number {
    const wordCount = text.split(/\s+/).length;
    return Math.max(1000, wordCount * 200); // At least 1 second
  }

  /**
   * Check if any animations are currently playing
   */
  hasActiveAnimations(): boolean {
    return this.animationQueue.length > 0;
  }

  /**
   * Get total duration of all queued animations
   */
  getTotalQueuedDuration(): number {
    return this.animationQueue.reduce((total, cue) => {
      return total + (cue.duration ?? 0);
    }, 0);
  }

  /**
   * Debug: Print animation queue
   */
  printAnimationQueue(): void {
    console.log('');
    console.log('='.repeat(70));
    console.log('ANIMATION QUEUE');
    console.log('='.repeat(70));
    console.log(`Total cues: ${this.animationQueue.length}`);
    console.log(`Total duration: ${this.getTotalQueuedDuration()}ms`);
    console.log('');

    for (let i = 0; i < this.animationQueue.length; i++) {
      const cue = this.animationQueue[i];
      console.log(`[${i}] ${cue.character} - ${cue.cueType}`);

      if (cue.data.dialogue) {
        console.log(`    Dialogue: "${cue.data.dialogue}"`);
      }
      if (cue.data.toPosition) {
        console.log(`    Move: ${cue.data.fromPosition} → ${cue.data.toPosition}`);
      }
      if (cue.data.gesture) {
        console.log(`    Gesture: ${cue.data.gesture}`);
      }
      console.log(`    Duration: ${cue.duration}ms`);
      console.log('');
    }

    console.log('='.repeat(70));
    console.log('');
  }
}
