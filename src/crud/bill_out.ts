import * as SQLite from 'expo-sqlite';

// Function to initialize the bill
export const initBillOut = async () => {
    const db = SQLite.openDatabaseSync('DataBase.sqlite');

    try {
        // Fetch trader data
        const tradersResult = await db.getAllAsync('SELECT * FROM traders');
        const traders = tradersResult ?? [];
        
        // Fetch item data
        const itemsResult = await db.getAllAsync('SELECT * FROM items');
        const items = itemsResult ?? [];

        return {
            traders,
            items,
        };
    } catch (error) {
        console.error('Error initializing bill out:', error);
        throw error;
    }
};

// Receive data and create outgoing bill
export const createBillOut = async (billData: {
    bill_out_id: number,
    trader_id: number,
    items_array: any[],
    pay: number,
    total_cost: number,
    old_balance: number,
    new_balance: number
}) => {
    const db = SQLite.openDatabaseSync('DataBase.sqlite');

    try {
        // Start transaction
        await db.execAsync('BEGIN TRANSACTION');

        // Insert bill header
        const bill = await db.runAsync(
            'INSERT INTO bills_out (trader_id, total_cost, pay, old_balance, new_balance) VALUES (?, ?, ?, ?, ?)',
            [billData.trader_id, billData.total_cost, billData.pay, billData.old_balance, billData.new_balance]
        );

        // Insert bill items
        for (const item of billData.items_array) {
            // First check if item exists
            const existingItem = await db.getFirstAsync('SELECT id FROM items WHERE id = ?', [item.itemId]);
            
            if (!existingItem) {
                // If item doesn't exist, create it first
                await db.runAsync(
                    'INSERT INTO items (name, b_price, s_price, quantity) VALUES (?, ?, ?, ?)',
                    [item.name, item.b_price, item.s_price, 0]
                );
                // Get the newly created item's ID
                const newItem = await db.getFirstAsync('SELECT id FROM items WHERE name = ?', [item.name]);
                item.itemId = newItem.id;
            }

            await db.runAsync(
                'INSERT INTO item_bill_out (item_id, bill_out_id, price, quantity, note) VALUES (?, ?, ?, ?, ?)',
                [item.itemId, bill.lastInsertRowId, item.s_price, item.quantity, '']
            );

            // Update item quantity
            await db.runAsync(
                'UPDATE items SET quantity = quantity + ? WHERE id = ?',
                [item.quantity, item.itemId]
            );
        }

        // Insert payments
        await db.runAsync(
            'INSERT INTO payment (amount, trader_id, bill_out_id, note) VALUES (?, ?, ?, ?)',
            [billData.pay, billData.trader_id, bill.lastInsertRowId, " "]
        );

        // Update trader balance (corrected to ADD to balance)
        await db.runAsync(
            'UPDATE traders SET balance = balance + ? - ? WHERE id = ?',
            [billData.total_cost, billData.pay, billData.trader_id]
        );

        // Commit transaction
        await db.execAsync('COMMIT');
        
        return { success: true };
    } catch (error) {
        // Rollback on error
        await db.execAsync('ROLLBACK');
        console.error('Error creating bill out:', error);
        throw error;
    }
}

export const createItem = async (itemData: {
    name: string,
    b_price: number,
    s_price: number,
    quantity: number
}) => {
    const db = SQLite.openDatabaseSync('DataBase.sqlite');
    
    try {
        const result = await db.runAsync(
            'INSERT INTO items (name, b_price, s_price, quantity) VALUES (?, ?, ?, ?)',
            [itemData.name, itemData.b_price, itemData.s_price, itemData.quantity]
        );
        return { success: true, id: result.lastInsertRowId };
    } catch (error) {
        console.error('Error creating item:', error);
        throw error;
    }
};
