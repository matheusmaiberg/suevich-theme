/**
 * Validators: check integrity after localization.
 */

const { extractSchema } = require('../core/utils/liquid');

/**
 * Validate that the schema block inside content is parseable JSON.
 */
function validateSchemaJSON(content, filePath) {
  const schema = extractSchema(content);
  if (!schema) return { valid: true }; // no schema = nothing to validate

  try {
    JSON.parse(schema.jsonStr);
    return { valid: true };
  } catch (err) {
    return { valid: false, error: err.message, filePath };
  }
}

/**
 * Detect duplicate block names inside a parsed schema object.
 * Returns array of { type, name } duplicates.
 */
function findDuplicateBlockNames(schemaObj) {
  if (!schemaObj || !schemaObj.blocks) return [];
  const seen = {};
  const dupes = [];
  for (const block of schemaObj.blocks) {
    if (!block.name) continue;
    if (seen[block.name]) {
      dupes.push({ type: block.type, name: block.name });
    }
    seen[block.name] = true;
  }
  return dupes;
}

/**
 * Detect if any block name incorrectly uses the section root namespace.
 * e.g. "t:sections.main-product.name" inside a block.
 */
function findWrongBlockNames(schemaObj, sectionName) {
  if (!schemaObj || !schemaObj.blocks) return [];
  const wrong = [];
  const bad = `t:sections.${sectionName}.name`;
  for (const block of schemaObj.blocks) {
    if (block.name === bad) {
      wrong.push(block.type);
    }
  }
  return wrong;
}

module.exports = {
  validateSchemaJSON,
  findDuplicateBlockNames,
  findWrongBlockNames,
};
