import * as SQLite from 'expo-sqlite';
import { useCallback, useState, useEffect } from 'react';

// Open or create a SQLite database
const db = SQLite.openDatabaseSync('DataBase.sqlite');

// Income CRUD operations


export const initMoney = async()=>{
    
    const customersResult = await db.getAllAsync('SELECT * FROM customers');
    const customers = customersResult ?? [];

    
    const traderResult = await db.getAllAsync('SELECT * FROM traders');
    const traders = traderResult ?? [];
    return {
        customers,
        traders
    }
}

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
    


interface Income {
    customer_id: number;
    amount: number;
    note:string;
}

interface Payment  {
    trader_id: number;
    amount: number;
    note:string;
}

export const subscribeToBox = (callback: (box: number) => void, interval = 5000) => {
    // Initial calculation
    calculateBox(callback);
    
    // Set up interval for real-time updates
    const intervalId = setInterval(() => {
        calculateBox(callback);
    }, interval);

    // Return cleanup function
    return () => clearInterval(intervalId);
};

const calculateBox = async (callback: (box: number) => void) => {
    try {
        const income = await db.getAllAsync('SELECT * FROM income') as Income[];
        const payments = await db.getAllAsync('SELECT * FROM payment') as Payment[];
        
        const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
        const totalPayments = payments.reduce((sum, item) => sum + item.amount, 0);
        const box = totalIncome - totalPayments;
        
        callback(box);
    } catch (error) {
        console.error('Error calculating box:', error);
    }
};

// Usage in component:
export const useBox = () => {
    const [box, setBox] = useState(0);

    useEffect(() => {
        const unsubscribe = subscribeToBox(setBox);
        return () => unsubscribe();
    }, []);

    return box;
};