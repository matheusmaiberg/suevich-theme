#!/usr/bin/env node
/**
 * Localization Factory — CLI entry point.
 *
 * Scans all .liquid files, replaces hardcoded English strings with t: keys,
 * updates locale JSONs, and commits each file individually.
 *
 * Usage:
 *   node scripts/localization/index.js
 */

const path = require('path');
const { listLiquidFiles, readFile, writeFile } = require('../core/utils/file-utils');
const { gitAdd, gitCommit, hasStagedChanges } = require('../core/utils/git');
const { info, success, warn, error } = require('../core/utils/logger');
const { validateSchemaJSON } = require('./validators');
const { localizeSchema, localizeFrontend } = require('./replacer');
const { LocaleWriter } = require('./locale-writer');
const { REPO_ROOT, SKIP_FILES } = require('./config');

function shouldSkip(relPath) {
  return SKIP_FILES.some(skip => relPath.includes(skip));
}

function run() {
  const files = listLiquidFiles(REPO_ROOT);
  const writer = new LocaleWriter();
  let filesModified = 0;
  let totalChanges = 0;

  info(`Scanning ${files.length} files...\n`);

  for (const relPath of files) {
    if (shouldSkip(relPath)) {
      info(`Skipping ${relPath}`);
      continue;
    }

    const filePath = path.join(REPO_ROOT, relPath);
    let content = readFile(filePath);
    let changed = false;
    let fileChanges = 0;

    // Schema pass
    const schemaResult = localizeSchema(content, relPath);
    if (schemaResult.changes > 0) {
      content = schemaResult.content;
      changed = true;
      fileChanges += schemaResult.changes;
      for (const t of schemaResult.translations) {
        writer.addSchemaTranslation(t.keyPath, t.enText);
      }
    }

    // Frontend pass
    const frontendResult = localizeFrontend(content, relPath);
    if (frontendResult.changes > 0) {
      content = frontendResult.content;
      changed = true;
      fileChanges += frontendResult.changes;
      for (const t of frontendResult.translations) {
        writer.addStoreTranslation(t.keyPath, t.enText);
      }
    }

    // Validation
    const validation = validateSchemaJSON(content, relPath);
    if (!validation.valid) {
      error(`Schema JSON invalid after replacement in ${relPath}: ${validation.error}`);
      continue;
    }

    if (changed) {
      writeFile(filePath, content);
      filesModified++;
      totalChanges += fileChanges;

      gitAdd(relPath, REPO_ROOT);
      if (hasStagedChanges(REPO_ROOT)) {
        const fileName = path.basename(relPath);
        gitCommit(`feat(i18n): localize ${fileName}`, REPO_ROOT);
        success(`Committed ${fileName} (${fileChanges} changes)`);
      }
    }
  }

  // Persist locales
  writer.save();
  gitAdd('locales', REPO_ROOT);
  if (hasStagedChanges(REPO_ROOT)) {
    gitCommit('feat(i18n): update all locale files with new translations', REPO_ROOT);
  }

  info(`\nDone! ${filesModified} files modified, ${totalChanges} total changes.`);
}

module.exports = { run };

// CLI direct execution
if (require.main === module) {
  run();
}
