module.exports = {
  clearMocks: true,
  preset: './jest-preset',
  transform: { '^.+\\.(js|jsx)?$': '<rootDir>/node_modules/babel-jest' },
};
