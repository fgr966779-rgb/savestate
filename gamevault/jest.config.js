/** @type {import('jest').Config} */
module.exports = {
  preset: 'react-native',
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.{test,spec}.{ts,tsx}',
    '**/*.{test,spec}.{ts,tsx}',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/android/',
    '/ios/',
    '/e2e/',
    '/web/',
    '/.expo/',
  ],

  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      diagnostics: {
        exclude: ['**'],
      },
    }],
    '^.+\\.(js|jsx)$': ['babel-jest', {
      cwd: __dirname,
    }],
  },

  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-reanimated|react-native-gesture-handler|react-native-screens|react-native-safe-area-context|@shopify/react-native-skia|lottie-react-native|zustand|immer|@nozbe/watermelondb|@nozbe/with-observables|@supabase/supabase-js|react-hook-form|@hookform/resolvers|zod|i18next|react-i18next|react-native-mmkv|victory-native|@expo/vector-icons|@react-native-community/datetimepicker|@react-native-async-storage/async-storage|date-fns|react-native-svg|@gorhom/bottom-sheet|expo-router|expo-linking|expo-constants|expo-status-bar|expo-font|expo-haptics|expo-notifications|expo-secure-store|expo-local-authentication|expo-localization|expo-screen-orientation|expo-splash-screen|expo-updates|expo-asset|expo-image|expo-camera|expo-document-picker|@sentry/react-native|posthog-react-native)/)',
  ],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/stores/(.*)$': '<rootDir>/src/stores/$1',
    '^@/constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/db/(.*)$': '<rootDir>/src/db/$1',
    '^@/locales/(.*)$': '<rootDir>/src/locales/$1',
    '^@/types$': '<rootDir>/src/types/index.ts',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/assets/(.*)$': '<rootDir>/assets/$1',
    '^@/app/(.*)$': '<rootDir>/app/$1',
    '\\.(jpg|jpeg|png|gif|webp|svg|ttf|otf|woff|woff2)$': '<rootDir>/src/__mocks__/assetMock.ts',
    '\\.(mp3|wav|ogg|mp4)$': '<rootDir>/src/__mocks__/assetMock.ts',
  },

  setupFilesAfterSetup: [
    '@testing-library/jest-native/extend-expect',
  ],

  setupFiles: [
    './jest.setup.ts',
  ],

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/**/index.{ts,tsx}',
    '!src/mocks/**',
    '!src/types/**',
    '!src/navigation/**',
  ],

  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    './src/services/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/utils/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },

  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'lcov', 'clover', 'json'],

  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  verbose: true,
  bail: false,
  forceExit: true,
  detectOpenHandles: true,

  maxWorkers: '50%',
  cacheDirectory: '.jest-cache',
};
