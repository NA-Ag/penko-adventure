# How to Load Community Packs

Welcome to the Penko community! This guide will show you how to load and play content packs created by other language learners around the world.

## Table of Contents
1. [What are Community Packs?](#what-are-community-packs)
2. [Finding Content Packs](#finding-content-packs)
3. [Loading a Pack](#loading-a-pack)
4. [Playing Your First Pack](#playing-your-first-pack)
5. [Managing Your Collection](#managing-your-collection)
6. [Troubleshooting](#troubleshooting)

---

## What are Community Packs?

Community packs are language learning adventures created by other Penko users. They're:

- **Free**: Created and shared by the community
- **Diverse**: Available in 12+ languages
- **Interactive**: Object-based gameplay (not just multiple choice)
- **Educational**: Designed to teach vocabulary and grammar
- **Safe**: You choose what to load - no automatic downloads

Think of them like **"Memory Cards"** for old game consoles - you download the file, load it into Penko, and start playing!

---

## Finding Content Packs

### Official Sources

#### 1. **Reddit** (r/PenkoLanguageLearning)
- Browse posts tagged with your target language
- Filter by genre (Fantasy, SciFi, Mystery, etc.)
- Read reviews and comments
- Download `.json` files attached to posts

#### 2. **Discord** (Penko Community Server)
- Join channels for specific languages
- Check `#community-packs` channel
- Download files shared by creators
- Ask for recommendations

#### 3. **GitHub** (Community Repositories)
- Search for "penko content packs"
- Browse organized collections
- Download individual packs or entire repositories
- Check star ratings and forks

### Searching Tips

Use these search terms:
- `Penko [Language] pack` (e.g., "Penko Spanish pack")
- `Penko content pack [Genre]` (e.g., "Penko content pack fantasy")
- `#PenkoLanguage on Twitter/X`

---

## Loading a Pack

### Method 1: Load from Content Pack Browser (Recommended)

This is the easiest method!

**Steps:**

1. **Launch Penko**
   - Open the Penko application

2. **Go to Standard/Community Mode**
   - Select "Standard Mode" from the main menu

3. **Open Pack Browser**
   - You'll see the "Choose Your Adventure" screen

4. **Click "Load Pack from File"**
   - Look for the purple button in the top-right: **📁 Load Pack from File**

5. **Select Your .json File**
   - A file browser will open
   - Navigate to where you downloaded the pack
   - Select the `.json` file
   - Click "Open"

6. **Wait for Validation**
   - Penko will check if the pack is valid
   - You'll see a loading message
   - If successful: ✅ "Pack loaded: [Pack Name]"
   - If failed: ❌ Error message explaining what's wrong

7. **Find Your Pack**
   - Switch to the **📁 Local Files** tab
   - Your loaded pack will appear in the grid
   - It will have a purple "Local" badge

8. **Play!**
   - Click the **▶ Play Now** button
   - Start your adventure!

### Method 2: Drag and Drop (Future Feature)

Coming soon! You'll be able to drag `.json` files directly onto the Penko window.

---

## Playing Your First Pack

### Starting the Adventure

1. **Select a pack** from the Local Files tab
2. **Click "Play Now"**
3. **Read the opening scene** - it sets up the story
4. **Look at available objects** - these are things you can interact with

### How to Play

Penko packs are **object-based adventures**. Instead of clicking buttons, you **type what you want to do**.

#### Example Commands:

**Looking Around:**
```
examine door
look at table
inspect key
```

**Taking Items:**
```
take key
get rope
pick up sword
```

**Using Items:**
```
use key on door
open door
unlock chest
```

**Inventory:**
```
inventory
check items
look in bag
```

**Movement:**
```
go north
enter building
walk to castle
```

### Parser Tips

The Penko parser is smart and understands variations:

| You Type | Parser Understands |
|----------|-------------------|
| "take key" | TAKE action on key object |
| "get key" | Same as "take key" |
| "pick up key" | Same as "take key" |
| "examine door" | EXAMINE action on door |
| "look at door" | Same as "examine door" |

**Pro Tip**: If you're unsure, try `examine [object]` first - it's always safe and gives you information!

### Learning While Playing

As you play, Penko will:
- **Show vocabulary** in the target language
- **Provide translations** when needed
- **Correct grammar mistakes** (if using InputChecker)
- **Track your progress** automatically

The goal isn't to "beat" the pack - it's to **learn while having fun**!

---

## Managing Your Collection

### Viewing All Local Packs

1. Go to Standard Mode
2. Click the **📁 Local Files** tab
3. See all packs you've loaded

Each pack shows:
- **Title**: Pack name
- **Author**: Who created it
- **Language**: What you'll be learning
- **Genre**: Theme (Fantasy, SciFi, etc.)
- **Purple "Local" badge**: Indicates it's from a file

### Playing a Pack Again

Simply click **▶ Play Now** on any pack in your collection.

Your progress is saved automatically!

### Deleting a Pack

If you no longer want a pack:

1. Go to **📁 Local Files** tab
2. Find the pack you want to remove
3. Click the **🗑️** (trash) button
4. Confirm deletion

**Note**: This only removes it from your local collection. The original `.json` file you downloaded is still on your computer if you want to reload it later.

### Organizing Your Files

I recommend creating a folder structure on your computer:

```
My Documents/
└── Penko Content Packs/
    ├── Spanish/
    │   ├── museum-mystery.json
    │   └── market-adventure.json
    ├── French/
    │   └── paris-tour.json
    └── Japanese/
        └── tokyo-streets.json
```

This makes it easy to:
- Find packs later
- Reload if you delete them
- Share with friends
- Back up your collection

---

## Troubleshooting

### "Invalid pack: Missing metadata"

**Problem**: The `.json` file is corrupted or incomplete.

**Solutions**:
1. Re-download the file from the source
2. Make sure you downloaded the `.json` file, not an HTML page
3. Try opening the file in a text editor - it should be valid JSON
4. Contact the pack creator and report the issue

### "Invalid pack: Missing world.locations"

**Problem**: The pack doesn't have any locations defined.

**Solutions**:
1. This pack may be incomplete or very old
2. Contact the creator for an updated version
3. Try a different pack

### "Pack not found" after loading

**Problem**: The pack loaded but doesn't appear in Local Files.

**Solutions**:
1. Make sure you're on the **📁 Local Files** tab, not "All Packs" or "Official"
2. Reload the page/restart Penko
3. Try loading the pack again

### File won't open in file browser

**Problem**: The file browser doesn't show your `.json` file.

**Solutions**:
1. Make sure file extensions are visible in your OS
2. Verify the file extension is `.json` not `.json.txt`
3. Check the file didn't download as `.zip` - if so, unzip it first
4. Make sure you're looking in the right folder (check Downloads)

### "Failed to read file"

**Problem**: Browser can't access the file.

**Solutions**:
1. Move the file to a different folder (not system directories)
2. Check file permissions
3. Try re-downloading the file
4. Make sure the file isn't open in another program

### Pack loads but won't start

**Problem**: After clicking "Play Now", nothing happens.

**Solutions**:
1. Check browser console for errors (F12 → Console tab)
2. Try refreshing the page
3. Clear browser cache
4. Report the bug with the pack name and error message

---

## Safety and Privacy

### Is It Safe to Load Random Packs?

**Yes!** Content packs are just JSON data files. They cannot:
- ❌ Run executable code
- ❌ Access your files
- ❌ Install malware
- ❌ Track you
- ❌ Steal data

They CAN only:
- ✅ Provide text and vocabulary
- ✅ Define objects and interactions
- ✅ Create learning adventures

### Where Is Data Stored?

- **Loaded packs**: Stored in your browser's localStorage
- **Progress**: Saved locally in your browser
- **No server uploads**: Everything stays on your device

### Uninstalling

To completely remove all local packs:

**Option 1: Delete Individually**
- Use the 🗑️ button on each pack

**Option 2: Clear Browser Data**
- Chrome/Edge: Settings → Privacy → Clear browsing data
- Firefox: Settings → Privacy → Clear Data
- Safari: Preferences → Privacy → Manage Website Data
- Select "Penko" or "localhost" and delete

---

## Best Practices

### Before Loading a Pack

1. **Check the source**: Official sources (Reddit, Discord, GitHub) are safer
2. **Read reviews**: See what others say about the pack
3. **Check the author**: Known creators = more reliable
4. **Read the description**: Make sure it's the right difficulty/topic

### After Loading a Pack

1. **Try the first few commands**: Make sure it works
2. **Check vocabulary**: Is it the right level for you?
3. **Leave feedback**: Help the creator improve!
4. **Rate/Like**: Show appreciation for free content

### Building Your Collection

1. **Start with official packs**: Get familiar with the system
2. **Try different genres**: Fantasy, SciFi, Modern, Mystery
3. **Mix difficulties**: Challenge yourself but don't burn out
4. **Support creators**: Thank them, share their work, give feedback

---

## Getting Help

### If a Pack Doesn't Work

1. **Check this troubleshooting guide** first
2. **Contact the pack creator**: Leave a comment on their post
3. **Ask the community**:
   - Discord `#help` channel
   - Reddit with `[Help]` tag
4. **Report a bug**: If it's a Penko issue, not the pack

### If You Need Pack Recommendations

Ask the community!

**Reddit post template:**
```
[Help] Looking for [Language] packs

Difficulty: Beginner / Intermediate / Advanced
Interests: Fantasy, Travel, Food, etc.
Goal: Learn vocabulary for [topic]

What packs do you recommend?
```

**Discord:**
Just ask in your language channel!

---

## Frequently Asked Questions

**Q: How many packs can I load?**
A: As many as your browser storage allows (usually hundreds).

**Q: Do loaded packs work offline?**
A: Yes! Once loaded, they're stored locally and work without internet.

**Q: Can I share a pack I loaded?**
A: Yes! The `.json` file you downloaded can be shared with others.

**Q: Can I edit a loaded pack?**
A: Not directly in Penko, but you can:
1. Open the `.json` in a text editor
2. Make changes (if you know JSON)
3. Re-load the modified file

Or use World Forge to create your own version!

**Q: What happens if I load the same pack twice?**
A: Penko will replace the old version with the new one (useful for updates!).

**Q: Can I transfer packs to another computer?**
A: Yes! The `.json` files are portable. Just download them, copy to a USB drive, and load on another device.

**Q: Are packs synced across devices?**
A: No. Each device has its own local collection. You'll need to load packs on each device separately.

---

## Next Steps

Now that you know how to load packs:

1. **Browse** the community sources
2. **Download** 2-3 packs that interest you
3. **Load** them using this guide
4. **Play** and start learning!
5. **Share feedback** with creators
6. **Consider creating** your own pack someday!

---

## Community Etiquette

Remember:
- 📝 **Leave constructive feedback** for creators
- ⭐ **Rate/like packs** you enjoy
- 🐛 **Report bugs** politely
- 🙏 **Thank creators** - they make these for free!
- 🤝 **Help others** who are new to loading packs
- 🎨 **Support diversity** - every pack is someone's hard work

---

Happy learning! 🌍✨

*The Penko Community Team*
