const base = require('./jest.config')

module.exports = {
  ...base,
  moduleNameMapper: {
    '^[./]+logger$': '<rootDir>/server/testutils/testLogger.ts',
  },
}
