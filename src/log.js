import chalk from 'chalk';
import figures from 'figures';

const ERROR = 'error';
const WARN = 'warn';
const INFO = 'info';
const SUCCESS = 'success';
const DEBUG = 'debug';
const LOG = 'log';

const ICONS = {
  [ERROR]: figures('✗'),
  [WARN]: figures('⚠'),
  [INFO]: figures('ℹ'),
  [SUCCESS]: figures('✔'),
  [DEBUG]: figures('›'),
};

const COLORS = {
  [ERROR]: 'red',
  [WARN]: 'yellow',
  [INFO]: 'cyan',
  [SUCCESS]: 'green',
  [DEBUG]: 'white',
};

export const logger = [
  ERROR,
  WARN,
  INFO,
  SUCCESS,
  DEBUG,
  LOG,
].reduce((acc, level) => ({
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
