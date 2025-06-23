module.exports = {
    // Other Jest config options...
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleNameMapper: {
      '^argon2$': '<rootDir>/__mocks__/argon2.ts',
    },
    preset: 'ts-jest',
  testEnvironment: 'node',
  // other Jest configuration options
  globals: {
    'ts-jest': {
      tsconfig: 'path/to/your/tsconfig.json',
      esModuleInterop: true,
    },
  },
  };