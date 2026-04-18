/**
 * String utilities shared across all scripts.
 * Detects English text, sanitizes keys, generates namespaces.
 */

const MIN_ENGLISH_WORD_LENGTH = 2;

/**
 * Checks if a string looks like human-readable English text
 * (as opposed to CSS classes, handles, URLs, variable names).
 */
function isEnglishText(str) {
  if (!str || typeof str !== 'string') return false;
  const trimmed = str.trim();
  if (trimmed.length < 2) return false;

  // Skip numeric values with units
  if (/^\d+(\.\d+)?\s*(px|rem|em|%|s|ms|deg|vh|vw|dpi|dppx)?$/i.test(trimmed)) {
    return false;
  }

  // Skip single-word handles / CSS classes / IDs
  if (/^[a-z0-9_-]+$/i.test(trimmed) && trimmed.length < 15) return false;

  // Skip URLs / emails
  if (/https?:|www\.|@/i.test(trimmed)) return false;

  // Skip Liquid expressions
  if (/\{\{|\{%/.test(trimmed)) return false;

  // Skip already-localized
  if (trimmed.startsWith('t:')) return false;

  // Must contain at least a couple of letters
  if (!/[a-zA-Z]{2,}/.test(trimmed)) return false;

  return true;
}

/**
 * Convert a raw string into a safe JSON/namespace key segment.
 */
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 40);
}

/**
 * Sanitize a translation key so it never collides with Liquid syntax.
 */
function sanitizeKey(str) {
  return str.replace(/[^a-zA-Z0-9_.-]/g, '_');
}

/**
 * Convert a file path into a default namespace.
 * e.g. "sections/main-product.liquid" -> "sections.main_product"
 */
function pathToNamespace(relPath) {
  const parts = relPath.replace(/\\/g, '/').split('/');
  const dir = parts[0];
  const base = parts[parts.length - 1].replace('.liquid', '').replace(/-/g, '_');
  return `${dir}.${base}`;
}

module.exports = {
  isEnglishText,
  slugify,
  sanitizeKey,
  pathToNamespace,
};
