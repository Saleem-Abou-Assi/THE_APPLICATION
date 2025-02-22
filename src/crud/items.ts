import * as SQLite from 'expo-sqlite';

// Open or create a SQLite database
const db = SQLite.openDatabaseSync('DataBase.sqlite');

// Create a new item record
export const createRecord = async (name: string, line: string, balance: number) => {
    const result = await db.runAsync('INSERT INTO items (name, line, balance) VALUES (?, ?, ?)', name, line, balance);
    console.log(result.lastInsertRowId, result.changes);
};

// Read all item records
export const getRecords = async (callback: (items: any[]) => void) => {
    const records = await db.getAllAsync('SELECT * FROM items');
    console.log("Records retrieved successfully: ", records);
    callback(records);
};

// Update an existing item record
export const updateRecord = async (id: number, name: string, line: string, balance: number) => {
    const result = await db.runAsync('UPDATE items SET name = ?, line = ?, balance = ? WHERE id = ?', name, line, balance, id);
    console.log("Record updated successfully:", result);
};

// Delete an item record
export const deleteRecord = async (id: number) => {
    const result = await db.runAsync('DELETE FROM items WHERE id = ?', id);
    console.log("Record deleted successfully:", result);
};