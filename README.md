# 🌍 Restriction-Free Word Lists

**Word lists in Dutch, German, French, English & Spanish** — Curated, filtered, and ready to use in any project without restrictions.

Perfect for developers building word games, linguists conducting research, educators creating learning materials, or hobbyists exploring language data.

---

## 📋 What's Included

For each language, we provide **multiple word list variants** to suit different needs:

| List Type | Description |
|-----------|-------------|
| **RAW** | Unfiltered word collection — contains all extracted words |
| **Clean** | Filtered list with invalid entries removed (see [Filter Criteria](#-filter-criteria)) |
| **Dictionary** | Clean list validated against official dictionaries — only real words |
| **Dictionary + Definitions** | Dictionary-verified words with brief meaning descriptions |

---

## 🗣️ Supported Languages

| Language | Status | Word Lists Available |
|----------|--------|---------------------|
| 🇳🇱 **Dutch** | ✅ COMPLETE | RAW, Clean, Dictionary, Dictionary+Definitions |
| 🇬🇧 **English** | 🚧 Work in Progress | RAW, Clean, Dictionary, Dictionary+Definitions |
| 🇩🇪 **German** | 🚧 Work in Progress | RAW, Clean, Dictionary, Dictionary+Definitions |
| 🇫🇷 **French** | 🚧 Work in Progress | RAW, Clean, Dictionary, Dictionary+Definitions |
| 🇪🇸 **Spanish** | 🚧 Work in Progress | RAW, Clean |

---

## 🔍 Filter Criteria

The **Clean** word lists apply filtering rules to ensure high-quality data:

### ❌ Excluded
- Words shorter than 4 or longer than 12 characters
- Words containing invalid characters (numbers, special symbols)
- Roman numerals (I, II, XIV, MCMXC, etc.)
- Repetitive patterns (AAAA, 1111, etc.)

### ✅ Normalized
- Special characters are converted to standard equivalents:
  - `é` → `e`
  - `ß` → `ss`
  - `æ` → `ae`