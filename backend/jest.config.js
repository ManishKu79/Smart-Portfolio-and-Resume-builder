module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/server.js',
    '!src/config/**',
    '!src/logs/**',
    '!src/__tests__/**',
    '!src/services/pdfService.js', // Skip puppeteer issues
    '!src/controllers/pdfController.js'
  ],
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/performance/' // Skip k6 tests
  ],
  transformIgnorePatterns: [
    'node_modules/(?!puppeteer)'
  ],
  moduleNameMapper: {
    '^puppeteer$': '<rootDir>/src/__mocks__/puppeteer.js'
  },
  setupFilesAfterEnv: ['./jest.setup.js'],
  testTimeout: 10000,
  verbose: true
};