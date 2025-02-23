import * as SQLite from 'expo-sqlite';

// Open or create a SQLite database
const db = SQLite.openDatabaseSync('DataBase.sqlite');

// export const createTable =  async () => {
// const result = await db.runAsync('CREATE TABLE IF NOT EXISTS items ( id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, name TEXT NOT NULL, b_price REAL NOT NULL,s_price REAL NOT NULL,quantity INTEGER NOT NULL,created_at DATETIME NOT NULL DEFAULT (datetime(\'now\')),updated_at DATETIME NOT NULL DEFAULT (datetime(\'now\')));');
// };

// Create a new item record
export const createRecord = async (name: string, b_price: number, s_price: number, quantity: number) => {
  const result = await db.runAsync('INSERT INTO items (name, b_price, s_price, quantity) VALUES (?, ?, ?, ?)', name, b_price, s_price, quantity);
    console.log(result.lastInsertRowId, result.changes);
};

// Read all item records
export const getRecords = async (callback: (items: any[]) => void) => {
    
  const records = await db.getAllAsync('SELECT * FROM items');
    console.log("Records retrieved successfully: ", records);
    callback(records);
};

// Update an existing item record
export const updateRecord = async (id: number, name: string, b_price: number, s_price: number, quantity: number) => {
    const result = await db.runAsync('UPDATE items SET name = ?, b_price = ?, s_price = ?, quantity = ? WHERE id = ?', name, b_price, s_price, quantity, id);
    console.log("Record updated successfully:", result);
};

// Delete an item record
export const deleteRecord = async (id: number) => {
    const result = await db.runAsync('DELETE FROM items WHERE id = ?', id);
    console.log("Record deleted successfully:", result);
};