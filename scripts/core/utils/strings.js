/**
 * String utilities shared across all scripts.
 * Detects human-readable text, sanitizes keys, generates namespaces.
 */

/**
 * Checks if a string looks like human-readable text
 * (any natural language: EN, PT-BR, DE, etc.).
 * Rejects CSS classes, handles, URLs, variable names, numeric values.
 */
function isHumanText(str) {
  if (!str || typeof str !== 'string') return false;
  const trimmed = str.trim();
  if (trimmed.length < 2) return false;

  // Skip numeric values with units
  if (/^\d+(\.\d+)?\s*(px|rem|em|%|s|ms|deg|vh|vw|dpi|dppx)?$/i.test(trimmed)) {
    return false;
  }

  // Skip snake_case / kebab-case handles (technical identifiers)
  if (/^[a-z0-9]+[-_][a-z0-9_-]+$/i.test(trimmed)) return false;

  // Skip camelCase / PascalCase identifiers (no spaces, mixed case)
  if (/^[a-z]+[A-Z]/.test(trimmed) && !trimmed.includes(' ')) return false;

  // Skip pure URLs / emails (but allow text that contains markdown links)
  if (/^https?:\/\//i.test(trimmed) || /^www\./i.test(trimmed) || /^[^\s]+@[^\s]+\.[^\s]+$/i.test(trimmed)) {
    return false;
  }

  // Skip Liquid expressions
  if (/\{\{|\{%/.test(trimmed)) return false;

  // Skip already-localized
  if (trimmed.startsWith('t:')) return false;
  if (trimmed.includes('{{') && trimmed.includes('| t }}')) return false;

  // Must contain at least a couple of letters (supports accented chars)
  if (!/[a-zA-ZÀ-ÿ]{2,}/.test(trimmed)) return false;

  return true;
}

/**
 * Legacy alias — kept for backward compatibility.
 * Use isHumanText() for new code; it supports any natural language.
 */
function isEnglishText(str) {
  return isHumanText(str);
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
  isHumanText,
  isEnglishText,
  slugify,
  sanitizeKey,
  pathToNamespace,
};
