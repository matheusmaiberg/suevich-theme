/**
 * Liquid template utilities.
 * Extract, parse and replace schema blocks inside .liquid files.
 */

const SCHEMA_START = /{%\s*schema\s*%}/;
const SCHEMA_END = /{%\s*endschema\s*%}/;

/**
 * Extract the raw schema JSON string from a .liquid file content.
 * Returns { jsonStr, startIndex, endIndex } or null.
 */
function extractSchema(content) {
  const startMatch = content.match(SCHEMA_START);
  if (!startMatch) return null;

  const endMatch = content.match(SCHEMA_END);
  if (!endMatch) return null;

  const startIndex = startMatch.index + startMatch[0].length;
  const endIndex = endMatch.index;

  return {
    jsonStr: content.slice(startIndex, endIndex),
    startIndex,
    endIndex,
    fullStart: startMatch.index,
    fullEnd: endMatch.index + endMatch[0].length,
  };
}

/**
 * Replace the schema block in content with new JSON string.
 */
function replaceSchema(content, newJsonStr) {
  const schema = extractSchema(content);
  if (!schema) return content;
  return (
    content.slice(0, schema.fullStart) +
    '{% schema %}\n' +
    newJsonStr.trim() +
    '\n{% endschema %}' +
    content.slice(schema.fullEnd)
  );
}

/**
 * Split a .liquid file into "before schema", "schema", and "after schema".
 */
function splitParts(content) {
  const schema = extractSchema(content);
  if (!schema) {
    return { before: content, schema: null, after: '' };
  }
  return {
    before: content.slice(0, schema.fullStart),
    schema: schema.jsonStr,
    after: content.slice(schema.fullEnd),
  };
}

module.exports = {
  extractSchema,
  replaceSchema,
  splitParts,
};
