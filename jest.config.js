module.exports = {
  clearMocks: true,
  collectCoverageFrom: ['src/{**/,}*.js'],
  preset: './jest-preset',
  transform: { '^.+\\.(js|jsx)?$': '<rootDir>/node_modules/babel-jest' },
};
