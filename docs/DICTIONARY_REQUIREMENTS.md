# Dictionary Requirements for Standard Mode

**Created:** 2025-12-09
**Status:** Missing - Need to generate/convert

---

## 📊 Current Status

### What Exists
- ✅ **Directory structure:** `/public/dictionaries/organized/`
- ✅ **Organization:** Folders for romance, germanic, slavic, east-asian language families
- ✅ **DictionaryService:** `services/dictionaryService.ts` ready to load dictionaries
- ✅ **Parser integration:** SmartParser can use dictionaries for synonym matching and typo correction

### What's Missing
- ❌ **Actual dictionary JSON files** in format: `/public/dictionaries/{language_code}.json`
- ❌ **Required files:**
  - `/public/dictionaries/en.json` (English)
  - `/public/dictionaries/es.json` (Spanish)
  - `/public/dictionaries/fr.json` (French)
  - `/public/dictionaries/de.json` (German)
  - `/public/dictionaries/it.json` (Italian)
  - `/public/dictionaries/ja.json` (Japanese)
  - `/public/dictionaries/zh.json` (Mandarin)
  - `/public/dictionaries/ru.json` (Russian)
  - `/public/dictionaries/pt.json` (Portuguese)
  - `/public/dictionaries/uk.json` (Ukrainian)
  - `/public/dictionaries/pl.json` (Polish)
  - `/public/dictionaries/cs.json` (Czech)

---

## 📐 Required Dictionary Format

### File Structure

```json
{
  "word1": {
    "frequency": 5000,
    "rank": 150
  },
  "word2": {
    "frequency": 3200,
    "rank": 320
  },
  "word3": {
    "frequency": 1800,
    "rank": 890
  }
}
```

### Field Definitions

- **word** (key): Lowercase word in target language
- **frequency**: How often the word appears (higher = more common)
- **rank**: Rank by frequency (lower = more common, 1 = most common word)

### Example: Spanish Dictionary

```json
{
  "el": { "frequency": 50000, "rank": 1 },
  "de": { "frequency": 48000, "rank": 2 },
  "que": { "frequency": 45000, "rank": 3 },
  "caminar": { "frequency": 1500, "rank": 2340 },
  "andar": { "frequency": 1450, "rank": 2380 },
  "hablar": { "frequency": 2100, "rank": 1850 }
}
```

---

## 🎯 Purpose & Usage

### Why Dictionaries Are Needed

1. **Synonym Matching**
   - Parser finds words with similar frequency ranks
   - "caminar" → finds "andar", "pasear", "marchar"
   - Improves command understanding

2. **Typo Correction**
   - Levenshtein distance matching
   - "camnar" → "caminar"
   - "attck" → "attack"
   - Better user experience

3. **Contextual Suggestions**
   - When parser confidence is low
   - Suggest similar words from dictionary
   - Educational feedback

### How SmartParser Uses Them

```typescript
// Load dictionary
const dict = await loadDictionary(Language.SPANISH);

// Find synonyms
const synonyms = findSynonyms("caminar", dict);
// Returns: ["andar", "pasear", "marchar"]

// Correct typo
const corrected = findClosestWord("camnar", dict);
// Returns: "caminar"

// Check if verb matches intent
const intent = checkVerbs(synonyms, Language.SPANISH);
// Returns: "MOVE"
```

---

## ⚠️ Impact of Missing Dictionaries

### With Dictionaries (Ideal)
- ✅ Synonym matching works
- ✅ Typo correction available
- ✅ 90%+ parser accuracy
- ✅ Natural language flexibility
- ✅ Educational feedback

### Without Dictionaries (Current State)
- ⚠️ Only exact word matching from VERB_DB
- ⚠️ No typo correction
- ⚠️ ~70-80% parser accuracy
- ⚠️ Users must type exact keywords
- ⚠️ Limited educational value

**Note:** Standard Mode will still work without dictionaries, but parser quality is reduced.

---

## 🔧 Options to Obtain Dictionaries

### Option 1: Generate from Frequency Lists ⭐ RECOMMENDED

**Source:** Use open-source frequency lists (e.g., from Wiktionary, OpenSubtitles corpus)

**Process:**
1. Download frequency lists for each language
2. Convert to our JSON format
3. Limit to top 10,000-20,000 words (balance size vs coverage)
4. Save to `/public/dictionaries/{lang}.json`

**Pros:**
- Free and open-source
- Good quality
- Control over content

**Cons:**
- Requires conversion script
- Need to find reliable sources

**Estimated Size:**
- 10,000 words ≈ 200-300KB per language
- 12 languages ≈ 2.4-3.6MB total

### Option 2: Use Existing Penko Data

**Source:** Extract from GRAMMAR database in `services/parser/data/languageData.ts`

**Process:**
1. Extract all words from GRAMMAR categories
2. Assign approximate frequency/rank based on category
3. Generate dictionary JSON

**Pros:**
- Already have the data
- Guaranteed to match Penko vocabulary
- Quick implementation

**Cons:**
- Limited vocabulary (~2,000-3,000 words max)
- No real frequency data (would be estimated)
- May miss common words not in GRAMMAR

**Code to Generate:**
```typescript
import { GRAMMAR } from './services/parser/data/languageData';
import { Language } from './types';

function generateDictionary(lang: Language): Record<string, { frequency: number, rank: number }> {
  const words: Set<string> = new Set();

  // Extract all words from GRAMMAR
  Object.values(GRAMMAR).forEach(category => {
    const langWords = category[lang] || [];
    langWords.forEach(word => words.add(word.toLowerCase()));
  });

  // Assign frequency/rank (rough approximation)
  const dict: Record<string, { frequency: number, rank: number }> = {};
  Array.from(words).forEach((word, index) => {
    dict[word] = {
      frequency: 10000 - (index * 10), // Descending frequency
      rank: index + 1                   // Ascending rank
    };
  });

  return dict;
}
```

### Option 3: Hybrid Approach ⭐ BEST BALANCE

**Combine both:**
1. Use frequency lists for common words (top 5,000)
2. Add Penko GRAMMAR words with estimated ranks
3. Merge and deduplicate

**Pros:**
- Best coverage
- Real frequency data + Penko-specific vocabulary
- Comprehensive

---

## 📅 Implementation Plan

### Immediate (This Week)
1. **Option 2: Generate from GRAMMAR**
   - Quick win to get basic dictionary support
   - 10-20 minutes to implement
   - Test parser with generated dictionaries

### Short Term (Next 2 Weeks)
2. **Option 1: Add Frequency Lists**
   - Find open-source frequency lists
   - Convert to JSON format
   - Replace/merge with GRAMMAR dictionaries

### Long Term (Future Enhancement)
3. **Community Contributions**
   - Allow content pack creators to add vocabulary
   - Crowdsource frequency data
   - Improve dictionaries over time

---

## 📦 Dictionary Storage Strategy

### Loading Strategy
- **Lazy loading:** Only load when user selects Standard Mode
- **Cache in memory:** Store for session duration
- **IndexedDB fallback:** Cache for offline use

### Size Considerations
- **Target size:** 200-300KB per language
- **Compression:** Use gzip compression (50-60% reduction)
- **Total bandwidth:** ~3-4MB for all 12 languages (acceptable)

---

## ✅ Success Criteria

Standard Mode dictionaries will be considered successful when:

1. **Coverage:** Top 10,000 most common words per language
2. **Accuracy:** Frequency/rank data is reasonably accurate
3. **Performance:** Dictionaries load in <500ms
4. **Parser improvement:** Accuracy increases from 70-80% to 90%+
5. **User experience:** Typo correction and synonym matching work naturally

---

## 🔗 Resources

### Open Frequency Lists
- **Wiktionary:** https://en.wiktionary.org/wiki/Wiktionary:Frequency_lists
- **OpenSubtitles Corpus:** https://opus.nlpl.eu/OpenSubtitles.php
- **Leipzig Corpora:** https://wortschatz.uni-leipzig.de/en/download
- **Hermit Dave Frequency Lists:** https://github.com/hermitdave/FrequencyWords

### Code References
- `services/dictionaryService.ts` - Dictionary loading and matching
- `services/parser/SmartParser.ts` - Parser using dictionaries
- `services/parser/data/languageData.ts` - GRAMMAR vocabulary source

---

## 📝 Notes

- Dictionaries are **optional but highly recommended** for Standard Mode
- Parser will fall back to VERB_DB if dictionaries are missing
- Quality of experience is significantly better with dictionaries
- Can start with basic GRAMMAR-generated dictionaries and improve over time

---

*Current Status: Dictionaries missing but not blocking. Standard Mode can launch with reduced parser quality and add dictionaries as enhancement.*
