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

export const getTraderDetails = async (traderId: number) => {
  const db = SQLite.openDatabaseSync('DataBase.sqlite');
  
  try {
    // Get trader info
    const trader = await db.getFirstAsync('SELECT * FROM traders WHERE id = ?', [traderId]);
    
    // Get trader's bills
    const bills = await db.getAllAsync(`
      SELECT bo.*, 
        (SELECT json_group_array(json_object(
          'item_id', ibo.item_id,
          'name', i.name,
          'price', ibo.price,
          'quantity', ibo.quantity
        )) 
        FROM item_bill_out ibo
        JOIN items i ON ibo.item_id = i.id
        WHERE ibo.bill_out_id = bo.id) as items
      FROM bills_out bo
      WHERE bo.trader_id = ?
    `, [traderId]);

    // Get trader's payments
    const payments = await db.getAllAsync('SELECT * FROM payment WHERE trader_id = ?', [traderId]);

    return {
      trader,
      bills: bills.map((bill: any) => ({
        ...bill,
        items: JSON.parse(bill.items)
      })),
      payments
    };
  } catch (error) {
    console.error('Error fetching trader details:', error);
    throw error;
  }
};
