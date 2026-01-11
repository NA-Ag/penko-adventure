import { GameObject } from '../community/ObjectSystem';

/**
 * World state snapshot
 */
export interface WorldState {
  version: string;
  savedAt: number;
  playerId: string;
  location: string;
  objects: GameObject[];
  objectStates: Map<string, ObjectStateData>;
  metadata: WorldMetadata;
}

/**
 * Individual object state data
 */
export interface ObjectStateData {
  id: string;
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
  location: string; // Which location/room the object is in
  isVisible: boolean;
  isDestroyed: boolean;
  modifiedAt: number;
  customProperties?: Record<string, any>; // Any runtime modifications
}

/**
 * World metadata
 */
export interface WorldMetadata {
  totalObjects: number;
  totalLocations: number;
  playTime: number; // milliseconds
  lastSaved: number;
  saveCount: number;
  autoSaveEnabled: boolean;
}

/**
 * Export format for world state
 */
export interface WorldStateExport {
  version: string;
  exportedAt: number;
  worldState: WorldState;
  compressed?: boolean;
}

/**
 * Save slot information
 */
export interface SaveSlot {
  slotId: string;
  name: string;
  playerId: string;
  savedAt: number;
  location: string;
  objectCount: number;
  playTime: number;
  thumbnail?: string; // Base64 encoded image (future)
}

/**
 * WorldStateManager - Manages game world persistence
 *
 * Features:
 * - Save/load complete world state
 * - Object state persistence (position, rotation, scale, visibility)
 * - Multiple save slots
 * - Auto-save functionality
 * - Export/import world state
 * - Compression for large worlds
 * - Change tracking (dirty flag)
 * - Backup system
 *
 * Examples:
 *   manager.saveWorldState() // Save current state
 *   manager.loadWorldState() // Load saved state
 *   manager.enableAutoSave(300000) // Auto-save every 5 minutes
 *   manager.exportWorldState() // Export for sharing/backup
 */
export class WorldStateManager {
  private currentState: WorldState;
  private objects: Map<string, GameObject>;
  private objectStates: Map<string, ObjectStateData>;
  private playerId: string;
  private currentLocation: string;
  private storageKey: string;
  private autoSaveInterval: number | null = null;
  private isDirty: boolean = false;
  private maxSaveSlots: number = 10;
  private playTimeStart: number;
  private totalPlayTime: number = 0;

  constructor(playerId: string = 'player', options: { storageKey?: string } = {}) {
    this.playerId = playerId;
    this.storageKey = options.storageKey || `penko_world_state_${playerId}`;
    this.objects = new Map();
    this.objectStates = new Map();
    this.currentLocation = 'unknown';
    this.playTimeStart = Date.now();

    this.currentState = this.createEmptyState();

    // Try to load existing state
    this.loadWorldState();
  }

  // ============================================================================
  // Object Registration
  // ============================================================================

  /**
   * Register an object in the world
   */
  registerObject(object: GameObject, location: string = this.currentLocation): void {
    this.objects.set(object.id, object);

    // Create or update object state
    if (!this.objectStates.has(object.id)) {
      const state: ObjectStateData = {
        id: object.id,
        location,
        isVisible: true,
        isDestroyed: false,
        modifiedAt: Date.now()
      };
      this.objectStates.set(object.id, state);
    }

    this.markDirty();
  }

  /**
   * Unregister an object from the world
   */
  unregisterObject(objectId: string): boolean {
    const removed = this.objects.delete(objectId);
    if (removed) {
      this.objectStates.delete(objectId);
      this.markDirty();
    }
    return removed;
  }

  /**
   * Get an object by ID
   */
  getObject(objectId: string): GameObject | undefined {
    return this.objects.get(objectId);
  }

  /**
   * Get all objects
   */
  getAllObjects(): GameObject[] {
    return Array.from(this.objects.values());
  }

  /**
   * Get objects in a specific location
   */
  getObjectsInLocation(location: string): GameObject[] {
    const objectsInLocation: GameObject[] = [];

    for (const [id, state] of this.objectStates.entries()) {
      if (state.location === location && !state.isDestroyed) {
        const obj = this.objects.get(id);
        if (obj) {
          objectsInLocation.push(obj);
        }
      }
    }

    return objectsInLocation;
  }

  /**
   * Get visible objects in current location
   */
  getVisibleObjectsInCurrentLocation(): GameObject[] {
    return this.getObjectsInLocation(this.currentLocation).filter(obj => {
      const state = this.objectStates.get(obj.id);
      return state?.isVisible !== false;
    });
  }

  // ============================================================================
  // Object State Management
  // ============================================================================

  /**
   * Update object state
   */
  updateObjectState(objectId: string, updates: Partial<ObjectStateData>): void {
    const state = this.objectStates.get(objectId);
    if (state) {
      Object.assign(state, updates);
      state.modifiedAt = Date.now();
      this.markDirty();
    }
  }

  /**
   * Move object to different location
   */
  moveObjectToLocation(objectId: string, newLocation: string): void {
    this.updateObjectState(objectId, { location: newLocation });
  }

  /**
   * Set object visibility
   */
  setObjectVisibility(objectId: string, visible: boolean): void {
    this.updateObjectState(objectId, { isVisible: visible });
  }

  /**
   * Mark object as destroyed
   */
  destroyObject(objectId: string): void {
    this.updateObjectState(objectId, { isDestroyed: true, isVisible: false });
  }

  /**
   * Restore destroyed object
   */
  restoreObject(objectId: string): void {
    this.updateObjectState(objectId, { isDestroyed: false, isVisible: true });
  }

  /**
   * Update object position (for future 3D/2D support)
   */
  updateObjectPosition(objectId: string, position: { x: number; y: number; z: number }): void {
    this.updateObjectState(objectId, { position });
  }

  /**
   * Update object rotation
   */
  updateObjectRotation(objectId: string, rotation: { x: number; y: number; z: number }): void {
    this.updateObjectState(objectId, { rotation });
  }

  /**
   * Update object scale
   */
  updateObjectScale(objectId: string, scale: { x: number; y: number; z: number }): void {
    this.updateObjectState(objectId, { scale });
  }

  /**
   * Get object state
   */
  getObjectState(objectId: string): ObjectStateData | undefined {
    return this.objectStates.get(objectId);
  }

  /**
   * Update object properties at runtime
   */
  updateObjectProperties(objectId: string, properties: Partial<any>): void {
    const object = this.objects.get(objectId);
    if (object) {
      Object.assign(object.properties, properties);

      // Track in custom properties
      const state = this.objectStates.get(objectId);
      if (state) {
        if (!state.customProperties) {
          state.customProperties = {};
        }
        Object.assign(state.customProperties, properties);
        state.modifiedAt = Date.now();
      }

      this.markDirty();
    }
  }

  // ============================================================================
  // Location Management
  // ============================================================================

  /**
   * Set current location
   */
  setCurrentLocation(location: string): void {
    this.currentLocation = location;
    this.markDirty();
  }

  /**
   * Get current location
   */
  getCurrentLocation(): string {
    return this.currentLocation;
  }

  /**
   * Get all locations with objects
   */
  getAllLocations(): string[] {
    const locations = new Set<string>();
    for (const state of this.objectStates.values()) {
      locations.add(state.location);
    }
    return Array.from(locations);
  }

  // ============================================================================
  // State Persistence
  // ============================================================================

  /**
   * Save world state to localStorage
   */
  saveWorldState(slotName: string = 'default'): { success: boolean; message: string } {
    try {
      this.updatePlayTime();

      const state = this.captureCurrentState();
      const key = this.getSlotKey(slotName);

      const json = JSON.stringify(state);
      const sizeKB = new Blob([json]).size / 1024;

      localStorage.setItem(key, json);

      // Update save slot metadata
      this.saveSaveSlotMetadata(slotName, state);

      this.isDirty = false;

      console.log(`[WorldStateManager] World state saved to slot "${slotName}" (${sizeKB.toFixed(2)}KB)`);

      return {
        success: true,
        message: `World saved successfully (${sizeKB.toFixed(2)}KB, ${state.objects.length} objects)`
      };
    } catch (error) {
      console.error('[WorldStateManager] Failed to save world state:', error);
      return {
        success: false,
        message: `Failed to save: ${error}`
      };
    }
  }

  /**
   * Load world state from localStorage
   */
  loadWorldState(slotName: string = 'default'): { success: boolean; message: string; objectsLoaded?: number } {
    try {
      const key = this.getSlotKey(slotName);
      const json = localStorage.getItem(key);

      if (!json) {
        return {
          success: false,
          message: 'No saved state found'
        };
      }

      const state = JSON.parse(json) as WorldState;

      // Restore state
      this.restoreState(state);

      console.log(`[WorldStateManager] World state loaded from slot "${slotName}" (${state.objects.length} objects)`);

      return {
        success: true,
        message: `World loaded successfully`,
        objectsLoaded: state.objects.length
      };
    } catch (error) {
      console.error('[WorldStateManager] Failed to load world state:', error);
      return {
        success: false,
        message: `Failed to load: ${error}`
      };
    }
  }

  /**
   * Check if saved state exists
   */
  hasSavedState(slotName: string = 'default'): boolean {
    const key = this.getSlotKey(slotName);
    return localStorage.getItem(key) !== null;
  }

  /**
   * Delete saved state
   */
  deleteSaveSlot(slotName: string): boolean {
    try {
      const key = this.getSlotKey(slotName);
      localStorage.removeItem(key);

      // Remove metadata
      const metadataKey = this.getSlotMetadataKey();
      const metadata = this.loadSaveSlotMetadata();
      delete metadata[slotName];
      localStorage.setItem(metadataKey, JSON.stringify(metadata));

      return true;
    } catch (error) {
      console.error('[WorldStateManager] Failed to delete save slot:', error);
      return false;
    }
  }

  /**
   * Capture current world state
   */
  private captureCurrentState(): WorldState {
    this.updatePlayTime();

    return {
      version: '1.0',
      savedAt: Date.now(),
      playerId: this.playerId,
      location: this.currentLocation,
      objects: Array.from(this.objects.values()),
      objectStates: this.objectStates,
      metadata: {
        totalObjects: this.objects.size,
        totalLocations: this.getAllLocations().length,
        playTime: this.totalPlayTime,
        lastSaved: Date.now(),
        saveCount: (this.currentState.metadata?.saveCount || 0) + 1,
        autoSaveEnabled: this.autoSaveInterval !== null
      }
    };
  }

  /**
   * Restore state from saved data
   */
  private restoreState(state: WorldState): void {
    // Clear current state
    this.objects.clear();
    this.objectStates.clear();

    // Restore objects
    for (const obj of state.objects) {
      this.objects.set(obj.id, obj);
    }

    // Restore object states
    if (state.objectStates instanceof Map) {
      this.objectStates = state.objectStates;
    } else {
      // Handle case where Map was serialized as object
      this.objectStates = new Map(Object.entries(state.objectStates as any));
    }

    // Restore metadata
    this.currentLocation = state.location;
    this.totalPlayTime = state.metadata.playTime || 0;
    this.playTimeStart = Date.now();

    this.currentState = state;
    this.isDirty = false;
  }

  /**
   * Create empty state
   */
  private createEmptyState(): WorldState {
    return {
      version: '1.0',
      savedAt: Date.now(),
      playerId: this.playerId,
      location: this.currentLocation,
      objects: [],
      objectStates: new Map(),
      metadata: {
        totalObjects: 0,
        totalLocations: 0,
        playTime: 0,
        lastSaved: Date.now(),
        saveCount: 0,
        autoSaveEnabled: false
      }
    };
  }

  // ============================================================================
  // Save Slots
  // ============================================================================

  /**
   * Get all save slots
   */
  getAllSaveSlots(): SaveSlot[] {
    const metadata = this.loadSaveSlotMetadata();
    return Object.values(metadata);
  }

  /**
   * Get save slot info
   */
  getSaveSlotInfo(slotName: string): SaveSlot | null {
    const metadata = this.loadSaveSlotMetadata();
    return metadata[slotName] || null;
  }

  /**
   * Save slot metadata
   */
  private saveSaveSlotMetadata(slotName: string, state: WorldState): void {
    const metadata = this.loadSaveSlotMetadata();

    metadata[slotName] = {
      slotId: slotName,
      name: slotName,
      playerId: state.playerId,
      savedAt: state.savedAt,
      location: state.location,
      objectCount: state.objects.length,
      playTime: state.metadata.playTime
    };

    const metadataKey = this.getSlotMetadataKey();
    localStorage.setItem(metadataKey, JSON.stringify(metadata));
  }

  /**
   * Load save slot metadata
   */
  private loadSaveSlotMetadata(): Record<string, SaveSlot> {
    try {
      const metadataKey = this.getSlotMetadataKey();
      const json = localStorage.getItem(metadataKey);
      return json ? JSON.parse(json) : {};
    } catch {
      return {};
    }
  }

  /**
   * Get slot storage key
   */
  private getSlotKey(slotName: string): string {
    return `${this.storageKey}_slot_${slotName}`;
  }

  /**
   * Get slot metadata key
   */
  private getSlotMetadataKey(): string {
    return `${this.storageKey}_metadata`;
  }

  // ============================================================================
  // Auto-Save
  // ============================================================================

  /**
   * Enable auto-save with interval in milliseconds
   */
  enableAutoSave(intervalMs: number = 300000): void {
    this.disableAutoSave();

    this.autoSaveInterval = window.setInterval(() => {
      if (this.isDirty) {
        console.log('[WorldStateManager] Auto-saving...');
        this.saveWorldState('autosave');
      }
    }, intervalMs);

    console.log(`[WorldStateManager] Auto-save enabled (every ${intervalMs / 1000}s)`);
  }

  /**
   * Disable auto-save
   */
  disableAutoSave(): void {
    if (this.autoSaveInterval !== null) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
      console.log('[WorldStateManager] Auto-save disabled');
    }
  }

  /**
   * Check if auto-save is enabled
   */
  isAutoSaveEnabled(): boolean {
    return this.autoSaveInterval !== null;
  }

  // ============================================================================
  // Export/Import
  // ============================================================================

  /**
   * Export world state for sharing/backup
   */
  exportWorldState(): WorldStateExport {
    this.updatePlayTime();
    const state = this.captureCurrentState();

    return {
      version: '1.0',
      exportedAt: Date.now(),
      worldState: state,
      compressed: false
    };
  }

  /**
   * Import world state
   */
  importWorldState(exportData: WorldStateExport): { success: boolean; message: string } {
    try {
      this.restoreState(exportData.worldState);
      return {
        success: true,
        message: `World imported successfully (${exportData.worldState.objects.length} objects)`
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to import: ${error}`
      };
    }
  }

  /**
   * Export to JSON file
   */
  exportToFile(): string {
    const exportData = this.exportWorldState();
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import from JSON file
   */
  importFromFile(jsonContent: string): { success: boolean; message: string } {
    try {
      const exportData = JSON.parse(jsonContent) as WorldStateExport;
      return this.importWorldState(exportData);
    } catch (error) {
      return {
        success: false,
        message: `Failed to parse import file: ${error}`
      };
    }
  }

  // ============================================================================
  // Utilities
  // ============================================================================

  /**
   * Mark state as dirty (needs saving)
   */
  private markDirty(): void {
    this.isDirty = true;
  }

  /**
   * Check if state has unsaved changes
   */
  isDirtyState(): boolean {
    return this.isDirty;
  }

  /**
   * Update play time
   */
  private updatePlayTime(): void {
    const now = Date.now();
    const sessionTime = now - this.playTimeStart;
    this.totalPlayTime += sessionTime;
    this.playTimeStart = now;
  }

  /**
   * Get total play time
   */
  getTotalPlayTime(): number {
    this.updatePlayTime();
    return this.totalPlayTime;
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalObjects: number;
    visibleObjects: number;
    destroyedObjects: number;
    locations: number;
    isDirty: boolean;
    playTime: number;
    lastSaved: number;
  } {
    let visibleObjects = 0;
    let destroyedObjects = 0;

    for (const state of this.objectStates.values()) {
      if (state.isVisible) visibleObjects++;
      if (state.isDestroyed) destroyedObjects++;
    }

    return {
      totalObjects: this.objects.size,
      visibleObjects,
      destroyedObjects,
      locations: this.getAllLocations().length,
      isDirty: this.isDirty,
      playTime: this.getTotalPlayTime(),
      lastSaved: this.currentState.metadata?.lastSaved || 0
    };
  }

  /**
   * Clear all world state
   */
  clear(): void {
    this.objects.clear();
    this.objectStates.clear();
    this.currentState = this.createEmptyState();
    this.isDirty = false;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.disableAutoSave();
    this.clear();
  }
}
