import { DatabaseService } from '../database-service';
import { ProfileData } from '../userService';

// ── Mock react-native-sqlite-storage ──────────────────────────────────────────

const mockExecuteSql = jest.fn();
const mockDb         = { executeSql: mockExecuteSql };

jest.mock('react-native-sqlite-storage', () => ({
    __esModule: true,
    default: {
        enablePromise: jest.fn(),
        openDatabase:  jest.fn(() => Promise.resolve(mockDb)),
    },
}));

const mockProfile: ProfileData = {
    id:        1,
    username:  'duynguyen',
    email:     'duy001@gmail.com',
    firstName: 'Duy',
    lastName:  'Nguyen',
    age:       18,
    role:      'admin',
};

const mockUserId = 1; 


describe('DatabaseService.saveProfile()', () => {

    beforeEach(() => jest.clearAllMocks());

    it('executes INSERT OR REPLACE with correct values', async () => {
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

    it('calls executeSql exactly once for INSERT', async () => {
        mockExecuteSql.mockResolvedValue([{ rows: { length: 0 } }]);

        await DatabaseService.saveProfile(mockProfile);

        const insertCalls = mockExecuteSql.mock.calls.filter(
            ([sql]: [string]) => sql.includes('INSERT OR REPLACE'),
        );
        expect(insertCalls).toHaveLength(1);
    });
});

describe('DatabaseService.getProfile()', () => {

    beforeEach(() => jest.clearAllMocks());

    it('returns profile when a row exists in SQLite', async () => {
        mockExecuteSql.mockResolvedValue([{
            rows: {
                length: 1,
                item:   () => ({ ...mockProfile }),
            },
        }]);

        const result = await DatabaseService.getProfile(mockUserId);

        expect(result).toEqual(mockProfile);
    });

    it('returns null when table is empty', async () => {
        mockExecuteSql.mockResolvedValue([{
            rows: { length: 0, item: jest.fn() },
        }]);


        const result = await DatabaseService.getProfile(mockUserId);

        expect(result).toBeNull();
    });


    it('queries with correct userId in WHERE clause', async () => {
        mockExecuteSql.mockResolvedValue([{
            rows: { length: 0, item: jest.fn() },
        }]);

        await DatabaseService.getProfile(mockUserId);

        const [sql, params] = mockExecuteSql.mock.calls.find(
            ([q]: [string]) => q.includes('SELECT'),
        );

        expect(sql).toContain('WHERE id = ?');
        expect(params).toEqual([mockUserId]); 
    });

    it('uses LIMIT 1 in query', async () => {
        mockExecuteSql.mockResolvedValue([{
            rows: { length: 0, item: jest.fn() },
        }]);

        await DatabaseService.getProfile(mockUserId);

        const [sql] = mockExecuteSql.mock.calls.find(
            ([q]: [string]) => q.includes('SELECT'),
        );

        expect(sql).toContain('LIMIT 1');
    });

    it('maps all fields correctly from row', async () => {
        mockExecuteSql.mockResolvedValue([{
            rows: {
                length: 1,
                item:   () => ({ ...mockProfile }),
            },
        }]);

        const result = await DatabaseService.getProfile(mockUserId);

        expect(result?.id).toBe(mockProfile.id);
        expect(result?.username).toBe(mockProfile.username);
        expect(result?.email).toBe(mockProfile.email);
        expect(result?.firstName).toBe(mockProfile.firstName);
        expect(result?.lastName).toBe(mockProfile.lastName);
        expect(result?.age).toBe(mockProfile.age);
        expect(result?.role).toBe(mockProfile.role);
    });
});

// ── clearProfile() ────────────────────────────────────────────────────────────

describe('DatabaseService.clearProfile()', () => {

    beforeEach(() => jest.clearAllMocks());

    it('executes DELETE FROM profile WHERE id = ?', async () => {
        mockExecuteSql.mockResolvedValue([{ rows: { length: 0 } }]);

        await DatabaseService.clearProfile(mockUserId);

        const deleteCalled = mockExecuteSql.mock.calls.some(
            ([sql]: [string]) => sql.trim().startsWith('DELETE FROM profile'),
        );

        expect(deleteCalled).toBe(true);
    });

    it('deletes only the correct user by id', async () => {
        mockExecuteSql.mockResolvedValue([{ rows: { length: 0 } }]);

        await DatabaseService.clearProfile(mockUserId);

        const [sql, params] = mockExecuteSql.mock.calls.find(
            ([q]: [string]) => q.includes('DELETE'),
        );

        expect(sql).toContain('WHERE id = ?');
        expect(params).toEqual([mockUserId]); 
    });
});


describe('DatabaseService.clearAllProfiles()', () => {

    beforeEach(() => jest.clearAllMocks());

  
    it('executes DELETE FROM profile without WHERE', async () => {
        mockExecuteSql.mockResolvedValue([{ rows: { length: 0 } }]);

        await DatabaseService.clearAllProfiles();

        const [sql] = mockExecuteSql.mock.calls.find(
            ([q]: [string]) => q.includes('DELETE'),
        );

        expect(sql).toContain('DELETE FROM profile');
        expect(sql).not.toContain('WHERE'); 
    });

    it('calls executeSql exactly once for DELETE', async () => {
        mockExecuteSql.mockResolvedValue([{ rows: { length: 0 } }]);

        await DatabaseService.clearAllProfiles();

        const deleteCalls = mockExecuteSql.mock.calls.filter(
            ([sql]: [string]) => sql.includes('DELETE'),
        );
        expect(deleteCalls).toHaveLength(1);
    });
});