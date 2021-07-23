const { argv } = require('yargs');
const path = require('path');

const { testURL } = argv;

if (!testURL) {
  throw new Error('A --testURL must be set (e.g. --testURL=https://example.com).');
}

module.exports = {
  clearMocks: true,
  maxWorkers: 1,
  setupFilesAfterEnv: [path.join(__dirname, 'dist', 'setup.js')],
  testEnvironment: path.join(__dirname, 'dist', 'index.js'),
  testTimeout: 60000,
  testURL,
  verbose: true,
};
