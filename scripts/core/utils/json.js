/**
 * JSON utilities for Shopify locale files.
 * Handles JSON-with-comments headers safely.
 */

const fs = require('fs');

const DEFAULT_HEADER = `/*
 * ------------------------------------------------------------
 * IMPORTANT: The contents of this file are auto-generated.
 *
 * This file may be updated by the Shopify admin language editor
 * or related systems. Please exercise caution as any changes
 * made to this file may be overwritten.
 * ------------------------------------------------------------
 */
`;

/**
 * Strip a leading C-style comment block from JSON text.
 */
function stripComments(str) {
  return str.replace(/\/\*[\s\S]*?\*\//g, '').trim();
}

/**
 * Load a JSON file that may start with a comment header.
 */
function loadJSON(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(stripComments(raw));
}

/**
 * Save an object to JSON with the Shopify comment header.
 */
function saveJSON(filePath, obj) {
  fs.writeFileSync(filePath, DEFAULT_HEADER + JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

/**
 * Ensure a nested path exists inside an object, creating empty objects as needed.
 */
function ensurePath(obj, keys) {
  for (const k of keys) {
    if (!obj[k] || typeof obj[k] !== 'object') {
      obj[k] = {};
    }
    obj = obj[k];
  }
  return obj;
}

/**
 * Set a deep value by key array. Creates intermediate objects if missing.
 */
function setDeep(obj, keys, value) {
  for (let i = 0; i < keys.length - 1; i++) {
    if (!obj[keys[i]] || typeof obj[keys[i]] !== 'object') {
      obj[keys[i]] = {};
    }
    obj = obj[keys[i]];
  }
  obj[keys[keys.length - 1]] = value;
}

/**
 * Get a deep value by key array. Returns undefined if path missing.
 */
function getDeep(obj, keys) {
  for (const k of keys) {
    if (!obj || typeof obj !== 'object') return undefined;
    obj = obj[k];
  }
  return obj;
}

module.exports = {
  stripComments,
  loadJSON,
  saveJSON,
  ensurePath,
  setDeep,
  getDeep,
};
