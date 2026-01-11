/**
 * WorldSystem - Unified World State Management
 *
 * Combines TimeSystem, NPCScheduleSystem, and WeatherSystem into
 * a cohesive world state manager for Community Mode.
 */

import { TimeSystem, TimeState, TimeConfig } from './TimeSystem';
import { NPCScheduleSystem, NPCSchedule, NPCState } from './NPCScheduleSystem';
import { WeatherSystem, WeatherType, WeatherState } from './WeatherSystem';
import { Biome } from '../../types';

export interface WorldState {
  time: TimeState;
  weather: WeatherState;
  npcStates: Map<string, NPCState>;
  currentBiome: Biome;
}

export interface WorldSystemConfig {
  timeConfig?: Partial<TimeConfig>;
  startingBiome?: Biome;
  enableWeather?: boolean;
  enableNPCSchedules?: boolean;
}

export class WorldSystem {
  private timeSystem: TimeSystem;
  private npcSystem: NPCScheduleSystem;
  private weatherSystem: WeatherSystem;
  private currentBiome: Biome;
  private enableWeather: boolean;
  private enableNPCSchedules: boolean;

  constructor(config?: WorldSystemConfig) {
    this.timeSystem = new TimeSystem(config?.timeConfig);
    this.npcSystem = new NPCScheduleSystem();
    this.weatherSystem = new WeatherSystem();
    this.currentBiome = config?.startingBiome || 'forest';
    this.enableWeather = config?.enableWeather !== false;
    this.enableNPCSchedules = config?.enableNPCSchedules !== false;

    // Link systems together
    this.setupSystemIntegration();
  }

  /**
   * Setup integration between systems
   */
  private setupSystemIntegration(): void {
    // Update NPCs when time changes significantly
    this.timeSystem.addListener('npc_update', (timeState) => {
      if (this.enableNPCSchedules) {
        this.npcSystem.updateNPCLocations(timeState);
      }
    });

    // Update weather when time changes
    this.timeSystem.addListener('weather_update', (timeState) => {
      if (this.enableWeather) {
        this.weatherSystem.update(this.currentBiome, timeState);
      }
    });
  }

  /**
   * Advance time by one turn and update all systems
   */
  public advanceTurn(): {
    timeChanged: boolean;
    weatherChanged: boolean;
    npcMoved: Map<string, { oldLocation: string; newLocation: string }>;
    messages: string[];
  } {
    const oldTime = this.timeSystem.snapshot();
    const oldWeather = this.weatherSystem.getState().currentWeather;

    // Advance time
    const newTimeState = this.timeSystem.advanceTurn();

    // Update weather
    if (this.enableWeather) {
      this.weatherSystem.update(this.currentBiome, newTimeState);
    }

    // Update NPCs
    let npcMoved = new Map<string, { oldLocation: string; newLocation: string }>();
    if (this.enableNPCSchedules) {
      npcMoved = this.npcSystem.updateNPCLocations(newTimeState);
    }

    const newTime = this.timeSystem.snapshot();
    const newWeather = this.weatherSystem.getState().currentWeather;

    // Generate messages
    const messages: string[] = [];

    // Time change messages
    if (!oldTime.equals(newTime)) {
      const timeOfDay = this.timeSystem.getTimeOfDay();
      if (timeOfDay === 'night' && oldTime.getHour() < 20) {
        messages.push('Night falls...');
      } else if (timeOfDay === 'day' && oldTime.getHour() < 6) {
        messages.push('Dawn breaks...');
      }
    }

    // Weather change messages
    if (oldWeather !== newWeather && this.enableWeather) {
      const weatherText = this.weatherSystem.getAtmosphericText();
      if (weatherText) {
        messages.push(weatherText);
      }
    }

    // NPC movement messages
    if (npcMoved.size > 0) {
      messages.push(`${npcMoved.size} NPC(s) changed location.`);
    }

    return {
      timeChanged: !oldTime.equals(newTime),
      weatherChanged: oldWeather !== newWeather,
      npcMoved,
      messages,
    };
  }

  /**
   * Change current biome (affects weather)
   */
  public setBiome(biome: Biome): void {
    this.currentBiome = biome;

    // Reset weather for new biome
    if (this.enableWeather) {
      this.weatherSystem.update(biome, this.timeSystem.getState());
    }
  }

  /**
   * Get current biome
   */
  public getBiome(): Biome {
    return this.currentBiome;
  }

  /**
   * Get complete world state
   */
  public getState(): WorldState {
    return {
      time: this.timeSystem.getState(),
      weather: this.weatherSystem.getState(),
      npcStates: this.npcSystem.getAllNPCStates(),
      currentBiome: this.currentBiome,
    };
  }

  /**
   * Get time system
   */
  public getTimeSystem(): TimeSystem {
    return this.timeSystem;
  }

  /**
   * Get NPC system
   */
  public getNPCSystem(): NPCScheduleSystem {
    return this.npcSystem;
  }

  /**
   * Get weather system
   */
  public getWeatherSystem(): WeatherSystem {
    return this.weatherSystem;
  }

  /**
   * Register NPC schedule
   */
  public registerNPCSchedule(schedule: NPCSchedule): void {
    this.npcSystem.registerSchedule(schedule);
  }

  /**
   * Get NPCs at specific location
   */
  public getNPCsAtLocation(locationId: string): string[] {
    if (!this.enableNPCSchedules) return [];
    return this.npcSystem.getNPCsAtLocation(locationId);
  }

  /**
   * Check if NPC is available for interaction
   */
  public isNPCAvailable(npcId: string): boolean {
    if (!this.enableNPCSchedules) return true;
    return this.npcSystem.isNPCAvailable(npcId);
  }

  /**
   * Get contextual info for location
   */
  public getLocationContext(locationId: string): {
    timeOfDay: string;
    formattedTime: string;
    weather: string;
    weatherDescription: string;
    npcsPresent: string[];
    atmosphericText: string;
    modifiers: {
      visibility: number;
      movement: number;
      combat: number;
    };
  } {
    const timeState = this.timeSystem.getState();
    const weatherState = this.weatherSystem.getState();
    const npcs = this.getNPCsAtLocation(locationId);

    return {
      timeOfDay: this.timeSystem.getTimeOfDay(),
      formattedTime: this.timeSystem.getFormattedTime(),
      weather: weatherState.currentWeather,
      weatherDescription: this.weatherSystem.getDescription(),
      npcsPresent: npcs,
      atmosphericText: this.weatherSystem.getAtmosphericText(),
      modifiers: {
        visibility: this.weatherSystem.getVisibilityModifier(),
        movement: this.weatherSystem.getMovementModifier(),
        combat: this.weatherSystem.getCombatModifier(),
      },
    };
  }

  /**
   * Get narrative description incorporating all world systems
   */
  public getWorldNarrative(): string {
    const parts: string[] = [];

    // Time
    parts.push(this.timeSystem.getFormattedTime());

    // Weather (if relevant)
    if (this.enableWeather && this.currentBiome !== 'cave' && this.currentBiome !== 'dungeon' && this.currentBiome !== 'interior') {
      const weatherDesc = this.weatherSystem.getDescription();
      if (weatherDesc !== 'Clear skies') {
        parts.push(weatherDesc);
      }
    }

    return parts.join(' - ');
  }

  /**
   * Fast-forward time to specific hour
   */
  public fastForwardToTime(hour: number): {
    hoursPassed: number;
    npcChanges: Map<string, { oldLocation: string; newLocation: string }>;
    messages: string[];
  } {
    const startTime = this.timeSystem.getState();
    const hoursToAdvance = this.timeSystem.getHoursUntil(hour);

    this.timeSystem.advanceTime(hoursToAdvance);

    const newTimeState = this.timeSystem.getState();
    const npcChanges = this.enableNPCSchedules
      ? this.npcSystem.updateNPCLocations(newTimeState)
      : new Map();

    if (this.enableWeather) {
      this.weatherSystem.update(this.currentBiome, newTimeState);
    }

    const messages: string[] = [
      `Time passes... (${hoursToAdvance} hours)`,
    ];

    if (npcChanges.size > 0) {
      messages.push(`${npcChanges.size} NPC(s) moved during this time.`);
    }

    return {
      hoursPassed: hoursToAdvance,
      npcChanges,
      messages,
    };
  }

  /**
   * Rest/sleep until morning
   */
  public restUntilMorning(): {
    hoursRested: number;
    healthRestored: number;
    messages: string[];
  } {
    const currentHour = this.timeSystem.getState().currentHour;
    let targetHour = 8; // 8 AM

    // If it's already morning, rest until next morning
    if (currentHour >= 6 && currentHour < 20) {
      targetHour = 8 + 24; // Tomorrow
    }

    const hoursToRest = this.timeSystem.getHoursUntil(targetHour % 24);
    const actualHours = Math.min(hoursToRest, 12); // Max 12 hours rest

    // Advance time
    this.timeSystem.advanceTime(actualHours);

    // Update systems
    const newTimeState = this.timeSystem.getState();
    if (this.enableNPCSchedules) {
      this.npcSystem.updateNPCLocations(newTimeState);
    }
    if (this.enableWeather) {
      this.weatherSystem.update(this.currentBiome, newTimeState);
    }

    // Calculate health restored (roughly 10 HP per hour)
    const healthRestored = actualHours * 10;

    return {
      hoursRested: actualHours,
      healthRestored,
      messages: [
        `You rest for ${actualHours} hours...`,
        `Restored ${healthRestored} health.`,
        `It is now ${this.timeSystem.getFormattedTime()}.`,
      ],
    };
  }

  /**
   * Serialize entire world state
   */
  public serialize(): {
    time: ReturnType<TimeSystem['serialize']>;
    npcs: ReturnType<NPCScheduleSystem['serialize']>;
    weather: WeatherState;
    currentBiome: Biome;
    enableWeather: boolean;
    enableNPCSchedules: boolean;
  } {
    return {
      time: this.timeSystem.serialize(),
      npcs: this.npcSystem.serialize(),
      weather: this.weatherSystem.serialize(),
      currentBiome: this.currentBiome,
      enableWeather: this.enableWeather,
      enableNPCSchedules: this.enableNPCSchedules,
    };
  }

  /**
   * Deserialize and restore world state
   */
  public static deserialize(data: {
    time: any;
    npcs: any;
    weather: WeatherState;
    currentBiome: Biome;
    enableWeather: boolean;
    enableNPCSchedules: boolean;
  }): WorldSystem {
    const system = new WorldSystem({
      startingBiome: data.currentBiome,
      enableWeather: data.enableWeather,
      enableNPCSchedules: data.enableNPCSchedules,
    });

    // Restore subsystems
    system.timeSystem = TimeSystem.deserialize(data.time);
    system.npcSystem = NPCScheduleSystem.deserialize(data.npcs);
    system.weatherSystem = WeatherSystem.deserialize(data.weather);

    // Re-setup integration
    system.setupSystemIntegration();

    return system;
  }

  /**
   * Reset all systems
   */
  public reset(): void {
    this.timeSystem.reset();
    this.npcSystem.reset();
    this.weatherSystem.reset();
  }
}

/**
 * Create default world system for content packs
 */
export function createDefaultWorldSystem(startingBiome?: Biome): WorldSystem {
  return new WorldSystem({
    timeConfig: {
      turnsPerHour: 4,
      hoursPerDay: 24,
      startTime: 8,
      startDay: 1,
      enableRealTime: false,
    },
    startingBiome: startingBiome || 'forest',
    enableWeather: true,
    enableNPCSchedules: true,
  });
}
