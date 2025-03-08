import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';
import * as XLSX from 'xlsx';
import * as DocumentPicker from 'expo-document-picker';


// Function to export data to Excel
const exportDataToExcel = async () => {
  console.log("exportDataToExcel called");
  
  try {
    const db = await SQLite.openDatabaseAsync('DataBase.sqlite');
    const tableNames = ['items', 'customers', 'traders', 'bills_in', 'bills_out', 'payment', 'income', 'item_bill_in', 'item_bill_out'];
    const workbook = XLSX.utils.book_new();

    for (const tableName of tableNames) {
      try {
        // Fetch all rows from the table
        const allRows = await db.getAllAsync(`SELECT * FROM ${tableName}`);
        if (allRows.length > 0) {
          const worksheet = XLSX.utils.json_to_sheet(allRows);
          XLSX.utils.book_append_sheet(workbook, worksheet, tableName);
        }
      } catch (error) {
        console.error(`Error fetching data from table ${tableName}:`, error);
      }
    }

    // Write to file
    const xlsx = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
    
    // Save file in cache directory
    const fileUri = FileSystem.cacheDirectory + 'DatabaseExport.xlsx';
    
    await FileSystem.writeAsStringAsync(fileUri, xlsx, {
      encoding: FileSystem.EncodingType.Base64
    });

    console.log('Exported data to DatabaseExport.xlsx');
    console.log('File saved at:', fileUri);

    // Share the file to allow saving to Downloads
    await shareAsync(fileUri, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Export Database',
      UTI: 'com.microsoft.excel.xlsx'
    });

    return fileUri;

  } catch (error) {
    console.error('Detailed Export Error:', error);
    throw error;
  }
};


// Function to restore database from Excel
export const restoreDatabaseFromExcel = async () => {
  try {
    // Pick an Excel file
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    if (result.canceled === false) {
      const fileUri = result.assets[0].uri;
      const db = await SQLite.openDatabaseAsync('DataBase.sqlite');

      // Read the Excel file
      const fileContent = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
      const workbook = XLSX.read(fileContent, { type: 'base64' });

      // List of tables to restore (match the tables in your database migration)
      const tableNames = ['items', 'customers', 'traders', 'bills_in', 'bills_out', 'payment', 'income', 'item_bill_in', 'item_bill_out'];

      // Begin a transaction for safety
      await db.execAsync('BEGIN TRANSACTION');

      // Clear existing tables before restoring
      for (const tableName of tableNames) {
        await db.runAsync(`DELETE FROM ${tableName}`);
      }

      // Restore data for each table
      for (const tableName of tableNames) {
        const worksheet = workbook.Sheets[tableName];
        if (worksheet) {
          const data = XLSX.utils.sheet_to_json(worksheet);

          for (const row of data) {
            // Dynamically generate INSERT query based on row keys
            const columns = Object.keys(row as object);
            const placeholders = columns.map(() => '?').join(',');
            const values = columns.map(col => (row as any)[col]);

            await db.runAsync(
              `INSERT INTO ${tableName} (${columns.join(',')}) VALUES (${placeholders})`,
              values
            );
          }
        }
      }

      // Commit transaction
      await db.execAsync('COMMIT');

      console.log('Database restored successfully');
      return true;
    }
  } catch (error) {
    console.error('Error restoring database:', error);
    // Rollback in case of error
    const db = await SQLite.openDatabaseAsync('DataBase.sqlite');
    await db.execAsync('ROLLBACK');
    return false;
  }
};

export { exportDataToExcel };