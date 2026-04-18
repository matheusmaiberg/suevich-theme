/**
 * Scanner: detects hardcoded English strings inside .liquid files.
 * Returns structured findings split by schema vs frontend.
 */

const { isEnglishText } = require('../core/utils/strings');
const { splitParts } = require('../core/utils/liquid');

/**
 * Scan a single file and return findings.
 */
function scanFile(content, relPath) {
  const findings = {
    schema: [],
    frontend: [],
  };

  const parts = splitParts(content);

  // --- Schema scan ---
  if (parts.schema) {
    const schemaStr = parts.schema;

    // label
    let match;
    const labelRe = /"label"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
    while ((match = labelRe.exec(schemaStr)) !== null) {
      const text = match[1];
      if (isEnglishText(text)) {
        findings.schema.push({ type: 'label', text, index: match.index });
      }
    }

    // info
    const infoRe = /"info"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
    while ((match = infoRe.exec(schemaStr)) !== null) {
      const text = match[1];
      if (isEnglishText(text)) {
        findings.schema.push({ type: 'info', text, index: match.index });
      }
    }

    // content (headers)
    const contentRe = /"content"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
    while ((match = contentRe.exec(schemaStr)) !== null) {
      const text = match[1];
      if (isEnglishText(text)) {
        findings.schema.push({ type: 'content', text, index: match.index });
      }
    }

    // name (section / block level)
    const nameRe = /"name"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
    while ((match = nameRe.exec(schemaStr)) !== null) {
      const text = match[1];
      if (isEnglishText(text)) {
        findings.schema.push({ type: 'name', text, index: match.index });
      }
    }
  }

  // --- Frontend scan (conservative) ---
  const front = parts.before + parts.after;

  // aria-label
  let m;
  const ariaRe = /aria-label="([^"]{2,120})"/g;
  while ((m = ariaRe.exec(front)) !== null) {
    if (isEnglishText(m[1])) findings.frontend.push({ type: 'aria-label', text: m[1] });
  }

  // placeholder
  const placeRe = /placeholder="([^"]{2,120})"/g;
  while ((m = placeRe.exec(front)) !== null) {
    if (isEnglishText(m[1])) findings.frontend.push({ type: 'placeholder', text: m[1] });
  }

  // title
  const titleRe = /title="([^"]{2,120})"/g;
  while ((m = titleRe.exec(front)) !== null) {
    if (isEnglishText(m[1])) findings.frontend.push({ type: 'title', text: m[1] });
  }

  // data-text
  const dataRe = /data-text="([^"]{2,120})"/g;
  while ((m = dataRe.exec(front)) !== null) {
    if (isEnglishText(m[1])) findings.frontend.push({ type: 'data-text', text: m[1] });
  }

  // alt (descriptive only)
  const altRe = /alt="([^"]{5,120})"/g;
  while ((m = altRe.exec(front)) !== null) {
    if (isEnglishText(m[1]) && /^[a-zA-Z\s\-]{5,}$/.test(m[1])) {
      findings.frontend.push({ type: 'alt', text: m[1] });
    }
  }

  // simple text nodes: >Text<
  const textNodeRe = />\s*([A-Z][a-zA-Z\s]{2,35})\s*</g;
  while ((m = textNodeRe.exec(front)) !== null) {
    const t = m[1].trim();
    if (
      isEnglishText(t) &&
      !/^(div|span|section|class|style|script|noscript|src|href|data|aria|role|id|alt|title|width|height)$/i.test(t)
    ) {
      findings.frontend.push({ type: 'text-node', text: t });
    }
  }

  return findings;
}

module.exports = { scanFile };
