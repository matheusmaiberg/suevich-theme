/**
 * Simple colored logger for CLI scripts.
 */

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(msg) {
  console.log(msg);
}

function info(msg) {
  console.log(`${COLORS.blue}[info]${COLORS.reset} ${msg}`);
}

function success(msg) {
  console.log(`${COLORS.green}[ok]${COLORS.reset} ${msg}`);
}

function warn(msg) {
  console.log(`${COLORS.yellow}[warn]${COLORS.reset} ${msg}`);
}

function error(msg) {
  console.log(`${COLORS.red}[err]${COLORS.reset} ${msg}`);
}

function debug(msg) {
  console.log(`${COLORS.gray}[dbg]${COLORS.reset} ${msg}`);
}

module.exports = {
  log,
  info,
  success,
  warn,
  error,
  debug,
};
