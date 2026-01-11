# Content Creator's Guide

Welcome to the Penko Community! This guide will help you create amazing language learning content packs that you can share with learners around the world.

## Table of Contents
1. [What are Content Packs?](#what-are-content-packs)
2. [Getting Started with World Forge](#getting-started-with-world-forge)
3. [Creating Objects](#creating-objects)
4. [Building Locations](#building-locations)
5. [Exporting Your Pack](#exporting-your-pack)
6. [Best Practices](#best-practices)
7. [Examples](#examples)

---

## What are Content Packs?

Content packs are self-contained language learning adventures. Each pack includes:
- **Interactive Objects**: Items players can examine, take, use, and interact with
- **Locations**: Scenes and places that form your story world
- **Vocabulary**: Words and phrases players will learn
- **NPCs** (optional): Characters players can talk to
- **Learning Events** (optional): Structured learning challenges

Unlike traditional choose-your-own-adventure stories, Penko content packs use an **object-based system** where players can type natural language commands like "examine door" or "take key" - making the experience feel like a real adventure game!

---

## Getting Started with World Forge

### Accessing World Forge

1. Launch Penko and select **Workshop** from the main menu
2. Click on **"🌍 World Forge (NEW!)"**
3. Select your target language (the language you're teaching)

You'll see three tabs:
- **📦 Objects**: Define interactive items
- **🗺️ Scenarios**: Create locations and scenes
- **📤 Export & Share**: Package and download your pack

---

## Creating Objects

Objects are the heart of the interactive gameplay. They're things players can interact with in your world.

### Step 1: Create a New Object

1. Go to the **📦 Objects** tab
2. Fill in the form:
   - **Object ID**: A unique identifier (e.g., `wooden_door`, `iron_key`)
     - Use lowercase letters, numbers, and underscores only
     - No spaces!
   - **Object Name**: The display name in your target language (e.g., "Puerta de madera" for Spanish)
   - **Description**: What the object looks like

3. Click **"➕ Create Object"**

### Step 2: Define Object Properties

Once created, click on your object in the list to edit its properties.

#### Physical Properties
- **Is Solid**: Can't walk through it (doors, walls)
- **Is Liquid**: Behaves like water, oil, etc.
- **Is Heavy**: Hard to carry
- **Is Fragile**: Can break easily
- **Is Sharp**: Can cut things
- **Is Flammable**: Can catch fire
- **Is Edible**: Can be eaten
- **Is Drinkable**: Can be drunk

#### Interactive Properties
- **Can Be Held**: Can go in inventory (keys, tools)
- **Can Be Opened**: Has open/close states (doors, boxes)
- **Is Locked**: Requires a key to open
- **Can Be Worn**: Clothing, armor, jewelry
- **Can Be Read**: Books, signs, notes
- **Can Be Climbed**: Ladders, ropes, trees

#### State Properties
- **Is Locked**: Current locked state
- **Is Open**: Current open state
- **Is Broken**: Current broken state

#### Advanced Properties
- **Can Be Tied To**: List objects this can attach to (e.g., rope → tree, post)
- **Required Item**: Item needed to interact (e.g., door needs key)
- **Damage**: How much damage it does (weapons)
- **Health Restore**: How much health it restores (food, potions)
- **Weight**: How heavy it is (affects inventory)

### Step 3: Set Allowed Actions

Choose which actions players can perform on this object:

- **EXAMINE**: Look at the object
- **TAKE**: Pick up the object
- **DROP**: Put down the object
- **OPEN**: Open the object
- **CLOSE**: Close the object
- **UNLOCK**: Unlock with a key
- **USE**: Use the object
- **WEAR**: Put on clothing/armor
- **READ**: Read text
- **DRINK**: Consume liquid
- **EAT**: Consume food
- **BREAK**: Destroy or break
- **CLIMB**: Climb up/on
- **TIE**: Attach to something
- **ATTACK**: Use as weapon
- **TALK**: Talk to (for NPCs)

**Important**: Only enable actions that make sense for your object. A door shouldn't be edible, and a key shouldn't be climbable!

---

## Building Locations

Locations are the scenes that make up your adventure.

### Creating a Location

1. Go to the **🗺️ Scenarios** tab
2. Click **"➕ Create Node"**
3. A new location node will appear

### Location Properties (Coming Soon)

In future updates, you'll be able to:
- Write scene descriptions in the target language
- Add translations
- Place objects in specific locations
- Add NPCs
- Define exits to other locations
- Set requirements (e.g., need key to enter)

For now, the World Forge focuses on creating objects. When you export, a default starting location will be created with all your objects available.

---

## Exporting Your Pack

When you're happy with your content, it's time to share it!

### Step 1: Fill in Pack Metadata

1. Go to the **📤 Export & Share** tab
2. Enter your pack information:
   - **Content Pack Title**: A catchy name (e.g., "Mystery at the Museum")
   - **Your Name (Author)**: Your username or real name

### Step 2: Review Your Pack

Check the **📦 Pack Contents** section to verify:
- Number of interactive objects
- Number of locations
- Target language
- Genre (currently "Custom" for all World Forge packs)

### Step 3: Export to File

1. Click **"💾 Export to File"**
2. The pack will download as a `.json` file
3. Filename format: `penko-pack_title_YYYY-MM-DD_timestamp.json`

**Example**: `penko-pack_mystery-at-the-museum_2025-12-11_1733951234567.json`

The file is saved to your Downloads folder and is ready to share!

---

## Best Practices

### Object Design

1. **Use Clear Names**: Make object IDs descriptive
   - ✅ Good: `rusty_key`, `ancient_door`, `healing_potion`
   - ❌ Bad: `obj1`, `thing`, `item`

2. **Be Consistent**: Use the same naming pattern throughout
   - All lowercase
   - Underscores for spaces
   - Descriptive adjectives

3. **Set Logical Properties**: Think about what makes sense
   - A wooden door should be solid, can be opened, might be locked
   - A key should be able to be held, weighs very little
   - A rope can be tied to things, can be climbed

4. **Limit Actions**: Only enable actions that make sense
   - Don't make everything edible or drinkable
   - Consider the real-world physics of objects

### Vocabulary Selection

1. **Start Simple**: Begin with common, everyday objects
2. **Theme Your Pack**: Pick a genre and stick with it
   - Medieval fantasy: swords, castles, magic
   - Modern city: cars, phones, buildings
   - Kitchen: utensils, food, appliances

3. **Progressive Difficulty**: Mix easy and challenging words
   - Easy: door, key, table, chair
   - Medium: cupboard, lantern, dagger
   - Advanced: chandelier, portcullis, scimitar

### Language Quality

1. **Use Native Speakers**: If possible, have a native speaker review your translations
2. **Include Context**: Descriptions should show how words are used
3. **Be Accurate**: Double-check spelling and grammar
4. **Add Variety**: Use synonyms and related words

### Testing Your Pack

Before sharing publicly:
1. **Load it yourself**: Use "Load Pack from File" to test
2. **Try all objects**: Make sure every object works as intended
3. **Check spelling**: Typos break immersion
4. **Get feedback**: Share with friends first

---

## Examples

### Example 1: Simple Escape Room

**Theme**: Locked Room Puzzle
**Language**: Spanish
**Objects**: 3-5 items

Objects:
- `wooden_door` (Puerta de madera)
  - Properties: is_solid, can_be_opened, is_locked
  - Actions: EXAMINE, OPEN, UNLOCK
  - Required item: iron_key

- `iron_key` (Llave de hierro)
  - Properties: can_be_held, weight: 1
  - Actions: EXAMINE, TAKE, DROP, USE

- `old_table` (Mesa vieja)
  - Properties: is_solid, is_heavy
  - Actions: EXAMINE

**Learning Goal**: Practice Spanish words for common household items

---

### Example 2: Market Adventure

**Theme**: Shopping in a foreign market
**Language**: French
**Objects**: 8-10 items

Objects:
- Various food items (bread, cheese, fruit)
- Money/currency
- Shopping bag
- Market stalls
- NPCs (vendors)

**Learning Goal**: Practice French numbers, shopping phrases, food vocabulary

---

### Example 3: Nature Exploration

**Theme**: Forest exploration
**Language**: German
**Objects**: 10-15 items

Objects:
- Natural elements (trees, rocks, river)
- Animals
- Tools (rope, knife, backpack)
- Plants (berries, flowers)

**Learning Goal**: Learn German nature vocabulary and survival phrases

---

## What's Next?

Once you've created your pack:

1. **Export it** using the World Forge
2. **Test it** by loading it locally
3. **Share it** with the community:
   - Post on Reddit (r/PenkoLanguageLearning)
   - Share on Discord
   - Tweet with #PenkoLanguage
   - Email to friends

4. **Get feedback** and iterate!

---

## Need Help?

- **Discord**: Join our community server for help
- **Reddit**: r/PenkoLanguageLearning
- **GitHub Issues**: Report bugs or request features
- **Email**: [Coming soon]

---

## Advanced Topics (Coming Soon)

Future guides will cover:
- Creating complex location networks
- Adding NPCs with dialogue trees
- Designing learning events
- Creating custom response templates
- Multi-language packs
- Collaborative content creation

---

Happy creating! 🌍✨

*The Penko Community Team*
