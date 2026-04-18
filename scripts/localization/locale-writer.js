/**
 * Locale Writer: persists translations into Shopify locale JSON files.
 */

const { loadJSON, saveJSON, setDeep } = require('../core/json-utils');
const { LOCALES } = require('./config');

class LocaleWriter {
  constructor() {
    this.enSchema = loadJSON(LOCALES.enSchema);
    this.deSchema = loadJSON(LOCALES.deSchema);
    this.enStore = loadJSON(LOCALES.enStore);
    this.deStore = loadJSON(LOCALES.deStore);
  }

  /**
   * Add a schema translation (label or content).
   */
  addSchemaTranslation(keyPath, enText) {
    const last = keyPath[keyPath.length - 1];
    setDeep(this.enSchema, keyPath, last === 'content' ? { content: enText } : { label: enText });
    setDeep(this.deSchema, keyPath, last === 'content' ? { content: enText } : { label: enText });
  }

  /**
   * Add a storefront translation.
   */
  addStoreTranslation(keyPath, enText) {
    setDeep(this.enStore, keyPath, enText);
    setDeep(this.deStore, keyPath, enText);
  }

  /**
   * Persist all locale files back to disk.
   */
  save() {
    saveJSON(LOCALES.enSchema, this.enSchema);
    saveJSON(LOCALES.deSchema, this.deSchema);
    saveJSON(LOCALES.enStore, this.enStore);
    saveJSON(LOCALES.deStore, this.deStore);
  }
}

module.exports = { LocaleWriter };
