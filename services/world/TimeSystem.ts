/**
 * TimeSystem - Dynamic Time Management for Community Mode
 *
 * Handles day/night cycles, time progression, and time-based events.
 * Supports both turn-based and real-time progression.
 */

import { TimeOfDay } from '../../types';

export interface TimeConfig {
  turnsPerHour: number;        // How many turns = 1 hour (default: 4)
  hoursPerDay: number;          // Hours in a day (default: 24)
  startTime: number;            // Starting hour (0-23)
  startDay: number;             // Starting day number
  enableRealTime: boolean;      // Progress time automatically
  realTimeMultiplier: number;   // Real seconds per game hour
}

export interface TimeState {
  currentHour: number;          // 0-23
  currentDay: number;           // Days since start
  totalTurns: number;           // Total turns taken
  totalMinutes: number;         // Total game minutes elapsed
}

export interface TimeRange {
  start: number;                // Start hour (0-23)
  end: number;                  // End hour (0-23)
  timeOfDay: TimeOfDay;
}

export class TimeSystem {
  private config: TimeConfig;
  private state: TimeState;
  private lastRealTimeUpdate: number;
  private listeners: Map<string, (state: TimeState) => void> = new Map();

  constructor(config?: Partial<TimeConfig>) {
    this.config = {
      turnsPerHour: 4,
      hoursPerDay: 24,
      startTime: 8, // 8 AM
      startDay: 1,
      enableRealTime: false,
      realTimeMultiplier: 60, // 1 real second = 1 game minute
      ...config,
    };

    this.state = {
      currentHour: this.config.startTime,
      currentDay: this.config.startDay,
      totalTurns: 0,
      totalMinutes: this.config.startTime * 60,
    };

    this.lastRealTimeUpdate = Date.now();
  }

  /**
   * Advance time by one turn
   */
  public advanceTurn(): TimeState {
    this.state.totalTurns++;

    // Calculate how many minutes this turn represents
    const minutesPerTurn = 60 / this.config.turnsPerHour;
    this.state.totalMinutes += minutesPerTurn;

    // Update hour and day
    this.updateFromMinutes();

    // Notify listeners
    this.notifyListeners();

    return this.getState();
  }

  /**
   * Advance time by specific amount
   */
  public advanceTime(hours: number = 0, minutes: number = 0, days: number = 0): TimeState {
    const totalMinutes = (days * this.config.hoursPerDay * 60) + (hours * 60) + minutes;
    this.state.totalMinutes += totalMinutes;
    this.updateFromMinutes();
    this.notifyListeners();
    return this.getState();
  }

  /**
   * Set time to specific hour
   */
  public setTime(hour: number, minute: number = 0): void {
    // Keep current day, just change time
    const currentDayMinutes = this.state.currentDay * this.config.hoursPerDay * 60;
    this.state.totalMinutes = currentDayMinutes + (hour * 60) + minute;
    this.updateFromMinutes();
    this.notifyListeners();
  }

  /**
   * Update real-time progression (call this regularly if enableRealTime is true)
   */
  public updateRealTime(): TimeState {
    if (!this.config.enableRealTime) return this.state;

    const now = Date.now();
    const elapsed = (now - this.lastRealTimeUpdate) / 1000; // seconds
    this.lastRealTimeUpdate = now;

    // Convert real seconds to game minutes
    const gameMinutes = elapsed * this.config.realTimeMultiplier;
    this.state.totalMinutes += gameMinutes;
    this.updateFromMinutes();
    this.notifyListeners();

    return this.getState();
  }

  /**
   * Get current time state
   */
  public getState(): TimeState {
    return { ...this.state };
  }

  /**
   * Get current time of day category
   */
  public getTimeOfDay(): TimeOfDay {
    const hour = this.state.currentHour;

    // Define time ranges
    const timeRanges: TimeRange[] = [
      { start: 6, end: 12, timeOfDay: 'day' },
      { start: 12, end: 18, timeOfDay: 'day' },
      { start: 18, end: 20, timeOfDay: 'sunset' },
      { start: 20, end: 23, timeOfDay: 'night' },
      { start: 0, end: 6, timeOfDay: 'night' },
    ];

    for (const range of timeRanges) {
      if (hour >= range.start && hour < range.end) {
        return range.timeOfDay;
      }
    }

    return 'day'; // Default
  }

  /**
   * Check if currently night time
   */
  public isNight(): boolean {
    return this.getTimeOfDay() === 'night';
  }

  /**
   * Check if currently day time
   */
  public isDay(): boolean {
    const tod = this.getTimeOfDay();
    return tod === 'day';
  }

  /**
   * Get formatted time string
   */
  public getFormattedTime(): string {
    const minutes = this.state.totalMinutes % 60;
    const hour = this.state.currentHour;
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  /**
   * Get formatted day string
   */
  public getFormattedDay(): string {
    return `Day ${this.state.currentDay}`;
  }

  /**
   * Check if specific time has been reached
   */
  public hasReachedTime(day: number, hour: number): boolean {
    if (this.state.currentDay > day) return true;
    if (this.state.currentDay === day && this.state.currentHour >= hour) return true;
    return false;
  }

  /**
   * Check if time is within range
   */
  public isTimeInRange(startHour: number, endHour: number): boolean {
    const hour = this.state.currentHour;
    if (startHour <= endHour) {
      return hour >= startHour && hour < endHour;
    } else {
      // Wrap around midnight
      return hour >= startHour || hour < endHour;
    }
  }

  /**
   * Get hours until specific time
   */
  public getHoursUntil(targetHour: number): number {
    const current = this.state.currentHour;
    if (targetHour > current) {
      return targetHour - current;
    } else {
      return (this.config.hoursPerDay - current) + targetHour;
    }
  }

  /**
   * Register listener for time changes
   */
  public addListener(id: string, callback: (state: TimeState) => void): void {
    this.listeners.set(id, callback);
  }

  /**
   * Remove listener
   */
  public removeListener(id: string): void {
    this.listeners.delete(id);
  }

  /**
   * Get progress through current day (0.0 to 1.0)
   */
  public getDayProgress(): number {
    const minutesInDay = this.config.hoursPerDay * 60;
    const currentDayMinutes = this.state.totalMinutes % minutesInDay;
    return currentDayMinutes / minutesInDay;
  }

  /**
   * Serialize state for saving
   */
  public serialize(): {
    config: TimeConfig;
    state: TimeState;
  } {
    return {
      config: { ...this.config },
      state: { ...this.state },
    };
  }

  /**
   * Load state from save data
   */
  public static deserialize(data: {
    config: TimeConfig;
    state: TimeState;
  }): TimeSystem {
    const system = new TimeSystem(data.config);
    system.state = { ...data.state };
    system.lastRealTimeUpdate = Date.now();
    return system;
  }

  /**
   * Reset time system
   */
  public reset(): void {
    this.state = {
      currentHour: this.config.startTime,
      currentDay: this.config.startDay,
      totalTurns: 0,
      totalMinutes: this.config.startTime * 60,
    };
    this.lastRealTimeUpdate = Date.now();
    this.notifyListeners();
  }

  /**
   * Update hour and day from total minutes
   */
  private updateFromMinutes(): void {
    const totalHours = Math.floor(this.state.totalMinutes / 60);
    this.state.currentHour = totalHours % this.config.hoursPerDay;
    this.state.currentDay = Math.floor(totalHours / this.config.hoursPerDay) + this.config.startDay;
  }

  /**
   * Notify all listeners of time change
   */
  private notifyListeners(): void {
    this.listeners.forEach((callback) => {
      try {
        callback(this.state);
      } catch (error) {
        console.error('Error in time listener:', error);
      }
    });
  }

  /**
   * Get time until next time of day change
   */
  public getTimeUntilNextTimeOfDay(): { hours: number; minutes: number; nextTimeOfDay: TimeOfDay } {
    const currentHour = this.state.currentHour;
    const currentMinute = this.state.totalMinutes % 60;

    // Define transition hours
    const transitions = [
      { hour: 6, timeOfDay: 'day' as TimeOfDay },
      { hour: 18, timeOfDay: 'sunset' as TimeOfDay },
      { hour: 20, timeOfDay: 'night' as TimeOfDay },
    ];

    // Find next transition
    for (const transition of transitions) {
      if (currentHour < transition.hour) {
        const hoursUntil = transition.hour - currentHour;
        const minutesUntil = 60 - currentMinute;
        return {
          hours: minutesUntil === 60 ? hoursUntil : hoursUntil - 1,
          minutes: minutesUntil === 60 ? 0 : minutesUntil,
          nextTimeOfDay: transition.timeOfDay,
        };
      }
    }

    // Next transition is tomorrow morning
    const hoursUntil = (24 - currentHour) + 6;
    const minutesUntil = 60 - currentMinute;
    return {
      hours: minutesUntil === 60 ? hoursUntil : hoursUntil - 1,
      minutes: minutesUntil === 60 ? 0 : minutesUntil,
      nextTimeOfDay: 'day',
    };
  }

  /**
   * Create a time snapshot for comparison
   */
  public snapshot(): TimeSnapshot {
    return new TimeSnapshot(this.state);
  }
}

/**
 * TimeSnapshot - Immutable time state for comparison
 */
export class TimeSnapshot {
  private readonly state: TimeState;

  constructor(state: TimeState) {
    this.state = { ...state };
  }

  public getHour(): number {
    return this.state.currentHour;
  }

  public getDay(): number {
    return this.state.currentDay;
  }

  public getTurns(): number {
    return this.state.totalTurns;
  }

  public equals(other: TimeSnapshot): boolean {
    return (
      this.state.currentHour === other.state.currentHour &&
      this.state.currentDay === other.state.currentDay
    );
  }

  public isLaterThan(other: TimeSnapshot): boolean {
    if (this.state.currentDay > other.state.currentDay) return true;
    if (this.state.currentDay === other.state.currentDay) {
      return this.state.currentHour > other.state.currentHour;
    }
    return false;
  }
}

/**
 * Helper functions
 */
export function createDefaultTimeSystem(): TimeSystem {
  return new TimeSystem({
    turnsPerHour: 4,
    hoursPerDay: 24,
    startTime: 8,
    startDay: 1,
    enableRealTime: false,
    realTimeMultiplier: 60,
  });
}

export function createFastTimeSystem(): TimeSystem {
  return new TimeSystem({
    turnsPerHour: 1, // 1 turn = 1 hour
    hoursPerDay: 24,
    startTime: 8,
    startDay: 1,
    enableRealTime: false,
    realTimeMultiplier: 1,
  });
}
