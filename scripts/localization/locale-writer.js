/**
 * Locale Writer: persists translations into Shopify locale JSON files.
 *
 * Strategy for pt-BR-localization:
 * - en.default*  → primary source of truth (English fallback)
 * - pt-BR*       → native language; new keys get copied from source text
 *                  as fallback so Jana can translate via Admin later.
 * Existing pt-BR translations are NEVER overwritten.
 */

const { loadJSON, saveJSON, setDeep, getDeep } = require('../core/utils/json');
const { LOCALES } = require('./config');

class LocaleWriter {
  constructor() {
    this.enSchema = loadJSON(LOCALES.enSchema);
    this.enStore = loadJSON(LOCALES.enStore);
    this.ptSchema = loadJSON(LOCALES.ptSchema);
    this.ptStore = loadJSON(LOCALES.ptStore);
  }

  /**
   * Add a schema translation.
   * EN always gets the source text.
   * PT-BR gets the source text only if the key does not yet exist.
   */
  addSchemaTranslation(keyPath, sourceText) {
    setDeep(this.enSchema, keyPath, sourceText);
    if (getDeep(this.ptSchema, keyPath) === undefined) {
      setDeep(this.ptSchema, keyPath, sourceText);
    }
  }

  /**
   * Add a storefront translation.
   * EN always gets the source text.
   * PT-BR gets the source text only if the key does not yet exist.
   */
  addStoreTranslation(keyPath, sourceText) {
    setDeep(this.enStore, keyPath, sourceText);
    if (getDeep(this.ptStore, keyPath) === undefined) {
      setDeep(this.ptStore, keyPath, sourceText);
    }
  }

  /**
   * Persist all locale files back to disk.
   */
  save() {
    saveJSON(LOCALES.enSchema, this.enSchema);
    saveJSON(LOCALES.enStore, this.enStore);
    saveJSON(LOCALES.ptSchema, this.ptSchema);
    saveJSON(LOCALES.ptStore, this.ptStore);
  }
}

module.exports = { LocaleWriter };
