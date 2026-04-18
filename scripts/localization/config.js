/**
 * Configuration for the localization factory.
 * Adjust these values per theme or per run.
 */

const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

const DIRS = ['snippets', 'sections', 'blocks', 'templates', 'layout'];

/**
 * Files or partial paths to skip (third-party app snippets, etc.)
 */
const SKIP_FILES = [
  'bucks-cc',
  'pandectes-rules',
  'pandectes',
  'a2reviews-head-var',
  'a2reviews-total',
  'a2reviews-widget',
];

/**
 * Locale files managed by the factory.
 */
const LOCALES = {
  enSchema: path.join(REPO_ROOT, 'locales', 'en.default.schema.json'),
  enStore: path.join(REPO_ROOT, 'locales', 'en.default.json'),
  ptSchema: path.join(REPO_ROOT, 'locales', 'pt-BR.schema.json'),
  ptStore: path.join(REPO_ROOT, 'locales', 'pt-BR.json'),
};

module.exports = {
  REPO_ROOT,
  DIRS,
  SKIP_FILES,
  LOCALES,
};
