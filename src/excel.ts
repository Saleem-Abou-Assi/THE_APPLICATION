import * as SQLite from 'expo-sqlite';
import ExcelJS from 'exceljs';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';
import { Buffer } from 'buffer';

// Function to export data to Excel
const exportDataToExcel = async () => {
  console.log("exportDataToExcel called");
  
  try {
    const db = await SQLite.openDatabaseAsync('DataBase.sqlite');
    const workbook = new ExcelJS.Workbook();
    const tableNames = ['items', 'customers', 'traders', 'bills_in', 'bills_out', 'payment', 'income', 'item_bill_in', 'item_bill_out'];

    for (const tableName of tableNames) {
      try {
        // Fetch all rows from the table
        const allRows = await db.getAllAsync(`SELECT * FROM ${tableName}`);
        const worksheet = workbook.addWorksheet(tableName);

        // Set columns based on keys of the first row (assuming all rows have the same structure)
        if (allRows.length > 0) {
          worksheet.columns = Object.keys(allRows[0] as object).map(key => ({
            header: key.toUpperCase(),
            key: key,
            width: 20
          }));

          // Add rows to the worksheet
          allRows.forEach(row => {
            worksheet.addRow(row);
          });
        }
      } catch (error) {
        console.error(`Error fetching data from table ${tableName}:`, error);
      }
    }

    // Write to file
    const xlsx = await workbook.xlsx.writeBuffer();
    const fileUri = FileSystem.documentDirectory + 'DatabaseExport.xlsx';
    
    await FileSystem.writeAsStringAsync(fileUri, Buffer.from(xlsx).toString('base64'), {
      encoding: FileSystem.EncodingType.Base64
    });

    // Share the file
    await shareAsync(fileUri, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Export Database'
    });

    console.log('Exported data to DatabaseExport.xlsx');
  } catch (error) {
    console.error('Failed to export data:', error);
    throw error;
  }
};

export { exportDataToExcel };