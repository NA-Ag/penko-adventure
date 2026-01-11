/**
 * PrimitiveAct - FACADE 3.10
 *
 * Primitive acts are atomic behaviors that directly interface with the game world.
 * They are leaf nodes in the behavior tree that produce actual game effects.
 *
 * Based on Facade's primitive acts:
 * - Say: Verbal output (dialogue)
 * - Gesture: Physical gestures and emotes
 * - MoveTo: Movement to locations
 * - LookAt: Direct gaze/attention
 * - PlayAnimation: Character animations
 * - PlaySound: Audio effects
 * - SetExpression: Facial expressions
 * - Wait: Pause for duration
 *
 * Primitive acts connect the ABL behavior system to the actual game engine.
 */

import { Behavior, BehaviorStatus, BehaviorResult } from './Behavior';
import { WorldState } from './WorldState';

/**
 * Output callback for primitive acts
 * Allows game engine to hook into primitive act execution
 */
export interface PrimitiveActOutput {
  /** Called when dialogue is spoken */
  onSay?: (speaker: string, text: string, emotion?: string) => void;

  /** Called when gesture is performed */
  onGesture?: (actor: string, gestureType: string, target?: string) => void;

  /** Called when movement occurs */
  onMoveTo?: (actor: string, destination: string) => void;

  /** Called when looking at something */
  onLookAt?: (actor: string, target: string) => void;

  /** Called when animation plays */
  onPlayAnimation?: (actor: string, animationName: string) => void;

  /** Called when sound plays */
  onPlaySound?: (soundName: string, volume?: number) => void;

  /** Called when expression changes */
  onSetExpression?: (actor: string, expression: string) => void;

  /** Called when waiting */
  onWait?: (durationMs: number) => void;
}

/**
 * Global output handler for primitive acts
 */
let globalOutputHandler: PrimitiveActOutput = {};

/**
 * Set global output handler
 */
export function setPrimitiveActOutput(handler: PrimitiveActOutput): void {
  globalOutputHandler = handler;
}

/**
 * Get global output handler
 */
export function getPrimitiveActOutput(): PrimitiveActOutput {
  return globalOutputHandler;
}

/**
 * Base class for primitive acts
 */
export abstract class PrimitiveAct extends Behavior {
  protected actor: string;

  constructor(id: string, name: string, actor: string, priority: number = 50, specificity: number = 0.5) {
    super(id, name, priority, specificity);
    this.actor = actor;
  }
}

// ===== SAY (DIALOGUE) =====

/**
 * Say - Speak dialogue
 */
export class Say extends PrimitiveAct {
  private text: string;
  private emotion?: string;

  constructor(actor: string, text: string, emotion?: string) {
    super('say', `Say: "${text}"`, actor, 60, 0.8);
    this.text = text;
    this.emotion = emotion;
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    // Output to console (default)
    const emotionTag = this.emotion ? ` [${this.emotion}]` : '';
    console.log(`[${this.actor}]${emotionTag}: "${this.text}"`);

    // Call output handler if registered
    if (globalOutputHandler.onSay) {
      globalOutputHandler.onSay(this.actor, this.text, this.emotion);
    }

    // Update world state
    worldState.set(`last_speech_${this.actor}`, this.text);
    worldState.set(`last_speaker`, this.actor);

    return {
      status: BehaviorStatus.SUCCESS,
      message: `${this.actor} said: "${this.text}"`,
      data: {
        actor: this.actor,
        text: this.text,
        emotion: this.emotion,
      },
    };
  }

  /**
   * Create Say with emotion
   */
  static withEmotion(actor: string, text: string, emotion: string): Say {
    return new Say(actor, text, emotion);
  }

  /**
   * Create happy Say
   */
  static happy(actor: string, text: string): Say {
    return new Say(actor, text, 'happy');
  }

  /**
   * Create angry Say
   */
  static angry(actor: string, text: string): Say {
    return new Say(actor, text, 'angry');
  }

  /**
   * Create sad Say
   */
  static sad(actor: string, text: string): Say {
    return new Say(actor, text, 'sad');
  }
}

// ===== GESTURE =====

export enum GestureType {
  WAVE = 'wave',
  NOD = 'nod',
  SHAKE_HEAD = 'shake_head',
  SHRUG = 'shrug',
  POINT = 'point',
  THUMBS_UP = 'thumbs_up',
  THUMBS_DOWN = 'thumbs_down',
  CLAP = 'clap',
  BOW = 'bow',
  SALUTE = 'salute',
}

/**
 * Gesture - Physical gesture or emote
 */
export class Gesture extends PrimitiveAct {
  private gestureType: GestureType | string;
  private target?: string;

  constructor(actor: string, gestureType: GestureType | string, target?: string) {
    super('gesture', `Gesture: ${gestureType}`, actor, 50, 0.7);
    this.gestureType = gestureType;
    this.target = target;
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    // Output to console
    const targetStr = this.target ? ` at ${this.target}` : '';
    console.log(`[${this.actor}] *${this.gestureType}${targetStr}*`);

    // Call output handler if registered
    if (globalOutputHandler.onGesture) {
      globalOutputHandler.onGesture(this.actor, this.gestureType, this.target);
    }

    // Update world state
    worldState.set(`last_gesture_${this.actor}`, this.gestureType);

    return {
      status: BehaviorStatus.SUCCESS,
      message: `${this.actor} performed ${this.gestureType}`,
      data: {
        actor: this.actor,
        gestureType: this.gestureType,
        target: this.target,
      },
    };
  }

  /**
   * Create wave gesture
   */
  static wave(actor: string, target?: string): Gesture {
    return new Gesture(actor, GestureType.WAVE, target);
  }

  /**
   * Create nod gesture
   */
  static nod(actor: string): Gesture {
    return new Gesture(actor, GestureType.NOD);
  }

  /**
   * Create point gesture
   */
  static point(actor: string, target: string): Gesture {
    return new Gesture(actor, GestureType.POINT, target);
  }
}

// ===== MOVE TO =====

/**
 * MoveTo - Move to a location
 */
export class MoveTo extends PrimitiveAct {
  private destination: string;
  private speed: number; // 0-1

  constructor(actor: string, destination: string, speed: number = 0.5) {
    super('move_to', `Move to ${destination}`, actor, 55, 0.7);
    this.destination = destination;
    this.speed = Math.max(0, Math.min(1, speed));
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    const speedLabel = this.speed > 0.7 ? 'quickly' : this.speed < 0.3 ? 'slowly' : '';

    console.log(`[${this.actor}] *moves ${speedLabel} to ${this.destination}*`.trim());

    // Call output handler if registered
    if (globalOutputHandler.onMoveTo) {
      globalOutputHandler.onMoveTo(this.actor, this.destination);
    }

    // Simulate movement time based on speed
    const baseDuration = 2000; // 2 seconds base
    const duration = baseDuration * (1 / (this.speed + 0.5));
    await this.delay(duration);

    // Update world state
    worldState.set(`location_${this.actor}`, this.destination);

    return {
      status: BehaviorStatus.SUCCESS,
      message: `${this.actor} moved to ${this.destination}`,
      data: {
        actor: this.actor,
        destination: this.destination,
        speed: this.speed,
      },
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create fast movement
   */
  static fast(actor: string, destination: string): MoveTo {
    return new MoveTo(actor, destination, 0.9);
  }

  /**
   * Create slow movement
   */
  static slow(actor: string, destination: string): MoveTo {
    return new MoveTo(actor, destination, 0.2);
  }
}

// ===== LOOK AT =====

/**
 * LookAt - Direct attention/gaze at target
 */
export class LookAt extends PrimitiveAct {
  private target: string;

  constructor(actor: string, target: string) {
    super('look_at', `Look at ${target}`, actor, 45, 0.6);
    this.target = target;
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log(`[${this.actor}] *looks at ${this.target}*`);

    // Call output handler if registered
    if (globalOutputHandler.onLookAt) {
      globalOutputHandler.onLookAt(this.actor, this.target);
    }

    // Update world state
    worldState.set(`looking_at_${this.actor}`, this.target);

    return {
      status: BehaviorStatus.SUCCESS,
      message: `${this.actor} looking at ${this.target}`,
      data: {
        actor: this.actor,
        target: this.target,
      },
    };
  }
}

// ===== PLAY ANIMATION =====

/**
 * PlayAnimation - Play character animation
 */
export class PlayAnimation extends PrimitiveAct {
  private animationName: string;
  private duration: number;

  constructor(actor: string, animationName: string, duration: number = 1000) {
    super('play_animation', `Play animation: ${animationName}`, actor, 50, 0.7);
    this.animationName = animationName;
    this.duration = duration;
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log(`[${this.actor}] *plays animation: ${this.animationName}*`);

    // Call output handler if registered
    if (globalOutputHandler.onPlayAnimation) {
      globalOutputHandler.onPlayAnimation(this.actor, this.animationName);
    }

    // Simulate animation duration
    await this.delay(this.duration);

    // Update world state
    worldState.set(`current_animation_${this.actor}`, this.animationName);

    return {
      status: BehaviorStatus.SUCCESS,
      message: `${this.actor} played animation: ${this.animationName}`,
      data: {
        actor: this.actor,
        animationName: this.animationName,
        duration: this.duration,
      },
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ===== PLAY SOUND =====

/**
 * PlaySound - Play audio effect
 */
export class PlaySound extends PrimitiveAct {
  private soundName: string;
  private volume: number;

  constructor(actor: string, soundName: string, volume: number = 0.8) {
    super('play_sound', `Play sound: ${soundName}`, actor, 40, 0.5);
    this.soundName = soundName;
    this.volume = Math.max(0, Math.min(1, volume));
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log(`[${this.actor}] *plays sound: ${this.soundName} (volume: ${this.volume.toFixed(2)})*`);

    // Call output handler if registered
    if (globalOutputHandler.onPlaySound) {
      globalOutputHandler.onPlaySound(this.soundName, this.volume);
    }

    return {
      status: BehaviorStatus.SUCCESS,
      message: `Played sound: ${this.soundName}`,
      data: {
        actor: this.actor,
        soundName: this.soundName,
        volume: this.volume,
      },
    };
  }
}

// ===== SET EXPRESSION =====

export enum Expression {
  NEUTRAL = 'neutral',
  HAPPY = 'happy',
  SAD = 'sad',
  ANGRY = 'angry',
  SURPRISED = 'surprised',
  CONFUSED = 'confused',
  DISGUSTED = 'disgusted',
  FEARFUL = 'fearful',
}

/**
 * SetExpression - Change facial expression
 */
export class SetExpression extends PrimitiveAct {
  private expression: Expression | string;

  constructor(actor: string, expression: Expression | string) {
    super('set_expression', `Expression: ${expression}`, actor, 45, 0.6);
    this.expression = expression;
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log(`[${this.actor}] *expression: ${this.expression}*`);

    // Call output handler if registered
    if (globalOutputHandler.onSetExpression) {
      globalOutputHandler.onSetExpression(this.actor, this.expression);
    }

    // Update world state
    worldState.set(`expression_${this.actor}`, this.expression);

    return {
      status: BehaviorStatus.SUCCESS,
      message: `${this.actor} expression: ${this.expression}`,
      data: {
        actor: this.actor,
        expression: this.expression,
      },
    };
  }

  /**
   * Set happy expression
   */
  static happy(actor: string): SetExpression {
    return new SetExpression(actor, Expression.HAPPY);
  }

  /**
   * Set angry expression
   */
  static angry(actor: string): SetExpression {
    return new SetExpression(actor, Expression.ANGRY);
  }

  /**
   * Set sad expression
   */
  static sad(actor: string): SetExpression {
    return new SetExpression(actor, Expression.SAD);
  }
}

// ===== WAIT =====

/**
 * Wait - Pause for duration
 */
export class Wait extends PrimitiveAct {
  private durationMs: number;

  constructor(actor: string, durationMs: number) {
    super('wait', `Wait ${durationMs}ms`, actor, 30, 0.4);
    this.durationMs = durationMs;
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log(`[${this.actor}] *waits for ${this.durationMs}ms*`);

    // Call output handler if registered
    if (globalOutputHandler.onWait) {
      globalOutputHandler.onWait(this.durationMs);
    }

    await this.delay(this.durationMs);

    return {
      status: BehaviorStatus.SUCCESS,
      message: `Waited ${this.durationMs}ms`,
      data: {
        actor: this.actor,
        duration: this.durationMs,
      },
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ===== HELPER FUNCTIONS =====

/**
 * Create a conversation sequence
 */
export function createConversation(exchanges: Array<{ actor: string; text: string; emotion?: string }>): Say[] {
  return exchanges.map(ex => new Say(ex.actor, ex.text, ex.emotion));
}

/**
 * Create a gesture sequence
 */
export function createGestureSequence(actor: string, gestures: (GestureType | string)[]): Gesture[] {
  return gestures.map(g => new Gesture(actor, g));
}
