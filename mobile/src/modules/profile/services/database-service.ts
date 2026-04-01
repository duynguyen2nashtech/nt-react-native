import SQLite from 'react-native-sqlite-storage';
import { ProfileData } from './user-service';

// Use promise-based API
SQLite.enablePromise(true);

let db: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
    if (db) return db;

    db = await SQLite.openDatabase({
        name: 'app.db',
        location: 'default',
    });

    await db.executeSql(`
        CREATE TABLE IF NOT EXISTS profile (
            id        INTEGER PRIMARY KEY,
            username  TEXT NOT NULL,
            email     TEXT NOT NULL,
            firstName TEXT NOT NULL,
            lastName  TEXT NOT NULL,
            age       INTEGER NOT NULL,
            role      TEXT NOT NULL
        );
    `);

    console.log('[DB] Initialized');
    return db;
}

export const DatabaseService = {

    async saveProfile(profile: ProfileData): Promise<void> {
        const database = await getDb();
        await database.executeSql(
            `INSERT OR REPLACE INTO profile
                (id, username, email, firstName, lastName, age, role)
             VALUES (?, ?, ?, ?, ?, ?, ?);`,
            [
                profile.id,
                profile.username,
                profile.email,
                profile.firstName,
                profile.lastName,
                profile.age,
                profile.role,
            ],
        );
        console.log('[DB] Profile saved:', profile.username);
    },

    async getProfile(userId: number): Promise<ProfileData | null> {
        const database = await getDb();
        const [result] = await database.executeSql(
            'SELECT * FROM profile WHERE id = ? LIMIT 1;',
            [userId],
        );

        if (result.rows.length === 0) {
            console.log('[DB] No local profile found for userId:', userId);
            return null;
        }

        const row = result.rows.item(0);
        console.log('[DB] Profile loaded:', row.username);

        return {
            id:        row.id,
            username:  row.username,
            email:     row.email,
            firstName: row.firstName,
            lastName:  row.lastName,
            age:       row.age,
            role:      row.role,
        };
    },

    async clearProfile(userId: number): Promise<void> {
        const database = await getDb();
        await database.executeSql(
            'DELETE FROM profile WHERE id = ?;',
            [userId],
        );
        console.log('[DB] Profile cleared for userId:', userId);
    },

    async clearAllProfiles(): Promise<void> {
        const database = await getDb();
        await database.executeSql('DELETE FROM profile;');
        console.log('[DB] All profiles cleared');
    },
};