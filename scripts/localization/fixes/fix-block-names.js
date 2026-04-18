/**
 * Fix: corrects block name namespaces inside section schemas.
 *
 * Problem: when localizing schemas, "name" inside blocks may incorrectly
 * inherit the section-level namespace (t:sections.xxx.name) instead of
 * the block-level namespace (t:sections.xxx.blocks.[type].name).
 *
 * Usage:
 *   node scripts/localization/fixes/fix-block-names.js
 */

const fs = require('fs');
const path = require('path');
const { readFile, writeFile } = require('../../core/file-utils');
const { loadJSON, saveJSON, setDeep, getDeep } = require('../../core/json-utils');
const { extractSchema, replaceSchema } = require('../../core/liquid-utils');
const { gitAdd, gitCommit, hasStagedChanges } = require('../../core/git-utils');
const { info, success, warn } = require('../../core/logger');
const { findWrongBlockNames } = require('../validators');
const { REPO_ROOT, LOCALES } = require('../config');

function run() {
  const enSchema = loadJSON(LOCALES.enSchema);
  const deSchema = loadJSON(LOCALES.deSchema);

  const sectionsDir = path.join(REPO_ROOT, 'sections');
  const files = fs.readdirSync(sectionsDir).filter(f => f.endsWith('.liquid'));
  let fixedCount = 0;

  for (const file of files) {
    const relPath = path.join('sections', file);
    const filePath = path.join(REPO_ROOT, relPath);
    const content = readFile(filePath);
    const schemaMeta = extractSchema(content);
    if (!schemaMeta) continue;

    let schemaObj;
    try {
      schemaObj = JSON.parse(schemaMeta.jsonStr);
    } catch {
      warn(`Skipping invalid schema: ${file}`);
      continue;
    }

    if (!schemaObj.blocks) continue;

    const sectionName = file.replace('.liquid', '');
    const wrongTypes = findWrongBlockNames(schemaObj, sectionName);
    if (wrongTypes.length === 0) continue;

    for (const block of schemaObj.blocks) {
      const expected = `t:sections.${sectionName}.blocks.${block.type}.name`;
      const wrong = `t:sections.${sectionName}.name`;
      if (block.name === wrong) {
        block.name = expected;

        // Migrate locale value if it exists at section.name
        const enVal = getDeep(enSchema, ['sections', sectionName, 'name']);
        const deVal = getDeep(deSchema, ['sections', sectionName, 'name']);
        const blockKey = ['sections', sectionName, 'blocks', block.type, 'name'];
        if (enVal) setDeep(enSchema, blockKey, enVal);
        if (deVal) setDeep(deSchema, blockKey, deVal);
      }
    }

    const newContent = replaceSchema(content, JSON.stringify(schemaObj, null, 2));
    writeFile(filePath, newContent);

    gitAdd(relPath, REPO_ROOT);
    if (hasStagedChanges(REPO_ROOT)) {
      gitCommit(`fix(i18n): correct block name namespaces in ${file}`, REPO_ROOT);
    }
    fixedCount++;
    success(`Fixed ${file}`);
  }

  saveJSON(LOCALES.enSchema, enSchema);
  saveJSON(LOCALES.deSchema, deSchema);
  gitAdd('locales', REPO_ROOT);
  if (hasStagedChanges(REPO_ROOT)) {
    gitCommit('fix(i18n): update locale block name translations', REPO_ROOT);
  }

  info(`Finished. Fixed ${fixedCount} section files.`);
}

module.exports = { run };

// CLI direct execution
if (require.main === module) {
  run();
}
