import * as SQLite from 'expo-sqlite';

// Function to initialize the bill
export const initBill = async () => {
    const db = SQLite.openDatabaseSync('DataBase.sqlite'); // Open the database

    try {
        // Fetch customer data
        const customersResult = await db.getAllAsync('SELECT * FROM customers');
        const customers = customersResult ?? [];
        
        // Fetch item data
        const itemsResult = await db.getAllAsync('SELECT * FROM items');
        const items = itemsResult ?? [];

        // Return the data to the front end
        return {
            customers,
            items,
        };
    } catch (error) {
        console.error('Error initializing bill:', error);
        throw error; // Rethrow the error for further handling
    }
};

//recieve data 
export const createBill = async (billData: {
    bill_in_id: number,
    customer_id: number,
    items_array: any[],
    pay: number,
    total_cost: number,
    old_balance: number,
    new_balance: number
}) => {
    const db = SQLite.openDatabaseSync('DataBase.sqlite');

    try {
        // Insert bill header
        await db.runAsync(
            'INSERT INTO bills_in (customer_id, total_cost, pay, old_balance, new_balance) VALUES (?, ?, ?, ?, ?)',
            [billData.customer_id, billData.total_cost, billData.pay, billData.old_balance, billData.new_balance]
        );

        // Insert bill items
        for (const item of billData.items_array) {
            await db.runAsync(
                'INSERT INTO item_bill_in (item_id, bill_in_id, price, quantity, note) VALUES (?, ?, ?, ?, ?)',
                [ item.id, billData.bill_in_id,item.price, item.quantity, item.note]
            );
        }

        // Insert payments
       
        await db.runAsync(
            'INSERT INTO income ( amount, customer_id, bill_in_id, note) VALUES (?, ?, ?)',
            [billData.pay, billData.customer_id, billData.bill_in_id, " "]
            );
        }
        catch (error) {
            console.error('Error creating bill:', error);
            throw error;

     
    }
    return { success: true }; 
    }

