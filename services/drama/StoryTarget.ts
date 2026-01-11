/**
 * StoryTarget - FACADE 4.3
 *
 * Story targets define desired trajectories for story values over time.
 * The drama manager uses these to select beats that move values toward targets.
 *
 * Inspired by Facade's approach to dramatic arc management.
 *
 * Example: "Tension should rise steadily, peak at climax, then resolve"
 *
 * This enables:
 * - Predictable story arcs
 * - Climactic pacing
 * - Emotional flow management
 * - Dynamic beat selection based on goals
 */

/**
 * Curve shape types for story targets
 */
export enum CurveType {
  /** Linear progression: steady increase or decrease */
  LINEAR = 'linear',

  /** Exponential: slow start, rapid growth */
  EXPONENTIAL = 'exponential',

  /** Logarithmic: rapid start, slow growth */
  LOGARITHMIC = 'logarithmic',

  /** Bell curve: rise to peak, then fall */
  BELL = 'bell',

  /** Inverse bell: high, dip low, rise again */
  INVERSE_BELL = 'inverse_bell',

  /** Step: sudden jumps at specific times */
  STEP = 'step',

  /** Constant: maintain specific value */
  CONSTANT = 'constant',

  /** Custom: user-defined curve function */
  CUSTOM = 'custom',
}

/**
 * Target point at a specific time
 */
export interface TargetPoint {
  /** Time in milliseconds from story start */
  time: number;

  /** Desired value at this time (0-100) */
  value: number;

  /** Optional tolerance (how close is "good enough") */
  tolerance?: number;
}

/**
 * Story target configuration
 */
export interface StoryTargetConfig {
  /** Story value to target */
  storyValueKey: string;

  /** Name of this target arc */
  name: string;

  /** Curve type */
  curveType: CurveType;

  /** Start value */
  startValue: number;

  /** End value */
  endValue: number;

  /** Duration in milliseconds */
  duration: number;

  /** Key points along the curve (for non-linear curves) */
  keyPoints?: TargetPoint[];

  /** Custom curve function (if curveType is CUSTOM) */
  customCurve?: (progress: number) => number;

  /** Priority (how important is hitting this target?) */
  priority?: number;

  /** Tolerance - acceptable deviation from target */
  tolerance?: number;
}

/**
 * Story target - defines desired trajectory
 */
export class StoryTarget {
  readonly storyValueKey: string;
  readonly name: string;
  readonly curveType: CurveType;
  readonly startValue: number;
  readonly endValue: number;
  readonly duration: number;
  readonly keyPoints: TargetPoint[];
  readonly customCurve?: (progress: number) => number;
  readonly priority: number;
  readonly tolerance: number;

  private startTime: number = 0;

  constructor(config: StoryTargetConfig) {
    this.storyValueKey = config.storyValueKey;
    this.name = config.name;
    this.curveType = config.curveType;
    this.startValue = config.startValue;
    this.endValue = config.endValue;
    this.duration = config.duration;
    this.keyPoints = config.keyPoints || [];
    this.customCurve = config.customCurve;
    this.priority = config.priority ?? 50;
    this.tolerance = config.tolerance ?? 10;
  }

  /**
   * Start the target (record start time)
   */
  start(): void {
    this.startTime = Date.now();
  }

  /**
   * Get target value at current time
   */
  getTargetValue(): number {
    if (this.startTime === 0) {
      return this.startValue;
    }

    const elapsed = Date.now() - this.startTime;
    return this.getTargetValueAtTime(elapsed);
  }

  /**
   * Get target value at specific elapsed time
   */
  getTargetValueAtTime(elapsed: number): number {
    // Clamp elapsed to duration
    const t = Math.min(elapsed, this.duration);
    const progress = this.duration > 0 ? t / this.duration : 1;

    return this.evaluateCurve(progress);
  }

  /**
   * Evaluate curve at progress (0-1)
   */
  private evaluateCurve(progress: number): number {
    const range = this.endValue - this.startValue;

    switch (this.curveType) {
      case CurveType.LINEAR:
        return this.startValue + range * progress;

      case CurveType.EXPONENTIAL:
        // y = start + range * (e^(k*x) - 1) / (e^k - 1)
        // Using k=3 for moderate exponential
        const k = 3;
        return this.startValue + range * (Math.exp(k * progress) - 1) / (Math.exp(k) - 1);

      case CurveType.LOGARITHMIC:
        // y = start + range * log(1 + k*x) / log(1 + k)
        // Using k=9 for moderate logarithmic
        const kLog = 9;
        return this.startValue + range * Math.log(1 + kLog * progress) / Math.log(1 + kLog);

      case CurveType.BELL:
        // Bell curve: rise to peak at 0.5, then fall
        // Using Gaussian-like shape
        const bellPeak = 0.5;
        const bellWidth = 0.25;
        const bellHeight = Math.exp(-Math.pow(progress - bellPeak, 2) / (2 * Math.pow(bellWidth, 2)));
        return this.startValue + range * bellHeight;

      case CurveType.INVERSE_BELL:
        // Inverse bell: high at start/end, low in middle
        const inverseBellDip = 0.5;
        const inverseBellWidth = 0.25;
        const inverseBellDepth = 1 - Math.exp(-Math.pow(progress - inverseBellDip, 2) / (2 * Math.pow(inverseBellWidth, 2)));
        return this.startValue + range * inverseBellDepth;

      case CurveType.STEP:
        // Find appropriate key point
        if (this.keyPoints.length === 0) {
          return this.startValue;
        }

        const elapsed = progress * this.duration;
        let currentValue = this.startValue;

        for (const point of this.keyPoints) {
          if (elapsed >= point.time) {
            currentValue = point.value;
          } else {
            break;
          }
        }

        return currentValue;

      case CurveType.CONSTANT:
        return this.startValue;

      case CurveType.CUSTOM:
        if (this.customCurve) {
          return this.customCurve(progress);
        }
        return this.startValue + range * progress;

      default:
        return this.startValue + range * progress;
    }
  }

  /**
   * Get deviation from target
   * Returns how far current value is from target (positive = above, negative = below)
   */
  getDeviation(currentValue: number): number {
    const targetValue = this.getTargetValue();
    return currentValue - targetValue;
  }

  /**
   * Check if current value is within tolerance
   */
  isOnTarget(currentValue: number): boolean {
    const deviation = Math.abs(this.getDeviation(currentValue));
    return deviation <= this.tolerance;
  }

  /**
   * Get progress (0-1)
   */
  getProgress(): number {
    if (this.startTime === 0 || this.duration === 0) {
      return 0;
    }

    const elapsed = Date.now() - this.startTime;
    return Math.min(elapsed / this.duration, 1);
  }

  /**
   * Check if target is complete
   */
  isComplete(): boolean {
    return this.getProgress() >= 1;
  }

  /**
   * Reset target
   */
  reset(): void {
    this.startTime = 0;
  }

  /**
   * Get info
   */
  getInfo(): {
    storyValueKey: string;
    name: string;
    curveType: CurveType;
    progress: number;
    currentTarget: number;
    isComplete: boolean;
  } {
    return {
      storyValueKey: this.storyValueKey,
      name: this.name,
      curveType: this.curveType,
      progress: this.getProgress(),
      currentTarget: this.getTargetValue(),
      isComplete: this.isComplete(),
    };
  }
}

/**
 * Story target builder
 */
export class StoryTargetBuilder {
  private config: Partial<StoryTargetConfig> = {};

  constructor(storyValueKey: string, name: string) {
    this.config.storyValueKey = storyValueKey;
    this.config.name = name;
    this.config.curveType = CurveType.LINEAR;
    this.config.tolerance = 10;
    this.config.priority = 50;
  }

  /**
   * Set curve type
   */
  withCurveType(curveType: CurveType): StoryTargetBuilder {
    this.config.curveType = curveType;
    return this;
  }

  /**
   * Set start and end values
   */
  fromTo(startValue: number, endValue: number): StoryTargetBuilder {
    this.config.startValue = startValue;
    this.config.endValue = endValue;
    return this;
  }

  /**
   * Set duration
   */
  overDuration(milliseconds: number): StoryTargetBuilder {
    this.config.duration = milliseconds;
    return this;
  }

  /**
   * Add key point (for step curves)
   */
  withKeyPoint(time: number, value: number, tolerance?: number): StoryTargetBuilder {
    if (!this.config.keyPoints) {
      this.config.keyPoints = [];
    }
    this.config.keyPoints.push({ time, value, tolerance });
    return this;
  }

  /**
   * Set custom curve function
   */
  withCustomCurve(curve: (progress: number) => number): StoryTargetBuilder {
    this.config.curveType = CurveType.CUSTOM;
    this.config.customCurve = curve;
    return this;
  }

  /**
   * Set priority
   */
  withPriority(priority: number): StoryTargetBuilder {
    this.config.priority = priority;
    return this;
  }

  /**
   * Set tolerance
   */
  withTolerance(tolerance: number): StoryTargetBuilder {
    this.config.tolerance = tolerance;
    return this;
  }

  /**
   * Build the target
   */
  build(): StoryTarget {
    if (!this.config.storyValueKey || !this.config.name) {
      throw new Error('StoryTarget must have storyValueKey and name');
    }

    if (this.config.startValue === undefined || this.config.endValue === undefined) {
      throw new Error('StoryTarget must have startValue and endValue');
    }

    if (this.config.duration === undefined) {
      throw new Error('StoryTarget must have duration');
    }

    return new StoryTarget(this.config as StoryTargetConfig);
  }
}

/**
 * Common story arc presets
 */
export class StoryArcs {
  /**
   * Classic three-act structure for tension
   * Act 1: Rising action (0-30%)
   * Act 2: Complications (30-80%)
   * Act 3: Climax and resolution (80-100%)
   */
  static threeActTension(duration: number): StoryTarget {
    return new StoryTargetBuilder('tension', 'Three-Act Tension')
      .fromTo(10, 90)
      .overDuration(duration)
      .withCurveType(CurveType.EXPONENTIAL)
      .build();
  }

  /**
   * Romance arc - slow build to confession
   */
  static romanceArc(duration: number): StoryTarget {
    return new StoryTargetBuilder('romance', 'Romance Arc')
      .fromTo(0, 80)
      .overDuration(duration)
      .withCurveType(CurveType.LOGARITHMIC)
      .build();
  }

  /**
   * Mystery arc - build intrigue, then solve
   */
  static mysteryArc(duration: number): StoryTarget {
    return new StoryTargetBuilder('mystery', 'Mystery Arc')
      .fromTo(20, 90)
      .overDuration(duration)
      .withCurveType(CurveType.BELL)
      .build();
  }

  /**
   * Comedy relief - maintain humor throughout
   */
  static comedyConstant(duration: number, level: number = 40): StoryTarget {
    return new StoryTargetBuilder('humor', 'Comedy Constant')
      .fromTo(level, level)
      .overDuration(duration)
      .withCurveType(CurveType.CONSTANT)
      .withTolerance(15)
      .build();
  }

  /**
   * Urgency spike - deadline approaching
   */
  static urgencySpike(duration: number): StoryTarget {
    return new StoryTargetBuilder('urgency', 'Urgency Spike')
      .fromTo(5, 95)
      .overDuration(duration)
      .withCurveType(CurveType.EXPONENTIAL)
      .build();
  }

  /**
   * Affinity growth - building relationship
   */
  static affinityGrowth(duration: number): StoryTarget {
    return new StoryTargetBuilder('affinity', 'Affinity Growth')
      .fromTo(30, 80)
      .overDuration(duration)
      .withCurveType(CurveType.LOGARITHMIC)
      .build();
  }
}

/**
 * Target manager - manages multiple story targets
 */
export class TargetManager {
  private targets: Map<string, StoryTarget> = new Map();

  /**
   * Add target
   */
  addTarget(target: StoryTarget): void {
    this.targets.set(target.storyValueKey, target);
  }

  /**
   * Remove target
   */
  removeTarget(storyValueKey: string): void {
    this.targets.delete(storyValueKey);
  }

  /**
   * Get target for story value
   */
  getTarget(storyValueKey: string): StoryTarget | undefined {
    return this.targets.get(storyValueKey);
  }

  /**
   * Get all targets
   */
  getAllTargets(): StoryTarget[] {
    return Array.from(this.targets.values());
  }

  /**
   * Start all targets
   */
  startAll(): void {
    for (const target of this.targets.values()) {
      target.start();
    }
  }

  /**
   * Get all deviations
   * Returns map of story value key to deviation
   */
  getAllDeviations(currentValues: Map<string, number>): Map<string, number> {
    const deviations = new Map<string, number>();

    for (const [key, target] of this.targets.entries()) {
      const currentValue = currentValues.get(key) || 0;
      deviations.set(key, target.getDeviation(currentValue));
    }

    return deviations;
  }

  /**
   * Get worst deviation (furthest from target)
   */
  getWorstDeviation(currentValues: Map<string, number>): {
    storyValueKey: string;
    deviation: number;
    target: StoryTarget;
  } | null {
    let worst: { storyValueKey: string; deviation: number; target: StoryTarget } | null = null;

    for (const [key, target] of this.targets.entries()) {
      const currentValue = currentValues.get(key) || 0;
      const deviation = Math.abs(target.getDeviation(currentValue));

      if (!worst || deviation > Math.abs(worst.deviation)) {
        worst = {
          storyValueKey: key,
          deviation: target.getDeviation(currentValue),
          target,
        };
      }
    }

    return worst;
  }

  /**
   * Get summary
   */
  getSummary(currentValues: Map<string, number>): string {
    const lines = ['=== Story Targets ==='];

    for (const [key, target] of this.targets.entries()) {
      const currentValue = currentValues.get(key) || 0;
      const targetValue = target.getTargetValue();
      const deviation = target.getDeviation(currentValue);
      const progress = (target.getProgress() * 100).toFixed(0);
      const onTarget = target.isOnTarget(currentValue) ? '✓' : '✗';

      lines.push(
        `${onTarget} ${target.name} (${progress}%): Current=${currentValue.toFixed(0)} Target=${targetValue.toFixed(0)} Dev=${deviation > 0 ? '+' : ''}${deviation.toFixed(0)}`
      );
    }

    return lines.join('\n');
  }

  /**
   * Reset all targets
   */
  reset(): void {
    for (const target of this.targets.values()) {
      target.reset();
    }
  }

  /**
   * Export state
   */
  exportState(): {
    targets: Array<{
      storyValueKey: string;
      startTime: number;
    }>;
  } {
    const targets = [];
    for (const target of this.targets.values()) {
      targets.push({
        storyValueKey: target.storyValueKey,
        startTime: (target as any).startTime,
      });
    }
    return { targets };
  }

  /**
   * Import state
   */
  importState(state: {
    targets: Array<{
      storyValueKey: string;
      startTime: number;
    }>;
  }): void {
    for (const targetState of state.targets) {
      const target = this.targets.get(targetState.storyValueKey);
      if (target) {
        (target as any).startTime = targetState.startTime;
      }
    }
  }
}
