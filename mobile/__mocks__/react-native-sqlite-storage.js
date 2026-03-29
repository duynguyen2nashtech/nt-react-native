const mockExecuteSql = jest.fn(() =>
    Promise.resolve([{ rows: { length: 0, item: jest.fn() } }])
);

const mockDb = { executeSql: mockExecuteSql };

module.exports = {
    enablePromise: jest.fn(),
    openDatabase:  jest.fn(() => Promise.resolve(mockDb)),
    default: {
        enablePromise: jest.fn(),
        openDatabase:  jest.fn(() => Promise.resolve(mockDb)),
    },
};