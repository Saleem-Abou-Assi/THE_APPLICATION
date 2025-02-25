import * as SQLite from 'expo-sqlite';  

// Open or create a SQLite database  


// Function to run the migration  
export const runMigrations = async () => {
    const db = await SQLite.openDatabaseAsync('DataBase.sqlite');  
  
  try {  
    await db.execAsync(`  
      PRAGMA journal_mode = WAL;  

      

      CREATE TABLE IF NOT EXISTS items (  
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,  
        name TEXT NOT NULL,  
        b_price REAL NOT NULL,  
        s_price REAL NOT NULL,  
        quantity INTEGER NOT NULL,  
        created_at DATETIME NOT NULL DEFAULT (datetime('now')),  
        updated_at DATETIME NOT NULL DEFAULT (datetime('now'))  
      );  

      CREATE TABLE IF NOT EXISTS customers (  
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,  
        name TEXT NOT NULL,  
        line TEXT NOT NULL,  
        balance REAL NOT NULL,  
        created_at DATETIME NOT NULL DEFAULT (datetime('now')),  
        updated_at DATETIME NOT NULL DEFAULT (datetime('now'))  
      );  

      CREATE TABLE IF NOT EXISTS traders (  
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,  
        name TEXT NOT NULL,  
        balance REAL NOT NULL,  
        created_at DATETIME NOT NULL DEFAULT (datetime('now')),  
        updated_at DATETIME NOT NULL DEFAULT (datetime('now'))  
      );  

      CREATE TABLE IF NOT EXISTS bills_in (  
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,  
        customer_id INTEGER,  
        total_cost REAL NOT NULL,  
        pay REAL NOT NULL,  
        old_balance REAL NOT NULL,  
        new_balance REAL NOT NULL,  
        created_at DATETIME NOT NULL DEFAULT (datetime('now')),  
        updated_at DATETIME NOT NULL DEFAULT (datetime('now')),  
        FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE ON UPDATE CASCADE  
      );  

      CREATE TABLE IF NOT EXISTS bills_out (  
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,  
        trader_id INTEGER,  
        total_cost REAL NOT NULL,  
        pay REAL NOT NULL,  
        old_balance REAL NOT NULL,  
        new_balance REAL NOT NULL,  
        created_at DATETIME NOT NULL DEFAULT (datetime('now')),  
        updated_at DATETIME NOT NULL DEFAULT (datetime('now')),  
        FOREIGN KEY (trader_id) REFERENCES traders (id) ON DELETE CASCADE ON UPDATE CASCADE  
      );  

      CREATE TABLE IF NOT EXISTS income (  
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,  
        amount REAL NOT NULL,  
        customer_id INTEGER,  
        bill_in_id INTEGER,  
        note TEXT ,  
        created_at DATETIME NOT NULL DEFAULT (datetime('now')),  
        updated_at DATETIME NOT NULL DEFAULT (datetime('now')),  
        FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE ON UPDATE CASCADE,  
        FOREIGN KEY (bill_in_id) REFERENCES bills_in (id) ON DELETE CASCADE ON UPDATE CASCADE  
      );  

      CREATE TABLE IF NOT EXISTS payment (  
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,  
        amount REAL NOT NULL,  
        trader_id INTEGER,  
        bill_out_id INTEGER,  
        note TEXT ,  
        created_at DATETIME NOT NULL DEFAULT (datetime('now')),  
        updated_at DATETIME NOT NULL DEFAULT (datetime('now')),  
        FOREIGN KEY (trader_id) REFERENCES traders (id) ON DELETE CASCADE ON UPDATE CASCADE,  
        FOREIGN KEY (bill_out_id) REFERENCES bills_out (id) ON DELETE CASCADE ON UPDATE CASCADE  
      );  

      CREATE TABLE IF NOT EXISTS item_bill_in (  
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,  
        item_id INTEGER,  
        bill_in_id INTEGER,  
        price REAL NOT NULL,
        quantity INTEGER NOT NULL,  
        note TEXT ,  
        created_at DATETIME NOT NULL DEFAULT (datetime('now')),  
        updated_at DATETIME NOT NULL DEFAULT (datetime('now')),  
        FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE ON UPDATE CASCADE,  
        FOREIGN KEY (bill_in_id) REFERENCES bills_in (id) ON DELETE CASCADE ON UPDATE CASCADE  
      );  

      CREATE TABLE IF NOT EXISTS item_bill_out (  
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,  
        item_id INTEGER,  
        bill_out_id INTEGER,  
        price REAL NOT NULL, 
        quantity INTEGER NOT NULL, 
        note TEXT ,  
        created_at DATETIME NOT NULL DEFAULT (datetime('now')),  
        updated_at DATETIME NOT NULL DEFAULT (datetime('now')),  
        FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE ON UPDATE CASCADE,  
        FOREIGN KEY (bill_out_id) REFERENCES bills_out (id) ON DELETE CASCADE ON UPDATE CASCADE  
      );  
    `);  

    console.log('Migration completed successfully');  
  } catch (error) {  
    console.error('Migration failed:', error);  
  }  
};