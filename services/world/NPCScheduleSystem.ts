/**
 * NPCScheduleSystem - NPC Behavior and Movement Scheduling
 *
 * Manages NPC locations, behaviors, and dialogue based on time of day.
 * NPCs can move between locations, have daily routines, and contextual dialogue.
 */

import type { TimeState } from './TimeSystem';

export interface NPCScheduleEntry {
  startHour: number;            // Hour when this schedule starts (0-23)
  endHour: number;              // Hour when this schedule ends (0-23)
  locationId: string;           // Where NPC should be
  activity: NPCActivity;        // What NPC is doing
  dialogue?: string[];          // Time-specific dialogue options
  available: boolean;           // Can player interact?
}

export type NPCActivity =
  | 'SLEEPING'
  | 'WORKING'
  | 'EATING'
  | 'SOCIALIZING'
  | 'TRAVELING'
  | 'GUARDING'
  | 'SHOPPING'
  | 'IDLE';

export interface NPCSchedule {
  npcId: string;
  defaultLocation: string;      // Fallback if no schedule matches
  entries: NPCScheduleEntry[];
  specialDays?: {                // Day-specific overrides
    [day: number]: NPCScheduleEntry[];
  };
}

export interface NPCState {
  npcId: string;
  currentLocationId: string;
  currentActivity: NPCActivity;
  available: boolean;
  lastUpdated: TimeState;
}

export class NPCScheduleSystem {
  private schedules: Map<string, NPCSchedule> = new Map();
  private npcStates: Map<string, NPCState> = new Map();
  private listeners: Map<string, (npcId: string, oldLocation: string, newLocation: string) => void> = new Map();

  /**
   * Register an NPC schedule
   */
  public registerSchedule(schedule: NPCSchedule): void {
    this.schedules.set(schedule.npcId, schedule);

    // Initialize NPC state
    if (!this.npcStates.has(schedule.npcId)) {
      this.npcStates.set(schedule.npcId, {
        npcId: schedule.npcId,
        currentLocationId: schedule.defaultLocation,
        currentActivity: 'IDLE',
        available: true,
        lastUpdated: { currentHour: 0, currentDay: 0, totalTurns: 0, totalMinutes: 0 },
      });
    }
  }

  /**
   * Update all NPC locations based on current time
   */
  public updateNPCLocations(timeState: TimeState): Map<string, { oldLocation: string; newLocation: string }> {
    const changes = new Map<string, { oldLocation: string; newLocation: string }>();

    this.schedules.forEach((schedule, npcId) => {
      const oldState = this.npcStates.get(npcId);
      if (!oldState) return;

      const newScheduleEntry = this.getActiveScheduleEntry(schedule, timeState);

      if (newScheduleEntry) {
        const newLocation = newScheduleEntry.locationId;
        const newActivity = newScheduleEntry.activity;
        const newAvailable = newScheduleEntry.available;

        // Check if location changed
        if (oldState.currentLocationId !== newLocation) {
          changes.set(npcId, {
            oldLocation: oldState.currentLocationId,
            newLocation,
          });

          // Notify listeners
          this.notifyLocationChange(npcId, oldState.currentLocationId, newLocation);
        }

        // Update state
        this.npcStates.set(npcId, {
          npcId,
          currentLocationId: newLocation,
          currentActivity: newActivity,
          available: newAvailable,
          lastUpdated: timeState,
        });
      }
    });

    return changes;
  }

  /**
   * Get NPCs currently at a location
   */
  public getNPCsAtLocation(locationId: string): string[] {
    const npcs: string[] = [];
    this.npcStates.forEach((state, npcId) => {
      if (state.currentLocationId === locationId) {
        npcs.push(npcId);
      }
    });
    return npcs;
  }

  /**
   * Get current location of specific NPC
   */
  public getNPCLocation(npcId: string): string | null {
    const state = this.npcStates.get(npcId);
    return state ? state.currentLocationId : null;
  }

  /**
   * Get current activity of NPC
   */
  public getNPCActivity(npcId: string): NPCActivity | null {
    const state = this.npcStates.get(npcId);
    return state ? state.currentActivity : null;
  }

  /**
   * Check if NPC is available for interaction
   */
  public isNPCAvailable(npcId: string): boolean {
    const state = this.npcStates.get(npcId);
    return state ? state.available : false;
  }

  /**
   * Get time-specific dialogue for NPC
   */
  public getContextualDialogue(npcId: string, timeState: TimeState): string[] | null {
    const schedule = this.schedules.get(npcId);
    if (!schedule) return null;

    const activeEntry = this.getActiveScheduleEntry(schedule, timeState);
    return activeEntry?.dialogue || null;
  }

  /**
   * Get active schedule entry for NPC at specific time
   */
  private getActiveScheduleEntry(schedule: NPCSchedule, timeState: TimeState): NPCScheduleEntry | null {
    // Check for special day schedule first
    if (schedule.specialDays && schedule.specialDays[timeState.currentDay]) {
      const specialEntries = schedule.specialDays[timeState.currentDay];
      const entry = this.findMatchingEntry(specialEntries, timeState.currentHour);
      if (entry) return entry;
    }

    // Check regular schedule
    return this.findMatchingEntry(schedule.entries, timeState.currentHour);
  }

  /**
   * Find schedule entry matching current hour
   */
  private findMatchingEntry(entries: NPCScheduleEntry[], currentHour: number): NPCScheduleEntry | null {
    for (const entry of entries) {
      if (this.isHourInRange(currentHour, entry.startHour, entry.endHour)) {
        return entry;
      }
    }
    return null;
  }

  /**
   * Check if hour is within range (handles midnight wrap)
   */
  private isHourInRange(hour: number, start: number, end: number): boolean {
    if (start <= end) {
      return hour >= start && hour < end;
    } else {
      // Wraps around midnight
      return hour >= start || hour < end;
    }
  }

  /**
   * Get schedule summary for NPC
   */
  public getScheduleSummary(npcId: string): {
    current: NPCScheduleEntry | null;
    next: NPCScheduleEntry | null;
    hoursUntilNext: number;
  } | null {
    const schedule = this.schedules.get(npcId);
    const state = this.npcStates.get(npcId);
    if (!schedule || !state) return null;

    const currentEntry = this.getActiveScheduleEntry(schedule, state.lastUpdated);

    // Find next entry
    const currentHour = state.lastUpdated.currentHour;
    let nextEntry: NPCScheduleEntry | null = null;
    let hoursUntilNext = 24;

    for (const entry of schedule.entries) {
      const hoursUntil = this.calculateHoursUntil(currentHour, entry.startHour);
      if (hoursUntil > 0 && hoursUntil < hoursUntilNext) {
        nextEntry = entry;
        hoursUntilNext = hoursUntil;
      }
    }

    return {
      current: currentEntry,
      next: nextEntry,
      hoursUntilNext,
    };
  }

  /**
   * Calculate hours until target hour
   */
  private calculateHoursUntil(currentHour: number, targetHour: number): number {
    if (targetHour > currentHour) {
      return targetHour - currentHour;
    } else if (targetHour < currentHour) {
      return (24 - currentHour) + targetHour;
    }
    return 0;
  }

  /**
   * Force NPC to specific location (override schedule)
   */
  public forceNPCLocation(npcId: string, locationId: string): void {
    const state = this.npcStates.get(npcId);
    if (!state) return;

    const oldLocation = state.currentLocationId;
    state.currentLocationId = locationId;
    this.npcStates.set(npcId, state);

    if (oldLocation !== locationId) {
      this.notifyLocationChange(npcId, oldLocation, locationId);
    }
  }

  /**
   * Add listener for NPC location changes
   */
  public addLocationChangeListener(
    id: string,
    callback: (npcId: string, oldLocation: string, newLocation: string) => void
  ): void {
    this.listeners.set(id, callback);
  }

  /**
   * Remove listener
   */
  public removeLocationChangeListener(id: string): void {
    this.listeners.delete(id);
  }

  /**
   * Notify listeners of location change
   */
  private notifyLocationChange(npcId: string, oldLocation: string, newLocation: string): void {
    this.listeners.forEach((callback) => {
      try {
        callback(npcId, oldLocation, newLocation);
      } catch (error) {
        console.error('Error in NPC location listener:', error);
      }
    });
  }

  /**
   * Get all NPC states
   */
  public getAllNPCStates(): Map<string, NPCState> {
    return new Map(this.npcStates);
  }

  /**
   * Serialize for saving
   */
  public serialize(): {
    schedules: Array<[string, NPCSchedule]>;
    npcStates: Array<[string, NPCState]>;
  } {
    return {
      schedules: Array.from(this.schedules.entries()),
      npcStates: Array.from(this.npcStates.entries()),
    };
  }

  /**
   * Load from save data
   */
  public static deserialize(data: {
    schedules: Array<[string, NPCSchedule]>;
    npcStates: Array<[string, NPCState]>;
  }): NPCScheduleSystem {
    const system = new NPCScheduleSystem();
    system.schedules = new Map(data.schedules);
    system.npcStates = new Map(data.npcStates);
    return system;
  }

  /**
   * Reset system
   */
  public reset(): void {
    this.npcStates.clear();
    // Re-initialize states from schedules
    this.schedules.forEach((schedule) => {
      this.npcStates.set(schedule.npcId, {
        npcId: schedule.npcId,
        currentLocationId: schedule.defaultLocation,
        currentActivity: 'IDLE',
        available: true,
        lastUpdated: { currentHour: 0, currentDay: 0, totalTurns: 0, totalMinutes: 0 },
      });
    });
  }

  /**
   * Get descriptive activity text
   */
  public getActivityDescription(activity: NPCActivity): string {
    const descriptions: Record<NPCActivity, string> = {
      SLEEPING: 'sleeping',
      WORKING: 'hard at work',
      EATING: 'eating a meal',
      SOCIALIZING: 'chatting with others',
      TRAVELING: 'traveling',
      GUARDING: 'standing guard',
      SHOPPING: 'browsing goods',
      IDLE: 'standing around',
    };
    return descriptions[activity] || 'doing something';
  }
}

/**
 * Helper to create a simple daily schedule
 */
export function createSimpleDailySchedule(
  npcId: string,
  defaultLocation: string,
  entries: Array<{
    start: number;
    end: number;
    location: string;
    activity: NPCActivity;
    available?: boolean;
  }>
): NPCSchedule {
  return {
    npcId,
    defaultLocation,
    entries: entries.map((e) => ({
      startHour: e.start,
      endHour: e.end,
      locationId: e.location,
      activity: e.activity,
      available: e.available !== undefined ? e.available : true,
    })),
  };
}

/**
 * Preset schedules for common NPC types
 */
export const PresetSchedules = {
  merchant: (npcId: string, shopLocation: string, homeLocation: string): NPCSchedule => ({
    npcId,
    defaultLocation: shopLocation,
    entries: [
      { startHour: 0, endHour: 6, locationId: homeLocation, activity: 'SLEEPING', available: false },
      { startHour: 6, endHour: 8, locationId: homeLocation, activity: 'EATING', available: false },
      { startHour: 8, endHour: 12, locationId: shopLocation, activity: 'WORKING', available: true },
      { startHour: 12, endHour: 13, locationId: shopLocation, activity: 'EATING', available: false },
      { startHour: 13, endHour: 18, locationId: shopLocation, activity: 'WORKING', available: true },
      { startHour: 18, endHour: 20, locationId: homeLocation, activity: 'EATING', available: false },
      { startHour: 20, endHour: 24, locationId: homeLocation, activity: 'SOCIALIZING', available: true },
    ],
  }),

  guard: (npcId: string, postLocation: string, barracksLocation: string): NPCSchedule => ({
    npcId,
    defaultLocation: postLocation,
    entries: [
      { startHour: 0, endHour: 6, locationId: barracksLocation, activity: 'SLEEPING', available: false },
      { startHour: 6, endHour: 22, locationId: postLocation, activity: 'GUARDING', available: true },
      { startHour: 22, endHour: 24, locationId: barracksLocation, activity: 'IDLE', available: true },
    ],
  }),

  innkeeper: (npcId: string, innLocation: string): NPCSchedule => ({
    npcId,
    defaultLocation: innLocation,
    entries: [
      { startHour: 0, endHour: 6, locationId: innLocation, activity: 'SLEEPING', available: false },
      { startHour: 6, endHour: 24, locationId: innLocation, activity: 'WORKING', available: true },
    ],
  }),
};
