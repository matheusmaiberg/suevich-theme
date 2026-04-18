/**
 * Replacer: modifies .liquid content by swapping hardcoded strings for t: keys.
 */

const { isEnglishText } = require('../core/string-utils');
const { splitParts, replaceSchema } = require('../core/liquid-utils');

/**
 * Build a namespace base from a relative file path.
 */
function buildNamespace(relPath) {
  const parts = relPath.replace(/\\/g, '/').split('/');
  const dir = parts[0];
  const base = parts[parts.length - 1].replace('.liquid', '');
  if (dir === 'sections') return `sections.${base}`;
  if (dir === 'blocks') return `blocks.${base}`;
  return `sections.${base}`;
}

/**
 * Localize schema strings inside a liquid file.
 * Returns { content, changes, translations } where translations is array of {keyPath, enText}.
 */
function localizeSchema(content, relPath, counterStart = 0) {
  const parts = splitParts(content);
  if (!parts.schema) return { content, changes: 0, translations: [] };

  let schemaStr = parts.schema;
  let changes = 0;
  let counter = counterStart;
  const nsBase = buildNamespace(relPath);
  const translations = [];

  function getSettingId(beforeText) {
    const idMatch = beforeText.match(/"id"\s*:\s*"([^"]+)"[\s\S]{0,200}?$/);
    return idMatch ? idMatch[1] : `s${counter}`;
  }

  // label
  schemaStr = schemaStr.replace(/"label"\s*:\s*"((?:[^"\\]|\\.)*)"/g, (match, text) => {
    if (!isEnglishText(text)) return match;
    const before = schemaStr.slice(0, schemaStr.indexOf(match));
    const sid = getSettingId(before);
    const keyPath = [...nsBase.split('.'), 'settings', sid, 'label'];
    translations.push({ keyPath, enText: text });
    changes++;
    counter++;
    return `"label": "t:${keyPath.join('.')}"`;
  });

  // info
  schemaStr = schemaStr.replace(/"info"\s*:\s*"((?:[^"\\]|\\.)*)"/g, (match, text) => {
    if (!isEnglishText(text)) return match;
    const before = schemaStr.slice(0, schemaStr.indexOf(match));
    const sid = getSettingId(before);
    const keyPath = [...nsBase.split('.'), 'settings', sid, 'info'];
    translations.push({ keyPath, enText: text });
    changes++;
    counter++;
    return `"info": "t:${keyPath.join('.')}"`;
  });

  // content
  schemaStr = schemaStr.replace(/"content"\s*:\s*"((?:[^"\\]|\\.)*)"/g, (match, text) => {
    if (!isEnglishText(text)) return match;
    const before = schemaStr.slice(0, schemaStr.indexOf(match));
    const sid = getSettingId(before);
    const keyPath = [...nsBase.split('.'), 'settings', sid, 'content'];
    translations.push({ keyPath, enText: text });
    changes++;
    counter++;
    return `"content": "t:${keyPath.join('.')}"`;
  });

  // name (section/block root)
  schemaStr = schemaStr.replace(/"name"\s*:\s*"((?:[^"\\]|\\.)*)"/g, (match, text) => {
    if (!isEnglishText(text)) return match;
    const keyPath = [...nsBase.split('.'), 'name'];
    translations.push({ keyPath, enText: text });
    changes++;
    counter++;
    return `"name": "t:${keyPath.join('.')}"`;
  });

  const newContent = replaceSchema(content, schemaStr);
  return { content: newContent, changes, translations };
}

/**
 * Localize frontend strings (outside schema).
 */
function localizeFrontend(content, relPath, counterStart = 0) {
  const parts = splitParts(content);
  const front = parts.before + parts.after;
  if (!front) return { content, changes: 0, translations: [] };

  let modified = front;
  let changes = 0;
  let counter = counterStart;
  const fileName = relPath.replace(/\\/g, '/').split('/').pop().replace('.liquid', '');
  const dirName = relPath.replace(/\\/g, '/').split('/')[0];
  const translations = [];

  function replacer(attr, suffix) {
    const regex = new RegExp(`${attr}="([^"]{2,120})"`, 'g');
    modified = modified.replace(regex, (match, text) => {
      if (!isEnglishText(text)) return match;
      const key = [dirName, fileName, `${suffix}_${counter}`];
      translations.push({ keyPath: key, enText: text });
      changes++;
      counter++;
      return `${attr}="{{ '${key.join('.')}' | t }}"`;
    });
  }

  replacer('aria-label', 'aria_label');
  replacer('placeholder', 'placeholder');
  replacer('title', 'title');
  replacer('data-text', 'data_text');

  // alt
  modified = modified.replace(/alt="([^"]{5,120})"/g, (match, text) => {
    if (!isEnglishText(text) || !/^[a-zA-Z\s\-]{5,}$/.test(text)) return match;
    const key = [dirName, fileName, `alt_${counter}`];
    translations.push({ keyPath: key, enText: text });
    changes++;
    counter++;
    return `alt="{{ '${key.join('.')}' | t }}"`;
  });

  // text nodes
  modified = modified.replace(/>\s*([A-Z][a-zA-Z\s]{2,35})\s*</g, (match, text) => {
    const t = text.trim();
    if (!isEnglishText(t)) return match;
    if (/^(div|span|section|class|style|script|noscript|src|href|data|aria|role|id|alt|title|width|height)$/i.test(t)) {
      return match;
    }
    const key = [dirName, fileName, `text_${counter}`];
    translations.push({ keyPath: key, enText: t });
    changes++;
    counter++;
    return `>{{ '${key.join('.')}' | t }}<`;
  });

  const newContent = parts.before + modified + parts.after;
  return { content: newContent, changes, translations };
}

module.exports = {
  buildNamespace,
  localizeSchema,
  localizeFrontend,
};
