# Layered Animation System (Disney-Style)

## Vision
Make the visualizer completely independent of AI, using a layered composition system like classic Disney animation and tile-based games like Super Mario Bros.

## Architecture

### Layer Structure (Bottom to Top)
```
Layer 1: Background     (static sky/walls)
Layer 2: Biome          (environment decorations - trees, rocks, neon signs)
Layer 3: Room Features  (interactive objects - doors, chests, NPCs)
Layer 4: Penko          (character animations from penko_anim/)
Layer 5: Effects        (weather, time of day overlays)
```

### How It Works

#### 1. Text Parser (Zork-Style)
Parse narrative text for keywords to trigger layer changes:

**Example Input:**
```
"You enter a dark forest. A merchant sits by a campfire."
```

**Parser Output:**
```javascript
{
  biome: 'forest',
  timeOfDay: 'night',  // from "dark"
  features: ['tree', 'campfire'],
  entities: ['merchant']
}
```

#### 2. Layer Templates
Pre-made sprite sheets for each layer:

```
/world_templates/
  backgrounds/
    sky_day.ts         // Blue gradient
    sky_night.ts       // Dark with stars
    sky_sunset.ts      // Orange/purple
    interior_wall.ts   // Brown walls

  biomes/
    forest/
      tree_oak.ts
      tree_pine.ts
      grass_patch.ts
      rock.ts
    cyber_city/
      neon_sign.ts
      hologram.ts
      building.ts
    desert/
      cactus.ts
      sand_dune.ts

  rooms/
    shared/
      door.ts
      chest.ts
      table.ts
      fireplace.ts
    horror/
      grave.ts
      fog.ts
    scifi/
      terminal.ts
      pod.ts
```

#### 3. Keyword → Sprite Mapping
```typescript
const KEYWORD_MAP = {
  // Biomes
  'forest': { biome: 'forest', features: ['tree', 'grass'] },
  'desert': { biome: 'desert', features: ['cactus', 'sand'] },
  'city': { biome: 'cyber_city', features: ['building', 'neon_sign'] },

  // Features
  'tree': 'biomes/forest/tree_oak',
  'merchant': 'entities/merchant',
  'door': 'rooms/shared/door',
  'chest': 'rooms/shared/chest',

  // Time
  'dark': { timeOfDay: 'night' },
  'sunset': { timeOfDay: 'sunset' },

  // Weather
  'fog': { effect: 'fog' },
  'rain': { effect: 'rain' },
};
```

#### 4. Penko Actions
Parse player input to trigger Penko animations:

```typescript
const ACTION_MAP = {
  // Movement
  'walk': 'walk',
  'run': 'walk',  // Use walk animation
  'jump': 'jump',

  // Interaction
  'talk': 'talk',
  'speak': 'talk',

  // Combat
  'attack': 'hurt',
  'hit': 'hurt',
  'damage': 'hurt',

  // Default
  '*': 'idle'
};
```

## Implementation Plan

### Phase 1: Text Parser
- [ ] Create `services/SceneParser.ts`
- [ ] Keyword extraction from narrative
- [ ] Action detection from player input
- [ ] No AI dependency

### Phase 2: Layer System
- [ ] Create `components/LayeredRenderer.tsx`
- [ ] Separate render functions for each layer
- [ ] Compositing system
- [ ] Independent of sceneData

### Phase 3: Sprite Library
- [ ] Populate `/world_templates/` with sprite sheets
- [ ] Generic backgrounds
- [ ] Biome-specific decorations
- [ ] Shared room features
- [ ] Theme-specific elements

### Phase 4: Integration
- [ ] Replace current visualizer
- [ ] Hook up parser to renderer
- [ ] Test with narrative text
- [ ] Performance optimization

## Benefits

1. **No AI Dependency** - Works even if API fails
2. **Extremely Lightweight** - Just sprite swapping, no complex logic
3. **Predictable** - Same keywords always produce same visuals
4. **Expandable** - Easy to add new sprites/keywords
5. **Free** - No API costs for rendering
6. **Fast** - Simple keyword matching vs AI inference

## Example Flow

```
User Input: "I walk to the forest"
    ↓
Parser detects: action='walk', biome='forest'
    ↓
LayeredRenderer:
  - Layer 1: sky_day.ts
  - Layer 2: forest/tree_oak.ts + forest/grass_patch.ts
  - Layer 3: (empty)
  - Layer 4: Penko walk animation
  - Layer 5: (no effects)
    ↓
Render composite to canvas
```

## Memory Usage
- Each sprite: ~1-2 KB (16x16 pixel array)
- Total library: ~50-100 sprites = 50-200 KB
- Current frame buffer: 320x240 = ~75 KB
- **Total: < 300 KB** (vs AI model = 100+ MB)

This is exactly how Super Mario Bros worked - keyword/trigger based scene composition!
