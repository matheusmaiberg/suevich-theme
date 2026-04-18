/**
 * Replacer: modifies .liquid content by swapping hardcoded strings for t: keys.
 */

const { isEnglishText } = require('../core/utils/strings');
const { splitParts, replaceSchema } = require('../core/utils/liquid');

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
 * Recursively walk a schema object and replace localizable string values.
 * Returns { changes, translations }.
 *
 * Context tracks where we are in the tree so we generate correct namespaces:
 * - root "name"        → sections.{section}.name
 * - block "name"       → sections.{section}.blocks.{type}.name
 * - setting "label"    → sections.{section}.settings.{id}.label
 * - setting "info"     → sections.{section}.settings.{id}.info
 * - setting "content"  → sections.{section}.settings.{id}.content
 */
function walkSchema(obj, nsBase, translations, context = {}) {
  let changes = 0;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      const res = walkSchema(item, nsBase, translations, context);
      changes += res.changes;
    }
    return { changes };
  }

  if (!obj || typeof obj !== 'object') {
    return { changes: 0 };
  }

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && isEnglishText(value)) {
      const keyPathParts = nsBase.split('.');

      if (key === 'name') {
        if (context.isBlock && context.blockType) {
          const kp = [...keyPathParts, 'blocks', context.blockType, 'name'];
          translations.push({ keyPath: kp, enText: value });
          obj[key] = `t:${kp.join('.')}`;
          changes++;
        } else if (context.isSetting && context.settingId) {
          // name inside a setting object (rare but possible)
          const kp = [...keyPathParts, 'settings', context.settingId, 'name'];
          translations.push({ keyPath: kp, enText: value });
          obj[key] = `t:${kp.join('.')}`;
          changes++;
        } else {
          // root-level name (section or standalone block)
          const kp = [...keyPathParts, 'name'];
          translations.push({ keyPath: kp, enText: value });
          obj[key] = `t:${kp.join('.')}`;
          changes++;
        }
      } else if ((key === 'label' || key === 'info' || key === 'content') && context.isSetting && context.settingId) {
        const kp = [...keyPathParts, 'settings', context.settingId, key];
        translations.push({ keyPath: kp, enText: value });
        obj[key] = `t:${kp.join('.')}`;
        changes++;
      }
      // Other string keys (e.g. "default") are intentionally skipped
    } else if (key === 'presets' && Array.isArray(value)) {
      // Preset names intentionally skipped — they are not runtime UI strings
      continue;
    } else if (key === 'blocks' && Array.isArray(value)) {
      for (const block of value) {
        const blockCtx = { ...context, isBlock: true, blockType: block.type };
        const res = walkSchema(block, nsBase, translations, blockCtx);
        changes += res.changes;
      }
    } else if (key === 'settings' && Array.isArray(value)) {
      let settingIdx = 0;
      for (const setting of value) {
        const sid = setting.id || `unknown_${settingIdx}`;
        const settingCtx = { ...context, isSetting: true, settingId: sid };
        const res = walkSchema(setting, nsBase, translations, settingCtx);
        changes += res.changes;
        settingIdx++;
      }
    } else if (key === 'options' && Array.isArray(value) && context.isSetting && context.settingId) {
      // Select/radio options: localize labels using the option value as key
      const keyPathParts = nsBase.split('.');
      for (const opt of value) {
        if (typeof opt.label === 'string' && isEnglishText(opt.label) && opt.value) {
          const kp = [...keyPathParts, 'settings', context.settingId, 'options', opt.value, 'label'];
          translations.push({ keyPath: kp, enText: opt.label });
          opt.label = `t:${kp.join('.')}`;
          changes++;
        }
      }
    } else if (typeof value === 'object') {
      const res = walkSchema(value, nsBase, translations, context);
      changes += res.changes;
    }
  }

  return { changes };
}

/**
 * Localize schema strings inside a liquid file.
 * Returns { content, changes, translations } where translations is array of {keyPath, enText}.
 */
function localizeSchema(content, relPath) {
  const parts = splitParts(content);
  if (!parts.schema) return { content, changes: 0, translations: [] };

  let schemaObj;
  try {
    schemaObj = JSON.parse(parts.schema);
  } catch {
    return { content, changes: 0, translations: [] };
  }

  const nsBase = buildNamespace(relPath);
  const translations = [];
  const { changes } = walkSchema(schemaObj, nsBase, translations);

  if (changes === 0) {
    return { content, changes: 0, translations: [] };
  }

  const newContent = replaceSchema(content, JSON.stringify(schemaObj, null, 2));
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
