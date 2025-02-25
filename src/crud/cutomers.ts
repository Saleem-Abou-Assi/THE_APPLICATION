import Items from '@/app/item';
import * as SQLite from 'expo-sqlite';

// Open or create a SQLite database
const db = SQLite.openDatabaseSync('DataBase.sqlite');

// export const createTable = async ()=> {
//   const result = await db.runAsync('CREATE TABLE customers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, line TEXT, balance REAL);')
//   console.log(result);
// } 

interface BillItem {
  item_id: number;
  quantity: number;
  price: number;
}

// Create a new customer record
export const createRecord = async (name: string, line: string, balance: number) => {
  const result = await db.runAsync('INSERT INTO customers (name, line, balance) VALUES (?, ?, ?)', name, line, balance);
  console.log(result.lastInsertRowId, result.changes);
  
};

// Read all customer records
export const getRecords = async (callback: (records: any[]) => void) => {
  const records = await db.getAllAsync('SELECT * FROM customers');
  callback(records);
};

// Update an existing customer record
export const updateRecord = async (id: number, name: string, line: string, balance: number) => {
  const result = await db.runAsync('UPDATE customers SET name = ?, line = ?, balance = ? WHERE id = ?', name, line, balance, id);
  // console.log("Record updated successfully:", result);
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
    const bills = await db.getAllAsync('SELECT * FROM bills_in WHERE customer_id = ?', customerId);
    
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
      // Get all item_bill_in records for this bill
      const itemBillRecords = await db.getAllAsync('SELECT * FROM item_bill_in WHERE bill_in_id = ?', bill.id);
      
      // Get item details for each item in item_bill_in
      const itemDetails = await Promise.all(itemBillRecords.map(async (itemBill: any) => {
        const itemInfo = await db.getFirstAsync('SELECT * FROM items WHERE id = ?', itemBill.item_id);
        return {
          ...(itemBill || {}),  // Fallback to empty object if undefined
          ...(itemInfo || {})   // Fallback to empty object if undefined
        };
      }));
      
      return { ...bill, items: itemDetails };
    }));

    console.log(billsWithItems);
    // Get all payments made by the customer
    const payments = await db.getAllAsync('SELECT * FROM income WHERE customer_id = ?', customerId);


    return {
      customer,
      bills: billsWithItems,
      payments,
      
      totalBills: billsWithItems.length,
      totalPayments: payments.length
    };
  } catch (error) {
    console.error('Error fetching customer details:', error);
    throw error;
  }
};

