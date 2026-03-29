// jest.config.js
module.exports = {
    preset: 'react-native',
    transformIgnorePatterns: [
        'node_modules/(?!(react-native|@react-native|@react-navigation|react-redux|@reduxjs/toolkit|immer|redux|redux-logger)/)',
    ],
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    collectCoverageFrom: [
      'src/**/*.{ts,tsx}',
      '!src/**/*.d.ts',
      '!src/**/index.ts',
      '!src/types/**',           // type-only files
      '!src/screens/demo/**',    // demo screens
      '!src/thunks/**',          // app-thunk boilerplate
      '!src/assets/**',          // translations
      '!src/**/Background.tsx',  // unused components
      '!src/**/Paragraph.tsx',
    ],
};