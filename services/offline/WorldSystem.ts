
import { SceneData, InventoryItem, Language } from '../../types';
import { BIOME_DB } from './data/worldData';

export interface Room {
    id: string;
    x: number;
    y: number;
    biome: 'forest' | 'cave' | 'town' | 'desert' | 'dungeon' | 'interior' | 'graveyard' | 'cyber_city' | 'canyon';
    features: string[];
    entities: string[]; // Enemy or NPC IDs
    items: InventoryItem[]; // Loot on the ground
    visited: boolean;
    descriptionSeed: number; // To keep flavor text consistent
}

export class WorldSystem {
    private grid: Room[][] = [];
    private width = 5;
    private height = 5;
    public playerX = 2;
    public playerY = 2;

    constructor() {
        this.generateWorld();
    }

    public generateWorld() {
        this.grid = [];
        // 1. Determine Biome Layout (Simple Voronoi-like clusters)
        // Top-Left: Forest, Top-Right: Mountain/Cave, Center: Town, Bottom: Dungeon
        
        for (let y = 0; y < this.height; y++) {
            const row: Room[] = [];
            for (let x = 0; x < this.width; x++) {
                row.push(this.createRoom(x, y));
            }
            this.grid.push(row);
        }
    }

    private createRoom(x: number, y: number): Room {
        let biome: any = 'forest';
        
        // Simple biome geography
        if (x === 2 && y === 2) biome = 'town';
        else if (y === 0) biome = 'graveyard'; // North is scary
        else if (y === 4) biome = 'desert'; // South is hot
        else if (x === 0) biome = 'forest'; // West is wild
        else if (x === 4) biome = 'canyon'; // East is rocky
        else if (x === 1 && y === 1) biome = 'dungeon';
        
        // Overrides for variety
        if (Math.random() > 0.7 && biome === 'forest') biome = 'cave';

        // Features
        const features = this.getFeaturesForBiome(biome);
        
        // Entities (40% chance, 0% in Town unless merchant)
        const entities = [];
        if (biome === 'town') {
            entities.push('merchant');
        } else if (Math.random() < 0.4) {
            entities.push(this.getEnemyForBiome(biome));
        }

        return {
            id: `${x}-${y}`,
            x, y,
            biome,
            features: [features[Math.floor(Math.random() * features.length)]],
            entities,
            items: [],
            visited: false,
            descriptionSeed: Math.floor(Math.random() * 10000)
        };
    }

    private getFeaturesForBiome(biome: string): string[] {
        switch(biome) {
            case 'town': return ['fountain', 'statue', 'market stall', 'lamppost'];
            case 'forest': return ['ancient oak', 'hollow log', 'totem', 'stream'];
            case 'dungeon': return ['altar', 'iron cage', 'torch', 'portcullis'];
            case 'graveyard': return ['tombstone', 'mausoleum', 'dead tree', 'open grave'];
            case 'desert': return ['cactus', 'dune', 'bones', 'oasis'];
            case 'cyber_city': return ['hologram', 'terminal', 'neon sign', 'server rack'];
            case 'cave': return ['stalactite', 'fissure', 'crystal cluster'];
            default: return ['rock', 'puddle'];
        }
    }

    private getEnemyForBiome(biome: string): string {
        switch(biome) {
            case 'forest': return 'wolf';
            case 'graveyard': return 'ghost';
            case 'dungeon': return 'zombie';
            case 'cyber_city': return 'robot';
            case 'desert': return 'bandit';
            case 'cave': return 'wolf';
            default: return 'wolf';
        }
    }

    public getCurrentRoom(): Room {
        return this.grid[this.playerY][this.playerX];
    }

    public move(direction: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST'): boolean {
        let nx = this.playerX;
        let ny = this.playerY;

        if (direction === 'NORTH') ny--;
        if (direction === 'SOUTH') ny++;
        if (direction === 'WEST') nx--;
        if (direction === 'EAST') nx++;

        if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
            this.playerX = nx;
            this.playerY = ny;
            this.getCurrentRoom().visited = true;
            return true;
        }
        return false;
    }

    public removeEntity(roomId: string, entityId: string) {
        const room = this.getRoomById(roomId);
        if (room) {
            room.entities = room.entities.filter(e => e !== entityId);
        }
    }

    private getRoomById(id: string): Room | undefined {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x].id === id) return this.grid[y][x];
            }
        }
        return undefined;
    }

    // --- SERIALIZATION ---
    public serialize(): any {
        return {
            grid: this.grid,
            playerX: this.playerX,
            playerY: this.playerY
        };
    }

    public load(data: any) {
        if (data && data.grid) {
            this.grid = data.grid;
            this.playerX = data.playerX;
            this.playerY = data.playerY;
        }
    }
}
