# Scripts Factory — Suevich Theme

This directory contains reusable automation scripts for the Suevich Shopify theme. Every script is modular and shares common utilities via `core/utils/`.

## Directory Structure

```
scripts/
├── README.md
├── core/
│   └── utils/                     # Shared utilities (use in any script)
│       ├── file-utils.js          # File-system helpers
│       ├── git.js                 # Git wrappers
│       ├── json.js                # Shopify locale JSON helpers
│       ├── liquid.js              # Extract/replace schema blocks
│       ├── logger.js              # Colored CLI logger
│       └── strings.js             # isEnglishText, slugify, namespaces
├── localization/                  # i18n factory
│   ├── index.js                   # Main CLI: scans & localizes everything
│   ├── config.js                  # Paths, skips, locales
│   ├── scanner.js                 # Detects hardcoded strings
│   ├── replacer.js                # Replaces strings with t: keys
│   ├── locale-writer.js           # Persists translations
│   ├── validators.js              # JSON & duplicate checks
│   └── fixes/
│       └── fix-block-names.js     # Fixes block name namespaces
```

## Available Scripts

### 1. Full Localization (`localization/index.js`)

Scans **all** `.liquid` files (snippets, sections, blocks, templates, layout) and:
- Converts hardcoded schema `label`, `info`, `content`, `name` into `t:` keys
- Converts frontend `aria-label`, `placeholder`, `alt`, `title`, `data-text`, text nodes into `{{ 'key' | t }}`
- Updates `locales/en.default.schema.json`, `locales/de.schema.json`, `locales/en.default.json`, `locales/de.json`
- Commits **one commit per file**

```bash
node scripts/localization/index.js
```

**Skipped files** (third-party apps) are configured in `localization/config.js`:
- `bucks-cc`, `pandectes-rules`, `a2reviews-*`

### 2. Fix Block Names (`localization/fixes/fix-block-names.js`)

Corrects the common issue where block `name` values inside a section schema inherit the section-level `t:` namespace instead of the block-level namespace.

```bash
node scripts/localization/fixes/fix-block-names.js
```

## Core Utilities

Any future script can import shared helpers:

```js
const { readFile, writeFile, listLiquidFiles } = require('./core/utils/file-utils');
const { loadJSON, saveJSON, setDeep, getDeep } = require('./core/utils/json');
const { gitAdd, gitCommit, hasStagedChanges } = require('./core/utils/git');
const { extractSchema, replaceSchema } = require('./core/utils/liquid');
const { isEnglishText, slugify, pathToNamespace } = require('./core/utils/strings');
const { info, success, warn, error } = require('./core/utils/logger');
```

## Notes

- No build step is required. Run scripts directly with Node.js.
- The `scripts/` folder is **ignored by Shopify** — it is not a standard OS 2.0 directory, so it will not affect theme uploads or store rendering.
- Always test on a development theme before running on live.
