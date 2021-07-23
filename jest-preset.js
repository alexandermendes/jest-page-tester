const path = require('path');

module.exports = {
  clearMocks: true,
  maxWorkers: 1,
  setupFilesAfterEnv: [path.join(__dirname, 'dist', 'polyfills.js')],
  testEnvironment: path.join(__dirname, 'dist', 'index.js'),
  testTimeout: 60000,
  verbose: true,
};
