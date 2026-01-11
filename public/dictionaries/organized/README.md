# Dictionary Organization

Dictionaries are organized by language family for better maintainability and GitHub repository management.

## Structure

```
organized/
├── romance/        (20MB) - Spanish, French, Italian, Portuguese
├── germanic/       (26MB) - German
├── slavic/         (14MB) - Russian, Polish, Czech, Ukrainian
└── east-asian/     (12MB) - Japanese, Mandarin
```

## Language Families

### Romance Languages (Latin-derived)
- **Spanish** (eng-spa) - 4.0MB - 48,000 words
- **French** (eng-fra, French-English) - 130KB + 1.3MB - Bidirectional
- **Italian** (freedict-eng-ita) - 3.4MB - 24,000 words
- **Portuguese** (freedict-eng-por) - 233KB - 7,500 words

### Germanic Languages
- **German** (freedict-eng-deu) - 22MB - 245,000 words ⚠️ Largest dictionary

### Slavic Languages
- **Russian** (freedict-eng-rus) - 4.8MB - 40,000 words
- **Polish** (freedict-eng-pol) - 151KB - 5,000 words
- **Czech** (freedict-eng-ces) - 963KB - 12,000 words
- **Ukrainian** (Ukrainian-English) - 257KB - 8,000 words

### East Asian Languages
- **Japanese** (jpn-eng) - 4.2MB - 30,000 words
- **Mandarin** (Chinese-English) - 3.4MB - 25,000 words

## Total Size: ~72MB

All dictionaries are in StarDict format (.dict.dz compressed, .idx index, .ifo metadata).

## GitHub Considerations

- ✅ All files are under 100MB per file limit
- ✅ Total repo size with dictionaries: ~200MB (within GitHub's soft limit)
- ⚠️ German dictionary (22MB) is the largest single file
- 💡 Consider Git LFS if repo grows beyond 1GB

## Sources

- **FreeDict**: freedict.org (GPL licensed, community-maintained)
- **Wiktionary**: Chinese, French, Ukrainian (CC-BY-SA licensed)
- **StarDict**: Japanese-English (GPL licensed)
