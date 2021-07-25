import chalk from 'chalk';
import figures from 'figures';

const LEVELS = [
  'error',
  'warn',
  'info',
  'success',
  'log',
  'debug',
];

const ICONS = {
  error: figures('✗'),
  warn: figures('⚠'),
  info: figures('ℹ'),
  success: figures('✔'),
  debug: figures('›'),
};

const COLORS = {
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  success: 'green',
  debug: 'white',
};

export const logger = LEVELS.reduce((acc, level) => ({
  ...acc,
  [level]: (...args) => {
    const icon = ICONS[level] || '';
    const color = COLORS[level] || 'white';
    const [message, ...additional] = args;
    const messageWithIcon = [icon, message].filter((x) => x).join(' ');
    const formattedMsg = chalk[color](messageWithIcon);

    // eslint-disable-next-line no-console
    const log = console[level];

    log(formattedMsg, ...additional);
  },
}), {});
