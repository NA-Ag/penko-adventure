# Event System Guide for Content Creators

**Version:** 2.0.0
**Date:** 2025-12-09
**For:** Community Mode Content Pack Creators

---

## 📖 Table of Contents

1. [Introduction](#introduction)
2. [Event Structure](#event-structure)
3. [Trigger Types](#trigger-types)
4. [Action Types](#action-types)
5. [Conditions](#conditions)
6. [Event Chains](#event-chains)
7. [Complete Examples](#complete-examples)
8. [Best Practices](#best-practices)

---

## 🎯 Introduction

Events are the heart of dynamic gameplay in Community Mode. They allow you to:
- React to player actions
- Create story progression
- Trigger world changes
- Manage quests and statistics
- Build immersive narratives

### What Can Events Do?

✅ Spawn enemies when entering dangerous areas
✅ Change time of day based on player progress
✅ Unlock new locations after completing quests
✅ Trigger dialogue after certain conditions
✅ Create branching storylines
✅ Reward exploration with hidden items
✅ Punish or reward player choices

---

## 🏗️ Event Structure

Every event has this basic structure:

```json
{
  "id": "unique_event_id",
  "name": "Human-Readable Name",
  "description": "What this event does",
  "trigger": { /* When event fires */ },
  "actions": [ /* What happens */ ],
  "priority": 10,
  "repeatable": false,
  "cooldown": 0
}
```

### Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier |
| `name` | string | ✅ | Display name |
| `description` | string | ✅ | What the event does |
| `trigger` | EventTrigger | ✅ | When to fire event |
| `actions` | EventAction[] | ✅ | What to do when fired |
| `priority` | number | ❌ | Higher = earlier (default: 5) |
| `repeatable` | boolean | ❌ | Can fire multiple times (default: false) |
| `cooldown` | number | ❌ | Seconds between triggers (default: 0) |

---

## 🔔 Trigger Types (10 Total)

### 1. LOCATION - Player enters/is in location
### 2. COMBAT - Combat starts/ends
### 3. ITEM - Item picked up/used
### 4. DIALOGUE - Dialogue completed
### 5. QUEST - Quest state changes
### 6. STATISTIC - Statistic reaches threshold
### 7. TIME - Time of day or days passed
### 8. TURN_COUNT - Turn number reached
### 9. HEALTH - Health above/below threshold
### 10. INVENTORY - Inventory conditions met

See [CONTENT_PACK_SCHEMA.md](./CONTENT_PACK_SCHEMA.md) for complete details.

---

## ⚡ Action Types (20 Total)

### Entity Actions
- SPAWN_ENTITY - Spawn entity at location
- REMOVE_ENTITY - Remove entity from location

### Message Actions
- SHOW_MESSAGE - Display message to player

### Statistic Actions
- MODIFY_STAT - Add/subtract from statistic
- SET_STAT - Set statistic to exact value

### Item Actions
- ADD_ITEM - Add item to inventory
- REMOVE_ITEM - Remove item from inventory

### Location Actions
- UNLOCK_LOCATION - Make location accessible
- TELEPORT_PLAYER - Move player instantly

### Quest Actions
- START_QUEST - Activate quest
- COMPLETE_QUEST - Mark quest complete
- FAIL_QUEST - Mark quest failed

### Visual Actions
- PLAY_ANIMATION - Trigger animation
- CHANGE_BIOME - Change location appearance
- CHANGE_TIME - Set time of day

### Player Actions
- HEAL_PLAYER - Restore health
- DAMAGE_PLAYER - Deal damage

### Event Control
- CHAIN_EVENT - Trigger another event
- WAIT - Advance time/turns

---

## 💡 Complete Examples

[See full guide at docs/EVENT_SYSTEM_GUIDE.md for 5+ complete examples]

---

*"Events bring your world to life. Use them wisely!"*
