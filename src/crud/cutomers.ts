import * as SQLite from 'expo-sqlite';

// Open or create a SQLite database
const db = SQLite.openDatabaseSync('DataBase.sqlite');

// export const createTable = async ()=> {
//   const result = await db.runAsync('CREATE TABLE customers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, line TEXT, balance REAL);')
//   console.log(result);
// } 
// Create a new customer record
export const createRecord = async (name: string, line: string, balance: number) => {
  const result = await db.runAsync('INSERT INTO customers (name, line, balance) VALUES (?, ?, ?)', name, line, balance);
  console.log(result.lastInsertRowId, result.changes);
  console.log("oooooooooo");
};

// Read all customer records
export const getRecords = async (callback: (records: any[]) => void) => {
  const records = await db.getAllAsync('SELECT * FROM customers');
  console.log("Records retrieved successfully: Helllloooo", records);
  callback(records);
};

// Update an existing customer record
export const updateRecord = async (id: number, name: string, line: string, balance: number) => {
  const result = await db.runAsync('UPDATE customers SET name = ?, line = ?, balance = ? WHERE id = ?', name, line, balance, id);
  console.log("Record updated successfully:", result);
};

// Delete a customer record
export const deleteRecord = async (id: number) => {
  const result = await db.runAsync('DELETE FROM customers WHERE id = ?', id);
  console.log("Record deleted successfully:", result);
};