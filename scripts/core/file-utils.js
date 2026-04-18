/**
 * File-system utilities shared across all scripts.
 */

const fs = require('fs');
const path = require('path');

/**
 * Recursively list all files matching a predicate inside a directory.
 */
function walkDir(dir, predicate = () => true) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath, predicate));
    } else if (predicate(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Get all .liquid files inside specific theme directories.
 */
function listLiquidFiles(repoRoot, dirs = ['snippets', 'sections', 'blocks', 'templates', 'layout']) {
  const files = [];
  for (const dir of dirs) {
    const fullDir = path.join(repoRoot, dir);
    if (!fs.existsSync(fullDir)) continue;
    const entries = fs.readdirSync(fullDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.liquid')) {
        files.push(path.join(dir, entry.name));
      }
    }
  }
  return files;
}

/**
 * Read a text file safely.
 */
function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

/**
 * Write a text file safely.
 */
function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

module.exports = {
  walkDir,
  listLiquidFiles,
  readFile,
  writeFile,
};
