// __mocks__/react-native-encrypted-storage.js
// Mock for react-native-encrypted-storage native module
// Place at: mobile/__mocks__/react-native-encrypted-storage.js

const store = {};

export default {
    setItem:    jest.fn((key, value) => Promise.resolve(store[key] = value)),
    getItem:    jest.fn((key) => Promise.resolve(store[key] ?? null)),
    removeItem: jest.fn((key) => Promise.resolve(delete store[key])),
    clear:      jest.fn(() => Promise.resolve(Object.keys(store).forEach(k => delete store[k]))),
};