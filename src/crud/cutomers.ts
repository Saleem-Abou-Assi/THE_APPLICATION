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

// Get detailed customer information including bills, items, and payments
export const getCustomerDetails = async (customerId: number) => {
  try {
    // Get customer basic info
    const customer = await db.getFirstAsync('SELECT * FROM customers WHERE id = ?', customerId);
    
    // Get all bills for the customer
    const bills = await db.getAllAsync('SELECT * FROM bill_in WHERE customer_id = ?', customerId);
    
    // Get items for each bill
    interface Bill_in {
      id: 'int',
      total_cost: 'double',
      pay: 'double',
      old_balance: 'double',
      new_balance: 'double',
      // Add other bill properties here
    }

    const billsWithItems = await Promise.all((bills as Bill_in[]).map(async (bill: Bill_in) => {
      const items = await db.getAllAsync('SELECT * FROM item_bill_in WHERE bill_id = ?', bill.id);
      return { ...bill, items };
    }));
    
    // Get all payments made by the customer
    const payments = await db.getAllAsync('SELECT * FROM income WHERE customer_id = ?', customerId);
    
    return {
      customer,
      bills: billsWithItems,
      payments
    };
  } catch (error) {
    console.error('Error fetching customer details:', error);
    throw error;
  }
};

