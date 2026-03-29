/**
 * Tests for database-service.ts
 * Location: src/modules/profile/services/__tests__/database-service.test.ts
 *
 * Run: npx jest database-service.test.ts
 */

import { DatabaseService } from '../database-service';
import { ProfileData } from '../user-service';

// ── Mock react-native-sqlite-storage ─────────────────────────────────────────

const mockExecuteSql = jest.fn();
const mockDb = { executeSql: mockExecuteSql };

jest.mock('react-native-sqlite-storage', () => ({
    __esModule: true,
    default: {
        enablePromise: jest.fn(),
        openDatabase:  jest.fn(() => Promise.resolve(mockDb)),
    },
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

const mockProfile: ProfileData = {
    id:        1,
    username:  'duynguyen',
    email:     'duy001@gmail.com',
    firstName: 'Duy',
    lastName:  'Nguyen',
    age:       18,
    role:      'admin',
};

// ── saveProfile() ─────────────────────────────────────────────────────────────

describe('DatabaseService.saveProfile()', () => {

    beforeEach(() => jest.clearAllMocks());

    it('executes INSERT OR REPLACE with correct values', async () => {
        // First call is CREATE TABLE (init), second is INSERT
        mockExecuteSql.mockResolvedValue([{ rows: { length: 0 } }]);

        await DatabaseService.saveProfile(mockProfile);

        const [sql, params] = mockExecuteSql.mock.calls.find(
            ([q]: [string]) => q.includes('INSERT OR REPLACE'),
        );

        expect(sql).toContain('INSERT OR REPLACE INTO profile');
        expect(params).toEqual([
            mockProfile.id,
            mockProfile.username,
            mockProfile.email,
            mockProfile.firstName,
            mockProfile.lastName,
            mockProfile.age,
            mockProfile.role,
        ]);
    });
});

// ── getProfile() ──────────────────────────────────────────────────────────────

describe('DatabaseService.getProfile()', () => {

    beforeEach(() => jest.clearAllMocks());

    it('returns profile when a row exists in SQLite', async () => {
        mockExecuteSql.mockResolvedValue([{
            rows: {
                length: 1,
                item:   () => ({ ...mockProfile }),
            },
        }]);

        const result = await DatabaseService.getProfile();

        expect(result).toEqual(mockProfile);
    });

    it('returns null when table is empty', async () => {
        mockExecuteSql.mockResolvedValue([{
            rows: { length: 0, item: jest.fn() },
        }]);

        const result = await DatabaseService.getProfile();

        expect(result).toBeNull();
    });
});

// ── clearProfile() ────────────────────────────────────────────────────────────

describe('DatabaseService.clearProfile()', () => {

    beforeEach(() => jest.clearAllMocks());

    it('executes DELETE FROM profile', async () => {
        mockExecuteSql.mockResolvedValue([{ rows: { length: 0 } }]);

        await DatabaseService.clearProfile();

        const deleteCalled = mockExecuteSql.mock.calls.some(
            ([sql]: [string]) => sql.trim().startsWith('DELETE FROM profile'),
        );

        expect(deleteCalled).toBe(true);
    });
});