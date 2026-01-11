/**
 * WeatherSystem - Dynamic Weather and Environmental Effects
 *
 * Manages weather conditions, environmental hazards, and atmospheric effects.
 * Weather can affect gameplay, visibility, and NPC behavior.
 */

import { Biome, TimeOfDay } from '../../types';
import type { TimeState } from './TimeSystem';

export type WeatherType =
  | 'CLEAR'
  | 'CLOUDY'
  | 'RAIN'
  | 'HEAVY_RAIN'
  | 'STORM'
  | 'SNOW'
  | 'BLIZZARD'
  | 'FOG'
  | 'SANDSTORM'
  | 'WIND';

export interface WeatherState {
  currentWeather: WeatherType;
  intensity: number;            // 0.0 to 1.0
  duration: number;             // Turns remaining
  transitionTo: WeatherType | null;
}

export interface WeatherEffect {
  type: WeatherType;
  visibilityModifier: number;   // Multiplier for visibility (0.0 to 1.0)
  movementModifier: number;      // Multiplier for movement speed
  combatModifier: number;        // Modifier for combat difficulty
  description: string;
  atmosphericText: string[];    // Random flavor text
}

export interface BiomeWeatherConfig {
  biome: Biome;
  possibleWeather: WeatherType[];
  weatherWeights: Record<WeatherType, number>; // Probability weights
  seasonalModifier?: Record<number, number>; // Month-based modifiers
}

export class WeatherSystem {
  private currentState: WeatherState;
  private biomeConfigs: Map<Biome, BiomeWeatherConfig> = new Map();
  private weatherEffects: Map<WeatherType, WeatherEffect> = new Map();
  private changeListeners: Map<string, (oldWeather: WeatherType, newWeather: WeatherType) => void> = new Map();

  constructor() {
    this.currentState = {
      currentWeather: 'CLEAR',
      intensity: 0.5,
      duration: 10,
      transitionTo: null,
    };

    this.initializeWeatherEffects();
    this.initializeBiomeConfigs();
  }

  /**
   * Initialize weather effect definitions
   */
  private initializeWeatherEffects(): void {
    this.weatherEffects.set('CLEAR', {
      type: 'CLEAR',
      visibilityModifier: 1.0,
      movementModifier: 1.0,
      combatModifier: 0,
      description: 'Clear skies',
      atmosphericText: [
        'The sun shines brightly.',
        'A perfect day.',
        'Clear visibility all around.',
      ],
    });

    this.weatherEffects.set('CLOUDY', {
      type: 'CLOUDY',
      visibilityModifier: 0.9,
      movementModifier: 1.0,
      combatModifier: 0,
      description: 'Cloudy',
      atmosphericText: [
        'Clouds drift overhead.',
        'The sky is overcast.',
        'Gray clouds block the sun.',
      ],
    });

    this.weatherEffects.set('RAIN', {
      type: 'RAIN',
      visibilityModifier: 0.7,
      movementModifier: 0.9,
      combatModifier: -5,
      description: 'Raining',
      atmosphericText: [
        'Rain falls steadily.',
        'Droplets patter on the ground.',
        'Everything is getting wet.',
      ],
    });

    this.weatherEffects.set('HEAVY_RAIN', {
      type: 'HEAVY_RAIN',
      visibilityModifier: 0.5,
      movementModifier: 0.7,
      combatModifier: -10,
      description: 'Heavy rain',
      atmosphericText: [
        'Rain pours down relentlessly.',
        'You can barely see through the downpour.',
        'Water streams everywhere.',
      ],
    });

    this.weatherEffects.set('STORM', {
      type: 'STORM',
      visibilityModifier: 0.4,
      movementModifier: 0.6,
      combatModifier: -15,
      description: 'Thunderstorm',
      atmosphericText: [
        'Thunder rumbles ominously.',
        'Lightning flashes in the distance.',
        'A fierce storm rages.',
      ],
    });

    this.weatherEffects.set('SNOW', {
      type: 'SNOW',
      visibilityModifier: 0.8,
      movementModifier: 0.8,
      combatModifier: -5,
      description: 'Snowing',
      atmosphericText: [
        'Snow falls gently.',
        'White flakes drift down.',
        'The world turns white.',
      ],
    });

    this.weatherEffects.set('BLIZZARD', {
      type: 'BLIZZARD',
      visibilityModifier: 0.3,
      movementModifier: 0.5,
      combatModifier: -20,
      description: 'Blizzard',
      atmosphericText: [
        'A howling blizzard rages.',
        'You can barely see a few feet ahead.',
        'Freezing wind and snow whip around you.',
      ],
    });

    this.weatherEffects.set('FOG', {
      type: 'FOG',
      visibilityModifier: 0.4,
      movementModifier: 0.9,
      combatModifier: -10,
      description: 'Foggy',
      atmosphericText: [
        'Thick fog obscures your vision.',
        'Mist swirls around you.',
        'You can barely see through the fog.',
      ],
    });

    this.weatherEffects.set('SANDSTORM', {
      type: 'SANDSTORM',
      visibilityModifier: 0.3,
      movementModifier: 0.6,
      combatModifier: -15,
      description: 'Sandstorm',
      atmosphericText: [
        'Sand whips through the air.',
        'A fierce sandstorm obscures everything.',
        'Grit stings your face.',
      ],
    });

    this.weatherEffects.set('WIND', {
      type: 'WIND',
      visibilityModifier: 0.9,
      movementModifier: 0.8,
      combatModifier: -5,
      description: 'Windy',
      atmosphericText: [
        'Strong winds blow.',
        'The air rushes past you.',
        'Wind howls around you.',
      ],
    });
  }

  /**
   * Initialize biome-specific weather configurations
   */
  private initializeBiomeConfigs(): void {
    this.biomeConfigs.set('forest', {
      biome: 'forest',
      possibleWeather: ['CLEAR', 'CLOUDY', 'RAIN', 'HEAVY_RAIN', 'FOG'],
      weatherWeights: {
        'CLEAR': 40,
        'CLOUDY': 30,
        'RAIN': 20,
        'HEAVY_RAIN': 5,
        'FOG': 5,
      } as any,
    });

    this.biomeConfigs.set('desert', {
      biome: 'desert',
      possibleWeather: ['CLEAR', 'WIND', 'SANDSTORM'],
      weatherWeights: {
        'CLEAR': 70,
        'WIND': 20,
        'SANDSTORM': 10,
      } as any,
    });

    this.biomeConfigs.set('cave', {
      biome: 'cave',
      possibleWeather: ['CLEAR'], // Caves don't have weather
      weatherWeights: {
        'CLEAR': 100,
      } as any,
    });

    this.biomeConfigs.set('town', {
      biome: 'town',
      possibleWeather: ['CLEAR', 'CLOUDY', 'RAIN', 'STORM', 'SNOW'],
      weatherWeights: {
        'CLEAR': 50,
        'CLOUDY': 25,
        'RAIN': 15,
        'STORM': 5,
        'SNOW': 5,
      } as any,
    });

    this.biomeConfigs.set('dungeon', {
      biome: 'dungeon',
      possibleWeather: ['CLEAR'], // Dungeons don't have weather
      weatherWeights: {
        'CLEAR': 100,
      } as any,
    });

    this.biomeConfigs.set('graveyard', {
      biome: 'graveyard',
      possibleWeather: ['CLEAR', 'CLOUDY', 'FOG', 'RAIN', 'STORM'],
      weatherWeights: {
        'CLEAR': 20,
        'CLOUDY': 30,
        'FOG': 30,
        'RAIN': 15,
        'STORM': 5,
      } as any,
    });

    this.biomeConfigs.set('cyber_city', {
      biome: 'cyber_city',
      possibleWeather: ['CLEAR', 'RAIN', 'FOG'],
      weatherWeights: {
        'CLEAR': 40,
        'RAIN': 40,
        'FOG': 20,
      } as any,
    });

    this.biomeConfigs.set('canyon', {
      biome: 'canyon',
      possibleWeather: ['CLEAR', 'WIND', 'SANDSTORM'],
      weatherWeights: {
        'CLEAR': 60,
        'WIND': 30,
        'SANDSTORM': 10,
      } as any,
    });

    this.biomeConfigs.set('interior', {
      biome: 'interior',
      possibleWeather: ['CLEAR'], // Interior locations don't have weather
      weatherWeights: {
        'CLEAR': 100,
      } as any,
    });
  }

  /**
   * Update weather (call each turn or time change)
   */
  public update(biome: Biome, timeState: TimeState): void {
    this.currentState.duration--;

    if (this.currentState.duration <= 0) {
      // Time to change weather
      this.changeWeather(biome, timeState);
    }
  }

  /**
   * Change weather based on biome and conditions
   */
  private changeWeather(biome: Biome, timeState: TimeState): void {
    const config = this.biomeConfigs.get(biome);
    if (!config) {
      this.currentState.currentWeather = 'CLEAR';
      return;
    }

    const oldWeather = this.currentState.currentWeather;
    const newWeather = this.selectWeather(config, timeState);

    this.currentState.currentWeather = newWeather;
    this.currentState.intensity = Math.random() * 0.5 + 0.5; // 0.5 to 1.0
    this.currentState.duration = Math.floor(Math.random() * 10) + 5; // 5-15 turns
    this.currentState.transitionTo = null;

    if (oldWeather !== newWeather) {
      this.notifyWeatherChange(oldWeather, newWeather);
    }
  }

  /**
   * Select weather based on weights and conditions
   */
  private selectWeather(config: BiomeWeatherConfig, timeState: TimeState): WeatherType {
    const weights = { ...config.weatherWeights };

    // Night increases fog chance
    const hour = timeState.currentHour;
    if (hour >= 20 || hour < 6) {
      if (weights['FOG']) {
        weights['FOG'] *= 2;
      }
    }

    // Calculate total weight
    let totalWeight = 0;
    Object.values(weights).forEach((weight) => {
      totalWeight += weight;
    });

    // Random selection
    let random = Math.random() * totalWeight;
    for (const [weather, weight] of Object.entries(weights)) {
      random -= weight;
      if (random <= 0) {
        return weather as WeatherType;
      }
    }

    return config.possibleWeather[0];
  }

  /**
   * Get current weather state
   */
  public getState(): WeatherState {
    return { ...this.currentState };
  }

  /**
   * Get current weather effect
   */
  public getCurrentEffect(): WeatherEffect | null {
    return this.weatherEffects.get(this.currentState.currentWeather) || null;
  }

  /**
   * Get atmospheric text for current weather
   */
  public getAtmosphericText(): string {
    const effect = this.getCurrentEffect();
    if (!effect || !effect.atmosphericText.length) return '';

    const index = Math.floor(Math.random() * effect.atmosphericText.length);
    return effect.atmosphericText[index];
  }

  /**
   * Get visibility modifier (for ranged combat, exploration)
   */
  public getVisibilityModifier(): number {
    const effect = this.getCurrentEffect();
    if (!effect) return 1.0;

    return effect.visibilityModifier * this.currentState.intensity;
  }

  /**
   * Get movement modifier (affects travel time)
   */
  public getMovementModifier(): number {
    const effect = this.getCurrentEffect();
    if (!effect) return 1.0;

    return effect.movementModifier;
  }

  /**
   * Get combat modifier (affects difficulty)
   */
  public getCombatModifier(): number {
    const effect = this.getCurrentEffect();
    if (!effect) return 0;

    return effect.combatModifier * this.currentState.intensity;
  }

  /**
   * Force weather change
   */
  public setWeather(weather: WeatherType, duration?: number): void {
    const oldWeather = this.currentState.currentWeather;
    this.currentState.currentWeather = weather;
    this.currentState.duration = duration || 10;
    this.currentState.intensity = 0.8;

    if (oldWeather !== weather) {
      this.notifyWeatherChange(oldWeather, weather);
    }
  }

  /**
   * Check if current weather is hazardous
   */
  public isHazardous(): boolean {
    const hazardous: WeatherType[] = ['HEAVY_RAIN', 'STORM', 'BLIZZARD', 'SANDSTORM'];
    return hazardous.includes(this.currentState.currentWeather);
  }

  /**
   * Get weather description
   */
  public getDescription(): string {
    const effect = this.getCurrentEffect();
    return effect ? effect.description : 'Unknown';
  }

  /**
   * Add weather change listener
   */
  public addListener(
    id: string,
    callback: (oldWeather: WeatherType, newWeather: WeatherType) => void
  ): void {
    this.changeListeners.set(id, callback);
  }

  /**
   * Remove listener
   */
  public removeListener(id: string): void {
    this.changeListeners.delete(id);
  }

  /**
   * Notify listeners of weather change
   */
  private notifyWeatherChange(oldWeather: WeatherType, newWeather: WeatherType): void {
    this.changeListeners.forEach((callback) => {
      try {
        callback(oldWeather, newWeather);
      } catch (error) {
        console.error('Error in weather listener:', error);
      }
    });
  }

  /**
   * Serialize for saving
   */
  public serialize(): WeatherState {
    return { ...this.currentState };
  }

  /**
   * Load from save data
   */
  public static deserialize(state: WeatherState): WeatherSystem {
    const system = new WeatherSystem();
    system.currentState = { ...state };
    return system;
  }

  /**
   * Reset system
   */
  public reset(): void {
    this.currentState = {
      currentWeather: 'CLEAR',
      intensity: 0.5,
      duration: 10,
      transitionTo: null,
    };
  }
}
