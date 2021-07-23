module.exports = {
  clearMocks: true,
  testEnvironment: 'node',
  collectCoverageFrom: ['packages/{**/,}*.js'],
  transform: { '^.+\\.(js|jsx)?$': '<rootDir>/node_modules/babel-jest' },
};
