import { WorldStateManager } from '../WorldStateManager';
import { GameObject } from '../../community/ObjectSystem';

/**
 * WorldStateManagerExamples - Demonstrates world state persistence
 *
 * This file shows examples of:
 * 1. Registering objects in the world
 * 2. Saving and loading world state
 * 3. Object state management (visibility, destruction, movement)
 * 4. Multiple save slots
 * 5. Auto-save functionality
 * 6. Export/import for sharing
 * 7. Location-based object management
 * 8. Object property modifications
 * 9. Play time tracking
 * 10. State statistics
 */

console.log('=== WORLD STATE MANAGER EXAMPLES ===\n');

// ============================================================================
// Setup: Create manager and some test objects
// ============================================================================

const manager = new WorldStateManager('player1');

// Create test objects
const createTestObject = (id: string, name: string, location: string): GameObject => ({
  id,
  name,
  description: `A ${name}`,
  properties: {
    weight: 5,
    is_movable: true,
    is_takeable: true
  },
  allowedActions: ['take', 'examine', 'drop']
});

console.log('');

// ============================================================================
// Example 1: Registering Objects
// ============================================================================
console.log('--- Example 1: Registering Objects ---');

manager.setCurrentLocation('plaza');

const sword = createTestObject('sword_001', 'Iron Sword', 'plaza');
const shield = createTestObject('shield_001', 'Wooden Shield', 'plaza');
const potion = createTestObject('potion_001', 'Health Potion', 'plaza');

manager.registerObject(sword, 'plaza');
manager.registerObject(shield, 'plaza');
manager.registerObject(potion, 'plaza');

console.log('Registered 3 objects in plaza');
console.log('Total objects:', manager.getAllObjects().length);
console.log('Objects in plaza:', manager.getObjectsInLocation('plaza').length);
console.log('');

// ============================================================================
// Example 2: Basic Save and Load
// ============================================================================
console.log('--- Example 2: Basic Save and Load ---');

// Save current state
const saveResult = manager.saveWorldState('savegame1');
console.log('Save result:', saveResult.message);

// Modify state
manager.destroyObject('sword_001');
console.log('Destroyed sword');
console.log('Visible objects after destruction:', manager.getVisibleObjectsInCurrentLocation().length);

// Load saved state
const loadResult = manager.loadWorldState('savegame1');
console.log('\nLoad result:', loadResult.message);
console.log('Objects after load:', loadResult.objectsLoaded);
console.log('Visible objects after load:', manager.getVisibleObjectsInCurrentLocation().length);
console.log('Sword state:', manager.getObjectState('sword_001')?.isDestroyed ? 'destroyed' : 'intact');
console.log('');

// ============================================================================
// Example 3: Object State Management
// ============================================================================
console.log('--- Example 3: Object State Management ---');

// Hide an object
manager.setObjectVisibility('shield_001', false);
console.log('Shield visibility:', manager.getObjectState('shield_001')?.isVisible);

// Destroy an object
manager.destroyObject('potion_001');
console.log('Potion destroyed:', manager.getObjectState('potion_001')?.isDestroyed);

// Show visible objects
const visibleObjects = manager.getVisibleObjectsInCurrentLocation();
console.log('Visible objects in current location:', visibleObjects.map(o => o.name).join(', '));

// Restore destroyed object
manager.restoreObject('potion_001');
console.log('\nPotion restored:', !manager.getObjectState('potion_001')?.isDestroyed);
console.log('');

// ============================================================================
// Example 4: Location-Based Management
// ============================================================================
console.log('--- Example 4: Location-Based Management ---');

// Add objects to different locations
const door = createTestObject('door_001', 'Oak Door', 'tavern');
const table = createTestObject('table_001', 'Wooden Table', 'tavern');

manager.registerObject(door, 'tavern');
manager.registerObject(table, 'tavern');

console.log('All locations:', manager.getAllLocations().join(', '));
console.log('Objects in plaza:', manager.getObjectsInLocation('plaza').length);
console.log('Objects in tavern:', manager.getObjectsInLocation('tavern').length);

// Move object between locations
manager.moveObjectToLocation('sword_001', 'tavern');
console.log('\nMoved sword to tavern');
console.log('Objects in plaza:', manager.getObjectsInLocation('plaza').length);
console.log('Objects in tavern:', manager.getObjectsInLocation('tavern').length);

// Change current location
manager.setCurrentLocation('tavern');
console.log('Current location:', manager.getCurrentLocation());
console.log('Visible objects here:', manager.getVisibleObjectsInCurrentLocation().map(o => o.name).join(', '));
console.log('');

// ============================================================================
// Example 5: Multiple Save Slots
// ============================================================================
console.log('--- Example 5: Multiple Save Slots ---');

// Save to different slots
manager.saveWorldState('slot1');
console.log('Saved to slot1');

// Modify state
manager.destroyObject('door_001');
console.log('Destroyed door');

manager.saveWorldState('slot2');
console.log('Saved to slot2 (with door destroyed)');

// Load slot1 (door should be intact)
manager.loadWorldState('slot1');
console.log('\nLoaded slot1');
console.log('Door state:', manager.getObjectState('door_001')?.isDestroyed ? 'destroyed' : 'intact');

// Load slot2 (door should be destroyed)
manager.loadWorldState('slot2');
console.log('\nLoaded slot2');
console.log('Door state:', manager.getObjectState('door_001')?.isDestroyed ? 'destroyed' : 'intact');

// Get all save slots
const slots = manager.getAllSaveSlots();
console.log('\nAll save slots:');
slots.forEach(slot => {
  console.log(`  ${slot.name}: ${slot.objectCount} objects, saved ${new Date(slot.savedAt).toLocaleTimeString()}`);
});
console.log('');

// ============================================================================
// Example 6: Save Slot Information
// ============================================================================
console.log('--- Example 6: Save Slot Information ---');

const slotInfo = manager.getSaveSlotInfo('slot1');
if (slotInfo) {
  console.log('Slot1 info:');
  console.log('  Player:', slotInfo.playerId);
  console.log('  Location:', slotInfo.location);
  console.log('  Objects:', slotInfo.objectCount);
  console.log('  Play time:', (slotInfo.playTime / 1000).toFixed(1), 'seconds');
  console.log('  Saved at:', new Date(slotInfo.savedAt).toLocaleString());
}

// Check if slot exists
console.log('\nSlot1 exists:', manager.hasSavedState('slot1'));
console.log('Slot99 exists:', manager.hasSavedState('slot99'));
console.log('');

// ============================================================================
// Example 7: Object Property Modifications
// ============================================================================
console.log('--- Example 7: Object Property Modifications ---');

// Get original properties
const swordObj = manager.getObject('sword_001');
console.log('Sword original weight:', swordObj?.properties.weight);

// Modify properties at runtime
manager.updateObjectProperties('sword_001', {
  weight: 10,
  damage: 25,
  is_enchanted: true
});

const modifiedSword = manager.getObject('sword_001');
console.log('Sword modified weight:', modifiedSword?.properties.weight);
console.log('Sword damage:', modifiedSword?.properties.damage);
console.log('Sword enchanted:', modifiedSword?.properties.is_enchanted);

// Check custom properties in state
const swordState = manager.getObjectState('sword_001');
console.log('Custom properties tracked:', Object.keys(swordState?.customProperties || {}).join(', '));
console.log('');

// ============================================================================
// Example 8: Position, Rotation, Scale (for future 3D support)
// ============================================================================
console.log('--- Example 8: Position, Rotation, Scale ---');

// Set object position
manager.updateObjectPosition('table_001', { x: 10, y: 0, z: 5 });

// Set object rotation
manager.updateObjectRotation('table_001', { x: 0, y: 90, z: 0 });

// Set object scale
manager.updateObjectScale('table_001', { x: 2, y: 1, z: 2 });

const tableState = manager.getObjectState('table_001');
console.log('Table position:', tableState?.position);
console.log('Table rotation:', tableState?.rotation);
console.log('Table scale:', tableState?.scale);
console.log('');

// ============================================================================
// Example 9: Auto-Save
// ============================================================================
console.log('--- Example 9: Auto-Save ---');

console.log('Auto-save enabled:', manager.isAutoSaveEnabled());

// Enable auto-save every 30 seconds
manager.enableAutoSave(30000);
console.log('Auto-save enabled:', manager.isAutoSaveEnabled());

// Make changes (would trigger auto-save after 30s)
manager.registerObject(createTestObject('book_001', 'Spell Book', 'tavern'), 'tavern');
console.log('Made changes, dirty state:', manager.isDirtyState());

// Manual save resets dirty flag
manager.saveWorldState();
console.log('After manual save, dirty state:', manager.isDirtyState());

// Disable auto-save
manager.disableAutoSave();
console.log('Auto-save enabled:', manager.isAutoSaveEnabled());
console.log('');

// ============================================================================
// Example 10: Export and Import
// ============================================================================
console.log('--- Example 10: Export and Import ---');

// Export world state
const exported = manager.exportWorldState();
console.log('Exported world state:');
console.log('  Version:', exported.version);
console.log('  Objects:', exported.worldState.objects.length);
console.log('  Locations:', exported.worldState.metadata.totalLocations);
console.log('  Exported at:', new Date(exported.exportedAt).toLocaleString());

// Create new manager and import
const manager2 = new WorldStateManager('player2');
const importResult = manager2.importWorldState(exported);
console.log('\nImport result:', importResult.message);
console.log('Manager2 objects:', manager2.getAllObjects().length);
console.log('Manager2 locations:', manager2.getAllLocations().join(', '));
console.log('');

// ============================================================================
// Example 11: File Export/Import
// ============================================================================
console.log('--- Example 11: File Export/Import ---');

// Export to JSON file format
const jsonContent = manager.exportToFile();
console.log('JSON export (first 150 chars):');
console.log(jsonContent.substring(0, 150) + '...');

// Simulate file download/upload
const fileImportResult = manager2.importFromFile(jsonContent);
console.log('\nFile import result:', fileImportResult.message);
console.log('');

// ============================================================================
// Example 12: Statistics
// ============================================================================
console.log('--- Example 12: Statistics ---');

const stats = manager.getStats();
console.log('World statistics:');
console.log('  Total objects:', stats.totalObjects);
console.log('  Visible objects:', stats.visibleObjects);
console.log('  Destroyed objects:', stats.destroyedObjects);
console.log('  Locations:', stats.locations);
console.log('  Has unsaved changes:', stats.isDirty);
console.log('  Play time:', (stats.playTime / 1000).toFixed(1), 'seconds');
console.log('  Last saved:', new Date(stats.lastSaved).toLocaleTimeString());
console.log('');

// ============================================================================
// Example 13: Deleting Save Slots
// ============================================================================
console.log('--- Example 13: Deleting Save Slots ---');

console.log('Slots before deletion:', manager.getAllSaveSlots().length);

const deleted = manager.deleteSaveSlot('slot2');
console.log('Deleted slot2:', deleted);

console.log('Slots after deletion:', manager.getAllSaveSlots().length);
console.log('Remaining slots:', manager.getAllSaveSlots().map(s => s.name).join(', '));
console.log('');

// ============================================================================
// Example 14: Real Game Scenario - Session Persistence
// ============================================================================
console.log('--- Example 14: Real Game Scenario - Session Persistence ---');

console.log('=== GAME SESSION START ===');

// Player creates objects
const lightsaber = createTestObject('lightsaber_001', 'Blue Lightsaber', 'cantina');
const blaster = createTestObject('blaster_001', 'DL-44 Blaster', 'cantina');

manager.setCurrentLocation('cantina');
manager.registerObject(lightsaber, 'cantina');
manager.registerObject(blaster, 'cantina');

console.log('Player created 2 objects in cantina');

// Player picks up lightsaber (modify properties)
manager.updateObjectProperties('lightsaber_001', {
  is_equipped: true,
  owner: 'player1'
});

console.log('Player equipped lightsaber');

// Player moves to different location
manager.moveObjectToLocation('lightsaber_001', 'player_inventory');
console.log('Lightsaber moved to inventory');

// Auto-save triggered
manager.saveWorldState('session_autosave');
console.log('\n[AUTO-SAVE] Game state saved');

console.log('\n=== GAME SESSION END (Player closes browser) ===\n');

// Simulate page reload - create new manager
console.log('=== PAGE RELOAD - GAME SESSION RESUME ===');

const resumedManager = new WorldStateManager('player1');
const resumeResult = resumedManager.loadWorldState('session_autosave');

console.log('Load result:', resumeResult.message);
console.log('Objects restored:', resumeResult.objectsLoaded);

// Check if player's progress is preserved
const restoredLightsaber = resumedManager.getObject('lightsaber_001');
console.log('\nPlayer progress preserved:');
console.log('  Lightsaber exists:', restoredLightsaber !== undefined);
console.log('  Lightsaber equipped:', restoredLightsaber?.properties.is_equipped);
console.log('  Lightsaber owner:', restoredLightsaber?.properties.owner);
console.log('  Lightsaber location:', resumedManager.getObjectState('lightsaber_001')?.location);

console.log('\n=== GAME SESSION RESUMED SUCCESSFULLY ===');
console.log('');

// ============================================================================
// Example 15: Clear and Reset
// ============================================================================
console.log('--- Example 15: Clear and Reset ---');

console.log('Objects before clear:', manager.getAllObjects().length);

manager.clear();

console.log('Objects after clear:', manager.getAllObjects().length);
console.log('Locations after clear:', manager.getAllLocations().length);
console.log('');

console.log('=== END OF EXAMPLES ===');
