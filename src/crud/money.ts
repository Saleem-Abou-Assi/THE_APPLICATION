import * as SQLite from 'expo-sqlite';

// Open or create a SQLite database
const db = SQLite.openDatabaseSync('DataBase.sqlite');

// Income CRUD operations
export const createIncome = async(amount:number, customer_id:number|null, note:string) => {
    const result = await db.runAsync(
        'INSERT INTO income (amount, customer_id, note) VALUES (?, ?, ?)', 
        amount, customer_id, note
    );
    return result;
}

export const getIncome = async (callback: (incomes: any[]) => void) => {
    const income = await db.getAllAsync('SELECT * FROM income');
    callback(income);
};

// Payment CRUD operations
export const createPayment = async(amount:number, trader_id:number|null, note:string) => {
    const result = await db.runAsync(
        'INSERT INTO payment (amount, trader_id, note) VALUES (?, ?, ?)', 
        amount, trader_id, note
    );
    return result;
}

export const getPayments = async (callback: (payments: any[]) => void) => {
    const payments = await db.getAllAsync('SELECT * FROM payment');
    callback(payments);
};
    