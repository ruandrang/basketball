import fs from 'fs/promises';
import path from 'path';
import { Club } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const CLUBS_FILE = path.join(DATA_DIR, 'clubs.json');
const LEGACY_MEMBERS_FILE = path.join(DATA_DIR, 'members.json');
const LEGACY_HISTORY_FILE = path.join(DATA_DIR, 'history.json');

// Ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

export async function getClubs(): Promise<Club[]> {
    await ensureDataDir();
    try {
        const data = await fs.readFile(CLUBS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if ((error as any).code === 'ENOENT') {
            // Migration: If no clubs.json, assign existing data to a default club
            return await migrateLegacyData();
        }
        return [];
    }
}

async function migrateLegacyData(): Promise<Club[]> {
    const defaultClub: Club = {
        id: 'default',
        name: 'My Basketball Club',
        members: [],
        history: []
    };

    try {
        const memData = await fs.readFile(LEGACY_MEMBERS_FILE, 'utf-8');
        defaultClub.members = JSON.parse(memData);
    } catch { }

    try {
        const histData = await fs.readFile(LEGACY_HISTORY_FILE, 'utf-8');
        defaultClub.history = JSON.parse(histData);
    } catch { }

    // Save to new format
    await saveClubs([defaultClub]);
    // Optional: remove legacy files
    return [defaultClub];
}

export async function saveClubs(clubs: Club[]): Promise<void> {
    await ensureDataDir();
    await fs.writeFile(CLUBS_FILE, JSON.stringify(clubs, null, 2));
}

export async function getClub(id: string): Promise<Club | undefined> {
    const clubs = await getClubs();
    return clubs.find(c => c.id === id);
}

export async function updateClub(updatedClub: Club): Promise<void> {
    const clubs = await getClubs();
    const index = clubs.findIndex(c => c.id === updatedClub.id);
    if (index !== -1) {
        clubs[index] = updatedClub;
        await saveClubs(clubs);
    } else {
        clubs.push(updatedClub);
        await saveClubs(clubs);
    }
}
