
import { Language, GameTurnData, UserProfile, InventoryItem } from '../types';

export interface SaveData {
  version: string;
  timestamp: number;
  profile: UserProfile;
  turnHistory: GameTurnData[];
  currentHealth: number;
  inventory: InventoryItem[];
  location: string;
  customData?: any;
  worldState?: any; // NEW: Stores WorldSystem serialized grid
}

const SAVE_KEY = 'penko_save_v1';

function migrateSave(data: any): SaveData {
    let migratedData = { ...data };
    if (!migratedData.version || migratedData.version === '1.2.0') {
        migratedData = {
            ...migratedData,
            version: '1.3.0',
            profile: {
                ...migratedData.profile,
                ollamaModel: migratedData.profile.ollamaModel || 'llama3.2',
                openaiBaseUrl: migratedData.profile.openaiBaseUrl || "http://localhost:1234/v1",
                openaiModel: migratedData.profile.openaiModel || "local-model"
            }
        };
    }
    return migratedData as SaveData;
}

export function saveGame(data: SaveData): boolean {
  try {
    const compressed = JSON.stringify(data);
    localStorage.setItem(SAVE_KEY, compressed);
    return true;
  } catch (e) {
    console.error('Failed to save game:', e);
    return false;
  }
}

export function loadGame(): SaveData | null {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) return null;
    const rawData = JSON.parse(saved);
    return migrateSave(rawData);
  } catch (e) {
    console.error('Failed to load game:', e);
    return null;
  }
}

export function deleteSave(): void {
  localStorage.removeItem(SAVE_KEY);
}

export function hasSave(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null;
}

export function exportSaveToFile() {
    const data = loadGame();
    if (!data) return false;

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `penko_save_${data.profile.targetLanguage}_${dateStr}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
}

export async function importSaveFromFile(file: File): Promise<boolean> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                if (json.version && json.profile && json.turnHistory) {
                    saveGame(json);
                    resolve(true);
                } else {
                    console.error("Invalid save file format");
                    resolve(false);
                }
            } catch (err) {
                console.error("Failed to parse save file", err);
                resolve(false);
            }
        };
        reader.readAsText(file);
    });
}
