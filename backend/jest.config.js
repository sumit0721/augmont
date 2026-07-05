// jest.config.js — Jest configuration for backend tests

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  // Increase timeout for database-dependent tests
  testTimeout: 30000,
  // Clear any module mocks between tests
  clearMocks: true
};
