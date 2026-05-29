const base = require('./jest.config')

module.exports = {
  ...base,
  moduleNameMapper: {
    '^[./]+logger$': '<rootDir>/server/routes/testutils/logger.ts',
  },
}
