import * as SQLite from 'expo-sqlite';
import ExcelJS from 'exceljs';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';

// Function to export data to Excel
const exportDataToExcel = async () => {
  console.log("exportDataToExcel called");
  
  try {
    const db = await SQLite.openDatabaseAsync('DataBase.sqlite');
    const workbook = new ExcelJS.Workbook();
    const tableNames = ['items', 'customers', 'traders', 'bills_in', 'bills_out', 'payment', 'income', 'item_bill_in', 'item_bill_out'];

    for (const tableName of tableNames) {
      console.log(`Processing table: ${tableName}`);
      
      const allRows = await db.getAllAsync(`SELECT * FROM ${tableName}`);
      console.log(`Rows in ${tableName}: ${allRows.length}`);
      
      if (allRows.length > 0) {
        const worksheet = workbook.addWorksheet(tableName);
        
        const firstRow = allRows[0];
        const columnKeys = Object.keys(firstRow || {});
        
        console.log(`Columns for ${tableName}: ${columnKeys.join(', ')}`);

        worksheet.columns = columnKeys.map(key => ({
          header: key.toUpperCase(),
          key: key,
          width: 20
        }));

        // Limit rows to prevent potential overflow
        const rowsToAdd = allRows.slice(0, 1000);
        worksheet.addRows(rowsToAdd);
      }
    }

    const xlsx = await workbook.xlsx.writeBuffer();
    const fileUri = `${FileSystem.documentDirectory}DatabaseExport.xlsx`;
    
    await FileSystem.writeAsStringAsync(fileUri, Buffer.from(xlsx).toString('base64'), {
      encoding: FileSystem.EncodingType.Base64
    });

    await shareAsync(fileUri, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Export Database'
    });

    console.log('Exported data to DatabaseExport.xlsx');
  } catch (error) {
    console.error('Detailed Export Error:', error);
    throw error;
  }
};

export { exportDataToExcel };