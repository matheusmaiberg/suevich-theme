/**
 * Git helpers shared across all scripts.
 * Wraps child_process for common operations.
 */

const { execSync } = require('child_process');

function run(cmd, cwd, silent = true) {
  const stdio = silent ? 'ignore' : 'inherit';
  return execSync(cmd, { cwd, stdio, encoding: 'utf8' });
}

function gitAdd(filePattern, cwd) {
  run(`git add "${filePattern}"`, cwd);
}

function gitCommit(message, cwd) {
  try {
    run(`git commit -m "${message}"`, cwd);
    return true;
  } catch {
    return false;
  }
}

function hasStagedChanges(cwd) {
  try {
    run('git diff --cached --quiet', cwd);
    return false;
  } catch {
    return true;
  }
}

function gitPush(branch, cwd) {
  run(`git push origin ${branch}`, cwd);
}

function currentBranch(cwd) {
  return run('git branch --show-current', cwd).trim();
}

module.exports = {
  run,
  gitAdd,
  gitCommit,
  hasStagedChanges,
  gitPush,
  currentBranch,
};
