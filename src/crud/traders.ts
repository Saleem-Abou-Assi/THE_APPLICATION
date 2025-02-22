import * as SQLite from 'expo-sqlite';
import Traders from '../entity/Traders'; // Adjust the import path as necessary

// Open or create a SQLite database
const db = SQLite.openDatabaseSync('DataBase.sqlite');

export const createTable =  async () => {
    // Create the Traders table
    const result = await db.runAsync('CREATE TABLE IF NOT EXISTS Traders ( id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, name TEXT NOT NULL, balance REAL NOT NULL, created_at DATETIME NOT NULL DEFAULT (datetime(\'now\')), updated_at DATETIME NOT NULL DEFAULT (datetime(\'now\')));');
    };

// Create a new trader record
export const createRecord = async (name: string, balance: number) => {
    const oo = createTable();
    const result = await db.runAsync('INSERT INTO Traders (name, balance) VALUES (?, ?)', name, balance);
  console.log(result.lastInsertRowId, result.changes);
};

// Read all trader records
export const getRecords = async (callback: (records: Traders[]) => void) => {
  const records = await db.getAllAsync('SELECT * FROM Traders') as Traders[];
  console.log("Records retrieved successfully:", records);
  callback(records);
};

// Update an existing trader record
export const updateRecord = async (id: number, name: string, balance: number) => {
  const result = await db.runAsync('UPDATE Traders SET name = ?, balance = ? WHERE id = ?', name, balance, id);
  console.log("Record updated successfully:", result);
};

// Delete a trader record
export const deleteRecord = async (id: number) => {
  const result = await db.runAsync('DELETE FROM Traders WHERE id = ?', id);
  console.log("Record deleted successfully:", result);
};
