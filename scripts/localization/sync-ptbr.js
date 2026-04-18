#!/usr/bin/env node
/**
 * Sync pt-BR locales from en.default.
 *
 * Copies any missing keys from en.default.json → pt-BR.json
 * and en.default.schema.json → pt-BR.schema.json,
 * preserving existing pt-BR translations.
 *
 * Usage:
 *   node scripts/localization/sync-ptbr.js
 */

const path = require('path');
const { loadJSON, saveJSON, getDeep, setDeep } = require('../core/utils/json');
const { info, success, warn } = require('../core/utils/logger');
const { REPO_ROOT } = require('./config');

const LOCALES = {
  enStore: path.join(REPO_ROOT, 'locales', 'en.default.json'),
  ptStore: path.join(REPO_ROOT, 'locales', 'pt-BR.json'),
  enSchema: path.join(REPO_ROOT, 'locales', 'en.default.schema.json'),
  ptSchema: path.join(REPO_ROOT, 'locales', 'pt-BR.schema.json'),
};

/**
 * Recursively walk an object and collect all leaf key paths.
 * A "leaf" is any primitive value (string, number, boolean).
 */
function collectLeaves(obj, path = [], results = []) {
  if (obj === null || typeof obj !== 'object') {
    results.push({ path: [...path], value: obj });
    return results;
  }
  for (const [key, val] of Object.entries(obj)) {
    collectLeaves(val, [...path, key], results);
  }
  return results;
}

/**
 * Merge missing keys from source into target, preserving target values.
 * Returns number of keys added.
 */
function syncMissing(target, source, label) {
  const sourceLeaves = collectLeaves(source);
  let added = 0;

  for (const leaf of sourceLeaves) {
    const existing = getDeep(target, leaf.path);
    if (existing === undefined) {
      setDeep(target, leaf.path, leaf.value);
      added++;
    }
  }

  return added;
}

function run() {
  info('Loading locale files...');

  const enStore = loadJSON(LOCALES.enStore);
  const ptStore = loadJSON(LOCALES.ptStore);
  const enSchema = loadJSON(LOCALES.enSchema);
  const ptSchema = loadJSON(LOCALES.ptSchema);

  info('Syncing storefront translations (pt-BR)...');
  const storeAdded = syncMissing(ptStore, enStore, 'storefront');
  success(`Storefront: ${storeAdded} missing keys copied to pt-BR.json`);

  info('Syncing schema translations (pt-BR)...');
  const schemaAdded = syncMissing(ptSchema, enSchema, 'schema');
  success(`Schema: ${schemaAdded} missing keys copied to pt-BR.schema.json`);

  saveJSON(LOCALES.ptStore, ptStore);
  saveJSON(LOCALES.ptSchema, ptSchema);

  info('Done! pt-BR locales are now in sync with en.default.');
  info('The Princess Jana can translate the fallback English strings');
  info('via Shopify Admin > Languages > pt-BR.');
}

module.exports = { run };

if (require.main === module) {
  run();
}
