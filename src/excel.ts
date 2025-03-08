import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';
import * as XLSX from 'xlsx';

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
    console.error('Failed to export data:', error);
    throw error;
  }
};

export { exportDataToExcel };