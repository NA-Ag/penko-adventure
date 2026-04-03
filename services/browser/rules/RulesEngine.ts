import { GameMap, Room, fantasyMap, cyberpunkMap, westernMap, horrorMap, mysteryMap, postApocalypticMap, pirateMap, spyMap, sliceOfLifeMap, survivalMap, superheroMap, fairyTaleMap, steampunkMap, schoolMap, timeTravelMap } from "./maps/GameMaps";

export interface SceneContext {
  biome: string;
  features: string[];
  entities: string[];
  timeOfDay: string;
}

export interface PlayerState {
  health: number;
  inventory: string[];
  locationName: string;
  currentRoomId: string;
}

export class RulesEngine {
  private theme: string;
  private map: GameMap;

  constructor(theme: string) {
    this.theme = theme;

    // Load appropriate map based on theme
    if (theme === 'cyberpunk' || theme === 'scifi') {
        this.map = cyberpunkMap;
    } else if (theme === 'western') {
        this.map = westernMap;
    } else if (theme === 'horror') {
        this.map = horrorMap;
    } else if (theme === 'mystery') {
        this.map = mysteryMap;
    } else if (theme === 'post_apocalyptic') {
        this.map = postApocalypticMap;
    } else if (theme === 'pirate') {
        this.map = pirateMap;
    } else if (theme === 'spy') {
        this.map = spyMap;
    } else if (theme === 'slice_of_life') {
        this.map = sliceOfLifeMap;
    } else if (theme === 'survival') {
        this.map = survivalMap;
    } else if (theme === 'superhero') {
        this.map = superheroMap;
    } else if (theme === 'fairy_tale') {
        this.map = fairyTaleMap;
    } else if (theme === 'steampunk') {
        this.map = steampunkMap;
    } else if (theme === 'school') {
        this.map = schoolMap;
    } else if (theme === 'time_travel') {
        this.map = timeTravelMap;
    } else {
        this.map = fantasyMap; // Default to fantasy
    }
  }
  getInitialState(): { scene: SceneContext, playerState: PlayerState, promptInfo: string } {
      const startRoom = this.map.rooms[this.map.startRoom];
      return {
          scene: {
              biome: startRoom.biome,
              features: [...startRoom.features],
              entities: [...startRoom.entities],
              timeOfDay: 'day'
          },
          playerState: {
              health: 100,
              inventory: [],
              locationName: startRoom.name,
              currentRoomId: startRoom.id
          },
          promptInfo: `Initial location: ${startRoom.description}`
      };
  }

  generateOptions(currentRoomId: string, inventory: string[]): string[] {
    const room = this.map.rooms[currentRoomId];
    if (!room) return ["Look around"];

    const options: string[] = ["Look around"];
    
    // Add movement options based on connections
    for (const action in room.connections) {
        options.push(action);
    }

    // Add interaction options
    if (room.features.length > 0) {
        options.push(`Examine ${room.features[0].replace('_', ' ')}`);
        // If it's a known takeable item
        if (room.features.some(f => f.includes('sword') || f.includes('key') || f.includes('potion'))) {
             options.push(`Take ${room.features[0].replace('_', ' ')}`);
        }
    }

    if (room.entities.length > 0) {
        options.push(`Talk to ${room.entities[0]}`);
    }

    return Array.from(new Set(options)).slice(0, 3);
  }

  processInput(input: string, currentScene: SceneContext, playerState: PlayerState): {
      newScene: SceneContext,
      newPlayerState: PlayerState,
      actionEvent: string
  } {
      const lowerInput = input.toLowerCase();
      let actionEvent = "";
      const newScene = { ...currentScene };
      const newPlayerState = { ...playerState };

      const currentRoom = this.map.rooms[playerState.currentRoomId];
      if (!currentRoom) return { newScene, newPlayerState, actionEvent };

      let moved = false;

      // 1. Check for movement via map connections
      for (const [action, targetRoomId] of Object.entries(currentRoom.connections)) {
          // simple includes check for movement commands
          if (lowerInput.includes(action.toLowerCase()) || 
             (action === 'north' && lowerInput.includes('norte')) ||
             (action === 'south' && lowerInput.includes('sur')) ||
             (action === 'east' && lowerInput.includes('este')) ||
             (action === 'west' && lowerInput.includes('oeste')) ||
             (action === 'enter' && lowerInput.includes('entrar')) ||
             (action === 'leave' && lowerInput.includes('salir'))
          ) {
              const targetRoom = this.map.rooms[targetRoomId];
              if (targetRoom) {
                  newPlayerState.currentRoomId = targetRoom.id;
                  newPlayerState.locationName = targetRoom.name;
                  newScene.biome = targetRoom.biome;
                  newScene.features = [...targetRoom.features];
                  newScene.entities = [...targetRoom.entities];
                  actionEvent = `The player moved to a new area: ${targetRoom.description}`;
                  moved = true;
                  break;
              }
          }
      }

      // 2. If didn't move, check for taking items
      if (!moved) {
          const takeMatch = lowerInput.match(/(?:take|pick up|grab|get|tomar|coger|recoger)\s+(\w+)/i);
          if (takeMatch) {
              const item = takeMatch[1];
              // check if item matches any feature
              const foundFeature = newScene.features.find(f => f.toLowerCase().includes(item));
              if (foundFeature) {
                  if (!newPlayerState.inventory.includes(foundFeature)) {
                      newPlayerState.inventory.push(foundFeature);
                      newScene.features = newScene.features.filter(f => f !== foundFeature);
                      actionEvent = `The player picked up the ${foundFeature} and added it to their inventory.`;
                  }
              } else {
                  actionEvent = `The player tried to pick up '${item}' but failed.`;
              }
          }
      }
      
      // 3. Fallback generic action
      if (!actionEvent) {
          actionEvent = `The player did: '${input}'. Describe the result of this action in the current environment.`;
      }

      return { newScene, newPlayerState, actionEvent };
  }
}
